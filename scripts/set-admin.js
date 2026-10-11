/**
 * Cấp custom claim admin cho Firebase user (platform hoặc salon).
 *
 * Usage:
 *   node scripts/set-admin.js <UID> [platform|salon]
 *   Mặc định role = platform nếu UID nằm trong FIREBASE_ADMIN_UIDS, salon nếu chỉ trong FIREBASE_SALON_ADMIN_UIDS.
 *
 * Requires firebase-service-account.json at repo root.
 */

const fs = require('fs')
const path = require('path')
const { initializeApp, cert, getApps } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')

const uid = process.argv[2]
const roleArg = (process.argv[3] || '').toLowerCase()

if (!uid) {
  console.error('Usage: node scripts/set-admin.js <FIREBASE_USER_UID> [platform|salon]')
  process.exit(1)
}

const root = path.resolve(__dirname, '..')
const credentialsPath = path.join(root, 'firebase-service-account.json')
const envPath = path.join(root, '.env')

function readList(key) {
  if (!fs.existsSync(envPath)) return []
  const re = new RegExp(`^${key}=(.*)$`, 'm')
  const match = fs.readFileSync(envPath, 'utf8').match(re)
  if (!match?.[1]) return []
  return match[1]
    .trim()
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

const platformUids = readList('FIREBASE_ADMIN_UIDS')
const salonUids = readList('FIREBASE_SALON_ADMIN_UIDS')

const inPlatform = platformUids.includes(uid)
const inSalon = salonUids.includes(uid)

if (!inPlatform && !inSalon) {
  console.error(`UID ${uid} không có trong FIREBASE_ADMIN_UIDS hoặc FIREBASE_SALON_ADMIN_UIDS`)
  console.error('Platform:', platformUids.join(', ') || '(trống)')
  console.error('Salon:', salonUids.join(', ') || '(trống)')
  process.exit(1)
}

let role = roleArg
if (role !== 'platform' && role !== 'salon') {
  if (inPlatform && !inSalon) role = 'platform'
  else if (inSalon && !inPlatform) role = 'salon'
  else role = inPlatform ? 'platform' : 'salon'
}

if (role === 'platform' && !inPlatform) {
  console.error('UID không nằm trong FIREBASE_ADMIN_UIDS — không thể gán platform.')
  process.exit(1)
}
if (role === 'salon' && !inSalon) {
  console.error('UID không nằm trong FIREBASE_SALON_ADMIN_UIDS — không thể gán salon.')
  process.exit(1)
}

let serviceAccount
try {
  serviceAccount = require(credentialsPath)
} catch {
  console.error(`Missing or invalid ${credentialsPath}`)
  process.exit(1)
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) })
}

getAuth()
  .setCustomUserClaims(uid, { admin: true, adminRole: role })
  .then(() => {
    console.log(`OK — admin claim (${role}) for UID: ${uid}`)
    console.log('User must sign out and sign in again on the website.')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err.message || err)
    process.exit(1)
  })
