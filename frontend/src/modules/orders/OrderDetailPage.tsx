import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  confirmOrderReceived,
  fetchOrder,
  submitOrderDispute,
} from '@/shared/api/endpoints'
import type { OrderResponse } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PageLayout } from '@/shared/components/PageLayout'
import {
  buildFulfillmentTimeline,
  canCustomerConfirm,
  canCustomerDispute,
  DISPUTE_REASONS,
  FULFILLMENT_STATUS_LABELS,
  getShippingLabel,
} from '@/shared/lib/orderFulfillment'
import {
  FULFILLMENT_METHOD_LABELS,
  normalizeFulfillmentMethod,
  normalizePaymentMethod,
  PAYMENT_METHOD_LABELS,
} from '@/shared/lib/orderLabels'
import { PaymentCancelled, PaymentPending, PaymentSuccess } from '@/modules/booking/components/PaymentPanel'
import { useAuth } from '@/shared/auth/AuthProvider'

export function OrderDetailPage() {
  const { user } = useAuth()
  const { id: orderId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? undefined

  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [disputeReason, setDisputeReason] = useState<string>(DISPUTE_REASONS[0])
  const [disputeNotes, setDisputeNotes] = useState('')

  const loadOrder = useCallback(async () => {
    if (!orderId) return
    setError(null)
    try {
      const data = await fetchOrder(orderId, token, { live: true })
      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải đơn hàng')
    } finally {
      setLoading(false)
    }
  }, [orderId, token])

  useEffect(() => {
    void loadOrder()
  }, [loadOrder])

  useEffect(() => {
    if (!order || order.status !== 'Pending') return
    const timer = setInterval(() => void loadOrder(), 8000)
    return () => clearInterval(timer)
  }, [order?.status, loadOrder])

  const handleConfirm = async () => {
    if (!order) return
    setSubmitting(true)
    setActionError(null)
    try {
      const updated = await confirmOrderReceived(order.id, token)
      setOrder(updated)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không thể xác nhận')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDispute = async () => {
    if (!order) return
    setSubmitting(true)
    setActionError(null)
    try {
      const updated = await submitOrderDispute(
        order.id,
        { reason: disputeReason, notes: disputeNotes.trim() || null },
        token,
      )
      setOrder(updated)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không thể gửi khiếu nại')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLayout><LoadingState label="Đang tải đơn hàng..." /></PageLayout>
  if (error || !order) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-2xl px-6 py-16">
          <ApiErrorState message={error ?? 'Không tìm thấy đơn'} onRetry={() => { setLoading(true); void loadOrder() }} />
        </div>
      </PageLayout>
    )
  }

  const paymentMethod = normalizePaymentMethod(order.paymentMethod)
  const fulfillmentMethod = normalizeFulfillmentMethod(order.fulfillmentMethod)
  const isServiceInvoice = order.kind === 'ServiceInvoice'
  const showServicePayment =
    isServiceInvoice &&
    (order.status === 'Pending' || order.status === 'Paid' || order.status === 'Cancelled') &&
    paymentMethod === 'BankTransfer'
  const timeline = buildFulfillmentTimeline({
    ...order,
    paidAt: order.paidAt ?? null,
  })
  const showConfirm = canCustomerConfirm(order)
  const showDispute = canCustomerDispute(order)

  return (
    <PageLayout>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">
          {isServiceInvoice ? 'Hóa đơn dịch vụ' : 'Theo dõi đơn hàng'}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-zinc-100">{order.paymentCode}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {PAYMENT_METHOD_LABELS[paymentMethod]}
          {!isServiceInvoice && <> · {FULFILLMENT_METHOD_LABELS[fulfillmentMethod]}</>}
        </p>

        {showServicePayment && order.status === 'Pending' && (
          <div className="mt-8">
            <PaymentPending order={order} />
          </div>
        )}
        {showServicePayment && order.status === 'Paid' && (
          <div className="mt-8">
            <PaymentSuccess order={order} />
          </div>
        )}
        {showServicePayment && order.status === 'Cancelled' && (
          <div className="mt-8">
            <PaymentCancelled order={order} />
          </div>
        )}

        {isServiceInvoice && paymentMethod === 'CashAtSalon' && order.status === 'Paid' && (
          <div className="mt-8 rounded-sm border border-emerald-900/40 bg-emerald-950/20 p-6 text-sm text-zinc-300">
            Salon đã xác nhận thanh toán tại quầy. Cảm ơn bạn!
          </div>
        )}

        <div className="mt-8 rounded-sm border border-zinc-800 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">Tổng thanh toán</p>
              <p className="mt-2 font-serif text-3xl text-zinc-100">{formatVnd(order.totalAmount)}</p>
              {order.shippingFee > 0 && (
                <p className="mt-1 text-xs text-zinc-500">
                  Gồm phí ship {formatVnd(order.shippingFee)}
                  {order.shippingZone ? ` · ${getShippingLabel(order.shippingZone)}` : ''}
                </p>
              )}
            </div>
            <div className="text-right text-sm">
              <p className="text-zinc-400">
                Thanh toán:{' '}
                <span className={order.status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}>
                  {order.status === 'Paid' ? 'Đã thanh toán' : order.status === 'Cancelled' ? 'Đã hủy' : 'Chờ'}
                </span>
              </p>
              {fulfillmentMethod === 'Delivery' && (
                <p className="mt-1 text-zinc-400">
                  Giao hàng:{' '}
                  <span className="text-zinc-200">{FULFILLMENT_STATUS_LABELS[order.fulfillmentStatus]}</span>
                </p>
              )}
            </div>
          </div>

          {order.deliveryAddress && (
            <p className="mt-4 text-sm text-zinc-500">
              <span className="text-zinc-600">Địa chỉ: </span>
              {order.deliveryAddress}
            </p>
          )}

          {(order.trackingCode || order.trackingUrl) && (
            <div className="mt-4 rounded-sm border border-zinc-800 bg-zinc-950/50 p-4 text-sm">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Vận đơn</p>
              {order.carrier && <p className="mt-2 text-zinc-400">{order.carrier}</p>}
              <p className="mt-1 font-mono text-zinc-200">{order.trackingCode}</p>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs uppercase tracking-widest text-gold hover:underline"
                >
                  Theo dõi trên SPX / đơn vị vận chuyển
                </a>
              )}
            </div>
          )}
        </div>

        {!isServiceInvoice && (
        <section className="mt-10">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500">Tiến trình</h2>
          <ol className="mt-4 space-y-4">
            {timeline.map((step) => (
              <li key={step.key} className="flex gap-4">
                <div
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                    step.done ? 'bg-emerald-500' : step.active ? 'bg-amber-400 animate-pulse' : 'bg-zinc-700'
                  }`}
                />
                <div>
                  <p className={`text-sm ${step.done ? 'text-zinc-200' : step.active ? 'text-amber-200' : 'text-zinc-500'}`}>
                    {step.label}
                  </p>
                  {step.at && (
                    <p className="text-xs text-zinc-600">{new Date(step.at).toLocaleString('vi-VN')}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
        )}

        <section className="mt-10">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500">
            {isServiceInvoice ? 'Chi tiết dịch vụ' : 'Sản phẩm'}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            {order.items.map((item) => (
              <li key={`${item.itemId}-${item.hairSize}`} className="flex justify-between gap-3">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="tabular-nums text-zinc-500">{formatVnd(item.subtotal)}</span>
              </li>
            ))}
          </ul>
        </section>

        {actionError && (
          <div className="mt-8">
            <ApiErrorState message={actionError} />
          </div>
        )}

        {!isServiceInvoice && showConfirm && (
          <div className="mt-10 rounded-sm border border-emerald-900/40 bg-emerald-950/20 p-6">
            <p className="text-sm text-zinc-300">Bạn đã nhận đủ hàng và hài lòng?</p>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleConfirm()}
              className="mt-4 bg-emerald-700/80 px-6 py-3 text-xs uppercase tracking-widest text-zinc-100 hover:bg-emerald-600 disabled:opacity-50"
            >
              Xác nhận đã nhận hàng
            </button>
          </div>
        )}

        {!isServiceInvoice && showDispute && (
          <div className="mt-6 rounded-sm border border-amber-900/40 bg-amber-950/20 p-6">
            <p className="text-sm text-zinc-300">Có vấn đề với đơn hàng?</p>
            <select
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="mt-3 w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
            >
              {DISPUTE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <textarea
              value={disputeNotes}
              onChange={(e) => setDisputeNotes(e.target.value)}
              rows={2}
              placeholder="Mô tả thêm (tuỳ chọn)"
              className="mt-3 w-full resize-none border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
            />
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleDispute()}
              className="mt-4 text-xs uppercase tracking-widest text-amber-300 hover:text-amber-200 disabled:opacity-50"
            >
              Gửi phản hồi / khiếu nại
            </button>
          </div>
        )}

        {order.fulfillmentStatus === 'Disputed' && (
          <div className="mt-6 rounded-sm border border-red-900/40 bg-red-950/20 p-6 text-sm text-zinc-300">
            <p className="font-medium text-red-300">Đã gửi khiếu nại</p>
            <p className="mt-2">{order.disputeReason}</p>
            {order.disputeNotes && <p className="mt-1 text-zinc-500">{order.disputeNotes}</p>}
            <p className="mt-3 text-xs text-zinc-500">Salon sẽ liên hệ bạn sớm nhất.</p>
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-4 text-xs uppercase tracking-widest">
          {user ? (
            <Link to="/account?tab=orders" className="text-gold-muted hover:text-gold">
              Đơn của tôi
            </Link>
          ) : null}
          <Link to="/shop" className="text-zinc-500 hover:text-zinc-300">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
