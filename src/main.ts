import './styles/main.css'
import rawDataset from './generated/comparison-data.json'
import type {
  ComparisonDataset,
  DirectoryFilter,
  DirectorySort,
  DirectoryView,
  FocusedPane,
  GitHubRepoActivity,
  LandscapeRow,
  ObservatoryTab,
  SiteEntry,
  ViewportPreset,
  WorkbenchMode
} from './types'
import { computeDiffLineFlags, escapeHtml, renderCodeTableHtml } from './components/source-diff'

const dataset = rawDataset as ComparisonDataset

const ECOSYSTEM_LABELS: Record<string, string> = {
  gfm: '★ 基准母版 (Pure GFM)',
  vue: 'Vue 生态文档派',
  'react-astro': 'React / Astro / MDX 派',
  native: 'Go / Rust 单二进制派',
  runtime: '零预编译 SPA 运行时派',
  'python-classic': 'Python 科研与经典博客派'
}

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
  dirFilter: DirectoryFilter
  dirSort: DirectorySort
  dirView: DirectoryView
  dirQuery: string
  activeTag: string | null
  obsTab: ObservatoryTab
  heatmapSort: 'default' | 'commits2026' | 'total' | 'stars' | 'oldest'
  drawerSiteId: string | null
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
  const hash = window.location.hash

  let initialObsTab: ObservatoryTab = 'heatmap'
  if (hash === '#dialects') initialObsTab = 'dialects'
  else if (hash === '#matrix') initialObsTab = 'matrix'

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
    dirFilter: 'all',
    dirSort: 'recommended',
    dirView: 'grid',
    dirQuery: '',
    activeTag: null,
    obsTab: initialObsTab,
    heatmapSort: 'default',
    drawerSiteId: null
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
      // Ignore cross-origin frame access
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
  btn.textContent = isDark ? '☀ 浅色' : '☾ 深色'
}

function formatCompactNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

// Compute top tags dynamically across all docs/sites/<id>.json entries
function getHotTags(limit = 12): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>()
  for (const row of dataset.landscapeRows) {
    for (const t of row.tags) {
      if (t === 'ssg') continue
      counts.set(t, (counts.get(t) || 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit)
}

// Render compact 11-year (2016–2026) inline SVG commit sparkline
function renderSparklineSvg(row: LandscapeRow): string {
  const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
  const values = years.map((y) => (y < row.createdYear ? 0 : row.yearlyCommits[String(y)] ?? 0))
  const maxVal = Math.max(10, ...values)
  const w = 116
  const h = 30
  const padY = 3

  const pts = values.map((v, idx) => {
    const x = Number(((idx / (years.length - 1)) * w).toFixed(1))
    const y = Number((h - padY - (v / maxVal) * (h - padY * 2)).toFixed(1))
    return { x, y, v, yr: years[idx] }
  })

  const strokeColor = row.isEol ? 'var(--accent-copper)' : 'var(--accent-teal)'
  const polyPoints = pts.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = `0,${h - padY} ${polyPoints} ${w},${h - padY}`

  let peakIdx = 0
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].v >= pts[peakIdx].v) peakIdx = i
  }
  const lastPt = pts[pts.length - 1]
  const peakPt = pts[peakIdx]

  return `
    <svg class="sparkline-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="2016–2026 提交活跃曲线">
      <polygon points="${areaPoints}" fill="${strokeColor}" opacity="0.13"></polygon>
      <polyline points="${polyPoints}" fill="none" stroke="${strokeColor}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${peakPt.v > 0 ? `<circle cx="${peakPt.x}" cy="${peakPt.y}" r="2.3" fill="${strokeColor}"><title>${peakPt.yr} 峰值: ${peakPt.v} 次提交</title></circle>` : ''}
      <circle cx="${lastPt.x}" cy="${lastPt.y}" r="2.5" fill="${strokeColor}"><title>2026 年: ${lastPt.v} 次提交</title></circle>
    </svg>
  `
}

