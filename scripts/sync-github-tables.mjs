import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const sitesDocsDir = path.join(rootDir, 'docs', 'sites')
const activityPath = path.join(sitesDocsDir, 'github-activity.json')

const activity = JSON.parse(fs.readFileSync(activityPath, 'utf-8'))
const repos = activity.repositories
const years = activity.years
const fetchedDate = activity.fetchedAt.slice(0, 10)

const SITE_REPO_MAP = {
  'vitepress-v1': ['vuejs/vitepress'],
  'vitepress-v2': ['vuejs/vitepress'],
  'vuepress-v1': ['vuejs/vuepress'],
  'vuepress-v2': ['vuepress/core', 'vuepress/ecosystem'],
  'docsify-v4': ['docsifyjs/docsify'],
  'docsify-v5': ['docsifyjs/docsify'],
  'astro7-starlight': ['withastro/starlight', 'withastro/astro'],
  'docusaurus-v3': ['facebook/docusaurus'],
  hugo: ['gohugoio/hugo'],
  'mkdocs-material': ['squidfunk/mkdocs-material'],
  rspress: ['web-infra-dev/rspress'],
  nextra: ['shuding/nextra'],
  zola: ['getzola/zola'],
  mdbook: ['rust-lang/mdBook'],
  hexo: ['hexojs/hexo'],
  jekyll: ['jekyll/jekyll']
}

function fmtNum(n) {
  return Number(n).toLocaleString('en-US')
}

