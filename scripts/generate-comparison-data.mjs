import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const sitesDocsDir = path.join(rootDir, 'docs', 'sites')

const siteJsonDocs = fs
  .readdirSync(sitesDocsDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(sitesDocsDir, f), 'utf-8')))
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

const siteJsonById = Object.fromEntries(siteJsonDocs.map((d) => [d.id, d]))

const configPath = path.join(rootDir, 'sites.config.json')
const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

const IGNORED_NAMES = new Set([
  '.git',
  'node_modules',
  '.venv',
  '__pycache__',
  '.astro',
  '.docusaurus',
  'doc_build',
  '.next',
  '.source',
  '.nuxt',
  '.output',
  '.data',
  '.quartz-cache',
  '_site',
  '_build',
  'cache',
  '.temp',
  '.cache',
  'package-lock.json',
  '.DS_Store',
  '.hugo_build.lock'
])

// Polyglot manifest reader supporting npm (package.json), python (requirements.txt), ruby (Gemfile), and binary (ssg-lock.json)
function readSubmoduleManifest(submoduleAbs, site) {
  const manifestType = site.manifestType || 'npm'

  if (manifestType === 'python') {
    const reqPath = path.join(submoduleAbs, 'requirements.txt')
    const raw = fs.readFileSync(reqPath, 'utf-8')
    const deps = {}
    for (const line of raw.split('\n')) {
      const clean = line.trim()
      if (!clean || clean.startsWith('#')) continue
      const m = clean.match(/^([a-zA-Z0-9_.-]+)==([^\s#]+)/)
      if (m) deps[m[1]] = m[2]
    }
    return {
      allDeps: deps,
      manifestShortPath: 'requirements.txt',
      manifestRaw: raw
    }
  }

  if (manifestType === 'binary') {
    const lockPath = path.join(submoduleAbs, 'ssg-lock.json')
    const raw = fs.readFileSync(lockPath, 'utf-8')
    const parsed = JSON.parse(raw)
    return {
      allDeps: parsed.packages || {},
      manifestShortPath: 'ssg-lock.json',
      manifestRaw: JSON.stringify(parsed, null, 2)
    }
  }

  if (manifestType === 'ruby') {
    const gemPath = path.join(submoduleAbs, 'Gemfile')
    const raw = fs.readFileSync(gemPath, 'utf-8')
    const deps = {}
    for (const line of raw.split('\n')) {
      const m = line.match(/gem\s+['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/)
      if (m) deps[m[1]] = m[2].replace(/^~\>\s*|^=\s*/, '')
    }
    return {
      allDeps: deps,
      manifestShortPath: 'Gemfile',
      manifestRaw: raw
    }
  }

  const pkgPath = path.join(submoduleAbs, 'package.json')
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const allDeps = {
    ...(pkgJson.name && pkgJson.version ? { [pkgJson.name]: pkgJson.version } : {}),
    ...(pkgJson.dependencies || {}),
    ...(pkgJson.devDependencies || {})
  }
  return {
    allDeps,
    manifestShortPath: 'package.json',
    manifestRaw: JSON.stringify(
      {
        name: pkgJson.name,
        scripts: pkgJson.scripts,
        dependencies: pkgJson.dependencies,
        devDependencies: pkgJson.devDependencies
      },
      null,
      2
    )
  }
}

function extractSidebarOrderNote(content) {
  const match = content.match(/sidebar:\s*\n(?:\s+.*\n)*?\s+order:\s*(\d+)/)
  if (match) return `order: ${match[1]}`
  const posMatch = content.match(/^sidebar_position:\s*(\d+)/m)
  if (posMatch) return `sidebar_position: ${posMatch[1]}`
  const weightMatch = content.match(/^weight\s*[:=]\s*(\d+)/m)
  if (weightMatch) return `weight: ${weightMatch[1]}`
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

  if (withoutExt === 'index' || withoutExt === '_index') return base
  if (withoutExt.endsWith('/index') || withoutExt.endsWith('/_index')) {
    return `${base}${withoutExt.replace(/\/(_?index)$/, '')}/`
  }
  return `${base}${withoutExt}`
}

function scanSubmoduleTree(submoduleAbs, site) {
  const nodes = []
  const contentPrefix = site.directoryProfile?.contentPrefix || ''
  const excludedSet = new Set(site.directoryProfile?.excludedContentFiles || [])
  const configSet = new Set(site.configFiles || [])
  const rewrites = site.rewrites || {}

  const subPrefix = site.submoduleDir === '.' ? '' : `${site.submoduleDir}/`
  const relDistDir =
    subPrefix && site.distDir.startsWith(subPrefix)
      ? site.distDir.slice(subPrefix.length).replace(/\/$/, '')
      : site.distDir.replace(/\/$/, '')

  function walk(currentRel, depth) {
    const absDir = path.join(submoduleAbs, currentRel)
    const entries = fs.readdirSync(absDir, { withFileTypes: true }).filter((ent) => {
      if (IGNORED_NAMES.has(ent.name)) return false
      const rel = currentRel ? `${currentRel}/${ent.name}` : ent.name
      if (site.isMaster && depth === 0 && ent.name !== 'docs') return false
      if (rel === relDistDir || (!site.isMaster && rel === 'dist')) return false
      if (
        rel === '.vitepress/dist' ||
        rel === '.vitepress/cache' ||
        rel === 'docs/.vuepress/dist' ||
        rel === 'docs/.vuepress/.temp' ||
        rel === 'docs/.vuepress/.cache' ||
        rel === 'docs/.vuepress/public/vendor' ||
        rel.endsWith('/vendor') ||
        rel.endsWith('/fonts') ||
        rel === 'static/katex' ||
        ent.name.endsWith('.woff') ||
        ent.name.endsWith('.woff2') ||
        ent.name.endsWith('.ttf') ||
        rel === '.bin'
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
        } else if (relPath === 'docs/sites') {
          dirNote = '与 sites/<id> 1:1 对齐的 <id>.md + <id>.json 档案库'
        } else if (relPath === 'docs/public') {
          dirNote = '受 srcDir 影响迁入 docs/ 内'
        } else if (relPath.endsWith('/components') && site.id === 'vuepress-v1') {
          dirNote = 'VuePress v1 自动全局注册目录'
        } else if (relPath.endsWith('/nested')) {
          if (site.id === 'astro7-starlight') dirNote = 'autogenerate 直接暴露英文分组名 nested'
          else if (site.id === 'docusaurus-v3') dirNote = '靠 _category_.json 声明中文分组名'
          else if (site.id === 'rspress') dirNote = '靠 _meta.json 声明排序与中文分组名'
          else if (site.id === 'hugo' || site.id === 'zola') dirNote = '需含 _index.md 才能作为分支章节'
          else if (site.id === 'mdbook') dirNote = '由 SUMMARY.md 缩进控制层级'
          else if (site.routeStyle === 'hash') dirNote = '由 _sidebar.md 控制分组'
          else if (site.isMaster) dirNote = '纯自然子目录'
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
          note = '仓库说明 (靠排除规则屏蔽编译)'
        } else if (ent.name === '_sidebar.md') {
          category = 'excluded'
          note = '下划线控制文件 (无 .nojekyll 会 404)'
        } else if (ent.name === 'SUMMARY.md') {
          category = 'config'
          note = 'mdBook 全书唯一目录与路由索引'
        } else if (
          ent.name === '_category_.json' ||
          ent.name === '_meta.json' ||
          ent.name === '_meta.js' ||
          ent.name === '_meta.ts' ||
          ent.name === 'meta.json' ||
          ent.name === '.navigation.yml' ||
          ent.name.endsWith('.11tydata.json')
        ) {
          category = 'config'
          note = '目录级侧边栏分组、排序或数据级联元数据'
        } else if (relPath.startsWith('docs/sites/') && ent.name.endsWith('.json')) {
          category = 'config'
          route = `/master/sites/${ent.name}`
          note = '独立元数据 (官网/Tags/Libs) + github API 节点'
        } else if (contentPrefix && relPath === 'README.md') {
          category = 'infra'
          note = '仓库根说明 (天然与内容目录隔离)'
        } else if (
          configSet.has(relPath) ||
          ent.name === 'package.json' ||
          ent.name === 'requirements.txt' ||
          ent.name === 'ssg-lock.json' ||
          ent.name === 'Gemfile'
        ) {
          category =
            relPath.includes('plugins/') ||
            relPath.includes('components/') ||
            relPath.includes('theme/') ||
            relPath.includes('layouts/') ||
            relPath.includes('templates/')
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
          } else if (ent.name === '_index.md') {
            note = 'Branch Bundle 分支章节入口'
          } else if (orderNote) {
            note = `Frontmatter ${orderNote}`
          } else if (relPath.startsWith('docs/sites/')) {
            note = '1:1 站点与生命周期档案'
          } else if (ent.name === 'README.md') {
            note = 'README 映射为目录首页'
          } else if (/\/\d{2}-/.test(`/${innerRel}`)) {
            note = '靠文件名前缀排序'
          }
        } else if (
          relPath.startsWith('src/') ||
          relPath.startsWith('scripts/') ||
          relPath.startsWith('layouts/') ||
          relPath.startsWith('templates/')
        ) {
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
  const manifestInfo = readSubmoduleManifest(submoduleAbs, site)
  const allDeps = manifestInfo.allDeps

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
    const displayFile =
      site.submoduleDir === '.' ? docEntry.file : `${site.submoduleDir}/${docEntry.file}`
    docs[chapterId] = {
      route: docEntry.route,
      file: displayFile,
      shortFile: docEntry.file,
      content,
      lines,
      bytes
    }
  }

  const configs = site.configFiles.map((relPath) => {
    const cfgAbs = path.join(submoduleAbs, relPath)
    const content = fs.readFileSync(cfgAbs, 'utf-8')
    const displayPath = site.submoduleDir === '.' ? relPath : `${site.submoduleDir}/${relPath}`
    return {
      path: displayPath,
      shortPath: relPath,
      content,
      lines: content.split('\n').length
    }
  })

  const treeNodes = scanSubmoduleTree(submoduleAbs, site)
  const metaJson = siteJsonById[site.id]

  return {
    id: site.id,
    isMaster: Boolean(site.isMaster),
    ecosystem: metaJson ? metaJson.ecosystem : 'gfm',
    lifecycle: metaJson ? metaJson.lifecycle.summary : '2014 CommonMark / GFM 长期标准',
    isEol: Boolean(metaJson?.lifecycle?.isEol),
    profileDoc: site.isMaster ? 'docs/00-dialects.md' : `docs/sites/${site.id}.md`,
    profileRoute: site.isMaster ? '/master/00-dialects' : `/master/sites/${site.id}`,
    jsonRoute: site.isMaster ? null : `/master/sites/${site.id}.json`,
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
    packageJsonRaw: manifestInfo.manifestRaw,
    manifestShortPath: manifestInfo.manifestShortPath,
    directoryProfile: site.directoryProfile,
    treeNodes,
    highlights: site.highlights,
    benchmark: metaJson?.benchmark || null,
    docs,
    configs
  }
})

const enrichedById = Object.fromEntries(enrichedSites.map((s) => [s.id, s]))

// Build landscape rows directly from independent docs/sites/<id>.json files
const landscapeRows = siteJsonDocs.map((doc) => {
  const gh = doc.github
  const companions = gh.companionRepos || []
  const combinedYearly = {}
  for (const [yr, cnt] of Object.entries(gh.yearlyCommits || {})) {
    combinedYearly[yr] =
      cnt + companions.reduce((acc, c) => acc + (c.yearlyCommits?.[yr] ?? 0), 0)
  }

  const commits2026 = combinedYearly['2026'] ?? 0
  const totalCommits =
    gh.totalCommits + companions.reduce((acc, c) => acc + (c.totalCommits ?? 0), 0)

  const mountedSite = doc.mounted ? enrichedById[doc.id] : null
  const latestRel =
    gh.latestRelease?.tagName || gh.recentReleases?.[0]?.tagName || null

  return {
    id: doc.id,
    order: doc.order ?? 99,
    sitePath: doc.sitePath,
    name: doc.name,
    versionNote: mountedSite ? `${mountedSite.versionSeries} (${mountedSite.primaryVersion})` : doc.versionNote,
    lifecycle: doc.lifecycle.summary,
    lifecycleDetail: doc.lifecycle,
    isEol: Boolean(doc.lifecycle.isEol),
    ecosystem: doc.ecosystem,
    mounted: Boolean(doc.mounted),
    subsiteUrl: mountedSite ? mountedSite.basePath : undefined,
    subsiteRepoUrl: doc.subsiteRepoUrl || undefined,
    websiteUrl: doc.websiteUrl,
    githubUrl: doc.githubUrl,
    companionGithubUrls: doc.companionGithubUrls || [],
    packageUrl: doc.packageUrl,
    tags: doc.tags || [],
    libs: doc.libs,
    coreLibs: doc.libs?.coreLibs || [],
    markdownEngine: doc.libs?.markdownEngine || '',
    upstreamRepo: companions.length > 0 ? `${gh.repo} + ${companions.map((c) => c.repo).join(' + ')}` : gh.repo,
    createdYear: gh.createdYear,
    createdAt: gh.createdAt.slice(0, 10),
    pushedAt: gh.pushedAt.slice(0, 10),
    primaryLanguage: gh.primaryLanguage || '',
    license: gh.license || 'MIT',
    stars: gh.stars,
    forks: gh.forks || 0,
    openIssues: gh.openIssues || 0,
    latestReleaseTag: latestRel,
    totalCommits,
    commits2026,
    yearlyCommits: combinedYearly,
    benchmark: doc.benchmark || null,
    tagline: mountedSite ? mountedSite.tagline : doc.matrix.tagline,
    stack: mountedSite
      ? Object.entries(mountedSite.packages)
          .map(([k, v]) => `${k}@${v}`)
          .join(' · ')
      : doc.matrix.stack,
    directoryModel: mountedSite
      ? `${mountedSite.highlights.dirIsolation}；${mountedSite.highlights.dirRoutingSidebar}`
      : doc.matrix.directoryModel,
    calloutDialect: mountedSite
      ? `${mountedSite.highlights.callouts}（GFM 警报：${mountedSite.highlights.gfmAlerts}）`
      : doc.matrix.calloutDialect,
    diagramAndMath: mountedSite
      ? `流程图：${mountedSite.highlights.mermaid}；公式：${mountedSite.highlights.math}`
      : doc.matrix.diagramAndMath,
    profileDoc: `docs/sites/${doc.id}.md`,
    profileRoute: `/master/sites/${doc.id}`,
    jsonRoute: `/master/sites/${doc.id}.json`
  }
})

// Aggregate unique GitHub repos from independent docs/sites/<id>.json files
const uniqueRepoMap = new Map()
for (const doc of siteJsonDocs) {
  const allRepoNodes = [doc.github, ...(doc.github.companionRepos || [])]
  for (const r of allRepoNodes) {
    if (!uniqueRepoMap.has(r.repo)) {
      const years = Object.keys(r.yearlyCommits).map(Number)
      const pre2016Commits = years
        .filter((y) => y < 2016)
        .reduce((acc, y) => acc + (r.yearlyCommits[String(y)] ?? 0), 0)
      uniqueRepoMap.set(r.repo, {
        repo: r.repo,
        url: r.url,
        role: r.role || '',
        siteIds: [doc.id],
        ecosystem: doc.ecosystem,
        mounted: Boolean(doc.mounted),
        createdAt: r.createdAt.slice(0, 10),
        createdYear: r.createdYear,
        pushedAt: r.pushedAt.slice(0, 10),
        stars: r.stars,
        totalCommits: r.totalCommits,
        peakYear: r.peakYear,
        peakCommits: r.peakCommits,
        pre2016Commits,
        yearlyCommits: r.yearlyCommits
      })
    } else {
      const entry = uniqueRepoMap.get(r.repo)
      if (!entry.siteIds.includes(doc.id)) entry.siteIds.push(doc.id)
      if (doc.mounted) entry.mounted = true
    }
  }
}

const githubReposList = Array.from(uniqueRepoMap.values())

const outputData = {
  generatedAt: new Date().toISOString(),
  chapters: rawConfig.chapters,
  sites: enrichedSites,
  landscapeRows,
  githubActivity: {
    fetchedAt: siteJsonDocs[0]?.github?.fetchedAt?.slice(0, 10) || '',
    displayYears: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
    repos: githubReposList
  }
}

const outDir = path.join(rootDir, 'src', 'generated')
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, 'comparison-data.json')
fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2) + '\n', 'utf-8')

console.log(
  `[generate-comparison-data] Loaded ${enrichedSites.length} workbench sites + ${siteJsonDocs.length} independent docs/sites/<id>.json files -> ${path.relative(rootDir, outPath)}`
)
