import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const configPath = path.join(rootDir, 'sites.config.json')
const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

const IGNORED_NAMES = new Set([
  '.git',
  'node_modules',
  'dist',
  '.astro',
  'cache',
  '.temp',
  '.cache',
  'package-lock.json',
  '.DS_Store'
])

function extractSidebarOrderNote(content) {
  const match = content.match(/sidebar:\s*\n(?:\s+.*\n)*?\s+order:\s*(\d+)/)
  if (match) return `order: ${match[1]}`
  return null
}

function computeContentRoute(site, innerRel) {
  const base = site.basePath.endsWith('/') ? site.basePath : `${site.basePath}/`
  const rewrites = site.rewrites || {}
  const effectiveRel = rewrites[innerRel] || innerRel
  const style = site.routeStyle || 'clean'
  const withoutExt = effectiveRel.replace(/\.(md|mdx)$/, '')

  if (style === 'hash') {
    if (withoutExt === 'README' || withoutExt === 'index') return `${base}#/`
    if (withoutExt.endsWith('/README') || withoutExt.endsWith('/index')) {
      return `${base}#/${withoutExt.replace(/\/(README|index)$/, '')}/`
    }
    return `${base}#/${withoutExt}`
  }

  if (style === 'html') {
    if (withoutExt === 'README' || withoutExt === 'index') return base
    if (withoutExt.endsWith('/README') || withoutExt.endsWith('/index')) {
      return `${base}${withoutExt.replace(/\/(README|index)$/, '')}/`
    }
    return `${base}${withoutExt}.html`
  }

  // cleanUrls
  if (withoutExt === 'index') return base
  if (withoutExt.endsWith('/index')) {
    return `${base}${withoutExt.slice(0, -'index'.length)}`
  }
  return `${base}${withoutExt}`
}

function scanSubmoduleTree(submoduleAbs, site) {
  const nodes = []
  const contentPrefix = site.directoryProfile?.contentPrefix || ''
  const excludedSet = new Set(site.directoryProfile?.excludedContentFiles || [])
  const configSet = new Set(site.configFiles || [])
  const rewrites = site.rewrites || {}

  function walk(currentRel, depth) {
    const absDir = path.join(submoduleAbs, currentRel)
    const entries = fs.readdirSync(absDir, { withFileTypes: true }).filter((ent) => {
      if (IGNORED_NAMES.has(ent.name)) return false
      const rel = currentRel ? `${currentRel}/${ent.name}` : ent.name
      if (
        rel === '.vitepress/dist' ||
        rel === '.vitepress/cache' ||
        rel === 'docs/.vuepress/dist' ||
        rel === 'docs/.vuepress/.temp' ||
        rel === 'docs/.vuepress/.cache' ||
        rel === 'docs/.vuepress/public/vendor'
      ) {
        return false
      }
      return true
    })

    entries.sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
      return a.name.localeCompare(b.name, 'en')
    })

    for (const ent of entries) {
      const relPath = currentRel ? `${currentRel}/${ent.name}` : ent.name
      if (ent.isDirectory()) {
        let dirNote = null
        if (contentPrefix && contentPrefix.replace(/\/$/, '') === relPath) {
          dirNote = '内容文档根 (Content Root)'
        } else if (relPath === 'docs/public') {
          dirNote = '受 srcDir 影响迁入 docs/ 内'
        } else if (relPath.endsWith('/components') && site.id === 'vuepress-v1') {
          dirNote = 'VuePress v1 自动全局注册目录'
        } else if (relPath.endsWith('/nested')) {
          if (site.id === 'astro7-starlight') dirNote = 'autogenerate 直接暴露英文分组名 nested'
          else if (site.routeStyle === 'hash') dirNote = '由 _sidebar.md 控制分组'
          else dirNote = '需在配置文件手写注册子分组'
        }
        nodes.push({
          name: ent.name,
          relPath,
          depth,
          kind: 'dir',
          category: relPath.startsWith('.github') ? 'infra' : 'folder',
          route: null,
          note: dirNote
        })
        walk(relPath, depth + 1)
      } else {
        let category = 'infra'
        let route = null
        let note = null

        const isMarkdown = ent.name.endsWith('.md') || ent.name.endsWith('.mdx')
        if (excludedSet.has(relPath)) {
          category = 'excluded'
          note = '仓库说明 (靠 srcExclude 排除编译)'
        } else if (ent.name === '_sidebar.md') {
          category = 'excluded'
          note = '下划线控制文件 (无 .nojekyll 会 404)'
        } else if (contentPrefix && relPath === 'README.md') {
          category = 'infra'
          note = '仓库根说明 (天然与 docs/ 隔离)'
        } else if (configSet.has(relPath) || ent.name === 'package.json') {
          category =
            relPath.includes('plugins/') ||
            relPath.includes('components/') ||
            relPath.includes('theme/')
              ? 'plugin'
              : 'config'
        } else if (isMarkdown && (!contentPrefix || relPath.startsWith(contentPrefix))) {
          category = 'content'
          const innerRel = contentPrefix ? relPath.slice(contentPrefix.length) : relPath
          route = computeContentRoute(site, innerRel)
          const fileText = fs.readFileSync(path.join(submoduleAbs, relPath), 'utf-8')
          const orderNote = extractSidebarOrderNote(fileText)
          if (rewrites[innerRel]) {
            note = '经 rewrites 抹除序号'
          } else if (orderNote) {
            note = `Frontmatter ${orderNote}`
          } else if (ent.name === 'README.md') {
            note = 'README 映射为目录首页'
          } else if (/\/\d{2}-/.test(`/${innerRel}`)) {
            note = '靠文件名前缀排序'
          }
        } else if (relPath.startsWith('src/') || relPath.startsWith('scripts/')) {
          category = 'plugin'
        }

        nodes.push({
          name: ent.name,
          relPath,
          depth,
          kind: 'file',
          category,
          route,
          note
        })
      }
    }
  }

  walk('', 0)
  return nodes
}

