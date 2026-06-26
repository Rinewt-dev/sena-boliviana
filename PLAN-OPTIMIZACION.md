# PLAN-OPTIMIZACION.md — Mejoras con base en investigación

> Plan construido a partir de investigación web (3 frentes: traducción, voz, señas), con fuentes.
> Cada ítem dice: qué hacer, por qué, esfuerzo e impacto. Ordenado por retorno (ROI).
> NO rompe la regla de oro: el clasificador de señas sigue siendo propio y local.

---

## HALLAZGO TRANSVERSAL MÁS IMPORTANTE

**Dejá de perseguir la latencia "sub-segundo / palabra por palabra". No existe para quechua/aymara y no es el objetivo correcto.**

- Google Meet / Interpreter Mode operan **a propósito con 2-3 segundos de retraso** — es el "sweet spot": más rápido se vuelve ininteligible, más lento rompe la conversación. ([blog.google](https://blog.google/products/workspace/google-meet-langauge-translation-ai/), [9to5google](https://9to5google.com/2025/05/20/google-meet-speech-translation/))
- Tu DeepSeek a ~1.2s **ya está dentro del rango profesional**.
- La traducción automática a quechua es un **problema abierto de investigación**: NLLB-200 rinde ~33 chrF (insuficiente para producción; "bueno" es >50). ([arXiv 2306.09830](https://arxiv.org/html/2306.09830))

→ En el pitch, esto se declara como **fortaleza honesta**, no se esconde.

---

## FRENTE 1 — TRADUCCIÓN (voz → quechua/aymara)

### ⭐ 1.1 Caché de frases clínicas pre-traducidas (MÁXIMO ROI — hacelo primero)
- **Qué:** un JSON local con 50-150 frases de posta de salud ("¿Dónde le duele?", "¿Desde cuándo?", "Respire hondo", "Tome esto cada 8 horas"...) ya traducidas a quechua/aymara y **validadas con hablante nativo**. Si lo que dice el médico hace match (exacto o difuso), se responde desde memoria.
- **Por qué:** latencia **0 ms**, calidad **garantizada y validada**, funciona **offline**. Resuelve latencia Y calidad de un solo golpe. Además es un activo académico fuerte (criterio 5: propuesta académica) — "dataset clínico curado propio".
- **Esfuerzo:** medio (armar y validar las frases). **Impacto:** altísimo.

### 1.2 UI que disimula la latencia (ya implementado, mantener)
- El castellano aparece al instante; la traducción llega debajo en streaming. Latencia percibida casi nula sin tocar el motor.

### 1.3 Mantener DeepSeek streaming como motor para lo que NO está en caché
- 1.2s al primer token = rango profesional. No buscar reemplazarlo por velocidad.

### 1.4 (Opcional, decisión de producto) Google Cloud Translation v3
- Único motor con quechua+aymara y latencia ~100-300ms, 500k chars/mes gratis. **Pero requiere tarjeta y es API externa** (rompe regla del CLAUDE.md). Solo si se acepta esa concesión. ([cloud.google.com/translate/pricing](https://cloud.google.com/translate/pricing))

### ❌ Descartado (con razón)
- OPUS-MT, Microsoft Translator, AWS Translate: **no soportan** quechua/aymara.
- NLLB en navegador (transformers.js/WASM): 2-5s por frase, **más lento** que lo actual, y calidad insuficiente.

---

## FRENTE 2 — RECONOCIMIENTO DE VOZ (Web Speech API)

### ⭐ 2.1 Cambiar `lang` de `es-MX` a `es-419` + `maxAlternatives=3`
- **Qué:** `es-419` (español latinoamericano genérico) es el match más cercano al andino; Chrome no tiene modelo boliviano dedicado. ([stringcatalog es-419](https://stringcatalog.com/languages/es/es-419), [Google STT LanguageCodes](https://cloud.google.com/dotnet/docs/reference/Google.Cloud.Speech.V1/latest/Google.Cloud.Speech.V1.LanguageCodes.Spanish))
- **Esfuerzo:** trivial. **Impacto:** medio. **Probar empíricamente** es-419 vs es-BO vs es-MX con tus frases reales — es el único benchmark válido.

### 2.2 Separación estricta de buffer final vs interim (parcialmente hecho)
- **Qué:** un buffer que solo crece con resultados `isFinal`, y un interim separado que se sobrescribe entero. Nunca concatenar interim al final.
- **Por qué:** es la causa del "escribe otras cosas". ([MDN Using Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API))
- **Estado:** ya aplicado en parte (finalAcc + interim). Revisar que esté 100% limpio.

### 2.3 Reinicio robusto del reconocimiento continuo
- **Qué:** reiniciar en `onend` guiado por flag `listening`; reiniciar **justo después de un `isFinal`** (no a mitad de palabra); `onerror` con backoff 300-500ms.
- **Por qué:** Chrome corta el modo continuo a ~5 min y en el gap del reinicio se pierden palabras. No se elimina del todo (límite de la API), pero se minimiza. ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API))
- **Esfuerzo:** bajo. **Impacto:** medio-alto.

### 2.4 (Plan B offline) Vosk en el backend Node
- **Qué:** si el wifi es riesgo real el día del jurado, integrar **Vosk** (modelo español small 39 MB, WER ~16; o large 1.4 GB, WER 7.5) en el servidor local. Corre **100% offline**, streaming, baja latencia. ([Vosk models](https://alphacephei.com/vosk/models))
- **Tradeoff:** agrega fricción de instalación. Solo si se necesita offline real.
- ❌ Deepgram/AssemblyAI/Google streaming: mejores en latencia pero rompen "offline + sin API externa".

---

## FRENTE 3 — RECONOCIMIENTO DE SEÑAS (MediaPipe + k-NN/DTW)

> Todo esto es JS vanilla, pocas líneas, explicable ante el jurado. No rompe "el cerebro es nuestro".

### ⭐ 3.1 One-Euro filter para suavizar landmarks (mejora TODO)
- **Qué:** filtro paso-bajo con cutoff adaptativo a la velocidad, aplicado a cada coordenada antes de clasificar. Suaviza el jitter de MediaPipe sin agregar lag.
- **Por qué:** mejora estáticas y dinámicas; supera a Kalman en lag con menos código. ([1€ filter paper](https://direction.bordeaux.inria.fr/~roussel/publications/2012-CHI-one-euro-filter.pdf), [impl. JS](https://jaantollander.com/post/noise-filtering-using-one-euro-filter/))
- **Esfuerzo:** bajo. **Impacto:** alto.

### ⭐ 3.2 Invariancia a rotación en la normalización
- **Qué:** tras trasladar a la muñeca, rotar todo para que el eje muñeca(0)→nudillo(9) quede siempre vertical. La misma seña inclinada produce el mismo vector.
- **Por qué:** hoy solo hay invariancia a posición y escala, no a rotación. Es la mejora individual de mayor retorno. ([arXiv 2407.02241](https://arxiv.org/pdf/2407.02241))
- **Esfuerzo:** bajo (rotación 2D de ~3 líneas). **Impacto:** alto.

### ⭐ 3.3 Canonicalizar mano izquierda → derecha (con `handedness`)
- **Qué:** usar el `handedness` de MediaPipe; espejar la X de la mano izquierda para que entre como derecha. Una seña hecha con cualquier mano se reconoce igual y entrenás la mitad.
- **Por qué:** robustez sin duplicar dataset. ([doc MediaPipe](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker))
- **Esfuerzo:** bajo. **Impacto:** alto.

### 3.4 Features geométricas extra: ángulos de flexión de dedos
- **Qué:** agregar al vector los ángulos de flexión por articulación (≈15 features) + distancias entre puntas. Naturalmente invariantes a rotación/escala.
- **Por qué:** lo que más sube precisión; ángulos de articulación dieron 97.34% en las 26 letras ASL. ([arXiv 2407.02241](https://arxiv.org/pdf/2407.02241))
- **Cuidado MVP:** no agregar demasiadas dimensiones con pocos datos (maldición de la dimensionalidad). Empezar con 3.1-3.3 y medir.

### 3.5 k-NN ponderado por distancia + umbral de rechazo
- **Qué:** votar pesando cada vecino por `1/(d+ε)`; y si el vecino más cercano está demasiado lejos, responder "no reconozco" en vez de adivinar.
- **Por qué:** k-NN ponderado supera al voto simple; el umbral evita que la demo diga palabras al azar (clave ante el jurado). ([Weighted k-NN](https://www.geeksforgeeks.org/machine-learning/weighted-k-nn/))
- **Esfuerzo:** ~5 líneas. **Impacto:** medio-alto. **Estado:** el umbral ya existe parcialmente; agregar ponderación.

### 3.6 Resampling temporal + banda de Sakoe-Chiba en DTW
- **Qué:** re-muestrear cada secuencia a longitud fija (~20-25 frames) antes de comparar; limitar el warping a ±10%.
- **Por qué:** más consistencia y velocidad en gestos dinámicos. ([DTW resampling](https://www.researchgate.net/publication/3907581), [multi-dim DTW](https://www.researchgate.net/publication/228740947))
- **Esfuerzo:** medio. **Impacto:** medio.

### 3.7 Config MediaPipe
- `numHands:2`, `runningMode:VIDEO` (ya), `minTrackingConfidence` 0.5-0.6. Considerar usar **solo x,y** (la z es menos fiable) y medir. ([doc oficial](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker))

### Referencia de implementación
- [kinivi/hand-gesture-recognition-mediapipe](https://github.com/kinivi/hand-gesture-recognition-mediapipe) — pipeline de preprocesado de referencia (coord relativa → aplanar → normalizar por máximo absoluto; trayectoria de puntas para dinámicas).

---

## ORDEN DE IMPLEMENTACIÓN SUGERIDO (por ROI, sin romper la demo)

1. **Señas 3.1 (One-Euro) + 3.2 (rotación) + 3.3 (handedness)** — pocas líneas, gran salto de precisión.
2. **Voz 2.1 (es-419) + 2.3 (reinicio robusto)** — triviales, atacan el "escribe otras cosas".
3. **Traducción 1.1 (caché de frases clínicas)** — el mayor activo; latencia 0 + calidad + offline + puntaje académico.
4. **Señas 3.5 (k-NN ponderado + rechazo)**.
5. Resto (3.4, 3.6) si queda tiempo y la precisión lo pide.

Cada paso deja la app funcionando. Probar la lista de chequeo (CLAUDE.md §8) después de cada cambio.

---

## PARA EL PITCH (enmarcar la honestidad como fortaleza)
> "La traducción automática a quechua es un problema abierto de investigación; los mejores modelos abiertos (NLLB) rinden ~33 chrF, insuficiente para producción. Por eso combinamos un **dataset clínico curado y validado con hablantes nativos** para las frases críticas (latencia cero, calidad garantizada) y traducción por IA para el resto. El reconocimiento de señas es 100% propio y corre local." 

Eso defiende a la vez los criterios 2 (innovación), 3 (impacto), 4 (dominio) y 5 (propuesta académica).
