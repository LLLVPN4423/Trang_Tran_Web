import { useState, type FormEvent } from 'react'

interface Props {
  onLogin: (email: string, password: string) => Promise<void>
}

export function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onLogin(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <p className="text-xs uppercase tracking-[0.35em] text-gold-700">Admin</p>
      <h1 className="mt-3 font-serif text-3xl text-ink">Đăng nhập</h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        {error && (
          <p className="rounded-sm border border-danger/30 bg-danger/10/30 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-widest text-ink-subtle">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border-b border-edge bg-transparent py-3 text-ink-secondary outline-none focus:border-gold"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-xs uppercase tracking-widest text-ink-subtle">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border-b border-edge bg-transparent py-3 text-ink-secondary outline-none focus:border-gold"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold-500 py-3 text-xs uppercase tracking-[0.3em] text-canvas hover:bg-gold-500 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}
