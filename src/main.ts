import './styles/main.css'
import rawDataset from './generated/comparison-data.json'
import type {
  ComparisonDataset,
  FocusedPane,
  SiteEntry,
  ViewportPreset,
  WorkbenchMode
} from './types'
import { computeDiffLineFlags, escapeHtml, renderCodeTableHtml } from './components/source-diff'

const dataset = rawDataset as ComparisonDataset

interface AppState {
  leftSiteId: string
  rightSiteId: string
  chapterId: string
  mode: WorkbenchMode
  viewport: ViewportPreset
  focus: FocusedPane
  leftConfigIndex: number
  rightConfigIndex: number
  highlightDiff: boolean
  customLeftUrl: string | null
  customRightUrl: string | null
}

function getSiteById(id: string): SiteEntry {
  return dataset.sites.find((s) => s.id === id) || dataset.sites[0]
}

function loadInitialState(): AppState {
  const params = new URLSearchParams(window.location.search)
  const defaultLeft = dataset.sites[0]?.id || 'vitepress-v1'
  const defaultRight = dataset.sites[1]?.id || defaultLeft

  const leftParam = params.get('left')
  const rightParam = params.get('right')
  const docParam = params.get('doc')
  const modeParam = params.get('mode') as WorkbenchMode | null

  return {
    leftSiteId: dataset.sites.some((s) => s.id === leftParam) ? leftParam! : defaultLeft,
    rightSiteId: dataset.sites.some((s) => s.id === rightParam) ? rightParam! : defaultRight,
    chapterId: dataset.chapters.some((c) => c.id === docParam) ? docParam! : '01-annotations',
    mode:
      modeParam && ['render', 'tree', 'source', 'config'].includes(modeParam)
        ? modeParam
        : 'render',
    viewport: 'fluid',
    focus: 'both',
    leftConfigIndex: 0,
    rightConfigIndex: 0,
    highlightDiff: true,
    customLeftUrl: null,
    customRightUrl: null
  }
}

const state: AppState = loadInitialState()

function syncUrlState(): void {
  const params = new URLSearchParams()
  params.set('left', state.leftSiteId)
  params.set('right', state.rightSiteId)
  params.set('doc', state.chapterId)
  params.set('mode', state.mode)
  const nextUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
  window.history.replaceState(null, '', nextUrl)
}

function buildSubsiteRouteUrl(site: SiteEntry, chapterId: string): string {
  const doc = site.docs[chapterId]
  const base = site.basePath.endsWith('/') ? site.basePath : `${site.basePath}/`
  if (!doc || !doc.route) return base
  return `${base}${doc.route.replace(/^\/+/, '')}`
}

function syncIframeThemes(): void {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  document.querySelectorAll<HTMLIFrameElement>('.iframe-stage').forEach((frame) => {
    try {
      const doc = frame.contentDocument
      if (!doc || !doc.documentElement) return
      doc.documentElement.classList.toggle('dark', isDark)
      doc.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    } catch {
      // Ignore cross-origin frame access if external URL is ever configured
    }
  })
}

function toggleTheme(): void {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('page2401-theme', next)
  localStorage.setItem('vitepress-theme-appearance', next)
  localStorage.setItem('starlight-theme', next)
  updateThemeButtonLabel()
  syncIframeThemes()
}

function updateThemeButtonLabel(): void {
  const btn = document.getElementById('theme-toggle-btn')
  if (!btn) return
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  btn.textContent = isDark ? '☀ 浅色模式' : '☾ 深色模式'
}

