import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createOrder, validatePromotion } from '@/shared/api/endpoints'
import type { CreateOrderRequest, OrderResponse } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { useAuth } from '@/shared/auth/AuthProvider'
import { useCartStore } from '@/shared/store/cartStore'
import { ApiErrorState } from '@/shared/components/ApiErrorState'

interface Props {
  onSuccess: (order: OrderResponse) => void
}

export function CheckoutForm({ onSuccess }: Props) {
  const items = useCartStore((s) => s.items)
  const estimatedTotal = useCartStore((s) => s.estimatedTotal())
  const clearCart = useCartStore((s) => s.clearCart)
  const { user, customerProfile } = useAuth()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState<string | null>(null)
  const [pointsToRedeem, setPointsToRedeem] = useState(0)

  const pointsDiscount = Math.floor(pointsToRedeem / 100) * 10_000
  const previewTotal = Math.max(0, estimatedTotal - promoDiscount - pointsDiscount)

  const maxRedeemablePoints = useMemo(() => {
    if (!customerProfile) return 0
    const subtotalAfterPromo = Math.max(0, estimatedTotal - promoDiscount)
    const maxBySubtotal = Math.floor(subtotalAfterPromo / 10_000) * 100
    const capped = Math.min(customerProfile.loyaltyPoints, maxBySubtotal)
    return capped - (capped % 100)
  }, [customerProfile, estimatedTotal, promoDiscount])

  useEffect(() => {
    if (pointsToRedeem > maxRedeemablePoints) setPointsToRedeem(maxRedeemablePoints)
  }, [maxRedeemablePoints, pointsToRedeem])

  const applyPromo = async () => {
    if (!promoCode.trim()) return
    const result = await validatePromotion(promoCode.trim(), estimatedTotal)
    setPromoDiscount(result.isValid ? result.discountAmount : 0)
    setPromoMessage(result.isValid ? `Áp dụng: ${result.promotionName}` : result.message)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const form = new FormData(e.currentTarget)
    const request: CreateOrderRequest = {
      customerName: String(form.get('customerName') ?? '').trim(),
      customerPhone: String(form.get('customerPhone') ?? '').trim(),
      customerEmail: String(form.get('customerEmail') ?? '').trim() || null,
      notes: String(form.get('notes') ?? '').trim() || null,
      promoCode: promoDiscount > 0 ? promoCode.trim() : null,
      pointsToRedeem: user ? pointsToRedeem : 0,
      items: items.map((item) => ({
        itemId: item.itemId,
        itemType: item.itemType,
        quantity: item.quantity,
        hairSize: item.hairSize,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-lenis-prevent>
      <h2 className="font-serif text-2xl text-zinc-200">Thông tin khách hàng</h2>

      {!user && (
        <p className="text-sm text-zinc-500">
          <Link to="/login" className="text-gold hover:underline">Đăng nhập</Link> để dùng điểm tích lũy.
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

      <div>
        <label className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">Mã khuyến mãi</label>
        <div className="flex gap-2">
          <input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="WELCOME10"
            className="min-w-0 flex-1 border-b border-zinc-800 bg-transparent py-3 text-zinc-200 outline-none focus:border-gold"
          />
          <button type="button" onClick={applyPromo} className="shrink-0 text-xs uppercase tracking-widest text-gold">
            Áp dụng
          </button>
        </div>
        {promoMessage && <p className="mt-2 text-xs text-zinc-500">{promoMessage}</p>}
      </div>

      {user && customerProfile && customerProfile.loyaltyPoints >= 100 && (
        <div>
          <label htmlFor="points" className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
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
          <p className="mt-1 text-xs text-zinc-500">
            Dùng {pointsToRedeem} điểm → giảm {formatVnd(pointsDiscount)}
          </p>
        </div>
      )}

      <div className="rounded-sm border border-zinc-800 p-4 text-sm">
        <div className="flex justify-between text-zinc-500">
          <span>Tạm tính</span>
          <span>{formatVnd(estimatedTotal)}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="mt-2 flex justify-between text-emerald-400">
            <span>Khuyến mãi</span>
            <span>-{formatVnd(promoDiscount)}</span>
          </div>
        )}
        {pointsDiscount > 0 && (
          <div className="mt-2 flex justify-between text-gold-muted">
            <span>Đổi điểm</span>
            <span>-{formatVnd(pointsDiscount)}</span>
          </div>
        )}
        <div className="mt-3 flex justify-between border-t border-zinc-800 pt-3 font-serif text-lg text-zinc-200">
          <span>Tổng thanh toán</span>
          <span>{formatVnd(previewTotal)}</span>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
          Ghi chú
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="w-full resize-none border-b border-zinc-800 bg-transparent py-3 text-zinc-200 outline-none focus:border-gold"
          placeholder="Yêu cầu đặc biệt..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gold/90 py-4 text-xs font-medium uppercase tracking-[0.3em] text-zinc-950 transition hover:bg-gold disabled:opacity-50"
      >
        {submitting ? 'Đang xử lý...' : 'Xác nhận & Thanh toán SePay'}
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
      <label htmlFor={name} className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        className="w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200 outline-none focus:border-gold"
      />
    </div>
  )
}
