import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import { getAuthErrorMessage } from '@/shared/auth/authErrors'
import { PageLayout } from '@/shared/components/PageLayout'
import { GoogleSignInButton } from '@/shared/components/GoogleSignInButton'

export function LoginPage() {
  const { isConfigured, login, user } = useAuth()

  if (user) return <Navigate to="/account" replace />

  if (!isConfigured) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <p className="text-zinc-400">Firebase chưa cấu hình — không thể đăng nhập.</p>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600">
            Điền <code className="text-zinc-500">VITE_FIREBASE_API_KEY</code>,{' '}
            <code className="text-zinc-500">VITE_FIREBASE_AUTH_DOMAIN</code>,{' '}
            <code className="text-zinc-500">VITE_FIREBASE_PROJECT_ID</code> trong file{' '}
            <code className="text-zinc-500">.env</code> ở thư mục gốc repo, rồi{' '}
            <strong className="font-normal text-zinc-500">tắt và chạy lại</strong> <code className="text-zinc-500">npm run dev:all</code>.
          </p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-md px-6 py-16">
        <AuthForm
          title="Đăng nhập"
          subtitle="Truy cập tài khoản, xem đơn hàng và tích điểm."
          onSubmit={(email, password) => login(email, password)}
          footer={
            <p className="text-sm text-zinc-500">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-gold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          }
        />
        <AuthDivider />
        <GoogleSignInButton />
      </div>
    </PageLayout>
  )
}

interface AuthFormProps {
  title: string
  subtitle: string
  onSubmit: (email: string, password: string, name?: string, phone?: string) => Promise<void>
  showProfileFields?: boolean
  footer?: ReactNode
}

export function AuthForm({ title, subtitle, onSubmit, showProfileFields, footer }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    try {
      await onSubmit(
        String(form.get('email')),
        String(form.get('password')),
        String(form.get('name') ?? ''),
        String(form.get('phone') ?? ''),
      )
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">Tài khoản</p>
      <h1 className="mt-3 font-serif text-4xl text-zinc-100">{title}</h1>
      <p className="mt-3 text-sm text-zinc-500">{subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5" data-lenis-prevent>
        {showProfileFields && (
          <>
            <Field label="Họ tên" name="name" required />
            <Field label="Số điện thoại" name="phone" type="tel" required />
          </>
        )}
        <Field label="Email" name="email" type="email" required />
        <Field label="Mật khẩu" name="password" type="password" required minLength={6} />

        {error && (
          <p className="rounded-sm border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold/90 py-4 text-xs font-medium uppercase tracking-[0.3em] text-zinc-950 transition hover:bg-gold disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : title}
        </button>
      </form>

      {footer && <div className="mt-8">{footer}</div>}
    </div>
  )
}

export function AuthDivider() {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-800" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-zinc-950 px-3 text-xs uppercase tracking-widest text-zinc-600">hoặc</span>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  minLength,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  minLength?: number
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        className="w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200 outline-none transition focus:border-gold"
      />
    </div>
  )
}
