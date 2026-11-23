import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const config = JSON.parse(fs.readFileSync(path.join(rootDir, 'sites.config.json'), 'utf-8'))

for (const site of config.sites) {
  if (site.isMaster) continue
  const subDir = path.join(rootDir, site.submoduleDir)
  const cmd = site.buildCommand || 'npm run build'
  console.log(`\n[build-all] ▶ Building ${site.id} (${site.submoduleDir}) via: ${cmd}`)
  execSync(cmd, {
    cwd: subDir,
    stdio: 'inherit',
    env: { ...process.env }
  })
}

console.log('\n[build-all] ▶ Building main portal & canonical master docs...')
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' })
console.log('\n[build-all] ✓ All mounted submodules and main portal built successfully!')
