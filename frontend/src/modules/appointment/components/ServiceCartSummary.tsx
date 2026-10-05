import { Link } from 'react-router-dom'
import { CATEGORY_LABELS, formatVnd } from '@/shared/api/types'
import { useServiceCartStore } from '@/shared/store/serviceCartStore'
import { selectServiceCartEstimate } from '@/shared/store/serviceCartSelectors'

export function ServiceCartSummary() {
  const items = useServiceCartStore((s) => s.items)
  const removeLine = useServiceCartStore((s) => s.removeLine)
  const estimate = useServiceCartStore(selectServiceCartEstimate)

  if (items.length === 0) {
    return (
      <div className="rounded-sm border border-zinc-800 p-8 text-center">
        <p className="text-zinc-500">Chưa chọn dịch vụ nào.</p>
        <Link
          to="/catalog"
          className="mt-4 inline-block text-sm text-gold-muted underline-offset-4 hover:underline"
        >
          Xem bảng giá dịch vụ →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-serif text-2xl text-zinc-200">Dịch vụ đã chọn</h2>
        <p className="text-xs text-zinc-600">Thanh toán tại tiệm · giá tham khảo</p>
      </div>

      <ul className="divide-y divide-zinc-800/80">
        {items.map((item) => (
          <li key={item.cartLineId} className="flex gap-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-200">{item.name}</p>
              <p className="mt-1 text-xs text-zinc-500">{CATEGORY_LABELS[item.category]}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                {item.hairSize && <span>Size {item.hairSize}</span>}
                {item.durationMinutes ? <span>~{item.durationMinutes} phút</span> : null}
              </div>
              <p className="mt-2 text-sm tabular-nums text-zinc-300">{item.priceLabel}</p>
              {item.priceRangeLabel && (
                <p className="mt-1 text-xs text-zinc-600">Khoảng giá: {item.priceRangeLabel}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeLine(item.cartLineId)}
              className="shrink-0 self-start text-xs text-zinc-600 hover:text-red-400"
              aria-label="Xóa dịch vụ"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="flex justify-between border-t border-zinc-800 pt-4">
        <span className="text-sm uppercase tracking-widest text-zinc-500">Ước tính</span>
        <span className="font-serif text-xl text-gold">{formatVnd(estimate)}</span>
      </div>

      <p className="text-xs leading-relaxed text-zinc-600">
        Giá trên chỉ mang tính tham khảo. Salon sẽ tư vấn và chốt giá khi bạn đến tiệm.
      </p>

      <Link
        to="/catalog"
        className="inline-block text-xs uppercase tracking-widest text-zinc-500 hover:text-gold"
      >
        + Thêm dịch vụ khác
      </Link>
    </div>
  )
}
