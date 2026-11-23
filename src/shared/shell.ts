import '../styles/main.css'
import rawDataset from '../generated/comparison-data.json'
import type { ComparisonDataset, LandscapeRow } from '../types'
import { escapeHtml } from '../components/source-diff'

export const dataset = rawDataset as ComparisonDataset

export type ActiveChannel = 'home' | 'directory' | 'workbench' | 'observatory' | 'architecture'

export const ECOSYSTEM_LABELS: Record<string, string> = {
  gfm: '★ 基准母版 (Pure GFM)',
  vue: 'Vue 生态文档派',
  'react-astro': 'React / Astro / MDX 派',
  native: 'Go / Rust 单二进制派',
  runtime: '零预编译 SPA 运行时派',
  'python-classic': 'Python 科研与经典博客派'
}

export function formatCompactNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function renderSparklineSvg(row: LandscapeRow): string {
  const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
  const values = years.map((y) => (y < row.createdYear ? 0 : row.yearlyCommits[String(y)] ?? 0))
  const maxVal = Math.max(10, ...values)
  const w = 116
  const h = 30
  const padY = 3

  const pts = values.map((v, idx) => {
    const x = Number(((idx / (years.length - 1)) * w).toFixed(1))
    const y = Number((h - padY - (v / maxVal) * (h - padY * 2)).toFixed(1))
    return { x, y, v, yr: years[idx] }
  })

  const strokeColor = row.isEol ? 'var(--accent-copper)' : 'var(--accent-teal)'
  const polyPoints = pts.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = `0,${h - padY} ${polyPoints} ${w},${h - padY}`

  let peakIdx = 0
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].v >= pts[peakIdx].v) peakIdx = i
  }
  const lastPt = pts[pts.length - 1]
  const peakPt = pts[peakIdx]

  return `
    <svg class="sparkline-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="2016–2026 提交活跃曲线">
      <polygon points="${areaPoints}" fill="${strokeColor}" opacity="0.13"></polygon>
      <polyline points="${polyPoints}" fill="none" stroke="${strokeColor}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${peakPt.v > 0 ? `<circle cx="${peakPt.x}" cy="${peakPt.y}" r="2.3" fill="${strokeColor}"><title>${peakPt.yr} 峰值: ${peakPt.v} 次提交</title></circle>` : ''}
      <circle cx="${lastPt.x}" cy="${lastPt.y}" r="2.5" fill="${strokeColor}"><title>2026 年: ${lastPt.v} 次提交</title></circle>
    </svg>
  `
}

export function syncIframeThemes(): void {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  document.querySelectorAll<HTMLIFrameElement>('.iframe-stage').forEach((frame) => {
    try {
      const doc = frame.contentDocument
      if (!doc || !doc.documentElement) return
      doc.documentElement.classList.toggle('dark', isDark)
      doc.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    } catch {
      // Ignore cross-origin frame access
    }
  })
}

function updateThemeButtonLabel(): void {
  const btn = document.getElementById('theme-toggle-btn')
  if (!btn) return
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  btn.textContent = isDark ? '☀ 浅色' : '☾ 深色'
}

function toggleTheme(onAfterToggle?: () => void): void {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('page2401-theme', next)
  localStorage.setItem('vitepress-theme-appearance', next)
  localStorage.setItem('starlight-theme', next)
  updateThemeButtonLabel()
  syncIframeThemes()
  onAfterToggle?.()
}

