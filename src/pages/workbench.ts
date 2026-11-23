import { computeDiffLineFlags, escapeHtml, renderCodeTableHtml } from '../components/source-diff'
import type { FocusedPane, SiteEntry, ViewportPreset, WorkbenchMode } from '../types'
import { dataset, ECOSYSTEM_LABELS, mountPageShell, openDrawer, syncIframeThemes } from '../shared/shell'

interface WorkbenchState {
  leftSiteId: string
  rightSiteId: string
  chapterId: string
  mode: WorkbenchMode
  viewport: ViewportPreset
  focus: FocusedPane
  leftConfigIndex: number
  rightConfigIndex: number
  highlightDiff: boolean
  customLeftUrl: string | null
  customRightUrl: string | null
}

function getSiteById(id: string): SiteEntry {
  return dataset.sites.find((s) => s.id === id) || dataset.sites[0]
}

function loadWorkbenchState(): WorkbenchState {
  const params = new URLSearchParams(window.location.search)
  const defaultLeft = 'master'
  const defaultRight =
    dataset.sites.find((s) => !s.isMaster)?.id || dataset.sites[0]?.id || 'vitepress-v1'

  const leftParam = params.get('left')
  const rightParam = params.get('right')
  const docParam = params.get('doc')
  const modeParam = params.get('mode') as WorkbenchMode | null

  return {
    leftSiteId: dataset.sites.some((s) => s.id === leftParam) ? leftParam! : defaultLeft,
    rightSiteId: dataset.sites.some((s) => s.id === rightParam) ? rightParam! : defaultRight,
    chapterId: dataset.chapters.some((c) => c.id === docParam) ? docParam! : '01-annotations',
    mode:
      modeParam && ['render', 'tree', 'source', 'config'].includes(modeParam)
        ? modeParam
        : 'render',
    viewport: 'fluid',
    focus: 'both',
    leftConfigIndex: 0,
    rightConfigIndex: 0,
    highlightDiff: true,
    customLeftUrl: null,
    customRightUrl: null
  }
}

const state = loadWorkbenchState()

function syncWorkbenchUrl(): void {
  const params = new URLSearchParams()
  params.set('left', state.leftSiteId)
  params.set('right', state.rightSiteId)
  params.set('doc', state.chapterId)
  params.set('mode', state.mode)
  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
}

function buildSubsiteRouteUrl(site: SiteEntry, chapterId: string): string {
  const doc = site.docs[chapterId]
  const base = site.basePath.endsWith('/') ? site.basePath : `${site.basePath}/`
  if (!doc || !doc.route) return base
  return `${base}${doc.route.replace(/^\/+/, '')}`
}

