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

export interface SiteHighlights {
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
  highlights: SiteHighlights
  docs: Record<string, DocEntry>
  configs: ConfigFileEntry[]
}

export interface ComparisonDataset {
  generatedAt: string
  chapters: ChapterMeta[]
  sites: SiteEntry[]
}

export type WorkbenchMode = 'render' | 'source' | 'config'
export type ViewportPreset = 'fluid' | 'tablet' | 'mobile'
export type FocusedPane = 'both' | 'left' | 'right'
