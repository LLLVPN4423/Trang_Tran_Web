import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from 'firebase/auth'
import {
  clearGoogleRedirectPending,
  completeGoogleRedirectSignIn,
  consumeGoogleRedirectReturnPath,
  getFirebaseAuth,
  getIdToken,
  isFirebaseConfigured,
  loginWithEmail,
  loginWithGoogle as loginWithGoogleFirebase,
  logoutUser,
  registerWithEmail,
  subscribeAuth,
  wasGoogleRedirectPending,
} from './firebase'
import { completeRedirectSignIn, isRedirectReturnUrl } from './authRedirect'
import { getAuthErrorMessage } from './authErrors'
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
  isRedirectProcessing: boolean
  redirectError: string | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, name: string, phone: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  applyCustomerProfile: (profile: CustomerResponse) => void
  clearRedirectError: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  customerProfile: null,
  isConfigured: false,
  isLoading: true,
  isRedirectProcessing: false,
  redirectError: null,
  isAdmin: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  applyCustomerProfile: () => {},
  clearRedirectError: () => {},
})

async function resolveAdminClaim(user: User | null): Promise<boolean> {
  if (!user) return false
  try {
    const token = await user.getIdTokenResult(true)
    const claim = token.claims.admin
    const hasClaim = claim === true || claim === 'true'
    if (!hasClaim) return false
    return verifyAdminAccess()
  } catch {
    return false
  }
}

async function loadCustomerProfile(user: User | null): Promise<CustomerResponse | null> {
  if (!user) return null
  try {
    return await fetchCustomerMe()
  } catch {
    return null
  }
}

async function applyUserState(
  nextUser: User | null,
  setters: {
    setUser: (u: User | null) => void
    setIsAdmin: (v: boolean) => void
    setCustomerProfile: (p: CustomerResponse | null) => void
  },
) {
  setters.setUser(nextUser)
  const admin = await resolveAdminClaim(nextUser)
  setters.setIsAdmin(admin)
  setters.setCustomerProfile(await loadCustomerProfile(nextUser))
}

function RedirectNavigator({ user }: { user: User | null }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    const returnPath = consumeGoogleRedirectReturnPath()
    if (returnPath && returnPath !== window.location.pathname) {
      navigate(returnPath, { replace: true })
    }
  }, [user, navigate])

  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [customerProfile, setCustomerProfile] = useState<CustomerResponse | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirectProcessing, setIsRedirectProcessing] = useState(
    () => wasGoogleRedirectPending() || isRedirectReturnUrl(),
  )
  const [redirectError, setRedirectError] = useState<string | null>(null)
  const isConfigured = isFirebaseConfigured()

  useEffect(() => {
    setAuthTokenProvider(getIdToken)
  }, [])

  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false

    const init = async () => {
      const pendingRedirect = wasGoogleRedirectPending() || isRedirectReturnUrl()
      if (pendingRedirect) setIsRedirectProcessing(true)

      if (pendingRedirect) {
        const auth = getFirebaseAuth()
        if (auth) {
          try {
            const { credential, user: redirectUser } = await completeRedirectSignIn(
              completeGoogleRedirectSignIn,
              auth,
            )
            if (cancelled) return

            const signedInUser = credential?.user ?? redirectUser
            if (signedInUser) {
              await applyUserState(signedInUser, { setUser, setIsAdmin, setCustomerProfile })
              setRedirectError(null)
              clearGoogleRedirectPending()
            } else {
              clearGoogleRedirectPending()
              setRedirectError(
                'Google chưa hoàn tất đăng nhập trên Chrome. Thử lại hoặc dùng email/mật khẩu bên dưới.',
              )
            }
          } catch (err) {
            if (!cancelled) {
              clearGoogleRedirectPending()
              setRedirectError(getAuthErrorMessage(err))
            }
          } finally {
            if (!cancelled) setIsRedirectProcessing(false)
          }
        }
      }

      unsubscribe = subscribeAuth(async (nextUser) => {
        if (cancelled) return
        await applyUserState(nextUser, { setUser, setIsAdmin, setCustomerProfile })
        setIsLoading(false)
        if (nextUser) {
          setRedirectError(null)
          clearGoogleRedirectPending()
        }
      })
    }

    void init()
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const clearRedirectError = useCallback(() => {
    setRedirectError(null)
    clearGoogleRedirectPending()
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setCustomerProfile(null)
      return
    }
    setCustomerProfile(await loadCustomerProfile(user))
  }, [user])

  const applyCustomerProfile = useCallback((profile: CustomerResponse) => {
    setCustomerProfile(profile)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const credential = await loginWithEmail(email, password)
    await applyUserState(credential.user, { setUser, setIsAdmin, setCustomerProfile })
    setRedirectError(null)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setRedirectError(null)
    const credential = await loginWithGoogleFirebase()
    if (!credential) return
    await applyUserState(credential.user, { setUser, setIsAdmin, setCustomerProfile })
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
    setRedirectError(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      customerProfile,
      isConfigured,
      isLoading,
      isRedirectProcessing,
      redirectError,
      isAdmin,
      login,
      loginWithGoogle,
      register,
      logout,
      refreshProfile,
      applyCustomerProfile,
      clearRedirectError,
    }),
    [
      user,
      customerProfile,
      isConfigured,
      isLoading,
      isRedirectProcessing,
      redirectError,
      isAdmin,
      login,
      loginWithGoogle,
      register,
      logout,
      refreshProfile,
      applyCustomerProfile,
      clearRedirectError,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      <RedirectNavigator user={user} />
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
