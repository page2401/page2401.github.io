import { escapeHtml } from '../components/source-diff'
import { dataset, mountPageShell, openDrawer } from '../shared/shell'

function renderArchitecturePage(): void {
  const mountedSites = dataset.sites.filter((s) => !s.isMaster)

  const repoRowsHtml = mountedSites
    .map(
      (s) => `
        <tr>
          <td class="mono" style="font-weight:700;">sites/${escapeHtml(s.id)}</td>
          <td class="mono"><a href="${escapeHtml(s.repoUrl)}" target="_blank" rel="noopener" style="color:var(--accent-teal);">${escapeHtml(s.repo)} ↗</a></td>
          <td class="mono">
            <a href="${escapeHtml(s.mainBranchUrl)}" target="_blank" rel="noopener">main</a> ·
            <a href="${escapeHtml(s.pageBranchUrl)}" target="_blank" rel="noopener">page</a>
          </td>
          <td class="mono">${escapeHtml(s.manifestShortPath || 'package.json')}</td>
          <td class="mono">${escapeHtml(s.primaryPackage)}@${escapeHtml(s.primaryVersion)}</td>
          <td>
            <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
              <a class="card-act-btn wb mono" href="${escapeHtml(s.basePath)}" target="_blank" rel="noopener">${escapeHtml(s.basePath)} ↗</a>
              <a class="card-act-btn mono" href="/workbench/?left=master&right=${encodeURIComponent(s.id)}">⇄ 工作台</a>
              <button type="button" class="card-act-btn mono" data-open-drawer="${escapeHtml(s.id)}">🔍 JSON</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('')

  const html = `
    <div class="page-hero-compact">
      <div>
        <span class="section-step-tag mono">04 · Polyglot Submodule &amp; Dual-Branch Architecture (/architecture/)</span>
        <h1 class="section-heading">多语言子模块解耦与渐进式扩展规范</h1>
        <p class="section-sub" style="margin-bottom:0;">主仓库与全部 ${mountedSites.length} 座实测子站仓库均严格执行「<code>main</code> 分支纯源码 + <code>page</code> 孤儿分支静态产物」隔离准则，原生兼容跨语言构建体系。</p>
      </div>
      <div style="display:flex;gap:0.45rem;flex-wrap:wrap;">
        <a class="open-subsite-btn mono" href="/master/benchmark-spec" target="_blank" rel="noopener">阅读母版接入规范 (/master/benchmark-spec) ↗</a>
        <a class="open-subsite-btn mono" href="https://github.com/page2401/page2401.github.io/blob/main/sites.config.json" target="_blank" rel="noopener">sites.config.json ↗</a>
      </div>
    </div>

    <section style="padding-bottom:2rem;">
      <div class="arch-grid">
        <div class="arch-card">
          <h3>阶梯一：轻量接入与定时保鲜（JSON + Cron）</h3>
          <p>在 <code>docs/sites/</code> 下放入成对的 <code>&lt;id&gt;.json</code> 与 <code>&lt;id&gt;.md</code>；每周一定时流水线 <code>sync-github-activity.yml</code> 会自动拉取最新 Stars、Release 与历年提交并触发重部署。</p>
          <pre class="arch-pre mono">docs/sites/&lt;new-id&gt;.json   # 官网 / Tags / Libs / benchmark
docs/sites/&lt;new-id&gt;.md     # 特色与架构痛点剖析
npm run sync:github        # 每周 Cron 自动保鲜</pre>
        </div>

        <div class="arch-card">
          <h3>阶梯二：挂载独立双分支实测子站（Git Submodule）</h3>
          <p>在 <code>page2401</code> 组织下建立独立仓库 <code>page2401/&lt;new-id&gt;</code>，由各自的 GitHub Actions 编译静态站点附带 <code>.nojekyll</code> 推送至 <code>page</code> 孤儿分支，同源映射为 <code>/&lt;new-id&gt;/</code>。</p>
          <pre class="arch-pre mono">git submodule add -b main \\
  https://github.com/page2401/&lt;new-id&gt;.git \\
  sites/&lt;new-id&gt;
# 在 sites.config.json 注册 manifestType 与基准章节</pre>
        </div>

        <div class="arch-card">
          <h3>阶梯三：五大运行时清单统一适配（Polyglot Manifest）</h3>
          <p>主仓数据抽取器 <code>generate-comparison-data.mjs</code> 支持五大类跨语言依赖清单，使主站构建只需读取纯文本清单，极速完成打包。</p>
          <pre class="arch-pre mono">manifestType: "npm"     -&gt; package.json      (Node)
manifestType: "deno"    -&gt; deno.json         (Deno 2)
manifestType: "python"  -&gt; requirements.txt  (Python)
manifestType: "binary"  -&gt; ssg-lock.json     (Go/Rust)
manifestType: "ruby"    -&gt; Gemfile           (Ruby)</pre>
        </div>
      </div>
    </section>

    <section class="section-block" id="mounted-repos-table">
      <div class="section-head-row">
        <div>
          <span class="section-step-tag mono">Repository Topology (1 + ${mountedSites.length} Repos)</span>
          <h2 class="section-heading">当前已挂载的 ${mountedSites.length} 座独立双分支子站仓库清单</h2>
        </div>
      </div>

      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>本地子模块路径</th>
              <th>独立 GitHub 仓库</th>
              <th>源码 / 产物双分支</th>
              <th>多语言清单文件</th>
              <th>核心锁定版本</th>
              <th>线上子站与实测</th>
            </tr>
          </thead>
          <tbody>
            ${repoRowsHtml}
          </tbody>
        </table>
      </div>
    </section>
  `

  mountPageShell('architecture', html)

  document.getElementById('mounted-repos-table')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-open-drawer]')
    if (btn?.dataset.openDrawer) {
      openDrawer(btn.dataset.openDrawer)
    }
  })
}

renderArchitecturePage()
