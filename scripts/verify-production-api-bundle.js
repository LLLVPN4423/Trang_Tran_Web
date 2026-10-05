/**
 * Fail CI if a production-style frontend build still calls Pages /api via window.location.origin.
 * That path returns SPA HTML when Cloudflare Functions are not deployed.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'frontend', 'dist')
const indexPath = path.join(distDir, 'index.html')

if (!fs.existsSync(indexPath)) {
  console.error('verify-production-api-bundle: missing frontend/dist/index.html')
  process.exit(1)
}

const html = fs.readFileSync(indexPath, 'utf8')
const jsRef = html.match(/src="(\/assets\/index-[^"]+\.js)"/)?.[1]
if (!jsRef) {
  console.error('verify-production-api-bundle: main JS bundle not found in index.html')
  process.exit(1)
}

const jsPath = path.join(distDir, jsRef.slice(1).replace(/\//g, path.sep))
const js = fs.readFileSync(jsPath, 'utf8')

const cloudRun = 'trangtran-api-327982031536.asia-southeast1.run.app'
if (!js.includes(cloudRun)) {
  console.error('verify-production-api-bundle: Cloud Run API URL not embedded in bundle')
  process.exit(1)
}

// Minified getApiBaseUrl used to prefer window.location.origin over Cloud Run.
const brokenPatterns = [
  /typeof window[^;]{0,40}\?window\.location\.origin[^:]{0,40}:.+?apiUrl/,
  /window\.location\.origin:Xd\.apiUrl/,
]
for (const re of brokenPatterns) {
  if (re.test(js)) {
    console.error(
      'verify-production-api-bundle: bundle still prefers window.location.origin for API (Pages /api returns HTML)',
    )
    process.exit(1)
  }
}

console.log('verify-production-api-bundle: OK (direct Cloud Run default)')
