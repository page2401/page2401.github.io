import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const ghActivityPath = path.join(rootDir, 'docs', 'sites', 'github-activity.json')
const ghActivityRaw = JSON.parse(fs.readFileSync(ghActivityPath, 'utf-8'))

const PROFILE_MAP = {
  master: {
    ecosystem: 'gfm',
    lifecycle: '2014 CommonMark / GFM 长期标准',
    isEol: false,
    upstreamKey: null,
    profileDoc: 'docs/00-dialects.md',
    profileRoute: '/master/00-dialects'
  },
  'vitepress-v1': {
    ecosystem: 'vue',
    lifecycle: '始于 2020-04 · 2022–至今主力稳定',
    isEol: false,
    upstreamKey: 'vuejs/vitepress',
    profileDoc: 'docs/sites/vitepress-v1.md',
    profileRoute: '/master/sites/vitepress-v1'
  },
  'vitepress-v2': {
    ecosystem: 'vue',
    lifecycle: '2025 启动 v2 · 2026-10 最新迭代',
    isEol: false,
    upstreamKey: 'vuejs/vitepress',
    profileDoc: 'docs/sites/vitepress-v2.md',
    profileRoute: '/master/sites/vitepress-v2'
  },
  'vuepress-v1': {
    ecosystem: 'vue',
    lifecycle: '始于 2018-04 · 2023-08 停更 EOL',
    isEol: true,
    upstreamKey: 'vuejs/vuepress',
    profileDoc: 'docs/sites/vuepress-v1.md',
    profileRoute: '/master/sites/vuepress-v1'
  },
  'vuepress-v2': {
    ecosystem: 'vue',
    lifecycle: '始于 2020-05 · core+ecosystem 双仓活跃',
    isEol: false,
    upstreamKey: 'vuepress/core',
    secondaryUpstreamKey: 'vuepress/ecosystem',
    profileDoc: 'docs/sites/vuepress-v2.md',
    profileRoute: '/master/sites/vuepress-v2'
  },
  'docsify-v4': {
    ecosystem: 'runtime',
    lifecycle: '始于 2016-11 · 2026-07 被 v5 取代淘汰',
    isEol: true,
    upstreamKey: 'docsifyjs/docsify',
    profileDoc: 'docs/sites/docsify-v4.md',
    profileRoute: '/master/sites/docsify-v4'
  },
  'docsify-v5': {
    ecosystem: 'runtime',
    lifecycle: '2026-07 正式首发 · 2025–2026 显著复苏',
    isEol: false,
    upstreamKey: 'docsifyjs/docsify',
    profileDoc: 'docs/sites/docsify-v5.md',
    profileRoute: '/master/sites/docsify-v5'
  },
  'astro7-starlight': {
    ecosystem: 'react-astro',
    lifecycle: '始于 2023-03 · 2023–至今极高频上升',
    isEol: false,
    upstreamKey: 'withastro/starlight',
    secondaryUpstreamKey: 'withastro/astro',
    profileDoc: 'docs/sites/astro7-starlight.md',
    profileRoute: '/master/sites/astro7-starlight'
  }
}

