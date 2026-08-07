import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import { fetchOrders, syncCustomer } from '@/shared/api/endpoints'
import type { OrderResponse } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { PageLayout } from '@/shared/components/PageLayout'
import { LoadingState } from '@/shared/components/LoadingState'
import { ApiErrorState } from '@/shared/components/ApiErrorState'

export function AccountPage() {
  const { user, customerProfile, isLoading, refreshProfile } = useAuth()
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true)
    setError(null)
    try {
      setOrders(await fetchOrders())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được đơn hàng')
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  useEffect(() => {
    if (user) loadOrders()
  }, [user, loadOrders])

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingState label="Đang tải..." />
      </PageLayout>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!customerProfile) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-md px-6 py-16">
          <h1 className="font-serif text-3xl text-zinc-100">Hoàn tất hồ sơ</h1>
          <p className="mt-3 text-sm text-zinc-500">Nhập thông tin để tích điểm và theo dõi đơn hàng.</p>
          <ProfileSyncForm
            email={user.email ?? ''}
            onSynced={refreshProfile}
          />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">Tài khoản</p>
        <h1 className="mt-3 font-serif text-3xl text-zinc-100 sm:text-4xl">Xin chào, {customerProfile?.name ?? user.email}</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Điểm tích lũy" value={String(customerProfile?.loyaltyPoints ?? 0)} href="/account/loyalty" />
          <StatCard label="Tổng chi tiêu" value={formatVnd(customerProfile?.totalSpent ?? 0)} />
          <StatCard label="Đơn hàng" value={String(orders.length)} />
        </div>

        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-zinc-200">Lịch sử đơn hàng</h2>
            <Link to="/catalog" className="text-xs uppercase tracking-widest text-gold-muted hover:text-gold">
              Đặt thêm →
            </Link>
          </div>

          {loadingOrders && <LoadingState label="Đang tải đơn..." />}
          {error && <ApiErrorState message={error} onRetry={loadOrders} />}

          {!loadingOrders && !error && orders.length === 0 && (
            <p className="text-zinc-500">Bạn chưa có đơn hàng nào.</p>
          )}

          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="border border-zinc-800 p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-zinc-400">{order.paymentCode}</p>
                    <p className="mt-1 text-xs text-zinc-600">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <ul className="mt-4 space-y-1 text-sm text-zinc-500">
                  {order.items.map((item) => (
                    <li key={`${item.itemId}-${item.hairSize}`}>
                      {item.name} × {item.quantity} — {formatVnd(item.subtotal)}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {order.discountAmount > 0 && (
                    <span className="text-emerald-500">Giảm {formatVnd(order.discountAmount)}</span>
                  )}
                  {order.pointsEarned > 0 && order.status === 'Paid' && (
                    <span className="text-gold-muted">+{order.pointsEarned} điểm</span>
                  )}
                  <span className="font-serif text-lg text-zinc-200">{formatVnd(order.totalAmount)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

function StatCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="border border-zinc-800 p-5 transition hover:border-zinc-700">
      <p className="text-xs uppercase tracking-widest text-zinc-600">{label}</p>
      <p className="mt-2 font-serif text-2xl text-zinc-100">{value}</p>
    </div>
  )
  return href ? <Link to={href}>{content}</Link> : content
}

function ProfileSyncForm({ email, onSynced }: { email: string; onSynced: () => Promise<void> }) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      await syncCustomer({
        name: String(form.get('name')),
        phone: String(form.get('phone')),
        email: String(form.get('email')) || email,
      })
      await onSynced()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu hồ sơ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <input name="name" required placeholder="Họ tên" className="w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200" />
      <input name="phone" required placeholder="Số điện thoại" className="w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200" />
      <input name="email" defaultValue={email} placeholder="Email" className="w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200" />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-gold/90 py-3 text-xs uppercase tracking-widest text-zinc-950">
        Lưu hồ sơ
      </button>
    </form>
  )
}

function StatusBadge({ status }: { status: OrderResponse['status'] }) {
  const styles = {
    Pending: 'text-amber-400 border-amber-900/50',
    Paid: 'text-emerald-400 border-emerald-900/50',
    Cancelled: 'text-zinc-500 border-zinc-700',
  } as const

  const labels = { Pending: 'Chờ thanh toán', Paid: 'Đã thanh toán', Cancelled: 'Đã hủy' }

  return (
    <span className={`rounded-sm border px-2 py-1 text-[10px] uppercase tracking-wider ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
