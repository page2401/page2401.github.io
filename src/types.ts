export interface ChapterMeta {
  id: string
  code: string
  title: string
  shortTitle: string
  summary: string
}

export interface DocEntry {
  route: string
  file: string
  shortFile: string
  content: string
  lines: number
  bytes: number
}

export interface ConfigFileEntry {
  path: string
  shortPath: string
  content: string
  lines: number
}

export interface DirectoryProfile {
  contentRoot: string
  contentPrefix: string
  excludedContentFiles: string[]
  orderingMechanism: string
  sidebarMechanism: string
  pros: string[]
  cons: string[]
}

export interface TreeNode {
  name: string
  relPath: string
  depth: number
  kind: 'dir' | 'file'
  category: 'folder' | 'content' | 'excluded' | 'config' | 'plugin' | 'infra'
  route: string | null
  note: string | null
}

export interface SiteHighlights {
  dirIsolation: string
  dirRoutingSidebar: string
  frontmatter: string
  callouts: string
  details: string
  gfmAlerts: string
  mermaid: string
  math: string
  buildArtifact: string
}

export interface SiteBenchmark {
  measuredAt: string
  buildCommand: string
  isRuntimeSpa: boolean
  coldBuildMs: number
  totalFiles: number
  totalBytes: number
  htmlFiles: number
  htmlBytes: number
  jsFiles: number
  jsBytes: number
  jsGzipBytes: number
  cssFiles: number
  cssBytes: number
  cssGzipBytes: number
  otherBytes: number
  entryHtmlBytes: number
  proseScriptCount: number
  hasOfflineSearch: boolean
  offlineSearchKind: string | null
  hasLlmsTxt: boolean
}

export interface SiteEntry {
  id: string
  isMaster?: boolean
  ecosystem: string
  lifecycle: string
  isEol?: boolean
  profileDoc: string
  profileRoute: string
  jsonRoute?: string | null
  family: string
  versionSeries: string
  primaryPackage: string
  primaryVersion: string
  tagline: string
  repo: string
  repoUrl: string
  mainBranchUrl: string
  pageBranchUrl: string
  basePath: string
  submoduleDir: string
  packages: Record<string, string>
  packageJsonRaw: string
  manifestShortPath?: string
  directoryProfile: DirectoryProfile
  treeNodes: TreeNode[]
  highlights: SiteHighlights
  benchmark?: SiteBenchmark | null
  docs: Record<string, DocEntry>
  configs: ConfigFileEntry[]
}

export interface SiteLibsDetail {
  runtime: string
  bundler: string
  uiFramework: string
  markdownEngine: string
  codeHighlight: string
  searchEngine: string
  mathLib: string
  diagramLib: string
  coreLibs: string[]
  pinnedPackages?: Record<string, string> | null
}

export interface SiteLifecycleDetail {
  startedAt: string
  activePeriod: string
  deprecatedAt: string | null
  isEol: boolean
  summary: string
}

export interface LandscapeRow {
  id: string
  order: number
  sitePath: string
  name: string
  versionNote: string
  lifecycle: string
  lifecycleDetail: SiteLifecycleDetail
  isEol?: boolean
  ecosystem: string
  mounted: boolean
  subsiteUrl?: string
  subsiteRepoUrl?: string
  websiteUrl: string
  githubUrl: string
  companionGithubUrls: string[]
  packageUrl: string
  tags: string[]
  libs: SiteLibsDetail
  coreLibs: string[]
  markdownEngine: string
  upstreamRepo: string
  createdYear: number
  createdAt: string
  pushedAt: string
  primaryLanguage: string
  license: string
  stars: number
  forks: number
  openIssues: number
  latestReleaseTag: string | null
  totalCommits: number
  commits2026: number
  yearlyCommits: Record<string, number>
  benchmark?: SiteBenchmark | null
  tagline: string
  stack: string
  directoryModel: string
  calloutDialect: string
  diagramAndMath: string
  profileDoc: string
  profileRoute: string
  jsonRoute: string
}

export interface GitHubRepoActivity {
  repo: string
  url: string
  role: string
  siteIds: string[]
  ecosystem: string
  mounted: boolean
  createdAt: string
  createdYear: number
  pushedAt: string
  stars: number
  totalCommits: number
  peakYear: number
  peakCommits: number
  pre2016Commits: number
  yearlyCommits: Record<string, number>
}

export interface GitHubActivityPayload {
  fetchedAt: string
  displayYears: number[]
  repos: GitHubRepoActivity[]
}

export interface ComparisonDataset {
  generatedAt: string
  chapters: ChapterMeta[]
  sites: SiteEntry[]
  landscapeRows: LandscapeRow[]
  githubActivity: GitHubActivityPayload
}

export type WorkbenchMode = 'render' | 'tree' | 'source' | 'config'
export type ViewportPreset = 'fluid' | 'tablet' | 'mobile'
export type FocusedPane = 'both' | 'left' | 'right'
export type DirectoryFilter =
  | 'all'
  | 'mounted'
  | 'catalog'
  | 'active'
  | 'eol'
  | 'vue'
  | 'react-astro'
  | 'native'
  | 'runtime'
  | 'python-classic'
export type DirectorySort =
  | 'recommended'
  | 'stars-desc'
  | 'commits2026-desc'
  | 'total-commits-desc'
  | 'build-asc'
  | 'newest'
  | 'oldest'
export type DirectoryView = 'grid' | 'list'
export type ObservatoryTab = 'heatmap' | 'benchmark' | 'matrix' | 'dialects'
