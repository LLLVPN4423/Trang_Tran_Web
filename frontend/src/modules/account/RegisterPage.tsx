import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import { PageLayout } from '@/shared/components/PageLayout'
import { GoogleSignInButton } from '@/shared/components/GoogleSignInButton'
import { AuthDivider, AuthForm } from './LoginPage'

export function RegisterPage() {
  const { isConfigured, register, user } = useAuth()

  if (user) return <Navigate to="/account" replace />

  if (!isConfigured) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <p className="text-zinc-500">Firebase chưa cấu hình.</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-md px-6 py-16">
        <AuthForm
          title="Đăng ký"
          subtitle="Tạo tài khoản để tích điểm và theo dõi đơn hàng."
          showProfileFields
          onSubmit={(email, password, name, phone) => register(email, password, name!, phone!)}
          footer={
            <p className="text-sm text-zinc-500">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-gold hover:underline">
                Đăng nhập
              </Link>
            </p>
          }
        />
        <AuthDivider />
        <p className="mb-4 text-center text-xs text-zinc-600">
          Đăng ký nhanh bằng Google — bạn sẽ bổ sung số điện thoại tại trang Tài khoản.
        </p>
        <GoogleSignInButton />
      </div>
    </PageLayout>
  )
}
