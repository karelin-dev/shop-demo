// Локальная проверка собранного сайта так, как его отдаст GitHub Pages:
// docs/ по адресу http://localhost:3008/shop-demo/, папки без слеша на конце перенаправляются,
// неизвестные адреса отдают 404.html, текстовые файлы сжимаются gzip (Pages тоже сжимает).
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { gzipSync } from 'node:zlib'

const BASE = '/shop-demo/'
const ROOT = 'docs'
const PORT = Number(process.env.PORT) || 3008
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2',
  '.txt': 'text/plain', '.xml': 'application/xml',
}

async function resolve(path) {
  const file = normalize(join(ROOT, path))
  if (!file.startsWith(normalize(ROOT))) return null
  try {
    const info = await stat(file)
    if (info.isDirectory()) return path === '' || path.endsWith('/') ? resolve(join(path, 'index.html')) : { redirect: true }
    return { file }
  } catch {
    return null
  }
}

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  if (url === '/' || url === BASE.slice(0, -1)) {
    res.writeHead(301, { Location: BASE + query }).end()
    return
  }
  const found = url.startsWith(BASE) ? await resolve(url.slice(BASE.length)) : null
  if (found?.redirect) {
    res.writeHead(301, { Location: `${url}/${query}` }).end()
    return
  }
  const file = found?.file
  const type = TYPES[extname(file || '404.html')] || 'application/octet-stream'
  let body = await readFile(file || join(ROOT, '404.html'))
  const headers = { 'Content-Type': type, 'Cache-Control': type.startsWith('text/html') ? 'no-cache' : 'max-age=600' }
  if (/text|javascript|json|svg|xml/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) {
    body = gzipSync(body)
    headers['Content-Encoding'] = 'gzip'
  }
  res.writeHead(file ? 200 : 404, headers)
  res.end(body)
}).listen(PORT, () => console.log(`http://localhost:${PORT}${BASE}`))