function renderTreeInspectorHtml(side: 'left' | 'right', site: SiteEntry): string {
  const prof = site.directoryProfile
  const prosHtml = prof.pros.map((p) => `<li>${escapeHtml(p)}</li>`).join('')
  const consHtml = prof.cons.map((c) => `<li>${escapeHtml(c)}</li>`).join('')

  const treeRowsHtml = site.treeNodes
    .map((node) => {
      const indentPx = 12 + node.depth * 18
      const icon =
        node.kind === 'dir'
          ? '▸'
          : node.category === 'content'
            ? '📄'
            : node.category === 'excluded'
              ? '⊘'
              : node.category === 'config'
                ? '⚙'
                : '·'

      const badges: string[] = []
      if (node.note) {
        const isWarn =
          node.category === 'excluded' ||
          node.note.includes('暴露') ||
          node.note.includes('手写')
        badges.push(
          `<span class="tree-pill${isWarn ? ' warn' : ''} mono">${escapeHtml(node.note)}</span>`
        )
      }
      if (node.route) {
        const baseTrimmed = site.basePath.replace(/\/$/, '')
        const shortRoute =
          baseTrimmed && node.route.startsWith(baseTrimmed)
            ? node.route.slice(baseTrimmed.length) || '/'
            : node.route
        badges.push(
          `<span class="tree-pill route mono" title="点击在实测分屏中打开 ${escapeHtml(node.route)}">→ ${escapeHtml(shortRoute)}</span>`
        )
      }

      const clickableAttr = node.route
        ? ` data-tree-route="${escapeHtml(node.route)}" data-tree-side="${side}"`
        : ''

      return `
        <div class="tree-row kind-${node.kind} cat-${node.category}${node.route ? ' is-clickable' : ''}" style="padding-left:${indentPx}px"${clickableAttr}>
          <div class="tree-left mono">
            <span class="tree-icon">${icon}</span>
            <span class="tree-name">${escapeHtml(node.name)}${node.kind === 'dir' ? '/' : ''}</span>
          </div>
          <div class="tree-badges">${badges.join('')}</div>
        </div>
      `
    })
    .join('')

  const contentCount = site.treeNodes.filter((n) => n.category === 'content').length

  return `
    <div class="tree-inspector">
      <div class="tradeoff-panel">
        <div class="profile-kv-grid">
          <div class="profile-kv">
            <span class="profile-kv-label">内容根路径</span>
            <span class="profile-kv-val mono">${escapeHtml(prof.contentRoot)}</span>
          </div>
          <div class="profile-kv">
            <span class="profile-kv-label">章节排序策略</span>
            <span class="profile-kv-val">${escapeHtml(prof.orderingMechanism)}</span>
          </div>
          <div class="profile-kv">
            <span class="profile-kv-label">多级侧边栏维护</span>
            <span class="profile-kv-val">${escapeHtml(prof.sidebarMechanism)}</span>
          </div>
        </div>
        <div class="pros-cons-grid">
          <div class="pc-box pros">
            <div class="pc-title">✓ 该目录模型优势</div>
            <ul class="pc-list">${prosHtml}</ul>
          </div>
          <div class="pc-box cons">
            <div class="pc-title">✕ 无法回避的妥协与痛点</div>
            <ul class="pc-list">${consHtml}</ul>
          </div>
        </div>
      </div>
      <div class="tree-list-header mono">
        <span>物理目录树 (${escapeHtml(site.submoduleDir)} · 按编辑器字母序排列)</span>
        <span>${contentCount} 篇路由文档 · 点击带路由行可预览</span>
      </div>
      <div class="tree-list">${treeRowsHtml}</div>
    </div>
  `
}