function makeBar(count, max) {
  if (!max || count <= 0) return '░░░░░░░░░░░░░░░░'
  const width = 16
  const filled = Math.max(1, Math.round((count / max) * width))
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function activityStatusLabel(count, peak) {
  if (count === 0) return '⚪ 零提交停滞'
  if (count === peak) return '🔥 历史最高峰'
  const ratio = count / Math.max(1, peak)
  if (ratio >= 0.6 || count >= 500) return '🟢 高频活跃'
  if (ratio >= 0.25 || count >= 120) return '🔵 稳健迭代'
  return '🟡 低频维护'
}

function renderSiteSection(repoKeys) {
  const metaRows = repoKeys
    .map((key) => {
      const r = repos[key]
      const latestTag = r.latestRelease?.tagName
        ? `\`${r.latestRelease.tagName}\` (${r.latestRelease.publishedAt.slice(0, 10)})`
        : r.recentReleases?.[0]?.tagName
          ? `\`${r.recentReleases[0].tagName}\` (${r.recentReleases[0].publishedAt.slice(0, 10)})`
          : '—'
      return `| [\`${r.repo}\`](${r.url}) | \`${r.createdAt.slice(0, 10)}\` | \`${r.pushedAt.slice(0, 10)}\` | ★ ${fmtNum(r.stars)} | ${fmtNum(r.totalCommits)} | \`${r.peakYear}\` (${fmtNum(r.peakCommits)}) | ${latestTag} |`
    })
    .join('\n')

  let commitTable = ''

  if (repoKeys.length === 1) {
    const r = repos[repoKeys[0]]
    const activeYears = years.filter((y) => y >= r.createdYear)
    const rows = activeYears
      .map((y) => {
        const c = r.yearlyCommits[String(y)] ?? 0
        const pct = r.peakCommits > 0 ? `${((c / r.peakCommits) * 100).toFixed(1)}%` : '0.0%'
        const bar = makeBar(c, r.peakCommits)
        const status = activityStatusLabel(c, r.peakCommits)
        return `| \`${y}\` | **${fmtNum(c)}** | ${pct} | \`${bar}\` | ${status} |`
      })
      .join('\n')

    commitTable = [
      `### 主分支历年提交活跃度表（\`${r.createdYear}–${years[years.length - 1]}\`）`,
      '',
      '| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |',
      '| :--- | ---: | ---: | :--- | :--- |',
      rows
    ].join('\n')
  } else {
    const minYear = Math.min(...repoKeys.map((k) => repos[k].createdYear))
    const activeYears = years.filter((y) => y >= minYear)
    let maxCombined = 1
    for (const y of activeYears) {
      const sum = repoKeys.reduce((acc, k) => acc + (repos[k].yearlyCommits[String(y)] ?? 0), 0)
      if (sum > maxCombined) maxCombined = sum
    }

    const headers = repoKeys.map((k) => `\`${k}\``).join(' | ')
    const aligns = repoKeys.map(() => '---:').join(' | ')
    const rows = activeYears
      .map((y) => {
        const cols = repoKeys.map((k) => {
          const r = repos[k]
          if (y < r.createdYear) return '—'
          return fmtNum(r.yearlyCommits[String(y)] ?? 0)
        })
        const sum = repoKeys.reduce((acc, k) => acc + (repos[k].yearlyCommits[String(y)] ?? 0), 0)
        return `| \`${y}\` | ${cols.join(' | ')} | **${fmtNum(sum)}** | \`${makeBar(sum, maxCombined)}\` |`
      })
      .join('\n')

    commitTable = [
      `### 双仓库协同历年提交活跃度表（\`${minYear}–${years[years.length - 1]}\`）`,
      '',
      `| 年份 | ${headers} | 合计提交 | 合计活跃趋势条 |`,
      `| :--- | ${aligns} | ---: | :--- |`,
      rows
    ].join('\n')
  }

  return [
    `> 数据源快照：[\`docs/sites/github-activity.json\`](./github-activity.json)（GitHub GraphQL API 采样日期：\`${fetchedDate}\`）`,
    '',
    '| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |',
    '| :--- | :--- | :--- | ---: | ---: | :--- | :--- |',
    metaRows,
    '',
    commitTable
  ].join('\n')
}

function renderIndexMatrix() {
  const recentYears = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
  const yearCols = recentYears.map((y) => `\`${String(y).slice(2)}年\``).join(' | ')
  const yearAligns = recentYears.map(() => '---:').join(' | ')

  const rows = Object.values(repos)
    .map((r) => {
      const pre2016 = years
        .filter((y) => y < 2016)
        .reduce((acc, y) => acc + (r.yearlyCommits[String(y)] ?? 0), 0)
      const preCell = r.createdYear < 2016 ? fmtNum(pre2016) : '·'

      const cells = recentYears.map((y) => {
        if (y < r.createdYear) return '·'
        const c = r.yearlyCommits[String(y)] ?? 0
        if (y === r.peakYear && c > 0) return `**${c}**`
        return String(c)
      })

      const siteLinks = r.siteIds.map((id) => `[\`${id}\`](./${id}.md)`).join(' ')
      return `| [\`${r.repo}\`](${r.url}) | ${siteLinks} | \`${r.createdAt.slice(0, 7)}\` | ★ ${fmtNum(r.stars)} | ${fmtNum(r.totalCommits)} | ${preCell} | ${cells.join(' | ')} |`
    })
    .join('\n')

  return [
    `> 采样时间：\`${fetchedDate}\` · 原始 API 数据文件：[\`github-activity.json\`](./github-activity.json) · 粗体数字代表该仓库 ` +
      '`2016–2026` 期间最高峰年份，`·` 表示当年尚未立项建仓。',
    '',
    `| 上游 GitHub 仓库 | 关联 \`sites/<id>\` | 立项月份 | Stars | 总提交 | \`08-15\`累计 | ${yearCols} |`,
    `| :--- | :--- | :--- | ---: | ---: | ---: | ${yearAligns} |`,
    rows
  ].join('\n')
}

function replaceBlock(filePath, startMarker, endMarker, generated) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const re = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`)
  if (!re.test(raw)) {
    throw new Error(`Missing marker ${startMarker} in ${filePath}`)
  }
  const updated = raw.replace(re, `${startMarker}\n${generated}\n${endMarker}`)
  fs.writeFileSync(filePath, updated, 'utf-8')
}

replaceBlock(
  path.join(sitesDocsDir, 'index.md'),
  '<!-- GITHUB_API_INDEX_START -->',
  '<!-- GITHUB_API_INDEX_END -->',
  renderIndexMatrix()
)

for (const [siteId, repoKeys] of Object.entries(SITE_REPO_MAP)) {
  const mdPath = path.join(sitesDocsDir, `${siteId}.md`)
  replaceBlock(
    mdPath,
    '<!-- GITHUB_API_TABLE_START -->',
    '<!-- GITHUB_API_TABLE_END -->',
    renderSiteSection(repoKeys)
  )
}

console.log(`[sync-github-tables] Injected GitHub API yearly commit tables into index.md + ${Object.keys(SITE_REPO_MAP).length} docs/sites/<id>.md files.`)
