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
import {
  getIdToken,
  isFirebaseConfigured,
  loginWithEmail,
  logoutUser,
  registerWithEmail,
  subscribeAuth,
} from './firebase'
import { setAuthTokenProvider } from '@/shared/api/client'
import {
  fetchCustomerMe,
  syncCustomer,
  verifyAdminAccess,
} from '@/shared/api/endpoints'
import type { CustomerResponse } from '@/shared/api/types'

interface AuthContextValue {
  user: User | null
  customerProfile: CustomerResponse | null
  isConfigured: boolean
  isLoading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, phone: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  customerProfile: null,
  isConfigured: false,
  isLoading: true,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
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

async function loadCustomerProfile(user: User | null, isAdmin: boolean): Promise<CustomerResponse | null> {
  if (!user || isAdmin) return null
  try {
    return await fetchCustomerMe()
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [customerProfile, setCustomerProfile] = useState<CustomerResponse | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isConfigured = isFirebaseConfigured()

  useEffect(() => {
    setAuthTokenProvider(getIdToken)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeAuth(async (nextUser) => {
      setUser(nextUser)
      const admin = await resolveAdminClaim(nextUser)
      setIsAdmin(admin)
      setCustomerProfile(await loadCustomerProfile(nextUser, admin))
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user || isAdmin) {
      setCustomerProfile(null)
      return
    }
    setCustomerProfile(await loadCustomerProfile(user, false))
  }, [user, isAdmin])

  const login = useCallback(async (email: string, password: string) => {
    const credential = await loginWithEmail(email, password)
    setUser(credential.user)
    const admin = await resolveAdminClaim(credential.user)
    setIsAdmin(admin)
    setCustomerProfile(await loadCustomerProfile(credential.user, admin))
  }, [])

  const register = useCallback(async (email: string, password: string, name: string, phone: string) => {
    const credential = await registerWithEmail(email, password)
    setUser(credential.user)
    const profile = await syncCustomer({ name, phone, email })
    setIsAdmin(false)
    setCustomerProfile(profile)
  }, [])

  const logout = useCallback(async () => {
    await logoutUser()
    setUser(null)
    setIsAdmin(false)
    setCustomerProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      customerProfile,
      isConfigured,
      isLoading,
      isAdmin,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, customerProfile, isConfigured, isLoading, isAdmin, login, register, logout, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