function renderPaneContent(
  side: 'left' | 'right',
  site: SiteEntry,
  counterpart: SiteEntry
): string {
  const customUrl = side === 'left' ? state.customLeftUrl : state.customRightUrl
  const routeUrl = customUrl || buildSubsiteRouteUrl(site, state.chapterId)
  const focusTarget: FocusedPane = state.focus === side ? 'both' : side
  const focusLabel = state.focus === side ? '恢复双栏' : '单栏展开'

  const manifestFile = site.manifestShortPath || 'package.json'
  const headerPath =
    state.mode === 'render'
      ? routeUrl
      : state.mode === 'tree'
        ? `${site.submoduleDir}/`
        : state.mode === 'source'
          ? site.docs[state.chapterId]?.file || ''
          : site.configs[side === 'left' ? state.leftConfigIndex : state.rightConfigIndex]?.path ||
            `${site.submoduleDir === '.' ? '' : `${site.submoduleDir}/`}${manifestFile}`

  let bodyHtml = ''

  if (state.mode === 'render') {
    bodyHtml = `
      <div class="pane-body" data-viewport="${state.viewport}">
        <iframe
          id="iframe-${side}"
          class="iframe-stage"
          src="${escapeHtml(routeUrl)}"
          title="${escapeHtml(site.family)} ${escapeHtml(site.versionSeries)} Preview"
          loading="lazy"
        ></iframe>
      </div>
    `
  } else if (state.mode === 'tree') {
    bodyHtml = renderTreeInspectorHtml(side, site)
  } else if (state.mode === 'source') {
    const doc = site.docs[state.chapterId]
    const otherDoc = counterpart.docs[state.chapterId]
    const diffFlags =
      state.highlightDiff && doc && otherDoc && site.id !== counterpart.id
        ? computeDiffLineFlags(doc.content, otherDoc.content)
        : undefined
    const rendered = renderCodeTableHtml(doc?.content || '', diffFlags, true)

    bodyHtml = `
      <div class="code-viewer">
        <div class="code-meta-bar mono">
          <span>${escapeHtml(doc?.file || '')}</span>
          <span>${doc?.lines || 0} 行 · ${doc?.bytes || 0} Bytes${
            diffFlags ? ` · 差异行 ${rendered.diffCount}` : ''
          }</span>
        </div>
        ${rendered.html}
      </div>
    `
  } else {
    const allConfigs = [
      ...site.configs,
      {
        path: `${site.submoduleDir === '.' ? '' : `${site.submoduleDir}/`}${manifestFile}`,
        shortPath: manifestFile,
        content: site.packageJsonRaw,
        lines: site.packageJsonRaw.split('\n').length
      }
    ]
    const idx = Math.min(
      side === 'left' ? state.leftConfigIndex : state.rightConfigIndex,
      allConfigs.length - 1
    )
    const activeCfg = allConfigs[idx]
    const rendered = renderCodeTableHtml(activeCfg.content, undefined, false)

    const tabsHtml = allConfigs
      .map(
        (cfg, i) =>
          `<button type="button" class="cfg-tab mono${i === idx ? ' active' : ''}" data-cfg-side="${side}" data-cfg-idx="${i}">${escapeHtml(cfg.shortPath)}</button>`
      )
      .join('')

    bodyHtml = `
      <div class="code-viewer">
        <div class="code-meta-bar">
          <div class="config-file-tabs">${tabsHtml}</div>
          <span class="mono">${activeCfg.lines} 行</span>
        </div>
        ${rendered.html}
      </div>
    `
  }

  const jsonInfoBtn = !site.isMaster
    ? `<button type="button" class="mini-btn mono" data-open-drawer="${escapeHtml(site.id)}">🔍 JSON</button>`
    : ''

  return `
    <div class="workbench-pane ${side}-pane">
      <div class="pane-header">
        <div class="pane-title-group">
          <span class="pane-dot ${side}"></span>
          <span class="pane-engine-badge">${escapeHtml(site.family)} <span class="mono" style="font-weight:500;opacity:0.8;">(${escapeHtml(site.primaryPackage)}@${escapeHtml(site.primaryVersion)})</span></span>
          <span class="pane-path mono" title="${escapeHtml(headerPath)}">${escapeHtml(headerPath)}</span>
        </div>
        <div class="pane-actions">
          ${jsonInfoBtn}
          <button type="button" class="mini-btn" data-focus-toggle="${focusTarget}" id="focus-btn-${side}">${focusLabel}</button>
          <a class="mini-btn mono" href="${escapeHtml(routeUrl)}" target="_blank" rel="noopener" id="standalone-link-${side}">独立打开 ↗</a>
        </div>
      </div>
      ${bodyHtml}
    </div>
  `
}

