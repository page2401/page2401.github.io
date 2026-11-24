import{t as e}from"./comparison-dataset-BjW27vi9.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function t(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function n(e){let n=t(e),r=e.trim();return r===`---`||r===`+++`||r.startsWith("```")?`<span class="tok-fence">${n}</span>`:r.startsWith(`:::`)||r.startsWith(`::`)||r.startsWith(`> [!`)||r.startsWith(`!!! `)||r.startsWith(`??? `)||r.startsWith(`<Callout`)||r.startsWith(`</Callout`)||r.startsWith(`{% `)||r.startsWith(`{{< `)||r.startsWith(`{: .`)||r.startsWith(`<details`)||r.startsWith(`</details`)||r.startsWith(`<summary`)?`<span class="tok-callout">${n}</span>`:/^#{1,6}\s/.test(r)?`<span class="tok-heading">${n}</span>`:r===`$$`||r.startsWith(`\\begin{`)||r.startsWith(`\\end{`)?`<span class="tok-math">${n}</span>`:n}function r(e,t){let n=e.split(`
`),r=new Set(t.split(`
`).map(e=>e.trim()).filter(e=>e.length>0));return n.map(e=>{let t=e.trim();return t?!r.has(t):!1})}function i(e,r,i=!0){let a=e.split(`
`),o=0;return{html:`<table class="code-table"><tbody>${a.map((e,a)=>{let s=r?!!r[a]:!1;s&&o++;let c=i?n(e):t(e);return`<tr class="code-row${s?` is-diff`:``}"><td class="line-num mono">${a+1}</td><td class="line-code mono">${c||` `}</td></tr>`}).join(``)}</tbody></table>`,diffCount:o}}function a(e,t){let r=e.split(`
`),i=t.split(`
`),a=r.length,o=i.length,s=Array.from({length:a+1},()=>new Uint16Array(o+1));for(let e=a-1;e>=0;e--)for(let t=o-1;t>=0;t--)if(r[e]===i[t])s[e][t]=s[e+1][t+1]+1;else{let n=s[e+1][t],r=s[e][t+1];s[e][t]=n>=r?n:r}let c=0,l=0,u=0,d=0,f=[];for(;c<a&&l<o;)if(r[c]===i[l]){let e=n(r[c])||` `;f.push(`<tr class="code-row udiff-ctx"><td class="line-num mono">${c+1}</td><td class="line-num mono">${l+1}</td><td class="udiff-sign mono"> </td><td class="line-code mono">${e}</td></tr>`),c++,l++}else if(s[c+1][l]>=s[c][l+1]){d++;let e=n(r[c])||` `;f.push(`<tr class="code-row udiff-del"><td class="line-num mono">${c+1}</td><td class="line-num mono"></td><td class="udiff-sign mono">−</td><td class="line-code mono">${e}</td></tr>`),c++}else{u++;let e=n(i[l])||` `;f.push(`<tr class="code-row udiff-add"><td class="line-num mono"></td><td class="line-num mono">${l+1}</td><td class="udiff-sign mono">+</td><td class="line-code mono">${e}</td></tr>`),l++}for(;c<a;){d++;let e=n(r[c])||` `;f.push(`<tr class="code-row udiff-del"><td class="line-num mono">${c+1}</td><td class="line-num mono"></td><td class="udiff-sign mono">−</td><td class="line-code mono">${e}</td></tr>`),c++}for(;l<o;){u++;let e=n(i[l])||` `;f.push(`<tr class="code-row udiff-add"><td class="line-num mono"></td><td class="line-num mono">${l+1}</td><td class="udiff-sign mono">+</td><td class="line-code mono">${e}</td></tr>`),l++}return{html:`<table class="code-table udiff-table"><tbody>${f.join(``)}</tbody></table>`,addedCount:u,removedCount:d}}var o=e,s={gfm:`★ 基准母版 (Pure GFM)`,vue:`Vue 生态文档派`,"react-astro":`React / Astro / MDX 派`,native:`Go / Rust 单二进制派`,runtime:`零预编译 SPA 运行时派`,"python-classic":`Python 科研与经典博客派`};function c(e){return e>=1e3?`${(e/1e3).toFixed(1)}k`:String(e)}function l(e){return e<1024?`${e} B`:e<1048576?`${(e/1024).toFixed(1)} KB`:`${(e/1048576).toFixed(2)} MB`}function u(e,t){return t?`${e} ms (零编译 SPA)`:e>=1e3?`${(e/1e3).toFixed(2)} s`:`${e} ms`}function d(e){return e>=1e3?`${(e/1e3).toFixed(2)} s`:`${e} ms`}function f(e){let t=[2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],n=t.map(t=>t<e.createdYear?0:e.yearlyCommits[String(t)]??0),r=Math.max(10,...n),i=n.map((e,n)=>({x:Number((n/(t.length-1)*116).toFixed(1)),y:Number((27-e/r*24).toFixed(1)),v:e,yr:t[n]})),a=e.isEol?`var(--accent-copper)`:`var(--accent-teal)`,o=i.map(e=>`${e.x},${e.y}`).join(` `),s=`0,27 ${o} 116,27`,c=0;for(let e=1;e<i.length;e++)i[e].v>=i[c].v&&(c=e);let l=i[i.length-1],u=i[c];return`
    <svg class="sparkline-svg" viewBox="0 0 116 30" role="img" aria-label="2016–2026 提交活跃曲线">
      <polygon points="${s}" fill="${a}" opacity="0.13"></polygon>
      <polyline points="${o}" fill="none" stroke="${a}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${u.v>0?`<circle cx="${u.x}" cy="${u.y}" r="2.3" fill="${a}"><title>${u.yr} 峰值: ${u.v} 次提交</title></circle>`:``}
      <circle cx="${l.x}" cy="${l.y}" r="2.5" fill="${a}"><title>2026 年: ${l.v} 次提交</title></circle>
    </svg>
  `}function p(){let e=document.documentElement.getAttribute(`data-theme`)===`dark`;document.querySelectorAll(`.iframe-stage`).forEach(t=>{try{let n=t.contentDocument;if(!n||!n.documentElement)return;n.documentElement.classList.toggle(`dark`,e),n.documentElement.setAttribute(`data-theme`,e?`dark`:`light`)}catch{}})}function m(){let e=document.getElementById(`theme-toggle-btn`);e&&(e.textContent=document.documentElement.getAttribute(`data-theme`)===`dark`?`☀ 浅色`:`☾ 深色`)}function h(e){let t=(document.documentElement.getAttribute(`data-theme`)===`dark`?`dark`:`light`)==`dark`?`light`:`dark`;document.documentElement.setAttribute(`data-theme`,t),localStorage.setItem(`page2401-theme`,t),localStorage.setItem(`vitepress-theme-appearance`,t),localStorage.setItem(`starlight-theme`,t),m(),p(),e?.()}function g(e,n){let r=e.libs.pinnedPackages?Object.entries(e.libs.pinnedPackages):[],i=r.length>0?`<tr><th>实测锁定版本</th><td class="mono">${r.map(([e,n])=>`${t(e)}@${t(n)}`).join(` · `)}</td></tr>`:``,a=Object.keys(e.yearlyCommits).map(Number).sort((e,t)=>e-t).filter(t=>t>=e.createdYear),o=Math.max(1,...a.map(t=>e.yearlyCommits[String(t)]??0)),s=a.map(t=>{let n=e.yearlyCommits[String(t)]??0,r=Math.max(0,Math.round(n/o*100));return`
        <div class="commit-bar-row mono">
          <span>${t}</span>
          <div class="commit-bar-track">
            <div class="commit-bar-fill${n===0?` zero`:``}" style="width:${r}%"></div>
          </div>
          <span style="text-align:right;font-weight:600;">${n.toLocaleString(`en-US`)}</span>
        </div>
      `}).join(``),c=e.mounted?n?`
        <button type="button" class="open-subsite-btn mono" data-drawer-wb="left" data-site-id="${t(e.id)}" style="border-color:var(--accent-teal);color:var(--accent-teal);cursor:pointer;">⬅ 载入工作台左栏</button>
        <button type="button" class="open-subsite-btn mono" data-drawer-wb="right" data-site-id="${t(e.id)}" style="border-color:var(--accent-copper);color:var(--accent-copper);cursor:pointer;">载入工作台右栏 ➡</button>
      `:`
        <a class="open-subsite-btn mono" href="/workbench/?left=${encodeURIComponent(e.id)}&right=vitepress-v1" style="border-color:var(--accent-teal);color:var(--accent-teal);">⬅ 设为分屏左栏</a>
        <a class="open-subsite-btn mono" href="/workbench/?left=master&right=${encodeURIComponent(e.id)}" style="border-color:var(--accent-copper);color:var(--accent-copper);">与母版分屏对比 ➡</a>
      `:``;return`
    <div class="drawer-header">
      <div>
        <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          <h3 style="margin:0;font-size:1.15rem;">${t(e.name)}</h3>
          <span class="status-badge ${e.mounted?`mounted`:`catalog`} mono">${e.mounted?`★ 已挂载 ${t(e.sitePath)}`:`📦 预留 ${t(e.sitePath)}`}</span>
        </div>
        <div class="mono" style="font-size:0.76rem;color:var(--text-muted);margin-top:0.2rem;">
          docs/sites/${t(e.id)}.json · ${t(e.versionNote)}
        </div>
      </div>
      <button type="button" class="drawer-close-btn" id="drawer-close-btn">✕ 关闭</button>
    </div>

    <div class="drawer-body">
      <div class="drawer-link-row">
        <a class="open-subsite-btn mono" href="${t(e.websiteUrl)}" target="_blank" rel="noopener">🌐 ${t(e.websiteUrl.replace(/^https?:\/\//,``).replace(/\/$/,``))} ↗</a>
        <a class="open-subsite-btn mono" href="${t(e.githubUrl)}" target="_blank" rel="noopener">GitHub (${t(e.upstreamRepo)}) ↗</a>
        <a class="open-subsite-btn mono" href="${t(e.packageUrl)}" target="_blank" rel="noopener">📦 包仓库 ↗</a>
        <a class="open-subsite-btn mono" href="${t(e.profileRoute)}" target="_blank" rel="noopener">📖 ${t(e.id)}.md ↗</a>
        <a class="open-subsite-btn mono" href="${t(e.jsonRoute)}" target="_blank" rel="noopener">{ } ${t(e.id)}.json ↗</a>
        ${c}
      </div>

      <div>
        <h4 class="drawer-sec-title">1. 生命周期与 GitHub 指标</h4>
        <table class="drawer-kv-table">
          <tbody>
            <tr><th>开始时间</th><td class="mono">${t(e.lifecycleDetail.startedAt)}（GitHub 创建：${t(e.createdAt)}）</td></tr>
            <tr><th>活跃时间</th><td>${t(e.lifecycleDetail.activePeriod)}</td></tr>
            <tr><th>废弃 / EOL</th><td>${t(e.lifecycleDetail.deprecatedAt||`无（当前正常演进维护中）`)}</td></tr>
            <tr><th>仓库状态</th><td class="mono">★ ${e.stars.toLocaleString(`en-US`)} Stars · Forks ${e.forks.toLocaleString(`en-US`)} · Issues ${e.openIssues} · ${t(e.license)} · 最近推送 ${t(e.pushedAt)}</td></tr>
            <tr><th>标签 (Tags)</th><td class="mono">${e.tags.map(e=>`#${t(e)}`).join(`  `)}</td></tr>
          </tbody>
        </table>
      </div>

      <div>
        <h4 class="drawer-sec-title">2. 底层依赖库清单 (Libs)</h4>
        <table class="drawer-kv-table">
          <tbody>
            <tr><th>运行时与打包</th><td>${t(e.libs.runtime)} · ${t(e.libs.bundler)}</td></tr>
            <tr><th>UI 与解析引擎</th><td>${t(e.libs.uiFramework)} · <code>${t(e.libs.markdownEngine)}</code></td></tr>
            <tr><th>高亮与搜索</th><td>${t(e.libs.codeHighlight)} · ${t(e.libs.searchEngine)}</td></tr>
            <tr><th>公式与图表库</th><td>${t(e.libs.mathLib)} ； ${t(e.libs.diagramLib)}</td></tr>
            <tr><th>核心 Libs</th><td class="mono">${t(e.coreLibs.join(`, `))}</td></tr>
            ${i}
          </tbody>
        </table>
      </div>

      ${e.benchmark?`<div>
               <h4 class="drawer-sec-title">⚡ 实测冷构建、浏览器查看渲染与产物体积 (benchmark 节点)</h4>
               <table class="drawer-kv-table">
                 <tbody>
                   <tr><th>冷构建耗时</th><td class="mono"><strong style="color:var(--accent-teal);">${t(u(e.benchmark.coldBuildMs,e.benchmark.isRuntimeSpa))}</strong> · <code>${t(e.benchmark.buildCommand)}</code></td></tr>
                   ${e.benchmark.viewRender?`<tr><th>首屏与切页耗时</th><td class="mono"><strong style="color:#2f7ac7;">首屏正文就绪 ${t(d(e.benchmark.viewRender.proseReadyMs))}</strong>（FCP ${t(d(e.benchmark.viewRender.fcpMs))}）· <strong>站内切页 ${t(d(e.benchmark.viewRender.warmNavMs))}</strong> · Mermaid 图表 ${t(d(e.benchmark.viewRender.diagramReadyMs))}</td></tr>
                          <tr><th>单页网络传输</th><td class="mono">${t(l(e.benchmark.viewRender.proseTransferBytes))} Gzip（${e.benchmark.viewRender.proseRequests} 个请求 · ${t(e.benchmark.viewRender.profile)}）</td></tr>`:``}
                   <tr><th>整站产物总体积</th><td class="mono">${t(l(e.benchmark.totalBytes))}（共 ${e.benchmark.totalFiles} 个文件）</td></tr>
                   <tr><th>资源结构拆分</th><td class="mono">HTML ${t(l(e.benchmark.htmlBytes))} · JS ${t(l(e.benchmark.jsBytes))} (Gzip <strong>${t(l(e.benchmark.jsGzipBytes))}</strong>) · CSS ${t(l(e.benchmark.cssBytes))} (Gzip ${t(l(e.benchmark.cssGzipBytes))}) · 字体/索引 ${t(l(e.benchmark.otherBytes))}</td></tr>
                   <tr><th>运行时特性</th><td class="mono">正文页 <code>&lt;script&gt;</code> ${e.benchmark.proseScriptCount} 个 · ${e.benchmark.hasOfflineSearch?t(e.benchmark.offlineSearchKind||`内置搜索`):`无内置离线索引`}${e.benchmark.hasLlmsTxt?` · 自动产出 llms.txt`:``}</td></tr>
                 </tbody>
               </table>
             </div>`:``}

      <div>
        <h4 class="drawer-sec-title">3. GitHub 主分支历年提交曲线 (${e.createdYear}–2026 · 共 ${e.totalCommits.toLocaleString(`en-US`)} 次)</h4>
        <div class="drawer-commit-bars">${s}</div>
      </div>

      <div>
        <h4 class="drawer-sec-title">4. 目录与方言边界摘要</h4>
        <table class="drawer-kv-table">
          <tbody>
            <tr><th>目录与侧栏</th><td>${t(e.directoryModel)}</td></tr>
            <tr><th>提示框方言</th><td>${t(e.calloutDialect)}</td></tr>
            <tr><th>图表与公式</th><td>${t(e.diagramAndMath)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `}function _(e,t){let n=o.landscapeRows.find(t=>t.id===e);if(!n)return;let r=document.getElementById(`inspector-drawer`),i=document.getElementById(`drawer-backdrop`);r&&i&&(r.innerHTML=g(n,t),r.classList.add(`open`),i.classList.add(`open`),document.getElementById(`drawer-close-btn`)?.addEventListener(`click`,v),t&&r.querySelectorAll(`[data-drawer-wb]`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.dataset.drawerWb===`left`?`left`:`right`,r=e.dataset.siteId;r&&(v(),t(n,r))})}))}function v(){document.getElementById(`inspector-drawer`)?.classList.remove(`open`),document.getElementById(`drawer-backdrop`)?.classList.remove(`open`)}function y(e,n,r){let i=document.getElementById(`app`);if(!i)return;let a=o.landscapeRows.length,s=o.landscapeRows.filter(e=>e.mounted).length,c=o.sites.find(e=>e.isMaster),l=o.sites.filter(e=>!e.isMaster).map(e=>`
        <a class="subsite-popover-item" href="${t(e.basePath)}" target="_blank" rel="noopener">
          <div>
            <strong>${t(e.family)} ${t(e.versionSeries)}</strong>
            <div class="subsite-popover-ver mono">${t(e.primaryPackage)}@${t(e.primaryVersion)}</div>
          </div>
          <span class="mono" style="font-size:0.74rem;color:var(--accent-teal);">${t(e.basePath)} ↗</span>
        </a>
      `).join(``),u=(t,n,r)=>{let i=e===t;return`<a class="nav-link${i?` active`:``}" href="${n}"${i?` aria-current="page"`:``}>${r}</a>`};i.innerHTML=`
    <header class="masthead">
      <div class="container masthead-inner">
        <a href="/" class="brand" id="brand-home-link">
          <span class="brand-domain mono">page.2401.xyz</span>
          <span class="brand-pill mono">SSG Observatory</span>
          <span class="brand-sub">静态网站生成器全景图谱与实测对比台</span>
        </a>

        <nav class="nav-links" aria-label="主导航">
          ${u(`directory`,`/directory/`,`01 生态目录 (${a})`)}
          ${u(`workbench`,`/workbench/`,`02 分屏工作台 (${s})`)}
          ${u(`observatory`,`/observatory/`,`03 演化观测台`)}
          ${u(`architecture`,`/architecture/`,`04 扩展规范`)}
        </nav>

        <div class="masthead-right">
          <details class="subsite-launcher" id="subsite-launcher">
            <summary class="mono">🚀 已挂载子站 (${s}) ▾</summary>
            <div class="subsite-popover">
              ${c?`<div class="subsite-popover-group">唯一原始母版 (Canonical GFM)</div>
                     <a class="subsite-popover-item" href="${t(c.basePath)}" target="_blank" rel="noopener">
                       <div>
                         <strong>★ 本站母版 (docs/*.md)</strong>
                         <div class="subsite-popover-ver mono">标准 GFM + 站点元数据档案库</div>
                       </div>
                       <span class="mono" style="font-size:0.74rem;color:var(--accent-teal);">/master/ ↗</span>
                     </a>`:``}
              <div class="subsite-popover-group">同源独立版本子模块 (sites/*)</div>
              ${l}
            </div>
          </details>
          <a class="theme-btn mono" href="https://github.com/page2401/page2401.github.io" target="_blank" rel="noopener">GitHub ↗</a>
          <button type="button" class="theme-btn" id="theme-toggle-btn">☾ 深色</button>
        </div>
      </div>
    </header>

    <main class="container" id="page-main">
      ${n}
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <span><strong>page.2401.xyz</strong> · 可扩展静态网站生成器生态图谱与多版本实测对比平台</span>
        <span class="mono">
          <a href="/">首页</a> ·
          <a href="/directory/">01 生态目录</a> ·
          <a href="/workbench/">02 分屏工作台</a> ·
          <a href="/observatory/">03 演化观测台</a> ·
          <a href="/architecture/">04 扩展规范</a> ·
          <a href="/master/">/master/</a>
        </span>
      </div>
    </footer>

    <div class="drawer-backdrop" id="drawer-backdrop"></div>
    <aside class="inspector-drawer" id="inspector-drawer" aria-label="站点独立 JSON 元数据详情抽屉"></aside>
  `,m(),document.getElementById(`theme-toggle-btn`)?.addEventListener(`click`,()=>h(r?.onThemeToggle)),document.getElementById(`drawer-backdrop`)?.addEventListener(`click`,v),document.addEventListener(`click`,e=>{let t=document.getElementById(`subsite-launcher`);t&&t.open&&!t.contains(e.target)&&(t.open=!1)}),document.addEventListener(`keydown`,e=>{if(e.key===`Escape`){v();let e=document.getElementById(`subsite-launcher`);e&&(e.open=!1)}})}export{c as a,_ as c,r as d,t as f,l as i,f as l,a as m,o as n,d as o,i as p,u as r,y as s,s as t,p as u};