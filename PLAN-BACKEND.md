# PLAN-BACKEND.md — Cómo montar el backend local con las APIs de Google

> Pasos concretos para la Fase 0 y 1 de `PLAN-ARQUITECTURA-V2.md`.
> Backend local (corre en tu laptop), sin dependencias externas, Node 18+.

## 0. Requisitos

- [ ] **Node.js 18 o superior** instalado (verificá con `node --version`). Node 18+ trae `fetch` nativo → no necesitamos instalar nada.
- [ ] Una cuenta de Google (la misma del correo sirve).
- [ ] Tarjeta para activar Google Cloud (NO te cobran dentro del free tier, pero la piden para verificar). Alternativa sin tarjeta: ver §6.

## 1. Crear el proyecto y las claves en Google Cloud

1. Entrá a https://console.cloud.google.com/ y creá un proyecto nuevo: **"sena-boliviana"**.
2. **Habilitá las dos APIs** (buscador "APIs y servicios" → "Habilitar APIs"):
   - **Cloud Translation API** (para traducir voz a quechua/aymara)
   - **Generative Language API** (Gemini, para coherencia de señas)
3. Andá a **"Credenciales" → "Crear credencial" → "Clave de API"**. Copiá la clave.
4. **Restringí la clave** (importante para seguridad):
   - En la clave creada → "Restricciones de API" → seleccioná solo las 2 APIs de arriba.
   - "Restricciones de aplicación" → por ahora "Ninguna" (es local); en producción se pondría por IP.

> Podés usar **una sola clave** para las dos APIs si están en el mismo proyecto. Más simple.

## 2. Archivos del backend

### `.env` (NUNCA se comparte ni se sube a git)
```
GOOGLE_API_KEY=tu_clave_aqui
PORT=3000
```

### `.env.example` (esto SÍ se puede compartir, sin la clave real)
```
GOOGLE_API_KEY=
PORT=3000
```

### `.gitignore`
```
.env
node_modules/
```

### `package.json`
```json
{
  "name": "sena-boliviana",
  "version": "2.0.0",
  "type": "module",
  "scripts": { "start": "node server.js" }
}
```

### `server.js` (esqueleto — sin dependencias externas)
```js
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import 'node:process';

const KEY = process.env.GOOGLE_API_KEY;
const PORT = process.env.PORT || 3000;

// --- Traducción: castellano -> quechua (qu) / aymara (ay) ---
async function traducir(texto, destino){
  const url = `https://translation.googleapis.com/language/translate/v2?key=${KEY}`;
  const res = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ q: texto, source:'es', target: destino, format:'text' })
  });
  const j = await res.json();
  return j.data.translations[0].translatedText;
}

// --- Coherencia de señas con Gemini ---
async function interpretar(palabras){
  const prompt = `Eres un intérprete de Lengua de Señas Boliviana. Recibes una secuencia de señas reconocidas (en orden, posiblemente sin gramática del castellano). Devuelve UNA sola oración en castellano natural y breve, sin explicaciones. Señas: "${palabras}"`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`;
  const res = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ contents:[{ parts:[{ text: prompt }] }] })
  });
  const j = await res.json();
  return j.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || palabras;
}

const server = http.createServer(async (req, res) => {
  // CORS para que el navegador pueda llamar
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  // Endpoints de API
  if (req.url === '/api/traducir' || req.url === '/api/interpretar') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const d = JSON.parse(body || '{}');
        let out;
        if (req.url === '/api/traducir') out = await traducir(d.texto, d.destino);
        else out = await interpretar(d.palabras);
        res.writeHead(200, {'Content-Type':'application/json'});
        res.end(JSON.stringify({ ok:true, resultado: out }));
      } catch (e) {
        res.writeHead(500, {'Content-Type':'application/json'});
        res.end(JSON.stringify({ ok:false, error: String(e) }));
      }
    });
    return;
  }

  // Servir el index.html
  try {
    const file = req.url === '/' ? '/index.html' : req.url;
    const data = await readFile('.' + file);
    res.writeHead(200);
    res.end(data);
  } catch { res.writeHead(404); res.end('No encontrado'); }
});

server.listen(PORT, () => console.log(`Seña Boliviana en http://localhost:${PORT}`));
```

## 3. Cómo cargar el `.env` sin dependencias

Node 20.6+ permite: `node --env-file=.env server.js`.
Actualizá el script en `package.json`:
```json
"scripts": { "start": "node --env-file=.env server.js" }
```
(Si tu Node es 18, instalá una vez: `npm i dotenv` y agregá `import 'dotenv/config'` arriba del server.js.)

## 4. Correr el backend

```bash
# dentro de la carpeta del proyecto:
npm start
# abrí en Chrome:  http://localhost:3000
```

> A partir de ahora la app se abre desde `http://localhost:3000`, NO con doble clic.
> Esto además resuelve el problema de permisos de cámara que a veces da el `file://`.

## 5. Cómo lo llama el frontend (cambios en index.html)

Reemplazar la llamada actual a MyMemory por:
```js
async function traducirBackend(texto, destino){
  try{
    const r = await fetch('/api/traducir', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ texto, destino })
    });
    const j = await r.json();
    return j.ok ? j.resultado : texto;   // fallback: castellano
  }catch(e){ return texto; }             // sin backend: castellano
}
```
Códigos de idioma de Google: quechua = `qu`, aymara = `ay`.

## 6. Si no querés/poder usar Google Cloud (alternativa sin tarjeta)

- **Gemini** tiene una API gratuita en **Google AI Studio** (https://aistudio.google.com/) que da una clave **sin tarjeta**. Sirve para el endpoint `/api/interpretar`.
- Para la traducción sin tarjeta, se puede dejar **MyMemory** como está (peor calidad) hasta conseguir la cuenta de Cloud.
- O sea: podés arrancar HOY con Gemini (AI Studio, gratis, sin tarjeta) para la coherencia de señas, y dejar la traducción de voz para cuando actives Cloud Translation.

## 7. Checklist de seguridad antes de presentar

- [ ] `.env` está en `.gitignore` y NO se subió a ningún repo.
- [ ] La clave de API está restringida a las 2 APIs en la consola de Google.
- [ ] El backend corre y probaste `/api/traducir` con `curl` o desde la app.
- [ ] Probaste el modo offline (sin wifi): la app sigue reconociendo señas.