function renderSubmoduleCards(): string {
  return dataset.sites
    .map((site, idx) => {
      const accent = idx % 2 === 0 ? 'teal' : 'copper'
      const pkgChips = Object.entries(site.packages)
        .map(
          ([name, ver]) =>
            `<span class="pkg-chip mono">${escapeHtml(name)}@<strong>${escapeHtml(ver)}</strong></span>`
        )
        .join('')

      return `
        <article class="site-card" data-accent="${accent}" id="submodule-card-${escapeHtml(site.id)}">
          <div class="site-card-top">
            <div>
              <div class="site-card-name">
                <span>${escapeHtml(site.family)}</span>
                <span class="series-tag mono">${escapeHtml(site.versionSeries)} · ${escapeHtml(site.primaryVersion)}</span>
              </div>
              <p class="site-card-tagline">${escapeHtml(site.tagline)}</p>
            </div>
            <a class="open-subsite-btn mono" href="${escapeHtml(site.basePath)}" target="_blank" rel="noopener">
              ${escapeHtml(site.basePath)} ↗
            </a>
          </div>
          <div class="pkg-list">${pkgChips}</div>
          <div class="site-card-links">
            <div class="branch-links mono">
              <a href="${escapeHtml(site.repoUrl)}" target="_blank" rel="noopener">${escapeHtml(site.repo)}</a>
              <span>·</span>
              <a href="${escapeHtml(site.mainBranchUrl)}" target="_blank" rel="noopener">main (源码)</a>
              <span>·</span>
              <a href="${escapeHtml(site.pageBranchUrl)}" target="_blank" rel="noopener">page (产物)</a>
            </div>
            <span class="mono" style="color: var(--text-muted); font-size: 0.74rem;">${escapeHtml(site.submoduleDir)}</span>
          </div>
        </article>
      `
    })
    .join('')
}

function renderMatrixRows(): string {
  const rows: Array<{ label: string; key: keyof SiteEntry['highlights'] | 'versions' }> = [
    { label: '核心精确锁定版本', key: 'versions' },
    { label: '目录层级与工程隔离度', key: 'dirIsolation' },
    { label: '多级目录排序与侧边栏维护', key: 'dirRoutingSidebar' },
    { label: 'Frontmatter 校验机制', key: 'frontmatter' },
    { label: '提示块 (Callouts) 语法', key: 'callouts' },
    { label: '可折叠详情块语法', key: 'details' },
    { label: 'GitHub > [!NOTE] 兼容性', key: 'gfmAlerts' },
    { label: 'Mermaid 流程图接入与版本边界', key: 'mermaid' },
    { label: 'LaTeX 公式引擎与编译产物', key: 'math' },
    { label: '构建产物与 Pages 托管要点', key: 'buildArtifact' }
  ]

  return rows
    .map((row) => {
      const cells = dataset.sites
        .map((site) => {
          if (row.key === 'versions') {
            return `<td class="mono" style="font-size: 0.79rem;">${Object.entries(site.packages)
              .map(([k, v]) => `${escapeHtml(k)}@${escapeHtml(v)}`)
              .join('<br/>')}</td>`
          }
          return `<td>${escapeHtml(site.highlights[row.key])}</td>`
        })
        .join('')
      return `<tr><td class="dim-cell">${escapeHtml(row.label)}</td>${cells}</tr>`
    })
    .join('')
}

