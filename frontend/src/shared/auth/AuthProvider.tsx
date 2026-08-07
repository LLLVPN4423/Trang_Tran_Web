import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from 'firebase/auth'
import { getIdToken, isFirebaseConfigured, loginAdmin, logoutAdmin, subscribeAuth } from './firebase'
import { setAuthTokenProvider } from '@/shared/api/client'
import { verifyAdminAccess } from '@/shared/api/endpoints'

interface AuthContextValue {
  user: User | null
  isConfigured: boolean
  isLoading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isConfigured: false,
  isLoading: true,
  isAdmin: false,
  login: async () => {},
  logout: async () => {},
})

async function resolveAdminClaim(user: User | null): Promise<boolean> {
  if (!user) return false
  try {
    const token = await user.getIdTokenResult(true)
    if (token.claims.admin === true) return true
    return verifyAdminAccess()
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isConfigured = isFirebaseConfigured()

  useEffect(() => {
    setAuthTokenProvider(getIdToken)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeAuth(async (nextUser) => {
      setUser(nextUser)
      setIsAdmin(await resolveAdminClaim(nextUser))
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const credential = await loginAdmin(email, password)
    setUser(credential.user)
    setIsAdmin(await resolveAdminClaim(credential.user))
  }, [])

  const logout = useCallback(async () => {
    await logoutAdmin()
    setUser(null)
    setIsAdmin(false)
  }, [])

  const value = useMemo(
    () => ({ user, isConfigured, isLoading, isAdmin, login, logout }),
    [user, isConfigured, isLoading, isAdmin, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
