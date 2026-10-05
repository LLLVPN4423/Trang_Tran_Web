/**
 * Vite chỉ nhúng biến VITE_* lúc build trên Cloudflare.
 * Nếu thiếu env → fallback production (salon) để site vẫn gọi được API + Firebase.
 */
const PRODUCTION = {
  apiUrl: 'https://trangtran-api-327982031536.asia-southeast1.run.app',
  firebase: {
    apiKey: 'AIzaSyAXpTJZyLmgC2lFFEgptff5kqqfC4ih9pQ',
    authDomain: 'trangtranhairsalon-872c5.firebaseapp.com',
    projectId: 'trangtranhairsalon-872c5',
  },
} as const

function trimUrl(url: string | undefined): string {
  return (url ?? '').trim().replace(/\/$/, '')
}

/** Cloudflare hay copy nhầm .env local — localhost trên trình duyệt khách không bao giờ chạy được. */
function isLocalOnlyApiUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
  } catch {
    return false
  }
}

function resolveConfiguredApiUrl(raw: string | undefined): string {
  const trimmed = trimUrl(raw)
  if (!trimmed) return ''
  if (import.meta.env.PROD && isLocalOnlyApiUrl(trimmed)) return ''
  return trimmed
}

/**
 * URL API cho axios.
 * - Dev: để trống → Vite proxy `/api` → localhost:5000
 * - Docker/nginx prod: build với `VITE_API_URL=` (chuỗi rỗng) → cùng origin `/api`
 * - Cloudflare Pages: không set env → gọi thẳng Cloud Run (CORS *.pages.dev trên backend)
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined
  const fromEnv = resolveConfiguredApiUrl(raw)
  if (fromEnv) return fromEnv

  if (import.meta.env.PROD) {
    if (raw === '') {
      if (typeof window !== 'undefined') return window.location.origin
      return ''
    }
    return PRODUCTION.apiUrl
  }

  return ''
}

export function getProductionApiUrl(): string {
  return PRODUCTION.apiUrl
}

export function getFirebaseProjectId(): string {
  return (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim() || PRODUCTION.firebase.projectId
}

export function getFirebaseWebConfig() {
  const projectId = getFirebaseProjectId()
  const apiKey = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim() || PRODUCTION.firebase.apiKey
  const authDomain =
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim() ||
    PRODUCTION.firebase.authDomain ||
    `${projectId}.firebaseapp.com`

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  }
}

export function isUsingProductionApiFallback(): boolean {
  return import.meta.env.PROD && !resolveConfiguredApiUrl(import.meta.env.VITE_API_URL)
}
