export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function highlightMarkdownLine(rawLine: string): string {
  const escaped = escapeHtml(rawLine)
  const trimmed = rawLine.trim()

  if (trimmed === '---' || trimmed.startsWith('```')) {
    return `<span class="tok-fence">${escaped}</span>`
  }
  if (
    trimmed.startsWith(':::') ||
    trimmed.startsWith('> [!') ||
    trimmed.startsWith('<details') ||
    trimmed.startsWith('</details') ||
    trimmed.startsWith('<summary')
  ) {
    return `<span class="tok-callout">${escaped}</span>`
  }
  if (/^#{1,6}\s/.test(trimmed)) {
    return `<span class="tok-heading">${escaped}</span>`
  }
  if (trimmed === '$$' || trimmed.startsWith('\\begin{') || trimmed.startsWith('\\end{')) {
    return `<span class="tok-math">${escaped}</span>`
  }
  return escaped
}

export function computeDiffLineFlags(primaryText: string, counterpartText: string): boolean[] {
  const primaryLines = primaryText.split('\n')
  const counterpartSet = new Set(
    counterpartText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
  )

  return primaryLines.map((line) => {
    const trimmed = line.trim()
    if (!trimmed) return false
    return !counterpartSet.has(trimmed)
  })
}

export function renderCodeTableHtml(
  content: string,
  diffFlags?: boolean[],
  isMarkdown = true
): { html: string; diffCount: number } {
  const lines = content.split('\n')
  let diffCount = 0

  const rowsHtml = lines
    .map((line, idx) => {
      const isDiff = diffFlags ? Boolean(diffFlags[idx]) : false
      if (isDiff) diffCount++
      const formatted = isMarkdown ? highlightMarkdownLine(line) : escapeHtml(line)
      return `<tr class="code-row${isDiff ? ' is-diff' : ''}"><td class="line-num mono">${idx + 1}</td><td class="line-code mono">${formatted || ' '}</td></tr>`
    })
    .join('')

  return {
    html: `<table class="code-table"><tbody>${rowsHtml}</tbody></table>`,
    diffCount
  }
}
