import { escapeHtml } from '../components/source-diff'
import type { GitHubRepoActivity, ObservatoryTab } from '../types'
import { dataset, formatCompactNum, mountPageShell, openDrawer } from '../shared/shell'

type HeatmapSort = 'default' | 'commits2026' | 'total' | 'stars' | 'oldest'

interface ObservatoryState {
  obsTab: ObservatoryTab
  heatmapSort: HeatmapSort
}

function loadObservatoryState(): ObservatoryState {
  const params = new URLSearchParams(window.location.search)
  const tabParam = params.get('tab') as ObservatoryTab | null
  const sortParam = params.get('sort') as HeatmapSort | null
  return {
    obsTab: tabParam && ['heatmap', 'matrix', 'dialects'].includes(tabParam) ? tabParam : 'heatmap',
    heatmapSort:
      sortParam && ['default', 'commits2026', 'total', 'stars', 'oldest'].includes(sortParam)
        ? sortParam
        : 'default'
  }
}

const state = loadObservatoryState()

function syncObservatoryUrl(): void {
  const params = new URLSearchParams()
  if (state.obsTab !== 'heatmap') params.set('tab', state.obsTab)
  if (state.heatmapSort !== 'default') params.set('sort', state.heatmapSort)
  const qs = params.toString()
  window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname)
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
          <p class="dialect-desc">代表：<strong>Astro Starlight / Docusaurus</strong>。遵循 <code>remark-directive</code>，标题放方括号内；MDX 严格拒绝裸 <code>{var}</code>。</p>
        </div>
        <pre class="dialect-snippet mono">:::caution[升级注意]
请先备份配置。
:::</pre>
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
          <p class="dialect-desc">Nuxt 独创双冒号 <code>::alert</code>；Quartz 原生兼容 <code>[[双链]]</code>；Sphinx 采用 <code>\`\`\`{warning}</code> MyST；Antora 彻底转向 <code>*.adoc</code>。</p>
        </div>
        <pre class="dialect-snippet mono">::alert{type="warning"}
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
  syncObservatoryUrl()
}

function renderObservatoryPage(): void {
  const html = `
    <div class="page-hero-compact">
      <div>
        <span class="section-step-tag mono">03 · Cross-Generator Observatory (/observatory/)</span>
        <h1 class="section-heading">全景演化与方言横向观测台</h1>
        <p class="section-sub" style="margin-bottom:0;">从时间维度（2008–2026 GitHub 提交热力图）、空间维度（26 款生成器五维对照）与语法维度（六层 Markdown 方言分裂）审视静态站点生态演进。</p>
      </div>
      <div class="segmented-tabs" role="tablist" aria-label="观测台维度切换">
        <button type="button" class="seg-btn" data-obs-tab="heatmap" id="obs-tab-heatmap">📊 GitHub 历年提交热力表</button>
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
