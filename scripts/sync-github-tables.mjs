import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const sitesDocsDir = path.join(rootDir, 'docs', 'sites')

const siteDocs = fs
  .readdirSync(sitesDocsDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(sitesDocsDir, f), 'utf-8')))
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

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

function renderSiteSection(doc) {
  const gh = doc.github
  const fetchedDate = gh.fetchedAt.slice(0, 10)
  const years = Object.keys(gh.yearlyCommits)
    .map(Number)
    .sort((a, b) => a - b)

  const tagsStr = (doc.tags || []).map((t) => `\`#${t}\``).join(' · ')
  const coreLibsStr = (doc.libs?.coreLibs || []).map((l) => `\`${l}\``).join('、')
  const pinnedStr = doc.libs?.pinnedPackages
    ? Object.entries(doc.libs.pinnedPackages)
        .map(([k, v]) => `\`${k}@${v}\``)
        .join(' · ')
    : null

  const companionLinks = (doc.companionGithubUrls || [])
    .map((u) => `[${u.replace('https://github.com/', '')}](${u})`)
    .join('、')
  const ghDisplay = companionLinks
    ? `[${gh.repo}](${doc.githubUrl})（协同仓库：${companionLinks}）`
    : `[${gh.repo}](${doc.githubUrl})`

  const metaCardLines = [
    `> 独立结构化元数据文件：[\`docs/sites/${doc.id}.json\`](./${doc.id}.json)（含完整元数据、Tag、依赖 Lib 与 \`github\` API 节点，采样日期：\`${fetchedDate}\`）`,
    '',
    '### 站点元数据与底层依赖库（Libs）',
    '',
    '| 元数据属性 | 内容详情 |',
    '| :--- | :--- |',
    `| **官方网站 (Website)** | [${doc.websiteUrl}](${doc.websiteUrl}) |`,
    `| **GitHub 源码仓库** | ${ghDisplay} |`,
    `| **包管理仓库 (Registry)** | [${doc.packageUrl}](${doc.packageUrl}) |`,
    `| **分类标签 (Tags)** | ${tagsStr} |`,
    `| **运行时与打包器** | ${doc.libs.runtime} · ${doc.libs.bundler} |`,
    `| **UI 与 Markdown 引擎** | ${doc.libs.uiFramework} · \`${doc.libs.markdownEngine}\` |`,
    `| **高亮与全文检索** | ${doc.libs.codeHighlight} · ${doc.libs.searchEngine} |`,
    `| **数学公式与流程图库** | ${doc.libs.mathLib} ； ${doc.libs.diagramLib} |`,
    `| **核心依赖库 (Core Libs)** | ${coreLibsStr} |`
  ]

  if (pinnedStr) {
    metaCardLines.push(`| **本子站实测锁定版本** | ${pinnedStr} |`)
  }

  const allRepos = [gh, ...(gh.companionRepos || [])]
  const ghMetaRows = allRepos
    .map((r) => {
      const latestTag = r.latestRelease?.tagName
        ? `\`${r.latestRelease.tagName}\` (${r.latestRelease.publishedAt.slice(0, 10)})`
        : r.recentReleases?.[0]?.tagName
          ? `\`${r.recentReleases[0].tagName}\` (${r.recentReleases[0].publishedAt.slice(0, 10)})`
          : '—'
      return `| [\`${r.repo}\`](${r.url}) | \`${r.createdAt.slice(0, 10)}\` | \`${r.pushedAt.slice(0, 10)}\` | ★ ${fmtNum(r.stars)} | ${fmtNum(r.totalCommits)} | \`${r.peakYear}\` (${fmtNum(r.peakCommits)}) | ${latestTag} |`
    })
    .join('\n')

  let commitTable = ''
  if (allRepos.length === 1) {
    const r = allRepos[0]
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
      `### GitHub 主分支历年提交活跃度表（\`${r.createdYear}–${years[years.length - 1]}\`）`,
      '',
      '| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |',
      '| :--- | ---: | ---: | :--- | :--- |',
      rows
    ].join('\n')
  } else {
    const minYear = Math.min(...allRepos.map((r) => r.createdYear))
    const activeYears = years.filter((y) => y >= minYear)
    let maxCombined = 1
    for (const y of activeYears) {
      const sum = allRepos.reduce((acc, r) => acc + (r.yearlyCommits[String(y)] ?? 0), 0)
      if (sum > maxCombined) maxCombined = sum
    }

    const headers = allRepos.map((r) => `\`${r.repo}\``).join(' | ')
    const aligns = allRepos.map(() => '---:').join(' | ')
    const rows = activeYears
      .map((y) => {
        const cols = allRepos.map((r) => {
          if (y < r.createdYear) return '—'
          return fmtNum(r.yearlyCommits[String(y)] ?? 0)
        })
        const sum = allRepos.reduce((acc, r) => acc + (r.yearlyCommits[String(y)] ?? 0), 0)
        return `| \`${y}\` | ${cols.join(' | ')} | **${fmtNum(sum)}** | \`${makeBar(sum, maxCombined)}\` |`
      })
      .join('\n')

    commitTable = [
      `### GitHub 双仓库协同历年提交活跃度表（\`${minYear}–${years[years.length - 1]}\`）`,
      '',
      `| 年份 | ${headers} | 合计提交 | 合计活跃趋势条 |`,
      `| :--- | ${aligns} | ---: | :--- |`,
      rows
    ].join('\n')
  }

  return [
    ...metaCardLines,
    '',
    '### GitHub 仓库 API 指标快照',
    '',
    '| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |',
    '| :--- | :--- | :--- | ---: | ---: | :--- | :--- |',
    ghMetaRows,
    '',
    commitTable
  ].join('\n')
}

