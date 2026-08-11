/**
 * Cấp custom claim admin: true cho một Firebase user.
 * UID phải có trong FIREBASE_ADMIN_UIDS (.env) — không ai tự được admin.
 *
 * Usage:
 *   npm install firebase-admin   (once, at repo root)
 *   node scripts/set-admin.js <FIREBASE_USER_UID>
 *
 * Requires firebase-service-account.json at repo root (see FIREBASE_SETUP.md).
 */

const fs = require('fs')
const path = require('path')
const { initializeApp, cert, getApps } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')

const uid = process.argv[2]
if (!uid) {
  console.error('Usage: node scripts/set-admin.js <FIREBASE_USER_UID>')
  process.exit(1)
}

const root = path.resolve(__dirname, '..')
const credentialsPath = path.join(root, 'firebase-service-account.json')
const envPath = path.join(root, '.env')

function readAdminAllowlist() {
  if (!fs.existsSync(envPath)) return []
  const match = fs.readFileSync(envPath, 'utf8').match(/^FIREBASE_ADMIN_UIDS=(.*)$/m)
  if (!match?.[1]) return []
  return match[1]
    .trim()
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

const allowlist = readAdminAllowlist()
if (allowlist.length === 0) {
  console.error('FIREBASE_ADMIN_UIDS chưa cấu hình trong .env')
  console.error('Thêm dòng: FIREBASE_ADMIN_UIDS=' + uid)
  console.error('Rồi chạy lại lệnh này.')
  process.exit(1)
}

if (!allowlist.includes(uid)) {
  console.error(`UID ${uid} KHÔNG có trong FIREBASE_ADMIN_UIDS`)
  console.error('Allowlist hiện tại:', allowlist.join(', '))
  console.error('Thêm UID vào .env nếu đây đúng là tài khoản admin salon.')
  process.exit(1)
}

let serviceAccount
try {
  serviceAccount = require(credentialsPath)
} catch {
  console.error(`Missing or invalid ${credentialsPath}`)
  console.error('Download Service Account JSON from Firebase Console → Project settings → Service accounts')
  process.exit(1)
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) })
}

getAuth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`OK — admin claim set for UID: ${uid}`)
    console.log('UID nằm trong FIREBASE_ADMIN_UIDS — hợp lệ.')
    console.log('User must sign out and sign in again on the website.')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err.message || err)
    process.exit(1)
  })
