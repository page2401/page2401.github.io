import {
  computeDiffLineFlags,
  escapeHtml,
  renderCodeTableHtml,
  renderUnifiedDiffHtml
} from '../components/source-diff'
import type { FocusedPane, SiteEntry, ViewportPreset, WorkbenchMode } from '../types'
import {
  dataset,
  ECOSYSTEM_LABELS,
  formatBuildMs,
  formatBytes,
  mountPageShell,
  openDrawer,
  syncIframeThemes
} from '../shared/shell'

type SourceDiffLayout = 'split' | 'unified'

interface WorkbenchState {
  leftSiteId: string
  rightSiteId: string
  chapterId: string
  mode: WorkbenchMode
  sourceLayout: SourceDiffLayout
  viewport: ViewportPreset
  focus: FocusedPane
  splitRatio: number
  syncScroll: boolean
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
  const diffParam = params.get('diff')

  return {
    leftSiteId: dataset.sites.some((s) => s.id === leftParam) ? leftParam! : defaultLeft,
    rightSiteId: dataset.sites.some((s) => s.id === rightParam) ? rightParam! : defaultRight,
    chapterId: dataset.chapters.some((c) => c.id === docParam) ? docParam! : '01-annotations',
    mode:
      modeParam && ['render', 'tree', 'source', 'config'].includes(modeParam)
        ? modeParam
        : 'render',
    sourceLayout: diffParam === 'unified' ? 'unified' : 'split',
    viewport: 'fluid',
    focus: 'both',
    splitRatio: 50,
    syncScroll: true,
    leftConfigIndex: 0,
    rightConfigIndex: 0,
    highlightDiff: true,
    customLeftUrl: null,
    customRightUrl: null
  }
}

const state = loadWorkbenchState()
let syncScrollLock = false

function syncWorkbenchUrl(): void {
  const params = new URLSearchParams()
  params.set('left', state.leftSiteId)
  params.set('right', state.rightSiteId)
  params.set('doc', state.chapterId)
  params.set('mode', state.mode)
  if (state.mode === 'source' && state.sourceLayout === 'unified') {
    params.set('diff', 'unified')
  }
  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
}

function buildSubsiteRouteUrl(site: SiteEntry, chapterId: string): string {
  const doc = site.docs[chapterId]
  const base = site.basePath.endsWith('/') ? site.basePath : `${site.basePath}/`
  if (!doc || !doc.route) return base
  return `${base}${doc.route.replace(/^\/+/, '')}`
}

function findPrimaryIframeScroller(doc: Document): Element | null {
  const rootScroller = doc.scrollingElement || doc.documentElement
  if (rootScroller && rootScroller.scrollHeight > rootScroller.clientHeight + 8) {
    return rootScroller
  }
  const candidates = doc.querySelectorAll<HTMLElement>(
    '#page-wrapper, .page-inner, .book-body, .body-inner, main, .content, article'
  )
  let best: HTMLElement | null = null
  let bestDelta = 8
  candidates.forEach((el) => {
    const delta = el.scrollHeight - el.clientHeight
    if (delta > bestDelta) {
      bestDelta = delta
      best = el
    }
  })
  return best || rootScroller
}

function bindIframeSyncScroll(sourceFrame: HTMLIFrameElement, peerFrame: HTMLIFrameElement): void {
  try {
    const srcWin = sourceFrame.contentWindow
    const srcDoc = sourceFrame.contentDocument
    if (!srcWin || !srcDoc) return

    srcWin.addEventListener(
      'scroll',
      (evt) => {
        if (!state.syncScroll || syncScrollLock) return
        const rawTarget = evt.target
        const scroller =
          rawTarget === srcDoc || rawTarget === srcWin
            ? srcDoc.scrollingElement || srcDoc.documentElement
            : rawTarget instanceof Element
              ? rawTarget
              : findPrimaryIframeScroller(srcDoc)
        if (!scroller) return
        // Ignore tiny sidebar nav scrolls (<260px wide) so sidebar scrolling doesn't yank main content
        if (scroller instanceof HTMLElement && scroller.clientWidth > 0 && scroller.clientWidth < 260) {
          return
        }
        const maxSrc = scroller.scrollHeight - scroller.clientHeight
        if (maxSrc <= 4) return
        const ratio = scroller.scrollTop / maxSrc

        const peerDoc = peerFrame.contentDocument
        if (!peerDoc) return
        const peerScroller = findPrimaryIframeScroller(peerDoc)
        if (!peerScroller) return
        const maxPeer = peerScroller.scrollHeight - peerScroller.clientHeight
        if (maxPeer <= 4) return

        syncScrollLock = true
        peerScroller.scrollTop = Math.round(ratio * maxPeer)
        window.setTimeout(() => {
          syncScrollLock = false
        }, 40)
      },
      { passive: true, capture: true }
    )
  } catch {
    // Ignore cross-origin frame access if any
  }
}

