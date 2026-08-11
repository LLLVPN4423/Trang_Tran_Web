import { useCallback, useEffect, useState } from 'react'
import { fetchOrders, updateOrderStatus } from '@/shared/api/endpoints'
import type { OrderResponse, OrderStatus } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'

const STATUS_OPTIONS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'Pending', label: 'Chờ thanh toán' },
  { value: 'Paid', label: 'Đã thanh toán' },
  { value: 'Cancelled', label: 'Đã hủy' },
]

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Chờ thanh toán',
  Paid: 'Đã thanh toán',
  Cancelled: 'Đã hủy',
}

export function OrdersAdminPanel() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [phone, setPhone] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setOrders(await fetchOrders({
        status: status || undefined,
        phone: phone.trim() || undefined,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải đơn hàng')
    } finally {
      setLoading(false)
    }
  }, [status, phone])

  useEffect(() => {
    load()
  }, [load])

  const handleStatusChange = async (id: string, next: OrderStatus) => {
    try {
      await updateOrderStatus(id, next)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật')
    }
  }

  if (loading) return <LoadingState label="Đang tải đơn hàng..." />
  if (error) return <ApiErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus | '')}
          className="border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Lọc SĐT..."
          className="border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
        />
        <button type="button" onClick={load} className="text-xs uppercase tracking-widest text-gold">
          Lọc
        </button>
      </div>

      <p className="text-sm text-zinc-500">{orders.length} đơn hàng</p>

      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="border border-zinc-800">
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 text-left hover:bg-zinc-900/30"
            >
              <div>
                <p className="font-mono text-sm text-gold-muted">{order.paymentCode}</p>
                <p className="mt-1 text-zinc-200">{order.customerName} · {order.customerPhone}</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-lg text-zinc-100">{formatVnd(order.totalAmount)}</p>
                <p className="text-xs text-zinc-500">{STATUS_LABELS[order.status]}</p>
              </div>
            </button>

            {expandedId === order.id && (
              <div className="border-t border-zinc-800 px-4 py-4 text-sm text-zinc-400">
                <p className="text-xs text-zinc-600">
                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                  {order.customerEmail ? ` · ${order.customerEmail}` : ''}
                </p>
                <ul className="mt-3 space-y-1">
                  {order.items.map((item) => (
                    <li key={`${item.itemId}-${item.hairSize}`}>
                      {item.name} × {item.quantity}
                      {item.hairSize ? ` (${item.hairSize})` : ''} — {formatVnd(item.subtotal)}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-4 text-xs">
                  {order.promotionCode && <span>Mã KM: {order.promotionCode}</span>}
                  {order.discountAmount > 0 && <span>Giảm: {formatVnd(order.discountAmount)}</span>}
                  {order.pointsRedeemed > 0 && <span>Dùng {order.pointsRedeemed} điểm</span>}
                  {order.pointsEarned > 0 && order.status === 'Paid' && <span>+{order.pointsEarned} điểm</span>}
                </div>
                {order.notes && <p className="mt-3 text-zinc-500">Ghi chú: {order.notes}</p>}
                {order.status === 'Pending' && (
                  <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => handleStatusChange(order.id, 'Paid')} className="text-xs text-emerald-400 hover:underline">
                      Xác nhận đã thanh toán
                    </button>
                    <button type="button" onClick={() => handleStatusChange(order.id, 'Cancelled')} className="text-xs text-red-400 hover:underline">
                      Hủy đơn
                    </button>
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
