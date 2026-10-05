import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
  type UserCredential,
} from 'firebase/auth'
import { getDownloadURL, getStorage, ref, uploadBytes, type FirebaseStorage } from 'firebase/storage'

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || ''

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let storage: FirebaseStorage | null = null

function createFirebaseAuth(firebaseApp: FirebaseApp): Auth {
  try {
    return initializeAuth(firebaseApp, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    })
  } catch {
    return getAuth(firebaseApp)
  }
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId,
  )
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null
  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = createFirebaseAuth(app)
    if (firebaseConfig.storageBucket) {
      storage = getStorage(app)
    }
  }
  return auth
}

export function isFirebaseStorageConfigured(): boolean {
  return Boolean(isFirebaseConfigured() && firebaseConfig.storageBucket)
}

export function getFirebaseStorage(): FirebaseStorage | null {
  getFirebaseAuth()
  return storage
}

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const firebaseStorage = getFirebaseStorage()
  if (!firebaseStorage) throw new Error('Firebase Storage chưa cấu hình.')

  const safeName = file.name.replace(/[^\w.\-]+/g, '_')
  const path = `products/${productId}/${Date.now()}-${safeName}`
  const storageRef = ref(firebaseStorage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function getIdToken(): Promise<string | null> {
  const firebaseAuth = getFirebaseAuth()
  if (!firebaseAuth?.currentUser) return null
  return firebaseAuth.currentUser.getIdToken(false)
}

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  const firebaseAuth = getFirebaseAuth()
  if (!firebaseAuth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(firebaseAuth, callback)
}

export async function loginWithEmail(email: string, password: string) {
  const firebaseAuth = getFirebaseAuth()
  if (!firebaseAuth) throw new Error('Firebase chưa được cấu hình.')
  return signInWithEmailAndPassword(firebaseAuth, email, password)
}

export async function registerWithEmail(email: string, password: string) {
  const firebaseAuth = getFirebaseAuth()
  if (!firebaseAuth) throw new Error('Firebase chưa được cấu hình.')
  return createUserWithEmailAndPassword(firebaseAuth, email, password)
}

/** Popup trên mọi thiết bị; redirect firebaseapp.com chỉ khi popup bị chặn (mobile). */
export async function loginWithGoogle(): Promise<UserCredential | null> {
  const firebaseAuth = getFirebaseAuth()
  if (!firebaseAuth) throw new Error('Firebase chưa được cấu hình.')

  if (isInAppBrowser()) {
    throw new Error(
      'Trình duyệt trong app (Zalo/Facebook) không hỗ trợ Google. Mở Chrome hoặc Safari → gõ trangtran-hair.pages.dev → đăng nhập lại.',
    )
  }

  const provider = createGoogleProvider()

  try {
    return await signInWithPopup(firebaseAuth, provider)
  } catch (err) {
    const code = (err as { code?: string })?.code
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request'
    ) {
      throw err
    }

    if (isMobileDevice()) {
      markGoogleRedirectPending()
      await signInWithRedirect(firebaseAuth, provider)
      return null
    }

    throw err
  }
}

function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')
  provider.setCustomParameters({ prompt: 'select_account' })
  return provider
}

export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /FBAN|FBAV|Instagram|Line|Twitter|Zalo|Messenger|MicroMessenger|LinkedInApp/i.test(ua)
}

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const mobile = /Android|iPhone|iPod|Mobile/i.test(ua)
  const ipad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  return mobile || ipad
}

export function shouldUseGoogleRedirect(): boolean {
  return false
}

function markGoogleRedirectPending(): void {
  try {
    sessionStorage.setItem('google-auth-pending', '1')
    sessionStorage.setItem('google-auth-return', window.location.pathname + window.location.search)
  } catch {
    /* storage blocked */
  }
}

export function wasGoogleRedirectPending(): boolean {
  try {
    return sessionStorage.getItem('google-auth-pending') === '1'
  } catch {
    return false
  }
}

export function consumeGoogleRedirectReturnPath(): string | null {
  try {
    const path = sessionStorage.getItem('google-auth-return')
    sessionStorage.removeItem('google-auth-return')
    return path
  } catch {
    return null
  }
}

export function clearGoogleRedirectPending(): void {
  try {
    sessionStorage.removeItem('google-auth-pending')
    sessionStorage.removeItem('google-auth-return')
  } catch {
    /* storage blocked */
  }
}

export async function completeGoogleRedirectSignIn(): Promise<UserCredential | null> {
  const firebaseAuth = getFirebaseAuth()
  if (!firebaseAuth) return null

  if (!wasGoogleRedirectPending()) {
    return getRedirectResult(firebaseAuth)
  }

  try {
    const result = await getRedirectResult(firebaseAuth)
    if (result?.user) {
      clearGoogleRedirectPending()
    }
    return result
  } catch (error) {
    clearGoogleRedirectPending()
    throw error
  }
}

export async function logoutUser() {
  const firebaseAuth = getFirebaseAuth()
  if (!firebaseAuth) return
  clearGoogleRedirectPending()
  await signOut(firebaseAuth)
}

/** @deprecated use loginWithEmail */
export const loginAdmin = loginWithEmail
/** @deprecated use logoutUser */
export const logoutAdmin = logoutUser
