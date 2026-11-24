import{a as e,c as t,f as n,i as r,n as i,o as a,r as o,s}from"./shell-BbMck3AC.js";var c=[`build-asc`,`render-asc`,`nav-asc`,`diagram-asc`,`transfer-asc`,`js-gzip-asc`,`total-bytes-asc`,`default`];function l(){let e=new URLSearchParams(window.location.search),t=e.get(`tab`),n=e.get(`sort`);return{obsTab:t&&[`heatmap`,`benchmark`,`matrix`,`dialects`].includes(t)?t:`heatmap`,heatmapSort:n&&[`default`,`commits2026`,`total`,`stars`,`oldest`].includes(n)?n:`default`,benchSort:n&&c.includes(n)?n:`build-asc`}}var u=l();function d(){let e=new URLSearchParams;u.obsTab!==`heatmap`&&e.set(`tab`,u.obsTab),u.obsTab===`heatmap`&&u.heatmapSort!=="default"?e.set(`sort`,u.heatmapSort):u.obsTab===`benchmark`&&u.benchSort!==`build-asc`&&e.set(`sort`,u.benchSort);let t=e.toString();window.history.replaceState(null,``,t?`${window.location.pathname}?${t}`:window.location.pathname)}function f(e,t){return t?`heat-none`:e===0?`heat-zero`:e>=600?`heat-4`:e>=200?`heat-3`:e>=50?`heat-2`:`heat-1`}function p(){let e=[...i.githubActivity.repos];switch(u.heatmapSort){case`commits2026`:e.sort((e,t)=>(t.yearlyCommits[2026]??0)-(e.yearlyCommits[2026]??0));break;case`total`:e.sort((e,t)=>t.totalCommits-e.totalCommits);break;case`stars`:e.sort((e,t)=>t.stars-e.stars);break;case`oldest`:e.sort((e,t)=>e.createdAt.localeCompare(t.createdAt))}return e}function m(){let e=i.landscapeRows.filter(e=>e.mounted&&e.benchmark);switch(u.benchSort){case`render-asc`:e.sort((e,t)=>(e.benchmark.viewRender?.proseReadyMs??999999)-(t.benchmark.viewRender?.proseReadyMs??999999));break;case`nav-asc`:e.sort((e,t)=>(e.benchmark.viewRender?.warmNavMs??999999)-(t.benchmark.viewRender?.warmNavMs??999999));break;case`diagram-asc`:e.sort((e,t)=>(e.benchmark.viewRender?.diagramReadyMs??999999)-(t.benchmark.viewRender?.diagramReadyMs??999999));break;case`transfer-asc`:e.sort((e,t)=>(e.benchmark.viewRender?.proseTransferBytes??999999999)-(t.benchmark.viewRender?.proseTransferBytes??999999999));break;case`js-gzip-asc`:e.sort((e,t)=>e.benchmark.jsGzipBytes-t.benchmark.jsGzipBytes);break;case`total-bytes-asc`:e.sort((e,t)=>e.benchmark.totalBytes-t.benchmark.totalBytes);break;case`default`:e.sort((e,t)=>e.order-t.order);break;default:e.sort((e,t)=>e.benchmark.isRuntimeSpa===t.benchmark.isRuntimeSpa?e.benchmark.coldBuildMs-t.benchmark.coldBuildMs:e.benchmark.isRuntimeSpa?1:-1)}return e}function h(){let e=m();if(e.length===0)return`
      <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:10px;padding:2rem;color:var(--text-muted);">
        尚未采集构建性能数据，请运行 <code>npm run sync:benchmarks</code> 生成实测遥测节点。
      </div>
    `;let t=e.filter(e=>!e.benchmark.isRuntimeSpa),i=[...t].sort((e,t)=>e.benchmark.coldBuildMs-t.benchmark.coldBuildMs)[0],s=[...t].sort((e,t)=>t.benchmark.coldBuildMs-e.benchmark.coldBuildMs)[0],c=e.filter(e=>e.benchmark?.viewRender),l=[...c].sort((e,t)=>e.benchmark.viewRender.proseReadyMs-t.benchmark.viewRender.proseReadyMs)[0],d=[...c].sort((e,t)=>e.benchmark.viewRender.warmNavMs-t.benchmark.viewRender.warmNavMs)[0],f=[...c].sort((e,t)=>e.benchmark.viewRender.proseTransferBytes-t.benchmark.viewRender.proseTransferBytes)[0],p=e.filter(e=>e.benchmark.hasOfflineSearch).length,h=e.filter(e=>e.benchmark.hasLlmsTxt).length,g=Math.max(100,...e.map(e=>e.benchmark.coldBuildMs)),_=Math.max(400,...c.map(e=>e.benchmark.viewRender.proseReadyMs)),v=Math.max(1024,...e.map(e=>e.benchmark.totalBytes)),y=i&&s&&i.benchmark.coldBuildMs>0?Math.round(s.benchmark.coldBuildMs/i.benchmark.coldBuildMs):1,b=e[0]?.benchmark?.measuredAt?.slice(0,10)||``,x=e.map((e,t)=>{let i=e.benchmark,s=i.viewRender,c=Math.log10(15),l=Math.log10(Math.max(1e3,g)),u=Math.log10(Math.max(15,i.coldBuildMs)),d=i.isRuntimeSpa?6:Math.max(5,Math.min(100,Math.round((u-c)/(l-c)*100))),f=i.isRuntimeSpa?`tier-spa`:i.coldBuildMs<250?`tier-instant`:i.coldBuildMs<3500?`tier-fast`:`tier-heavy`,p=`<td class="bench-render-cell mono" style="color:var(--text-muted);font-size:0.76rem;">未采集</td>`;if(s){let e=Math.log10(120),t=Math.log10(Math.max(1e3,_)),i=Math.log10(Math.max(120,s.proseReadyMs)),o=Math.max(8,Math.min(100,Math.round((i-e)/(t-e)*100))),c=s.proseReadyMs<=340?`render-instant`:s.proseReadyMs<=550?`render-fast`:s.proseReadyMs<=1150?`render-moderate`:`render-heavy`,l=s.warmNavMs<=85?` spa-fast`:``;p=`
          <td class="bench-render-cell">
            <div class="bench-render-primary">
              <strong class="mono" style="font-size:0.89rem;color:${s.proseReadyMs<=340?`var(--accent-teal)`:`var(--text-primary)`};" title="冷启动打开 05-code-blocks 正文与代码高亮可视就绪耗时">
                👁 ${n(a(s.proseReadyMs))}
              </strong>
              <span class="mono" style="font-size:0.7rem;color:var(--text-muted);" title="浏览器首次内容绘制 (First Contentful Paint)">
                FCP ${n(a(s.fcpMs))}
              </span>
            </div>
            <div class="bench-speed-track" title="首屏正文就绪对数条：${s.proseReadyMs} ms（FCP ${s.fcpMs} ms）">
              <div class="bench-speed-fill ${c}" style="width:${o}%"></div>
            </div>
            <div class="bench-render-pills mono">
              <span class="bench-mini-pill${l}" title="已打开页面后站内切页渲染耗时 (05-code-blocks → 01-annotations)">切页 ${n(a(s.warmNavMs))}</span>
              <span class="bench-mini-pill" title="02-diagrams 首个 Mermaid 矢量流程图排布上屏耗时">图表 ${n(a(s.diagramReadyMs))}</span>
              <span class="bench-mini-pill" title="浏览单篇文档浏览器实际下载的 Gzip 载荷与请求数">单页 ${n(r(s.proseTransferBytes))} (${s.proseRequests})</span>
            </div>
          </td>
        `}let m=Math.max(1,i.totalBytes),h=(i.htmlBytes/m*100).toFixed(1),y=(i.jsBytes/m*100).toFixed(1),b=(i.cssBytes/m*100).toFixed(1),x=(i.otherBytes/m*100).toFixed(1),S=Math.max(12,Math.round(i.totalBytes/v*100)),C=i.proseScriptCount===0?`<span class="bench-chip zero-js mono">0 脚本 · 纯静态 HTML</span>`:`<span class="bench-chip mono">&lt;script&gt; × ${i.proseScriptCount}</span>`,w=i.hasOfflineSearch?`<span class="bench-chip search mono">${n(i.offlineSearchKind||`离线索引`)}</span>`:`<span class="bench-chip muted mono">无内置索引</span>`,T=i.hasLlmsTxt?`<span class="bench-chip llms mono">🤖 llms.txt</span>`:``;return`
        <tr>
          <td class="gen-cell">
            <div class="gen-name-line">
              <span class="mono" style="color:var(--text-muted);font-size:0.74rem;">#${t+1}</span>
              <span>${n(e.name)}</span>
              <span class="status-badge mounted mono">${n(e.id)}</span>
            </div>
            <span class="gen-ver mono">${n(e.versionNote)} · ${n(e.libs.bundler)}</span>
            <div style="margin-top:0.35rem;display:flex;gap:0.3rem;flex-wrap:wrap;">
              <a class="card-act-btn wb mono" href="/workbench/?left=master&right=${encodeURIComponent(e.id)}">⇄ 分屏</a>
              <button type="button" class="card-act-btn mono" data-open-drawer="${n(e.id)}">🔍 JSON</button>
            </div>
          </td>
          <td style="min-width:200px;">
            <div style="display:flex;align-items:baseline;justify-content:space-between;gap:0.5rem;">
              <strong class="mono" style="font-size:0.9rem;color:${i.coldBuildMs<250&&!i.isRuntimeSpa?`var(--accent-teal)`:`var(--text-primary)`};">
                ${n(o(i.coldBuildMs,i.isRuntimeSpa))}
              </strong>
              <span class="mono" style="font-size:0.7rem;color:var(--text-muted);">${n(i.buildCommand)}</span>
            </div>
            <div class="bench-speed-track" title="对数尺度构建耗时条：${i.coldBuildMs} ms">
              <div class="bench-speed-fill ${f}" style="width:${d}%"></div>
            </div>
          </td>
          ${p}
          <td style="min-width:225px;">
            <div style="display:flex;align-items:baseline;justify-content:space-between;gap:0.5rem;" class="mono">
              <strong style="font-size:0.86rem;">${n(r(i.totalBytes))}</strong>
              <span style="font-size:0.72rem;color:var(--text-muted);">${i.totalFiles} 文件 · HTML ${n(r(i.htmlBytes))}</span>
            </div>
            <div class="bench-stack-outer" style="width:${S}%" title="HTML ${r(i.htmlBytes)} | JS ${r(i.jsBytes)} | CSS ${r(i.cssBytes)} | 字体与索引 ${r(i.otherBytes)}">
              <span class="seg-html" style="width:${h}%"></span>
              <span class="seg-js" style="width:${y}%"></span>
              <span class="seg-css" style="width:${b}%"></span>
              <span class="seg-other" style="width:${x}%"></span>
            </div>
            <div class="mono" style="font-size:0.69rem;color:var(--text-muted);margin-top:0.22rem;">
              CSS ${n(r(i.cssBytes))} (Gzip ${n(r(i.cssGzipBytes))}) · 字体/索引 ${n(r(i.otherBytes))}
            </div>
          </td>
          <td class="mono" style="text-align:right;white-space:nowrap;">
            <div style="font-weight:700;font-size:0.86rem;">${n(r(i.jsGzipBytes))}</div>
            <div style="font-size:0.71rem;color:var(--text-muted);">原始 ${n(r(i.jsBytes))} (${i.jsFiles} 个)</div>
          </td>
          <td>
            <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">
              ${C}
              ${w}
              ${T}
            </div>
          </td>
        </tr>
      `}).join(``);return`
    <div class="bench-kpi-grid five-col">
      <div class="telemetry-card">
        <div class="telemetry-val teal mono">${i?n(o(i.benchmark.coldBuildMs)):`—`}</div>
        <div class="telemetry-label">🚀 最快冷构建编译引擎</div>
        <div class="telemetry-sub mono">${i?`${n(i.name)} · 比最慢快约 ${y}×`:``}</div>
      </div>
      <div class="telemetry-card">
        <div class="telemetry-val teal mono">${l?n(a(l.benchmark.viewRender.proseReadyMs)):`—`}</div>
        <div class="telemetry-label">👁 最快首屏正文就绪</div>
        <div class="telemetry-sub mono">${l?`${n(l.name)} · FCP ${n(a(l.benchmark.viewRender.fcpMs))}`:``}</div>
      </div>
      <div class="telemetry-card">
        <div class="telemetry-val mono">${d?n(a(d.benchmark.viewRender.warmNavMs)):`—`}</div>
        <div class="telemetry-label">⚡ 最快站内切页响应</div>
        <div class="telemetry-sub mono">${d?`${n(d.name)} · 零全页刷新 / 极速切换`:``}</div>
      </div>
      <div class="telemetry-card">
        <div class="telemetry-val mono">${f?n(r(f.benchmark.viewRender.proseTransferBytes)):`—`}</div>
        <div class="telemetry-label">🪶 最轻单页网络传输 (Gzip)</div>
        <div class="telemetry-sub mono">${f?`${n(f.name)} (${f.benchmark.viewRender.proseRequests} 个请求)`:``}</div>
      </div>
      <div class="telemetry-card">
        <div class="telemetry-val mono">${e.length} <span style="font-size:0.88rem;font-weight:600;">座子站</span></div>
        <div class="telemetry-label">📏 6 章构建 + Chromium 渲染实测</div>
        <div class="telemetry-sub mono">${p} 款离线检索 · ${h} 款 llms.txt · ${n(b)}</div>
      </div>
    </div>

    <div class="gh-heatmap-header" style="margin-bottom:0.75rem;">
      <p class="gh-heatmap-sub">
        <strong>编译构建 vs 读者浏览双维对照</strong>：左侧测同一 Linux 环境清空缓存全量编译耗时；右侧用 Headless Chromium（开启 HTTP Gzip，模拟 <code>15ms RTT / 24Mbps</code> 真实边缘网络，取 3 轮中位数）实测读者打开正文页可视就绪、站内切页与 Mermaid 图表上屏耗时 —— 揭示如 <strong>Docsify 虽在首屏动态拉取解析，但站内切页与图表渲染反而快于多款重型打包框架</strong>。
      </p>
      <div style="display:flex;align-items:center;gap:0.65rem;flex-wrap:wrap;">
        <select id="bench-sort-select" class="sort-select" aria-label="性能榜单排序">
          <option value="build-asc"${u.benchSort===`build-asc`?` selected`:``}>排序：冷构建耗时最快 ↑</option>
          <option value="render-asc"${u.benchSort===`render-asc`?` selected`:``}>排序：首屏查看渲染最快 ↑ (含零编译 SPA)</option>
          <option value="nav-asc"${u.benchSort===`nav-asc`?` selected`:``}>排序：站内切页响应最快 ↑</option>
          <option value="diagram-asc"${u.benchSort===`diagram-asc`?` selected`:``}>排序：Mermaid 图表渲染最快 ↑</option>
          <option value="transfer-asc"${u.benchSort===`transfer-asc`?` selected`:``}>排序：单页网络传输最轻 ↑</option>
          <option value="js-gzip-asc"${u.benchSort===`js-gzip-asc`?` selected`:``}>排序：整站 JS Gzip 最小 ↑</option>
          <option value="total-bytes-asc"${u.benchSort===`total-bytes-asc`?` selected`:``}>排序：整站产物总体积最小 ↑</option>
          <option value="default"${u.benchSort==="default"?` selected`:``}>排序：默认流派序</option>
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
        <tbody>${x}</tbody>
      </table>
    </div>
  `}function g(){if(u.obsTab===`benchmark`)return h();if(u.obsTab===`heatmap`){let t=p(),r=t.map(t=>{let r=t.createdYear>=2016,a=f(t.pre2016Commits,r),o=r?`·`:t.pre2016Commits.toLocaleString(`en-US`),s=i.githubActivity.displayYears.map(e=>{let r=e<t.createdYear,i=t.yearlyCommits[String(e)]??0,a=f(i,r),o=!r&&e===t.peakYear&&i>0?` is-peak`:``,s=r?`·`:String(i),c=r?`${t.repo} 于 ${t.createdAt} 立项，${e} 年尚未创建`:`${t.repo} · ${e} 年主分支提交 ${i} 次${e===t.peakYear?`（历史最高峰）`:``}`;return`<td class="heat-cell mono ${a}${o}" title="${n(c)}">${n(s)}</td>`}).join(``),c=t.siteIds.map(e=>`<button type="button" class="gh-site-chip mono" data-open-drawer="${n(e)}" style="cursor:pointer;" title="打开 ${n(e)}.json 元数据抽屉">${n(e)}.json</button>`).join(``);return`
          <tr>
            <td class="gh-repo-cell">
              <div class="gh-repo-line">
                <a href="${n(t.url)}" target="_blank" rel="noopener" class="mono gh-repo-link">${n(t.repo)} ↗</a>
                <span class="gh-site-chips">${c}</span>
              </div>
              <div class="gh-repo-meta mono">立项 ${n(t.createdAt)} · 最近推送 ${n(t.pushedAt)}</div>
            </td>
            <td class="mono num-cell">★ ${e(t.stars)}</td>
            <td class="mono num-cell">${t.totalCommits.toLocaleString(`en-US`)}</td>
            <td class="heat-cell mono ${a}" title="2008–2015 年累计主分支提交数">${o}</td>
            ${s}
          </tr>
        `}).join(``);return`
      <div class="gh-heatmap-header" style="margin-bottom:0.75rem;">
        <p class="gh-heatmap-sub">数据聚合自每个站点独立的 <code>docs/sites/&lt;id&gt;.json</code> 中的 <code>github</code> 节点（共 ${t.length} 座上游官方仓库，采样日期：<code>${n(i.githubActivity.fetchedAt)}</code>）。点击仓库旁胶囊可滑出完整 JSON 详情抽屉。</p>
        <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
          <select id="heatmap-sort-select" class="sort-select" aria-label="热力表排序">
            <option value="default"${u.heatmapSort==="default"?` selected`:``}>排序：默认流派序</option>
            <option value="commits2026"${u.heatmapSort===`commits2026`?` selected`:``}>排序：2026 年活跃度 ↓</option>
            <option value="total"${u.heatmapSort===`total`?` selected`:``}>排序：历史总提交 ↓</option>
            <option value="stars"${u.heatmapSort===`stars`?` selected`:``}>排序：GitHub Stars ↓</option>
            <option value="oldest"${u.heatmapSort===`oldest`?` selected`:``}>排序：立项时间最早 ↑</option>
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
              ${i.githubActivity.displayYears.map(e=>`<th style="text-align:right;" class="mono">${String(e).slice(2)}年</th>`).join(``)}
            </tr>
          </thead>
          <tbody>${r}</tbody>
        </table>
      </div>
    `}return u.obsTab===`matrix`?`
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
          <tbody>${i.landscapeRows.map(e=>{let t=e.mounted?`<span class="status-badge mounted mono">★ ${n(e.id)}</span>`:`<span class="status-badge catalog mono">${n(e.id)}</span>`,r=e.mounted?`<a class="card-act-btn wb mono" href="/workbench/?left=master&right=${encodeURIComponent(e.id)}">⇄ 分屏</a>`:``;return`
          <tr>
            <td class="gen-cell">
              <div class="gen-name-line">
                <span>${n(e.name)}</span>
                ${t}
              </div>
              <span class="gen-ver mono">${n(e.versionNote)}</span>
              <div style="margin-top:0.35rem;display:flex;gap:0.3rem;flex-wrap:wrap;">
                ${r}
                <button type="button" class="card-act-btn mono" data-open-drawer="${n(e.id)}">🔍 JSON</button>
                <a class="card-act-btn mono" href="${n(e.profileRoute)}" target="_blank" rel="noopener">.md ↗</a>
              </div>
            </td>
            <td class="mono" style="font-size:0.75rem;max-width:220px;">
              <div>${n(e.stack)}</div>
              <div class="libs-sub">Libs: ${n(e.coreLibs.join(`, `))}</div>
            </td>
            <td>${n(e.directoryModel)}</td>
            <td>${n(e.calloutDialect)}</td>
            <td>${n(e.diagramAndMath)}</td>
          </tr>
        `}).join(``)}</tbody>
        </table>
      </div>
    `:`
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
  `}function _(){let e=document.getElementById(`observatory-tab-body`);e&&(e.innerHTML=g()),document.querySelectorAll(`[data-obs-tab]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.obsTab===u.obsTab)}),document.getElementById(`heatmap-sort-select`)?.addEventListener(`change`,e=>{u.heatmapSort=e.target.value,_()}),document.getElementById(`bench-sort-select`)?.addEventListener(`change`,e=>{u.benchSort=e.target.value,_()}),d()}function v(){s(`observatory`,`
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
  `),_(),document.getElementById(`page-main`)?.addEventListener(`click`,e=>{let n=e.target.closest(`[data-obs-tab]`);if(n?.dataset.obsTab){u.obsTab=n.dataset.obsTab,_();return}let r=e.target.closest(`[data-open-drawer]`);r?.dataset.openDrawer&&t(r.dataset.openDrawer)})}v();