function renderTreeInspectorHtml(side: 'left' | 'right', site: SiteEntry): string {
  const prof = site.directoryProfile
  const prosHtml = prof.pros.map((p) => `<li>${escapeHtml(p)}</li>`).join('')
  const consHtml = prof.cons.map((c) => `<li>${escapeHtml(c)}</li>`).join('')

  const treeRowsHtml = site.treeNodes
    .map((node) => {
      const indentPx = 12 + node.depth * 18
      const icon =
        node.kind === 'dir'
          ? '▸'
          : node.category === 'content'
            ? '📄'
            : node.category === 'excluded'
              ? '⊘'
              : node.category === 'config'
                ? '⚙'
                : '·'

      const badges: string[] = []
      if (node.note) {
        const isWarn =
          node.category === 'excluded' ||
          node.note.includes('暴露') ||
          node.note.includes('手写')
        badges.push(
          `<span class="tree-pill${isWarn ? ' warn' : ''} mono">${escapeHtml(node.note)}</span>`
        )
      }
      if (node.route) {
        const baseTrimmed = site.basePath.replace(/\/$/, '')
        const shortRoute =
          baseTrimmed && node.route.startsWith(baseTrimmed)
            ? node.route.slice(baseTrimmed.length) || '/'
            : node.route
        badges.push(
          `<span class="tree-pill route mono" title="点击在实测分屏中打开 ${escapeHtml(node.route)}">→ ${escapeHtml(shortRoute)}</span>`
        )
      }

      const clickableAttr = node.route
        ? ` data-tree-route="${escapeHtml(node.route)}" data-tree-side="${side}"`
        : ''

      return `
        <div class="tree-row kind-${node.kind} cat-${node.category}${node.route ? ' is-clickable' : ''}" style="padding-left:${indentPx}px"${clickableAttr}>
          <div class="tree-left mono">
            <span class="tree-icon">${icon}</span>
            <span class="tree-name">${escapeHtml(node.name)}${node.kind === 'dir' ? '/' : ''}</span>
          </div>
          <div class="tree-badges">${badges.join('')}</div>
        </div>
      `
    })
    .join('')

  const contentCount = site.treeNodes.filter((n) => n.category === 'content').length

  return `
    <div class="tree-inspector">
      <div class="tradeoff-panel">
        <div class="profile-kv-grid">
          <div class="profile-kv">
            <span class="profile-kv-label">内容根路径</span>
            <span class="profile-kv-val mono">${escapeHtml(prof.contentRoot)}</span>
          </div>
          <div class="profile-kv">
            <span class="profile-kv-label">章节排序策略</span>
            <span class="profile-kv-val">${escapeHtml(prof.orderingMechanism)}</span>
          </div>
          <div class="profile-kv">
            <span class="profile-kv-label">多级侧边栏维护</span>
            <span class="profile-kv-val">${escapeHtml(prof.sidebarMechanism)}</span>
          </div>
        </div>
        <div class="pros-cons-grid">
          <div class="pc-box pros">
            <div class="pc-title">✓ 该目录模型优势</div>
            <ul class="pc-list">${prosHtml}</ul>
          </div>
          <div class="pc-box cons">
            <div class="pc-title">✕ 无法回避的妥协与痛点</div>
            <ul class="pc-list">${consHtml}</ul>
          </div>
        </div>
      </div>
      <div class="tree-list-header mono">
        <span>物理目录树 (${escapeHtml(site.submoduleDir)} · 按编辑器字母序排列)</span>
        <span>${contentCount} 篇路由文档 · 点击带路由行可预览</span>
      </div>
      <div class="tree-list">${treeRowsHtml}</div>
    </div>
  `
}

