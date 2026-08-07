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
      <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">Admin</p>
      <h1 className="mt-3 font-serif text-3xl text-zinc-100">Đăng nhập</h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        {error && (
          <p className="rounded-sm border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200 outline-none focus:border-gold"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200 outline-none focus:border-gold"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold/90 py-3 text-xs uppercase tracking-[0.3em] text-zinc-950 hover:bg-gold disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}