function updateWorkbenchDom(): void {
  const leftSite = getSiteById(state.leftSiteId)
  const rightSite = getSiteById(state.rightSiteId)
  const activeChapter =
    dataset.chapters.find((c) => c.id === state.chapterId) || dataset.chapters[0]

  const leftSelect = document.getElementById('select-left-site') as HTMLSelectElement | null
  const rightSelect = document.getElementById('select-right-site') as HTMLSelectElement | null
  if (leftSelect) leftSelect.value = state.leftSiteId
  if (rightSelect) rightSelect.value = state.rightSiteId

  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === state.mode)
  })

  document.querySelectorAll<HTMLButtonElement>('[data-chapter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.chapter === state.chapterId)
  })

  document.querySelectorAll<HTMLButtonElement>('[data-preset-left]').forEach((btn) => {
    const isMatch =
      btn.dataset.presetLeft === state.leftSiteId &&
      btn.dataset.presetRight === state.rightSiteId
    btn.classList.toggle('active', isMatch)
  })

  const lockMasterBtn = document.getElementById('lock-master-left-btn')
  if (lockMasterBtn) {
    lockMasterBtn.classList.toggle('active', state.leftSiteId === 'master')
  }

  const extraControls = document.getElementById('workbench-extra-controls')
  if (extraControls) {
    if (state.mode === 'render') {
      extraControls.innerHTML = `
        <button type="button" class="mini-btn${state.viewport === 'fluid' ? ' active' : ''}" data-viewport-btn="fluid" id="vp-fluid-btn">双栏自适应</button>
        <button type="button" class="mini-btn${state.viewport === 'tablet' ? ' active' : ''}" data-viewport-btn="tablet" id="vp-tablet-btn">平板 768px</button>
        <button type="button" class="mini-btn${state.viewport === 'mobile' ? ' active' : ''}" data-viewport-btn="mobile" id="vp-mobile-btn">手机 390px</button>
        <button type="button" class="mini-btn" id="reload-iframes-btn">↻ 刷新分屏</button>
      `
    } else if (state.mode === 'tree') {
      extraControls.innerHTML = `<span class="mono" style="font-size:0.75rem;color:var(--text-muted);">真实扫描自各子模块物理目录树 · 揭示不同目录约定的两难取舍</span>`
    } else if (state.mode === 'source') {
      extraControls.innerHTML = `
        <button type="button" class="mini-btn${state.highlightDiff ? ' active' : ''}" id="toggle-diff-btn">
          ${state.highlightDiff ? '✓ 已开启语法差异行高亮' : '开启语法差异行高亮'}
        </button>
      `
    } else {
      extraControls.innerHTML = `<span class="mono" style="font-size:0.75rem;color:var(--text-muted);">支持跨语言清单：package.json / requirements.txt / ssg-lock.json</span>`
    }
  }

  const takeawayEl = document.getElementById('chapter-takeaway-text')
  if (takeawayEl) {
    takeawayEl.textContent =
      state.mode === 'tree'
        ? '工程目录不可能三角：VitePress 平铺易混 README；Starlight 强制 3 层深目录；Docusaurus/Rspress 散落 _category_.json/_meta.json；Hugo/Zola 强分 _index.md 与 index.md；mdBook 靠单一 SUMMARY.md 接管。'
        : activeChapter.summary
  }

  const splitGrid = document.getElementById('workbench-split-grid')
  if (splitGrid) {
    splitGrid.setAttribute('data-focus', state.focus)
    splitGrid.innerHTML =
      renderPaneContent('left', leftSite, rightSite) +
      renderPaneContent('right', rightSite, leftSite)
    splitGrid.querySelectorAll<HTMLIFrameElement>('.iframe-stage').forEach((frame) => {
      frame.addEventListener('load', () => syncIframeThemes())
    })
  }

  syncWorkbenchUrl()
}

function buildGroupedSiteOptionsHtml(): string {
  const groups = new Map<string, SiteEntry[]>()
  for (const s of dataset.sites) {
    const key = s.isMaster ? 'gfm' : s.ecosystem
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s)
  }

  return Array.from(groups.entries())
    .map(([eco, items]) => {
      const label = ECOSYSTEM_LABELS[eco] || eco
      const opts = items
        .map(
          (s) =>
            `<option value="${escapeHtml(s.id)}">${escapeHtml(s.family)} · ${escapeHtml(s.versionSeries)} (${escapeHtml(s.primaryVersion)})</option>`
        )
        .join('')
      return `<optgroup label="${escapeHtml(label)}">${opts}</optgroup>`
    })
    .join('')
}

