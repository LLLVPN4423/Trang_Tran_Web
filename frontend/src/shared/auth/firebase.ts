import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

let app: FirebaseApp | null = null
let auth: Auth | null = null

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
  }
  return auth
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

export async function loginAdmin(email: string, password: string) {
  const firebaseAuth = getFirebaseAuth()
  if (!firebaseAuth) throw new Error('Firebase chưa được cấu hình.')
  return signInWithEmailAndPassword(firebaseAuth, email, password)
}

export async function logoutAdmin() {
  const firebaseAuth = getFirebaseAuth()
  if (!firebaseAuth) return
  await signOut(firebaseAuth)
}
