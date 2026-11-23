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

export interface ComparisonDataset {
  generatedAt: string
  chapters: ChapterMeta[]
  sites: SiteEntry[]
}

export type WorkbenchMode = 'render' | 'tree' | 'source' | 'config'
export type ViewportPreset = 'fluid' | 'tablet' | 'mobile'
export type FocusedPane = 'both' | 'left' | 'right'
