# Seña Boliviana

Puente de comunicación con IA para la comunidad sorda de Bolivia, con salida en castellano, quechua y aymara.

Proyecto para **FEXPOJETS 2026 — UTEPSA**.

## Cómo correr

Es una sola página web, sin instalación.

**Opción A (la más simple):**
1. Abre `index.html` con doble clic en **Google Chrome**.
2. Da permiso a la cámara (y al micrófono para el modo bidireccional).

**Opción B (si la cámara no enciende con doble clic):**
Algunos navegadores bloquean la cámara al abrir un archivo directo. Sirve el proyecto en localhost:

```bash
# Dentro de la carpeta del proyecto:
python -m http.server 8000
# Luego abre en Chrome:
# http://localhost:8000/index.html
```

## Requisitos
- Google Chrome (recomendado) o Edge.
- Internet **solo la primera vez** (para descargar el modelo de detección de manos de MediaPipe). Después funciona offline.
- Cámara web. Micrófono para el modo "oyente habla".

## Cómo usar
1. **Pestaña "Enseñar señas":** selecciona una seña, hazla frente a la cámara y captura 15-20 muestras (botón o barra espaciadora). Repite con cada seña.
2. **Pestaña "Traducir":** haz una seña entrenada → la app la reconoce, la muestra en 3 idiomas y la dice en voz alta.
3. **Modo "Oyente habla":** habla al micrófono → la app transcribe a texto grande para que la persona sorda lea.
4. **Exportar datos:** guarda tu dataset de señas en un archivo JSON (esto es tu aporte académico).

## Cómo trabajar en el proyecto con Claude Code
1. Abre esta carpeta en la terminal.
2. Ejecuta `claude` (Claude Code).
3. Claude leerá `CLAUDE.md` y `AGENTS.md` automáticamente.
4. Dile: "Lee el PLAN.md y empecemos por el día 1".

## Estado
Prototipo (MVP) en desarrollo. No es un producto implementado en producción — es un proyecto en etapa de prototipo, como pide la convocatoria.
