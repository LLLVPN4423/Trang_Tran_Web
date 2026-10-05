import { Link } from 'react-router-dom'
import { useCartStore } from '@/shared/store/cartStore'
import { selectCartSubtotal } from '@/shared/store/cartSelectors'
import { formatVnd } from '@/shared/api/types'

export function CartSummary() {
  const items = useCartStore((s) => s.items)
  const removeLine = useCartStore((s) => s.removeLine)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const productTotal = useCartStore(selectCartSubtotal)

  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-zinc-800 p-8 text-center">
        <p className="text-zinc-500">Giỏ sản phẩm trống.</p>
        <Link
          to="/shop"
          className="mt-4 inline-block text-sm text-gold-muted underline-offset-4 hover:underline"
        >
          Mua Moroccanoil →
        </Link>
        <p className="mt-4 text-xs text-zinc-600">
          Dịch vụ cắt/nhuộm —{' '}
          <Link to="/appointment" className="text-gold-muted hover:text-gold">
            đặt lịch dịch vụ
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-serif text-2xl text-zinc-200">Sản phẩm</h2>
        <p className="text-xs text-zinc-600">Moroccanoil · thanh toán online</p>
      </div>
      <ul className="divide-y divide-zinc-800/80">
        {items.map((item) => (
          <li key={item.cartLineId} className="flex flex-col gap-3 py-4 sm:flex-row sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-200">{item.name}</p>
              <p className="text-xs text-zinc-500">{formatVnd(item.unitPrice)} / sp</p>
            </div>

            <div className="flex items-start justify-between gap-3 sm:items-center">
              <QuantityControl
                value={item.quantity}
                onChange={(q) => setQuantity(item.cartLineId, q)}
              />
              <button
                type="button"
                onClick={() => removeLine(item.cartLineId)}
                className="text-xs text-zinc-600 hover:text-red-400"
                aria-label="Xóa"
              >
                ✕
              </button>
              <p className="min-w-24 text-right text-sm text-zinc-300 sm:ml-auto">
                {formatVnd(item.unitPrice * item.quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-between border-t border-zinc-800 pt-4">
        <span className="text-sm uppercase tracking-widest text-zinc-500">Tạm tính</span>
        <span className="font-serif text-xl text-gold">{formatVnd(productTotal)}</span>
      </div>
    </div>
  )
}

function QuantityControl({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center border border-zinc-800">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="px-2 py-1 text-zinc-500 hover:text-zinc-300"
      >
        −
      </button>
      <span className="min-w-[2rem] text-center text-sm">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="px-2 py-1 text-zinc-500 hover:text-zinc-300"
      >
        +
      </button>
    </div>
  )
}
