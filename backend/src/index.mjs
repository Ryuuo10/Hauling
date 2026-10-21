import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAuthApi } from './auth.mjs';
import { loadServerEnv } from './env.mjs';

const env = loadServerEnv();
const auth = createAuthApi({ env });
const root = fileURLToPath(new URL('../../dist/', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  void auth(req, res, () => { void serve(req, res); });
});
async function serve(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.startsWith('/api/')) { res.writeHead(404); return res.end(); }
    let file = resolve(root, '.' + pathname);
    if (!file.startsWith(resolve(root) + sep) && file !== resolve(root)) { res.writeHead(403); return res.end(); }
    try { if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html'); }
    catch { if (extname(pathname)) throw Error(); else file = resolve(root, 'index.html'); }
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(404); res.end('Build the app with npm run build before starting the server.'); }
}
server.listen(Number(env.PORT || env.API_PORT || 3001), env.HOST || '127.0.0.1', () => console.log('KadaGo web and authentication server is running.'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { void auth.close().then(() => process.exit(0)); }));
