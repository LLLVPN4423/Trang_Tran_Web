/**
 * Thu hồi quyền admin (xóa custom claim admin).
 *
 * Usage: node scripts/revoke-admin.js <FIREBASE_USER_UID>
 */

const path = require('path')
const { initializeApp, cert, getApps } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')

const uid = process.argv[2]
if (!uid) {
  console.error('Usage: node scripts/revoke-admin.js <FIREBASE_USER_UID>')
  process.exit(1)
}

const credentialsPath = path.resolve(__dirname, '..', 'firebase-service-account.json')

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
  .setCustomUserClaims(uid, { admin: false })
  .then(() => {
    console.log(`OK — admin claim removed for UID: ${uid}`)
    console.log('User must sign out and sign in again.')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err.message || err)
    process.exit(1)
  })