function bindSplitContainersSyncScroll(splitGrid: HTMLElement): void {
  const scrollBoxes = splitGrid.querySelectorAll<HTMLElement>('.code-viewer, .tree-inspector')
  if (scrollBoxes.length !== 2) return
  const [boxA, boxB] = [scrollBoxes[0], scrollBoxes[1]]

  const syncPair = (from: HTMLElement, to: HTMLElement) => {
    from.addEventListener(
      'scroll',
      () => {
        if (!state.syncScroll || syncScrollLock) return
        const maxFrom = from.scrollHeight - from.clientHeight
        const maxTo = to.scrollHeight - to.clientHeight
        if (maxFrom <= 4 || maxTo <= 4) return
        syncScrollLock = true
        to.scrollTop = Math.round((from.scrollTop / maxFrom) * maxTo)
        window.setTimeout(() => {
          syncScrollLock = false
        }, 35)
      },
      { passive: true }
    )
  }

  syncPair(boxA, boxB)
  syncPair(boxB, boxA)
}

function bindSplitGutterDrag(splitGrid: HTMLElement): void {
  const gutter = document.getElementById('workbench-split-gutter')
  if (!gutter) return

  gutter.addEventListener('dblclick', () => {
    state.splitRatio = 50
    applySplitRatioCss(splitGrid)
    updateRatioResetButton()
  })

  gutter.addEventListener('pointerdown', (e: PointerEvent) => {
    e.preventDefault()
    gutter.setPointerCapture(e.pointerId)
    splitGrid.classList.add('is-dragging')

    const onMove = (ev: PointerEvent) => {
      const rect = splitGrid.getBoundingClientRect()
      if (rect.width <= 0) return
      const rawPct = ((ev.clientX - rect.left) / rect.width) * 100
      state.splitRatio = Math.round(Math.max(24, Math.min(76, rawPct)))
      applySplitRatioCss(splitGrid)
      updateRatioResetButton()
    }

    const onUp = (ev: PointerEvent) => {
      splitGrid.classList.remove('is-dragging')
      try {
        gutter.releasePointerCapture(ev.pointerId)
      } catch {
        // Ignore if already released
      }
      gutter.removeEventListener('pointermove', onMove)
      gutter.removeEventListener('pointerup', onUp)
      gutter.removeEventListener('pointercancel', onUp)
    }

    gutter.addEventListener('pointermove', onMove)
    gutter.addEventListener('pointerup', onUp)
    gutter.addEventListener('pointercancel', onUp)
  })
}

function applySplitRatioCss(splitGrid: HTMLElement): void {
  splitGrid.style.setProperty('--left-fr', `${state.splitRatio}fr`)
  splitGrid.style.setProperty('--right-fr', `${100 - state.splitRatio}fr`)
}