function renderPaneContent(
  side: 'left' | 'right',
  site: SiteEntry,
  counterpart: SiteEntry
): string {
  const customUrl = side === 'left' ? state.customLeftUrl : state.customRightUrl
  const routeUrl = customUrl || buildSubsiteRouteUrl(site, state.chapterId)
  const focusTarget: FocusedPane = state.focus === side ? 'both' : side
  const focusLabel = state.focus === side ? '恢复双栏' : '单栏展开'

  const headerPath =
    state.mode === 'render'
      ? routeUrl
      : state.mode === 'tree'
        ? `${site.submoduleDir}/`
        : state.mode === 'source'
          ? site.docs[state.chapterId]?.file || ''
          : site.configs[side === 'left' ? state.leftConfigIndex : state.rightConfigIndex]?.path ||
            `${site.submoduleDir}/package.json`

  let bodyHtml = ''

  if (state.mode === 'render') {
    bodyHtml = `
      <div class="pane-body" data-viewport="${state.viewport}">
        <iframe
          id="iframe-${side}"
          class="iframe-stage"
          src="${escapeHtml(routeUrl)}"
          title="${escapeHtml(site.family)} ${escapeHtml(site.versionSeries)} Preview"
          loading="lazy"
        ></iframe>
      </div>
    `
  } else if (state.mode === 'tree') {
    bodyHtml = renderTreeInspectorHtml(side, site)
  } else if (state.mode === 'source') {
    const doc = site.docs[state.chapterId]
    const otherDoc = counterpart.docs[state.chapterId]
    const diffFlags =
      state.highlightDiff && doc && otherDoc && site.id !== counterpart.id
        ? computeDiffLineFlags(doc.content, otherDoc.content)
        : undefined
    const rendered = renderCodeTableHtml(doc?.content || '', diffFlags, true)

    bodyHtml = `
      <div class="code-viewer">
        <div class="code-meta-bar mono">
          <span>${escapeHtml(doc?.file || '')}</span>
          <span>${doc?.lines || 0} 行 · ${doc?.bytes || 0} Bytes${
            diffFlags ? ` · 差异行 ${rendered.diffCount}` : ''
          }</span>
        </div>
        ${rendered.html}
      </div>
    `
  } else {
    const allConfigs = [
      ...site.configs,
      {
        path: `${site.submoduleDir}/package.json`,
        shortPath: 'package.json',
        content: site.packageJsonRaw,
        lines: site.packageJsonRaw.split('\n').length
      }
    ]
    const idx = Math.min(
      side === 'left' ? state.leftConfigIndex : state.rightConfigIndex,
      allConfigs.length - 1
    )
    const activeCfg = allConfigs[idx]
    const rendered = renderCodeTableHtml(activeCfg.content, undefined, false)

    const tabsHtml = allConfigs
      .map(
        (cfg, i) =>
          `<button type="button" class="cfg-tab mono${i === idx ? ' active' : ''}" data-cfg-side="${side}" data-cfg-idx="${i}">${escapeHtml(cfg.shortPath)}</button>`
      )
      .join('')

    bodyHtml = `
      <div class="code-viewer">
        <div class="code-meta-bar">
          <div class="config-file-tabs">${tabsHtml}</div>
          <span class="mono">${activeCfg.lines} 行</span>
        </div>
        ${rendered.html}
      </div>
    `
  }

  return `
    <div class="workbench-pane ${side}-pane">
      <div class="pane-header">
        <div class="pane-title-group">
          <span class="pane-dot ${side}"></span>
          <span class="pane-engine-badge">${escapeHtml(site.family)} <span class="mono" style="font-weight:500;opacity:0.8;">(${escapeHtml(site.primaryPackage)}@${escapeHtml(site.primaryVersion)})</span></span>
          <span class="pane-path mono" title="${escapeHtml(headerPath)}">${escapeHtml(headerPath)}</span>
        </div>
        <div class="pane-actions">
          <button type="button" class="mini-btn" data-focus-toggle="${focusTarget}" id="focus-btn-${side}">${focusLabel}</button>
          <a class="mini-btn mono" href="${escapeHtml(routeUrl)}" target="_blank" rel="noopener" id="standalone-link-${side}">独立打开 ↗</a>
        </div>
      </div>
      ${bodyHtml}
    </div>
  `
}

