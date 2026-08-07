import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import { PageLayout } from '@/shared/components/PageLayout'

export function LoginPage() {
  const { isConfigured, login, user } = useAuth()

  if (user) return <Navigate to="/account" replace />

  if (!isConfigured) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <p className="text-zinc-500">Firebase chưa cấu hình — không thể đăng nhập.</p>
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
      setError(err instanceof Error ? err.message : 'Thao tác thất bại')
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
