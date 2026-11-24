import{a as e,c as t,f as n,i as r,l as i,n as a,r as o,s}from"./shell-BbMck3AC.js";function c(){let e=new URLSearchParams(window.location.search);return{dirFilter:e.get(`filter`)||`all`,dirSort:e.get(`sort`)||`recommended`,dirView:e.get(`view`)===`list`?`list`:`grid`,dirQuery:e.get(`q`)||``,activeTag:e.get(`tag`)||null,wizardOpen:e.get(`wizard`)===`1`,wizStack:`any`,wizSpeed:`any`,wizFeature:`gfm-zero`}}var l=c();function u(){let e=new URLSearchParams;l.dirFilter!==`all`&&e.set(`filter`,l.dirFilter),l.dirSort!==`recommended`&&e.set(`sort`,l.dirSort),l.dirView!==`grid`&&e.set(`view`,l.dirView),l.dirQuery.trim()&&e.set(`q`,l.dirQuery.trim()),l.activeTag&&e.set(`tag`,l.activeTag),l.wizardOpen&&e.set(`wizard`,`1`);let t=e.toString();window.history.replaceState(null,``,t?`${window.location.pathname}?${t}`:window.location.pathname)}function d(){let e=[];for(let t of a.landscapeRows){if(t.id===`gitbook`)continue;let n=40,r=[];t.isEol?(n-=60,r.push(`已停滞/EOL`)):t.commits2026>=100&&(n+=10,r.push(`26年活跃 (${t.commits2026} commits)`)),t.mounted&&(n+=6);let i=new Set(t.tags);l.wizStack===`single-binary`?i.has(`single-binary`)||i.has(`golang`)||i.has(`rust`)?(n+=36,r.push(`零 Node 依赖单二进制`)):n-=30:l.wizStack===`vue`?t.ecosystem===`vue`||i.has(`vue3`)||i.has(`nuxt`)?(n+=36,r.push(`Vue 3 生态技术栈`)):n-=30:l.wizStack===`react`?t.ecosystem===`react-astro`?(n+=36,r.push(`React / Astro / MDX 生态`)):n-=30:l.wizStack===`python`?i.has(`python`)?(n+=38,r.push(`Python 原生工具链`)):n-=30:l.wizStack===`zero-build`&&(t.benchmark?.isRuntimeSpa||i.has(`zero-build`)?(n+=42,r.push(`无需编译直接静态托管 .md`)):n-=28);let a=t.benchmark;l.wizSpeed===`sub-second`?a&&!a.isRuntimeSpa&&a.coldBuildMs<=1500?(n+=32,r.push(`实测 ${o(a.coldBuildMs)} 闪电编译`)):a&&a.isRuntimeSpa?(n+=18,r.push(`零预编译即时预览`)):a&&a.coldBuildMs>1e4&&(n-=25):l.wizSpeed===`fast`&&(a&&a.coldBuildMs<=16e3?(n+=22,r.push(`实测冷构建 ${o(a.coldBuildMs,a.isRuntimeSpa)}`)):a&&a.coldBuildMs>3e4&&(n-=18));let s=t.calloutDialect.toLowerCase();l.wizFeature===`gfm-zero`?(i.has(`gfm-alerts`)||s.includes(`原生支持`)||s.includes(`原生渲染`)||s.includes(`原生解析`)||s.includes(`100% 零改造`))&&(n+=28,r.push(`零改造兼容 GitHub [!NOTE]`)):l.wizFeature===`mdx-ui`?(i.has(`mdx`)||i.has(`mdc`)||t.ecosystem===`vue`)&&(n+=28,r.push(`支持 JSX/Vue 交互式内嵌组件`)):l.wizFeature===`wikilinks`?(t.id===`quartz`||i.has(`wikilinks`)||i.has(`obsidian`))&&(n+=48,r.push(`原生 [[双向链接]] 与知识图谱`)):l.wizFeature===`math-academic`?t.id===`sphinx`?(n+=44,r.push(`原生自动公式编号与 {eq} 交叉引用`)):(t.id===`mkdocs-material`||t.id===`vitepress-v2`||t.id===`quarto`)&&(n+=24,r.push(`成熟科研公式与图表管线`)):l.wizFeature===`zero-js`?a&&a.proseScriptCount===0?(n+=42,r.push(`实测正文页 0 个 <script> 纯静态`)):(t.id===`astro7-starlight`||t.id===`hugo`||t.id===`zola`||t.id===`lume`)&&(n+=24,r.push(`极简按需脚本 / Islands 架构`)):l.wizFeature===`ai-llms`&&(a?.hasLlmsTxt&&(n+=36,r.push(`构建期原生直出 llms.txt 语料`)),a?.hasOfflineSearch&&(n+=20,r.push(`内置 ${a.offlineSearchKind}`))),e.push({row:t,score:Math.max(5,Math.min(99,n)),reasons:r.slice(0,3)})}return e.sort((e,t)=>t.score-e.score||t.row.commits2026-e.row.commits2026),e.slice(0,3)}function f(){let e=d(),t=e.filter(e=>e.row.mounted),r=t.length>=2?`/workbench/?left=${encodeURIComponent(t[0].row.id)}&right=${encodeURIComponent(t[1].row.id)}&doc=01-annotations&mode=render`:t.length===1?`/workbench/?left=master&right=${encodeURIComponent(t[0].row.id)}&doc=01-annotations&mode=render`:`/workbench/`,i=e.map(({row:e,score:t,reasons:r},i)=>{let a=i===0?`🥇 首选推荐`:i===1?`🥈 次选方案`:`🥉 备选方案`,o=r.map(e=>`<span class="wiz-reason-chip mono">✓ ${n(e)}</span>`).join(``),s=e.mounted?`<a class="card-act-btn wb mono" href="/workbench/?left=master&right=${encodeURIComponent(e.id)}">⇄ 与母版对比</a>`:``;return`
        <div class="wiz-rec-card${i===0?` is-top1`:``}" data-wiz-rec="${n(e.id)}">
          <div>
            <div class="wiz-rec-head">
              <span class="wiz-rank mono">${a}</span>
              <span class="wiz-score mono">匹配分 ${t}</span>
            </div>
            <div class="wiz-rec-name">
              <strong>${n(e.name)}</strong>
              <span class="status-badge ${e.mounted?`mounted`:`catalog`} mono">${n(e.id)}</span>
            </div>
            <p class="wiz-rec-desc">${n(e.tagline)}</p>
            <div class="wiz-reasons">${o}</div>
          </div>
          <div class="wiz-rec-foot">
            ${s}
            <button type="button" class="card-act-btn mono" data-open-drawer="${n(e.id)}">🔍 JSON</button>
          </div>
        </div>
      `}).join(``),a=(e,t,n)=>`<button type="button" class="preset-pill${e===`stack`&&l.wizStack===t||e===`speed`&&l.wizSpeed===t||e===`feature`&&l.wizFeature===t?` active`:``}" data-wiz-group="${e}" data-wiz-val="${t}">${n}</button>`;return`
    <div class="wizard-controls">
      <div class="wiz-question-row">
        <span class="wiz-q-label mono">1. 团队运行时偏好</span>
        <div class="wiz-pills">
          ${a(`stack`,`any`,`不限环境`)}
          ${a(`stack`,`single-binary`,`Go / Rust 单二进制`)}
          ${a(`stack`,`vue`,`Vue / Nuxt 生态`)}
          ${a(`stack`,`react`,`React / Next.js / Astro`)}
          ${a(`stack`,`python`,`Python 工具链`)}
          ${a(`stack`,`zero-build`,`零编译纯静态 SPA`)}
        </div>
      </div>
      <div class="wiz-question-row">
        <span class="wiz-q-label mono">2. 冷构建耗时要求</span>
        <div class="wiz-pills">
          ${a(`speed`,`any`,`不限构建耗时`)}
          ${a(`speed`,`sub-second`,`⚡ 亚秒级闪电编译 (<1.5s)`)}
          ${a(`speed`,`fast`,`🚀 现代高速构建 (<16s)`)}
        </div>
      </div>
      <div class="wiz-question-row">
        <span class="wiz-q-label mono">3. 核心文档场景诉求</span>
        <div class="wiz-pills">
          ${a(`feature`,`gfm-zero`,`原生兼容 GFM [!NOTE]`)}
          ${a(`feature`,`mdx-ui`,`JSX / Vue 交互组件`)}
          ${a(`feature`,`wikilinks`,`Obsidian [[双向链接]]`)}
          ${a(`feature`,`math-academic`,`重度公式 / 学术编号`)}
          ${a(`feature`,`zero-js`,`极致 0 客户端 JS`)}
          ${a(`feature`,`ai-llms`,`内置离线检索 / llms.txt`)}
        </div>
      </div>
    </div>

    <div class="wizard-results-head">
      <span class="mono" style="font-size:0.78rem;color:var(--text-secondary);">基于 26 份独立 JSON 档案与实测 <code>benchmark</code> 数据实时打分推荐（自动排除 EOL 停更框架）：</span>
      ${t.length>=2?`<a class="hero-cta primary" style="padding:0.38rem 0.85rem;font-size:0.78rem;" id="wiz-compare-top2-link" href="${r}">⚡ 一键将 Top 1 (${n(t[0].row.name)}) ↔ Top 2 (${n(t[1].row.name)}) 送入分屏对比 →</a>`:``}
    </div>

    <div class="wizard-rec-grid">${i}</div>
  `}function p(e=14){let t=new Map;for(let e of a.landscapeRows)for(let n of e.tags)n!==`ssg`&&t.set(n,(t.get(n)||0)+1);return Array.from(t.entries()).map(([e,t])=>({tag:e,count:t})).sort((e,t)=>t.count-e.count||e.tag.localeCompare(t.tag)).slice(0,e)}function m(e){let t=l.dirFilter;if(t===`mounted`&&!e.mounted||t===`catalog`&&e.mounted||t===`active`&&e.isEol||t===`eol`&&!e.isEol||(t===`vue`||t===`react-astro`||t===`native`||t===`runtime`||t===`python-classic`)&&e.ecosystem!==t||l.activeTag&&!e.tags.includes(l.activeTag))return!1;let n=l.dirQuery.trim().toLowerCase();return!n||[e.id,e.sitePath,e.name,e.versionNote,e.lifecycle,e.upstreamRepo,e.websiteUrl,e.tagline,e.stack,e.markdownEngine,e.libs.bundler,e.libs.codeHighlight,e.libs.searchEngine,...e.tags,...e.coreLibs,e.directoryModel,e.calloutDialect,e.diagramAndMath].join(` `).toLowerCase().includes(n)}function h(){let e=[...a.landscapeRows.filter(m)];switch(l.dirSort){case`stars-desc`:e.sort((e,t)=>t.stars-e.stars);break;case`commits2026-desc`:e.sort((e,t)=>t.commits2026-e.commits2026||t.stars-e.stars);break;case`total-commits-desc`:e.sort((e,t)=>t.totalCommits-e.totalCommits);break;case`build-asc`:e.sort((e,t)=>{let n=e.benchmark,r=t.benchmark;return!!n==!!r?n&&r?n.isRuntimeSpa===r.isRuntimeSpa?n.coldBuildMs-r.coldBuildMs:n.isRuntimeSpa?1:-1:e.order-t.order:n?-1:1});break;case`newest`:e.sort((e,t)=>t.createdAt.localeCompare(e.createdAt));break;case`oldest`:e.sort((e,t)=>e.createdAt.localeCompare(t.createdAt));break;default:e.sort((e,t)=>e.order-t.order)}return e}function g(){let t=h();return t.length===0?`
      <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:10px;padding:2.5rem;text-align:center;color:var(--text-muted);">
        未找到匹配的静态网站生成器。
        <button type="button" class="reset-filter-btn" id="empty-reset-btn" style="margin-left:0.5rem;">清空筛选条件</button>
      </div>
    `:l.dirView===`list`?`
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
          <tbody>${t.map(t=>{let r=t.mounted?`<span class="status-badge mounted mono">★ sites/${n(t.id)}</span>`:`<span class="status-badge catalog mono">预留 sites/${n(t.id)}</span>`,a=t.mounted?`
            <a class="card-act-btn wb" href="/workbench/?left=${encodeURIComponent(t.id)}&right=vitepress-v1" title="载入分屏工作台左栏">⬅ 左栏</a>
            <a class="card-act-btn wb" href="/workbench/?left=master&right=${encodeURIComponent(t.id)}" title="与母版分屏对比">右栏 ➡</a>
          `:``;return`
          <tr>
            <td>
              <div class="gen-name-line">
                <span>${n(t.name)}</span>
                ${r}
              </div>
              <span class="gen-ver mono">${n(t.versionNote)}</span>
              <div class="gen-ext-links mono">
                <a href="${n(t.websiteUrl)}" target="_blank" rel="noopener">🌐 官网</a>
                <span>·</span>
                <a href="${n(t.githubUrl)}" target="_blank" rel="noopener">GitHub</a>
              </div>
            </td>
            <td class="mono" style="font-size:0.75rem;">
              <div>${n(t.libs.bundler)}</div>
              <div style="color:var(--text-muted);margin-top:0.15rem;">MD: ${n(t.markdownEngine)} · 高亮: ${n(t.libs.codeHighlight)}</div>
            </td>
            <td>
              <span class="lifecycle-pill${t.isEol?` eol`:``}">${n(t.lifecycle)}</span>
              <div class="gen-ver mono" style="margin-top:0.25rem;">★ ${e(t.stars)} · 总提交 ${t.totalCommits.toLocaleString(`en-US`)} · 26年 ${t.commits2026}次</div>
            </td>
            <td style="width:130px;">${i(t)}</td>
            <td>
              <div style="display:flex;gap:0.3rem;flex-wrap:wrap;">
                ${a}
                <button type="button" class="card-act-btn mono" data-open-drawer="${n(t.id)}">🔍 详情 JSON</button>
              </div>
            </td>
          </tr>
        `}).join(``)}</tbody>
        </table>
      </div>
    `:`<div class="catalog-cards-grid">${t.map(t=>{let a=t.isEol?`ssg-card is-eol`:t.mounted?`ssg-card is-mounted`:`ssg-card`,s=t.mounted?`<span class="status-badge mounted mono">★ sites/${n(t.id)}</span>`:`<span class="status-badge catalog mono">📦 sites/${n(t.id)}</span>`,c=t.isEol?`<span class="lifecycle-pill eol">停滞 / EOL</span>`:`<span class="lifecycle-pill">活跃维护</span>`,l=t.tags.slice(0,6).map(e=>`<button type="button" class="card-tag-btn mono" data-tag-pick="${n(e)}">#${n(e)}</button>`).join(``),u=t.mounted?`
          <a class="card-act-btn wb" href="/workbench/?left=${encodeURIComponent(t.id)}&right=vitepress-v1" title="设为分屏工作台左栏">⬅ 左栏</a>
          <a class="card-act-btn wb" href="/workbench/?left=master&right=${encodeURIComponent(t.id)}" title="设为分屏工作台右栏（与母版对照）">右栏 ➡</a>
        `:``;return`
        <article class="${a}" data-card-id="${n(t.id)}">
          <div>
            <div class="ssg-card-head">
              <div>
                <div class="ssg-card-title">
                  <span>${n(t.name)}</span>
                  ${s}
                </div>
                <div class="ssg-card-ver mono">${n(t.versionNote)} · ${n(t.lifecycle)}</div>
              </div>
              ${c}
            </div>

            <div class="spark-strip" style="margin-top:0.65rem;">
              <div class="spark-metrics mono">
                <span class="spark-metrics-top">★ ${e(t.stars)} · 26年 ${t.commits2026} 次提交</span>
                <span class="spark-metrics-sub">始于 ${n(t.createdAt.slice(0,7))} · 累计 ${t.totalCommits.toLocaleString(`en-US`)} commits</span>
              </div>
              ${i(t)}
            </div>

            <p class="ssg-card-tagline" style="margin-top:0.62rem;">${n(t.tagline)}</p>

            <div class="ssg-libs-kv mono" style="margin-top:0.5rem;">
              <div><strong>管线:</strong> ${n(t.libs.bundler)} · ${n(t.markdownEngine)}</div>
              <div><strong>Libs:</strong> ${n(t.coreLibs.slice(0,4).join(`, `))}</div>
              ${t.benchmark?`<div style="color:var(--accent-teal);"><strong>实测:</strong> ⚡ ${n(o(t.benchmark.coldBuildMs,t.benchmark.isRuntimeSpa))} · 总产物 ${n(r(t.benchmark.totalBytes))} · JS Gzip ${n(r(t.benchmark.jsGzipBytes))}</div>`:``}
            </div>

            <div class="ssg-card-tags" style="margin-top:0.55rem;">${l}</div>
          </div>

          <div class="ssg-card-foot">
            <div class="ssg-ext-links mono">
              <a href="${n(t.websiteUrl)}" target="_blank" rel="noopener">🌐 官网 ↗</a>
              <a href="${n(t.githubUrl)}" target="_blank" rel="noopener">GitHub ↗</a>
              ${t.subsiteUrl?`<a href="${n(t.subsiteUrl)}" target="_blank" rel="noopener" style="color:var(--accent-teal);">子站 ↗</a>`:``}
            </div>
            <div class="ssg-card-actions">
              ${u}
              <button type="button" class="card-act-btn mono" data-open-drawer="${n(t.id)}">🔍 详情 JSON</button>
            </div>
          </div>
        </article>
      `}).join(``)}</div>`}function _(){let e=document.getElementById(`wizard-body-container`);e&&(e.innerHTML=f()),u()}function v(){let e=document.getElementById(`directory-results-container`);e&&(e.innerHTML=g());let t=document.getElementById(`directory-status-count`),n=h();if(t){let e=l.activeTag?` · 标签 #${l.activeTag}`:``,r=l.dirQuery.trim()?` · 搜索 "${l.dirQuery.trim()}"`:``;t.textContent=`当前匹配 ${n.length} / ${a.landscapeRows.length} 款生成器${e}${r}`}let r=document.getElementById(`directory-reset-btn`);if(r){let e=l.dirFilter!==`all`||!!l.activeTag||!!l.dirQuery.trim();r.style.display=e?`inline`:`none`}document.querySelectorAll(`[data-dir-filter]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.dirFilter===l.dirFilter)}),document.querySelectorAll(`[data-hot-tag]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.hotTag===l.activeTag)}),document.querySelectorAll(`[data-dir-view]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.dirView===l.dirView)}),u()}function y(){let e=a.landscapeRows.length,r=a.landscapeRows.filter(e=>e.mounted).length,i=e-r,o=a.landscapeRows.filter(e=>!e.isEol).length,c=a.landscapeRows.filter(e=>e.isEol).length,d=p(14).map(({tag:e,count:t})=>`<button type="button" class="tag-filter-chip mono" data-hot-tag="${n(e)}">#${n(e)} <span style="opacity:0.65;">(${t})</span></button>`).join(``),m=`
    <div class="page-hero-compact">
      <div>
        <span class="section-step-tag mono">01 · Scalable Ecosystem Directory (/directory/)</span>
        <h1 class="section-heading">静态网站生成器（SSG）全景生态目录与选型决策器</h1>
        <p class="section-sub" style="margin-bottom:0;">收录 ${e} 款生成器独立的 <code>docs/sites/&lt;id&gt;.json</code> 元数据、底层依赖 Libs 与构建性能实测；支持交互式选型打分推荐并一键送入 <code>/workbench/</code> 分屏验证。</p>
      </div>
      <div style="display:flex;gap:0.45rem;flex-wrap:wrap;">
        <button type="button" class="open-subsite-btn mono" id="hero-toggle-wizard-btn" style="border-color:var(--accent-teal);color:var(--accent-teal);cursor:pointer;">🎯 30 秒选型决策器</button>
        <a class="open-subsite-btn mono" href="/master/sites/" target="_blank" rel="noopener">/master/sites/ 总览 ↗</a>
        <a class="open-subsite-btn mono" href="https://github.com/page2401/page2401.github.io/tree/main/docs/sites" target="_blank" rel="noopener">GitHub docs/sites/*.json ↗</a>
      </div>
    </div>

    <section id="directory-page-body" style="padding-bottom:2.5rem;">
      <details class="wizard-panel" id="ssg-selector-wizard"${l.wizardOpen?` open`:``}>
        <summary class="wizard-summary">
          <div>
            <span class="wizard-badge mono">SELECTOR WIZARD</span>
            <strong>🎯 交互式 SSG 选型决策器</strong>
            <span class="wizard-summary-sub">选择团队语言栈、编译耗时底线与核心语法诉求，实时计算 Top 3 推荐并一键并排实测</span>
          </div>
          <span class="mono" style="font-size:0.76rem;color:var(--accent-teal);">展开 / 收起 ▾</span>
        </summary>
        <div class="wizard-body" id="wizard-body-container">
          ${f()}
        </div>
      </details>

      <div class="explorer-console">
        <div class="explorer-row">
          <div class="matrix-filters" role="tablist" aria-label="生态目录筛选">
            <button type="button" class="preset-pill" data-dir-filter="all">全部 (${e})</button>
            <button type="button" class="preset-pill" data-dir-filter="mounted">★ 已挂载 (${r})</button>
            <button type="button" class="preset-pill" data-dir-filter="catalog">📦 待挂载 (${i})</button>
            <button type="button" class="preset-pill" data-dir-filter="active">🟢 活跃 (${o})</button>
            <button type="button" class="preset-pill" data-dir-filter="eol">⚠️ 停滞/EOL (${c})</button>
            <button type="button" class="preset-pill" data-dir-filter="vue">Vue 生态</button>
            <button type="button" class="preset-pill" data-dir-filter="react-astro">React / Astro / MDX</button>
            <button type="button" class="preset-pill" data-dir-filter="native">Go / Rust / Deno</button>
            <button type="button" class="preset-pill" data-dir-filter="runtime">零编译 / 电子书</button>
            <button type="button" class="preset-pill" data-dir-filter="python-classic">Python / 经典</button>
          </div>

          <div class="explorer-controls-right">
            <select id="directory-sort-select" class="sort-select" aria-label="排序方式">
              <option value="recommended"${l.dirSort===`recommended`?` selected`:``}>排序：推荐默认序</option>
              <option value="build-asc"${l.dirSort===`build-asc`?` selected`:``}>排序：实测冷构建最快 ↑</option>
              <option value="commits2026-desc"${l.dirSort===`commits2026-desc`?` selected`:``}>排序：2026 提交活跃度 ↓</option>
              <option value="stars-desc"${l.dirSort===`stars-desc`?` selected`:``}>排序：GitHub Stars ↓</option>
              <option value="total-commits-desc"${l.dirSort===`total-commits-desc`?` selected`:``}>排序：累计总提交数 ↓</option>
              <option value="newest"${l.dirSort===`newest`?` selected`:``}>排序：立项时间最新 ↓</option>
              <option value="oldest"${l.dirSort===`oldest`?` selected`:``}>排序：立项时间最早 ↑</option>
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
              value="${n(l.dirQuery)}"
              placeholder="按 / 搜索名称、Tag、依赖 Lib 或方言特性 (如 rolldown / shiki / goldmark / pagefind / wikilinks)..."
              aria-label="搜索生成器元数据"
            />
            <span class="search-kbd mono">/</span>
          </div>
          <div class="hot-tags-bar">
            <span class="hot-tags-label mono">热门 Tags:</span>
            ${d}
          </div>
        </div>
      </div>

      <div class="explorer-status-bar mono">
        <span id="directory-status-count"></span>
        <button type="button" class="reset-filter-btn" id="directory-reset-btn" style="display:none;">✕ 重置全部筛选条件</button>
      </div>

      <div id="directory-results-container"></div>
    </section>
  `;s(`directory`,m),v();let h=document.getElementById(`ssg-selector-wizard`);h?.addEventListener(`toggle`,()=>{l.wizardOpen=!!h.open,u()}),document.getElementById(`hero-toggle-wizard-btn`)?.addEventListener(`click`,()=>{h&&(h.open=!h.open,h.open&&h.scrollIntoView({behavior:`smooth`,block:`nearest`}))}),document.addEventListener(`keydown`,e=>{e.key===`/`&&document.activeElement?.tagName!==`INPUT`&&document.activeElement?.tagName!==`SELECT`&&(e.preventDefault(),document.getElementById(`directory-search-input`)?.focus())}),document.getElementById(`directory-page-body`)?.addEventListener(`click`,e=>{let n=e.target.closest(`[data-wiz-group]`);if(n?.dataset.wizGroup&&n.dataset.wizVal){let e=n.dataset.wizGroup,t=n.dataset.wizVal;e===`stack`?l.wizStack=t:e===`speed`?l.wizSpeed=t:e===`feature`&&(l.wizFeature=t),_();return}let r=e.target.closest(`[data-dir-filter]`);if(r?.dataset.dirFilter){l.dirFilter=r.dataset.dirFilter,v();return}let i=e.target.closest(`[data-dir-view]`);if(i?.dataset.dirView){l.dirView=i.dataset.dirView,v();return}let a=e.target.closest(`[data-hot-tag]`);if(a?.dataset.hotTag){let e=a.dataset.hotTag;l.activeTag=l.activeTag===e?null:e,v();return}let o=e.target.closest(`[data-tag-pick]`);if(o?.dataset.tagPick){let e=o.dataset.tagPick;l.activeTag=l.activeTag===e?null:e,v();return}let s=e.target.closest(`[data-open-drawer]`);if(s?.dataset.openDrawer)t(s.dataset.openDrawer);else if(e.target.closest(`#directory-reset-btn, #empty-reset-btn`)){l.dirFilter=`all`,l.activeTag=null,l.dirQuery=``;let e=document.getElementById(`directory-search-input`);e&&(e.value=``),v()}}),document.getElementById(`directory-sort-select`)?.addEventListener(`change`,e=>{l.dirSort=e.target.value,v()}),document.getElementById(`directory-search-input`)?.addEventListener(`input`,e=>{l.dirQuery=e.target.value,v()})}y();