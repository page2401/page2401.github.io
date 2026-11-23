import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const outFile = path.join(rootDir, 'docs', 'sites', 'github-activity.json')

const START_YEAR = 2008
const END_YEAR = 2026
const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i)

const TARGET_REPOS = [
  { owner: 'vuejs', name: 'vitepress', siteIds: ['vitepress-v1', 'vitepress-v2'], role: 'VitePress 核心与默认主题仓库' },
  { owner: 'vuejs', name: 'vuepress', siteIds: ['vuepress-v1'], role: 'VuePress v1 (Vue 2 + Webpack 4) 历史仓库' },
  { owner: 'vuepress', name: 'core', siteIds: ['vuepress-v2'], role: 'VuePress v2 核心引擎仓库' },
  { owner: 'vuepress', name: 'ecosystem', siteIds: ['vuepress-v2'], role: 'VuePress v2 官方默认主题与插件矩阵仓库（2023-09 拆分独立）' },
  { owner: 'docsifyjs', name: 'docsify', siteIds: ['docsify-v4', 'docsify-v5'], role: 'Docsify 零预编译运行时引擎仓库' },
  { owner: 'withastro', name: 'starlight', siteIds: ['astro7-starlight'], role: 'Astro Starlight 官方文档主题框架仓库' },
  { owner: 'withastro', name: 'astro', siteIds: ['astro7-starlight'], role: 'Astro 底层内容层与构建引擎仓库' },
  { owner: 'facebook', name: 'docusaurus', siteIds: ['docusaurus-v3'], role: 'Docusaurus 官方 Monorepo 仓库' },
  { owner: 'web-infra-dev', name: 'rspress', siteIds: ['rspress'], role: 'Rspress (Rspack + MDX RS) 官方仓库' },
  { owner: 'shuding', name: 'nextra', siteIds: ['nextra'], role: 'Nextra (Next.js 文档框架) 官方仓库' },
  { owner: 'gohugoio', name: 'hugo', siteIds: ['hugo'], role: 'Hugo (Go 单二进制引擎) 官方仓库' },
  { owner: 'getzola', name: 'zola', siteIds: ['zola'], role: 'Zola (Rust 单二进制引擎) 官方仓库' },
  { owner: 'rust-lang', name: 'mdBook', siteIds: ['mdbook'], role: 'mdBook (Rust 官方电子书引擎) 仓库' },
  { owner: 'squidfunk', name: 'mkdocs-material', siteIds: ['mkdocs-material'], role: 'Material for MkDocs (Python) 官方仓库' },
  { owner: 'hexojs', name: 'hexo', siteIds: ['hexo'], role: 'Hexo 静态博客框架官方仓库' },
  { owner: 'jekyll', name: 'jekyll', siteIds: ['jekyll'], role: 'Jekyll (Ruby / GitHub Pages 鼻祖) 官方仓库' }
]

function buildRepoQuery(owner, name) {
  const yearFields = YEARS.map(
    (y) => `y${y}: history(since: "${y}-01-01T00:00:00Z", until: "${y}-12-31T23:59:59Z") { totalCount }`
  ).join('\n          ')

  return `
query {
  repo: repository(owner: "${owner}", name: "${name}") {
    nameWithOwner
    url
    description
    createdAt
    pushedAt
    updatedAt
    isArchived
    stargazerCount
    forkCount
    openIssues: issues(states: OPEN) { totalCount }
    licenseInfo { spdxId name }
    primaryLanguage { name }
    latestRelease { tagName publishedAt isPrerelease }
    recentReleases: releases(first: 5, orderBy: { field: CREATED_AT, direction: DESC }) {
      nodes { tagName publishedAt isPrerelease }
    }
    defaultBranchRef {
      name
      target {
        ... on Commit {
          total: history { totalCount }
          ${yearFields}
        }
      }
    }
  }
}`
}

const repositories = {}

for (const item of TARGET_REPOS) {
  const full = `${item.owner}/${item.name}`
  process.stdout.write(`[fetch-github-activity] Querying ${full} ... `)
  const query = buildRepoQuery(item.owner, item.name)
  const rawOut = execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`], {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024
  })
  const parsed = JSON.parse(rawOut)
  const repo = parsed?.data?.repo
  if (!repo) {
    throw new Error(`Failed to fetch repository metadata for ${full}`)
  }

  const commitTarget = repo.defaultBranchRef?.target || {}
  const yearlyCommits = {}
  const createdYear = Number(repo.createdAt.slice(0, 4))

  let peakYear = null
  let peakCommits = -1

  for (const y of YEARS) {
    const count = commitTarget[`y${y}`]?.totalCount ?? 0
    yearlyCommits[String(y)] = count
    if (count > peakCommits) {
      peakCommits = count
      peakYear = y
    }
  }

  repositories[full] = {
    repo: repo.nameWithOwner,
    url: repo.url,
    role: item.role,
    siteIds: item.siteIds,
    description: repo.description || '',
    createdAt: repo.createdAt,
    createdYear,
    pushedAt: repo.pushedAt,
    updatedAt: repo.updatedAt,
    isArchived: repo.isArchived,
    stars: repo.stargazerCount,
    forks: repo.forkCount,
    openIssues: repo.openIssues?.totalCount ?? 0,
    license: repo.licenseInfo?.spdxId || repo.licenseInfo?.name || 'MIT',
    primaryLanguage: repo.primaryLanguage?.name || '',
    defaultBranch: repo.defaultBranchRef?.name || 'main',
    totalCommits: commitTarget.total?.totalCount ?? 0,
    peakYear,
    peakCommits,
    latestRelease: repo.latestRelease || null,
    recentReleases: repo.recentReleases?.nodes || [],
    yearlyCommits
  }

  console.log(`OK (${repositories[full].totalCommits} commits, ★ ${repositories[full].stars})`)
}

const payload = {
  schemaVersion: 1,
  fetchedAt: new Date().toISOString(),
  source: 'GitHub GraphQL API v4 (Commit.history by calendar year UTC on defaultBranchRef)',
  yearRange: [START_YEAR, END_YEAR],
  years: YEARS,
  repositories
}

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8')
console.log(`[fetch-github-activity] Saved ${Object.keys(repositories).length} repositories -> ${path.relative(rootDir, outFile)}`)
