import { escapeHtml } from '../components/source-diff'
import type { GitHubRepoActivity, LandscapeRow, ObservatoryTab } from '../types'
import {
  dataset,
  formatBuildMs,
  formatBytes,
  formatCompactNum,
  formatRenderMs,
  mountPageShell,
  openDrawer
} from '../shared/shell'

type HeatmapSort = 'default' | 'commits2026' | 'total' | 'stars' | 'oldest'
type BenchmarkSort =
  | 'build-asc'
  | 'render-asc'
  | 'nav-asc'
  | 'diagram-asc'
  | 'transfer-asc'
  | 'js-gzip-asc'
  | 'total-bytes-asc'
  | 'default'

const VALID_BENCH_SORTS: BenchmarkSort[] = [
  'build-asc',
  'render-asc',
  'nav-asc',
  'diagram-asc',
  'transfer-asc',
  'js-gzip-asc',
  'total-bytes-asc',
  'default'
]

interface ObservatoryState {
  obsTab: ObservatoryTab
  heatmapSort: HeatmapSort
  benchSort: BenchmarkSort
}

function loadObservatoryState(): ObservatoryState {
  const params = new URLSearchParams(window.location.search)
  const tabParam = params.get('tab') as ObservatoryTab | null
  const sortParam = params.get('sort')
  return {
    obsTab:
      tabParam && ['heatmap', 'benchmark', 'matrix', 'dialects'].includes(tabParam)
        ? tabParam
        : 'heatmap',
    heatmapSort:
      sortParam && ['default', 'commits2026', 'total', 'stars', 'oldest'].includes(sortParam)
        ? (sortParam as HeatmapSort)
        : 'default',
    benchSort:
      sortParam && VALID_BENCH_SORTS.includes(sortParam as BenchmarkSort)
        ? (sortParam as BenchmarkSort)
        : 'build-asc'
  }
}

const state = loadObservatoryState()

