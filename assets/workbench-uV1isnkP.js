import{c as e,d as t,f as n,i as r,m as i,n as a,o,p as s,r as c,s as l,t as u,u as d}from"./shell-BbMck3AC.js";function f(e){return a.sites.find(t=>t.id===e)||a.sites[0]}function p(){let e=new URLSearchParams(window.location.search),t=a.sites.find(e=>!e.isMaster)?.id||a.sites[0]?.id||`vitepress-v1`,n=e.get(`left`),r=e.get(`right`),i=e.get(`doc`),o=e.get(`mode`),s=e.get(`diff`);return{leftSiteId:a.sites.some(e=>e.id===n)?n:`master`,rightSiteId:a.sites.some(e=>e.id===r)?r:t,chapterId:a.chapters.some(e=>e.id===i)?i:`01-annotations`,mode:o&&[`render`,`tree`,`source`,`config`].includes(o)?o:`render`,sourceLayout:s===`unified`?`unified`:`split`,viewport:`fluid`,focus:`both`,splitRatio:50,syncScroll:!0,leftConfigIndex:0,rightConfigIndex:0,highlightDiff:!0,customLeftUrl:null,customRightUrl:null}}var m=p(),h=!1;function g(){let e=new URLSearchParams;e.set(`left`,m.leftSiteId),e.set(`right`,m.rightSiteId),e.set(`doc`,m.chapterId),e.set(`mode`,m.mode),m.mode===`source`&&m.sourceLayout===`unified`&&e.set(`diff`,`unified`),window.history.replaceState(null,``,`${window.location.pathname}?${e.toString()}`)}function _(e,t){let n=e.docs[t],r=e.basePath.endsWith(`/`)?e.basePath:`${e.basePath}/`;return!n||!n.route?r:`${r}${n.route.replace(/^\/+/,``)}`}function v(e){let t=e.scrollingElement||e.documentElement;if(t&&t.scrollHeight>t.clientHeight+8)return t;let n=e.querySelectorAll(`#page-wrapper, .page-inner, .book-body, .body-inner, main, .content, article`),r=null,i=8;return n.forEach(e=>{let t=e.scrollHeight-e.clientHeight;t>i&&(i=t,r=e)}),r||t}function y(e,t){try{let n=e.contentWindow,r=e.contentDocument;if(!n||!r)return;n.addEventListener(`scroll`,e=>{if(!m.syncScroll||h)return;let i=e.target,a=i===r||i===n?r.scrollingElement||r.documentElement:i instanceof Element?i:v(r);if(!a||a instanceof HTMLElement&&a.clientWidth>0&&a.clientWidth<260)return;let o=a.scrollHeight-a.clientHeight;if(o<=4)return;let s=a.scrollTop/o,c=t.contentDocument;if(!c)return;let l=v(c);if(!l)return;let u=l.scrollHeight-l.clientHeight;u<=4||(h=!0,l.scrollTop=Math.round(s*u),window.setTimeout(()=>{h=!1},40))},{passive:!0,capture:!0})}catch{}}function b(e){let t=e.querySelectorAll(`.code-viewer, .tree-inspector`);if(t.length!==2)return;let[n,r]=[t[0],t[1]],i=(e,t)=>{e.addEventListener(`scroll`,()=>{if(!m.syncScroll||h)return;let n=e.scrollHeight-e.clientHeight,r=t.scrollHeight-t.clientHeight;n<=4||r<=4||(h=!0,t.scrollTop=Math.round(e.scrollTop/n*r),window.setTimeout(()=>{h=!1},35))},{passive:!0})};i(n,r),i(r,n)}function x(e){let t=document.getElementById(`workbench-split-gutter`);t&&(t.addEventListener(`dblclick`,()=>{m.splitRatio=50,S(e),C()}),t.addEventListener(`pointerdown`,n=>{n.preventDefault(),t.setPointerCapture(n.pointerId),e.classList.add(`is-dragging`);let r=t=>{let n=e.getBoundingClientRect();if(n.width<=0)return;let r=(t.clientX-n.left)/n.width*100;m.splitRatio=Math.round(Math.max(24,Math.min(76,r))),S(e),C()},i=n=>{e.classList.remove(`is-dragging`);try{t.releasePointerCapture(n.pointerId)}catch{}t.removeEventListener(`pointermove`,r),t.removeEventListener(`pointerup`,i),t.removeEventListener(`pointercancel`,i)};t.addEventListener(`pointermove`,r),t.addEventListener(`pointerup`,i),t.addEventListener(`pointercancel`,i)}))}function S(e){e.style.setProperty(`--left-fr`,`${m.splitRatio}fr`),e.style.setProperty(`--right-fr`,`${100-m.splitRatio}fr`)}function C(){let e=document.getElementById(`reset-ratio-btn`);e&&(m.splitRatio===50?e.style.display=`none`:(e.style.display=`inline-flex`,e.textContent=`⇄ 比例 ${m.splitRatio}:${100-m.splitRatio} (重置)`))}function w(e,t){let r=t.directoryProfile,i=r.pros.map(e=>`<li>${n(e)}</li>`).join(``),a=r.cons.map(e=>`<li>${n(e)}</li>`).join(``),o=t.treeNodes.map(r=>{let i=12+r.depth*18,a=r.kind===`dir`?`▸`:r.category===`content`?`📄`:r.category===`excluded`?`⊘`:r.category===`config`?`⚙`:`·`,o=[];if(r.note){let e=r.category===`excluded`||r.note.includes(`暴露`)||r.note.includes(`手写`);o.push(`<span class="tree-pill${e?` warn`:``} mono">${n(r.note)}</span>`)}if(r.route){let e=t.basePath.replace(/\/$/,``),i=e&&r.route.startsWith(e)?r.route.slice(e.length)||`/`:r.route;o.push(`<span class="tree-pill route mono" title="点击在实测分屏中打开 ${n(r.route)}">→ ${n(i)}</span>`)}let s=r.route?` data-tree-route="${n(r.route)}" data-tree-side="${e}"`:``;return`
        <div class="tree-row kind-${r.kind} cat-${r.category}${r.route?` is-clickable`:``}" style="padding-left:${i}px"${s}>
          <div class="tree-left mono">
            <span class="tree-icon">${a}</span>
            <span class="tree-name">${n(r.name)}${r.kind===`dir`?`/`:``}</span>
          </div>
          <div class="tree-badges">${o.join(``)}</div>
        </div>
      `}).join(``),s=t.treeNodes.filter(e=>e.category===`content`).length;return`
    <div class="tree-inspector">
      <div class="tradeoff-panel">
        <div class="profile-kv-grid">
          <div class="profile-kv">
            <span class="profile-kv-label">内容根路径</span>
            <span class="profile-kv-val mono">${n(r.contentRoot)}</span>
          </div>
          <div class="profile-kv">
            <span class="profile-kv-label">章节排序策略</span>
            <span class="profile-kv-val">${n(r.orderingMechanism)}</span>
          </div>
          <div class="profile-kv">
            <span class="profile-kv-label">多级侧边栏维护</span>
            <span class="profile-kv-val">${n(r.sidebarMechanism)}</span>
          </div>
        </div>
        <div class="pros-cons-grid">
          <div class="pc-box pros">
            <div class="pc-title">✓ 该目录模型优势</div>
            <ul class="pc-list">${i}</ul>
          </div>
          <div class="pc-box cons">
            <div class="pc-title">✕ 无法回避的妥协与痛点</div>
            <ul class="pc-list">${a}</ul>
          </div>
        </div>
      </div>
      <div class="tree-list-header mono">
        <span>物理目录树 (${n(t.submoduleDir)} · 按编辑器字母序排列)</span>
        <span>${s} 篇路由文档 · 点击带路由行可预览</span>
      </div>
      <div class="tree-list">${o}</div>
    </div>
  `}function T(e,t){let r=e.docs[m.chapterId],a=t.docs[m.chapterId],o=i(r?.content||``,a?.content||``);return`
    <div class="workbench-pane unified-pane">
      <div class="pane-header">
        <div class="pane-title-group">
          <span class="pane-dot left"></span>
          <span class="pane-engine-badge">${n(e.family)} <span class="mono" style="opacity:0.75;">(${n(r?.file||``)})</span></span>
          <span class="mono" style="color:var(--text-muted);">──▶</span>
          <span class="pane-dot right"></span>
          <span class="pane-engine-badge">${n(t.family)} <span class="mono" style="opacity:0.75;">(${n(a?.file||``)})</span></span>
        </div>
        <div class="pane-actions mono" style="font-size:0.75rem;">
          <span class="udiff-stat del">−${o.removedCount} 行移除</span>
          <span class="udiff-stat add">+${o.addedCount} 行新增/派生改写</span>
        </div>
      </div>
      <div class="code-viewer">
        ${o.html}
      </div>
    </div>
  `}function E(e,i,a){let l=(e===`left`?m.customLeftUrl:m.customRightUrl)||_(i,m.chapterId),u=m.focus===e?`both`:e,d=m.focus===e?`恢复双栏`:`单栏展开`,f=i.manifestShortPath||`package.json`,p=m.mode===`render`?l:m.mode===`tree`?`${i.submoduleDir}/`:m.mode===`source`?i.docs[m.chapterId]?.file||``:i.configs[e===`left`?m.leftConfigIndex:m.rightConfigIndex]?.path||`${i.submoduleDir===`.`?``:`${i.submoduleDir}/`}${f}`,h=``;if(m.mode===`render`)h=`
      <div class="pane-body" data-viewport="${m.viewport}">
        <iframe
          id="iframe-${e}"
          class="iframe-stage"
          src="${n(l)}"
          title="${n(i.family)} ${n(i.versionSeries)} Preview"
        ></iframe>
      </div>
    `;else if(m.mode===`tree`)h=w(e,i);else if(m.mode===`source`){let e=i.docs[m.chapterId],r=a.docs[m.chapterId],o=m.highlightDiff&&e&&r&&i.id!==a.id?t(e.content,r.content):void 0,c=s(e?.content||``,o,!0);h=`
      <div class="code-viewer">
        <div class="code-meta-bar mono">
          <span>${n(e?.file||``)}</span>
          <span>${e?.lines||0} 行 · ${e?.bytes||0} Bytes${o?` · 差异行 ${c.diffCount}`:``}</span>
        </div>
        ${c.html}
      </div>
    `}else{let t=[...i.configs,{path:`${i.submoduleDir===`.`?``:`${i.submoduleDir}/`}${f}`,shortPath:f,content:i.packageJsonRaw,lines:i.packageJsonRaw.split(`
`).length}],r=Math.min(e===`left`?m.leftConfigIndex:m.rightConfigIndex,t.length-1),a=t[r],o=s(a.content,void 0,!1);h=`
      <div class="code-viewer">
        <div class="code-meta-bar">
          <div class="config-file-tabs">${t.map((t,i)=>`<button type="button" class="cfg-tab mono${i===r?` active`:``}" data-cfg-side="${e}" data-cfg-idx="${i}">${n(t.shortPath)}</button>`).join(``)}</div>
          <span class="mono">${a.lines} 行</span>
        </div>
        ${o.html}
      </div>
    `}let g=i.isMaster?``:`<button type="button" class="mini-btn mono" data-open-drawer="${n(i.id)}">🔍 JSON</button>`,v=i.benchmark?.viewRender,y=i.benchmark?i.benchmark.isRuntimeSpa?`零编译`:c(i.benchmark.coldBuildMs,!1):``,b=i.benchmark?`<a href="/observatory/?tab=benchmark&sort=render-asc" class="bench-pane-badge mono" title="冷构建 ${i.benchmark.coldBuildMs} ms | ${v?`首屏正文 ${v.proseReadyMs} ms (FCP ${v.fcpMs} ms) | 站内切页 ${v.warmNavMs} ms | 图表 ${v.diagramReadyMs} ms | 单页 Gzip ${r(v.proseTransferBytes)} | `:``}整站产物 ${r(i.benchmark.totalBytes)} | 点击查看构建与浏览渲染双维总榜">⚡ ${n(y)}${v?` · 👁 ${n(o(v.proseReadyMs))}`:``}</a>`:``,x=m.mode===`render`?`<span class="bench-live-timer mono" id="live-render-timer-${e}" title="当前浏览器实测本栏 iframe 页面加载与正文上屏耗时">⏱ 实测中…</span>`:``;return`
    <div class="workbench-pane ${e}-pane">
      <div class="pane-header">
        <div class="pane-title-group">
          <span class="pane-dot ${e}"></span>
          <span class="pane-engine-badge">${n(i.family)} <span class="mono" style="font-weight:500;opacity:0.8;">(${n(i.primaryPackage)}@${n(i.primaryVersion)})</span></span>
          ${b}
          ${x}
          <span class="pane-path mono" title="${n(p)}">${n(p)}</span>
        </div>
        <div class="pane-actions">
          ${g}
          <button type="button" class="mini-btn" data-focus-toggle="${u}" id="focus-btn-${e}">${d}</button>
          <a class="mini-btn mono" href="${n(l)}" target="_blank" rel="noopener" id="standalone-link-${e}">独立打开 ↗</a>
        </div>
      </div>
      ${h}
    </div>
  `}function D(){let e=f(m.leftSiteId),t=f(m.rightSiteId),n=a.chapters.find(e=>e.id===m.chapterId)||a.chapters[0],r=document.getElementById(`select-left-site`),i=document.getElementById(`select-right-site`);r&&(r.value=m.leftSiteId),i&&(i.value=m.rightSiteId),document.querySelectorAll(`[data-mode]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.mode===m.mode)}),document.querySelectorAll(`[data-chapter]`).forEach(e=>{e.classList.toggle(`active`,e.dataset.chapter===m.chapterId)}),document.querySelectorAll(`[data-preset-left]`).forEach(e=>{let t=e.dataset.presetLeft===m.leftSiteId&&e.dataset.presetRight===m.rightSiteId;e.classList.toggle(`active`,t)});let s=document.getElementById(`lock-master-left-btn`);s&&s.classList.toggle(`active`,m.leftSiteId===`master`);let c=`<button type="button" class="mini-btn${m.syncScroll?` active`:``}" id="toggle-sync-scroll-btn" title="滚动一侧网页或代码框时另一侧按比例自动跟随">${m.syncScroll?`⇅ 同步滚动: 开`:`⇅ 同步滚动: 关`}</button>`,l=`<button type="button" class="mini-btn mono" id="reset-ratio-btn" style="display:${m.splitRatio===50?`none`:`inline-flex`};">⇄ 比例 ${m.splitRatio}:${100-m.splitRatio} (重置)</button>`,u=`<button type="button" class="mini-btn" id="copy-permalink-btn" title="复制当前双栏对比状态固定链接">🔗 复制对比链接</button>`,p=document.getElementById(`workbench-extra-controls`);p&&(p.innerHTML=m.mode===`render`?`
        ${c}
        ${l}
        <button type="button" class="mini-btn${m.viewport===`fluid`?` active`:``}" data-viewport-btn="fluid" id="vp-fluid-btn">双栏自适应</button>
        <button type="button" class="mini-btn${m.viewport===`tablet`?` active`:``}" data-viewport-btn="tablet" id="vp-tablet-btn">平板 768px</button>
        <button type="button" class="mini-btn${m.viewport===`mobile`?` active`:``}" data-viewport-btn="mobile" id="vp-mobile-btn">手机 390px</button>
        <button type="button" class="mini-btn" id="reload-iframes-btn">↻ 刷新</button>
        ${u}
      `:m.mode===`tree`?`
        ${c}
        ${l}
        ${u}
      `:m.mode===`source`?`
        <button type="button" class="mini-btn${m.sourceLayout===`split`?` active`:``}" data-source-layout="split" id="src-split-btn">⇄ 双栏源码</button>
        <button type="button" class="mini-btn${m.sourceLayout===`unified`?` active`:``}" data-source-layout="unified" id="src-unified-btn">± 行内 Unified Diff</button>
        ${m.sourceLayout===`split`?`${c}
               ${l}
               <button type="button" class="mini-btn${m.highlightDiff?` active`:``}" id="toggle-diff-btn">
                 ${m.highlightDiff?`✓ 差异行高亮`:`开启差异高亮`}
               </button>`:``}
        ${u}
      `:`
        ${c}
        ${l}
        ${u}
      `);let h=document.getElementById(`chapter-takeaway-text`);h&&(h.textContent=m.mode===`tree`?`工程目录不可能三角：VitePress 平铺易混 README；Starlight 强制 3 层深目录；Docusaurus/Rspress/Nextra 依赖目录内 _category_.json/_meta.js；Hugo/Zola 强分 _index.md 与 index.md；mdBook/HonKit 靠单一 SUMMARY.md 接管。`:n.summary);let _=document.getElementById(`workbench-split-grid`);if(_){let n=m.mode===`source`&&m.sourceLayout===`unified`;if(_.setAttribute(`data-focus`,m.focus),_.setAttribute(`data-unified`,n?`true`:`false`),S(_),n)_.innerHTML=T(e,t);else{let n=m.focus===`both`?`<div class="split-gutter" id="workbench-split-gutter" role="separator" aria-orientation="vertical" title="拖动自由调整左右分屏宽度比例（双击恢复 50:50）"><span class="split-gutter-grip">⋮</span></div>`:``;_.innerHTML=E(`left`,e,t)+n+E(`right`,t,e),m.focus===`both`&&x(_);let r=performance.now(),i=(e,t)=>{let n=document.getElementById(`live-render-timer-${t}`);if(!n)return;let i=0;e.addEventListener(`load`,()=>{window.clearTimeout(i);let t=performance.now()+8e3,a=()=>{try{let i=e.contentDocument,a=e.contentWindow;if(!i||!a)return;let s=e.src.includes(`#/`)?`.markdown-section h1, .markdown-section h2`:`h1, main, article`,c=i.querySelector(s);if(c&&(c.textContent||``).trim().length>0||performance.now()>=t){a.requestAnimationFrame(()=>{let e=Math.round(a.performance.now()),t=Math.round(performance.now()-r),i=e>2&&e<3e4?e:t;n.textContent=`⏱ 本机实测 ${o(i)}`,n.title=`当前浏览器实测本栏页面从发起导航到正文首屏渲染就绪耗时：${i} ms`});return}}catch{let e=Math.round(performance.now()-r);n.textContent=`⏱ 本机实测 ${o(e)}`;return}i=window.setTimeout(a,16)};a()})},a=document.getElementById(`iframe-left`),s=document.getElementById(`iframe-right`);a&&i(a,`left`),s&&i(s,`right`),a&&s?(a.addEventListener(`load`,()=>{d(),y(a,s)}),s.addEventListener(`load`,()=>{d(),y(s,a)})):_.querySelectorAll(`.iframe-stage`).forEach(e=>{e.addEventListener(`load`,()=>d())}),b(_)}}g()}function O(){let e=new Map;for(let t of a.sites){let n=t.isMaster?`gfm`:t.ecosystem;e.has(n)||e.set(n,[]),e.get(n).push(t)}return Array.from(e.entries()).map(([e,t])=>{let r=u[e]||e,i=t.map(e=>`<option value="${n(e.id)}">${n(e.family)} · ${n(e.versionSeries)} (${n(e.primaryVersion)})</option>`).join(``);return`<optgroup label="${n(r)}">${i}</optgroup>`}).join(``)}function k(){let e=new Map;for(let t of a.sites)t.isMaster||(e.has(t.family)||e.set(t.family,[]),e.get(t.family).push(t));let t=[];for(let[r,i]of e.entries())if(i.length>=2)for(let e=0;e<i.length-1;e++){let a=i[e],o=i[e+1];t.push(`<button type="button" class="preset-pill" data-preset-left="${n(a.id)}" data-preset-right="${n(o.id)}">${n(r)} ${n(a.versionSeries)} ↔ ${n(o.versionSeries)}</button>`)}return t.join(``)}function A(){let t=a.sites.filter(e=>!e.isMaster).length,r=O(),i=k(),o=a.chapters.map(e=>`<button type="button" class="chapter-tab" data-chapter="${n(e.id)}" id="chapter-btn-${n(e.id)}">${n(e.shortTitle)}</button>`).join(``),s=`
    <div class="page-hero-compact">
      <div>
        <span class="section-step-tag mono">02 · Side-by-Side Live Benchmark Workbench (/workbench/)</span>
        <h1 class="section-heading">跨语言双栏同源实测对比工作台</h1>
        <p class="section-sub" style="margin-bottom:0;">支持<strong>双栏同源网页/代码同步滚动</strong>、<strong>可拖拽分屏比例分隔条</strong>与<strong>行内 Unified Diff</strong>，并排检验 Pure GFM 母版与 ${t} 座跨语言实测子站。</p>
      </div>
      <a class="open-subsite-btn mono" href="/directory/">← 返回 01 生态目录挑选站点</a>
    </div>

    <section class="workbench-section" id="workbench">
      <div class="workbench-shell">
        <div class="workbench-toolbar">
          <div class="selector-group">
            <span class="pane-dot left"></span>
            <label for="select-left-site" class="mono" style="font-size:0.76rem;color:var(--text-muted);">左栏</label>
            <select id="select-left-site" class="site-select">${r}</select>
            <button type="button" class="swap-btn" id="swap-sites-btn" title="交换左右引擎">⇄ 交换</button>
            <span class="pane-dot right"></span>
            <label for="select-right-site" class="mono" style="font-size:0.76rem;color:var(--text-muted);">右栏</label>
            <select id="select-right-site" class="site-select">${r}</select>
          </div>

          <div class="segmented-tabs" role="tablist" aria-label="对比视图切换">
            <button type="button" class="seg-btn" data-mode="render" id="mode-render-btn">🖼️ 实测渲染分屏</button>
            <button type="button" class="seg-btn" data-mode="tree" id="mode-tree-btn">🗂️ 工程目录树对比</button>
            <button type="button" class="seg-btn" data-mode="source" id="mode-source-btn">📝 相似 *.md 源码对比</button>
            <button type="button" class="seg-btn" data-mode="config" id="mode-config-btn">⚙️ 工程配置对比</button>
          </div>
        </div>

        <div class="preset-bar" aria-label="快捷对比场景">
          <span class="preset-label">基准参照：</span>
          <button type="button" class="preset-pill" id="lock-master-left-btn">★ 左栏锁定 Pure GFM 母版</button>
          <span class="nav-divider" role="separator"></span>
          <span class="preset-label">同门跨代：</span>
          ${i}
          <span class="nav-divider" role="separator"></span>
          <span class="preset-label">跨流派焦点：</span>
          ${[[`fumadocs`,`nextra`,`Fumadocs ↔ Nextra`],[`docusaurus-v3`,`rspress`,`Docusaurus ↔ Rspress`],[`gatsby`,`docusaurus-v3`,`Gatsby (GraphQL) ↔ Docusaurus`],[`nuxt-content`,`vitepress-v2`,`Nuxt MDC ↔ VitePress v2`],[`quartz`,`hugo`,`Quartz (双链) ↔ Hugo`],[`hugo`,`zola`,`Hugo (Go) ↔ Zola (Rust)`],[`lume`,`eleventy`,`Lume (Deno) ↔ 11ty (Node)`],[`jekyll`,`hexo`,`Jekyll (Ruby) ↔ Hexo`],[`honkit`,`mdbook`,`HonKit ↔ mdBook`],[`sphinx`,`mkdocs-material`,`Sphinx (MyST) ↔ MkDocs`],[`pelican`,`sphinx`,`Pelican ↔ Sphinx`]].filter(([e,t])=>a.sites.some(t=>t.id===e)&&a.sites.some(e=>e.id===t)).map(([e,t,r])=>`<button type="button" class="preset-pill" data-preset-left="${n(e)}" data-preset-right="${n(t)}">${n(r)}</button>`).join(``)}
        </div>

        <div class="chapter-bar">
          <div class="chapter-tabs" id="chapter-tabs">
            ${o}
          </div>
          <div class="viewport-controls" id="workbench-extra-controls"></div>
        </div>

        <div class="takeaway-banner">
          <span class="takeaway-label">实测要点</span>
          <span id="chapter-takeaway-text"></span>
        </div>

        <div class="split-grid" id="workbench-split-grid" data-focus="both" data-unified="false"></div>
      </div>
    </section>
  `;l(`workbench`,s),D(),document.getElementById(`select-left-site`)?.addEventListener(`change`,e=>{m.leftSiteId=e.target.value,m.leftConfigIndex=0,m.customLeftUrl=null,D()}),document.getElementById(`select-right-site`)?.addEventListener(`change`,e=>{m.rightSiteId=e.target.value,m.rightConfigIndex=0,m.customRightUrl=null,D()}),document.getElementById(`swap-sites-btn`)?.addEventListener(`click`,()=>{let e=m.leftSiteId;m.leftSiteId=m.rightSiteId,m.rightSiteId=e;let t=m.leftConfigIndex;m.leftConfigIndex=m.rightConfigIndex,m.rightConfigIndex=t;let n=m.customLeftUrl;m.customLeftUrl=m.customRightUrl,m.customRightUrl=n,D()}),document.getElementById(`lock-master-left-btn`)?.addEventListener(`click`,()=>{m.leftSiteId=`master`,m.rightSiteId===`master`&&(m.rightSiteId=`vitepress-v1`),m.leftConfigIndex=0,m.customLeftUrl=null,D()}),document.querySelectorAll(`[data-mode]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.mode;t&&(m.mode=t,D())})}),document.querySelectorAll(`[data-chapter]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.chapter;t&&(m.chapterId=t,m.customLeftUrl=null,m.customRightUrl=null,m.mode===`tree`&&(m.mode=`render`),D())})}),document.getElementById(`workbench`)?.addEventListener(`click`,t=>{let n=t.target.closest(`[data-open-drawer]`);if(n?.dataset.openDrawer){e(n.dataset.openDrawer,(e,t)=>{e===`left`?m.leftSiteId=t:m.rightSiteId=t,m.leftConfigIndex=0,m.rightConfigIndex=0,m.customLeftUrl=null,m.customRightUrl=null,D()});return}let r=t.target.closest(`[data-tree-route]`);if(r?.dataset.treeRoute){r.dataset.treeSide===`left`?m.customLeftUrl=r.dataset.treeRoute:m.customRightUrl=r.dataset.treeRoute,m.chapterId=`04-directory`,m.mode=`render`,D();return}let i=t.target.closest(`button`);if(i){if(i.dataset.presetLeft&&i.dataset.presetRight)m.leftSiteId=i.dataset.presetLeft,m.rightSiteId=i.dataset.presetRight,m.leftConfigIndex=0,m.rightConfigIndex=0,m.customLeftUrl=null,m.customRightUrl=null,D();else if(i.dataset.viewportBtn)m.viewport=i.dataset.viewportBtn,D();else if(i.dataset.sourceLayout)m.sourceLayout=i.dataset.sourceLayout,D();else if(i.id===`toggle-sync-scroll-btn`)m.syncScroll=!m.syncScroll,i.classList.toggle(`active`,m.syncScroll),i.textContent=m.syncScroll?`⇅ 同步滚动: 开`:`⇅ 同步滚动: 关`;else if(i.id===`reset-ratio-btn`){m.splitRatio=50;let e=document.getElementById(`workbench-split-grid`);e&&S(e),C()}else if(i.id===`copy-permalink-btn`){g();let e=window.location.href;navigator.clipboard?.writeText(e).catch(()=>{}),i.textContent=`✓ 已复制对比链接`,i.classList.add(`active`),window.setTimeout(()=>{i.textContent=`🔗 复制对比链接`,i.classList.remove(`active`)},1600)}else if(i.id===`reload-iframes-btn`)document.querySelectorAll(`.iframe-stage`).forEach(e=>{let t=e.getAttribute(`src`);t&&e.setAttribute(`src`,t)});else if(i.id===`toggle-diff-btn`)m.highlightDiff=!m.highlightDiff,D();else if(i.dataset.focusToggle)m.focus=i.dataset.focusToggle,D();else if(i.dataset.cfgSide&&i.dataset.cfgIdx!==void 0){let e=Number(i.dataset.cfgIdx);i.dataset.cfgSide===`left`?m.leftConfigIndex=e:m.rightConfigIndex=e,D()}}})}A();