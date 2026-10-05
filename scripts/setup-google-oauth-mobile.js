#!/usr/bin/env node
/**
 * Hướng dẫn + mở Google Cloud Console để thêm OAuth redirect URI cho mobile Chrome.
 * Bắt buộc 1 lần khi dùng authDomain = trangtran-hair.pages.dev
 *
 * Usage: node scripts/setup-google-oauth-mobile.js
 */
const { execSync } = require('child_process')

const ORIGIN = process.env.FRONTEND_URL || 'https://trangtran-hair.pages.dev'
const PROJECT_ID = 'trangtranhairsalon-872c5'
const CLIENT_ID =
  process.env.VITE_GOOGLE_WEB_CLIENT_ID ||
  '327982031536-c8kf98mg5mvodrkmllu6qhtjkd01a6tp.apps.googleusercontent.com'

const REDIRECT_URI = `${ORIGIN.replace(/\/$/, '')}/__/auth/handler`

console.log('')
console.log('=== Google OAuth cho mobile Chrome ===')
console.log('')
console.log('Firebase authorized domain đã có:', ORIGIN.replace('https://', ''))
console.log('')
console.log('Cần thêm thủ công trong Google Cloud Console (1 lần):')
console.log('')
console.log(`1. Mở: https://console.cloud.google.com/apis/credentials/oauthclient/${CLIENT_ID}?project=${PROJECT_ID}`)
console.log('')
console.log('2. Authorized JavaScript origins → Add:')
console.log(`   ${ORIGIN}`)
console.log('   http://localhost:5173')
console.log('')
console.log('3. Authorized redirect URIs → Add:')
console.log(`   ${REDIRECT_URI}`)
console.log(`   https://trangtranhairsalon-872c5.firebaseapp.com/__/auth/handler`)
console.log('')
console.log('4. Save → đợi 1–2 phút → test lại trên Chrome mobile.')
console.log('')

try {
  if (process.platform === 'win32') {
    execSync(
      `start "" "https://console.cloud.google.com/apis/credentials/oauthclient/${CLIENT_ID}?project=${PROJECT_ID}"`,
      { stdio: 'ignore' },
    )
  } else if (process.platform === 'darwin') {
    execSync(
      `open "https://console.cloud.google.com/apis/credentials/oauthclient/${CLIENT_ID}?project=${PROJECT_ID}"`,
      { stdio: 'ignore' },
    )
  }
} catch {
  /* ignore */
}
