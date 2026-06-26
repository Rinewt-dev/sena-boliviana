# PLAN-ARQUITECTURA-V2.md — Migración a modelo híbrido (frontend local + backend con IA de Google)

> Plan maestro de la versión 2. Lee esto ANTES de tocar código.
> Compañero: `PLAN-BACKEND.md` (pasos concretos del servidor).
> Fecha objetivo: viernes 26 de junio de 2026.

## 1. Qué estamos cambiando y por qué

La v1 es un único `index.html` que corre 100% local. La v2 **mantiene ese núcleo** y le agrega dos capacidades que necesitan IA externa:

1. **Traducción real de voz** (Modo 2): castellano hablado → quechua/aymara escrito, con **Google Cloud Translation API**.
2. **Coherencia de señas** (Modo 1): la secuencia de señas reconocidas → oración en castellano natural, con **Google Gemini**.

Ambas requieren claves de API. Las claves **NUNCA** pueden ir en el navegador (cualquiera las robaría). Por eso se crea un **backend** que actúa de intermediario y guarda las claves.

## 2. Regla de oro (NO romper)

> **El reconocimiento de señas (k-NN/DTW) se queda 100% local y offline.**

Razones:
- Es la defensa académica ante el jurado ("el cerebro es nuestro").
- El riesgo #1 de la demo es que falle el wifi el 26 (ver `PLAN.md`). Si todo depende del backend, una caída de internet mata la presentación.

→ El backend es una **capa opcional de mejora**, no el corazón. Si no hay internet, la app degrada con elegancia (ver §5).

## 3. Estructura de archivos nueva

```
sena-boliviana-proyecto/
├── index.html            ← FRONTEND (sigue abriéndose en el navegador)
├── server.js             ← BACKEND local (Node, sin dependencias externas)
├── .env                  ← claves de Google (NUNCA se sube a git ni se comparte)
├── .env.example          ← plantilla de las claves, sin valores reales
├── .gitignore            ← ignora .env y node_modules
├── package.json          ← define "npm start" → node server.js
├── datos/
│   └── senas-base.json
└── docs/ ...
```

El frontend deja de hablar con MyMemory directamente y pasa a llamar a `http://localhost:3000/api/...`.

## 4. Flujo de datos

**Modo 2 — Oyente habla (con internet):**
```
voz → Web Speech API (navegador) → texto castellano
     → fetch a localhost:3000/api/traducir
     → server.js → Google Cloud Translation API
     → quechua/aymara → se muestra en pantalla grande
```

**Modo 1 — Señas (con internet):**
```
señas → MediaPipe + k-NN/DTW (LOCAL, offline) → secuencia de palabras
      → fetch a localhost:3000/api/interpretar
      → server.js → Gemini ("ordena estas señas en castellano natural")
      → oración coherente → se muestra y se dice en voz alta
```

## 5. Comportamiento sin internet (fallback obligatorio)

| Función | Con internet | Sin internet (fallback) |
|---|---|---|
| Reconocer señas | ✅ local | ✅ local (igual) |
| Mostrar palabra de la seña | ✅ | ✅ diccionario local (SEED) |
| Oración coherente (Gemini) | ✅ | ⚠️ muestra las palabras sueltas (sin reordenar) |
| Traducir voz a quechua/aymara | ✅ Google | ⚠️ muestra el castellano sin traducir |

El frontend detecta si el backend responde; si no, usa el camino local. **La demo central nunca se cae.**

## 6. Fases (cada fase deja la app funcionando; podés parar en cualquiera)

- [ ] **Fase 0 — Preparación** (ver `PLAN-BACKEND.md`)
  - Crear cuenta Google Cloud, habilitar Translation API + Gemini, generar claves, restringirlas.
  - Instalar Node 18+ (trae `fetch` nativo, cero dependencias).

- [ ] **Fase 1 — Backend mínimo**
  - `server.js` que sirve `index.html` y expone `/api/traducir`.
  - Probar con `curl` que traduce "hola" → quechua.

- [ ] **Fase 2 — Conectar Modo 2 (voz)**
  - El frontend llama a `/api/traducir` en vez de MyMemory.
  - Fallback: si el backend no responde, muestra el castellano.
  - Probar: hablo castellano, seleccionar quechua, aparece traducido.

- [ ] **Fase 3 — Conectar Modo 1 (coherencia de señas con Gemini)**
  - Endpoint `/api/interpretar`.
  - El frontend acumula las señas reconocidas y al terminar manda la secuencia a Gemini.
  - Fallback: si no hay backend, muestra las palabras sueltas.

- [ ] **Fase 4 — Pulido y prueba de demo**
  - Probar el escenario completo de la posta de salud.
  - Probar el modo offline (apagar wifi) y confirmar que la regla de oro se cumple.
  - Grabar video de respaldo.

## 7. Seguridad (lo que el jurado de Sistemas puede preguntar)

- Las claves viven en `.env`, leídas solo por `server.js`. **Nunca** llegan al navegador.
- `.env` está en `.gitignore`: no se sube a ningún lado.
- Las claves de Google están **restringidas** (por API y por IP/referrer) en la consola de Google Cloud.
- El backend solo expone los 2 endpoints necesarios; no es un proxy abierto.

## 8. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Falla el wifi el 26 | Regla de oro: el núcleo corre offline. Plan B: video grabado. |
| Se acaba el free tier de Google | Translation: 500k caracteres/mes gratis (de sobra). Gemini Flash: tier gratuito. Monitorear en la consola. |
| El backend no arranca el día de la demo | Llegar con el `node server.js` ya corriendo y probado. Si falla, la app sigue en modo offline. |
| Romper el Modo 1 al refactorizar | No se toca el clasificador. Solo se AGREGA la llamada a `/api/interpretar` con fallback. |

## 9. Lo que NO cambia

- El clasificador k-NN/DTW (sigue siendo nuestro y local).
- El dataset abierto de señas (sigue siendo el aporte académico).
- El hecho de que se abre en el navegador. Solo que ahora, para las features de IA, hay que tener `node server.js` corriendo.
