import http from 'node:http';
import { readFile } from 'node:fs/promises';

const DEEPSEEK_KEY   = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const PORT = process.env.PORT || 3000;

// --- Prompts ---
function promptTraducir(texto, destino) {
  const nombre = destino === 'qu' ? 'quechua' : 'aymara';
  return `Traduce el siguiente texto del español al ${nombre}. Devuelve SOLO la traducción, sin explicaciones ni notas.\n\nTexto: "${texto}"`;
}
function promptInterpretar(palabras) {
  return `Eres un intérprete de Lengua de Señas Boliviana (LSB). Recibes palabras sueltas reconocidas por un sistema de visión computacional, en el orden en que la persona las señó. La LSB tiene gramática distinta al español. Tu tarea: convertir esas palabras en UNA oración en español claro y natural (máximo 15 palabras). Responde SOLO con la oración, sin explicaciones.\n\nPalabras detectadas: ${palabras}`;
}

// --- Llamada NO streaming (respuesta completa) ---
async function ai(prompt) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({ model: DEEPSEEK_MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3 })
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error?.message || `Error DeepSeek ${res.status}`);
  return j.choices?.[0]?.message?.content?.trim() || '';
}

// --- Llamada STREAMING: llama onToken(texto) por cada fragmento de la respuesta ---
async function aiStream(prompt, onToken) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({ model: DEEPSEEK_MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.3, stream: true })
  });
  if (!res.ok) throw new Error(`Error DeepSeek ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop();              // lo incompleto queda para la próxima vuelta
    for (const part of parts) {
      const line = part.split('\n').find(l => l.startsWith('data: '));
      if (!line) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') return;
      try {
        const tok = JSON.parse(payload).choices?.[0]?.delta?.content;
        if (tok) onToken(tok);
      } catch {}
    }
  }
}

const MIME = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.css':'text/css' };

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  // ---- Endpoint STREAMING (traducción en vivo, palabra por palabra) ----
  if (req.method === 'POST' && req.url === '/api/traducir-stream') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const d = JSON.parse(body || '{}');
        if (!d.texto || !d.destino) throw new Error('Faltan campos: texto, destino');
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' });
        await aiStream(promptTraducir(d.texto, d.destino), tok => res.write(tok));
        res.end();
      } catch (e) {
        if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(e) }));
      }
    });
    return;
  }

  // ---- Endpoints de IA (respuesta completa) ----
  if (req.method === 'POST' && (req.url === '/api/traducir' || req.url === '/api/interpretar')) {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const d = JSON.parse(body || '{}');
        let resultado;
        if (req.url === '/api/traducir') {
          if (!d.texto || !d.destino) throw new Error('Faltan campos: texto, destino');
          resultado = await ai(promptTraducir(d.texto, d.destino));
        } else {
          if (!d.palabras) throw new Error('Falta campo: palabras');
          resultado = await ai(promptInterpretar(d.palabras));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, resultado }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(e) }));
      }
    });
    return;
  }

  // ---- Servir archivos estáticos ----
  try {
    const urlPath = req.url.split('?')[0];          // ignorar query string (?algo)
    const filePath = urlPath === '/' ? '/index.html' : urlPath;
    const ext = filePath.match(/\.[a-z]+$/i)?.[0] || '';
    const data = await readFile('.' + filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('No encontrado');
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ Seña Boliviana corriendo en http://localhost:${PORT}`);
  console.log(`   DeepSeek: ${DEEPSEEK_KEY ? 'OK (clave cargada)' : '⚠ FALTA LA CLAVE en .env'}\n`);
});
