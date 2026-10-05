/**
 * Fail CI/deploy if index.html references missing hashed assets (broken CSS/JS on Pages).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'frontend', 'dist')
const indexPath = path.join(distDir, 'index.html')

if (!fs.existsSync(indexPath)) {
  console.error('verify-frontend-dist: missing frontend/dist/index.html — run build:frontend first')
  process.exit(1)
}

const html = fs.readFileSync(indexPath, 'utf8')
const assetRefs = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])

if (assetRefs.length === 0) {
  console.error('verify-frontend-dist: index.html has no /assets/ references — dev build?')
  process.exit(1)
}

const missing = assetRefs.filter((ref) => !fs.existsSync(path.join(distDir, ref.slice(1).replace(/\//g, path.sep))))

if (missing.length > 0) {
  console.error('verify-frontend-dist: missing files referenced by index.html:')
  for (const m of missing) console.error('  -', m)
  process.exit(1)
}

console.log(`verify-frontend-dist: OK (${assetRefs.length} assets)`)
