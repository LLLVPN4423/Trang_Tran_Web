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
import { FormLegalNotice } from '@/shared/components/FormLegalNotice'
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
        <p className="text-xs uppercase tracking-[0.35em] text-gold-700">
          {isServiceInvoice ? 'Hóa đơn dịch vụ' : 'Theo dõi đơn hàng'}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-ink">{order.paymentCode}</h1>
        <p className="mt-2 text-sm text-ink-subtle">
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
          <div className="mt-8 rounded-sm border border-success/25 bg-success/10 p-6 text-sm text-ink-secondary">
            Salon đã xác nhận thanh toán tại quầy. Cảm ơn bạn!
          </div>
        )}

        <div className="mt-8 rounded-sm border border-edge p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-subtle">Tổng thanh toán</p>
              <p className="mt-2 font-serif text-3xl text-ink">{formatVnd(order.totalAmount)}</p>
              {order.shippingFee > 0 && (
                <p className="mt-1 text-xs text-ink-subtle">
                  Gồm phí ship {formatVnd(order.shippingFee)}
                  {order.shippingZone ? ` · ${getShippingLabel(order.shippingZone)}` : ''}
                </p>
              )}
            </div>
            <div className="text-right text-sm">
              <p className="text-ink-muted">
                Thanh toán:{' '}
                <span className={order.status === 'Paid' ? 'text-success' : 'text-warning'}>
                  {order.status === 'Paid' ? 'Đã thanh toán' : order.status === 'Cancelled' ? 'Đã hủy' : 'Chờ'}
                </span>
              </p>
              {fulfillmentMethod === 'Delivery' && (
                <p className="mt-1 text-ink-muted">
                  Giao hàng:{' '}
                  <span className="text-ink-secondary">{FULFILLMENT_STATUS_LABELS[order.fulfillmentStatus]}</span>
                </p>
              )}
            </div>
          </div>

          {order.deliveryAddress && (
            <p className="mt-4 text-sm text-ink-subtle">
              <span className="text-ink-subtle">Địa chỉ: </span>
              {order.deliveryAddress}
            </p>
          )}

          {(order.trackingCode || order.trackingUrl) && (
            <div className="mt-4 rounded-sm border border-edge bg-canvas/50 p-4 text-sm">
              <p className="text-xs uppercase tracking-widest text-ink-subtle">Vận đơn</p>
              {order.carrier && <p className="mt-2 text-ink-muted">{order.carrier}</p>}
              <p className="mt-1 font-mono text-ink-secondary">{order.trackingCode}</p>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs uppercase tracking-widest text-gold-500 hover:underline"
                >
                  Theo dõi trên SPX / đơn vị vận chuyển
                </a>
              )}
            </div>
          )}
        </div>

        {!isServiceInvoice && (
        <section className="mt-10">
          <h2 className="text-xs uppercase tracking-widest text-ink-subtle">Tiến trình</h2>
          <ol className="mt-4 space-y-4">
            {timeline.map((step) => (
              <li key={step.key} className="flex gap-4">
                <div
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                    step.done ? 'bg-success' : step.active ? 'bg-warning animate-pulse' : 'bg-edge-strong'
                  }`}
                />
                <div>
                  <p className={`text-sm ${step.done ? 'text-ink-secondary' : step.active ? 'text-warning' : 'text-ink-subtle'}`}>
                    {step.label}
                  </p>
                  {step.at && (
                    <p className="text-xs text-ink-subtle">{new Date(step.at).toLocaleString('vi-VN')}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
        )}

        <section className="mt-10">
          <h2 className="text-xs uppercase tracking-widest text-ink-subtle">
            {isServiceInvoice ? 'Chi tiết dịch vụ' : 'Sản phẩm'}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            {order.items.map((item) => (
              <li key={`${item.itemId}-${item.hairSize}`} className="flex justify-between gap-3">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="tabular-nums text-ink-subtle">{formatVnd(item.subtotal)}</span>
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
          <div className="mt-10 rounded-sm border border-success/25 bg-success/10 p-6">
            <p className="text-sm text-ink-secondary">Bạn đã nhận đủ hàng và hài lòng?</p>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleConfirm()}
              className="mt-4 bg-success/80 px-6 py-3 text-xs uppercase tracking-widest text-ink hover:bg-success disabled:opacity-50"
            >
              Xác nhận đã nhận hàng
            </button>
          </div>
        )}

        {!isServiceInvoice && showDispute && (
          <div className="mt-6 rounded-sm border border-warning/25 bg-warning/10 p-6">
            <p className="text-sm text-ink-secondary">Có vấn đề với đơn hàng?</p>
            <select
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="mt-3 w-full border border-edge bg-canvas px-3 py-2 text-sm text-ink-secondary"
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
              className="mt-3 w-full resize-none border border-edge bg-canvas px-3 py-2 text-sm text-ink-secondary"
            />
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleDispute()}
              className="mt-4 text-xs uppercase tracking-widest text-warning hover:text-warning disabled:opacity-50"
            >
              Gửi phản hồi / khiếu nại
            </button>
          </div>
        )}

        {order.fulfillmentStatus === 'Disputed' && (
          <div className="mt-6 rounded-sm border border-danger/30/40 bg-danger/10 p-6 text-sm text-ink-secondary">
            <p className="font-medium text-danger">Đã gửi khiếu nại</p>
            <p className="mt-2">{order.disputeReason}</p>
            {order.disputeNotes && <p className="mt-1 text-ink-subtle">{order.disputeNotes}</p>}
            <p className="mt-3 text-xs text-ink-subtle">Salon sẽ liên hệ bạn sớm nhất.</p>
          </div>
        )}

        <FormLegalNotice
          className="mt-10"
          preface="Tham khảo chính sách thanh toán và giao hàng / đổi trả nếu cần hỗ trợ về đơn này."
          links={[
            { to: '/chinh-sach-thanh-toan', label: 'Chính sách thanh toán' },
            { to: '/chinh-sach-giao-hang-doi-tra', label: 'Giao hàng & đổi trả' },
            { to: '/lien-he-khieu-nai', label: 'Liên hệ & khiếu nại' },
          ]}
        />

        <div className="mt-12 flex flex-wrap gap-4 text-xs uppercase tracking-widest">
          {user ? (
            <Link to="/account?tab=orders" className="text-gold-700 hover:text-gold-300">
              Đơn của tôi
            </Link>
          ) : null}
          <Link to="/shop" className="text-ink-subtle hover:text-ink-secondary">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
