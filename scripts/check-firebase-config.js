#!/usr/bin/env node
/**
 * Kiểm tra cấu hình Firebase / .env trước khi chạy salon.
 * Usage: node scripts/check-firebase-config.js
 */

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const envPath = path.join(root, '.env')
const saPath = path.join(root, 'firebase-service-account.json')

const errors = []
const warnings = []
const ok = []

function readEnv() {
  if (!fs.existsSync(envPath)) {
    errors.push('Thiếu file .env ở thư mục gốc repo — copy từ .env.example')
    return {}
  }

  const env = {}
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

function isPlaceholder(value) {
  if (!value) return true
  return /your-|placeholder|xxxxx|example/i.test(value)
}

const env = readEnv()

const backendProject = env.FIREBASE_PROJECT_ID
const frontendProject = env.VITE_FIREBASE_PROJECT_ID
const apiKey = env.VITE_FIREBASE_API_KEY
const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN
const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET

if (isPlaceholder(backendProject)) {
  errors.push(`FIREBASE_PROJECT_ID chưa điền đúng (hiện: "${backendProject || '(trống)'}")`)
} else {
  ok.push(`FIREBASE_PROJECT_ID = ${backendProject}`)
}

if (isPlaceholder(frontendProject)) {
  errors.push(`VITE_FIREBASE_PROJECT_ID chưa điền đúng`)
} else {
  ok.push(`VITE_FIREBASE_PROJECT_ID = ${frontendProject}`)
}

if (backendProject && frontendProject && backendProject !== frontendProject) {
  errors.push(
    `FIREBASE_PROJECT_ID (${backendProject}) KHÁC VITE_FIREBASE_PROJECT_ID (${frontendProject}) — phải giống nhau`,
  )
} else if (backendProject && frontendProject) {
  ok.push('Backend và Frontend cùng project ID')
}

if (isPlaceholder(apiKey)) {
  errors.push('VITE_FIREBASE_API_KEY chưa điền — copy từ Firebase Console → Web app config')
} else {
  ok.push('VITE_FIREBASE_API_KEY đã có')
}

if (isPlaceholder(authDomain)) {
  errors.push('VITE_FIREBASE_AUTH_DOMAIN chưa điền')
} else if (frontendProject && !authDomain.includes(frontendProject.split('.')[0])) {
  warnings.push(`VITE_FIREBASE_AUTH_DOMAIN có thể không khớp project (${authDomain})`)
} else {
  ok.push(`VITE_FIREBASE_AUTH_DOMAIN = ${authDomain}`)
}

if (!fs.existsSync(saPath)) {
  errors.push('Thiếu firebase-service-account.json ở thư mục gốc repo')
} else {
  try {
    const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'))
    ok.push(`firebase-service-account.json (project: ${sa.project_id})`)
    if (backendProject && sa.project_id !== backendProject) {
      errors.push(
        `Service account project (${sa.project_id}) khác FIREBASE_PROJECT_ID (${backendProject})`,
      )
    }
  } catch {
    errors.push('firebase-service-account.json không đọc được (file hỏng?)')
  }
}

if (storageBucket) {
  warnings.push(
    'VITE_FIREBASE_STORAGE_BUCKET đang bật — cần gói Blaze. Nếu chưa trả phí, comment dòng này và dùng /images/products/',
  )
} else {
  ok.push('Storage tắt — dùng ảnh tĩnh (miễn phí)')
}

const adminUids = (env.FIREBASE_ADMIN_UIDS || '')
  .split(/[,;\s]+/)
  .map((s) => s.trim())
  .filter(Boolean)

if (adminUids.length === 0) {
  errors.push(
    'FIREBASE_ADMIN_UIDS chưa cấu hình — không ai vào được /admin. Thêm UID admin (lấy từ Firebase Console → Authentication)',
  )
} else if (adminUids.some(isPlaceholder)) {
  errors.push('FIREBASE_ADMIN_UIDS vẫn là placeholder — thay bằng UID Firebase thật')
} else {
  ok.push(`FIREBASE_ADMIN_UIDS: ${adminUids.length} UID admin`)
}

console.log('\n=== Kiểm tra Firebase / .env ===\n')

if (ok.length) {
  console.log('OK:')
  ok.forEach((line) => console.log('  ✓', line))
  console.log('')
}

if (warnings.length) {
  console.log('Cảnh báo:')
  warnings.forEach((line) => console.log('  ⚠', line))
  console.log('')
}

if (errors.length) {
  console.log('LỖI (cần sửa trước khi vận hành):')
  errors.forEach((line) => console.log('  ✗', line))
  console.log('\nXem FIREBASE_SETUP.md và chạy lại: node scripts/check-firebase-config.js\n')
  process.exit(1)
}

console.log('Cấu hình cơ bản OK. Chạy: npm run dev:all')
console.log('Sau đó mở: http://localhost:5000/api/health — persistence.mode phải là "firestore"\n')
