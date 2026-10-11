import { Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import { LoadingState } from '@/shared/components/LoadingState'

export function PlatformAdminRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAdmin, adminRole } = useAuth()

  if (isLoading) return <LoadingState label="Đang kiểm tra quyền..." />
  if (!isAdmin) return <Navigate to="/login" replace />
  if (adminRole !== 'platform') return <Navigate to="/admin" replace state={{ adminForbidden: true }} />

  return children
}
