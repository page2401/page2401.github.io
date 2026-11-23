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

export interface SiteEntry {
  id: string
  isMaster?: boolean
  ecosystem: string
  lifecycle: string
  isEol?: boolean
  profileDoc: string
  profileRoute: string
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
  directoryProfile: DirectoryProfile
  treeNodes: TreeNode[]
  highlights: SiteHighlights
  docs: Record<string, DocEntry>
  configs: ConfigFileEntry[]
}

export interface LandscapeRow {
  id: string
  sitePath: string
  name: string
  versionNote: string
  lifecycle: string
  isEol?: boolean
  ecosystem: string
  mounted: boolean
  subsiteUrl?: string
  upstreamRepo: string
  upstreamUrl: string
  stars: number
  totalCommits: number
  commits2026: number
  tagline: string
  stack: string
  directoryModel: string
  calloutDialect: string
  diagramAndMath: string
  profileDoc: string
  profileRoute: string
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
export type MatrixFilter =
  | 'all'
  | 'mounted'
  | 'catalog'
  | 'vue'
  | 'react-astro'
  | 'native'
  | 'other'
