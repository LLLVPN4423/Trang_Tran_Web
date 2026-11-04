import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createOrder, validatePromotion } from '@/shared/api/endpoints'
import type {
  CreateOrderRequest,
  FulfillmentMethod,
  OrderResponse,
  PaymentMethod,
  ShippingZone,
} from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { SHIPPING_ZONES, getShippingFee } from '@/shared/lib/orderFulfillment'
import { useAuth } from '@/shared/auth/AuthProvider'
import { useCartStore } from '@/shared/store/cartStore'
import { selectCartSubtotal } from '@/shared/store/cartSelectors'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { FormLegalNotice } from '@/shared/components/FormLegalNotice'
import {
  FULFILLMENT_METHOD_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/shared/lib/orderLabels'

interface Props {
  onSuccess: (order: OrderResponse) => void
}

export function CheckoutForm({ onSuccess }: Props) {
  const productItems = useCartStore((s) => s.items)
  const productTotal = useCartStore(selectCartSubtotal)
  const clearCart = useCartStore((s) => s.clearCart)
  const { user, customerProfile } = useAuth()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState<string | null>(null)
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BankTransfer')
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('Pickup')
  const [shippingZone, setShippingZone] = useState<ShippingZone>('SocTrangCity')

  const shippingFee = fulfillmentMethod === 'Delivery' ? getShippingFee(shippingZone) : 0
  const pointsDiscount = Math.floor(pointsToRedeem / 100) * 10_000
  const previewTotal = Math.max(0, productTotal - promoDiscount - pointsDiscount + shippingFee)

  const maxRedeemablePoints = useMemo(() => {
    if (!customerProfile) return 0
    const subtotalAfterPromo = Math.max(0, productTotal - promoDiscount)
    const maxBySubtotal = Math.floor(subtotalAfterPromo / 10_000) * 100
    const capped = Math.min(customerProfile.loyaltyPoints, maxBySubtotal)
    return capped - (capped % 100)
  }, [customerProfile, productTotal, promoDiscount])

  useEffect(() => {
    if (pointsToRedeem > maxRedeemablePoints) setPointsToRedeem(maxRedeemablePoints)
  }, [maxRedeemablePoints, pointsToRedeem])

  const applyPromo = async () => {
    if (!promoCode.trim()) return
    const result = await validatePromotion(promoCode.trim(), productTotal)
    setPromoDiscount(result.isValid ? result.discountAmount : 0)
    setPromoMessage(result.isValid ? `Áp dụng: ${result.promotionName}` : result.message)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const form = new FormData(e.currentTarget)
    const deliveryAddress =
      fulfillmentMethod === 'Delivery' ? String(form.get('deliveryAddress') ?? '').trim() : null

    if (fulfillmentMethod === 'Delivery' && !deliveryAddress) {
      setError('Vui lòng nhập địa chỉ giao hàng.')
      setSubmitting(false)
      return
    }

    if (fulfillmentMethod === 'Delivery' && !shippingZone) {
      setError('Vui lòng chọn khu vực giao hàng.')
      setSubmitting(false)
      return
    }

    const request: CreateOrderRequest = {
      customerName: String(form.get('customerName') ?? '').trim(),
      customerPhone: String(form.get('customerPhone') ?? '').trim(),
      customerEmail: String(form.get('customerEmail') ?? '').trim() || null,
      notes: String(form.get('notes') ?? '').trim() || null,
      promoCode: promoDiscount > 0 ? promoCode.trim() : null,
      pointsToRedeem: user ? pointsToRedeem : 0,
      paymentMethod,
      fulfillmentMethod,
      deliveryAddress,
      shippingZone: fulfillmentMethod === 'Delivery' ? shippingZone : null,
      items: productItems.map((item) => ({
        itemId: item.itemId,
        itemType: 'Product' as const,
        quantity: item.quantity,
        hairSize: null,
      })),
    }

    try {
      const order = await createOrder(request)
      clearCart()
      onSuccess(order)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo đơn hàng')
    } finally {
      setSubmitting(false)
    }
  }

  if (productItems.length === 0) {
    return (
      <div className="rounded-sm border border-edge p-6 text-sm text-ink-subtle">
        Giỏ chỉ dành cho sản phẩm Moroccanoil.{' '}
        <Link to="/shop" className="text-gold-500 hover:underline">
          Xem sản phẩm
        </Link>
        {' · '}
        Dịch vụ vui lòng{' '}
        <Link to="/appointment" className="text-gold-500 hover:underline">
          đặt lịch
        </Link>
        .
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-lenis-prevent>
      <h2 className="font-serif text-2xl text-ink-secondary">Thông tin đặt hàng</h2>

      {!user && (
        <p className="text-sm text-ink-subtle">
          <Link to="/login" className="text-gold-500 hover:underline">
            Đăng nhập
          </Link>{' '}
          để dùng điểm tích lũy.
        </p>
      )}

      {error && <ApiErrorState message={error} />}

      <Field
        label="Họ tên"
        name="customerName"
        required
        defaultValue={customerProfile?.name}
        placeholder="Nguyễn Văn A"
      />
      <Field
        label="Số điện thoại"
        name="customerPhone"
        type="tel"
        required
        defaultValue={customerProfile?.phone}
        placeholder="0901 234 567"
      />
      <Field
        label="Email"
        name="customerEmail"
        type="email"
        defaultValue={customerProfile?.email ?? user?.email ?? ''}
        placeholder="email@example.com"
      />

      <fieldset className="space-y-3">
        <legend className="mb-2 block text-xs uppercase tracking-widest text-ink-subtle">
          Nhận hàng
        </legend>
        {(['Pickup', 'Delivery'] as FulfillmentMethod[]).map((method) => (
          <label
            key={method}
            className={`flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-3 transition ${
              fulfillmentMethod === method
                ? 'border-gold-500/40 bg-gold-500/5'
                : 'border-edge hover:border-edge-strong'
            }`}
          >
            <input
              type="radio"
              name="fulfillmentMethod"
              value={method}
              checked={fulfillmentMethod === method}
              onChange={() => setFulfillmentMethod(method)}
              className="mt-1"
            />
            <span className="text-sm text-ink-secondary">{FULFILLMENT_METHOD_LABELS[method]}</span>
          </label>
        ))}
      </fieldset>

      {fulfillmentMethod === 'Delivery' && (
        <>
          <fieldset className="space-y-3">
            <legend className="mb-2 block text-xs uppercase tracking-widest text-ink-subtle">
              Khu vực giao hàng
            </legend>
            {SHIPPING_ZONES.map((zone) => (
              <label
                key={zone.zone}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-sm border px-4 py-3 transition ${
                  shippingZone === zone.zone
                    ? 'border-gold-500/40 bg-gold-500/5'
                    : 'border-edge hover:border-edge-strong'
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingZone"
                    value={zone.zone}
                    checked={shippingZone === zone.zone}
                    onChange={() => setShippingZone(zone.zone)}
                  />
                  <span className="text-sm text-ink-secondary">{zone.label}</span>
                </span>
                <span className="text-sm tabular-nums text-ink-muted">{formatVnd(zone.fee)}</span>
              </label>
            ))}
          </fieldset>
          <div>
            <label htmlFor="deliveryAddress" className="mb-2 block text-xs uppercase tracking-widest text-ink-subtle">
              Địa chỉ giao hàng
            </label>
            <textarea
              id="deliveryAddress"
              name="deliveryAddress"
              required
              rows={3}
              className="w-full resize-none border-b border-edge bg-transparent py-3 text-ink-secondary outline-none focus:border-gold"
              placeholder="Số nhà, đường, phường/xã, tỉnh/thành..."
            />
          </div>
        </>
      )}

      <fieldset className="space-y-3">
        <legend className="mb-2 block text-xs uppercase tracking-widest text-ink-subtle">
          Thanh toán
        </legend>
        {(['BankTransfer', 'COD'] as PaymentMethod[]).map((method) => (
          <label
            key={method}
            className={`flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-3 transition ${
              paymentMethod === method
                ? 'border-gold-500/40 bg-gold-500/5'
                : 'border-edge hover:border-edge-strong'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method}
              checked={paymentMethod === method}
              onChange={() => setPaymentMethod(method)}
              className="mt-1"
            />
            <span className="text-sm text-ink-secondary">{PAYMENT_METHOD_LABELS[method]}</span>
          </label>
        ))}
        {paymentMethod === 'BankTransfer' && (
          <p className="text-xs text-ink-subtle">
            Quét QR chuyển khoản — salon xác nhận sau khi nhận tiền (giữ tồn 15 phút).{' '}
            <Link to="/chinh-sach-thanh-toan" className="text-gold-700 hover:text-gold-300 hover:underline">
              Chính sách thanh toán
            </Link>
          </p>
        )}
        {paymentMethod === 'COD' && (
          <p className="text-xs text-ink-subtle">
            Salon gọi xác nhận — trả tiền khi nhận hàng (giữ tồn 48 giờ).{' '}
            <Link to="/chinh-sach-thanh-toan" className="text-gold-700 hover:text-gold-300 hover:underline">
              Chính sách thanh toán
            </Link>
          </p>
        )}
      </fieldset>

      {fulfillmentMethod === 'Delivery' && (
        <FormLegalNotice
          preface="Phí giao và điều kiện đổi trả được mô tả trong chính sách (một số mục đang hoàn thiện)."
          links={[{ to: '/chinh-sach-giao-hang-doi-tra', label: 'Giao hàng & đổi trả' }]}
        />
      )}

      <div>
        <label className="mb-2 block text-xs uppercase tracking-widest text-ink-subtle">Mã khuyến mãi</label>
        <div className="flex gap-2">
          <input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="WELCOME10"
            className="min-w-0 flex-1 border-b border-edge bg-transparent py-3 text-ink-secondary outline-none focus:border-gold"
          />
          <button type="button" onClick={applyPromo} className="shrink-0 text-xs uppercase tracking-widest text-gold-500">
            Áp dụng
          </button>
        </div>
        {promoMessage && <p className="mt-2 text-xs text-ink-subtle">{promoMessage}</p>}
      </div>

      {user && customerProfile && customerProfile.loyaltyPoints >= 100 && (
        <div>
          <label htmlFor="points" className="mb-2 block text-xs uppercase tracking-widest text-ink-subtle">
            Đổi điểm (có {customerProfile.loyaltyPoints} điểm)
          </label>
          <input
            id="points"
            type="range"
            min={0}
            max={maxRedeemablePoints}
            step={100}
            value={pointsToRedeem}
            onChange={(e) => setPointsToRedeem(Number(e.target.value))}
            className="w-full"
          />
          <p className="mt-1 text-xs text-ink-subtle">
            Dùng {pointsToRedeem} điểm → giảm {formatVnd(pointsDiscount)}
          </p>
        </div>
      )}

      <div className="rounded-sm border border-edge p-4 text-sm">
        <div className="flex justify-between text-ink-subtle">
          <span>Tạm tính</span>
          <span>{formatVnd(productTotal)}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="mt-2 flex justify-between text-success">
            <span>Khuyến mãi</span>
            <span>-{formatVnd(promoDiscount)}</span>
          </div>
        )}
        {pointsDiscount > 0 && (
          <div className="mt-2 flex justify-between text-gold-700">
            <span>Đổi điểm</span>
            <span>-{formatVnd(pointsDiscount)}</span>
          </div>
        )}
        {shippingFee > 0 && (
          <div className="mt-2 flex justify-between text-ink-muted">
            <span>Phí giao hàng</span>
            <span>+{formatVnd(shippingFee)}</span>
          </div>
        )}
        <div className="mt-3 flex justify-between border-t border-edge pt-3 font-serif text-lg text-ink-secondary">
          <span>Tổng thanh toán</span>
          <span>{formatVnd(previewTotal)}</span>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-2 block text-xs uppercase tracking-widest text-ink-subtle">
          Ghi chú
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="w-full resize-none border-b border-edge bg-transparent py-3 text-ink-secondary outline-none focus:border-gold"
          placeholder="Giờ giao hàng, yêu cầu đặc biệt..."
        />
      </div>

      <FormLegalNotice
        preface="Kiểm tra lại sản phẩm, địa chỉ và tổng tiền trước khi gửi đơn."
        links={[
          { to: '/dieu-khoan-giao-dich', label: 'Điều khoản giao dịch' },
          { to: '/chinh-sach-thanh-toan', label: 'Thanh toán' },
          { to: '/chinh-sach-giao-hang-doi-tra', label: 'Giao hàng & đổi trả' },
        ]}
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gold-500 py-4 text-xs font-medium uppercase tracking-[0.3em] text-canvas transition hover:bg-gold-500 disabled:opacity-50"
      >
        {submitting
          ? 'Đang xử lý...'
          : paymentMethod === 'BankTransfer'
            ? 'Xác nhận & Thanh toán QR'
            : 'Đặt hàng COD'}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  defaultValue?: string | null
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-xs uppercase tracking-widest text-ink-subtle">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        className="w-full border-b border-edge bg-transparent py-3 text-ink-secondary outline-none focus:border-gold"
      />
    </div>
  )
}
