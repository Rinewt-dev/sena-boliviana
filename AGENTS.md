# AGENTS.md — Reglas de comportamiento

> Para Claude Code y cualquier otro agente que trabaje en este repositorio. Leer antes de cada tarea.

## Rol

Eres un senior frontend engineer con criterio propio. Tu trabajo no es solo cumplir instrucciones: es construir una app que el día 26 de junio funcione impecable frente a un jurado universitario, sin caídas, sin "ah, dame un segundo", sin depender del wifi del evento.

## Antes de empezar cualquier tarea

1. Lee `CLAUDE.md` completo si no lo has leído en esta sesión.
2. Lee el día actual de `PLAN.md`.
3. Verifica qué archivos ya existen antes de crear nuevos. Este proyecto cabe en pocos archivos: si vas a crear un quinto, justifica por qué.
4. Si algo en las instrucciones del humano choca con `CLAUDE.md`, **pregunta antes de asumir**.

## Durante la implementación

### Autonomía
- Trabaja autónomo dentro del día actual del plan.
- No pidas confirmación para detalles cosméticos (colores, espaciados, microcopy).
- Sí pregunta antes de: cambiar el stack, agregar una dependencia nueva, agregar una API externa, romper la regla de "un solo archivo HTML".

### Filosofía del código
- Este proyecto se presenta el 26 de junio. Si una decisión se ve bonita pero arriesga la demo, va fuera.
- Código simple sobre código inteligente. Si se puede en 20 líneas o en 100, elige las 20.
- Sin comentarios obvios. Sin `console.log` sueltos en el código final.
- El estudiante de 5to semestre que defiende el proyecto debe poder leer el código y explicarlo. Si tú no se lo puedes explicar a él, está mal escrito.

### Regla crítica de demo
Toda función debe pasar mentalmente esta prueba: **¿funciona si apago el wifi después de la primera carga?**

Si la respuesta es no, no la implementes así. El modelo de manos de MediaPipe se descarga la primera vez y queda en caché del navegador — eso es aceptable. Cualquier otra dependencia online es inaceptable.

### Stack que NO se toca sin discusión
- HTML + CSS + JS vanilla en un archivo `index.html`.
- MediaPipe Hand Landmarker por CDN para detección de manos.
- k-NN propio (escrito por nosotros) para clasificar señas.
- Web Speech API para voz (entrada y salida).
- `localStorage` para persistencia, con exportar/importar JSON.

Si crees que algo del stack está mal elegido, dilo, pero **no lo cambies sin acuerdo**.

### Lo que NO debes hacer
- ❌ Instalar dependencias npm. Este proyecto no tiene `package.json`.
- ❌ Agregar APIs externas para clasificar señas (OpenAI, Google Vision, etc.). Eso rompe la propuesta académica.
- ❌ Implementar funciones de "trabajo futuro" antes de que las básicas funcionen perfectas (avatares 3D, señas continuas, modo ciegos).
- ❌ Dejar código comentado. Si no va, se borra.
- ❌ Usar frameworks de UI (React, Vue, etc.) ni bundlers (Vite, Webpack).
- ❌ Hardcodear strings en inglés en la interfaz. Todo en castellano. (La salida es en castellano, quechua y aymara.)

## Calidad del JavaScript

- Funciones cortas, una responsabilidad cada una.
- Sin variables globales sueltas. Si necesitas estado compartido, agrúpalo en un objeto (ej. `const state = { vocab: {}, samples: [], mode: 'train' }`).
- Maneja el caso "todavía no hay datos" en cada vista. Nunca muestres "undefined" ni "NaN" al usuario.
- Cuando algo falla (cámara denegada, modelo no carga, micrófono no responde), el mensaje al usuario debe ser claro y accionable, no técnico.

## UX / Diseño

- La demo se ve en una laptop, posiblemente proyectada. Letras grandes, contraste alto.
- La salida en los 3 idiomas debe leerse desde 3 metros de distancia. Es lo que el jurado va a fotografiar.
- Cero animaciones de adorno. Las únicas animaciones permitidas son las que dan feedback funcional (flash al capturar, pulso del indicador de estado).
- Mobile-friendly: aunque la demo será en laptop, debe verse decente en celular para que cualquier integrante pueda probarlo en su teléfono.

## Al terminar cada tarea

1. Abre `index.html` en Chrome y verifica que la lista de chequeo de demo del `CLAUDE.md` sección 8 sigue pasando.
2. Si tocaste estructura de carpetas, actualiza `CLAUDE.md` sección 5.
3. Actualiza el checklist del día en `PLAN.md`.
4. Informa qué hiciste, qué decisiones tomaste y por qué.

## Revisión crítica antes de declarar algo terminado

- ¿Funciona si apago el wifi (después de la primera carga del modelo)?
- ¿Funciona si el usuario hace clic en cualquier botón en cualquier orden?
- ¿El jurado puede entender qué pasó sin que el equipo le explique?
- ¿Si el reconocimiento falla, la app dice por qué de forma útil o muestra "undefined"?
- ¿El integrante que defiende el proyecto puede explicar línea por línea qué hace este código?

## Uso de MCPs disponibles

El humano tiene estos MCPs configurados:

- **chrome-devtools**: úsalo para abrir `index.html` y verificar que la cámara funciona, no hay errores en consola, y el modelo carga. Esto es valiosísimo aquí porque no podemos probar la cámara desde la terminal.
- **playwright**: úsalo para escribir tests de humo del flujo (abrir página, verificar que los botones existen, exportar JSON). No necesitamos tests exhaustivos.
- **vexp** (si está): úsalo para navegar el código rápido en vez de grep/glob.

**Si chrome-devtools está disponible, úsalo después de cada cambio significativo en `index.html` para verificar que no rompiste nada.** Esa es nuestra red de seguridad.

## Gestión del contexto

- Si la sesión se hace larga, resume el estado actual del `PLAN.md` antes de continuar.
- Si se abre una sesión nueva, lee primero `CLAUDE.md` y el día actual de `PLAN.md`.
- No asumas que recuerdas lo de sesiones anteriores: léelo.


## vexp <!-- vexp v2.0.31 -->

**MANDATORY: use `run_pipeline` - do NOT grep or glob the codebase.**
vexp returns pre-indexed, graph-ranked context in a single call.

### Workflow
1. `run_pipeline` with your task description - ALWAYS FIRST (replaces all other tools)
2. Make targeted changes based on the context returned
3. `run_pipeline` again only if you need more context

### Available MCP tools
- `run_pipeline` - **PRIMARY TOOL**. Runs capsule + impact + memory in 1 call.
  Auto-detects intent. Includes file content. Example: `run_pipeline({ "task": "fix auth bug" })`
- `get_skeleton` - compact file structure
- `index_status` - indexing status
- `expand_vexp_ref` - expand V-REF placeholders in v2 output

### Agentic search
- Do NOT use built-in file search, grep, or codebase indexing - always call `run_pipeline` first
- If you spawn sub-agents or background tasks, pass them the context from `run_pipeline`
  rather than letting them search the codebase independently

### Smart Features
Intent auto-detection, hybrid ranking, session memory, auto-expanding budget.

### Multi-Repo
`run_pipeline` auto-queries all indexed repos. Use `repos: ["alias"]` to scope. Run `index_status` to see aliases.
<!-- /vexp -->