function buildAutoFamilyPairsHtml(): string {
  const byFamily = new Map<string, SiteEntry[]>()
  for (const s of dataset.sites) {
    if (s.isMaster) continue
    if (!byFamily.has(s.family)) byFamily.set(s.family, [])
    byFamily.get(s.family)!.push(s)
  }

  const pills: string[] = []
  for (const [family, list] of byFamily.entries()) {
    if (list.length >= 2) {
      for (let i = 0; i < list.length - 1; i++) {
        const a = list[i]
        const b = list[i + 1]
        pills.push(
          `<button type="button" class="preset-pill" data-preset-left="${escapeHtml(a.id)}" data-preset-right="${escapeHtml(b.id)}">${escapeHtml(family)} ${escapeHtml(a.versionSeries)} ↔ ${escapeHtml(b.versionSeries)}</button>`
        )
      }
    }
  }
  return pills.join('')
}

function renderWorkbenchPage(): void {
  const siteOptionsHtml = buildGroupedSiteOptionsHtml()
  const autoFamilyPairsHtml = buildAutoFamilyPairsHtml()
  const chapterButtonsHtml = dataset.chapters
    .map(
      (c) =>
        `<button type="button" class="chapter-tab" data-chapter="${escapeHtml(c.id)}" id="chapter-btn-${escapeHtml(c.id)}">${escapeHtml(c.shortTitle)}</button>`
    )
    .join('')

  const html = `
    <div class="page-hero-compact">
      <div>
        <span class="section-step-tag mono">02 · Side-by-Side Live Benchmark Workbench (/workbench/)</span>
        <h1 class="section-heading">跨语言双栏同源实测对比工作台</h1>
        <p class="section-sub" style="margin-bottom:0;">在独立页面专注并排检验 Pure GFM 母版与 13 座跨语言实测子站（Node / Go / Rust / Python / SPA）的网页渲染、目录树、相似 <code>*.md</code> 差异与工程配置。</p>
      </div>
      <a class="open-subsite-btn mono" href="/directory/">← 返回 01 生态目录挑选站点</a>
    </div>

    <section class="workbench-section" id="workbench">
      <div class="workbench-shell">
        <div class="workbench-toolbar">
          <div class="selector-group">
            <span class="pane-dot left"></span>
            <label for="select-left-site" class="mono" style="font-size:0.76rem;color:var(--text-muted);">左栏</label>
            <select id="select-left-site" class="site-select">${siteOptionsHtml}</select>
            <button type="button" class="swap-btn" id="swap-sites-btn" title="交换左右引擎">⇄ 交换</button>
            <span class="pane-dot right"></span>
            <label for="select-right-site" class="mono" style="font-size:0.76rem;color:var(--text-muted);">右栏</label>
            <select id="select-right-site" class="site-select">${siteOptionsHtml}</select>
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
          ${autoFamilyPairsHtml}
          <span class="nav-divider" role="separator"></span>
          <span class="preset-label">跨语言焦点：</span>
          <button type="button" class="preset-pill" data-preset-left="docusaurus-v3" data-preset-right="rspress">Docusaurus ↔ Rspress</button>
          <button type="button" class="preset-pill" data-preset-left="hugo" data-preset-right="zola">Hugo (Go) ↔ Zola (Rust)</button>
          <button type="button" class="preset-pill" data-preset-left="mkdocs-material" data-preset-right="mdbook">MkDocs (Py) ↔ mdBook (Rust)</button>
        </div>

        <div class="chapter-bar">
          <div class="chapter-tabs" id="chapter-tabs">
            ${chapterButtonsHtml}
          </div>
          <div class="viewport-controls" id="workbench-extra-controls"></div>
        </div>

        <div class="takeaway-banner">
          <span class="takeaway-label">实测要点</span>
          <span id="chapter-takeaway-text"></span>
        </div>

        <div class="split-grid" id="workbench-split-grid" data-focus="both"></div>
      </div>
    </section>
  `

  mountPageShell('workbench', html)
  updateWorkbenchDom()

  document.getElementById('select-left-site')?.addEventListener('change', (e) => {
    state.leftSiteId = (e.target as HTMLSelectElement).value
    state.leftConfigIndex = 0
    state.customLeftUrl = null
    updateWorkbenchDom()
  })

  document.getElementById('select-right-site')?.addEventListener('change', (e) => {
    state.rightSiteId = (e.target as HTMLSelectElement).value
    state.rightConfigIndex = 0
    state.customRightUrl = null
    updateWorkbenchDom()
  })

  document.getElementById('swap-sites-btn')?.addEventListener('click', () => {
    const tmp = state.leftSiteId
    state.leftSiteId = state.rightSiteId
    state.rightSiteId = tmp
    const tmpCfg = state.leftConfigIndex
    state.leftConfigIndex = state.rightConfigIndex
    state.rightConfigIndex = tmpCfg
    const tmpUrl = state.customLeftUrl
    state.customLeftUrl = state.customRightUrl
    state.customRightUrl = tmpUrl
    updateWorkbenchDom()
  })

  document.getElementById('lock-master-left-btn')?.addEventListener('click', () => {
    state.leftSiteId = 'master'
    if (state.rightSiteId === 'master') state.rightSiteId = 'vitepress-v1'
    state.leftConfigIndex = 0
    state.customLeftUrl = null
    updateWorkbenchDom()
  })

  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode as WorkbenchMode
      if (mode) {
        state.mode = mode
        updateWorkbenchDom()
      }
    })
  })

  document.querySelectorAll<HTMLButtonElement>('[data-chapter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ch = btn.dataset.chapter
      if (ch) {
        state.chapterId = ch
        state.customLeftUrl = null
        state.customRightUrl = null
        if (state.mode === 'tree') state.mode = 'render'
        updateWorkbenchDom()
      }
    })
  })

  document.getElementById('workbench')?.addEventListener('click', (e) => {
    const drawerBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-open-drawer]')
    if (drawerBtn?.dataset.openDrawer) {
      openDrawer(drawerBtn.dataset.openDrawer, (side, siteId) => {
        if (side === 'left') state.leftSiteId = siteId
        else state.rightSiteId = siteId
        state.leftConfigIndex = 0
        state.rightConfigIndex = 0
        state.customLeftUrl = null
        state.customRightUrl = null
        updateWorkbenchDom()
      })
      return
    }

    const treeRow = (e.target as HTMLElement).closest<HTMLElement>('[data-tree-route]')
    if (treeRow?.dataset.treeRoute) {
      if (treeRow.dataset.treeSide === 'left') state.customLeftUrl = treeRow.dataset.treeRoute
      else state.customRightUrl = treeRow.dataset.treeRoute
      state.chapterId = '04-directory'
      state.mode = 'render'
      updateWorkbenchDom()
      return
    }

    const target = (e.target as HTMLElement).closest<HTMLElement>('button')
    if (!target) return

    if (target.dataset.presetLeft && target.dataset.presetRight) {
      state.leftSiteId = target.dataset.presetLeft
      state.rightSiteId = target.dataset.presetRight
      state.leftConfigIndex = 0
      state.rightConfigIndex = 0
      state.customLeftUrl = null
      state.customRightUrl = null
      updateWorkbenchDom()
      return
    }

    if (target.dataset.viewportBtn) {
      state.viewport = target.dataset.viewportBtn as ViewportPreset
      updateWorkbenchDom()
      return
    }

    if (target.id === 'reload-iframes-btn') {
      document.querySelectorAll<HTMLIFrameElement>('.iframe-stage').forEach((frame) => {
        const src = frame.getAttribute('src')
        if (src) frame.setAttribute('src', src)
      })
      return
    }

    if (target.id === 'toggle-diff-btn') {
      state.highlightDiff = !state.highlightDiff
      updateWorkbenchDom()
      return
    }

    if (target.dataset.focusToggle) {
      state.focus = target.dataset.focusToggle as FocusedPane
      updateWorkbenchDom()
      return
    }

    if (target.dataset.cfgSide && target.dataset.cfgIdx !== undefined) {
      const idx = Number(target.dataset.cfgIdx)
      if (target.dataset.cfgSide === 'left') state.leftConfigIndex = idx
      else state.rightConfigIndex = idx
      updateWorkbenchDom()
    }
  })
}

renderWorkbenchPage()
