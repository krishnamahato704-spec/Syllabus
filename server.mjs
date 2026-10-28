import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve(import.meta.dirname, 'dist');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.ttf':'font/ttf', '.png':'image/png', '.ico':'image/x-icon' };
const port = Number(process.env.PORT || 3000);
http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow:'GET, HEAD' }); res.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(root + sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    if (!(await stat(target)).isFile()) throw new Error('Not a file');
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type':types[extname(target)] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'strict-origin-when-cross-origin', 'Cache-Control': extname(target) === '.html' ? 'no-cache' : 'public, max-age=3600' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404, { 'Content-Type':'text/plain' }); res.end('Page not found'); }
}).listen(port, '0.0.0.0', () => console.log(`Study Atlas is available on port ${port}.`));
