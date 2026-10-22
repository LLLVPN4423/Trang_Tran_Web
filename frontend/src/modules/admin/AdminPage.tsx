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
          <h1 className="font-serif text-3xl text-ink-secondary">Firebase chưa cấu hình</h1>
          <p className="mt-4 text-ink-subtle">
            Thiết lập <code className="text-gold-700">VITE_FIREBASE_*</code> trong file{' '}
            <code className="text-gold-700">.env</code> để sử dụng Admin Portal.
          </p>
          <Link to="/" className="mt-8 inline-block text-sm text-gold-700 hover:underline">
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
          <h1 className="font-serif text-3xl text-ink-secondary">Không có quyền Admin</h1>
          <p className="mt-4 text-ink-subtle">
            Tài khoản <strong className="text-ink-muted">{user.email}</strong> chưa có custom claim{' '}
            <code className="text-gold-700">admin: true</code>.
          </p>
          <Link to="/" className="mt-8 inline-block text-sm text-gold-700 hover:underline">
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
