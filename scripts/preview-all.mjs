import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const config = JSON.parse(fs.readFileSync(path.join(rootDir, 'sites.config.json'), 'utf-8'))

const PORT = Number(process.env.PORT || 4173)

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.pf_meta': 'application/octet-stream',
  '.pf_index': 'application/octet-stream',
  '.pf_fragment': 'application/octet-stream',
  '.pagefind': 'application/octet-stream'
}

const mounts = config.sites
  .map((s) => ({
    prefix: s.basePath.endsWith('/') ? s.basePath.slice(0, -1) : s.basePath,
    dir: path.join(rootDir, s.distDir)
  }))
  .sort((a, b) => b.prefix.length - a.prefix.length)

function resolveStaticFile(baseDir, subPath) {
  const cleanRel = decodeURIComponent(subPath).replace(/^\/+/, '').replace(/\.\./g, '')
  const direct = path.join(baseDir, cleanRel)

  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct
  if (fs.existsSync(path.join(direct, 'index.html'))) return path.join(direct, 'index.html')
  if (cleanRel && fs.existsSync(`${direct}.html`)) return `${direct}.html`
  return null
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url || '/', `http://localhost:${PORT}`)
  const pathname = urlObj.pathname

  let targetFile = null
  for (const m of mounts) {
    if (pathname === m.prefix || pathname.startsWith(`${m.prefix}/`)) {
      const sub = pathname.slice(m.prefix.length) || '/'
      targetFile = resolveStaticFile(m.dir, sub)
      break
    }
  }

  if (!targetFile) {
    targetFile = resolveStaticFile(path.join(rootDir, 'dist'), pathname)
  }

  if (!targetFile) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(`404 Not Found: ${pathname}`)
    return
  }

  const ext = path.extname(targetFile).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'
  res.writeHead(200, { 'Content-Type': contentType })
  fs.createReadStream(targetFile).pipe(res)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[preview-all] Unified same-origin preview listening at http://localhost:${PORT}`)
  for (const m of mounts) {
    console.log(`  ↳ ${m.prefix}/ -> ${path.relative(rootDir, m.dir)}`)
  }
})