const enrichedSites = rawConfig.sites.map((site) => {
  const submoduleAbs = path.join(rootDir, site.submoduleDir)
  const pkgPath = path.join(submoduleAbs, 'package.json')
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const allDeps = {
    ...(pkgJson.dependencies || {}),
    ...(pkgJson.devDependencies || {})
  }

  const packages = {}
  for (const pkgName of site.trackedPackages) {
    packages[pkgName] = allDeps[pkgName] || 'N/A'
  }

  const primaryVersion = allDeps[site.primaryPackage] || 'unknown'

  const docs = {}
  for (const [chapterId, docEntry] of Object.entries(site.docs)) {
    const fileAbs = path.join(submoduleAbs, docEntry.file)
    const content = fs.readFileSync(fileAbs, 'utf-8')
    const lines = content.split('\n').length
    const bytes = Buffer.byteLength(content, 'utf-8')
    docs[chapterId] = {
      route: docEntry.route,
      file: `${site.submoduleDir}/${docEntry.file}`,
      shortFile: docEntry.file,
      content,
      lines,
      bytes
    }
  }

  const configs = site.configFiles.map((relPath) => {
    const cfgAbs = path.join(submoduleAbs, relPath)
    const content = fs.readFileSync(cfgAbs, 'utf-8')
    return {
      path: `${site.submoduleDir}/${relPath}`,
      shortPath: relPath,
      content,
      lines: content.split('\n').length
    }
  })

  const treeNodes = scanSubmoduleTree(submoduleAbs, site)

  return {
    id: site.id,
    family: site.family,
    versionSeries: site.versionSeries,
    primaryPackage: site.primaryPackage,
    primaryVersion,
    tagline: site.tagline,
    repo: site.repo,
    repoUrl: `https://github.com/${site.repo}`,
    mainBranchUrl: `https://github.com/${site.repo}/tree/main`,
    pageBranchUrl: `https://github.com/${site.repo}/tree/page`,
    basePath: site.basePath,
    submoduleDir: site.submoduleDir,
    packages,
    packageJsonRaw: JSON.stringify(
      {
        name: pkgJson.name,
        scripts: pkgJson.scripts,
        dependencies: pkgJson.dependencies,
        devDependencies: pkgJson.devDependencies
      },
      null,
      2
    ),
    directoryProfile: site.directoryProfile,
    treeNodes,
    highlights: site.highlights,
    docs,
    configs
  }
})

const outputData = {
  generatedAt: new Date().toISOString(),
  chapters: rawConfig.chapters,
  sites: enrichedSites
}

const outDir = path.join(rootDir, 'src', 'generated')
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, 'comparison-data.json')
fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2) + '\n', 'utf-8')

console.log(
  `[generate-comparison-data] Extracted ${enrichedSites.length} versioned submodules + directory trees -> ${path.relative(rootDir, outPath)}`
)
