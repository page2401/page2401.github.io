import './styles/main.css'
import rawDataset from './generated/comparison-data.json'
import type {
  ComparisonDataset,
  FocusedPane,
  LandscapeRow,
  MatrixFilter,
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
  matrixFilter: MatrixFilter
  matrixQuery: string
}

function getSiteById(id: string): SiteEntry {
  return dataset.sites.find((s) => s.id === id) || dataset.sites[0]
}

function loadInitialState(): AppState {
  const params = new URLSearchParams(window.location.search)
  const defaultLeft = 'master'
  const defaultRight =
    dataset.sites.find((s) => !s.isMaster)?.id || dataset.sites[0]?.id || 'vitepress-v1'

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
    customRightUrl: null,
    matrixFilter: 'all',
    matrixQuery: ''
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
  const masterSite = dataset.sites.find((s) => s.isMaster)
  const derivedSites = dataset.sites.filter((s) => !s.isMaster)

  const masterBannerHtml = masterSite
    ? `
      <div class="master-banner" id="master-baseline-card">
        <div class="master-banner-info">
          <div class="master-banner-title">
            <span>${escapeHtml(masterSite.family)}</span>
            <span class="series-tag mono">Single Source of Truth · 本仓 docs/*.md</span>
          </div>
          <p class="site-card-tagline" style="margin:0;">${escapeHtml(masterSite.tagline)}</p>
        </div>
        <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
          <a class="open-subsite-btn mono" href="https://github.com/page2401/page2401.github.io/tree/main/docs" target="_blank" rel="noopener">GitHub docs/ 母版源码 ↗</a>
          <a class="open-subsite-btn mono" href="${escapeHtml(masterSite.basePath)}" target="_blank" rel="noopener">${escapeHtml(masterSite.basePath)} 参考预览 ↗</a>
        </div>
      </div>
      <div class="derived-heading mono">▼ 由母版派生适配的 ${derivedSites.length} 个独立版本子模块 (sites/*)</div>
    `
    : ''

  const cardsHtml = derivedSites
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
              <a href="${escapeHtml(site.profileRoute)}" target="_blank" rel="noopener" style="color:var(--accent-teal);font-weight:600;">特色档案</a>
              <span>·</span>
              <a href="${escapeHtml(site.mainBranchUrl)}" target="_blank" rel="noopener">main</a>
              <span>·</span>
              <a href="${escapeHtml(site.pageBranchUrl)}" target="_blank" rel="noopener">page</a>
            </div>
            <span class="mono" style="color: var(--text-muted); font-size: 0.74rem;">${escapeHtml(site.submoduleDir)}</span>
          </div>
        </article>
      `
    })
    .join('')

  return `${masterBannerHtml}<div class="submodule-strip">${cardsHtml}</div>`
}

function matchesEcosystemFilter(ecosystem: string, mounted: boolean): boolean {
  if (state.matrixFilter === 'mounted' && !mounted) return false
  if (state.matrixFilter === 'catalog' && mounted) return false
  if (state.matrixFilter === 'vue' && ecosystem !== 'vue') return false
  if (state.matrixFilter === 'react-astro' && ecosystem !== 'react-astro') return false
  if (state.matrixFilter === 'native' && ecosystem !== 'native') return false
  if (
    state.matrixFilter === 'other' &&
    ecosystem !== 'runtime' &&
    ecosystem !== 'python-classic'
  ) {
    return false
  }
  return true
}

function formatCompactNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function filterLandscapeRows() {
  const q = state.matrixQuery.trim().toLowerCase()
  return dataset.landscapeRows.filter((row) => {
    if (!matchesEcosystemFilter(row.ecosystem, row.mounted)) return false
    if (!q) return true
    const haystack = [
      row.id,
      row.sitePath,
      row.profileDoc,
      row.upstreamRepo,
      row.name,
      row.versionNote,
      row.lifecycle,
      row.tagline,
      row.stack,
      row.directoryModel,
      row.calloutDialect,
      row.diagramAndMath
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

function filterGitHubRepos() {
  const q = state.matrixQuery.trim().toLowerCase()
  return dataset.githubActivity.repos.filter((r) => {
    if (!matchesEcosystemFilter(r.ecosystem, r.mounted)) return false
    if (!q) return true
    const haystack = [r.repo, r.role, r.createdAt, ...r.siteIds].join(' ').toLowerCase()
    return haystack.includes(q)
  })
}

function heatLevelClass(count: number, isBeforeCreation: boolean): string {
  if (isBeforeCreation) return 'heat-none'
  if (count === 0) return 'heat-zero'
  if (count >= 600) return 'heat-4'
  if (count >= 200) return 'heat-3'
  if (count >= 50) return 'heat-2'
  return 'heat-1'
}

function renderGitHubHeatmapRowsHtml(): string {
  const repos = filterGitHubRepos()
  const colSpan = 5 + dataset.githubActivity.displayYears.length
  if (repos.length === 0) {
    return `<tr><td colspan="${colSpan}" style="text-align:center;padding:1.5rem;color:var(--text-muted);">未找到匹配的上游 GitHub 仓库记录。</td></tr>`
  }

  return repos
    .map((r) => {
      const preBefore = r.createdYear >= 2016
      const preCls = heatLevelClass(r.pre2016Commits, preBefore)
      const preText = preBefore ? '·' : r.pre2016Commits.toLocaleString('en-US')

      const yearCells = dataset.githubActivity.displayYears
        .map((y) => {
          const before = y < r.createdYear
          const count = r.yearlyCommits[String(y)] ?? 0
          const cls = heatLevelClass(count, before)
          const peakCls = !before && y === r.peakYear && count > 0 ? ' is-peak' : ''
          const text = before ? '·' : String(count)
          const title = before
            ? `${r.repo} 于 ${r.createdAt} 立项，${y} 年尚未创建`
            : `${r.repo} · ${y} 年主分支提交 ${count} 次${y === r.peakYear ? '（历史最高峰）' : ''}`
          return `<td class="heat-cell mono ${cls}${peakCls}" title="${escapeHtml(title)}">${escapeHtml(text)}</td>`
        })
        .join('')

      const siteLinks = r.siteIds
        .map(
          (id) =>
            `<a class="gh-site-chip mono" href="/master/sites/${escapeHtml(id)}" target="_blank" rel="noopener">${escapeHtml(id)}</a>`
        )
        .join('')

      return `
        <tr>
          <td class="gh-repo-cell">
            <div class="gh-repo-line">
              <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener" class="mono gh-repo-link">${escapeHtml(r.repo)} ↗</a>
              <span class="gh-site-chips">${siteLinks}</span>
            </div>
            <div class="gh-repo-meta mono">立项 ${escapeHtml(r.createdAt)} · 最近推送 ${escapeHtml(r.pushedAt)}</div>
          </td>
          <td class="mono num-cell">★ ${formatCompactNum(r.stars)}</td>
          <td class="mono num-cell">${r.totalCommits.toLocaleString('en-US')}</td>
          <td class="heat-cell mono ${preCls}" title="2008–2015 年累计主分支提交数">${preText}</td>
          ${yearCells}
        </tr>
      `
    })
    .join('')
}

function renderLandscapeRowsHtml(): string {
  const rows = filterLandscapeRows()
  if (rows.length === 0) {
    return `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">未找到匹配的静态网站生成器，请尝试切换筛选流派或清空搜索词。</td></tr>`
  }

  return rows
    .map((row) => {
      const statusBadge = row.mounted
        ? `<span class="status-badge mounted">★ sites/${escapeHtml(row.id)}</span>`
        : `<span class="status-badge catalog">预留 sites/${escapeHtml(row.id)}</span>`

      const loadWorkbenchBtn = row.mounted
        ? `<button type="button" class="row-action-btn primary" data-load-workbench="${escapeHtml(row.id)}">⇄ 调入工作台</button>`
        : ''

      const lifecycleColor = row.isEol ? 'var(--accent-copper)' : 'var(--accent-teal)'
      const ghStatLine = row.upstreamRepo
        ? `<span class="gen-ver mono">★ ${formatCompactNum(row.stars)} · 总提交 ${row.totalCommits.toLocaleString('en-US')} · 26年 ${row.commits2026}次</span>`
        : ''

      return `
        <tr>
          <td class="gen-cell">
            <div class="gen-name-line">
              <span>${escapeHtml(row.name)}</span>
              ${statusBadge}
            </div>
            <span class="gen-ver mono">${escapeHtml(row.versionNote)}</span>
            <span class="gen-ver mono" style="color:${lifecycleColor};font-weight:600;">⏱ ${escapeHtml(row.lifecycle)}</span>
            ${ghStatLine}
            <p class="gen-tagline">${escapeHtml(row.tagline)}</p>
          </td>
          <td class="mono" style="font-size:0.77rem;max-width:210px;">${escapeHtml(row.stack)}</td>
          <td>${escapeHtml(row.directoryModel)}</td>
          <td>${escapeHtml(row.calloutDialect)}</td>
          <td>${escapeHtml(row.diagramAndMath)}</td>
          <td class="action-cell">
            <div class="row-actions">
              ${loadWorkbenchBtn}
              <a class="row-action-btn mono" href="${escapeHtml(row.profileRoute)}" target="_blank" rel="noopener">📖 docs/sites/${escapeHtml(row.id)} ↗</a>
            </div>
          </td>
        </tr>
      `
    })
    .join('')
}