function matchesDirectoryFilter(row: LandscapeRow): boolean {
  const f = state.dirFilter
  if (f === 'mounted' && !row.mounted) return false
  if (f === 'catalog' && row.mounted) return false
  if (f === 'active' && row.isEol) return false
  if (f === 'eol' && !row.isEol) return false
  if (
    (f === 'vue' ||
      f === 'react-astro' ||
      f === 'native' ||
      f === 'runtime' ||
      f === 'python-classic') &&
    row.ecosystem !== f
  ) {
    return false
  }
  if (state.activeTag && !row.tags.includes(state.activeTag)) {
    return false
  }
  const q = state.dirQuery.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    row.id,
    row.sitePath,
    row.name,
    row.versionNote,
    row.lifecycle,
    row.upstreamRepo,
    row.websiteUrl,
    row.tagline,
    row.stack,
    row.markdownEngine,
    row.libs.bundler,
    row.libs.codeHighlight,
    row.libs.searchEngine,
    ...row.tags,
    ...row.coreLibs,
    row.directoryModel,
    row.calloutDialect,
    row.diagramAndMath
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

function getFilteredAndSortedRows(): LandscapeRow[] {
  const filtered = dataset.landscapeRows.filter(matchesDirectoryFilter)
  const sorted = [...filtered]
  switch (state.dirSort) {
    case 'stars-desc':
      sorted.sort((a, b) => b.stars - a.stars)
      break
    case 'commits2026-desc':
      sorted.sort((a, b) => b.commits2026 - a.commits2026 || b.stars - a.stars)
      break
    case 'total-commits-desc':
      sorted.sort((a, b) => b.totalCommits - a.totalCommits)
      break
    case 'newest':
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      break
    case 'oldest':
      sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      break
    default:
      sorted.sort((a, b) => a.order - b.order)
  }
  return sorted
}

function renderDirectoryCardsOrListHtml(): string {
  const rows = getFilteredAndSortedRows()
  if (rows.length === 0) {
    return `
      <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:10px;padding:2.5rem;text-align:center;color:var(--text-muted);">
        未找到匹配的静态网站生成器。
        <button type="button" class="reset-filter-btn" id="empty-reset-btn" style="margin-left:0.5rem;">清空筛选条件</button>
      </div>
    `
  }

  if (state.dirView === 'list') {
    const trs = rows
      .map((row) => {
        const badge = row.mounted
          ? `<span class="status-badge mounted mono">★ sites/${escapeHtml(row.id)}</span>`
          : `<span class="status-badge catalog mono">预留 sites/${escapeHtml(row.id)}</span>`
        const wbBtns = row.mounted
          ? `
            <button type="button" class="card-act-btn wb" data-set-pane="left" data-site-id="${escapeHtml(row.id)}" title="载入分屏工作台左栏">⬅ 左栏</button>
            <button type="button" class="card-act-btn wb" data-set-pane="right" data-site-id="${escapeHtml(row.id)}" title="载入分屏工作台右栏">右栏 ➡</button>
          `
          : ''
        return `
          <tr>
            <td>
              <div class="gen-name-line">
                <span>${escapeHtml(row.name)}</span>
                ${badge}
              </div>
              <span class="gen-ver mono">${escapeHtml(row.versionNote)}</span>
              <div class="gen-ext-links mono">
                <a href="${escapeHtml(row.websiteUrl)}" target="_blank" rel="noopener">🌐 官网</a>
                <span>·</span>
                <a href="${escapeHtml(row.githubUrl)}" target="_blank" rel="noopener">GitHub</a>
              </div>
            </td>
            <td class="mono" style="font-size:0.75rem;">
              <div>${escapeHtml(row.libs.bundler)}</div>
              <div style="color:var(--text-muted);margin-top:0.15rem;">MD: ${escapeHtml(row.markdownEngine)} · 高亮: ${escapeHtml(row.libs.codeHighlight)}</div>
            </td>
            <td>
              <span class="lifecycle-pill${row.isEol ? ' eol' : ''}">${escapeHtml(row.lifecycle)}</span>
              <div class="gen-ver mono" style="margin-top:0.25rem;">★ ${formatCompactNum(row.stars)} · 总提交 ${row.totalCommits.toLocaleString('en-US')} · 26年 ${row.commits2026}次</div>
            </td>
            <td style="width:130px;">${renderSparklineSvg(row)}</td>
            <td>
              <div style="display:flex;gap:0.3rem;flex-wrap:wrap;">
                ${wbBtns}
                <button type="button" class="card-act-btn mono" data-open-drawer="${escapeHtml(row.id)}">🔍 详情 JSON</button>
              </div>
            </td>
          </tr>
        `
      })
      .join('')

    return `
      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>生成器 / 1:1 路径</th>
              <th>打包器与核心引擎 (Libs)</th>
              <th>生命周期与 GitHub 指标</th>
              <th>16–26 提交曲线</th>
              <th>工作台与元数据</th>
            </tr>
          </thead>
          <tbody>${trs}</tbody>
        </table>
      </div>
    `
  }

  const cards = rows
    .map((row) => {
      const cardCls = row.isEol ? 'ssg-card is-eol' : row.mounted ? 'ssg-card is-mounted' : 'ssg-card'
      const mountBadge = row.mounted
        ? `<span class="status-badge mounted mono">★ sites/${escapeHtml(row.id)}</span>`
        : `<span class="status-badge catalog mono">预留 sites/${escapeHtml(row.id)}</span>`
      const lifePill = row.isEol
        ? `<span class="lifecycle-pill eol">停滞 / EOL</span>`
        : `<span class="lifecycle-pill">活跃维护</span>`

      const tagsHtml = row.tags
        .slice(0, 6)
        .map(
          (t) =>
            `<button type="button" class="card-tag-btn mono" data-tag-pick="${escapeHtml(t)}">#${escapeHtml(t)}</button>`
        )
        .join('')

      const wbActions = row.mounted
        ? `
          <button type="button" class="card-act-btn wb" data-set-pane="left" data-site-id="${escapeHtml(row.id)}" title="设为分屏工作台左栏">⬅ 左栏</button>
          <button type="button" class="card-act-btn wb" data-set-pane="right" data-site-id="${escapeHtml(row.id)}" title="设为分屏工作台右栏">右栏 ➡</button>
        `
        : ''

      return `
        <article class="${cardCls}" data-card-id="${escapeHtml(row.id)}">
          <div>
            <div class="ssg-card-head">
              <div>
                <div class="ssg-card-title">
                  <span>${escapeHtml(row.name)}</span>
                  ${mountBadge}
                </div>
                <div class="ssg-card-ver mono">${escapeHtml(row.versionNote)} · ${escapeHtml(row.lifecycle)}</div>
              </div>
              ${lifePill}
            </div>

            <div class="spark-strip" style="margin-top:0.65rem;">
              <div class="spark-metrics mono">
                <span class="spark-metrics-top">★ ${formatCompactNum(row.stars)} · 26年 ${row.commits2026} 次提交</span>
                <span class="spark-metrics-sub">始于 ${escapeHtml(row.createdAt.slice(0, 7))} · 累计 ${row.totalCommits.toLocaleString('en-US')} commits</span>
              </div>
              ${renderSparklineSvg(row)}
            </div>

            <p class="ssg-card-tagline" style="margin-top:0.62rem;">${escapeHtml(row.tagline)}</p>

            <div class="ssg-libs-kv mono" style="margin-top:0.5rem;">
              <div><strong>管线:</strong> ${escapeHtml(row.libs.bundler)} · ${escapeHtml(row.markdownEngine)}</div>
              <div><strong>Libs:</strong> ${escapeHtml(row.coreLibs.slice(0, 4).join(', '))}</div>
            </div>

            <div class="ssg-card-tags" style="margin-top:0.55rem;">${tagsHtml}</div>
          </div>

          <div class="ssg-card-foot">
            <div class="ssg-ext-links mono">
              <a href="${escapeHtml(row.websiteUrl)}" target="_blank" rel="noopener">🌐 官网 ↗</a>
              <a href="${escapeHtml(row.githubUrl)}" target="_blank" rel="noopener">GitHub ↗</a>
              ${row.subsiteUrl ? `<a href="${escapeHtml(row.subsiteUrl)}" target="_blank" rel="noopener" style="color:var(--accent-teal);">子站 ↗</a>` : ''}
            </div>
            <div class="ssg-card-actions">
              ${wbActions}
              <button type="button" class="card-act-btn mono" data-open-drawer="${escapeHtml(row.id)}">🔍 详情 JSON</button>
            </div>
          </div>
        </article>
      `
    })
    .join('')

  return `<div class="catalog-cards-grid">${cards}</div>`
}

function updateDirectoryDom(): void {
  const container = document.getElementById('directory-results-container')
  if (container) container.innerHTML = renderDirectoryCardsOrListHtml()

  const statusText = document.getElementById('directory-status-count')
  const rows = getFilteredAndSortedRows()
  if (statusText) {
    const activeNote = state.activeTag ? ` · 标签 #${state.activeTag}` : ''
    const queryNote = state.dirQuery.trim() ? ` · 搜索 "${state.dirQuery.trim()}"` : ''
    statusText.textContent = `当前匹配 ${rows.length} / ${dataset.landscapeRows.length} 款生成器${activeNote}${queryNote}`
  }

  const resetBtn = document.getElementById('directory-reset-btn')
  if (resetBtn) {
    const hasFilter =
      state.dirFilter !== 'all' || Boolean(state.activeTag) || Boolean(state.dirQuery.trim())
    resetBtn.style.display = hasFilter ? 'inline' : 'none'
  }

  document.querySelectorAll<HTMLButtonElement>('[data-dir-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.dirFilter === state.dirFilter)
  })
  document.querySelectorAll<HTMLButtonElement>('[data-hot-tag]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.hotTag === state.activeTag)
  })
  document.querySelectorAll<HTMLButtonElement>('[data-dir-view]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.dirView === state.dirView)
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

function getSortedHeatmapRepos(): GitHubRepoActivity[] {
  const list = [...dataset.githubActivity.repos]
  switch (state.heatmapSort) {
    case 'commits2026':
      list.sort((a, b) => (b.yearlyCommits['2026'] ?? 0) - (a.yearlyCommits['2026'] ?? 0))
      break
    case 'total':
      list.sort((a, b) => b.totalCommits - a.totalCommits)
      break
    case 'stars':
      list.sort((a, b) => b.stars - a.stars)
      break
    case 'oldest':
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      break
    default:
      break
  }
  return list
}

function renderObservatoryPanelHtml(): string {
  if (state.obsTab === 'heatmap') {
    const repos = getSortedHeatmapRepos()
    const rowsHtml = repos
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

        const siteChips = r.siteIds
          .map(
            (id) =>
              `<button type="button" class="gh-site-chip mono" data-open-drawer="${escapeHtml(id)}" style="cursor:pointer;" title="打开 ${escapeHtml(id)}.json 元数据抽屉">${escapeHtml(id)}.json</button>`
          )
          .join('')

        return `
          <tr>
            <td class="gh-repo-cell">
              <div class="gh-repo-line">
                <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener" class="mono gh-repo-link">${escapeHtml(r.repo)} ↗</a>
                <span class="gh-site-chips">${siteChips}</span>
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

    return `
      <div class="gh-heatmap-header" style="margin-bottom:0.75rem;">
        <p class="gh-heatmap-sub">数据聚合自每个站点独立的 <code>docs/sites/&lt;id&gt;.json</code> 中的 <code>github</code> 节点（采样日期：<code>${escapeHtml(dataset.githubActivity.fetchedAt)}</code>，执行 <code>npm run sync:github</code> 可刷新）。点击仓库旁胶囊可展开完整 JSON 详情抽屉。</p>
        <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
          <select id="heatmap-sort-select" class="sort-select" aria-label="热力表排序">
            <option value="default"${state.heatmapSort === 'default' ? ' selected' : ''}>排序：默认流派序</option>
            <option value="commits2026"${state.heatmapSort === 'commits2026' ? ' selected' : ''}>排序：2026 年活跃度 ↓</option>
            <option value="total"${state.heatmapSort === 'total' ? ' selected' : ''}>排序：历史总提交 ↓</option>
            <option value="stars"${state.heatmapSort === 'stars' ? ' selected' : ''}>排序：GitHub Stars ↓</option>
            <option value="oldest"${state.heatmapSort === 'oldest' ? ' selected' : ''}>排序：立项时间最早 ↑</option>
          </select>
          <div class="gh-legend mono">
            <span class="heat-legend-chip heat-none">· 未立项</span>
            <span class="heat-legend-chip heat-zero">0 停滞</span>
            <span class="heat-legend-chip heat-1">1–49</span>
            <span class="heat-legend-chip heat-2">50–199</span>
            <span class="heat-legend-chip heat-3">200–599</span>
            <span class="heat-legend-chip heat-4">600+</span>
          </div>
        </div>
      </div>
      <div class="matrix-wrap">
        <table class="matrix-table gh-heatmap-table">
          <thead>
            <tr>
              <th>上游 GitHub 仓库 &amp; 1:1 关联 JSON</th>
              <th style="text-align:right;">Stars</th>
              <th style="text-align:right;">总提交</th>
              <th style="text-align:right;">08–15累计</th>
              ${dataset.githubActivity.displayYears
                .map((y) => `<th style="text-align:right;" class="mono">${String(y).slice(2)}年</th>`)
                .join('')}
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    `
  }

  if (state.obsTab === 'matrix') {
    const trs = dataset.landscapeRows
      .map((row) => {
        const badge = row.mounted
          ? `<span class="status-badge mounted mono">★ ${escapeHtml(row.id)}</span>`
          : `<span class="status-badge catalog mono">${escapeHtml(row.id)}</span>`
        return `
          <tr>
            <td class="gen-cell">
              <div class="gen-name-line">
                <span>${escapeHtml(row.name)}</span>
                ${badge}
              </div>
              <span class="gen-ver mono">${escapeHtml(row.versionNote)}</span>
              <div style="margin-top:0.35rem;display:flex;gap:0.3rem;flex-wrap:wrap;">
                <button type="button" class="card-act-btn mono" data-open-drawer="${escapeHtml(row.id)}">🔍 详情</button>
                <a class="card-act-btn mono" href="${escapeHtml(row.profileRoute)}" target="_blank" rel="noopener">.md ↗</a>
                <a class="card-act-btn mono" href="${escapeHtml(row.jsonRoute)}" target="_blank" rel="noopener">.json ↗</a>
              </div>
            </td>
            <td class="mono" style="font-size:0.75rem;max-width:220px;">
              <div>${escapeHtml(row.stack)}</div>
              <div class="libs-sub">Libs: ${escapeHtml(row.coreLibs.join(', '))}</div>
            </td>
            <td>${escapeHtml(row.directoryModel)}</td>
            <td>${escapeHtml(row.calloutDialect)}</td>
            <td>${escapeHtml(row.diagramAndMath)}</td>
          </tr>
        `
      })
      .join('')

    return `
      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>生成器 / 1:1 标识</th>
              <th>底层技术栈与依赖 Libs</th>
              <th>目录与侧边栏流派</th>
              <th>标注方言与 GFM 兼容</th>
              <th>流程图与公式方案</th>
            </tr>
          </thead>
          <tbody>${trs}</tbody>
        </table>
      </div>
    `
  }

  return `
    <div style="margin-bottom:0.85rem;display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;">
      <p class="gh-heatmap-sub">初代 Markdown 仅定义基础散文排版，现代文档必需的提示框、公式、图表与组件均由各生态独立扩展，演化出互不兼容的语法方言（同一句“升级警告”写法对比如下）：</p>
      <a class="open-subsite-btn mono" href="/master/00-dialects" target="_blank" rel="noopener">阅读完整方言谱系 (/master/00-dialects) ↗</a>
    </div>
    <div class="dialect-grid">
      <article class="dialect-card">
        <div>
          <span class="dialect-layer-tag mono">Layer 1 · 基础内核</span>
          <h3 class="dialect-name">初代 Markdown / CommonMark</h3>
          <p class="dialect-desc">2004 初代与 2014 严格化标准。仅含标题、列表、链接、代码块；<strong>无表格、无公式、无 Frontmatter、无提示块</strong>。</p>
        </div>
        <pre class="dialect-snippet mono">&gt; **升级注意**：请先备份配置。</pre>
      </article>
      <article class="dialect-card is-canonical">
        <div>
          <span class="dialect-layer-tag mono">Layer 2 · ★ 本站母版基准</span>
          <h3 class="dialect-name">GitHub Flavored (GFM)</h3>
          <p class="dialect-desc">扩展表格与任务列表，并在 GitHub 平台层支持 <code>[!NOTE]</code> 五类警报、<code>mermaid</code> 代码块与 <code>$...$</code> 公式。</p>
        </div>
        <pre class="dialect-snippet mono">&gt; [!WARNING]
&gt; **升级注意**：请先备份配置。</pre>
      </article>
      <article class="dialect-card">
        <div>
          <span class="dialect-layer-tag mono">Layer 3A · markdown-it 派</span>
          <h3 class="dialect-name">三冒号空格容器 + Vue SFC</h3>
          <p class="dialect-desc">代表：<strong>VuePress / VitePress</strong>。整篇文档编译为 Vue 组件（可直接写 <code>&lt;Badge/&gt;</code>，但裸写泛型 <code>&lt;T&gt;</code> 易报错）。</p>
        </div>
        <pre class="dialect-snippet mono">::: warning 升级注意
请先备份配置。
:::</pre>
      </article>
      <article class="dialect-card">
        <div>
          <span class="dialect-layer-tag mono">Layer 3B · remark + MDX 派</span>
          <h3 class="dialect-name">指令方括号容器 + JSX</h3>
          <p class="dialect-desc">代表：<strong>Astro Starlight / Docusaurus</strong>。遵循 <code>remark-directive</code>，标题放方括号内；MDX 严格拒绝裸 <code>{var}</code>。</p>
        </div>
        <pre class="dialect-snippet mono">:::caution[升级注意]
请先备份配置。
:::</pre>
      </article>
      <article class="dialect-card">
        <div>
          <span class="dialect-layer-tag mono">Layer 4 · 其它生态专有派</span>
          <h3 class="dialect-name">Docsify / MkDocs / Hugo</h3>
          <p class="dialect-desc">Docsify 用 <code>?&gt;</code> / <code>!&gt;</code>（v5 新增 GFM 兼容）；MkDocs 用 <code>!!!</code> 加 4 空格缩进；Hugo/Zola 用模板 Shortcode。</p>
        </div>
        <pre class="dialect-snippet mono">!&gt; **升级注意**：请先备份配置。
!!! warning "升级注意"
{{&lt; callout "warning" &gt;}}</pre>
      </article>
    </div>
  `
}

function updateObservatoryDom(): void {
  const body = document.getElementById('observatory-tab-body')
  if (body) body.innerHTML = renderObservatoryPanelHtml()
  document.querySelectorAll<HTMLButtonElement>('[data-obs-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.obsTab === state.obsTab)
  })
  document.getElementById('heatmap-sort-select')?.addEventListener('change', (e) => {
    state.heatmapSort = (e.target as HTMLSelectElement).value as AppState['heatmapSort']
    updateObservatoryDom()
  })
}

function renderInspectorDrawerContent(row: LandscapeRow): string {
  const pinnedEntries = row.libs.pinnedPackages ? Object.entries(row.libs.pinnedPackages) : []
  const pinnedRowHtml =
    pinnedEntries.length > 0
      ? `<tr><th>实测锁定版本</th><td class="mono">${pinnedEntries.map(([k, v]) => `${escapeHtml(k)}@${escapeHtml(v)}`).join(' · ')}</td></tr>`
      : ''

  const allYears = Object.keys(row.yearlyCommits)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((y) => y >= row.createdYear)
  const maxCommits = Math.max(1, ...allYears.map((y) => row.yearlyCommits[String(y)] ?? 0))

  const barRowsHtml = allYears
    .map((y) => {
      const c = row.yearlyCommits[String(y)] ?? 0
      const pct = Math.max(0, Math.round((c / maxCommits) * 100))
      return `
        <div class="commit-bar-row mono">
          <span>${y}</span>
          <div class="commit-bar-track">
            <div class="commit-bar-fill${c === 0 ? ' zero' : ''}" style="width:${pct}%"></div>
          </div>
          <span style="text-align:right;font-weight:600;">${c.toLocaleString('en-US')}</span>
        </div>
      `
    })
    .join('')

  const wbLoadBtns = row.mounted
    ? `
      <button type="button" class="open-subsite-btn mono" data-drawer-wb="left" data-site-id="${escapeHtml(row.id)}" style="border-color:var(--accent-teal);color:var(--accent-teal);cursor:pointer;">⬅ 载入工作台左栏</button>
      <button type="button" class="open-subsite-btn mono" data-drawer-wb="right" data-site-id="${escapeHtml(row.id)}" style="border-color:var(--accent-copper);color:var(--accent-copper);cursor:pointer;">载入工作台右栏 ➡</button>
    `
    : ''

  return `
    <div class="drawer-header">
      <div>
        <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          <h3 style="margin:0;font-size:1.15rem;">${escapeHtml(row.name)}</h3>
          <span class="status-badge ${row.mounted ? 'mounted' : 'catalog'} mono">${row.mounted ? `★ 已挂载 ${escapeHtml(row.sitePath)}` : `📦 预留 ${escapeHtml(row.sitePath)}`}</span>
        </div>
        <div class="mono" style="font-size:0.76rem;color:var(--text-muted);margin-top:0.2rem;">
          docs/sites/${escapeHtml(row.id)}.json · ${escapeHtml(row.versionNote)}
        </div>
      </div>
      <button type="button" class="drawer-close-btn" id="drawer-close-btn">✕ 关闭</button>
    </div>

    <div class="drawer-body">
      <div class="drawer-link-row">
        <a class="open-subsite-btn mono" href="${escapeHtml(row.websiteUrl)}" target="_blank" rel="noopener">🌐 ${escapeHtml(row.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''))} ↗</a>
        <a class="open-subsite-btn mono" href="${escapeHtml(row.githubUrl)}" target="_blank" rel="noopener">GitHub (${escapeHtml(row.upstreamRepo)}) ↗</a>
        <a class="open-subsite-btn mono" href="${escapeHtml(row.packageUrl)}" target="_blank" rel="noopener">📦 包仓库 ↗</a>
        <a class="open-subsite-btn mono" href="${escapeHtml(row.profileRoute)}" target="_blank" rel="noopener">📖 ${escapeHtml(row.id)}.md ↗</a>
        <a class="open-subsite-btn mono" href="${escapeHtml(row.jsonRoute)}" target="_blank" rel="noopener">{ } ${escapeHtml(row.id)}.json ↗</a>
        ${wbLoadBtns}
      </div>

      <div>
        <h4 class="drawer-sec-title">1. 生命周期与 GitHub 指标</h4>
        <table class="drawer-kv-table">
          <tbody>
            <tr><th>开始时间</th><td class="mono">${escapeHtml(row.lifecycleDetail.startedAt)}（GitHub 创建：${escapeHtml(row.createdAt)}）</td></tr>
            <tr><th>活跃时间</th><td>${escapeHtml(row.lifecycleDetail.activePeriod)}</td></tr>
            <tr><th>废弃 / EOL</th><td>${escapeHtml(row.lifecycleDetail.deprecatedAt || '无（当前正常演进维护中）')}</td></tr>
            <tr><th>仓库状态</th><td class="mono">★ ${row.stars.toLocaleString('en-US')} Stars · Forks ${row.forks.toLocaleString('en-US')} · Issues ${row.openIssues} · ${escapeHtml(row.license)} · 最近推送 ${escapeHtml(row.pushedAt)}</td></tr>
            <tr><th>标签 (Tags)</th><td class="mono">${row.tags.map((t) => `#${escapeHtml(t)}`).join('  ')}</td></tr>
          </tbody>
        </table>
      </div>

      <div>
        <h4 class="drawer-sec-title">2. 底层依赖库清单 (Libs)</h4>
        <table class="drawer-kv-table">
          <tbody>
            <tr><th>运行时与打包</th><td>${escapeHtml(row.libs.runtime)} · ${escapeHtml(row.libs.bundler)}</td></tr>
            <tr><th>UI 与解析引擎</th><td>${escapeHtml(row.libs.uiFramework)} · <code>${escapeHtml(row.libs.markdownEngine)}</code></td></tr>
            <tr><th>高亮与搜索</th><td>${escapeHtml(row.libs.codeHighlight)} · ${escapeHtml(row.libs.searchEngine)}</td></tr>
            <tr><th>公式与图表库</th><td>${escapeHtml(row.libs.mathLib)} ； ${escapeHtml(row.libs.diagramLib)}</td></tr>
            <tr><th>核心 Libs</th><td class="mono">${escapeHtml(row.coreLibs.join(', '))}</td></tr>
            ${pinnedRowHtml}
          </tbody>
        </table>
      </div>

      <div>
        <h4 class="drawer-sec-title">3. GitHub 主分支历年提交曲线 (${row.createdYear}–2026 · 共 ${row.totalCommits.toLocaleString('en-US')} 次)</h4>
        <div class="drawer-commit-bars">${barRowsHtml}</div>
      </div>

      <div>
        <h4 class="drawer-sec-title">4. 目录与方言边界摘要</h4>
        <table class="drawer-kv-table">
          <tbody>
            <tr><th>目录与侧栏</th><td>${escapeHtml(row.directoryModel)}</td></tr>
            <tr><th>提示框方言</th><td>${escapeHtml(row.calloutDialect)}</td></tr>
            <tr><th>图表与公式</th><td>${escapeHtml(row.diagramAndMath)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `
}

function openDrawer(siteId: string): void {
  const row = dataset.landscapeRows.find((r) => r.id === siteId)
  if (!row) return
  state.drawerSiteId = siteId
  const drawer = document.getElementById('inspector-drawer')
  const backdrop = document.getElementById('drawer-backdrop')
  if (drawer && backdrop) {
    drawer.innerHTML = renderInspectorDrawerContent(row)
    drawer.classList.add('open')
    backdrop.classList.add('open')
    document.getElementById('drawer-close-btn')?.addEventListener('click', closeDrawer)
    drawer.querySelectorAll<HTMLButtonElement>('[data-drawer-wb]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const side = btn.dataset.drawerWb
        const id = btn.dataset.siteId
        if (id) {
          if (side === 'left') state.leftSiteId = id
          else state.rightSiteId = id
          state.leftConfigIndex = 0
          state.rightConfigIndex = 0
          state.customLeftUrl = null
          state.customRightUrl = null
          closeDrawer()
          updateWorkbenchDom()
          document.getElementById('workbench')?.scrollIntoView({ behavior: 'smooth' })
        }
      })
    })
  }
}

function closeDrawer(): void {
  state.drawerSiteId = null
  document.getElementById('inspector-drawer')?.classList.remove('open')
  document.getElementById('drawer-backdrop')?.classList.remove('open')
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

  const manifestFile = site.manifestShortPath || 'package.json'
  const headerPath =
    state.mode === 'render'
      ? routeUrl
      : state.mode === 'tree'
        ? `${site.submoduleDir}/`
        : state.mode === 'source'
          ? site.docs[state.chapterId]?.file || ''
          : site.configs[side === 'left' ? state.leftConfigIndex : state.rightConfigIndex]?.path ||
            `${site.submoduleDir === '.' ? '' : `${site.submoduleDir}/`}${manifestFile}`

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
        path: `${site.submoduleDir === '.' ? '' : `${site.submoduleDir}/`}${manifestFile}`,
        shortPath: manifestFile,
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

  const lockMasterBtn = document.getElementById('lock-master-left-btn')
  if (lockMasterBtn) {
    lockMasterBtn.classList.toggle('active', state.leftSiteId === 'master')
  }

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

// Build categorized <optgroup> options so 30+ mounted submodules stay neatly organized
function buildGroupedSiteOptionsHtml(): string {
  const groups = new Map<string, SiteEntry[]>()
  for (const s of dataset.sites) {
    const key = s.isMaster ? 'gfm' : s.ecosystem
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s)
  }

  return Array.from(groups.entries())
    .map(([eco, items]) => {
      const label = ECOSYSTEM_LABELS[eco] || eco
      const opts = items
        .map(
          (s) =>
            `<option value="${escapeHtml(s.id)}">${escapeHtml(s.family)} · ${escapeHtml(s.versionSeries)} (${escapeHtml(s.primaryVersion)})</option>`
        )
        .join('')
      return `<optgroup label="${escapeHtml(label)}">${opts}</optgroup>`
    })
    .join('')
}

// Auto-discover same-family multi-version pairs from mounted sites (zero hardcoding!)
function buildAutoFamilyPairsHtml(): string {
  const byFamily = new Map<string, SiteEntry[]>()
  for (const s of dataset.sites) {
    if (s.isMaster) continue
    if (!byFamily.has(s.family)) byFamily.set(s.family, [])
    byFamily.get(s.family)!.push(s)
  }

  const pills: string[] = []
  for (const [family, list] of byFamily.entries()) {
    if (list.length >= 2) {
      for (let i = 0; i < list.length - 1; i++) {
        const a = list[i]
        const b = list[i + 1]
        pills.push(
          `<button type="button" class="preset-pill" data-preset-left="${escapeHtml(a.id)}" data-preset-right="${escapeHtml(b.id)}">${escapeHtml(family)} ${escapeHtml(a.versionSeries)} ↔ ${escapeHtml(b.versionSeries)}</button>`
        )
      }
    }
  }
  return pills.join('')
}

function renderAppShell(): void {
  const app = document.getElementById('app')
  if (!app) return

  const siteOptionsHtml = buildGroupedSiteOptionsHtml()
  const autoFamilyPairsHtml = buildAutoFamilyPairsHtml()

  const chapterButtonsHtml = dataset.chapters
    .map(
      (c) =>
        `<button type="button" class="chapter-tab" data-chapter="${escapeHtml(c.id)}" id="chapter-btn-${escapeHtml(c.id)}">${escapeHtml(c.shortTitle)}</button>`
    )
    .join('')

  const totalSites = dataset.landscapeRows.length
  const mountedCount = dataset.landscapeRows.filter((r) => r.mounted).length
  const catalogCount = totalSites - mountedCount
  const activeCount = dataset.landscapeRows.filter((r) => !r.isEol).length
  const eolCount = dataset.landscapeRows.filter((r) => r.isEol).length
  const totalTrackedCommits = dataset.githubActivity.repos.reduce((acc, r) => acc + r.totalCommits, 0)

  const masterSite = dataset.sites.find((s) => s.isMaster)
  const mountedSites = dataset.sites.filter((s) => !s.isMaster)

  const subsitePopoverItemsHtml = mountedSites
    .map(
      (s) => `
        <a class="subsite-popover-item" href="${escapeHtml(s.basePath)}" target="_blank" rel="noopener">
          <div>
            <strong>${escapeHtml(s.family)} ${escapeHtml(s.versionSeries)}</strong>
            <div class="subsite-popover-ver mono">${escapeHtml(s.primaryPackage)}@${escapeHtml(s.primaryVersion)}</div>
          </div>
          <span class="mono" style="font-size:0.74rem;color:var(--accent-teal);">${escapeHtml(s.basePath)} ↗</span>
        </a>
      `
    )
    .join('')

  const hotTagsHtml = getHotTags(12)
    .map(
      ({ tag, count }) =>
        `<button type="button" class="tag-filter-chip mono" data-hot-tag="${escapeHtml(tag)}">#${escapeHtml(tag)} <span style="opacity:0.65;">(${count})</span></button>`
    )
    .join('')

  app.innerHTML = `
    <header class="masthead">
      <div class="container masthead-inner">
        <a href="./" class="brand" id="brand-home-link">
          <span class="brand-domain mono">page.2401.xyz</span>
          <span class="brand-pill mono">SSG Observatory</span>
          <span class="brand-sub">静态网站生成器全景图谱与实测对比台</span>
        </a>

        <nav class="nav-links" aria-label="主导航">
          <a class="nav-link" href="#directory">01 生态目录 (${totalSites})</a>
          <a class="nav-link" href="#workbench">02 分屏工作台</a>
          <a class="nav-link" href="#observatory">03 演化观测台</a>
          <a class="nav-link" href="#architecture">04 扩展规范</a>
        </nav>

        <div class="masthead-right">
          <details class="subsite-launcher" id="subsite-launcher">
            <summary class="mono">🚀 已挂载子站 (${mountedCount}) ▾</summary>
            <div class="subsite-popover">
              ${
                masterSite
                  ? `<div class="subsite-popover-group">唯一原始母版 (Canonical GFM)</div>
                     <a class="subsite-popover-item" href="${escapeHtml(masterSite.basePath)}" target="_blank" rel="noopener">
                       <div>
                         <strong>★ 本站母版 (docs/*.md)</strong>
                         <div class="subsite-popover-ver mono">标准 GFM + 站点元数据档案库</div>
                       </div>
                       <span class="mono" style="font-size:0.74rem;color:var(--accent-teal);">/master/ ↗</span>
                     </a>`
                  : ''
              }
              <div class="subsite-popover-group">同源独立版本子模块 (sites/*)</div>
              ${subsitePopoverItemsHtml}
            </div>
          </details>
          <a class="theme-btn mono" href="https://github.com/page2401/page2401.github.io" target="_blank" rel="noopener">GitHub ↗</a>
          <button type="button" class="theme-btn" id="theme-toggle-btn">☾ 深色</button>
        </div>
      </div>
    </header>

    <main class="container">
      <section class="hero-observatory">
        <div class="hero-grid">
          <div>
            <p class="intro-eyebrow mono">Canonical GFM Master · Per-Site JSON Metadata · Isolated Git Submodules</p>
            <h1 class="intro-title">面向持续扩展的静态网站生成器生态图谱与多版本实测台</h1>
            <p class="intro-desc">
              采用三层可扩展架构：<strong>① 唯一原始母版</strong>（<code>docs/*.md</code> 纯正 GFM 基准）──▶ <strong>② 独立结构化档案</strong>（每款生成器独立维护 <code>docs/sites/&lt;id&gt;.json</code> 官网、Tag、依赖 Libs 与 GitHub 历年提交节点）──▶ <strong>③ 按需挂载实测子站</strong>（<code>sites/&lt;id&gt;</code> 独立双分支子模块），未来扩展至数十款生成器亦无需改动页面骨架。
            </p>
            <div class="hero-actions">
              <a href="#workbench" class="hero-cta primary">⚡ 进入双栏实测工作台</a>
              <a href="#directory" class="hero-cta">🗂️ 筛选 ${totalSites} 款生成器图谱</a>
              <a href="/master/sites/" target="_blank" rel="noopener" class="hero-cta mono">★ /master/sites/ 档案总览 ↗</a>
            </div>
          </div>

          <div class="telemetry-grid">
            <div class="telemetry-card">
              <div class="telemetry-val teal mono">${totalSites} <span style="font-size:0.9rem;font-weight:600;">款</span></div>
              <div class="telemetry-label">1:1 独立站点元数据档案</div>
              <div class="telemetry-sub mono">${mountedCount} 已挂载实测 · ${catalogCount} 预留扩展位</div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-val mono">${(totalTrackedCommits / 1000).toFixed(1)}k+</div>
              <div class="telemetry-label">追踪 GitHub 历史主分支提交</div>
              <div class="telemetry-sub mono">${dataset.githubActivity.repos.length} 座上游官方仓 · 2008–2026</div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-val mono">5 <span style="font-size:0.9rem;font-weight:600;">大派系</span></div>
              <div class="telemetry-label">跨语言底层编译与运行时</div>
              <div class="telemetry-sub mono">Vue · React/Astro · Go/Rust · SPA · Py</div>
            </div>
            <div class="telemetry-card">
              <div class="telemetry-val mono">${dataset.chapters.length} <span style="font-size:0.9rem;font-weight:600;">章</span></div>
              <div class="telemetry-label">同源基准测试章节套件</div>
              <div class="telemetry-sub mono">标注 · Mermaid · LaTeX · 目录路由</div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-block" id="directory" style="border-top:none;">
        <div class="section-head-row">
          <div>
            <span class="section-step-tag mono">01 · Scalable Ecosystem Directory</span>
            <h2 class="section-heading">静态网站生成器（SSG）可扩展生态目录与独立 JSON 检索</h2>
            <p class="section-sub" style="margin-bottom:0;">所有卡片自动由 <code>docs/sites/*.json</code> 渲染生成：支持多流派筛选、热门 Tag 聚合、活跃度排序、11 年提交曲线预览，以及一键调入分屏工作台或滑出完整元数据抽屉。</p>
          </div>
          <div style="display:flex;gap:0.45rem;flex-wrap:wrap;">
            <a class="open-subsite-btn mono" href="https://github.com/page2401/page2401.github.io/tree/main/docs/sites" target="_blank" rel="noopener">GitHub docs/sites/*.json ↗</a>
          </div>
        </div>

        <div class="explorer-console">
          <div class="explorer-row">
            <div class="matrix-filters" role="tablist" aria-label="生态目录筛选">
              <button type="button" class="preset-pill active" data-dir-filter="all">全部 (${totalSites})</button>
              <button type="button" class="preset-pill" data-dir-filter="mounted">★ 已挂载 (${mountedCount})</button>
              <button type="button" class="preset-pill" data-dir-filter="catalog">📦 待挂载 (${catalogCount})</button>
              <button type="button" class="preset-pill" data-dir-filter="active">🟢 活跃 (${activeCount})</button>
              <button type="button" class="preset-pill" data-dir-filter="eol">⚠️ 停滞/EOL (${eolCount})</button>
              <button type="button" class="preset-pill" data-dir-filter="vue">Vue 生态</button>
              <button type="button" class="preset-pill" data-dir-filter="react-astro">React / Astro / MDX</button>
              <button type="button" class="preset-pill" data-dir-filter="native">Go / Rust 原生</button>
              <button type="button" class="preset-pill" data-dir-filter="runtime">零编译 SPA</button>
              <button type="button" class="preset-pill" data-dir-filter="python-classic">Python / 经典</button>
            </div>

            <div class="explorer-controls-right">
              <select id="directory-sort-select" class="sort-select" aria-label="排序方式">
                <option value="recommended">排序：推荐默认序</option>
                <option value="commits2026-desc">排序：2026 提交活跃度 ↓</option>
                <option value="stars-desc">排序：GitHub Stars ↓</option>
                <option value="total-commits-desc">排序：累计总提交数 ↓</option>
                <option value="newest">排序：立项时间最新 ↓</option>
                <option value="oldest">排序：立项时间最早 ↑</option>
              </select>
              <div class="segmented-tabs" role="tablist" aria-label="目录展示模式">
                <button type="button" class="seg-btn active" data-dir-view="grid">⊞ 卡片网格</button>
                <button type="button" class="seg-btn" data-dir-view="list">☰ 紧凑表格</button>
              </div>
            </div>
          </div>

          <div class="explorer-row">
            <div class="search-box-wrap">
              <input
                type="search"
                id="directory-search-input"
                class="explorer-search-input"
                placeholder="搜索名称、Tag、依赖 Lib 或方言特性 (如 rolldown / shiki / goldmark / pagefind / zero-build)..."
                aria-label="搜索生成器元数据"
              />
              <span class="search-kbd mono">/</span>
            </div>
            <div class="hot-tags-bar">
              <span class="hot-tags-label mono">热门 Tags:</span>
              ${hotTagsHtml}
            </div>
          </div>
        </div>

        <div class="explorer-status-bar mono">
          <span id="directory-status-count">当前匹配 ${totalSites} / ${totalSites} 款生成器</span>
          <button type="button" class="reset-filter-btn" id="directory-reset-btn" style="display:none;">✕ 重置全部筛选条件</button>
        </div>

        <div id="directory-results-container">
          ${renderDirectoryCardsOrListHtml()}
        </div>
      </section>

      <section class="section-block" id="workbench">
        <div class="section-head-row">
          <div>
            <span class="section-step-tag mono">02 · Side-by-Side Live Benchmark Workbench</span>
            <h2 class="section-heading">同源双栏实测对比工作台（母版 <code>docs/*.md</code> ↔ 派生子模块 <code>sites/*</code>）</h2>
            <p class="section-sub" style="margin-bottom:0;">下拉列表按技术流派自动分组（支持未来任意数量子站挂载）；可一键锁定左栏为 Pure GFM 母版，直观高亮各框架强加的方言改造成本。</p>
          </div>
        </div>

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
              <button type="button" class="seg-btn" data-mode="render" id="mode-render-btn">🖼️ 实测渲染分屏</button>
              <button type="button" class="seg-btn" data-mode="tree" id="mode-tree-btn">🗂️ 工程目录树对比</button>
              <button type="button" class="seg-btn" data-mode="source" id="mode-source-btn">📝 相似 *.md 源码对比</button>
              <button type="button" class="seg-btn" data-mode="config" id="mode-config-btn">⚙️ 工程配置对比</button>
            </div>
          </div>

          <div class="preset-bar" aria-label="快捷对比场景">
            <span class="preset-label">基准参照：</span>
            <button type="button" class="preset-pill" id="lock-master-left-btn">★ 左栏锁定 Pure GFM 母版</button>
            <span class="nav-divider" role="separator"></span>
            <span class="preset-label">自动识别同门跨代组合：</span>
            ${autoFamilyPairsHtml}
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

      <section class="section-block" id="observatory">
        <div class="obs-tabs-bar">
          <div>
            <span class="section-step-tag mono">03 · Cross-Generator Observatory</span>
            <h2 class="section-heading">全景演化与方言横向观测台</h2>
          </div>
          <div class="segmented-tabs" role="tablist" aria-label="观测台维度切换">
            <button type="button" class="seg-btn${state.obsTab === 'heatmap' ? ' active' : ''}" data-obs-tab="heatmap" id="obs-tab-heatmap">📊 GitHub 历年提交热力表 (2008–2026)</button>
            <button type="button" class="seg-btn${state.obsTab === 'matrix' ? ' active' : ''}" data-obs-tab="matrix" id="obs-tab-matrix">🧬 五维架构与方言对照表</button>
            <button type="button" class="seg-btn${state.obsTab === 'dialects' ? ' active' : ''}" data-obs-tab="dialects" id="obs-tab-dialects">📜 Markdown 方言分裂谱系</button>
          </div>
        </div>

        <div id="observatory-tab-body">
          ${renderObservatoryPanelHtml()}
        </div>
      </section>

      <section class="section-block" id="architecture">
        <div class="section-head-row">
          <div>
            <span class="section-step-tag mono">04 · Extensible Plugin Architecture</span>
            <h2 class="section-heading">两阶渐进式扩展架构（轻松接入第 17…N 款静态网站生成器）</h2>
            <p class="section-sub" style="margin-bottom:0;">新增一款静态网站生成器支持「先建档观测、后按需挂载实测」两阶解耦扩展，全流程零首页代码硬编码。</p>
          </div>
          <a class="open-subsite-btn mono" href="/master/benchmark-spec" target="_blank" rel="noopener">完整接入规范 (/master/benchmark-spec) ↗</a>
        </div>

        <div class="arch-grid">
          <div class="arch-card">
            <h3>阶梯一：轻量接入生态图鉴（仅需独立 JSON + MD）</h3>
            <p>无需立即搭建构建环境，在 <code>docs/sites/</code> 下放入成对的 <code>&lt;id&gt;.json</code> 与 <code>&lt;id&gt;.md</code>，运行同步脚本即可自动生成卡片、提交曲线与热力行。</p>
            <pre class="arch-pre mono">docs/sites/&lt;new-id&gt;.json   # 官网 / Tags / Libs
docs/sites/&lt;new-id&gt;.md     # 特色与架构痛点剖析
npm run sync:github        # 自动拉取 GitHub 历年提交</pre>
          </div>
          <div class="arch-card">
            <h3>阶梯二：挂载独立双分支实测子站（Git Submodule）</h3>
            <p>创建独立仓库 <code>page2401/&lt;new-id&gt;</code>（<code>main</code> 纯源码 + <code>page</code> 孤儿分支静态产物 + <code>.nojekyll</code>），挂载至 <code>sites/&lt;new-id&gt;</code> 即自动激活分屏实测。</p>
            <pre class="arch-pre mono">git submodule add -b main \
  https://github.com/page2401/&lt;new-id&gt;.git \
  sites/&lt;new-id&gt;
# 在 sites.config.json 注册 5 篇派生文档路径</pre>
          </div>
          <div class="arch-card">
            <h3>阶梯三：横向扩展新测试章节（05 / 06…）</h3>
            <p>未来测试全文搜索、国际化或代码高亮行批注时，只需先在母版 <code>docs/</code> 新增基准章节并在 <code>sites.config.json</code> 的 <code>chapters</code> 追加一项，分屏标签栏自动扩展。</p>
            <pre class="arch-pre mono">docs/05-search.md          # 先立 GFM 中立母版
  └─▶ sites/*/05-search.md # 各子站最小必要派生
  └─▶ sites.config.json    # 工作台自动多出一章</pre>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <span><strong>page.2401.xyz</strong> · 可扩展静态网站生成器生态图谱与多版本实测对比平台</span>
        <span class="mono">docs/*.md (Master) · docs/sites/*.json (Metadata) · sites/* (Submodules)</span>
      </div>
    </footer>

    <div class="drawer-backdrop" id="drawer-backdrop"></div>
    <aside class="inspector-drawer" id="inspector-drawer" aria-label="站点独立 JSON 元数据详情抽屉"></aside>
  `

  updateThemeButtonLabel()
  updateDirectoryDom()
  updateWorkbenchDom()
  updateObservatoryDom()

  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme)
  document.getElementById('drawer-backdrop')?.addEventListener('click', closeDrawer)

  // Close subsite launcher popover when clicking outside
  document.addEventListener('click', (e) => {
    const launcher = document.getElementById('subsite-launcher') as HTMLDetailsElement | null
    if (launcher && launcher.open && !launcher.contains(e.target as Node)) {
      launcher.open = false
    }
  })

  // Keyboard shortcuts: '/' to focus search, 'Escape' to close drawer/popover
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer()
      const launcher = document.getElementById('subsite-launcher') as HTMLDetailsElement | null
      if (launcher) launcher.open = false
    } else if (
      e.key === '/' &&
      document.activeElement?.tagName !== 'INPUT' &&
      document.activeElement?.tagName !== 'TEXTAREA' &&
      document.activeElement?.tagName !== 'SELECT'
    ) {
      e.preventDefault()
      document.getElementById('directory-search-input')?.focus()
    }
  })

  // Directory Section Delegated Events
  document.getElementById('directory')?.addEventListener('click', (e) => {
    const filterBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-dir-filter]')
    if (filterBtn && filterBtn.dataset.dirFilter) {
      state.dirFilter = filterBtn.dataset.dirFilter as DirectoryFilter
      updateDirectoryDom()
      return
    }

    const viewBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-dir-view]')
    if (viewBtn && viewBtn.dataset.dirView) {
      state.dirView = viewBtn.dataset.dirView as DirectoryView
      updateDirectoryDom()
      return
    }

    const hotTagBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-hot-tag]')
    if (hotTagBtn && hotTagBtn.dataset.hotTag) {
      const t = hotTagBtn.dataset.hotTag
      state.activeTag = state.activeTag === t ? null : t
      updateDirectoryDom()
      return
    }

    const cardTagBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-tag-pick]')
    if (cardTagBtn && cardTagBtn.dataset.tagPick) {
      const t = cardTagBtn.dataset.tagPick
      state.activeTag = state.activeTag === t ? null : t
      updateDirectoryDom()
      return
    }

    const paneBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-set-pane]')
    if (paneBtn && paneBtn.dataset.siteId) {
      if (paneBtn.dataset.setPane === 'left') {
        state.leftSiteId = paneBtn.dataset.siteId
      } else {
        state.rightSiteId = paneBtn.dataset.siteId
      }
      state.leftConfigIndex = 0
      state.rightConfigIndex = 0
      state.customLeftUrl = null
      state.customRightUrl = null
      updateWorkbenchDom()
      document.getElementById('workbench')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    const drawerBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-open-drawer]')
    if (drawerBtn && drawerBtn.dataset.openDrawer) {
      openDrawer(drawerBtn.dataset.openDrawer)
      return
    }

    const resetBtn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      '#directory-reset-btn, #empty-reset-btn'
    )
    if (resetBtn) {
      state.dirFilter = 'all'
      state.activeTag = null
      state.dirQuery = ''
      const input = document.getElementById('directory-search-input') as HTMLInputElement | null
      if (input) input.value = ''
      updateDirectoryDom()
    }
  })

  document.getElementById('directory-sort-select')?.addEventListener('change', (e) => {
    state.dirSort = (e.target as HTMLSelectElement).value as DirectorySort
    updateDirectoryDom()
  })

  document.getElementById('directory-search-input')?.addEventListener('input', (e) => {
    state.dirQuery = (e.target as HTMLInputElement).value
    updateDirectoryDom()
  })

  // Observatory Section Delegated Events
  document.getElementById('observatory')?.addEventListener('click', (e) => {
    const tabBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-obs-tab]')
    if (tabBtn && tabBtn.dataset.obsTab) {
      state.obsTab = tabBtn.dataset.obsTab as ObservatoryTab
      updateObservatoryDom()
      return
    }

    const drawerBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-open-drawer]')
    if (drawerBtn && drawerBtn.dataset.openDrawer) {
      openDrawer(drawerBtn.dataset.openDrawer)
    }
  })

  // Workbench Controls
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

  document.getElementById('lock-master-left-btn')?.addEventListener('click', () => {
    state.leftSiteId = 'master'
    if (state.rightSiteId === 'master') {
      state.rightSiteId = 'vitepress-v1'
    }
    state.leftConfigIndex = 0
    state.customLeftUrl = null
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
