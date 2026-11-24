import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const sitesDocsDir = path.join(rootDir, 'docs', 'sites')
const config = JSON.parse(fs.readFileSync(path.join(rootDir, 'sites.config.json'), 'utf-8'))

const onlyArg = process.argv.find((a) => a.startsWith('--only='))
const onlySet = onlyArg
  ? new Set(
      onlyArg
        .slice('--only='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
  : null

const skipBuild = process.argv.includes('--skip-build')

const CACHE_DIRS = [
  '.vitepress/cache',
  'docs/.vuepress/.cache',
  'docs/.vuepress/.temp',
  '.astro',
  '.docusaurus',
  '.next/cache',
  '.quartz-cache',
  '_build/doctrees'
]

function removeIfExists(targetAbs) {
  if (fs.existsSync(targetAbs)) {
    fs.rmSync(targetAbs, { recursive: true, force: true })
  }
}

function detectOfflineSearch(relFiles) {
  if (relFiles.some((f) => f.includes('pagefind/') || f.endsWith('.pf_index') || f.endsWith('.pagefind'))) {
    return { hasOfflineSearch: true, offlineSearchKind: 'Pagefind (Wasm)' }
  }
  if (relFiles.some((f) => f.endsWith('contentIndex.json'))) {
    return { hasOfflineSearch: true, offlineSearchKind: 'FlexSearch (contentIndex)' }
  }
  if (relFiles.some((f) => f.includes('elasticlunr') || (f.endsWith('searchindex.js') && relFiles.some((x) => x.includes('book.js'))))) {
    return { hasOfflineSearch: true, offlineSearchKind: 'Elasticlunr 静态索引' }
  }
  if (relFiles.some((f) => f === 'searchindex.js')) {
    return { hasOfflineSearch: true, offlineSearchKind: 'Sphinx 静态分词索引' }
  }
  if (relFiles.some((f) => f.endsWith('search_index.json'))) {
    return { hasOfflineSearch: true, offlineSearchKind: 'Lunr.js 静态索引' }
  }
  if (relFiles.some((f) => /search_index\.[a-z]+\.js$/i.test(f))) {
    return { hasOfflineSearch: true, offlineSearchKind: 'Zola 内置索引' }
  }
  if (relFiles.some((f) => f.includes('search-index') || (f.startsWith('static/') && f.includes('search')))) {
    return { hasOfflineSearch: true, offlineSearchKind: 'Rspress 内置静态索引' }
  }
  if (relFiles.some((f) => f.includes('localSearchIndex') || f.includes('@localSearchIndex'))) {
    return { hasOfflineSearch: true, offlineSearchKind: 'MiniSearch 本地索引' }
  }
  if (relFiles.some((f) => f.endsWith('search.min.js') || f.endsWith('plugins/search.js'))) {
    return { hasOfflineSearch: true, offlineSearchKind: '客户端全文扫描' }
  }
  return { hasOfflineSearch: false, offlineSearchKind: null }
}

function inspectDistDirectory(distAbs, site) {
  let totalFiles = 0
  let totalBytes = 0
  let htmlFiles = 0
  let htmlBytes = 0
  let jsFiles = 0
  let jsBytes = 0
  let jsGzipBytes = 0
  let cssFiles = 0
  let cssBytes = 0
  let cssGzipBytes = 0
  let otherBytes = 0
  const relFiles = []

  function walk(dirAbs, relPrefix) {
    for (const ent of fs.readdirSync(dirAbs, { withFileTypes: true })) {
      if (ent.name === '.DS_Store' || ent.name === '.nojekyll') continue
      const full = path.join(dirAbs, ent.name)
      const rel = relPrefix ? `${relPrefix}/${ent.name}` : ent.name
      if (ent.isDirectory()) {
        walk(full, rel)
      } else if (ent.isFile()) {
        const buf = fs.readFileSync(full)
        const size = buf.length
        relFiles.push(rel)
        totalFiles += 1
        totalBytes += size
        const ext = path.extname(ent.name).toLowerCase()
        if (ext === '.html') {
          htmlFiles += 1
          htmlBytes += size
        } else if (ext === '.js' || ext === '.mjs') {
          jsFiles += 1
          jsBytes += size
          jsGzipBytes += zlib.gzipSync(buf, { level: 9 }).length
        } else if (ext === '.css') {
          cssFiles += 1
          cssBytes += size
          cssGzipBytes += zlib.gzipSync(buf, { level: 9 }).length
        } else {
          otherBytes += size
        }
      }
    }
  }

  walk(distAbs, '')

  const indexHtmlPath = path.join(distAbs, 'index.html')
  const entryHtmlBytes = fs.existsSync(indexHtmlPath) ? fs.statSync(indexHtmlPath).size : 0

  const proseCandidates = [
    path.join(distAbs, '01-annotations', 'index.html'),
    path.join(distAbs, '01-annotations.html'),
    indexHtmlPath
  ]
  let proseScriptCount = 0
  for (const candidate of proseCandidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      const html = fs.readFileSync(candidate, 'utf-8')
      // Count external or inline executable script tags (exclude application/json or ld+json data blocks)
      const scriptTags = html.match(/<script\b[^>]*>/gi) || []
      proseScriptCount = scriptTags.filter(
        (tag) => !/type\s*=\s*["']application\/(ld\+)?json["']/i.test(tag)
      ).length
      break
    }
  }

  const { hasOfflineSearch, offlineSearchKind } = detectOfflineSearch(relFiles)
  const hasLlmsTxt = relFiles.some((f) => f === 'llms.txt' || f === 'llms-full.txt')

  return {
    totalFiles,
    totalBytes,
    htmlFiles,
    htmlBytes,
    jsFiles,
    jsBytes,
    jsGzipBytes,
    cssFiles,
    cssBytes,
    cssGzipBytes,
    otherBytes,
    entryHtmlBytes,
    proseScriptCount,
    hasOfflineSearch,
    offlineSearchKind,
    hasLlmsTxt,
    isRuntimeSpa: site.routeStyle === 'hash'
  }
}

const measuredAt = new Date().toISOString()
let updatedCount = 0

for (const site of config.sites) {
  if (site.isMaster) continue
  if (onlySet && !onlySet.has(site.id)) continue

  const subDir = path.join(rootDir, site.submoduleDir)
  const distAbs = path.join(rootDir, site.distDir)
  const cmd = site.buildCommand || 'npm run build'
  const jsonPath = path.join(sitesDocsDir, `${site.id}.json`)

  if (!fs.existsSync(jsonPath)) {
    console.warn(`[measure-benchmarks] Skipping ${site.id}: missing ${jsonPath}`)
    continue
  }

  const existingDoc = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  let coldBuildMs = existingDoc.benchmark?.coldBuildMs ?? 0

  if (!skipBuild) {
    for (const cacheRel of CACHE_DIRS) {
      removeIfExists(path.join(subDir, cacheRel))
    }
    removeIfExists(distAbs)

    console.log(`\n[measure-benchmarks] ⏱ Cold-building ${site.id} via: ${cmd}`)
    const t0 = performance.now()
    execSync(cmd, {
      cwd: subDir,
      stdio: 'inherit',
      env: { ...process.env }
    })
    coldBuildMs = Math.round(performance.now() - t0)
  }

  if (!fs.existsSync(distAbs)) {
    throw new Error(`[measure-benchmarks] Expected distDir ${distAbs} not found after building ${site.id}`)
  }

  const stats = inspectDistDirectory(distAbs, site)
  existingDoc.benchmark = {
    measuredAt,
    buildCommand: cmd
      .replace(/^\/home\/antigravity\/[^\s]+\/bin\//, '')
      .replace(/^\.venv\/bin\/python\s+-m\s+/, ''),
    isRuntimeSpa: stats.isRuntimeSpa,
    coldBuildMs,
    totalFiles: stats.totalFiles,
    totalBytes: stats.totalBytes,
    htmlFiles: stats.htmlFiles,
    htmlBytes: stats.htmlBytes,
    jsFiles: stats.jsFiles,
    jsBytes: stats.jsBytes,
    jsGzipBytes: stats.jsGzipBytes,
    cssFiles: stats.cssFiles,
    cssBytes: stats.cssBytes,
    cssGzipBytes: stats.cssGzipBytes,
    otherBytes: stats.otherBytes,
    entryHtmlBytes: stats.entryHtmlBytes,
    proseScriptCount: stats.proseScriptCount,
    hasOfflineSearch: stats.hasOfflineSearch,
    offlineSearchKind: stats.offlineSearchKind,
    hasLlmsTxt: stats.hasLlmsTxt
  }

  fs.writeFileSync(jsonPath, JSON.stringify(existingDoc, null, 2) + '\n', 'utf-8')
  updatedCount += 1
  console.log(
    `[measure-benchmarks] ✓ ${site.id}: ${coldBuildMs} ms | total ${(stats.totalBytes / 1024).toFixed(1)} KB (${stats.totalFiles} files) | JS gzip ${(stats.jsGzipBytes / 1024).toFixed(1)} KB | scripts=${stats.proseScriptCount}`
  )
}

console.log(`\n[measure-benchmarks] Updated benchmark telemetry in ${updatedCount} docs/sites/<id>.json files.`)