function updateWorkbenchDom(): void {
  const leftSite = getSiteById(state.leftSiteId)
  const rightSite = getSiteById(state.rightSiteId)
  const activeChapter =
    dataset.chapters.find((c) => c.id === state.chapterId) || dataset.chapters[0]

  const leftSelect = document.getElementById('select-left-site') as HTMLSelectElement | null
  const rightSelect = document.getElementById('select-right-site') as HTMLSelectElement | null
  if (leftSelect) leftSelect.value = state.leftSiteId
  if (rightSelect) rightSelect.value = state.rightSiteId

  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === state.mode)
  })

  document.querySelectorAll<HTMLButtonElement>('[data-chapter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.chapter === state.chapterId)
  })

  document.querySelectorAll<HTMLButtonElement>('[data-preset-left]').forEach((btn) => {
    const isMatch =
      btn.dataset.presetLeft === state.leftSiteId &&
      btn.dataset.presetRight === state.rightSiteId
    btn.classList.toggle('active', isMatch)
  })

  const extraControls = document.getElementById('workbench-extra-controls')
  if (extraControls) {
    if (state.mode === 'render') {
      extraControls.innerHTML = `
        <button type="button" class="mini-btn${state.viewport === 'fluid' ? ' active' : ''}" data-viewport-btn="fluid" id="vp-fluid-btn">双栏自适应</button>
        <button type="button" class="mini-btn${state.viewport === 'tablet' ? ' active' : ''}" data-viewport-btn="tablet" id="vp-tablet-btn">平板 768px</button>
        <button type="button" class="mini-btn${state.viewport === 'mobile' ? ' active' : ''}" data-viewport-btn="mobile" id="vp-mobile-btn">手机 390px</button>
        <button type="button" class="mini-btn" id="reload-iframes-btn">↻ 刷新分屏</button>
      `
    } else if (state.mode === 'tree') {
      extraControls.innerHTML = `<span class="mono" style="font-size:0.75rem;color:var(--text-muted);">真实扫描自各子模块物理目录树 · 揭示不同目录约定的两难取舍</span>`
    } else if (state.mode === 'source') {
      extraControls.innerHTML = `
        <button type="button" class="mini-btn${state.highlightDiff ? ' active' : ''}" id="toggle-diff-btn">
          ${state.highlightDiff ? '✓ 已开启语法差异行高亮' : '开启语法差异行高亮'}
        </button>
      `
    } else {
      extraControls.innerHTML = `<span class="mono" style="font-size:0.75rem;color:var(--text-muted);">直接读取自各子模块 main 分支配置文件</span>`
    }
  }

  const takeawayEl = document.getElementById('chapter-takeaway-text')
  if (takeawayEl) {
    takeawayEl.textContent =
      state.mode === 'tree'
        ? '工程目录不可能三角：VitePress 零层级平铺易上手但混放 README.md 且需手写侧栏；Starlight 强制 3 层 src/content/docs/ 隔离干净且支持 order 干净 URL，但本地文件字母乱序（alpha 在 zeta 前）且自动子目录生硬暴露英文名 nested。'
        : activeChapter.summary
  }

  const splitGrid = document.getElementById('workbench-split-grid')
  if (splitGrid) {
    splitGrid.setAttribute('data-focus', state.focus)
    splitGrid.innerHTML =
      renderPaneContent('left', leftSite, rightSite) +
      renderPaneContent('right', rightSite, leftSite)
    splitGrid.querySelectorAll<HTMLIFrameElement>('.iframe-stage').forEach((frame) => {
      frame.addEventListener('load', () => syncIframeThemes())
    })
  }

  syncUrlState()
}