function renderIndexMatrix() {
  const recentYears = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
  const yearCols = recentYears.map((y) => `\`${String(y).slice(2)}年\``).join(' | ')
  const yearAligns = recentYears.map(() => '---:').join(' | ')

  // Aggregate unique repositories across all 16 docs/sites/<id>.json files
  const uniqueRepos = new Map()
  for (const doc of siteDocs) {
    const entries = [doc.github, ...(doc.github.companionRepos || [])]
    for (const r of entries) {
      if (!uniqueRepos.has(r.repo)) {
        uniqueRepos.set(r.repo, { repoData: r, linkedDocs: [] })
      }
      const bucket = uniqueRepos.get(r.repo)
      if (!bucket.linkedDocs.some((d) => d.id === doc.id)) {
        bucket.linkedDocs.push({ id: doc.id })
      }
    }
  }

  const fetchedDate = siteDocs[0]?.github?.fetchedAt?.slice(0, 10) || ''
  const allYears = Object.keys(siteDocs[0].github.yearlyCommits).map(Number)

  const rows = Array.from(uniqueRepos.values())
    .map(({ repoData: r, linkedDocs }) => {
      const pre2016 = allYears
        .filter((y) => y < 2016)
        .reduce((acc, y) => acc + (r.yearlyCommits[String(y)] ?? 0), 0)
      const preCell = r.createdYear < 2016 ? fmtNum(pre2016) : '·'

      const cells = recentYears.map((y) => {
        if (y < r.createdYear) return '·'
        const c = r.yearlyCommits[String(y)] ?? 0
        if (y === r.peakYear && c > 0) return `**${c}**`
        return String(c)
      })

      const links = linkedDocs
        .map((d) => `[\`${d.id}\`](./${d.id}.md)([json](./${d.id}.json))`)
        .join(' ')
      return `| [\`${r.repo}\`](${r.url}) | ${links} | \`${r.createdAt.slice(0, 7)}\` | ★ ${fmtNum(r.stars)} | ${fmtNum(r.totalCommits)} | ${preCell} | ${cells.join(' | ')} |`
    })
    .join('\n')

  return [
    `> 数据聚合自本目录下 16 个独立的 \`docs/sites/<id>.json\` 中的 \`github\` 节点（采样日期：\`${fetchedDate}\`）。粗体为单年历史峰值，\`·\` 表示当年尚未建仓。`,
    '',
    `| 上游 GitHub 仓库 | 1:1 关联档案 & JSON | 立项月份 | Stars | 总提交 | \`08-15\`累计 | ${yearCols} |`,
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

for (const doc of siteDocs) {
  const mdPath = path.join(sitesDocsDir, `${doc.id}.md`)
  replaceBlock(
    mdPath,
    '<!-- GITHUB_API_TABLE_START -->',
    '<!-- GITHUB_API_TABLE_END -->',
    renderSiteSection(doc)
  )
}

console.log(`[sync-github-tables] Synced metadata, libs, tags & GitHub yearly commit tables from ${siteDocs.length} independent docs/sites/<id>.json files.`)
