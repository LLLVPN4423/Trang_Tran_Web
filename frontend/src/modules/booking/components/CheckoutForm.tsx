import { useState, type FormEvent } from 'react'
import { createOrder } from '@/shared/api/endpoints'
import type { CreateOrderRequest, OrderResponse } from '@/shared/api/types'
import { useCartStore } from '@/shared/store/cartStore'
import { ApiErrorState } from '@/shared/components/ApiErrorState'

interface Props {
  onSuccess: (order: OrderResponse) => void
}

export function CheckoutForm({ onSuccess }: Props) {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      {error && <ApiErrorState message={error} />}

      <Field label="Họ tên" name="customerName" required placeholder="Nguyễn Văn A" />
      <Field label="Số điện thoại" name="customerPhone" type="tel" required placeholder="0901 234 567" />
      <Field label="Email" name="customerEmail" type="email" placeholder="email@example.com" />
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
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
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
        className="w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200 outline-none focus:border-gold"
      />
    </div>
  )
}