function renderAppShell(): void {
  const app = document.getElementById('app')
  if (!app) return

  const siteOptionsHtml = dataset.sites
    .map(
      (s) =>
        `<option value="${escapeHtml(s.id)}">${escapeHtml(s.family)} · ${escapeHtml(s.versionSeries)} (${escapeHtml(s.primaryVersion)})</option>`
    )
    .join('')

  const chapterButtonsHtml = dataset.chapters
    .map(
      (c) =>
        `<button type="button" class="chapter-tab" data-chapter="${escapeHtml(c.id)}" id="chapter-btn-${escapeHtml(c.id)}">${escapeHtml(c.shortTitle)}</button>`
    )
    .join('')

  const matrixHeadersHtml = dataset.sites
    .map(
      (s) =>
        `<th>${escapeHtml(s.family)} <span class="mono" style="font-weight:500;color:var(--text-muted);">(${escapeHtml(s.id)})</span></th>`
    )
    .join('')

  const subsiteNavLinks = dataset.sites
    .map(
      (s) =>
        `<a class="nav-link mono" href="${escapeHtml(s.basePath)}" target="_blank" rel="noopener">${escapeHtml(s.id)} ↗</a>`
    )
    .join('')

  app.innerHTML = `
    <header class="masthead">
      <div class="container masthead-inner">
        <a href="./" class="brand" id="brand-home-link">
          <span class="brand-domain mono">page.2401.xyz</span>
          <span class="brand-sub">多版本静态站点生成器 (SSG) 实测对比</span>
        </a>
        <nav class="nav-links" aria-label="主导航">
          <a class="nav-link" href="#workbench">分屏工作台</a>
          <a class="nav-link" href="#matrix">特性矩阵</a>
          <a class="nav-link" href="#architecture">子模块架构</a>
          <span class="nav-divider" role="separator"></span>
          ${subsiteNavLinks}
          <span class="nav-divider" role="separator"></span>
          <button type="button" class="theme-btn" id="theme-toggle-btn">☾ 深色模式</button>
        </nav>
      </div>
    </header>

    <main class="container">
      <section class="intro-section">
        <div class="intro-header">
          <p class="intro-eyebrow mono">Git Submodule · Exact Version Pinning · Similar *.md Suite</p>
          <h1 class="intro-title">同一套语义基准，并排检验不同大版本 SSG 的真实边界</h1>
          <p class="intro-desc">
            每种静态网站生成器对目录组织结构、元数据校验、提示块标注（Callouts）、Mermaid 流程图与 LaTeX 公式的支持方式及大版本插件生态均存在取舍。本平台将每个带版本号的生成器封装为独立的 Git 子模块仓库（<code>main</code> 存纯源码，<code>page</code> 发静态产物），实时扫描物理目录树并提取真实 <code>*.md</code> 原文进行同源分屏比对。
          </p>
        </div>
        <div class="submodule-strip">
          ${renderSubmoduleCards()}
        </div>
      </section>

      <section class="workbench-section" id="workbench" aria-label="双栏对比工作台">
        <div class="workbench-shell">
          <div class="workbench-toolbar">
            <div class="selector-group">
              <span class="pane-dot left"></span>
              <label for="select-left-site" class="mono" style="font-size:0.76rem;color:var(--text-muted);">左栏</label>
              <select id="select-left-site" class="site-select">${siteOptionsHtml}</select>
              <button type="button" class="swap-btn" id="swap-sites-btn" title="交换左右引擎">⇄ 交换</button>
              <span class="pane-dot right"></span>
              <label for="select-right-site" class="mono" style="font-size:0.76rem;color:var(--text-muted);">右栏</label>
              <select id="select-right-site" class="site-select">${siteOptionsHtml}</select>
            </div>

            <div class="segmented-tabs" role="tablist" aria-label="对比视图切换">
              <button type="button" class="seg-btn" data-mode="render" id="mode-render-btn">实测渲染分屏</button>
              <button type="button" class="seg-btn" data-mode="tree" id="mode-tree-btn">工程目录树对比</button>
              <button type="button" class="seg-btn" data-mode="source" id="mode-source-btn">相似 *.md 源码对比</button>
              <button type="button" class="seg-btn" data-mode="config" id="mode-config-btn">工程配置对比</button>
            </div>
          </div>

          <div class="preset-bar" aria-label="快捷对比组合">
            <span class="preset-label">同门跨大版本：</span>
            <button type="button" class="preset-pill" data-preset-left="vitepress-v1" data-preset-right="vitepress-v2">VitePress v1 ↔ v2</button>
            <button type="button" class="preset-pill" data-preset-left="vuepress-v1" data-preset-right="vuepress-v2">VuePress v1 ↔ v2</button>
            <button type="button" class="preset-pill" data-preset-left="docsify-v4" data-preset-right="docsify-v5">Docsify v4 ↔ v5</button>
            <span class="nav-divider" role="separator"></span>
            <span class="preset-label">跨派系焦点：</span>
            <button type="button" class="preset-pill" data-preset-left="vitepress-v1" data-preset-right="astro7-starlight">VitePress v1 ↔ Astro 7 Starlight</button>
            <button type="button" class="preset-pill" data-preset-left="vuepress-v2" data-preset-right="vitepress-v2">VuePress v2 ↔ VitePress v2</button>
            <button type="button" class="preset-pill" data-preset-left="vitepress-v1" data-preset-right="docsify-v5">预编译 SSG ↔ 运行时 Docsify v5</button>
          </div>

          <div class="chapter-bar">
            <div class="chapter-tabs" id="chapter-tabs">
              ${chapterButtonsHtml}
            </div>
            <div class="viewport-controls" id="workbench-extra-controls"></div>
          </div>

          <div class="takeaway-banner">
            <span class="takeaway-label">实测要点</span>
            <span id="chapter-takeaway-text"></span>
          </div>

          <div class="split-grid" id="workbench-split-grid" data-focus="both"></div>
        </div>
      </section>

      <section class="section-block" id="matrix">
        <h2 class="section-heading">多版本实测特性与工程成本对比矩阵</h2>
        <p class="section-sub">涵盖目录结构不可能三角、标记语法方言与大版本插件边界，所有结论均来自当前子模块实测。</p>
        <div class="matrix-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>对比维度</th>
                ${matrixHeadersHtml}
              </tr>
            </thead>
            <tbody>
              ${renderMatrixRows()}
            </tbody>
          </table>
        </div>
      </section>

      <section class="section-block" id="architecture">
        <h2 class="section-heading">独立子模块与 main / page 双分支解耦架构</h2>
        <p class="section-sub">主仓库与所有子模块仓库在 <code>main</code> 分支均不混入任何编译产物，每个子模块既可挂载至统一域名子路径，也可单独克隆部署。</p>
        <div class="arch-grid">
          <div class="arch-card">
            <h3>1. 独立子仓库双分支自治</h3>
            <p>每个带版本号的 SSG（如 <code>page2401/vitepress-v1</code>）拥有自己的 <code>main</code> 源码分支与 GitHub Actions 流水线，自动将构建产物与 <code>.nojekyll</code> 发布到孤儿分支 <code>page</code>。</p>
            <pre class="arch-pre mono">main (纯源码 + 适配版 *.md)
  └─▶ GitHub Actions (Node 22)
        └─▶ page 分支 (/vitepress-v1/)</pre>
          </div>
          <div class="arch-card">
            <h3>2. 主仓库 Submodule 实时抽取</h3>
            <p>主仓库通过 <code>.gitmodules</code> 跟踪各子模块的 <code>main</code> 分支；构建时自动扫描物理目录树、读取 <code>package.json</code> 精确版本号与 <code>*.md</code> 原文，杜绝手工复制失真。</p>
            <pre class="arch-pre mono">git clone --recurse-submodules \\
  https://github.com/page2401/page2401.github.io.git</pre>
          </div>
          <div class="arch-card">
            <h3>3. 接入新大版本仅需四步</h3>
            <p>后续新增 <code>vitepress-v2</code> 或 <code>hugo-v0.145</code> 时，创建对应子仓库开启 <code>page</code> 分支 Pages，执行 <code>git submodule add</code> 并在 <code>sites.config.json</code> 注册即可。</p>
            <pre class="arch-pre mono">git submodule add -b main \\
  https://github.com/page2401/&lt;ssg-ver&gt;.git \\
  sites/&lt;ssg-ver&gt;</pre>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <span><strong>page.2401.xyz</strong> · 模块化多版本静态网站生成器对比基准</span>
        <span class="mono">
          <a href="https://github.com/page2401/page2401.github.io" target="_blank" rel="noopener">github.com/page2401/page2401.github.io</a>
        </span>
      </div>
    </footer>
  `

  updateThemeButtonLabel()
  bindEvents()
  updateWorkbenchDom()
}

