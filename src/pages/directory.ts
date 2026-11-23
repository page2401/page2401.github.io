import { escapeHtml } from '../components/source-diff'
import type { DirectoryFilter, DirectorySort, DirectoryView, LandscapeRow } from '../types'
import { dataset, formatCompactNum, mountPageShell, openDrawer, renderSparklineSvg } from '../shared/shell'

interface DirectoryPageState {
  dirFilter: DirectoryFilter
  dirSort: DirectorySort
  dirView: DirectoryView
  dirQuery: string
  activeTag: string | null
}

function loadDirectoryState(): DirectoryPageState {
  const params = new URLSearchParams(window.location.search)
  return {
    dirFilter: (params.get('filter') as DirectoryFilter) || 'all',
    dirSort: (params.get('sort') as DirectorySort) || 'recommended',
    dirView: params.get('view') === 'list' ? 'list' : 'grid',
    dirQuery: params.get('q') || '',
    activeTag: params.get('tag') || null
  }
}

const state = loadDirectoryState()

function syncDirectoryUrl(): void {
  const params = new URLSearchParams()
  if (state.dirFilter !== 'all') params.set('filter', state.dirFilter)
  if (state.dirSort !== 'recommended') params.set('sort', state.dirSort)
  if (state.dirView !== 'grid') params.set('view', state.dirView)
  if (state.dirQuery.trim()) params.set('q', state.dirQuery.trim())
  if (state.activeTag) params.set('tag', state.activeTag)
  const qs = params.toString()
  window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname)
}

