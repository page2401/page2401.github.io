import { escapeHtml } from '../components/source-diff'
import type { DirectoryFilter, DirectorySort, DirectoryView, LandscapeRow } from '../types'
import {
  dataset,
  formatBuildMs,
  formatBytes,
  formatCompactNum,
  mountPageShell,
  openDrawer,
  renderSparklineSvg
} from '../shared/shell'

type WizardStack = 'any' | 'single-binary' | 'vue' | 'react' | 'python' | 'zero-build'
type WizardSpeed = 'any' | 'sub-second' | 'fast'
type WizardFeature = 'gfm-zero' | 'mdx-ui' | 'wikilinks' | 'math-academic' | 'zero-js' | 'ai-llms'

interface DirectoryPageState {
  dirFilter: DirectoryFilter
  dirSort: DirectorySort
  dirView: DirectoryView
  dirQuery: string
  activeTag: string | null
  wizardOpen: boolean
  wizStack: WizardStack
  wizSpeed: WizardSpeed
  wizFeature: WizardFeature
}

function loadDirectoryState(): DirectoryPageState {
  const params = new URLSearchParams(window.location.search)
  return {
    dirFilter: (params.get('filter') as DirectoryFilter) || 'all',
    dirSort: (params.get('sort') as DirectorySort) || 'recommended',
    dirView: params.get('view') === 'list' ? 'list' : 'grid',
    dirQuery: params.get('q') || '',
    activeTag: params.get('tag') || null,
    wizardOpen: params.get('wizard') === '1',
    wizStack: 'any',
    wizSpeed: 'any',
    wizFeature: 'gfm-zero'
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
  if (state.wizardOpen) params.set('wizard', '1')
  const qs = params.toString()
  window.history.replaceState(
    null,
    '',
    qs ? `${window.location.pathname}?${qs}` : window.location.pathname
  )
}

interface ScoredCandidate {
  row: LandscapeRow
  score: number
  reasons: string[]
}

function computeWizardRecommendations(): ScoredCandidate[] {
  const candidates: ScoredCandidate[] = []

  for (const row of dataset.landscapeRows) {
    if (row.id === 'gitbook') continue // Cloud SaaS without local open-source CLI
    let score = 40
    const reasons: string[] = []

    if (row.isEol) {
      score -= 60
      reasons.push('已停滞/EOL')
    } else if (row.commits2026 >= 100) {
      score += 10
      reasons.push(`26年活跃 (${row.commits2026} commits)`)
    }

    if (row.mounted) {
      score += 6
    }

    // 1. Stack / runtime dimension
    const tags = new Set(row.tags)
    if (state.wizStack === 'single-binary') {
      if (tags.has('single-binary') || tags.has('golang') || tags.has('rust')) {
        score += 36
        reasons.push('零 Node 依赖单二进制')
      } else {
        score -= 30
      }
    } else if (state.wizStack === 'vue') {
      if (row.ecosystem === 'vue' || tags.has('vue3') || tags.has('nuxt')) {
        score += 36
        reasons.push('Vue 3 生态技术栈')
      } else {
        score -= 30
      }
    } else if (state.wizStack === 'react') {
      if (row.ecosystem === 'react-astro') {
        score += 36
        reasons.push('React / Astro / MDX 生态')
      } else {
        score -= 30
      }
    } else if (state.wizStack === 'python') {
      if (tags.has('python')) {
        score += 38
        reasons.push('Python 原生工具链')
      } else {
        score -= 30
      }
    } else if (state.wizStack === 'zero-build') {
      if (row.benchmark?.isRuntimeSpa || tags.has('zero-build')) {
        score += 42
        reasons.push('无需编译直接静态托管 .md')
      } else {
        score -= 28
      }
    }

    // 2. Cold build speed dimension
    const b = row.benchmark
    if (state.wizSpeed === 'sub-second') {
      if (b && !b.isRuntimeSpa && b.coldBuildMs <= 1500) {
        score += 32
        reasons.push(`实测 ${formatBuildMs(b.coldBuildMs)} 闪电编译`)
      } else if (b && b.isRuntimeSpa) {
        score += 18
        reasons.push('零预编译即时预览')
      } else if (b && b.coldBuildMs > 10000) {
        score -= 25
      }
    } else if (state.wizSpeed === 'fast') {
      if (b && b.coldBuildMs <= 16000) {
        score += 22
        reasons.push(`实测冷构建 ${formatBuildMs(b.coldBuildMs, b.isRuntimeSpa)}`)
      } else if (b && b.coldBuildMs > 30000) {
        score -= 18
      }
    }

    // 3. Core feature / dialect dimension
    const calloutText = row.calloutDialect.toLowerCase()
    if (state.wizFeature === 'gfm-zero') {
      if (
        tags.has('gfm-alerts') ||
        calloutText.includes('原生支持') ||
        calloutText.includes('原生渲染') ||
        calloutText.includes('原生解析') ||
        calloutText.includes('100% 零改造')
      ) {
        score += 28
        reasons.push('零改造兼容 GitHub [!NOTE]')
      }
    } else if (state.wizFeature === 'mdx-ui') {
      if (tags.has('mdx') || tags.has('mdc') || row.ecosystem === 'vue') {
        score += 28
        reasons.push('支持 JSX/Vue 交互式内嵌组件')
      }
    } else if (state.wizFeature === 'wikilinks') {
      if (row.id === 'quartz' || tags.has('wikilinks') || tags.has('obsidian')) {
        score += 48
        reasons.push('原生 [[双向链接]] 与知识图谱')
      }
    } else if (state.wizFeature === 'math-academic') {
      if (row.id === 'sphinx') {
        score += 44
        reasons.push('原生自动公式编号与 {eq} 交叉引用')
      } else if (row.id === 'mkdocs-material' || row.id === 'vitepress-v2' || row.id === 'quarto') {
        score += 24
        reasons.push('成熟科研公式与图表管线')
      }
    } else if (state.wizFeature === 'zero-js') {
      if (b && b.proseScriptCount === 0) {
        score += 42
        reasons.push('实测正文页 0 个 <script> 纯静态')
      } else if (row.id === 'astro7-starlight' || row.id === 'hugo' || row.id === 'zola' || row.id === 'lume') {
        score += 24
        reasons.push('极简按需脚本 / Islands 架构')
      }
    } else if (state.wizFeature === 'ai-llms') {
      if (b?.hasLlmsTxt) {
        score += 36
        reasons.push('构建期原生直出 llms.txt 语料')
      }
      if (b?.hasOfflineSearch) {
        score += 20
        reasons.push(`内置 ${b.offlineSearchKind}`)
      }
    }

    candidates.push({ row, score: Math.max(5, Math.min(99, score)), reasons: reasons.slice(0, 3) })
  }

  candidates.sort((a, b) => b.score - a.score || b.row.commits2026 - a.row.commits2026)
  return candidates.slice(0, 3)
}

function renderWizardInnerHtml(): string {
  const top3 = computeWizardRecommendations()
  const mountedTop = top3.filter((c) => c.row.mounted)
  const comparePairHref =
    mountedTop.length >= 2
      ? `/workbench/?left=${encodeURIComponent(mountedTop[0].row.id)}&right=${encodeURIComponent(mountedTop[1].row.id)}&doc=01-annotations&mode=render`
      : mountedTop.length === 1
        ? `/workbench/?left=master&right=${encodeURIComponent(mountedTop[0].row.id)}&doc=01-annotations&mode=render`
        : '/workbench/'

  const cardsHtml = top3
    .map(({ row, score, reasons }, idx) => {
      const rankLabel = idx === 0 ? '🥇 首选推荐' : idx === 1 ? '🥈 次选方案' : '🥉 备选方案'
      const reasonTags = reasons
        .map((r) => `<span class="wiz-reason-chip mono">✓ ${escapeHtml(r)}</span>`)
        .join('')
      const wbAction = row.mounted
        ? `<a class="card-act-btn wb mono" href="/workbench/?left=master&right=${encodeURIComponent(row.id)}">⇄ 与母版对比</a>`
        : ''
      return `
        <div class="wiz-rec-card${idx === 0 ? ' is-top1' : ''}" data-wiz-rec="${escapeHtml(row.id)}">
          <div>
            <div class="wiz-rec-head">
              <span class="wiz-rank mono">${rankLabel}</span>
              <span class="wiz-score mono">匹配分 ${score}</span>
            </div>
            <div class="wiz-rec-name">
              <strong>${escapeHtml(row.name)}</strong>
              <span class="status-badge ${row.mounted ? 'mounted' : 'catalog'} mono">${escapeHtml(row.id)}</span>
            </div>
            <p class="wiz-rec-desc">${escapeHtml(row.tagline)}</p>
            <div class="wiz-reasons">${reasonTags}</div>
          </div>
          <div class="wiz-rec-foot">
            ${wbAction}
            <button type="button" class="card-act-btn mono" data-open-drawer="${escapeHtml(row.id)}">🔍 JSON</button>
          </div>
        </div>
      `
    })
    .join('')

  const optBtn = (group: 'stack' | 'speed' | 'feature', val: string, label: string) => {
    const active =
      (group === 'stack' && state.wizStack === val) ||
      (group === 'speed' && state.wizSpeed === val) ||
      (group === 'feature' && state.wizFeature === val)
    return `<button type="button" class="preset-pill${active ? ' active' : ''}" data-wiz-group="${group}" data-wiz-val="${val}">${label}</button>`
  }

  return `
    <div class="wizard-controls">
      <div class="wiz-question-row">
        <span class="wiz-q-label mono">1. 团队运行时偏好</span>
        <div class="wiz-pills">
          ${optBtn('stack', 'any', '不限环境')}
          ${optBtn('stack', 'single-binary', 'Go / Rust 单二进制')}
          ${optBtn('stack', 'vue', 'Vue / Nuxt 生态')}
          ${optBtn('stack', 'react', 'React / Next.js / Astro')}
          ${optBtn('stack', 'python', 'Python 工具链')}
          ${optBtn('stack', 'zero-build', '零编译纯静态 SPA')}
        </div>
      </div>
      <div class="wiz-question-row">
        <span class="wiz-q-label mono">2. 冷构建耗时要求</span>
        <div class="wiz-pills">
          ${optBtn('speed', 'any', '不限构建耗时')}
          ${optBtn('speed', 'sub-second', '⚡ 亚秒级闪电编译 (<1.5s)')}
          ${optBtn('speed', 'fast', '🚀 现代高速构建 (<16s)')}
        </div>
      </div>
      <div class="wiz-question-row">
        <span class="wiz-q-label mono">3. 核心文档场景诉求</span>
        <div class="wiz-pills">
          ${optBtn('feature', 'gfm-zero', '原生兼容 GFM [!NOTE]')}
          ${optBtn('feature', 'mdx-ui', 'JSX / Vue 交互组件')}
          ${optBtn('feature', 'wikilinks', 'Obsidian [[双向链接]]')}
          ${optBtn('feature', 'math-academic', '重度公式 / 学术编号')}
          ${optBtn('feature', 'zero-js', '极致 0 客户端 JS')}
          ${optBtn('feature', 'ai-llms', '内置离线检索 / llms.txt')}
        </div>
      </div>
    </div>

    <div class="wizard-results-head">
      <span class="mono" style="font-size:0.78rem;color:var(--text-secondary);">基于 26 份独立 JSON 档案与实测 <code>benchmark</code> 数据实时打分推荐（自动排除 EOL 停更框架）：</span>
      ${
        mountedTop.length >= 2
          ? `<a class="hero-cta primary" style="padding:0.38rem 0.85rem;font-size:0.78rem;" id="wiz-compare-top2-link" href="${comparePairHref}">⚡ 一键将 Top 1 (${escapeHtml(mountedTop[0].row.name)}) ↔ Top 2 (${escapeHtml(mountedTop[1].row.name)}) 送入分屏对比 →</a>`
          : ''
      }
    </div>

    <div class="wizard-rec-grid">${cardsHtml}</div>
  `
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
    case 'build-asc':
      sorted.sort((a, b) => {
        const ba = a.benchmark
        const bb = b.benchmark
        if (Boolean(ba) !== Boolean(bb)) return ba ? -1 : 1
        if (ba && bb) {
          if (ba.isRuntimeSpa !== bb.isRuntimeSpa) return ba.isRuntimeSpa ? 1 : -1
          return ba.coldBuildMs - bb.coldBuildMs
        }
        return a.order - b.order
      })
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
              <th>打包管线与解析引擎</th>
              <th>生命周期与活跃度</th>
              <th>16–26 提交曲线</th>
              <th>工作台与 JSON</th>
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
        : `<span class="status-badge catalog mono">📦 sites/${escapeHtml(row.id)}</span>`
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
              ${
                row.benchmark
                  ? `<div style="color:var(--accent-teal);"><strong>实测:</strong> ⚡ ${escapeHtml(formatBuildMs(row.benchmark.coldBuildMs, row.benchmark.isRuntimeSpa))} · 总产物 ${escapeHtml(formatBytes(row.benchmark.totalBytes))} · JS Gzip ${escapeHtml(formatBytes(row.benchmark.jsGzipBytes))}</div>`
                  : ''
              }
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

function updateWizardDom(): void {
  const wizBody = document.getElementById('wizard-body-container')
  if (wizBody) wizBody.innerHTML = renderWizardInnerHtml()
  syncDirectoryUrl()
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
        <h1 class="section-heading">静态网站生成器（SSG）全景生态目录与选型决策器</h1>
        <p class="section-sub" style="margin-bottom:0;">收录 ${totalSites} 款生成器独立的 <code>docs/sites/&lt;id&gt;.json</code> 元数据、底层依赖 Libs 与构建性能实测；支持交互式选型打分推荐并一键送入 <code>/workbench/</code> 分屏验证。</p>
      </div>
      <div style="display:flex;gap:0.45rem;flex-wrap:wrap;">
        <button type="button" class="open-subsite-btn mono" id="hero-toggle-wizard-btn" style="border-color:var(--accent-teal);color:var(--accent-teal);cursor:pointer;">🎯 30 秒选型决策器</button>
        <a class="open-subsite-btn mono" href="/master/sites/" target="_blank" rel="noopener">/master/sites/ 总览 ↗</a>
        <a class="open-subsite-btn mono" href="https://github.com/page2401/page2401.github.io/tree/main/docs/sites" target="_blank" rel="noopener">GitHub docs/sites/*.json ↗</a>
      </div>
    </div>

    <section id="directory-page-body" style="padding-bottom:2.5rem;">
      <details class="wizard-panel" id="ssg-selector-wizard"${state.wizardOpen ? ' open' : ''}>
        <summary class="wizard-summary">
          <div>
            <span class="wizard-badge mono">SELECTOR WIZARD</span>
            <strong>🎯 交互式 SSG 选型决策器</strong>
            <span class="wizard-summary-sub">选择团队语言栈、编译耗时底线与核心语法诉求，实时计算 Top 3 推荐并一键并排实测</span>
          </div>
          <span class="mono" style="font-size:0.76rem;color:var(--accent-teal);">展开 / 收起 ▾</span>
        </summary>
        <div class="wizard-body" id="wizard-body-container">
          ${renderWizardInnerHtml()}
        </div>
      </details>

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
              <option value="build-asc"${state.dirSort === 'build-asc' ? ' selected' : ''}>排序：实测冷构建最快 ↑</option>
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

  const wizDetails = document.getElementById('ssg-selector-wizard') as HTMLDetailsElement | null
  wizDetails?.addEventListener('toggle', () => {
    state.wizardOpen = Boolean(wizDetails.open)
    syncDirectoryUrl()
  })

  document.getElementById('hero-toggle-wizard-btn')?.addEventListener('click', () => {
    if (!wizDetails) return
    wizDetails.open = !wizDetails.open
    if (wizDetails.open) {
      wizDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  })

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
    const wizBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-wiz-group]')
    if (wizBtn?.dataset.wizGroup && wizBtn.dataset.wizVal) {
      const g = wizBtn.dataset.wizGroup
      const v = wizBtn.dataset.wizVal
      if (g === 'stack') state.wizStack = v as WizardStack
      else if (g === 'speed') state.wizSpeed = v as WizardSpeed
      else if (g === 'feature') state.wizFeature = v as WizardFeature
      updateWizardDom()
      return
    }

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
      const searchInput = document.getElementById('directory-search-input') as HTMLInputElement | null
      if (searchInput) searchInput.value = ''
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