function bindEvents(): void {
  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme)

  document.getElementById('select-left-site')?.addEventListener('change', (e) => {
    state.leftSiteId = (e.target as HTMLSelectElement).value
    state.leftConfigIndex = 0
    state.customLeftUrl = null
    updateWorkbenchDom()
  })

  document.getElementById('select-right-site')?.addEventListener('change', (e) => {
    state.rightSiteId = (e.target as HTMLSelectElement).value
    state.rightConfigIndex = 0
    state.customRightUrl = null
    updateWorkbenchDom()
  })

  document.getElementById('swap-sites-btn')?.addEventListener('click', () => {
    const tmp = state.leftSiteId
    state.leftSiteId = state.rightSiteId
    state.rightSiteId = tmp
    const tmpCfg = state.leftConfigIndex
    state.leftConfigIndex = state.rightConfigIndex
    state.rightConfigIndex = tmpCfg
    const tmpUrl = state.customLeftUrl
    state.customLeftUrl = state.customRightUrl
    state.customRightUrl = tmpUrl
    updateWorkbenchDom()
  })

  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode as WorkbenchMode
      if (mode) {
        state.mode = mode
        updateWorkbenchDom()
      }
    })
  })

  document.querySelectorAll<HTMLButtonElement>('[data-chapter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ch = btn.dataset.chapter
      if (ch) {
        state.chapterId = ch
        state.customLeftUrl = null
        state.customRightUrl = null
        if (state.mode === 'tree') {
          state.mode = 'render'
        }
        updateWorkbenchDom()
      }
    })
  })

  document.getElementById('workbench')?.addEventListener('click', (e) => {
    const treeRow = (e.target as HTMLElement).closest<HTMLElement>('[data-tree-route]')
    if (treeRow && treeRow.dataset.treeRoute) {
      const route = treeRow.dataset.treeRoute
      if (treeRow.dataset.treeSide === 'left') {
        state.customLeftUrl = route
      } else {
        state.customRightUrl = route
      }
      state.chapterId = '04-directory'
      state.mode = 'render'
      updateWorkbenchDom()
      return
    }

    const target = (e.target as HTMLElement).closest<HTMLElement>('button')
    if (!target) return

    if (target.dataset.presetLeft && target.dataset.presetRight) {
      state.leftSiteId = target.dataset.presetLeft
      state.rightSiteId = target.dataset.presetRight
      state.leftConfigIndex = 0
      state.rightConfigIndex = 0
      state.customLeftUrl = null
      state.customRightUrl = null
      updateWorkbenchDom()
      return
    }

    if (target.dataset.viewportBtn) {
      state.viewport = target.dataset.viewportBtn as ViewportPreset
      updateWorkbenchDom()
      return
    }

    if (target.id === 'reload-iframes-btn') {
      document.querySelectorAll<HTMLIFrameElement>('.iframe-stage').forEach((frame) => {
        const currentSrc = frame.getAttribute('src')
        if (currentSrc) frame.setAttribute('src', currentSrc)
      })
      return
    }

    if (target.id === 'toggle-diff-btn') {
      state.highlightDiff = !state.highlightDiff
      updateWorkbenchDom()
      return
    }

    if (target.dataset.focusToggle) {
      state.focus = target.dataset.focusToggle as FocusedPane
      updateWorkbenchDom()
      return
    }

    if (target.dataset.cfgSide && target.dataset.cfgIdx !== undefined) {
      const idx = Number(target.dataset.cfgIdx)
      if (target.dataset.cfgSide === 'left') {
        state.leftConfigIndex = idx
      } else {
        state.rightConfigIndex = idx
      }
      updateWorkbenchDom()
    }
  })
}

renderAppShell()
