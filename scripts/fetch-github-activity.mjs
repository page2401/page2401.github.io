import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const sitesDocsDir = path.join(rootDir, 'docs', 'sites')
const sitesConfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'sites.config.json'), 'utf-8'))

const START_YEAR = 2008
const END_YEAR = new Date().getUTCFullYear()
const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i)

function parseGitHubOwnerRepo(ghUrl) {
  const m = ghUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/)
  if (!m) throw new Error(`Invalid GitHub URL: ${ghUrl}`)
  return { owner: m[1], name: m[2].replace(/\.git$/, '') }
}

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

const queryCache = new Map()
const fetchedAt = new Date().toISOString()

function queryGitHubRepo(ghUrl, existingRole = '') {
  const { owner, name } = parseGitHubOwnerRepo(ghUrl)
  const cacheKey = `${owner}/${name}`.toLowerCase()
  if (queryCache.has(cacheKey)) {
    return { ...queryCache.get(cacheKey), role: existingRole || queryCache.get(cacheKey).role }
  }

  process.stdout.write(`[fetch-github-activity] Querying ${owner}/${name} ... `)
  const query = buildRepoQuery(owner, name)
  const rawOut = execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`], {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024
  })
  const repo = JSON.parse(rawOut)?.data?.repo
  if (!repo) throw new Error(`Failed to fetch ${owner}/${name}`)

  const commitTarget = repo.defaultBranchRef?.target || {}
  const yearlyCommits = {}
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

  const node = {
    fetchedAt,
    source: 'GitHub GraphQL API v4 (Commit.history by calendar year UTC on defaultBranchRef)',
    repo: repo.nameWithOwner,
    url: repo.url,
    role: existingRole,
    description: repo.description || '',
    primaryLanguage: repo.primaryLanguage?.name || '',
    license: repo.licenseInfo?.spdxId || repo.licenseInfo?.name || 'MIT',
    defaultBranch: repo.defaultBranchRef?.name || 'main',
    isArchived: repo.isArchived,
    createdAt: repo.createdAt,
    createdYear: Number(repo.createdAt.slice(0, 4)),
    pushedAt: repo.pushedAt,
    updatedAt: repo.updatedAt,
    stars: repo.stargazerCount,
    forks: repo.forkCount,
    openIssues: repo.openIssues?.totalCount ?? 0,
    totalCommits: commitTarget.total?.totalCount ?? 0,
    peakYear,
    peakCommits,
    latestRelease: repo.latestRelease || null,
    recentReleases: repo.recentReleases?.nodes || [],
    yearlyCommits
  }

  console.log(`OK (${node.totalCommits} commits, ★ ${node.stars})`)
  queryCache.set(cacheKey, node)
  return node
}

function syncPinnedPackages(siteId) {
  const entry = sitesConfig.sites.find((s) => s.id === siteId)
  if (!entry || entry.isMaster) return null
  const subAbs = path.join(rootDir, entry.submoduleDir)
  const manifestType = entry.manifestType || 'npm'

  let all = {}
  if (manifestType === 'python') {
    const reqFile = path.join(subAbs, 'requirements.txt')
    if (!fs.existsSync(reqFile)) return null
    for (const line of fs.readFileSync(reqFile, 'utf-8').split('\n')) {
      const m = line.trim().match(/^([a-zA-Z0-9_.-]+)==([^\s#]+)/)
      if (m) all[m[1]] = m[2]
    }
  } else if (manifestType === 'binary') {
    const lockFile = path.join(subAbs, 'ssg-lock.json')
    if (!fs.existsSync(lockFile)) return null
    all = JSON.parse(fs.readFileSync(lockFile, 'utf-8')).packages || {}
  } else {
    const pkgFile = path.join(subAbs, 'package.json')
    if (!fs.existsSync(pkgFile)) return null
    const pkgJson = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'))
    all = { ...(pkgJson.dependencies || {}), ...(pkgJson.devDependencies || {}) }
  }

  const out = {}
  for (const k of entry.trackedPackages) {
    if (all[k]) out[k] = all[k]
  }
  return out
}

const jsonFiles = fs
  .readdirSync(sitesDocsDir)
  .filter((f) => f.endsWith('.json'))
  .sort()

for (const fileName of jsonFiles) {
  const filePath = path.join(sitesDocsDir, fileName)
  const doc = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  const primaryNode = queryGitHubRepo(doc.githubUrl, doc.github?.role || '')
  if (Array.isArray(doc.companionGithubUrls) && doc.companionGithubUrls.length > 0) {
    primaryNode.companionRepos = doc.companionGithubUrls.map((url, idx) => {
      const prevRole = doc.github?.companionRepos?.[idx]?.role || ''
      const comp = queryGitHubRepo(url, prevRole)
      const { fetchedAt: _f, source: _s, ...rest } = comp
      return rest
    })
  }

  if (doc.mounted && doc.libs) {
    const pinned = syncPinnedPackages(doc.id)
    if (pinned) doc.libs.pinnedPackages = pinned
  }

  doc.github = primaryNode
  fs.writeFileSync(filePath, `${JSON.stringify(doc, null, 2)}\n`, 'utf-8')
}

console.log(`[fetch-github-activity] Updated "github" node across ${jsonFiles.length} independent docs/sites/<id>.json files.`)
