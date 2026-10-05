#!/usr/bin/env node
/**
 * Thêm Authorized JavaScript origin cho OAuth Web client (Google Sign-In mobile).
 * Usage: node scripts/configure-google-oauth-origin.js
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ORIGIN = process.env.FRONTEND_URL || 'https://trangtran-hair.pages.dev'
const PROJECT_NUMBER = '327982031536'
const CLIENT_ID =
  process.env.VITE_GOOGLE_WEB_CLIENT_ID ||
  readEnv('VITE_GOOGLE_WEB_CLIENT_ID') ||
  '327982031536-c8kf98mg5mvodrkmllu6qhtjkd01a6tp.apps.googleusercontent.com'

function readEnv(key) {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return null
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    if (trimmed.slice(0, eq).trim() === key) return trimmed.slice(eq + 1).trim()
  }
  return null
}

async function main() {
  let token
  try {
    token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim()
  } catch {
    console.error('Cần gcloud login trước: gcloud auth login')
    process.exit(1)
  }

  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_NUMBER}/oauthIdpConfigs/google.com`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-goog-user-project': 'trangtranhairsalon-872c5',
    },
  })

  if (!res.ok) {
    console.log('Không đọc được OAuth config qua API. Thêm thủ công trong Google Cloud Console:')
    console.log('1. https://console.cloud.google.com/apis/credentials?project=trangtranhairsalon-872c5')
    console.log('2. OAuth 2.0 Client IDs → Web client (auto created by Google Service)')
    console.log(`3. Authorized JavaScript origins → Add: ${ORIGIN}`)
    console.log(`4. Client ID: ${CLIENT_ID}`)
    process.exit(0)
  }

  const data = await res.json()
  console.log('Google OAuth Web client:', data.clientId || CLIENT_ID)
  console.log('')
  console.log('Nếu mobile vẫn lỗi Google, kiểm tra Authorized JavaScript origins có:')
  console.log(`  - ${ORIGIN}`)
  console.log('  - http://localhost:5173')
  console.log('')
  console.log('Firebase Authorized domains (đã OK nếu có pages.dev):')
  console.log('  Authentication → Settings → Authorized domains')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