function updateRatioResetButton(): void {
  const btn = document.getElementById('reset-ratio-btn')
  if (!btn) return
  if (state.splitRatio === 50) {
    btn.style.display = 'none'
  } else {
    btn.style.display = 'inline-flex'
    btn.textContent = `⇄ 比例 ${state.splitRatio}:${100 - state.splitRatio} (重置)`
  }
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

function renderUnifiedSourcePaneHtml(leftSite: SiteEntry, rightSite: SiteEntry): string {
  const leftDoc = leftSite.docs[state.chapterId]
  const rightDoc = rightSite.docs[state.chapterId]
  const udiff = renderUnifiedDiffHtml(leftDoc?.content || '', rightDoc?.content || '')

  return `
    <div class="workbench-pane unified-pane">
      <div class="pane-header">
        <div class="pane-title-group">
          <span class="pane-dot left"></span>
          <span class="pane-engine-badge">${escapeHtml(leftSite.family)} <span class="mono" style="opacity:0.75;">(${escapeHtml(leftDoc?.file || '')})</span></span>
          <span class="mono" style="color:var(--text-muted);">──▶</span>
          <span class="pane-dot right"></span>
          <span class="pane-engine-badge">${escapeHtml(rightSite.family)} <span class="mono" style="opacity:0.75;">(${escapeHtml(rightDoc?.file || '')})</span></span>
        </div>
        <div class="pane-actions mono" style="font-size:0.75rem;">
          <span class="udiff-stat del">−${udiff.removedCount} 行移除</span>
          <span class="udiff-stat add">+${udiff.addedCount} 行新增/派生改写</span>
        </div>
      </div>
      <div class="code-viewer">
        ${udiff.html}
      </div>
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

  const benchBadgeHtml = site.benchmark
    ? `<a href="/observatory/?tab=benchmark" class="bench-pane-badge mono" title="空缓存冷构建 ${site.benchmark.coldBuildMs} ms | 总产物 ${formatBytes(site.benchmark.totalBytes)} (${site.benchmark.totalFiles} 文件) | 全站 JS Gzip ${formatBytes(site.benchmark.jsGzipBytes)} | 点击查看性能总榜">⚡ ${escapeHtml(formatBuildMs(site.benchmark.coldBuildMs, site.benchmark.isRuntimeSpa))} · ${escapeHtml(formatBytes(site.benchmark.totalBytes))}</a>`
    : ''

  return `
    <div class="workbench-pane ${side}-pane">
      <div class="pane-header">
        <div class="pane-title-group">
          <span class="pane-dot ${side}"></span>
          <span class="pane-engine-badge">${escapeHtml(site.family)} <span class="mono" style="font-weight:500;opacity:0.8;">(${escapeHtml(site.primaryPackage)}@${escapeHtml(site.primaryVersion)})</span></span>
          ${benchBadgeHtml}
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

  const syncScrollCommonBtn = `<button type="button" class="mini-btn${state.syncScroll ? ' active' : ''}" id="toggle-sync-scroll-btn" title="滚动一侧网页或代码框时另一侧按比例自动跟随">${state.syncScroll ? '⇅ 同步滚动: 开' : '⇅ 同步滚动: 关'}</button>`
  const ratioResetCommonBtn = `<button type="button" class="mini-btn mono" id="reset-ratio-btn" style="display:${state.splitRatio === 50 ? 'none' : 'inline-flex'};">⇄ 比例 ${state.splitRatio}:${100 - state.splitRatio} (重置)</button>`
  const copyLinkCommonBtn = `<button type="button" class="mini-btn" id="copy-permalink-btn" title="复制当前双栏对比状态固定链接">🔗 复制对比链接</button>`

  const extraControls = document.getElementById('workbench-extra-controls')
  if (extraControls) {
    if (state.mode === 'render') {
      extraControls.innerHTML = `
        ${syncScrollCommonBtn}
        ${ratioResetCommonBtn}
        <button type="button" class="mini-btn${state.viewport === 'fluid' ? ' active' : ''}" data-viewport-btn="fluid" id="vp-fluid-btn">双栏自适应</button>
        <button type="button" class="mini-btn${state.viewport === 'tablet' ? ' active' : ''}" data-viewport-btn="tablet" id="vp-tablet-btn">平板 768px</button>
        <button type="button" class="mini-btn${state.viewport === 'mobile' ? ' active' : ''}" data-viewport-btn="mobile" id="vp-mobile-btn">手机 390px</button>
        <button type="button" class="mini-btn" id="reload-iframes-btn">↻ 刷新</button>
        ${copyLinkCommonBtn}
      `
    } else if (state.mode === 'tree') {
      extraControls.innerHTML = `
        ${syncScrollCommonBtn}
        ${ratioResetCommonBtn}
        ${copyLinkCommonBtn}
      `
    } else if (state.mode === 'source') {
      extraControls.innerHTML = `
        <button type="button" class="mini-btn${state.sourceLayout === 'split' ? ' active' : ''}" data-source-layout="split" id="src-split-btn">⇄ 双栏源码</button>
        <button type="button" class="mini-btn${state.sourceLayout === 'unified' ? ' active' : ''}" data-source-layout="unified" id="src-unified-btn">± 行内 Unified Diff</button>
        ${
          state.sourceLayout === 'split'
            ? `${syncScrollCommonBtn}
               ${ratioResetCommonBtn}
               <button type="button" class="mini-btn${state.highlightDiff ? ' active' : ''}" id="toggle-diff-btn">
                 ${state.highlightDiff ? '✓ 差异行高亮' : '开启差异高亮'}
               </button>`
            : ''
        }
        ${copyLinkCommonBtn}
      `
    } else {
      extraControls.innerHTML = `
        ${syncScrollCommonBtn}
        ${ratioResetCommonBtn}
        ${copyLinkCommonBtn}
      `
    }
  }

  const takeawayEl = document.getElementById('chapter-takeaway-text')
  if (takeawayEl) {
    takeawayEl.textContent =
      state.mode === 'tree'
        ? '工程目录不可能三角：VitePress 平铺易混 README；Starlight 强制 3 层深目录；Docusaurus/Rspress/Nextra 依赖目录内 _category_.json/_meta.js；Hugo/Zola 强分 _index.md 与 index.md；mdBook/HonKit 靠单一 SUMMARY.md 接管。'
        : activeChapter.summary
  }

  const splitGrid = document.getElementById('workbench-split-grid')
  if (splitGrid) {
    const isUnified = state.mode === 'source' && state.sourceLayout === 'unified'
    splitGrid.setAttribute('data-focus', state.focus)
    splitGrid.setAttribute('data-unified', isUnified ? 'true' : 'false')
    applySplitRatioCss(splitGrid)

    if (isUnified) {
      splitGrid.innerHTML = renderUnifiedSourcePaneHtml(leftSite, rightSite)
    } else {
      const gutterHtml =
        state.focus === 'both'
          ? `<div class="split-gutter" id="workbench-split-gutter" role="separator" aria-orientation="vertical" title="拖动自由调整左右分屏宽度比例（双击恢复 50:50）"><span class="split-gutter-grip">⋮</span></div>`
          : ''
      splitGrid.innerHTML =
        renderPaneContent('left', leftSite, rightSite) +
        gutterHtml +
        renderPaneContent('right', rightSite, leftSite)

      if (state.focus === 'both') {
        bindSplitGutterDrag(splitGrid)
      }

      const leftFrame = document.getElementById('iframe-left') as HTMLIFrameElement | null
      const rightFrame = document.getElementById('iframe-right') as HTMLIFrameElement | null
      if (leftFrame && rightFrame) {
        leftFrame.addEventListener('load', () => {
          syncIframeThemes()
          bindIframeSyncScroll(leftFrame, rightFrame)
        })
        rightFrame.addEventListener('load', () => {
          syncIframeThemes()
          bindIframeSyncScroll(rightFrame, leftFrame)
        })
      } else {
        splitGrid.querySelectorAll<HTMLIFrameElement>('.iframe-stage').forEach((frame) => {
          frame.addEventListener('load', () => syncIframeThemes())
        })
      }

      bindSplitContainersSyncScroll(splitGrid)
    }
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
  const mountedCount = dataset.sites.filter((s) => !s.isMaster).length
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
        <p class="section-sub" style="margin-bottom:0;">支持<strong>双栏同源网页/代码同步滚动</strong>、<strong>可拖拽分屏比例分隔条</strong>与<strong>行内 Unified Diff</strong>，并排检验 Pure GFM 母版与 ${mountedCount} 座跨语言实测子站。</p>
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
          <span class="preset-label">跨流派焦点：</span>
          ${[
            ['fumadocs', 'nextra', 'Fumadocs ↔ Nextra'],
            ['docusaurus-v3', 'rspress', 'Docusaurus ↔ Rspress'],
            ['gatsby', 'docusaurus-v3', 'Gatsby (GraphQL) ↔ Docusaurus'],
            ['nuxt-content', 'vitepress-v2', 'Nuxt MDC ↔ VitePress v2'],
            ['quartz', 'hugo', 'Quartz (双链) ↔ Hugo'],
            ['hugo', 'zola', 'Hugo (Go) ↔ Zola (Rust)'],
            ['lume', 'eleventy', 'Lume (Deno) ↔ 11ty (Node)'],
            ['jekyll', 'hexo', 'Jekyll (Ruby) ↔ Hexo'],
            ['honkit', 'mdbook', 'HonKit ↔ mdBook'],
            ['sphinx', 'mkdocs-material', 'Sphinx (MyST) ↔ MkDocs'],
            ['pelican', 'sphinx', 'Pelican ↔ Sphinx']
          ]
            .filter(
              ([l, r]) =>
                dataset.sites.some((s) => s.id === l) && dataset.sites.some((s) => s.id === r)
            )
            .map(
              ([l, r, label]) =>
                `<button type="button" class="preset-pill" data-preset-left="${escapeHtml(l)}" data-preset-right="${escapeHtml(r)}">${escapeHtml(label)}</button>`
            )
            .join('')}
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

        <div class="split-grid" id="workbench-split-grid" data-focus="both" data-unified="false"></div>
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

    if (target.dataset.sourceLayout) {
      state.sourceLayout = target.dataset.sourceLayout as SourceDiffLayout
      updateWorkbenchDom()
      return
    }

    if (target.id === 'toggle-sync-scroll-btn') {
      state.syncScroll = !state.syncScroll
      target.classList.toggle('active', state.syncScroll)
      target.textContent = state.syncScroll ? '⇅ 同步滚动: 开' : '⇅ 同步滚动: 关'
      return
    }

    if (target.id === 'reset-ratio-btn') {
      state.splitRatio = 50
      const splitGrid = document.getElementById('workbench-split-grid')
      if (splitGrid) applySplitRatioCss(splitGrid)
      updateRatioResetButton()
      return
    }

    if (target.id === 'copy-permalink-btn') {
      syncWorkbenchUrl()
      const urlText = window.location.href
      navigator.clipboard?.writeText(urlText).catch(() => {})
      target.textContent = '✓ 已复制对比链接'
      target.classList.add('active')
      window.setTimeout(() => {
        target.textContent = '🔗 复制对比链接'
        target.classList.remove('active')
      }, 1600)
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
