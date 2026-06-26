# CLAUDE.md — Seña Boliviana

> Este archivo es la fuente de verdad del proyecto. Si vas a hacer cualquier tarea, léelo completo primero.

## 1. Qué estamos construyendo

**Seña Boliviana** es un puente de comunicación bidireccional con IA para la comunidad sorda de Bolivia, con salida trilingüe (castellano, quechua, aymara).

- **Modo 1 (Sordo → Oyente):** la persona sorda firma frente a la cámara, la app reconoce la seña y la dice en voz alta + la muestra en texto en los 3 idiomas.
- **Modo 2 (Oyente → Sordo):** la persona oyente habla al micrófono, la app transcribe a texto grande en pantalla para que la persona sorda lo lea.

**Escenario demo (para el pitch):** una posta de salud en una comunidad rural cruceña, donde una persona sorda quechuahablante se atiende con un médico que solo habla castellano.

## 2. Contexto de la entrega

- **Concurso:** FEXPOJETS 2026, Universidad UTEPSA, Santa Cruz de la Sierra, Bolivia.
- **Fecha de presentación:** viernes 26 de junio de 2026.
- **Inscripción con jefatura de carrera:** 19 de junio (ya pasada / vigente según el equipo).
- **Premio objetivo:** primer lugar Facultad de Ciencias y Tecnología.
- **Carrera del equipo principal:** Ingeniería de Sistemas, 5to semestre.
- **Equipo:** 3 integrantes (completar nombres en `EQUIPO.md`).

## 3. Criterios de evaluación del jurado (los 6 que se califican)

Cada decisión de diseño debe defender al menos uno de estos. Si una decisión no defiende ninguno, está de más:

1. **Pertinencia** (responde a una necesidad real de la sociedad)
2. **Innovación y originalidad**
3. **Impacto social y/o técnico**
4. **Dominio y sustentación de la temática** (lo defiende el equipo en vivo)
5. **Propuesta académica** (el dataset abierto de LSB es nuestra carta fuerte aquí)
6. **Pertinencia con la carrera** (Ingeniería de Sistemas)

## 4. Decisiones tomadas (no las cambies sin discutirlas)

### Stack
- **Frontend:** HTML + CSS + JavaScript vanilla, un único archivo `index.html` autónomo.
- **NO usar React, Vue, Next, ni bundlers.** El jurado debe poder abrir el archivo con doble clic en Chrome y que funcione. Cero fricción de demo.
- **Detección de manos:** MediaPipe Hand Landmarker (CDN, sin npm).
- **Clasificador de señas:** k-Nearest Neighbors propio, implementado a mano en JavaScript sobre los 21 puntos normalizados de la mano. **NO usar TensorFlow.js, NO usar APIs externas para clasificar.** El cerebro debe ser nuestro, esa es la línea que defendemos ante el jurado.
- **Reconocimiento de voz (Modo 2):** Web Speech API del navegador (`SpeechRecognition`).
- **Síntesis de voz:** Web Speech API (`SpeechSynthesisUtterance`).
- **Almacenamiento:** `localStorage` para el dataset y vocabulario. Exportable como JSON.

### Por qué este stack y no otro
- Corre **100% local en el navegador**, sin servidor, sin internet (salvo la primera carga del modelo de manos). El día del jurado el wifi puede fallar y la demo debe funcionar igual.
- Cero instalación, cero build. Un archivo, doble clic, funciona.
- Lo que es genuinamente nuestro (el clasificador, el dataset) está en código que podemos explicar línea por línea.

### Lo que NO vamos a hacer (foco)
- ❌ Avatar 3D que firma
- ❌ Modo "asistente para personas ciegas" — es otro público, diluye el foco
- ❌ Integrar APIs de IA externas para la traducción (OpenAI, Google, etc.). Si lo hacemos, perdemos el "esto lo construimos nosotros"

## 5. Estructura del proyecto

```
sena-boliviana-proyecto/
├── CLAUDE.md          ← este archivo
├── AGENTS.md          ← reglas de comportamiento para Claude Code
├── PLAN.md            ← roadmap día por día hasta el 26 de junio
├── EQUIPO.md          ← datos de los integrantes
├── README.md          ← cómo correr el proyecto
├── index.html         ← la app entera (un solo archivo)
├── datos/
│   └── senas-base.json ← dataset inicial recolectado
└── docs/
    ├── anexo-1.md     ← borrador del documento para la jefatura de carrera
    └── pitch.md       ← guion del video de 2 minutos
```

## 6. Vocabulario base de la demo

Estas son las señas que debemos tener entrenadas para la presentación. Empezamos con estas porque cuentan una historia en la posta de salud:

| Castellano | Quechua          | Aymara         | Prioridad |
|------------|------------------|----------------|-----------|
| Hola       | Rimaykullayki    | Kamisaraki     | Alta      |
| Gracias    | Sulpayki         | Yuspajara      | Alta      |
| Sí         | Arí              | Jïsa           | Alta      |
| No         | Mana             | Janiwa         | Alta      |
| Ayuda      | Yanapay          | Yanapt'aña     | Alta      |
| Dolor      | Nanay            | Usu            | Alta      |
| Doctor     | Hampiq           | Qulliri        | Alta      |
| Agua       | Yaku             | Uma            | Media     |
| Mamá       | Mama             | Mama           | Media     |
| Familia    | Ayllu            | Ayllu          | Media     |

**IMPORTANTE:** las traducciones a quechua y aymara son una base inicial **que debe validarse con un hablante nativo** antes del 26. Si encuentras un hablante (por ejemplo en la facultad de Humanísticas), agradécele en los créditos del documento — eso suma propuesta académica.

## 7. Datos importantes para el documento y el pitch

- **Comunidad sorda en Bolivia:** según censos, hay decenas de miles de personas sordas; la LSB es la lengua oficial de la comunidad sorda boliviana (Ley General para Personas con Discapacidad N° 223).
- **Lenguas originarias:** quechua y aymara son lenguas oficiales del Estado Plurinacional de Bolivia (Constitución, art. 5). Mayoritariamente orales.
- **Brecha documentada:** en zonas rurales, el personal de salud que solo habla castellano no puede comunicarse con pacientes quechuahablantes (citado por el activista Luis Illaccanqui en notas sobre Google Translate). La brecha se duplica si el paciente además es sordo.
- **Validar y citar:** todo número o cita debe ir con fuente. Si no la tienes, no la pongas.

## 8. Reglas de demo (lo que SIEMPRE debe funcionar)

Antes de declarar terminada cualquier funcionalidad, prueba esto:

1. Abro `index.html` con doble clic en Chrome → carga sin errores
2. Doy permiso de cámara → enciende
3. Selecciono una seña, capturo 15 muestras → cuenta sube a 15
4. Cambio a modo "Traducir" → me reconoce la seña que entrené
5. La voz dice la palabra en castellano
6. Cambio a modo "Oyente habla" → reconoce mi voz y muestra el texto
7. Cierro Chrome, abro de nuevo → mis datos siguen ahí
8. Apago el wifi → la app sigue funcionando (excepto la primera carga del modelo de manos)

Si algo de esto falla, **no avances** con nuevas features. Arregla primero.

## 9. Cosas que el equipo debe hacer en paralelo (no son código)

- Conseguir contacto con la comunidad sorda local o un intérprete LSB (Federación Boliviana de Sordos)
- Validar las traducciones quechua/aymara con un hablante nativo
- Grabar testimonios cortos (con autorización) para mostrar en el pitch
- Practicar la demo en vivo al menos 5 veces antes del 26
- Ensayar respuestas a preguntas duras del jurado (ver `docs/pitch.md`)
