import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Marked } from 'marked'
import katex from 'katex'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const docsDir = path.join(rootDir, 'docs')
const outRoot = path.join(rootDir, 'dist', 'master')
const vendorDir = path.join(outRoot, 'vendor')

fs.rmSync(outRoot, { recursive: true, force: true })
fs.mkdirSync(path.join(vendorDir, 'fonts'), { recursive: true })

fs.copyFileSync(
  path.join(rootDir, 'node_modules/katex/dist/katex.min.css'),
  path.join(vendorDir, 'katex.min.css')
)
for (const f of fs.readdirSync(path.join(rootDir, 'node_modules/katex/dist/fonts'))) {
  fs.copyFileSync(
    path.join(rootDir, 'node_modules/katex/dist/fonts', f),
    path.join(vendorDir, 'fonts', f)
  )
}
fs.copyFileSync(
  path.join(rootDir, 'node_modules/mermaid/dist/mermaid.min.js'),
  path.join(vendorDir, 'mermaid.min.js')
)

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return { meta: {}, body: raw }
  const meta = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.+)$/)
    if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, '')
  }
  return { meta, body: raw.slice(m[0].length) }
}

function preprocessMath(md) {
  const codeBlocks = []
  let out = md.replace(/```[\s\S]*?```|`[^`\n]+`/g, (m) => {
    codeBlocks.push(m)
    return `@@MASTER_CODE_${codeBlocks.length - 1}@@`
  })

  out = out.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
    return `<div class="gfm-math-block">${katex.renderToString(tex.trim(), {
      displayMode: true,
      throwOnError: false
    })}</div>`
  })

  out = out.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (_, tex) => {
    return katex.renderToString(tex, { displayMode: false, throwOnError: false })
  })

  out = out.replace(/\\\$/g, '&#36;')

  return out.replace(/@@MASTER_CODE_(\d+)@@/g, (_, idx) => codeBlocks[Number(idx)])
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const marked = new Marked()
marked.use({
  renderer: {
    code(token) {
      const text = typeof token === 'object' ? token.text : token
      const lang = typeof token === 'object' ? token.lang : arguments[1]
      if (lang === 'mermaid') {
        const b64 = Buffer.from(text, 'utf-8').toString('base64')
        return `<div class="gfm-mermaid" data-b64="${b64}"><pre class="mermaid">${escapeHtml(text)}</pre></div>`
      }
      return `<pre><code class="language-${escapeHtml(lang || 'text')}">${escapeHtml(text)}</code></pre>`
    },
    blockquote(token) {
      const html = this.parser.parse(token.tokens)
      const alertMatch = html.match(/^<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>|\n)?/i)
      if (alertMatch) {
        const kind = alertMatch[1].toLowerCase()
        const labels = {
          note: 'Note',
          tip: 'Tip',
          important: 'Important',
          warning: 'Warning',
          caution: 'Caution'
        }
        const cleaned = html.replace(
          /^<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>|\n)?/i,
          '<p>'
        )
        return `<div class="gfm-alert gfm-alert-${kind}"><div class="gfm-alert-title">${labels[kind] || kind}</div>${cleaned}</div>`
      }
      return `<blockquote>${html}</blockquote>`
    },
    link(token) {
      let href = token.href || ''
      if (!href.startsWith('http') && href.endsWith('.md')) {
        if (href.endsWith('/index.md')) href = href.slice(0, -'index.md'.length) || './'
        else if (href === 'index.md' || href === './index.md') href = './'
        else href = href.slice(0, -3)
      }
      const text = this.parser.parseInline(token.tokens)
      return `<a href="${escapeHtml(href)}">${text}</a>`
    }
  }
})

function buildHtmlShell(title, relDepthPrefix, contentHtml, activeRel) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} — 本站母版 (Pure GFM)</title>
    <link rel="stylesheet" href="${relDepthPrefix}vendor/katex.min.css" />
    <style>
      :root, [data-theme="light"] {
        --bg: #ffffff;
        --bg-nav: #f6f8fa;
        --text: #1f2328;
        --muted: #59636e;
        --border: #d1d9e0;
        --code-bg: #f6f8fa;
        --link: #0969da;
      }
      html.dark, [data-theme="dark"] {
        --bg: #0d1117;
        --bg-nav: #161b22;
        --text: #e6edf3;
        --muted: #8b949e;
        --border: #30363d;
        --code-bg: #161b22;
        --link: #58a6ff;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", Helvetica, Arial, sans-serif;
        background: var(--bg);
        color: var(--text);
        line-height: 1.65;
        font-size: 15px;
      }
      .topbar {
        position: sticky;
        top: 0;
        z-index: 10;
        background: var(--bg-nav);
        border-bottom: 1px solid var(--border);
        padding: 0.6rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        flex-wrap: wrap;
        font-size: 13px;
      }
      .topbar-title { font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }
      .gfm-badge {
        font-size: 11px;
        padding: 0.1rem 0.45rem;
        border-radius: 999px;
        background: rgba(9, 105, 218, 0.12);
        color: var(--link);
        font-weight: 600;
      }
      .topbar-nav { display: flex; gap: 0.75rem; flex-wrap: wrap; }
      .topbar-nav a { color: var(--muted); text-decoration: none; font-weight: 500; }
      .topbar-nav a:hover, .topbar-nav a.active { color: var(--link); }
      main {
        max-width: 860px;
        margin: 0 auto;
        padding: 1.75rem 1.5rem 3rem;
      }
      a { color: var(--link); text-decoration: none; }
      a:hover { text-decoration: underline; }
      h1, h2, h3 { line-height: 1.3; margin-top: 1.6em; margin-bottom: 0.6em; }
      h1 { font-size: 1.75rem; margin-top: 0.2em; padding-bottom: 0.35em; border-bottom: 1px solid var(--border); }
      h2 { font-size: 1.3rem; padding-bottom: 0.25em; border-bottom: 1px solid var(--border); }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 85%;
        background: var(--code-bg);
        padding: 0.18em 0.38em;
        border-radius: 5px;
      }
      pre {
        background: var(--code-bg);
        border: 1px solid var(--border);
        padding: 0.9rem 1rem;
        border-radius: 6px;
        overflow-x: auto;
      }
      pre code { background: none; padding: 0; font-size: 13px; }
      table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 14px; }
      th, td { border: 1px solid var(--border); padding: 0.5rem 0.75rem; text-align: left; }
      th { background: var(--bg-nav); }
      blockquote {
        margin: 1rem 0;
        padding: 0.2rem 1rem;
        color: var(--muted);
        border-left: 4px solid var(--border);
      }
      details {
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 0.65rem 0.95rem;
        margin: 1rem 0;
        background: var(--bg-nav);
      }
      summary { cursor: pointer; font-weight: 600; }
      .gfm-alert {
        margin: 1rem 0;
        padding: 0.65rem 1rem;
        border-left: 4px solid #0969da;
        background: var(--bg-nav);
        border-radius: 0 6px 6px 0;
      }
      .gfm-alert-title { font-weight: 700; font-size: 13.5px; margin-bottom: 0.25rem; }
      .gfm-alert-note { border-left-color: #0969da; }
      .gfm-alert-note .gfm-alert-title { color: #0969da; }
      .gfm-alert-tip { border-left-color: #1a7f37; }
      .gfm-alert-tip .gfm-alert-title { color: #1a7f37; }
      .gfm-alert-important { border-left-color: #8250df; }
      .gfm-alert-important .gfm-alert-title { color: #8250df; }
      .gfm-alert-warning { border-left-color: #9a6700; }
      .gfm-alert-warning .gfm-alert-title { color: #9a6700; }
      .gfm-alert-caution { border-left-color: #d1242f; }
      .gfm-alert-caution .gfm-alert-title { color: #d1242f; }
      .gfm-alert p:last-child { margin-bottom: 0; }
      .gfm-math-block { overflow-x: auto; padding: 0.5rem 0; text-align: center; }
      .gfm-mermaid {
        margin: 1.25rem 0;
        padding: 1rem;
        border: 1px solid var(--border);
        border-radius: 6px;
        background: var(--bg-nav);
        display: flex;
        justify-content: center;
        overflow-x: auto;
      }
    </style>
  </head>
  <body>
    <header class="topbar">
      <div class="topbar-title">
        <span>★ 本站母版 (docs/${escapeHtml(activeRel)})</span>
        <span class="gfm-badge">Pure GFM 参考基准</span>
      </div>
      <nav class="topbar-nav">
        <a href="/master/">00. 母版概览</a>
        <a href="/master/01-annotations">01. 标注</a>
        <a href="/master/02-diagrams">02. 流程图</a>
        <a href="/master/03-math">03. 公式</a>
        <a href="/master/04-directory/">04. 目录结构</a>
        <a href="https://github.com/page2401/page2401.github.io/blob/main/docs/${escapeHtml(activeRel)}" target="_blank" rel="noopener">GitHub 原文 ↗</a>
      </nav>
    </header>
    <main>${contentHtml}</main>
    <script src="${relDepthPrefix}vendor/mermaid.min.js"></script>
    <script>
      function decodeB64(b64) {
        const bin = atob(b64)
        return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
      }
      async function renderMermaid() {
        const boxes = document.querySelectorAll('.gfm-mermaid[data-b64]')
        if (!boxes.length || !window.mermaid) return
        const isDark = document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark'
        window.mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'default', securityLevel: 'loose' })
        let i = 0
        for (const box of boxes) {
          const src = decodeB64(box.getAttribute('data-b64'))
          const { svg } = await window.mermaid.render('master-mmd-' + Date.now() + '-' + i++, src)
          box.innerHTML = svg
        }
      }
      renderMermaid()
      new MutationObserver(() => renderMermaid()).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'class']
      })
    </script>
  </body>
</html>`
}