const CATALOG_SITES = [
  {
    id: 'docusaurus-v3',
    name: 'Docusaurus',
    versionNote: 'v3 (MDX 3)',
    lifecycle: '始于 2017-06 · v1/v2 已淘汰，v3 活跃',
    isEol: false,
    ecosystem: 'react-astro',
    mounted: false,
    upstreamKey: 'facebook/docusaurus',
    tagline: 'Meta 开源 React 旗舰，原生多版本文档快照（Versioning）无可替代',
    stack: 'React 18/19 + MDX 3 + Webpack / Rspack (@docusaurus/faster)',
    directoryModel: 'docs/ + 子目录 _category_.json（优雅解决自动侧栏中文分组命名，但目录散落 JSON）',
    calloutDialect: ':::note / :::tip[标题] / :::warning / :::danger；MDX 3 严格拒绝裸 < 与 {}',
    diagramAndMath: '官方 @docusaurus/theme-mermaid + remark-math / rehype-katex',
    profileDoc: 'docs/sites/docusaurus-v3.md',
    profileRoute: '/master/sites/docusaurus-v3'
  },
  {
    id: 'hugo',
    name: 'Hugo',
    versionNote: 'v0.140+ (Extended)',
    lifecycle: '始于 2013-07 · 13 年常青高频活跃',
    isEol: false,
    ecosystem: 'native',
    mounted: false,
    upstreamKey: 'gohugoio/hugo',
    tagline: 'Go 单二进制编译极速之王，千页毫秒级构建，零 node_modules 依赖',
    stack: 'Go 单二进制 + Goldmark 解析器 + Go html/template',
    directoryModel: 'content/ + _index.md (Branch Bundle) vs index.md (Leaf Bundle，一字之差极易踩坑)',
    calloutDialect: '新版支持 render-blockquote 钩子解析 GFM [!NOTE]，或使用 {{< callout >}} Shortcode',
    diagramAndMath: 'Goldmark render-codeblock-mermaid.html 渲染钩子 + passthrough 原生数学扩展',
    profileDoc: 'docs/sites/hugo.md',
    profileRoute: '/master/sites/hugo'
  },
  {
    id: 'mkdocs-material',
    name: 'MkDocs Material',
    versionNote: 'v9.x (Python)',
    lifecycle: '始于 2016-01 · v8 已停更，v9 稳定活跃',
    isEol: false,
    ecosystem: 'python-classic',
    mounted: false,
    upstreamKey: 'squidfunk/mkdocs-material',
    tagline: 'Python 科研与硬件工程文档天花板，代码行内批注与学术排版顶配',
    stack: 'Python + MkDocs + Material 主题 + pymdown-extensions',
    directoryModel: 'docs/ 纯净目录 + 根 mkdocs.yml 集中编排 nav 树（或 awesome-pages 插件）',
    calloutDialect: '独树一帜的 !!! warning "标题" + 4 空格缩进块（免闭合标签，但跨生态迁移需重写缩进）',
    diagramAndMath: 'pymdownx.superfences 原生暗色自适应 Mermaid + pymdownx.arithmatex (KaTeX/MathJax)',
    profileDoc: 'docs/sites/mkdocs-material.md',
    profileRoute: '/master/sites/mkdocs-material'
  },
  {
    id: 'rspress',
    name: 'Rspress',
    versionNote: 'v2.x (Rspack)',
    lifecycle: '始于 2023-06 · 2023–至今极高频上升',
    isEol: false,
    ecosystem: 'react-astro',
    mounted: false,
    upstreamKey: 'web-infra-dev/rspress',
    tagline: '字节跳动出品，Rust Rspack + mdx-rs 驱动的超高速 React 文档框架',
    stack: 'Rust Rspack + React + MDX RS（比传统 JS 编译快 5~10 倍）',
    directoryModel: 'docs/ + 各层级 _meta.json 声明排序与中文分组标题',
    calloutDialect: '兼容 :::tip / :::warning 容器与 GitHub > [!NOTE] 警报语法',
    diagramAndMath: '@rspress/plugin-katex + Mermaid 插件支持',
    profileDoc: 'docs/sites/rspress.md',
    profileRoute: '/master/sites/rspress'
  },
  {
    id: 'nextra',
    name: 'Nextra',
    versionNote: 'v3 / v4 (Next.js)',
    lifecycle: '始于 2020-06 · 2021–2025 高速，2026 趋缓',
    isEol: false,
    ecosystem: 'react-astro',
    mounted: false,
    upstreamKey: 'shuding/nextra',
    tagline: 'Vercel 生态基于 Next.js App Router 的全栈一体化文档方案',
    stack: 'Next.js + React Server Components + MDX',
    directoryModel: 'app/ 或 pages/ + _meta.js / _meta.ts 编程式目录导航（紧耦合 Next.js 路由演进）',
    calloutDialect: '内置 <Callout> MDX 组件与 GFM > [!NOTE] 原生转换',
    diagramAndMath: '内置 KaTeX 数学公式开关与构建期/客户端 Mermaid 支持',
    profileDoc: 'docs/sites/nextra.md',
    profileRoute: '/master/sites/nextra'
  },
  {
    id: 'zola',
    name: 'Zola',
    versionNote: 'v0.19+ (Rust)',
    lifecycle: '始于 2016-12 · 2017–至今稳步活跃',
    isEol: false,
    ecosystem: 'native',
    mounted: false,
    upstreamKey: 'getzola/zola',
    tagline: 'Rust 单二进制全能静态生成器，采用人性化类 Jinja2 (Tera) 模板',
    stack: 'Rust 单二进制（内置 Sass、代码高亮与搜索索引，零外部依赖）',
    directoryModel: 'content/ + _index.md 分支章节模型（与 Hugo 类似但配置收拢于 config.toml）',
    calloutDialect: 'Tera Shortcode 语法：{% callout(type="warning") %} ... {% end %}',
    diagramAndMath: '通过 Shortcode 或前端脚本注入 KaTeX 与 Mermaid',
    profileDoc: 'docs/sites/zola.md',
    profileRoute: '/master/sites/zola'
  },
  {
    id: 'mdbook',
    name: 'mdBook',
    versionNote: 'v0.4+ (Rust)',
    lifecycle: '始于 2015-07 · Rust 官方长期活跃',
    isEol: false,
    ecosystem: 'native',
    mounted: false,
    upstreamKey: 'rust-lang/mdBook',
    tagline: '《Rust 程序设计语言》同款引擎，专为线性阅读技术电子书而生',
    stack: 'Rust 单二进制 + pulldown-cmark',
    directoryModel: 'src/SUMMARY.md 单文件列表驱动整本书目录（甚至自动创建缺失的章节 .md 文件！）',
    calloutDialect: '新版支持 GFM > [!NOTE] 警报块，其余依赖 HTML 或独立预处理器二进制',
    diagramAndMath: 'book.toml 原生内置 mathjax-support = true；Mermaid 需 mdbook-mermaid 预处理器',
    profileDoc: 'docs/sites/mdbook.md',
    profileRoute: '/master/sites/mdbook'
  },
  {
    id: 'hexo',
    name: 'Hexo',
    versionNote: 'v7.x (Node.js)',
    lifecycle: '始于 2012-09 · 2013–2020 黄金期，现低频维护',
    isEol: true,
    ecosystem: 'python-classic',
    mounted: false,
    upstreamKey: 'hexojs/hexo',
    tagline: '中文独立技术博客启蒙神器，拥有极其丰富的个性化博客主题生态',
    stack: 'Node.js + EJS / Nunjucks / Pug 模板引擎',
    directoryModel: 'source/_posts/ 扁平时间线归档模型（长于博客流，弱于多级树状产品文档）',
    calloutDialect: '专有 Tag Plugins 语法：{% note warning %} ... {% endnote %}（跨平台不通用）',
    diagramAndMath: '依赖 hexo-math / hexo-filter-mathjax 与主题内置 Mermaid 开关',
    profileDoc: 'docs/sites/hexo.md',
    profileRoute: '/master/sites/hexo'
  },
  {
    id: 'jekyll',
    name: 'Jekyll',
    versionNote: 'v4.x (Ruby)',
    lifecycle: '始于 2008-10 · 2009–2017 黄金期，文档站已退场',
    isEol: true,
    ecosystem: 'python-classic',
    mounted: false,
    upstreamKey: 'jekyll/jekyll',
    tagline: '静态生成器开山鼻祖与 GitHub Pages 默认后台引擎（.nojekyll 的由来）',
    stack: 'Ruby + Kramdown 解析器 + Liquid 模板',
    directoryModel: '_posts/、_layouts/ 下划线系统目录约定（导致其它框架在 Pages 必须加 .nojekyll）',
    calloutDialect: 'Kramdown 属性列表 {: .warning } 或 Liquid {% include note.html %}',
    diagramAndMath: 'Kramdown MathJax 输出 + 客户端脚本加载 Mermaid',
    profileDoc: 'docs/sites/jekyll.md',
    profileRoute: '/master/sites/jekyll'
  }
]

