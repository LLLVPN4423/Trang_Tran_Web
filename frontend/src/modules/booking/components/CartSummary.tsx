import { useEffect } from 'react'
import { useCartStore } from '@/shared/store/cartStore'
import { fetchServices } from '@/shared/api/endpoints'
import { formatVnd, HAIR_SIZES, type HairSize } from '@/shared/api/types'
import { Link } from 'react-router-dom'

export function CartSummary() {
  const items = useCartStore((s) => s.items)
  const removeLine = useCartStore((s) => s.removeLine)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const updateHairSize = useCartStore((s) => s.updateHairSize)
  const hydrateServicePricing = useCartStore((s) => s.hydrateServicePricing)
  const estimatedTotal = useCartStore((s) => s.estimatedTotal())

  useEffect(() => {
    const needsPricing = items.some((i) => i.itemType === 'Service' && !i.priceBySize)
    if (!needsPricing) return
    fetchServices()
      .then(hydrateServicePricing)
      .catch(() => {
        /* giỏ vẫn hiện, chỉ thiếu nút đổi size */
      })
  }, [items, hydrateServicePricing])

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
        {items.map((item) => {
          const sizeOptions = getSizeOptions(item.priceBySize)
          return (
            <li key={item.cartLineId} className="flex flex-col gap-3 py-4 sm:flex-row sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-200">{item.name}</p>
                <p className="text-xs text-zinc-500">{formatVnd(item.unitPrice)} / lượt</p>

                {sizeOptions.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-[0.625rem] uppercase tracking-[0.2em] text-zinc-600">
                      Độ dài tóc
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updateHairSize(item.cartLineId, size)}
                          className={`min-w-10 px-3 py-1.5 text-[0.6875rem] uppercase tracking-[0.2em] transition ${
                            item.hairSize === size
                              ? 'bg-gold/15 text-gold ring-1 ring-gold/30'
                              : 'border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {item.itemType === 'Service' && sizeOptions.length === 0 && (
                  <p className="mt-2 text-xs text-zinc-600">Giá cố định</p>
                )}
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
          )
        })}
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

function getSizeOptions(priceBySize: Record<string, number> | null | undefined): HairSize[] {
  if (!priceBySize) return []
  return HAIR_SIZES.filter((size) => priceBySize[size] != null)
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
