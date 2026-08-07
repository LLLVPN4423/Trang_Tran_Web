import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import { getDownloadURL, getStorage, ref, uploadBytes, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let storage: FirebaseStorage | null = null

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
    auth = getAuth(app)
    if (firebaseConfig.storageBucket) {
      storage = getStorage(app)
    }
  }
  return auth
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
  return firebaseAuth.currentUser.getIdToken()
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

export async function logoutUser() {
  const firebaseAuth = getFirebaseAuth()
  if (!firebaseAuth) return
  await signOut(firebaseAuth)
}

/** @deprecated use loginWithEmail */
export const loginAdmin = loginWithEmail
/** @deprecated use logoutUser */
export const logoutAdmin = logoutUser
