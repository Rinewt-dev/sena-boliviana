# PLAN.md — Roadmap hasta el 26 de junio

> Marca cada tarea con [x] al terminarla. Claude Code: trabaja solo dentro del día actual.

## Estado actual
- [x] MVP base funcionando (reconocimiento de señas + salida trilingüe + voz)
- [ ] Modo bidireccional (oyente habla → texto)
- [ ] Dataset base recolectado y validado
- [ ] Documento Anexo 1 listo
- [ ] Video pitch grabado

---

## DÍA 1 — Consolidar la base (Modo 1: Sordo → Oyente)
**Objetivo:** que el reconocimiento de señas sea estable y la demo no falle.

- [ ] Abrir `index.html` con chrome-devtools y confirmar que la lista de chequeo (CLAUDE.md §8) pasa
- [ ] Mejorar la estabilidad del reconocimiento (que no parpadee entre señas)
- [ ] Ajustar el control de sensibilidad y dejar un valor por defecto que funcione bien
- [ ] Guardar/exportar dataset en JSON funcionando
- [ ] Probar en celular además de laptop

## DÍA 2 — Modo bidireccional (Modo 2: Oyente → Sordo)
**Objetivo:** cerrar el círculo de comunicación.

- [ ] Agregar pestaña "Oyente habla"
- [ ] Integrar Web Speech API (`SpeechRecognition`, lang `es-ES` / `es-BO`)
- [ ] Mostrar la transcripción en texto GRANDE, legible a 3 metros
- [ ] Manejar el caso "micrófono denegado" con mensaje claro
- [ ] Verificar que no rompió el Modo 1

## DÍA 3 — Recolectar y validar el dataset (la propuesta académica)
**Objetivo:** tener el dataset que nos da el punto de "propuesta académica".

- [ ] Grabar 15-20 muestras por cada seña del vocabulario base (CLAUDE.md §6), entre los 3 integrantes para que haya variedad de manos
- [ ] Exportar el dataset a `datos/senas-base.json`
- [ ] Validar traducciones quechua/aymara con un hablante nativo y corregir
- [ ] Documentar la metodología de recolección (cuántas muestras, cuántas personas, cómo se normaliza) — esto va al documento

## DÍA 4 — Escena demo + pulido visual
**Objetivo:** que se vea profesional y cuente una historia.

- [ ] Crear un "modo presentación" con las frases de la posta de salud
- [ ] Pulir la interfaz (contraste, tamaños, que se vea bien proyectado)
- [ ] Pantalla de inicio clara con el nombre del proyecto
- [ ] Tests de humo con playwright (botones existen, exportar funciona)
- [ ] Ensayo de demo #1

## DÍA 5 — Documento + Pitch
**Objetivo:** entregables no-código.

- [ ] Pasar `docs/anexo-1.md` al formato Word del Anexo 1
- [ ] Grabar el video pitch de 2 minutos (guion en `docs/pitch.md`)
- [ ] Ensayo de demo #2 y #3
- [ ] Preparar respuestas a las preguntas duras del jurado

## DÍA 6 (26 jun) — Presentación
- [ ] Llegar con la app abierta y probada en la laptop de la presentación
- [ ] Tener el dataset cargado (no entrenar en vivo desde cero)
- [ ] Plan B: si falla la cámara, tener un video de respaldo de la app funcionando
- [ ] Respirar. Defender con dominio. Ganar.

---

## Notas de riesgo (leer)
- **El mayor riesgo es la demo en vivo.** Siempre ten un video de respaldo grabado de la app funcionando, por si la cámara o la luz fallan el día 26.
- **No entrenes el modelo en vivo desde cero** frente al jurado. Llega con el dataset ya cargado (importado del JSON). Puedes mostrar el entrenamiento de UNA seña como demostración, pero el resto ya debe estar listo.
- La primera carga del modelo de manos necesita internet. Cárgalo ANTES de que empiece tu turno.
