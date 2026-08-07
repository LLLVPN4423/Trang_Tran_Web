import { useCartStore } from '@/shared/store/cartStore'
import { formatVnd } from '@/shared/api/types'
import { Link } from 'react-router-dom'

export function CartSummary() {
  const items = useCartStore((s) => s.items)
  const removeLine = useCartStore((s) => s.removeLine)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const estimatedTotal = useCartStore((s) => s.estimatedTotal())

  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-zinc-800 p-8 text-center">
        <p className="text-zinc-500">Giỏ hàng trống.</p>
        <Link
          to="/catalog"
          className="mt-4 inline-block text-sm text-gold-muted underline-offset-4 hover:underline"
        >
          Xem menu →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl text-zinc-200">Giỏ hàng</h2>
      <ul className="divide-y divide-zinc-800/80">
        {items.map((item) => (
          <li key={item.cartLineId} className="flex gap-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-200">{item.name}</p>
              <p className="text-xs text-zinc-500">
                {item.itemType === 'Service' && item.hairSize && `Size ${item.hairSize} · `}
                {formatVnd(item.unitPrice)} / sp
              </p>
            </div>
            <div className="flex items-center gap-3">
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
            </div>
            <p className="w-24 text-right text-sm text-zinc-300">
              {formatVnd(item.unitPrice * item.quantity)}
            </p>
          </li>
        ))}
      </ul>
      <div className="flex justify-between border-t border-zinc-800 pt-4">
        <span className="text-sm uppercase tracking-widest text-zinc-500">Tạm tính</span>
        <span className="font-serif text-xl text-gold">{formatVnd(estimatedTotal)}</span>
      </div>
      <p className="text-xs text-zinc-600">
        * Giá cuối cùng được xác nhận bởi hệ thống khi đặt hàng.
      </p>
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