function renderInspectorDrawerContent(
  row: LandscapeRow,
  onWorkbenchSelect?: (side: 'left' | 'right', siteId: string) => void
): string {
  const pinnedEntries = row.libs.pinnedPackages ? Object.entries(row.libs.pinnedPackages) : []
  const pinnedRowHtml =
    pinnedEntries.length > 0
      ? `<tr><th>实测锁定版本</th><td class="mono">${pinnedEntries.map(([k, v]) => `${escapeHtml(k)}@${escapeHtml(v)}`).join(' · ')}</td></tr>`
      : ''

  const allYears = Object.keys(row.yearlyCommits)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((y) => y >= row.createdYear)
  const maxCommits = Math.max(1, ...allYears.map((y) => row.yearlyCommits[String(y)] ?? 0))

  const barRowsHtml = allYears
    .map((y) => {
      const c = row.yearlyCommits[String(y)] ?? 0
      const pct = Math.max(0, Math.round((c / maxCommits) * 100))
      return `
        <div class="commit-bar-row mono">
          <span>${y}</span>
          <div class="commit-bar-track">
            <div class="commit-bar-fill${c === 0 ? ' zero' : ''}" style="width:${pct}%"></div>
          </div>
          <span style="text-align:right;font-weight:600;">${c.toLocaleString('en-US')}</span>
        </div>
      `
    })
    .join('')

  const wbLoadBtns = row.mounted
    ? onWorkbenchSelect
      ? `
        <button type="button" class="open-subsite-btn mono" data-drawer-wb="left" data-site-id="${escapeHtml(row.id)}" style="border-color:var(--accent-teal);color:var(--accent-teal);cursor:pointer;">⬅ 载入工作台左栏</button>
        <button type="button" class="open-subsite-btn mono" data-drawer-wb="right" data-site-id="${escapeHtml(row.id)}" style="border-color:var(--accent-copper);color:var(--accent-copper);cursor:pointer;">载入工作台右栏 ➡</button>
      `
      : `
        <a class="open-subsite-btn mono" href="/workbench/?left=${encodeURIComponent(row.id)}&right=vitepress-v1" style="border-color:var(--accent-teal);color:var(--accent-teal);">⬅ 设为分屏左栏</a>
        <a class="open-subsite-btn mono" href="/workbench/?left=master&right=${encodeURIComponent(row.id)}" style="border-color:var(--accent-copper);color:var(--accent-copper);">与母版分屏对比 ➡</a>
      `
    : ''

  return `
    <div class="drawer-header">
      <div>
        <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          <h3 style="margin:0;font-size:1.15rem;">${escapeHtml(row.name)}</h3>
          <span class="status-badge ${row.mounted ? 'mounted' : 'catalog'} mono">${row.mounted ? `★ 已挂载 ${escapeHtml(row.sitePath)}` : `📦 预留 ${escapeHtml(row.sitePath)}`}</span>
        </div>
        <div class="mono" style="font-size:0.76rem;color:var(--text-muted);margin-top:0.2rem;">
          docs/sites/${escapeHtml(row.id)}.json · ${escapeHtml(row.versionNote)}
        </div>
      </div>
      <button type="button" class="drawer-close-btn" id="drawer-close-btn">✕ 关闭</button>
    </div>

    <div class="drawer-body">
      <div class="drawer-link-row">
        <a class="open-subsite-btn mono" href="${escapeHtml(row.websiteUrl)}" target="_blank" rel="noopener">🌐 ${escapeHtml(row.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''))} ↗</a>
        <a class="open-subsite-btn mono" href="${escapeHtml(row.githubUrl)}" target="_blank" rel="noopener">GitHub (${escapeHtml(row.upstreamRepo)}) ↗</a>
        <a class="open-subsite-btn mono" href="${escapeHtml(row.packageUrl)}" target="_blank" rel="noopener">📦 包仓库 ↗</a>
        <a class="open-subsite-btn mono" href="${escapeHtml(row.profileRoute)}" target="_blank" rel="noopener">📖 ${escapeHtml(row.id)}.md ↗</a>
        <a class="open-subsite-btn mono" href="${escapeHtml(row.jsonRoute)}" target="_blank" rel="noopener">{ } ${escapeHtml(row.id)}.json ↗</a>
        ${wbLoadBtns}
      </div>

      <div>
        <h4 class="drawer-sec-title">1. 生命周期与 GitHub 指标</h4>
        <table class="drawer-kv-table">
          <tbody>
            <tr><th>开始时间</th><td class="mono">${escapeHtml(row.lifecycleDetail.startedAt)}（GitHub 创建：${escapeHtml(row.createdAt)}）</td></tr>
            <tr><th>活跃时间</th><td>${escapeHtml(row.lifecycleDetail.activePeriod)}</td></tr>
            <tr><th>废弃 / EOL</th><td>${escapeHtml(row.lifecycleDetail.deprecatedAt || '无（当前正常演进维护中）')}</td></tr>
            <tr><th>仓库状态</th><td class="mono">★ ${row.stars.toLocaleString('en-US')} Stars · Forks ${row.forks.toLocaleString('en-US')} · Issues ${row.openIssues} · ${escapeHtml(row.license)} · 最近推送 ${escapeHtml(row.pushedAt)}</td></tr>
            <tr><th>标签 (Tags)</th><td class="mono">${row.tags.map((t) => `#${escapeHtml(t)}`).join('  ')}</td></tr>
          </tbody>
        </table>
      </div>

      <div>
        <h4 class="drawer-sec-title">2. 底层依赖库清单 (Libs)</h4>
        <table class="drawer-kv-table">
          <tbody>
            <tr><th>运行时与打包</th><td>${escapeHtml(row.libs.runtime)} · ${escapeHtml(row.libs.bundler)}</td></tr>
            <tr><th>UI 与解析引擎</th><td>${escapeHtml(row.libs.uiFramework)} · <code>${escapeHtml(row.libs.markdownEngine)}</code></td></tr>
            <tr><th>高亮与搜索</th><td>${escapeHtml(row.libs.codeHighlight)} · ${escapeHtml(row.libs.searchEngine)}</td></tr>
            <tr><th>公式与图表库</th><td>${escapeHtml(row.libs.mathLib)} ； ${escapeHtml(row.libs.diagramLib)}</td></tr>
            <tr><th>核心 Libs</th><td class="mono">${escapeHtml(row.coreLibs.join(', '))}</td></tr>
            ${pinnedRowHtml}
          </tbody>
        </table>
      </div>

      <div>
        <h4 class="drawer-sec-title">3. GitHub 主分支历年提交曲线 (${row.createdYear}–2026 · 共 ${row.totalCommits.toLocaleString('en-US')} 次)</h4>
        <div class="drawer-commit-bars">${barRowsHtml}</div>
      </div>

      <div>
        <h4 class="drawer-sec-title">4. 目录与方言边界摘要</h4>
        <table class="drawer-kv-table">
          <tbody>
            <tr><th>目录与侧栏</th><td>${escapeHtml(row.directoryModel)}</td></tr>
            <tr><th>提示框方言</th><td>${escapeHtml(row.calloutDialect)}</td></tr>
            <tr><th>图表与公式</th><td>${escapeHtml(row.diagramAndMath)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `
}

export function openDrawer(
  siteId: string,
  onWorkbenchSelect?: (side: 'left' | 'right', siteId: string) => void
): void {
  const row = dataset.landscapeRows.find((r) => r.id === siteId)
  if (!row) return
  const drawer = document.getElementById('inspector-drawer')
  const backdrop = document.getElementById('drawer-backdrop')
  if (drawer && backdrop) {
    drawer.innerHTML = renderInspectorDrawerContent(row, onWorkbenchSelect)
    drawer.classList.add('open')
    backdrop.classList.add('open')
    document.getElementById('drawer-close-btn')?.addEventListener('click', closeDrawer)
    if (onWorkbenchSelect) {
      drawer.querySelectorAll<HTMLButtonElement>('[data-drawer-wb]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const side = btn.dataset.drawerWb === 'left' ? 'left' : 'right'
          const id = btn.dataset.siteId
          if (id) {
            closeDrawer()
            onWorkbenchSelect(side, id)
          }
        })
      })
    }
  }
}

export function closeDrawer(): void {
  document.getElementById('inspector-drawer')?.classList.remove('open')
  document.getElementById('drawer-backdrop')?.classList.remove('open')
}

export function mountPageShell(
  activeChannel: ActiveChannel,
  mainInnerHtml: string,
  options?: { onThemeToggle?: () => void }
): void {
  const app = document.getElementById('app')
  if (!app) return

  const totalSites = dataset.landscapeRows.length
  const mountedCount = dataset.landscapeRows.filter((r) => r.mounted).length
  const masterSite = dataset.sites.find((s) => s.isMaster)
  const mountedSites = dataset.sites.filter((s) => !s.isMaster)

  const subsitePopoverItemsHtml = mountedSites
    .map(
      (s) => `
        <a class="subsite-popover-item" href="${escapeHtml(s.basePath)}" target="_blank" rel="noopener">
          <div>
            <strong>${escapeHtml(s.family)} ${escapeHtml(s.versionSeries)}</strong>
            <div class="subsite-popover-ver mono">${escapeHtml(s.primaryPackage)}@${escapeHtml(s.primaryVersion)}</div>
          </div>
          <span class="mono" style="font-size:0.74rem;color:var(--accent-teal);">${escapeHtml(s.basePath)} ↗</span>
        </a>
      `
    )
    .join('')

  const navItem = (ch: ActiveChannel, href: string, label: string) => {
    const isAct = activeChannel === ch
    return `<a class="nav-link${isAct ? ' active' : ''}" href="${href}"${isAct ? ' aria-current="page"' : ''}>${label}</a>`
  }

  app.innerHTML = `
    <header class="masthead">
      <div class="container masthead-inner">
        <a href="/" class="brand" id="brand-home-link">
          <span class="brand-domain mono">page.2401.xyz</span>
          <span class="brand-pill mono">SSG Observatory</span>
          <span class="brand-sub">静态网站生成器全景图谱与实测对比台</span>
        </a>

        <nav class="nav-links" aria-label="主导航">
          ${navItem('directory', '/directory/', `01 生态目录 (${totalSites})`)}
          ${navItem('workbench', '/workbench/', `02 分屏工作台 (${mountedCount})`)}
          ${navItem('observatory', '/observatory/', '03 演化观测台')}
          ${navItem('architecture', '/architecture/', '04 扩展规范')}
        </nav>

        <div class="masthead-right">
          <details class="subsite-launcher" id="subsite-launcher">
            <summary class="mono">🚀 已挂载子站 (${mountedCount}) ▾</summary>
            <div class="subsite-popover">
              ${
                masterSite
                  ? `<div class="subsite-popover-group">唯一原始母版 (Canonical GFM)</div>
                     <a class="subsite-popover-item" href="${escapeHtml(masterSite.basePath)}" target="_blank" rel="noopener">
                       <div>
                         <strong>★ 本站母版 (docs/*.md)</strong>
                         <div class="subsite-popover-ver mono">标准 GFM + 站点元数据档案库</div>
                       </div>
                       <span class="mono" style="font-size:0.74rem;color:var(--accent-teal);">/master/ ↗</span>
                     </a>`
                  : ''
              }
              <div class="subsite-popover-group">同源独立版本子模块 (sites/*)</div>
              ${subsitePopoverItemsHtml}
            </div>
          </details>
          <a class="theme-btn mono" href="https://github.com/page2401/page2401.github.io" target="_blank" rel="noopener">GitHub ↗</a>
          <button type="button" class="theme-btn" id="theme-toggle-btn">☾ 深色</button>
        </div>
      </div>
    </header>

    <main class="container" id="page-main">
      ${mainInnerHtml}
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
  `

  updateThemeButtonLabel()
  document
    .getElementById('theme-toggle-btn')
    ?.addEventListener('click', () => toggleTheme(options?.onThemeToggle))
  document.getElementById('drawer-backdrop')?.addEventListener('click', closeDrawer)

  document.addEventListener('click', (e) => {
    const launcher = document.getElementById('subsite-launcher') as HTMLDetailsElement | null
    if (launcher && launcher.open && !launcher.contains(e.target as Node)) {
      launcher.open = false
    }
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer()
      const launcher = document.getElementById('subsite-launcher') as HTMLDetailsElement | null
      if (launcher) launcher.open = false
    }
  })
}
