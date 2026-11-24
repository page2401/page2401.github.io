export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function highlightMarkdownLine(rawLine: string): string {
  const escaped = escapeHtml(rawLine)
  const trimmed = rawLine.trim()

  if (trimmed === '---' || trimmed === '+++' || trimmed.startsWith('```')) {
    return `<span class="tok-fence">${escaped}</span>`
  }
  if (
    trimmed.startsWith(':::') ||
    trimmed.startsWith('::') ||
    trimmed.startsWith('> [!') ||
    trimmed.startsWith('!!! ') ||
    trimmed.startsWith('??? ') ||
    trimmed.startsWith('<Callout') ||
    trimmed.startsWith('</Callout') ||
    trimmed.startsWith('{% ') ||
    trimmed.startsWith('{{< ') ||
    trimmed.startsWith('{: .') ||
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

export interface UnifiedDiffResult {
  html: string
  addedCount: number
  removedCount: number
}

export function renderUnifiedDiffHtml(leftText: string, rightText: string): UnifiedDiffResult {
  const a = leftText.split('\n')
  const b = rightText.split('\n')
  const m = a.length
  const n = b.length

  // LCS DP over lines (benchmark chapters are ~40–140 lines, so O(m*n) runs in <1ms)
  const dp: Uint16Array[] = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1
      } else {
        const down = dp[i + 1][j]
        const right = dp[i][j + 1]
        dp[i][j] = down >= right ? down : right
      }
    }
  }

  let i = 0
  let j = 0
  let addedCount = 0
  let removedCount = 0
  const rows: string[] = []

  while (i < m && j < n) {
    if (a[i] === b[j]) {
      const code = highlightMarkdownLine(a[i]) || ' '
      rows.push(
        `<tr class="code-row udiff-ctx"><td class="line-num mono">${i + 1}</td><td class="line-num mono">${j + 1}</td><td class="udiff-sign mono"> </td><td class="line-code mono">${code}</td></tr>`
      )
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      removedCount++
      const code = highlightMarkdownLine(a[i]) || ' '
      rows.push(
        `<tr class="code-row udiff-del"><td class="line-num mono">${i + 1}</td><td class="line-num mono"></td><td class="udiff-sign mono">−</td><td class="line-code mono">${code}</td></tr>`
      )
      i++
    } else {
      addedCount++
      const code = highlightMarkdownLine(b[j]) || ' '
      rows.push(
        `<tr class="code-row udiff-add"><td class="line-num mono"></td><td class="line-num mono">${j + 1}</td><td class="udiff-sign mono">+</td><td class="line-code mono">${code}</td></tr>`
      )
      j++
    }
  }

  while (i < m) {
    removedCount++
    const code = highlightMarkdownLine(a[i]) || ' '
    rows.push(
      `<tr class="code-row udiff-del"><td class="line-num mono">${i + 1}</td><td class="line-num mono"></td><td class="udiff-sign mono">−</td><td class="line-code mono">${code}</td></tr>`
    )
    i++
  }

  while (j < n) {
    addedCount++
    const code = highlightMarkdownLine(b[j]) || ' '
    rows.push(
      `<tr class="code-row udiff-add"><td class="line-num mono"></td><td class="line-num mono">${j + 1}</td><td class="udiff-sign mono">+</td><td class="line-code mono">${code}</td></tr>`
    )
    j++
  }

  return {
    html: `<table class="code-table udiff-table"><tbody>${rows.join('')}</tbody></table>`,
    addedCount,
    removedCount
  }
}
