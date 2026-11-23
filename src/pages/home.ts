import { escapeHtml } from '../components/source-diff'
import { dataset, formatCompactNum, mountPageShell, openDrawer, renderSparklineSvg } from '../shared/shell'

function redirectLegacyAnchors(): boolean {
  const hash = window.location.hash
  const params = new URLSearchParams(window.location.search)
  if (hash === '#directory') {
    window.location.replace('/directory/')
    return true
  }
  if (hash === '#observatory') {
    window.location.replace('/observatory/')
    return true
  }
  if (hash === '#matrix') {
    window.location.replace('/observatory/?tab=matrix')
    return true
  }
  if (hash === '#dialects') {
    window.location.replace('/observatory/?tab=dialects')
    return true
  }
  if (hash === '#architecture') {
    window.location.replace('/architecture/')
    return true
  }
  if (hash === '#workbench' || params.has('left') || params.has('right')) {
    window.location.replace(`/workbench/${window.location.search}`)
    return true
  }
  return false
}

window.addEventListener('hashchange', () => {
  redirectLegacyAnchors()
})

function renderHomePage(): void {
  if (redirectLegacyAnchors()) return

  const totalSites = dataset.landscapeRows.length
  const mountedRows = dataset.landscapeRows.filter((r) => r.mounted)
  const mountedCount = mountedRows.length
  const catalogCount = totalSites - mountedCount
  const totalTrackedCommits = dataset.githubActivity.repos.reduce((acc, r) => acc + r.totalCommits, 0)

  const mountedQuickCards = mountedRows
    .map(
      (row) => `
        <article class="ssg-card is-mounted">
          <div>
            <div class="ssg-card-head">
              <div>
                <div class="ssg-card-title">
                  <span>${escapeHtml(row.name)}</span>
                  <span class="status-badge mounted mono">${escapeHtml(row.id)}</span>
                </div>
                <div class="ssg-card-ver mono">${escapeHtml(row.versionNote)} · ${escapeHtml(row.lifecycle)}</div>
              </div>
              <span class="lifecycle-pill${row.isEol ? ' eol' : ''}">${row.isEol ? 'EOL' : '实测就绪'}</span>
            </div>
            <div class="spark-strip" style="margin-top:0.6rem;">
              <div class="spark-metrics mono">
                <span class="spark-metrics-top">★ ${formatCompactNum(row.stars)} · 26年 ${row.commits2026} 次</span>
                <span class="spark-metrics-sub">${escapeHtml(row.libs.bundler)}</span>
              </div>
              ${renderSparklineSvg(row)}
            </div>
            <p class="ssg-card-tagline" style="margin-top:0.55rem;">${escapeHtml(row.tagline)}</p>
          </div>
          <div class="ssg-card-foot">
            <div class="ssg-ext-links mono">
              <a href="${escapeHtml(row.subsiteUrl || '/')}" target="_blank" rel="noopener" style="color:var(--accent-teal);">打开子站 ↗</a>
              <a href="${escapeHtml(row.profileRoute)}" target="_blank" rel="noopener">.md ↗</a>
            </div>
            <div class="ssg-card-actions">
              <a class="card-act-btn wb" href="/workbench/?left=master&right=${encodeURIComponent(row.id)}">⇄ 与母版对比</a>
              <button type="button" class="card-act-btn mono" data-open-drawer="${escapeHtml(row.id)}">🔍 JSON</button>
            </div>
          </div>
        </article>
      `
    )
    .join('')

  const html = `
    <section class="hero-observatory">
      <div class="hero-grid">
        <div>
          <p class="intro-eyebrow mono">Canonical GFM Master · Per-Site JSON Metadata · Polyglot Git Submodules</p>
          <h1 class="intro-title">跨语言静态网站生成器（SSG）全景生态图谱与多版本实测平台</h1>
          <p class="intro-desc">
            围绕<strong>一套纯正 GFM 母版（<code>docs/*.md</code>）</strong>、<strong>${totalSites} 份独立站点 JSON 元数据图谱（<code>docs/sites/*.json</code>）</strong>与 <strong>${mountedCount} 座跨语言同源实测子模块（Node / Go / Rust / Python / SPA）</strong>构建，四大功能模块现已拆分为独立专页按需加载。
          </p>
          <div class="hero-actions">
            <a href="/workbench/" class="hero-cta primary">⚡ 进入 02 分屏实测工作台</a>
            <a href="/directory/" class="hero-cta">🗂️ 检索 01 生态目录 (${totalSites} 款)</a>
            <a href="/observatory/" class="hero-cta">📊 查看 03 历年提交热力图</a>
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
            <div class="telemetry-sub mono">Vue · React/Astro · Go/Rust · SPA · Python</div>
          </div>
          <div class="telemetry-card">
            <div class="telemetry-val mono">${dataset.chapters.length} <span style="font-size:0.9rem;font-weight:600;">章</span></div>
            <div class="telemetry-label">同源基准测试章节套件</div>
            <div class="telemetry-sub mono">标注 · Mermaid · LaTeX · 目录路由</div>
          </div>
        </div>
      </div>
    </section>

    <section aria-label="四大独立功能频道入口">
      <div class="portal-channels-grid">
        <a class="channel-card" href="/directory/">
          <div>
            <div class="channel-card-top">
              <span class="channel-num mono">01 · DIRECTORY</span>
              <span class="channel-route mono">/directory/</span>
            </div>
            <h2 class="channel-title">生态目录与独立 JSON 检索（${totalSites} 款）</h2>
            <p class="channel-desc">按技术派系、活跃/EOL 状态与热门 #tag 多维过滤，支持 11 年提交微曲线预览、网格/表格双视图与滑出式 JSON 元数据详情抽屉。</p>
          </div>
          <span class="channel-Enter">进入 01 生态目录 →</span>
        </a>

        <a class="channel-card" href="/workbench/">
          <div>
            <div class="channel-card-top">
              <span class="channel-num mono">02 · WORKBENCH</span>
              <span class="channel-route mono">/workbench/</span>
            </div>
            <h2 class="channel-title">跨语言双栏同源实测工作台（${mountedCount} 子站）</h2>
            <p class="channel-desc">沉浸式并排对比 Pure GFM 母版与 Node / Go / Rust / Python 各实测子站的真实网页渲染、物理目录树、相似 *.md 派生差异与锁版本清单。</p>
          </div>
          <span class="channel-Enter">进入 02 分屏工作台 →</span>
        </a>

        <a class="channel-card" href="/observatory/">
          <div>
            <div class="channel-card-top">
              <span class="channel-num mono">03 · OBSERVATORY</span>
              <span class="channel-route mono">/observatory/</span>
            </div>
            <h2 class="channel-title">演化观测台：GitHub 热力表与方言谱系</h2>
            <p class="channel-desc">聚合 ${dataset.githubActivity.repos.length} 座上游官方仓库 2008–2026 历年提交色阶热力矩阵、五维架构方言横向全表以及六层 Markdown 方言演化谱系。</p>
          </div>
          <span class="channel-Enter">进入 03 演化观测台 →</span>
        </a>

        <a class="channel-card" href="/architecture/">
          <div>
            <div class="channel-card-top">
              <span class="channel-num mono">04 · ARCHITECTURE</span>
              <span class="channel-route mono">/architecture/</span>
            </div>
            <h2 class="channel-title">多语言子模块与双分支扩展规范</h2>
            <p class="channel-desc">详解母版派生协议、多语言工程清单适配（package.json / requirements.txt / ssg-lock.json）、main/page 孤儿分支隔离与渐进式接入指南。</p>
          </div>
          <span class="channel-Enter">进入 04 扩展规范 →</span>
        </a>
      </div>
    </section>

    <section class="section-block">
      <div class="section-head-row">
        <div>
          <span class="section-step-tag mono">Mounted Live Submodules (${mountedCount})</span>
          <h2 class="section-heading">已挂载跨语言同源实测子站速览</h2>
          <p class="section-sub" style="margin-bottom:0;">以下 ${mountedCount} 座子站均已完成独立仓库构建与 GitHub Pages 同源挂载，可一键进入双栏工作台与母版对照。</p>
        </div>
        <a class="open-subsite-btn mono" href="/directory/">查看全部 ${totalSites} 款（含 ${catalogCount} 款待挂载图鉴）→</a>
      </div>
      <div class="catalog-cards-grid" id="home-mounted-grid">
        ${mountedQuickCards}
      </div>
    </section>
  `

  mountPageShell('home', html)

  document.getElementById('home-mounted-grid')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-open-drawer]')
    if (btn?.dataset.openDrawer) {
      openDrawer(btn.dataset.openDrawer)
    }
  })
}

renderHomePage()
