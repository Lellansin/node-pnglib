import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css' };

export function createServer(port) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const file = req.url === '/' ? '/index.html' : req.url;
      const p = path.join(dir, file);
      try {
        const content = fs.readFileSync(p);
        const ext = path.extname(p);
        res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    srv.listen(port, () => resolve(srv));
  });
}
