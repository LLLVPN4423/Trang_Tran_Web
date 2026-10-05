/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_GOOGLE_WEB_CLIENT_ID: string
  readonly VITE_SEPAY_BANK_NAME: string
  readonly VITE_SEPAY_BANK_BIN?: string
  readonly VITE_SEPAY_ACCOUNT_NUMBER: string
  readonly VITE_SEPAY_ACCOUNT_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
