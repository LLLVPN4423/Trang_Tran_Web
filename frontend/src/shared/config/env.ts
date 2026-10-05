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

export function getApiBaseUrl(): string {
  const fromEnv = trimUrl(import.meta.env.VITE_API_URL)
  if (fromEnv) return fromEnv
  // Production: /api trên cùng domain → Cloudflare Functions proxy → Cloud Run (tránh CORS).
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    return window.location.origin
  }
  if (import.meta.env.PROD) return PRODUCTION.apiUrl
  return ''
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
  return import.meta.env.PROD && !trimUrl(import.meta.env.VITE_API_URL)
}
