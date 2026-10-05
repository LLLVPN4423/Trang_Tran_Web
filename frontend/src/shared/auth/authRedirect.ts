import { onAuthStateChanged, type Auth, type User, type UserCredential } from 'firebase/auth'

/** Chrome mobile: đợi onAuthStateChanged sau redirect — getRedirectResult hay trả null. */
export function waitForAuthUser(auth: Auth, timeoutMs = 10_000): Promise<User | null> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser)

  return new Promise((resolve) => {
    let settled = false
    const finish = (user: User | null) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      unsubscribe()
      resolve(user)
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) finish(user)
    })

    const timer = window.setTimeout(() => finish(auth.currentUser), timeoutMs)
  })
}

export function isRedirectReturnUrl(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return (
    params.has('code') ||
    params.has('state') ||
    params.has('apiKey') ||
    window.location.hash.includes('apiKey=')
  )
}

export type RedirectCompletion = {
  credential: UserCredential | null
  user: User | null
}

export async function completeRedirectSignIn(
  getResult: () => Promise<UserCredential | null>,
  auth: Auth,
): Promise<RedirectCompletion> {
  let credential: UserCredential | null = null

  try {
    credential = await getResult()
  } catch {
    credential = null
  }

  if (credential?.user) {
    return { credential, user: credential.user }
  }

  const user = await waitForAuthUser(auth, 10_000)
  return { credential, user }
}
