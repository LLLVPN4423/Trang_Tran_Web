import { useCallback, useState } from 'react'
import {
  approveOrderFulfillment,
  fetchOrders,
  markOrderDelivered,
  updateOrderShipment,
  updateOrderStatus,
} from '@/shared/api/endpoints'
import type { OrderResponse, OrderStatus } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import {
  FULFILLMENT_METHOD_LABELS,
  normalizeFulfillmentMethod,
  normalizePaymentMethod,
  PAYMENT_METHOD_LABELS,
} from '@/shared/lib/orderLabels'
import { FULFILLMENT_STATUS_LABELS, getShippingLabel } from '@/shared/lib/orderFulfillment'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { AdminLiveBadge, AdminNewItemsBanner } from './AdminLiveBadge'
import { AdminFilterChips } from './AdminFilterChips'

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
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [phone, setPhone] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, { code: string; url: string; carrier: string }>>({})

  const fetchFn = useCallback(
    () =>
      fetchOrders({
        status: status || undefined,
        phone: phone.trim() || undefined,
        kind: 'Retail',
        live: true,
      }),
    [status, phone],
  )

  const {
    items: orders,
    initialLoading,
    refreshing,
    error,
    lastUpdated,
    newIds,
    refresh,
    dismissNew,
    dismissAllNew,
    setItems: setOrders,
  } = useAdminLiveRefresh(fetchFn, `${status}|${phone.trim()}`)

  const handleStatusChange = async (id: string, next: OrderStatus) => {
    setUpdatingId(id)
    try {
      const updated = await updateOrderStatus(id, next)
      dismissNew(id)
      setOrders((prev) => {
        if (status && status !== next) {
          return prev.filter((o) => o.id !== id)
        }
        return prev.map((o) => (o.id === id ? updated : o))
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật')
    } finally {
      setUpdatingId(null)
    }
  }

  const patchOrder = (updated: OrderResponse) => {
    dismissNew(updated.id)
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
  }

  const handleApprove = async (id: string) => {
    setUpdatingId(id)
    try {
      patchOrder(await approveOrderFulfillment(id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể duyệt')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleShipment = async (id: string) => {
    const draft = trackingDrafts[id]
    if (!draft?.code.trim()) {
      alert('Nhập mã vận đơn')
      return
    }
    setUpdatingId(id)
    try {
      patchOrder(
        await updateOrderShipment(id, {
          trackingCode: draft.code.trim(),
          trackingUrl: draft.url.trim() || null,
          carrier: draft.carrier.trim() || null,
        }),
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật vận đơn')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelivered = async (id: string) => {
    setUpdatingId(id)
    try {
      patchOrder(await markOrderDelivered(id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể đánh dấu đã giao')
    } finally {
      setUpdatingId(null)
    }
  }

  if (initialLoading) return <LoadingState label="Đang tải đơn hàng..." />
  if (error) return <ApiErrorState message={error} onRetry={() => refresh(true)} />

  return (
    <div className="space-y-6">
      <AdminLiveBadge
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        newCount={newIds.size}
        onRefresh={() => refresh(true)}
        onDismissNew={dismissAllNew}
      />

      <AdminNewItemsBanner
        count={newIds.size}
        label="đơn hàng"
        onDismiss={dismissAllNew}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <AdminFilterChips
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS}
          aria-label="Lọc trạng thái đơn hàng"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Lọc SĐT..."
          className="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 sm:max-w-xs"
        />
      </div>

      <p className="text-sm text-zinc-500">{orders.length} đơn hàng</p>

      <div className="space-y-3">
        {orders.map((order) => {
          const isNew = newIds.has(order.id)
          return (
            <article
              key={order.id}
              className={`border transition-colors ${
                isNew
                  ? 'border-emerald-700/60 bg-emerald-950/20 ring-1 ring-emerald-700/30'
                  : 'border-zinc-800'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  dismissNew(order.id)
                  setExpandedId(expandedId === order.id ? null : order.id)
                }}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 text-left hover:bg-zinc-900/30"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm text-gold-muted">{order.paymentCode}</p>
                    {isNew && (
                      <span className="rounded-sm bg-emerald-900/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-emerald-400">
                        Mới
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-zinc-200">{order.customerName} · {order.customerPhone}</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {PAYMENT_METHOD_LABELS[normalizePaymentMethod(order.paymentMethod)]}
                    {' · '}
                    {FULFILLMENT_METHOD_LABELS[normalizeFulfillmentMethod(order.fulfillmentMethod)]}
                    {order.fulfillmentMethod === 'Delivery' && order.fulfillmentStatus !== 'None' && (
                      <> · {FULFILLMENT_STATUS_LABELS[order.fulfillmentStatus]}</>
                    )}
                  </p>
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
                  {order.deliveryAddress && (
                    <p className="mt-2 text-zinc-500">Địa chỉ giao: {order.deliveryAddress}</p>
                  )}
                  {order.shippingFee > 0 && (
                    <p className="mt-2 text-zinc-500">
                      Phí ship: {formatVnd(order.shippingFee)}
                      {order.shippingZone ? ` · ${getShippingLabel(order.shippingZone)}` : ''}
                    </p>
                  )}
                  {order.trackingCode && (
                    <p className="mt-2 text-zinc-500">
                      Vận đơn: {order.carrier ? `${order.carrier} · ` : ''}
                      <span className="font-mono text-zinc-400">{order.trackingCode}</span>
                      {order.trackingUrl && (
                        <>
                          {' · '}
                          <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-gold hover:underline">
                            Link
                          </a>
                        </>
                      )}
                    </p>
                  )}
                  {order.fulfillmentStatus === 'Disputed' && (
                    <p className="mt-2 text-red-400">
                      Khiếu nại: {order.disputeReason}
                      {order.disputeNotes ? ` — ${order.disputeNotes}` : ''}
                    </p>
                  )}

                  {order.fulfillmentMethod === 'Delivery' && order.fulfillmentStatus === 'AwaitingApproval' && (
                    <div className="mt-4">
                      <button
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() => void handleApprove(order.id)}
                        className="text-xs text-amber-300 hover:underline disabled:opacity-50"
                      >
                        Duyệt COD — sẵn sàng giao
                      </button>
                    </div>
                  )}

                  {order.fulfillmentMethod === 'Delivery' && order.fulfillmentStatus === 'Approved' && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs uppercase tracking-widest text-zinc-600">Nhập vận đơn & giao hàng</p>
                      <input
                        placeholder="Mã vận đơn SPX"
                        value={trackingDrafts[order.id]?.code ?? ''}
                        onChange={(e) =>
                          setTrackingDrafts((prev) => ({
                            ...prev,
                            [order.id]: {
                              code: e.target.value,
                              url: prev[order.id]?.url ?? '',
                              carrier: prev[order.id]?.carrier ?? 'SPX',
                            },
                          }))
                        }
                        className="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
                      />
                      <input
                        placeholder="Link theo dõi (tuỳ chọn)"
                        value={trackingDrafts[order.id]?.url ?? ''}
                        onChange={(e) =>
                          setTrackingDrafts((prev) => ({
                            ...prev,
                            [order.id]: {
                              code: prev[order.id]?.code ?? '',
                              url: e.target.value,
                              carrier: prev[order.id]?.carrier ?? 'SPX',
                            },
                          }))
                        }
                        className="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
                      />
                      <button
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() => void handleShipment(order.id)}
                        className="text-xs text-emerald-400 hover:underline disabled:opacity-50"
                      >
                        Xác nhận đã giao cho đơn vị vận chuyển
                      </button>
                    </div>
                  )}

                  {order.fulfillmentMethod === 'Delivery' && order.fulfillmentStatus === 'Shipped' && (
                    <div className="mt-4">
                      <button
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() => void handleDelivered(order.id)}
                        className="text-xs text-emerald-400 hover:underline disabled:opacity-50"
                      >
                        Đánh dấu đã giao tới khách
                      </button>
                    </div>
                  )}

                  {order.status === 'Pending' && (
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() => handleStatusChange(order.id, 'Paid')}
                        className="text-xs text-emerald-400 hover:underline disabled:opacity-50"
                      >
                        {normalizePaymentMethod(order.paymentMethod) === 'COD'
                          ? 'Xác nhận đã thu tiền (COD)'
                          : 'Xác nhận đã chuyển khoản'}
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() => handleStatusChange(order.id, 'Cancelled')}
                        className="text-xs text-red-400 hover:underline disabled:opacity-50"
                      >
                        Hủy đơn
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