function updateMatrixDom(): void {
  const tbody = document.getElementById('landscape-matrix-tbody')
  if (tbody) tbody.innerHTML = renderLandscapeRowsHtml()
  const ghTbody = document.getElementById('github-commits-tbody')
  if (ghTbody) ghTbody.innerHTML = renderGitHubHeatmapRowsHtml()
  document.querySelectorAll<HTMLButtonElement>('[data-matrix-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.matrixFilter === state.matrixFilter)
  })
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

  const mountedCount = dataset.landscapeRows.filter((r) => r.mounted).length
  const catalogCount = dataset.landscapeRows.filter((r) => !r.mounted).length

  const subsiteNavLinks = dataset.sites
    .filter((s) => !s.isMaster)
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
          <a class="nav-link" href="#dialects">MD 方言谱系</a>
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
            本仓库自身在 <code>docs/*.md</code> 中维护唯一一套<strong>标准 GitHub Flavored Markdown（GFM）原始母版</strong>；下方所有独立子模块仓库中的文档均由该母版按各框架大版本的专有语法<strong>派生适配</strong>而来。通过并排对比母版与各派生版，即可精确量化每个框架带来的语法改造代价与渲染差异。
          </p>
        </div>
        ${renderSubmoduleCards()}
      </section>

      <section class="dialects-section" id="dialects" aria-label="Markdown 方言谱系导览">
        <div class="dialects-header-bar">
          <div>
            <h2 class="section-heading">为什么同叫 <code>*.md</code> 却必须派生？—— Markdown 五大方言谱系</h2>
            <p class="section-sub" style="margin-bottom:0;">初代 Markdown 仅定义了基础散文排版，现代文档必需的提示框、公式、图表与组件均由各生态独立扩展，演化出互不兼容的语法方言（同一句“升级警告”写法对比如下）：</p>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
            <a class="open-subsite-btn mono" href="/master/00-dialects" target="_blank" rel="noopener">阅读完整方言谱系导览 ↗</a>
            <a class="open-subsite-btn mono" href="https://github.com/page2401/page2401.github.io/blob/main/docs/00-dialects.md" target="_blank" rel="noopener">docs/00-dialects.md ↗</a>
          </div>
        </div>

        <div class="dialect-grid">
          <article class="dialect-card">
            <div>
              <span class="dialect-layer-tag mono">Layer 1 · 基础内核</span>
              <h3 class="dialect-name">初代 Markdown / CommonMark</h3>
              <p class="dialect-desc">2004 初代与 2014 严格化标准。仅含标题、列表、链接、代码块；<strong>无表格、无公式、无 Frontmatter、无提示块</strong>，任何扩展语义只能退化为粗体引用。</p>
            </div>
            <pre class="dialect-snippet mono">&gt; **升级注意**：请先备份配置。</pre>
          </article>

          <article class="dialect-card is-canonical">
            <div>
              <span class="dialect-layer-tag mono">Layer 2 · ★ 本站母版基准</span>
              <h3 class="dialect-name">GitHub Flavored (GFM)</h3>
              <p class="dialect-desc">事实上的通用超集：扩展表格与任务列表，并在 GitHub 平台层支持 <code>[!NOTE]</code> 五类警报、<code>mermaid</code> 代码块与 <code>$...$</code> 公式——但多数 SSG 默认并不全兼容。</p>
            </div>
            <pre class="dialect-snippet mono">&gt; [!WARNING]
&gt; **升级注意**：请先备份配置。</pre>
          </article>

          <article class="dialect-card">
            <div>
              <span class="dialect-layer-tag mono">Layer 3A · markdown-it 派</span>
              <h3 class="dialect-name">三冒号空格容器 + Vue SFC</h3>
              <p class="dialect-desc">代表：<strong>VuePress / VitePress</strong>。整篇文档编译为 Vue 组件（可直接写 <code>&lt;Badge/&gt;</code>，但裸写泛型 <code>&lt;T&gt;</code> 易报错），标题跟在空格后。</p>
            </div>
            <pre class="dialect-snippet mono">::: warning 升级注意
请先备份配置。
:::</pre>
          </article>

          <article class="dialect-card">
            <div>
              <span class="dialect-layer-tag mono">Layer 3B · remark + MDX 派</span>
              <h3 class="dialect-name">指令方括号容器 + JSX</h3>
              <p class="dialect-desc">代表：<strong>Astro Starlight / Docusaurus</strong>。遵循 <code>remark-directive</code>，无空格且标题<strong>必须放方括号内</strong>；MDX 下裸写 <code>{var}</code> 或 HTML 注释会触发编译报错。</p>
            </div>
            <pre class="dialect-snippet mono">:::caution[升级注意]
请先备份配置。
:::</pre>
          </article>

          <article class="dialect-card">
            <div>
              <span class="dialect-layer-tag mono">Layer 4 · 其它生态专有派</span>
              <h3 class="dialect-name">Docsify / MkDocs / Hugo</h3>
              <p class="dialect-desc">各成一派：Docsify 用 <code>?&gt;</code> / <code>!&gt;</code>（v5 新增 GFM 兼容）；MkDocs 用 <code>!!!</code> 加 4 空格缩进免闭合；Hugo 用 Go 模板 Shortcode。</p>
            </div>
            <pre class="dialect-snippet mono">!&gt; **升级注意**：请先备份配置。
!!! warning "升级注意"
{{&lt; callout "warning" &gt;}}</pre>
          </article>
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
            <span class="preset-label">母版 ↔ 派生对照：</span>
            <button type="button" class="preset-pill" data-preset-left="master" data-preset-right="vitepress-v1">★ 母版 ↔ VitePress v1</button>
            <button type="button" class="preset-pill" data-preset-left="master" data-preset-right="astro7-starlight">★ 母版 ↔ Astro 7 Starlight</button>
            <button type="button" class="preset-pill" data-preset-left="master" data-preset-right="docsify-v5">★ 母版 ↔ Docsify v5</button>
            <span class="nav-divider" role="separator"></span>
            <span class="preset-label">同门跨大版本：</span>
            <button type="button" class="preset-pill" data-preset-left="vitepress-v1" data-preset-right="vitepress-v2">VitePress v1 ↔ v2</button>
            <button type="button" class="preset-pill" data-preset-left="vuepress-v1" data-preset-right="vuepress-v2">VuePress v1 ↔ v2</button>
            <button type="button" class="preset-pill" data-preset-left="docsify-v4" data-preset-right="docsify-v5">Docsify v4 ↔ v5</button>
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
        <div class="dialects-header-bar">
          <div>
            <h2 class="section-heading">静态网站生成器（SSG）1:1 站点图鉴与 GitHub 活跃度矩阵（${dataset.landscapeRows.length} 款）</h2>
            <p class="section-sub" style="margin-bottom:0;">主库档案目录 <code>docs/sites/&lt;id&gt;.md</code> 与子模块挂载目录 <code>sites/&lt;id&gt;</code> 严格 1:1 对齐；下方同步展示持久化的 GitHub GraphQL API 历年提交记录快照。</p>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
            <a class="open-subsite-btn mono" href="/master/sites/" target="_blank" rel="noopener">浏览站点与活跃度总览 (/master/sites/) ↗</a>
            <a class="open-subsite-btn mono" href="/master/sites/github-activity.json" target="_blank" rel="noopener">GitHub API 快照 JSON ↗</a>
            <a class="open-subsite-btn mono" href="https://github.com/page2401/page2401.github.io/tree/main/docs/sites" target="_blank" rel="noopener">GitHub docs/sites/ ↗</a>
          </div>
        </div>

        <div class="matrix-toolbar">
          <div class="matrix-filters" role="tablist" aria-label="生成器流派筛选">
            <button type="button" class="preset-pill active" data-matrix-filter="all">全部 (${dataset.landscapeRows.length})</button>
            <button type="button" class="preset-pill" data-matrix-filter="mounted">★ 已挂载 sites/* (${mountedCount})</button>
            <button type="button" class="preset-pill" data-matrix-filter="catalog">预留扩展 sites/* (${catalogCount})</button>
            <button type="button" class="preset-pill" data-matrix-filter="vue">Vue 生态</button>
            <button type="button" class="preset-pill" data-matrix-filter="react-astro">React / Astro / MDX</button>
            <button type="button" class="preset-pill" data-matrix-filter="native">Go / Rust 极速流</button>
            <button type="button" class="preset-pill" data-matrix-filter="other">Python / 运行时 / 经典</button>
          </div>
          <input
            type="search"
            id="matrix-search-input"
            class="matrix-search"
            placeholder="搜索 ID、仓库或特性 (如 vuepress / EOL / _index.md)..."
            aria-label="搜索静态网站生成器"
          />
        </div>

        <div class="matrix-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>生成器 / 1:1 站点标识</th>
                <th>底层技术栈</th>
                <th>目录与侧边栏流派</th>
                <th>标注方言与 GFM 兼容</th>
                <th>流程图与公式方案</th>
                <th>1:1 档案与实测</th>
              </tr>
            </thead>
            <tbody id="landscape-matrix-tbody">
              ${renderLandscapeRowsHtml()}
            </tbody>
          </table>
        </div>

        <div class="gh-heatmap-panel" id="github-activity">
          <div class="gh-heatmap-header">
            <div>
              <h3 class="gh-heatmap-title">📊 上游 GitHub 官方仓库历年提交活跃度热力表（2008–2026）</h3>
              <p class="gh-heatmap-sub">数据持久化于 <code>docs/sites/github-activity.json</code>（采样日期：<code>${escapeHtml(dataset.githubActivity.fetchedAt)}</code>，可通过 <code>npm run sync:github</code> 一键刷新）。带 ★ 边框为该仓单年历史峰值，铜色 <code>0</code> 标识已完全停止提交。</p>
            </div>
            <div class="gh-legend mono">
              <span class="heat-legend-chip heat-none">· 未立项</span>
              <span class="heat-legend-chip heat-zero">0 停滞</span>
              <span class="heat-legend-chip heat-1">1–49</span>
              <span class="heat-legend-chip heat-2">50–199</span>
              <span class="heat-legend-chip heat-3">200–599</span>
              <span class="heat-legend-chip heat-4">600+ 高频</span>
            </div>
          </div>
          <div class="matrix-wrap">
            <table class="matrix-table gh-heatmap-table">
              <thead>
                <tr>
                  <th>上游 GitHub 仓库 &amp; 1:1 关联站点</th>
                  <th style="text-align:right;">Stars</th>
                  <th style="text-align:right;">总提交</th>
                  <th style="text-align:right;">08–15累计</th>
                  ${dataset.githubActivity.displayYears
                    .map((y) => `<th style="text-align:right;" class="mono">${String(y).slice(2)}年</th>`)
                    .join('')}
                </tr>
              </thead>
              <tbody id="github-commits-tbody">
                ${renderGitHubHeatmapRowsHtml()}
              </tbody>
            </table>
          </div>
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

  document.getElementById('matrix')?.addEventListener('click', (e) => {
    const filterBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-matrix-filter]')
    if (filterBtn && filterBtn.dataset.matrixFilter) {
      state.matrixFilter = filterBtn.dataset.matrixFilter as MatrixFilter
      updateMatrixDom()
      return
    }

    const loadBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-load-workbench]')
    if (loadBtn && loadBtn.dataset.loadWorkbench) {
      state.leftSiteId = 'master'
      state.rightSiteId = loadBtn.dataset.loadWorkbench
      state.leftConfigIndex = 0
      state.rightConfigIndex = 0
      state.customLeftUrl = null
      state.customRightUrl = null
      updateWorkbenchDom()
      document.getElementById('workbench')?.scrollIntoView({ behavior: 'smooth' })
    }
  })

  document.getElementById('matrix-search-input')?.addEventListener('input', (e) => {
    state.matrixQuery = (e.target as HTMLInputElement).value
    updateMatrixDom()
  })

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