function getHotTags(limit = 14): Array<{ tag: string; count: number }> {
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

function renderResultsHtml(): string {
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
            <a class="card-act-btn wb" href="/workbench/?left=${encodeURIComponent(row.id)}&right=vitepress-v1" title="载入分屏工作台左栏">⬅ 左栏</a>
            <a class="card-act-btn wb" href="/workbench/?left=master&right=${encodeURIComponent(row.id)}" title="与母版分屏对比">右栏 ➡</a>
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
          <a class="card-act-btn wb" href="/workbench/?left=${encodeURIComponent(row.id)}&right=vitepress-v1" title="设为分屏工作台左栏">⬅ 左栏</a>
          <a class="card-act-btn wb" href="/workbench/?left=master&right=${encodeURIComponent(row.id)}" title="设为分屏工作台右栏（与母版对照）">右栏 ➡</a>
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
  if (container) container.innerHTML = renderResultsHtml()

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
  syncDirectoryUrl()
}

function renderDirectoryPage(): void {
  const totalSites = dataset.landscapeRows.length
  const mountedCount = dataset.landscapeRows.filter((r) => r.mounted).length
  const catalogCount = totalSites - mountedCount
  const activeCount = dataset.landscapeRows.filter((r) => !r.isEol).length
  const eolCount = dataset.landscapeRows.filter((r) => r.isEol).length

  const hotTagsHtml = getHotTags(14)
    .map(
      ({ tag, count }) =>
        `<button type="button" class="tag-filter-chip mono" data-hot-tag="${escapeHtml(tag)}">#${escapeHtml(tag)} <span style="opacity:0.65;">(${count})</span></button>`
    )
    .join('')

  const html = `
    <div class="page-hero-compact">
      <div>
        <span class="section-step-tag mono">01 · Scalable Ecosystem Directory (/directory/)</span>
        <h1 class="section-heading">静态网站生成器（SSG）全景生态目录与独立 JSON 检索</h1>
        <p class="section-sub" style="margin-bottom:0;">收录 ${totalSites} 款生成器独立的 <code>docs/sites/&lt;id&gt;.json</code> 元数据、底层依赖 Libs 与 11 年提交曲线；点击已挂载卡片上的按钮可直接携参进入 <code>/workbench/</code> 分屏对比。</p>
      </div>
      <div style="display:flex;gap:0.45rem;flex-wrap:wrap;">
        <a class="open-subsite-btn mono" href="/master/sites/" target="_blank" rel="noopener">/master/sites/ 总览 ↗</a>
        <a class="open-subsite-btn mono" href="https://github.com/page2401/page2401.github.io/tree/main/docs/sites" target="_blank" rel="noopener">GitHub docs/sites/*.json ↗</a>
      </div>
    </div>

    <section id="directory-page-body" style="padding-bottom:2.5rem;">
      <div class="explorer-console">
        <div class="explorer-row">
          <div class="matrix-filters" role="tablist" aria-label="生态目录筛选">
            <button type="button" class="preset-pill" data-dir-filter="all">全部 (${totalSites})</button>
            <button type="button" class="preset-pill" data-dir-filter="mounted">★ 已挂载 (${mountedCount})</button>
            <button type="button" class="preset-pill" data-dir-filter="catalog">📦 待挂载 (${catalogCount})</button>
            <button type="button" class="preset-pill" data-dir-filter="active">🟢 活跃 (${activeCount})</button>
            <button type="button" class="preset-pill" data-dir-filter="eol">⚠️ 停滞/EOL (${eolCount})</button>
            <button type="button" class="preset-pill" data-dir-filter="vue">Vue 生态</button>
            <button type="button" class="preset-pill" data-dir-filter="react-astro">React / Astro / MDX</button>
            <button type="button" class="preset-pill" data-dir-filter="native">Go / Rust / Deno</button>
            <button type="button" class="preset-pill" data-dir-filter="runtime">零编译 / 电子书</button>
            <button type="button" class="preset-pill" data-dir-filter="python-classic">Python / 经典</button>
          </div>

          <div class="explorer-controls-right">
            <select id="directory-sort-select" class="sort-select" aria-label="排序方式">
              <option value="recommended"${state.dirSort === 'recommended' ? ' selected' : ''}>排序：推荐默认序</option>
              <option value="commits2026-desc"${state.dirSort === 'commits2026-desc' ? ' selected' : ''}>排序：2026 提交活跃度 ↓</option>
              <option value="stars-desc"${state.dirSort === 'stars-desc' ? ' selected' : ''}>排序：GitHub Stars ↓</option>
              <option value="total-commits-desc"${state.dirSort === 'total-commits-desc' ? ' selected' : ''}>排序：累计总提交数 ↓</option>
              <option value="newest"${state.dirSort === 'newest' ? ' selected' : ''}>排序：立项时间最新 ↓</option>
              <option value="oldest"${state.dirSort === 'oldest' ? ' selected' : ''}>排序：立项时间最早 ↑</option>
            </select>
            <div class="segmented-tabs" role="tablist" aria-label="目录展示模式">
              <button type="button" class="seg-btn" data-dir-view="grid">⊞ 卡片网格</button>
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
              value="${escapeHtml(state.dirQuery)}"
              placeholder="按 / 搜索名称、Tag、依赖 Lib 或方言特性 (如 rolldown / shiki / goldmark / pagefind / wikilinks)..."
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
        <span id="directory-status-count"></span>
        <button type="button" class="reset-filter-btn" id="directory-reset-btn" style="display:none;">✕ 重置全部筛选条件</button>
      </div>

      <div id="directory-results-container"></div>
    </section>
  `

  mountPageShell('directory', html)
  updateDirectoryDom()

  document.addEventListener('keydown', (e) => {
    if (
      e.key === '/' &&
      document.activeElement?.tagName !== 'INPUT' &&
      document.activeElement?.tagName !== 'SELECT'
    ) {
      e.preventDefault()
      document.getElementById('directory-search-input')?.focus()
    }
  })

  document.getElementById('directory-page-body')?.addEventListener('click', (e) => {
    const filterBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-dir-filter]')
    if (filterBtn?.dataset.dirFilter) {
      state.dirFilter = filterBtn.dataset.dirFilter as DirectoryFilter
      updateDirectoryDom()
      return
    }
    const viewBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-dir-view]')
    if (viewBtn?.dataset.dirView) {
      state.dirView = viewBtn.dataset.dirView as DirectoryView
      updateDirectoryDom()
      return
    }
    const hotTagBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-hot-tag]')
    if (hotTagBtn?.dataset.hotTag) {
      const t = hotTagBtn.dataset.hotTag
      state.activeTag = state.activeTag === t ? null : t
      updateDirectoryDom()
      return
    }
    const cardTagBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-tag-pick]')
    if (cardTagBtn?.dataset.tagPick) {
      const t = cardTagBtn.dataset.tagPick
      state.activeTag = state.activeTag === t ? null : t
      updateDirectoryDom()
      return
    }
    const drawerBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-open-drawer]')
    if (drawerBtn?.dataset.openDrawer) {
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
}

renderDirectoryPage()
