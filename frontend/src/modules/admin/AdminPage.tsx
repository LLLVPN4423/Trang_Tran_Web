import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'
import { PageLayout } from '@/shared/components/PageLayout'
import { LoadingState } from '@/shared/components/LoadingState'
import { useAuth } from '@/shared/auth/AuthProvider'
import { AdminLogin } from './components/AdminLogin'
import { AdminDashboard } from './components/AdminDashboard'
import { Link } from 'react-router-dom'

export function AdminPage() {
  return (
    <ModuleErrorBoundary moduleName="Admin">
      <AdminContent />
    </ModuleErrorBoundary>
  )
}

function AdminContent() {
  const { isConfigured, isLoading, isAdmin, user, login } = useAuth()

  if (!isConfigured) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-serif text-3xl text-zinc-200">Firebase chưa cấu hình</h1>
          <p className="mt-4 text-zinc-500">
            Thiết lập <code className="text-gold-muted">VITE_FIREBASE_*</code> trong file{' '}
            <code className="text-gold-muted">.env</code> để sử dụng Admin Portal.
          </p>
          <Link to="/" className="mt-8 inline-block text-sm text-gold-muted hover:underline">
            ← Về trang chủ
          </Link>
        </div>
      </PageLayout>
    )
  }

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingState label="Đang kiểm tra quyền..." />
      </PageLayout>
    )
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="mx-auto px-6 py-24">
          <AdminLogin onLogin={login} />
        </div>
      </PageLayout>
    )
  }

  if (!isAdmin) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-serif text-3xl text-zinc-200">Không có quyền Admin</h1>
          <p className="mt-4 text-zinc-500">
            Tài khoản <strong className="text-zinc-400">{user.email}</strong> chưa có custom claim{' '}
            <code className="text-gold-muted">admin: true</code>.
          </p>
          <Link to="/" className="mt-8 inline-block text-sm text-gold-muted hover:underline">
            ← Về trang chủ
          </Link>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <AdminDashboard />
      </div>
    </PageLayout>
  )
}