function summarizeRepoStats(primaryKey, secondaryKey) {
  if (!primaryKey || !ghActivityRaw.repositories[primaryKey]) return null
  const r1 = ghActivityRaw.repositories[primaryKey]
  const r2 = secondaryKey ? ghActivityRaw.repositories[secondaryKey] : null
  const commits2026 = (r1.yearlyCommits['2026'] ?? 0) + (r2?.yearlyCommits['2026'] ?? 0)
  const totalCommits = r1.totalCommits + (r2?.totalCommits ?? 0)
  return {
    upstreamRepo: r2 ? `${r1.repo} + ${r2.repo}` : r1.repo,
    upstreamUrl: r1.url,
    stars: r1.stars,
    totalCommits,
    commits2026
  }
}

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
      if (site.isMaster && depth === 0 && ent.name !== 'docs') return false
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
        } else if (relPath === 'docs/sites') {
          dirNote = '与 sites/<id> 1:1 对齐的站点与活跃度档案库'
        } else if (relPath === 'docs/public') {
          dirNote = '受 srcDir 影响迁入 docs/ 内'
        } else if (relPath.endsWith('/components') && site.id === 'vuepress-v1') {
          dirNote = 'VuePress v1 自动全局注册目录'
        } else if (relPath.endsWith('/nested')) {
          if (site.id === 'astro7-starlight') dirNote = 'autogenerate 直接暴露英文分组名 nested'
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
          note = '仓库说明 (靠 srcExclude 排除编译)'
        } else if (ent.name === '_sidebar.md') {
          category = 'excluded'
          note = '下划线控制文件 (无 .nojekyll 会 404)'
        } else if (relPath === 'docs/sites/github-activity.json') {
          category = 'config'
          route = '/master/sites/github-activity.json'
          note = 'GitHub API 历年提交原始快照'
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
          } else if (relPath.startsWith('docs/sites/')) {
            note = '1:1 站点与生命周期档案'
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
  const profMeta = PROFILE_MAP[site.id] || {
    ecosystem: 'vue',
    lifecycle: '',
    isEol: false,
    upstreamKey: null,
    profileDoc: 'docs/sites/index.md',
    profileRoute: '/master/sites/'
  }

  return {
    id: site.id,
    isMaster: Boolean(site.isMaster),
    ecosystem: profMeta.ecosystem,
    lifecycle: profMeta.lifecycle,
    isEol: Boolean(profMeta.isEol),
    upstreamKey: profMeta.upstreamKey,
    secondaryUpstreamKey: profMeta.secondaryUpstreamKey || null,
    profileDoc: profMeta.profileDoc,
    profileRoute: profMeta.profileRoute,
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

const siteEcosystemById = {}
const siteMountedById = {}

// Build unified 1:1 landscape rows (aligned with sites/<id> and docs/sites/<id>.md)
const landscapeRows = [
  ...enrichedSites
    .filter((s) => !s.isMaster)
    .map((s) => {
      siteEcosystemById[s.id] = s.ecosystem
      siteMountedById[s.id] = true
      const gh = summarizeRepoStats(s.upstreamKey, s.secondaryUpstreamKey)
      return {
        id: s.id,
        sitePath: `sites/${s.id}`,
        name: s.family,
        versionNote: `${s.versionSeries} (${s.primaryVersion})`,
        lifecycle: s.lifecycle,
        isEol: s.isEol,
        ecosystem: s.ecosystem,
        mounted: true,
        subsiteUrl: s.basePath,
        upstreamRepo: gh?.upstreamRepo || '',
        upstreamUrl: gh?.upstreamUrl || '',
        stars: gh?.stars || 0,
        totalCommits: gh?.totalCommits || 0,
        commits2026: gh?.commits2026 || 0,
        tagline: s.tagline,
        stack: Object.entries(s.packages)
          .map(([k, v]) => `${k}@${v}`)
          .join(' · '),
        directoryModel: `${s.highlights.dirIsolation}；${s.highlights.dirRoutingSidebar}`,
        calloutDialect: `${s.highlights.callouts}（GFM 警报：${s.highlights.gfmAlerts}）`,
        diagramAndMath: `流程图：${s.highlights.mermaid}；公式：${s.highlights.math}`,
        profileDoc: s.profileDoc,
        profileRoute: s.profileRoute
      }
    }),
  ...CATALOG_SITES.map((c) => {
    siteEcosystemById[c.id] = c.ecosystem
    siteMountedById[c.id] = false
    const gh = summarizeRepoStats(c.upstreamKey, null)
    return {
      id: c.id,
      sitePath: `sites/${c.id}`,
      name: c.name,
      versionNote: c.versionNote,
      lifecycle: c.lifecycle,
      isEol: c.isEol,
      ecosystem: c.ecosystem,
      mounted: false,
      upstreamRepo: gh?.upstreamRepo || '',
      upstreamUrl: gh?.upstreamUrl || '',
      stars: gh?.stars || 0,
      totalCommits: gh?.totalCommits || 0,
      commits2026: gh?.commits2026 || 0,
      tagline: c.tagline,
      stack: c.stack,
      directoryModel: c.directoryModel,
      calloutDialect: c.calloutDialect,
      diagramAndMath: c.diagramAndMath,
      profileDoc: c.profileDoc,
      profileRoute: c.profileRoute
    }
  })
]

const githubReposList = Object.values(ghActivityRaw.repositories).map((r) => {
  const firstSiteId = r.siteIds[0]
  const pre2016Commits = ghActivityRaw.years
    .filter((y) => y < 2016)
    .reduce((acc, y) => acc + (r.yearlyCommits[String(y)] ?? 0), 0)
  return {
    repo: r.repo,
    url: r.url,
    role: r.role,
    siteIds: r.siteIds,
    ecosystem: siteEcosystemById[firstSiteId] || 'other',
    mounted: r.siteIds.some((id) => Boolean(siteMountedById[id])),
    createdAt: r.createdAt.slice(0, 10),
    createdYear: r.createdYear,
    pushedAt: r.pushedAt.slice(0, 10),
    stars: r.stars,
    totalCommits: r.totalCommits,
    peakYear: r.peakYear,
    peakCommits: r.peakCommits,
    pre2016Commits,
    yearlyCommits: r.yearlyCommits
  }
})

const outputData = {
  generatedAt: new Date().toISOString(),
  chapters: rawConfig.chapters,
  sites: enrichedSites,
  landscapeRows,
  githubActivity: {
    fetchedAt: ghActivityRaw.fetchedAt.slice(0, 10),
    displayYears: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
    repos: githubReposList
  }
}

const outDir = path.join(rootDir, 'src', 'generated')
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, 'comparison-data.json')
fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2) + '\n', 'utf-8')

console.log(
  `[generate-comparison-data] Extracted ${enrichedSites.length} workbench sites + ${landscapeRows.length} 1:1 site rows + ${githubReposList.length} GitHub API repo histories -> ${path.relative(rootDir, outPath)}`
)
