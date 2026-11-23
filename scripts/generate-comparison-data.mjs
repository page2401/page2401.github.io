import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const configPath = path.join(rootDir, 'sites.config.json')
const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

const enrichedSites = rawConfig.sites.map((site) => {
  const submoduleAbs = path.join(rootDir, site.submoduleDir)
  const pkgPath = path.join(submoduleAbs, 'package.json')
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const allDeps = {
    ...(pkgJson.dependencies || {}),
    ...(pkgJson.devDependencies || {})
  }

  const packages = {}
  for (const pkgName of site.trackedPackages) {
    packages[pkgName] = allDeps[pkgName] || 'N/A'
  }

  const primaryVersion = allDeps[site.primaryPackage] || 'unknown'

  const docs = {}
  for (const [chapterId, docEntry] of Object.entries(site.docs)) {
    const fileAbs = path.join(submoduleAbs, docEntry.file)
    const content = fs.readFileSync(fileAbs, 'utf-8')
    const lines = content.split('\n').length
    const bytes = Buffer.byteLength(content, 'utf-8')
    docs[chapterId] = {
      route: docEntry.route,
      file: `${site.submoduleDir}/${docEntry.file}`,
      shortFile: docEntry.file,
      content,
      lines,
      bytes
    }
  }

  const configs = site.configFiles.map((relPath) => {
    const cfgAbs = path.join(submoduleAbs, relPath)
    const content = fs.readFileSync(cfgAbs, 'utf-8')
    return {
      path: `${site.submoduleDir}/${relPath}`,
      shortPath: relPath,
      content,
      lines: content.split('\n').length
    }
  })

  return {
    id: site.id,
    family: site.family,
    versionSeries: site.versionSeries,
    primaryPackage: site.primaryPackage,
    primaryVersion,
    tagline: site.tagline,
    repo: site.repo,
    repoUrl: `https://github.com/${site.repo}`,
    mainBranchUrl: `https://github.com/${site.repo}/tree/main`,
    pageBranchUrl: `https://github.com/${site.repo}/tree/page`,
    basePath: site.basePath,
    submoduleDir: site.submoduleDir,
    packages,
    packageJsonRaw: JSON.stringify(
      {
        name: pkgJson.name,
        dependencies: pkgJson.dependencies,
        devDependencies: pkgJson.devDependencies
      },
      null,
      2
    ),
    highlights: site.highlights,
    docs,
    configs
  }
})

const outputData = {
  generatedAt: new Date().toISOString(),
  chapters: rawConfig.chapters,
  sites: enrichedSites
}

const outDir = path.join(rootDir, 'src', 'generated')
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, 'comparison-data.json')
fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2) + '\n', 'utf-8')

console.log(
  `[generate-comparison-data] Extracted ${enrichedSites.length} versioned submodules -> ${path.relative(rootDir, outPath)}`
)