function syncObservatoryUrl(): void {
  const params = new URLSearchParams()
  if (state.obsTab !== 'heatmap') params.set('tab', state.obsTab)
  if (state.obsTab === 'heatmap' && state.heatmapSort !== 'default') {
    params.set('sort', state.heatmapSort)
  } else if (state.obsTab === 'benchmark' && state.benchSort !== 'build-asc') {
    params.set('sort', state.benchSort)
  }
  const qs = params.toString()
  window.history.replaceState(
    null,
    '',
    qs ? `${window.location.pathname}?${qs}` : window.location.pathname
  )
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

function getSortedBenchRows(): LandscapeRow[] {
  const measured = dataset.landscapeRows.filter((r) => r.mounted && r.benchmark)
  switch (state.benchSort) {
    case 'render-asc':
      measured.sort(
        (a, b) =>
          (a.benchmark!.viewRender?.proseReadyMs ?? 999999) -
          (b.benchmark!.viewRender?.proseReadyMs ?? 999999)
      )
      break
    case 'nav-asc':
      measured.sort(
        (a, b) =>
          (a.benchmark!.viewRender?.warmNavMs ?? 999999) -
          (b.benchmark!.viewRender?.warmNavMs ?? 999999)
      )
      break
    case 'diagram-asc':
      measured.sort(
        (a, b) =>
          (a.benchmark!.viewRender?.diagramReadyMs ?? 999999) -
          (b.benchmark!.viewRender?.diagramReadyMs ?? 999999)
      )
      break
    case 'transfer-asc':
      measured.sort(
        (a, b) =>
          (a.benchmark!.viewRender?.proseTransferBytes ?? 999999999) -
          (b.benchmark!.viewRender?.proseTransferBytes ?? 999999999)
      )
      break
    case 'js-gzip-asc':
      measured.sort((a, b) => a.benchmark!.jsGzipBytes - b.benchmark!.jsGzipBytes)
      break
    case 'total-bytes-asc':
      measured.sort((a, b) => a.benchmark!.totalBytes - b.benchmark!.totalBytes)
      break
    case 'default':
      measured.sort((a, b) => a.order - b.order)
      break
    case 'build-asc':
    default:
      measured.sort((a, b) => {
        if (a.benchmark!.isRuntimeSpa !== b.benchmark!.isRuntimeSpa) {
          return a.benchmark!.isRuntimeSpa ? 1 : -1
        }
        return a.benchmark!.coldBuildMs - b.benchmark!.coldBuildMs
      })
      break
  }
  return measured
}

function renderBenchmarkTabHtml(): string {
  const rows = getSortedBenchRows()
  if (rows.length === 0) {
    return `
      <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:10px;padding:2rem;color:var(--text-muted);">
        尚未采集构建性能数据，请运行 <code>npm run sync:benchmarks</code> 生成实测遥测节点。
      </div>
    `
  }

  const compiledRows = rows.filter((r) => !r.benchmark!.isRuntimeSpa)
  const fastestCompiled = [...compiledRows].sort(
    (a, b) => a.benchmark!.coldBuildMs - b.benchmark!.coldBuildMs
  )[0]
  const slowestCompiled = [...compiledRows].sort(
    (a, b) => b.benchmark!.coldBuildMs - a.benchmark!.coldBuildMs
  )[0]
  const withRender = rows.filter((r) => r.benchmark?.viewRender)
  const fastestProse = [...withRender].sort(
    (a, b) => a.benchmark!.viewRender!.proseReadyMs - b.benchmark!.viewRender!.proseReadyMs
  )[0]
  const fastestWarmNav = [...withRender].sort(
    (a, b) => a.benchmark!.viewRender!.warmNavMs - b.benchmark!.viewRender!.warmNavMs
  )[0]
  const lightestTransfer = [...withRender].sort(
    (a, b) =>
      a.benchmark!.viewRender!.proseTransferBytes - b.benchmark!.viewRender!.proseTransferBytes
  )[0]

  const searchCount = rows.filter((r) => r.benchmark!.hasOfflineSearch).length
  const llmsCount = rows.filter((r) => r.benchmark!.hasLlmsTxt).length
  const maxBuildMs = Math.max(100, ...rows.map((r) => r.benchmark!.coldBuildMs))
  const maxProseMs = Math.max(
    400,
    ...withRender.map((r) => r.benchmark!.viewRender!.proseReadyMs)
  )
  const maxTotalBytes = Math.max(1024, ...rows.map((r) => r.benchmark!.totalBytes))
  const speedRatio =
    fastestCompiled && slowestCompiled && fastestCompiled.benchmark!.coldBuildMs > 0
      ? Math.round(slowestCompiled.benchmark!.coldBuildMs / fastestCompiled.benchmark!.coldBuildMs)
      : 1

  const measuredDate = rows[0]?.benchmark?.measuredAt?.slice(0, 10) || ''

  const trs = rows
    .map((row, idx) => {
      const b = row.benchmark!
      const vr = b.viewRender
      // Log-scaled width so sub-200ms binaries and 179s bundlers are both legible on one chart
      const logMin = Math.log10(15)
      const logMax = Math.log10(Math.max(1000, maxBuildMs))
      const logCur = Math.log10(Math.max(15, b.coldBuildMs))
      const speedPct = b.isRuntimeSpa
        ? 6
        : Math.max(5, Math.min(100, Math.round(((logCur - logMin) / (logMax - logMin)) * 100)))

      const speedTierCls = b.isRuntimeSpa
        ? 'tier-spa'
        : b.coldBuildMs < 250
          ? 'tier-instant'
          : b.coldBuildMs < 3500
            ? 'tier-fast'
            : 'tier-heavy'

      let renderCellHtml = `<td class="bench-render-cell mono" style="color:var(--text-muted);font-size:0.76rem;">未采集</td>`
      if (vr) {
        const rLogMin = Math.log10(120)
        const rLogMax = Math.log10(Math.max(1000, maxProseMs))
        const rLogCur = Math.log10(Math.max(120, vr.proseReadyMs))
        const renderPct = Math.max(
          8,
          Math.min(100, Math.round(((rLogCur - rLogMin) / (rLogMax - rLogMin)) * 100))
        )
        const renderTierCls =
          vr.proseReadyMs <= 340
            ? 'render-instant'
            : vr.proseReadyMs <= 550
              ? 'render-fast'
              : vr.proseReadyMs <= 1150
                ? 'render-moderate'
                : 'render-heavy'

        const navFastCls = vr.warmNavMs <= 85 ? ' spa-fast' : ''
        renderCellHtml = `
          <td class="bench-render-cell">
            <div class="bench-render-primary">
              <strong class="mono" style="font-size:0.89rem;color:${vr.proseReadyMs <= 340 ? 'var(--accent-teal)' : 'var(--text-primary)'};" title="冷启动打开 05-code-blocks 正文与代码高亮可视就绪耗时">
                👁 ${escapeHtml(formatRenderMs(vr.proseReadyMs))}
              </strong>
              <span class="mono" style="font-size:0.7rem;color:var(--text-muted);" title="浏览器首次内容绘制 (First Contentful Paint)">
                FCP ${escapeHtml(formatRenderMs(vr.fcpMs))}
              </span>
            </div>
            <div class="bench-speed-track" title="首屏正文就绪对数条：${vr.proseReadyMs} ms（FCP ${vr.fcpMs} ms）">
              <div class="bench-speed-fill ${renderTierCls}" style="width:${renderPct}%"></div>
            </div>
            <div class="bench-render-pills mono">
              <span class="bench-mini-pill${navFastCls}" title="已打开页面后站内切页渲染耗时 (05-code-blocks → 01-annotations)">切页 ${escapeHtml(formatRenderMs(vr.warmNavMs))}</span>
              <span class="bench-mini-pill" title="02-diagrams 首个 Mermaid 矢量流程图排布上屏耗时">图表 ${escapeHtml(formatRenderMs(vr.diagramReadyMs))}</span>
              <span class="bench-mini-pill" title="浏览单篇文档浏览器实际下载的 Gzip 载荷与请求数">单页 ${escapeHtml(formatBytes(vr.proseTransferBytes))} (${vr.proseRequests})</span>
            </div>
          </td>
        `
      }

      const total = Math.max(1, b.totalBytes)
      const htmlPct = ((b.htmlBytes / total) * 100).toFixed(1)
      const jsPct = ((b.jsBytes / total) * 100).toFixed(1)
      const cssPct = ((b.cssBytes / total) * 100).toFixed(1)
      const otherPct = ((b.otherBytes / total) * 100).toFixed(1)
      const sizeScalePct = Math.max(12, Math.round((b.totalBytes / maxTotalBytes) * 100))

      const scriptBadge =
        b.proseScriptCount === 0
          ? `<span class="bench-chip zero-js mono">0 脚本 · 纯静态 HTML</span>`
          : `<span class="bench-chip mono">&lt;script&gt; × ${b.proseScriptCount}</span>`

      const searchBadge = b.hasOfflineSearch
        ? `<span class="bench-chip search mono">${escapeHtml(b.offlineSearchKind || '离线索引')}</span>`
        : `<span class="bench-chip muted mono">无内置索引</span>`

      const llmsBadge = b.hasLlmsTxt
        ? `<span class="bench-chip llms mono">🤖 llms.txt</span>`
        : ''

      return `
        <tr>
          <td class="gen-cell">
            <div class="gen-name-line">
              <span class="mono" style="color:var(--text-muted);font-size:0.74rem;">#${idx + 1}</span>
              <span>${escapeHtml(row.name)}</span>
              <span class="status-badge mounted mono">${escapeHtml(row.id)}</span>
            </div>
            <span class="gen-ver mono">${escapeHtml(row.versionNote)} · ${escapeHtml(row.libs.bundler)}</span>
            <div style="margin-top:0.35rem;display:flex;gap:0.3rem;flex-wrap:wrap;">
              <a class="card-act-btn wb mono" href="/workbench/?left=master&right=${encodeURIComponent(row.id)}">⇄ 分屏</a>
              <button type="button" class="card-act-btn mono" data-open-drawer="${escapeHtml(row.id)}">🔍 JSON</button>
            </div>
          </td>
          <td style="min-width:200px;">
            <div style="display:flex;align-items:baseline;justify-content:space-between;gap:0.5rem;">
              <strong class="mono" style="font-size:0.9rem;color:${b.coldBuildMs < 250 && !b.isRuntimeSpa ? 'var(--accent-teal)' : 'var(--text-primary)'};">
                ${escapeHtml(formatBuildMs(b.coldBuildMs, b.isRuntimeSpa))}
              </strong>
              <span class="mono" style="font-size:0.7rem;color:var(--text-muted);">${escapeHtml(b.buildCommand)}</span>
            </div>
            <div class="bench-speed-track" title="对数尺度构建耗时条：${b.coldBuildMs} ms">
              <div class="bench-speed-fill ${speedTierCls}" style="width:${speedPct}%"></div>
            </div>
          </td>
          ${renderCellHtml}
          <td style="min-width:225px;">
            <div style="display:flex;align-items:baseline;justify-content:space-between;gap:0.5rem;" class="mono">
              <strong style="font-size:0.86rem;">${escapeHtml(formatBytes(b.totalBytes))}</strong>
              <span style="font-size:0.72rem;color:var(--text-muted);">${b.totalFiles} 文件 · HTML ${escapeHtml(formatBytes(b.htmlBytes))}</span>
            </div>
            <div class="bench-stack-outer" style="width:${sizeScalePct}%" title="HTML ${formatBytes(b.htmlBytes)} | JS ${formatBytes(b.jsBytes)} | CSS ${formatBytes(b.cssBytes)} | 字体与索引 ${formatBytes(b.otherBytes)}">
              <span class="seg-html" style="width:${htmlPct}%"></span>
              <span class="seg-js" style="width:${jsPct}%"></span>
              <span class="seg-css" style="width:${cssPct}%"></span>
              <span class="seg-other" style="width:${otherPct}%"></span>
            </div>
            <div class="mono" style="font-size:0.69rem;color:var(--text-muted);margin-top:0.22rem;">
              CSS ${escapeHtml(formatBytes(b.cssBytes))} (Gzip ${escapeHtml(formatBytes(b.cssGzipBytes))}) · 字体/索引 ${escapeHtml(formatBytes(b.otherBytes))}
            </div>
          </td>
          <td class="mono" style="text-align:right;white-space:nowrap;">
            <div style="font-weight:700;font-size:0.86rem;">${escapeHtml(formatBytes(b.jsGzipBytes))}</div>
            <div style="font-size:0.71rem;color:var(--text-muted);">原始 ${escapeHtml(formatBytes(b.jsBytes))} (${b.jsFiles} 个)</div>
          </td>
          <td>
            <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">
              ${scriptBadge}
              ${searchBadge}
              ${llmsBadge}
            </div>
          </td>
        </tr>
      `
    })
    .join('')

  return `
    <div class="bench-kpi-grid five-col">
      <div class="telemetry-card">
        <div class="telemetry-val teal mono">${fastestCompiled ? escapeHtml(formatBuildMs(fastestCompiled.benchmark!.coldBuildMs)) : '—'}</div>
        <div class="telemetry-label">🚀 最快冷构建编译引擎</div>
        <div class="telemetry-sub mono">${fastestCompiled ? `${escapeHtml(fastestCompiled.name)} · 比最慢快约 ${speedRatio}×` : ''}</div>
      </div>
      <div class="telemetry-card">
        <div class="telemetry-val teal mono">${fastestProse ? escapeHtml(formatRenderMs(fastestProse.benchmark!.viewRender!.proseReadyMs)) : '—'}</div>
        <div class="telemetry-label">👁 最快首屏正文就绪</div>
        <div class="telemetry-sub mono">${fastestProse ? `${escapeHtml(fastestProse.name)} · FCP ${escapeHtml(formatRenderMs(fastestProse.benchmark!.viewRender!.fcpMs))}` : ''}</div>
      </div>
      <div class="telemetry-card">
        <div class="telemetry-val mono">${fastestWarmNav ? escapeHtml(formatRenderMs(fastestWarmNav.benchmark!.viewRender!.warmNavMs)) : '—'}</div>
        <div class="telemetry-label">⚡ 最快站内切页响应</div>
        <div class="telemetry-sub mono">${fastestWarmNav ? `${escapeHtml(fastestWarmNav.name)} · 零全页刷新 / 极速切换` : ''}</div>
      </div>
      <div class="telemetry-card">
        <div class="telemetry-val mono">${lightestTransfer ? escapeHtml(formatBytes(lightestTransfer.benchmark!.viewRender!.proseTransferBytes)) : '—'}</div>
        <div class="telemetry-label">🪶 最轻单页网络传输 (Gzip)</div>
        <div class="telemetry-sub mono">${lightestTransfer ? `${escapeHtml(lightestTransfer.name)} (${lightestTransfer.benchmark!.viewRender!.proseRequests} 个请求)` : ''}</div>
      </div>
      <div class="telemetry-card">
        <div class="telemetry-val mono">${rows.length} <span style="font-size:0.88rem;font-weight:600;">座子站</span></div>
        <div class="telemetry-label">📏 6 章构建 + Chromium 渲染实测</div>
        <div class="telemetry-sub mono">${searchCount} 款离线检索 · ${llmsCount} 款 llms.txt · ${escapeHtml(measuredDate)}</div>
      </div>
    </div>

    <div class="gh-heatmap-header" style="margin-bottom:0.75rem;">
      <p class="gh-heatmap-sub">
        <strong>编译构建 vs 读者浏览双维对照</strong>：左侧测同一 Linux 环境清空缓存全量编译耗时；右侧用 Headless Chromium（开启 HTTP Gzip，模拟 <code>15ms RTT / 24Mbps</code> 真实边缘网络，取 3 轮中位数）实测读者打开正文页可视就绪、站内切页与 Mermaid 图表上屏耗时 —— 揭示如 <strong>Docsify 虽在首屏动态拉取解析，但站内切页与图表渲染反而快于多款重型打包框架</strong>。
      </p>
      <div style="display:flex;align-items:center;gap:0.65rem;flex-wrap:wrap;">
        <select id="bench-sort-select" class="sort-select" aria-label="性能榜单排序">
          <option value="build-asc"${state.benchSort === 'build-asc' ? ' selected' : ''}>排序：冷构建耗时最快 ↑</option>
          <option value="render-asc"${state.benchSort === 'render-asc' ? ' selected' : ''}>排序：首屏查看渲染最快 ↑ (含零编译 SPA)</option>
          <option value="nav-asc"${state.benchSort === 'nav-asc' ? ' selected' : ''}>排序：站内切页响应最快 ↑</option>
          <option value="diagram-asc"${state.benchSort === 'diagram-asc' ? ' selected' : ''}>排序：Mermaid 图表渲染最快 ↑</option>
          <option value="transfer-asc"${state.benchSort === 'transfer-asc' ? ' selected' : ''}>排序：单页网络传输最轻 ↑</option>
          <option value="js-gzip-asc"${state.benchSort === 'js-gzip-asc' ? ' selected' : ''}>排序：整站 JS Gzip 最小 ↑</option>
          <option value="total-bytes-asc"${state.benchSort === 'total-bytes-asc' ? ' selected' : ''}>排序：整站产物总体积最小 ↑</option>
          <option value="default"${state.benchSort === 'default' ? ' selected' : ''}>排序：默认流派序</option>
        </select>
        <div class="gh-legend mono">
          <span class="bench-legend-dot seg-html"></span><span>HTML</span>
          <span class="bench-legend-dot seg-js"></span><span>JS</span>
          <span class="bench-legend-dot seg-css"></span><span>CSS</span>
          <span class="bench-legend-dot seg-other"></span><span>字体/索引</span>
        </div>
      </div>
    </div>

    <div class="matrix-wrap">
      <table class="matrix-table">
        <thead>
          <tr>
            <th>实测子站 / 打包管线</th>
            <th>空缓存冷构建耗时 (对数尺度)</th>
            <th>浏览器查看与渲染耗时 (对数尺度)</th>
            <th>整站产物体积与构成拆分</th>
            <th style="text-align:right;">全站 JS (Gzip)</th>
            <th>水合脚本 / 离线检索 / AI</th>
          </tr>
        </thead>
        <tbody>${trs}</tbody>
      </table>
    </div>
  `
}

function renderObservatoryPanelHtml(): string {
  if (state.obsTab === 'benchmark') {
    return renderBenchmarkTabHtml()
  }

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
        <p class="gh-heatmap-sub">数据聚合自每个站点独立的 <code>docs/sites/&lt;id&gt;.json</code> 中的 <code>github</code> 节点（共 ${repos.length} 座上游官方仓库，采样日期：<code>${escapeHtml(dataset.githubActivity.fetchedAt)}</code>）。点击仓库旁胶囊可滑出完整 JSON 详情抽屉。</p>
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
        const wbLink = row.mounted
          ? `<a class="card-act-btn wb mono" href="/workbench/?left=master&right=${encodeURIComponent(row.id)}">⇄ 分屏</a>`
          : ''
        return `
          <tr>
            <td class="gen-cell">
              <div class="gen-name-line">
                <span>${escapeHtml(row.name)}</span>
                ${badge}
              </div>
              <span class="gen-ver mono">${escapeHtml(row.versionNote)}</span>
              <div style="margin-top:0.35rem;display:flex;gap:0.3rem;flex-wrap:wrap;">
                ${wbLink}
                <button type="button" class="card-act-btn mono" data-open-drawer="${escapeHtml(row.id)}">🔍 JSON</button>
                <a class="card-act-btn mono" href="${escapeHtml(row.profileRoute)}" target="_blank" rel="noopener">.md ↗</a>
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
      <a class="open-subsite-btn mono" href="/master/00-dialects" target="_blank" rel="noopener">阅读完整六层方言谱系 (/master/00-dialects) ↗</a>
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
          <p class="dialect-desc">代表：<strong>Astro Starlight / Docusaurus / Fumadocs / Nextra</strong>。遵循 <code>remark-directive</code> 或 JSX <code>&lt;Callout&gt;</code>；MDX 严格拒绝裸 <code>{var}</code>。</p>
        </div>
        <pre class="dialect-snippet mono">:::caution[升级注意]
&lt;Callout type="warn"&gt;请先备份配置。&lt;/Callout&gt;</pre>
      </article>
      <article class="dialect-card">
        <div>
          <span class="dialect-layer-tag mono">Layer 4 · 缩进与模板组件派</span>
          <h3 class="dialect-name">MkDocs / Hugo / Zola 0.23</h3>
          <p class="dialect-desc">MkDocs 用 <code>!!!</code> 加 4 空格缩进；Hugo 用 Go Shortcode；Zola 0.23 Tera v2 改用卫生组件 <code>{% &lt;callout&gt; %}</code>。</p>
        </div>
        <pre class="dialect-snippet mono">!!! warning "升级注意"
{{&lt; callout type="warning" &gt;}}
{% &lt;callout type="warning"&gt; %}</pre>
      </article>
      <article class="dialect-card">
        <div>
          <span class="dialect-layer-tag mono">Layer 5 · MDC / 双链 / MyST / AsciiDoc</span>
          <h3 class="dialect-name">Nuxt / Quartz / Sphinx / Antora</h3>
          <p class="dialect-desc">Nuxt 独创双冒号 <code>::callout</code>；Quartz 原生兼容 <code>[[双链]]</code>；Sphinx 采用 <code>\`\`\`{warning}</code> MyST；Antora 彻底转向 <code>*.adoc</code>。</p>
        </div>
        <pre class="dialect-snippet mono">::callout{type="warning"}
[[01-order-and-url|嵌套子页]]
\`\`\`{warning} 升级注意</pre>
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
    state.heatmapSort = (e.target as HTMLSelectElement).value as HeatmapSort
    updateObservatoryDom()
  })
  document.getElementById('bench-sort-select')?.addEventListener('change', (e) => {
    state.benchSort = (e.target as HTMLSelectElement).value as BenchmarkSort
    updateObservatoryDom()
  })
  syncObservatoryUrl()
}

function renderObservatoryPage(): void {
  const html = `
    <div class="page-hero-compact">
      <div>
        <span class="section-step-tag mono">03 · Cross-Generator Observatory (/observatory/)</span>
        <h1 class="section-heading">全景演化、构建与浏览渲染性能观测台</h1>
        <p class="section-sub" style="margin-bottom:0;">从时间维度（2008–2026 提交热力图）、工程维度（冷构建耗时 × 浏览器查看渲染 × 产物体积实测）、空间维度（26 款五维对照）与语法维度（六层方言分裂）全景审视。</p>
      </div>
      <div class="segmented-tabs" role="tablist" aria-label="观测台维度切换">
        <button type="button" class="seg-btn" data-obs-tab="heatmap" id="obs-tab-heatmap">📊 GitHub 历年提交热力表</button>
        <button type="button" class="seg-btn" data-obs-tab="benchmark" id="obs-tab-benchmark">⚡ 构建与浏览渲染性能</button>
        <button type="button" class="seg-btn" data-obs-tab="matrix" id="obs-tab-matrix">🧬 五维架构与方言对照表</button>
        <button type="button" class="seg-btn" data-obs-tab="dialects" id="obs-tab-dialects">📜 Markdown 方言分裂谱系</button>
      </div>
    </div>

    <section id="observatory-page-body" style="padding-bottom:2.5rem;">
      <div id="observatory-tab-body"></div>
    </section>
  `

  mountPageShell('observatory', html)
  updateObservatoryDom()

  document.getElementById('page-main')?.addEventListener('click', (e) => {
    const tabBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-obs-tab]')
    if (tabBtn?.dataset.obsTab) {
      state.obsTab = tabBtn.dataset.obsTab as ObservatoryTab
      updateObservatoryDom()
      return
    }
    const drawerBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-open-drawer]')
    if (drawerBtn?.dataset.openDrawer) {
      openDrawer(drawerBtn.dataset.openDrawer)
    }
  })
}

renderObservatoryPage()