function walkDocs(relDir) {
  const absDir = path.join(docsDir, relDir)
  for (const ent of fs.readdirSync(absDir, { withFileTypes: true })) {
    const relPath = relDir ? `${relDir}/${ent.name}` : ent.name
    if (ent.isDirectory()) {
      walkDocs(relPath)
    } else if (ent.name.endsWith('.md')) {
      const raw = fs.readFileSync(path.join(docsDir, relPath), 'utf-8')
      const { meta, body } = parseFrontmatter(raw)
      const mathReady = preprocessMath(body)
      const htmlContent = marked.parse(mathReady)

      const depth = relPath.split('/').length - 1
      const relPrefix = depth === 0 ? './' : '../'.repeat(depth)

      let outFile
      if (relPath === 'index.md') {
        outFile = path.join(outRoot, 'index.html')
      } else if (relPath.endsWith('/index.md')) {
        outFile = path.join(outRoot, relPath.slice(0, -'index.md'.length), 'index.html')
      } else {
        outFile = path.join(outRoot, `${relPath.slice(0, -3)}.html`)
      }

      fs.mkdirSync(path.dirname(outFile), { recursive: true })
      fs.writeFileSync(
        outFile,
        buildHtmlShell(meta.title || relPath, relPrefix, htmlContent, relPath),
        'utf-8'
      )
    }
  }
}

walkDocs('')
console.log('[build-master-docs] Compiled canonical docs/*.md -> dist/master/')
