import{a as e,c as t,f as n,i as r,l as i,n as a,r as o,s}from"./shell-BbMck3AC.js";function c(){let e=window.location.hash,t=new URLSearchParams(window.location.search);return e===`#directory`?(window.location.replace(`/directory/`),!0):e===`#observatory`?(window.location.replace(`/observatory/`),!0):e===`#benchmark`?(window.location.replace(`/observatory/?tab=benchmark`),!0):e===`#matrix`?(window.location.replace(`/observatory/?tab=matrix`),!0):e===`#dialects`?(window.location.replace(`/observatory/?tab=dialects`),!0):e===`#architecture`?(window.location.replace(`/architecture/`),!0):e===`#workbench`||t.has(`left`)||t.has(`right`)?(window.location.replace(`/workbench/${window.location.search}`),!0):!1}window.addEventListener(`hashchange`,()=>{c()});function l(){if(c())return;let l=a.landscapeRows.length,u=a.landscapeRows.filter(e=>e.mounted),d=u.length,f=l-d,p=a.githubActivity.repos.reduce((e,t)=>e+t.totalCommits,0),m=u.map(t=>`
        <article class="ssg-card is-mounted">
          <div>
            <div class="ssg-card-head">
              <div>
                <div class="ssg-card-title">
                  <span>${n(t.name)}</span>
                  <span class="status-badge mounted mono">${n(t.id)}</span>
                </div>
                <div class="ssg-card-ver mono">${n(t.versionNote)} · ${n(t.lifecycle)}</div>
              </div>
              <span class="lifecycle-pill${t.isEol?` eol`:``}">${t.isEol?`EOL`:`实测就绪`}</span>
            </div>
            <div class="spark-strip" style="margin-top:0.6rem;">
              <div class="spark-metrics mono">
                <span class="spark-metrics-top">★ ${e(t.stars)} · 26年 ${t.commits2026} 次</span>
                <span class="spark-metrics-sub">${t.benchmark?`⚡ ${n(o(t.benchmark.coldBuildMs,t.benchmark.isRuntimeSpa))} · JS ${n(r(t.benchmark.jsGzipBytes))}`:n(t.libs.bundler)}</span>
              </div>
              ${i(t)}
            </div>
            <p class="ssg-card-tagline" style="margin-top:0.55rem;">${n(t.tagline)}</p>
          </div>
          <div class="ssg-card-foot">
            <div class="ssg-ext-links mono">
              <a href="${n(t.subsiteUrl||`/`)}" target="_blank" rel="noopener" style="color:var(--accent-teal);">打开子站 ↗</a>
              <a href="${n(t.profileRoute)}" target="_blank" rel="noopener">.md ↗</a>
            </div>
            <div class="ssg-card-actions">
              <a class="card-act-btn wb" href="/workbench/?left=master&right=${encodeURIComponent(t.id)}">⇄ 与母版对比</a>
              <button type="button" class="card-act-btn mono" data-open-drawer="${n(t.id)}">🔍 JSON</button>
            </div>
          </div>
        </article>
      `).join(``),h=`
    <section class="hero-observatory">
      <div class="hero-grid">
        <div>
          <p class="intro-eyebrow mono">Canonical GFM Master · Per-Site JSON Metadata · Polyglot Git Submodules</p>
          <h1 class="intro-title">跨语言静态网站生成器（SSG）全景生态图谱与多版本实测平台</h1>
          <p class="intro-desc">
            围绕<strong>一套纯正 GFM 母版（<code>docs/*.md</code>）</strong>、<strong>${l} 份独立站点 JSON 元数据图谱（<code>docs/sites/*.json</code>）</strong>与 <strong>${d} 座跨语言同源实测子模块（Node / Go / Rust / Python / SPA）</strong>构建，涵盖双栏渲染、源码派生与冷构建性能实测。
          </p>
          <div class="hero-actions">
            <a href="/workbench/" class="hero-cta primary">⚡ 进入 02 分屏实测工作台</a>
            <a href="/observatory/?tab=benchmark" class="hero-cta">🚀 查看冷构建耗时与体积榜</a>
            <a href="/directory/" class="hero-cta">🗂️ 检索 01 生态目录 (${l} 款)</a>
          </div>
        </div>

        <div class="telemetry-grid">
          <div class="telemetry-card">
            <div class="telemetry-val teal mono">${l} <span style="font-size:0.9rem;font-weight:600;">款</span></div>
            <div class="telemetry-label">1:1 独立站点元数据档案</div>
            <div class="telemetry-sub mono">${d} 已挂载实测 · ${f} 预留扩展位</div>
          </div>
          <div class="telemetry-card">
            <div class="telemetry-val mono">${(p/1e3).toFixed(1)}k+</div>
            <div class="telemetry-label">追踪 GitHub 历史主分支提交</div>
            <div class="telemetry-sub mono">${a.githubActivity.repos.length} 座上游官方仓 · 2008–2026</div>
          </div>
          <div class="telemetry-card">
            <div class="telemetry-val mono">5 <span style="font-size:0.9rem;font-weight:600;">大派系</span></div>
            <div class="telemetry-label">跨语言底层编译与运行时</div>
            <div class="telemetry-sub mono">Vue · React/Astro · Go/Rust · SPA · Python</div>
          </div>
          <div class="telemetry-card">
            <div class="telemetry-val mono">${a.chapters.length} <span style="font-size:0.9rem;font-weight:600;">章</span></div>
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
            <h2 class="channel-title">生态目录与独立 JSON 检索（${l} 款）</h2>
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
            <h2 class="channel-title">跨语言双栏同源实测工作台（${d} 子站）</h2>
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
            <p class="channel-desc">聚合 ${a.githubActivity.repos.length} 座上游官方仓库 2008–2026 历年提交色阶热力矩阵、五维架构方言横向全表以及六层 Markdown 方言演化谱系。</p>
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
          <span class="section-step-tag mono">Mounted Live Submodules (${d})</span>
          <h2 class="section-heading">已挂载跨语言同源实测子站速览</h2>
          <p class="section-sub" style="margin-bottom:0;">以下 ${d} 座子站均已完成独立仓库构建与 GitHub Pages 同源挂载，可一键进入双栏工作台与母版对照。</p>
        </div>
        <a class="open-subsite-btn mono" href="/directory/">查看全部 ${l} 款（含 ${f} 款待挂载图鉴）→</a>
      </div>
      <div class="catalog-cards-grid" id="home-mounted-grid">
        ${m}
      </div>
    </section>
  `;s(`home`,h),document.getElementById(`home-mounted-grid`)?.addEventListener(`click`,e=>{let n=e.target.closest(`[data-open-drawer]`);n?.dataset.openDrawer&&t(n.dataset.openDrawer)})}l();