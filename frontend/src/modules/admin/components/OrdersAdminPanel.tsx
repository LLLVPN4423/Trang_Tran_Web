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

export function OrdersAdminPanel() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [phone, setPhone] = useState('')
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
    await updateOrderStatus(id, next)
    load()
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500">
              <th className="py-3 pr-4">Mã CK</th>
              <th className="py-3 pr-4">Khách</th>
              <th className="py-3 pr-4">Tổng</th>
              <th className="py-3 pr-4">Trạng thái</th>
              <th className="py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-zinc-900 text-zinc-400">
                <td className="py-3 pr-4 font-mono text-zinc-300">{order.paymentCode}</td>
                <td className="py-3 pr-4">
                  <p className="text-zinc-200">{order.customerName}</p>
                  <p className="text-xs">{order.customerPhone}</p>
                </td>
                <td className="py-3 pr-4">{formatVnd(order.totalAmount)}</td>
                <td className="py-3 pr-4">{order.status}</td>
                <td className="py-3 space-x-2">
                  {order.status === 'Pending' && (
                    <>
                      <button type="button" onClick={() => handleStatusChange(order.id, 'Paid')} className="text-xs text-emerald-400">
                        Paid
                      </button>
                      <button type="button" onClick={() => handleStatusChange(order.id, 'Cancelled')} className="text-xs text-red-400">
                        Hủy
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
