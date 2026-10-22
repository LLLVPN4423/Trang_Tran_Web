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
      <div className="rounded-sm border border-edge p-8 text-center">
        <p className="text-ink-subtle">Chưa chọn dịch vụ nào.</p>
        <Link
          to="/catalog"
          className="mt-4 inline-block text-sm text-gold-700 underline-offset-4 hover:underline"
        >
          Xem bảng giá dịch vụ →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-serif text-2xl text-ink-secondary">Dịch vụ đã chọn</h2>
        <p className="text-xs text-ink-subtle">Thanh toán tại tiệm · giá tham khảo</p>
      </div>

      <ul className="divide-y divide-edge/80">
        {items.map((item) => (
          <li key={item.cartLineId} className="flex gap-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink-secondary">{item.name}</p>
              <p className="mt-1 text-xs text-ink-subtle">{CATEGORY_LABELS[item.category]}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
                {item.hairSize && <span>Size {item.hairSize}</span>}
                {item.durationMinutes ? <span>~{item.durationMinutes} phút</span> : null}
              </div>
              <p className="mt-2 text-sm tabular-nums text-ink-secondary">{item.priceLabel}</p>
              {item.priceRangeLabel && (
                <p className="mt-1 text-xs text-ink-subtle">Khoảng giá: {item.priceRangeLabel}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeLine(item.cartLineId)}
              className="shrink-0 self-start text-xs text-ink-subtle hover:text-danger"
              aria-label="Xóa dịch vụ"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="flex justify-between border-t border-edge pt-4">
        <span className="text-sm uppercase tracking-widest text-ink-subtle">Ước tính</span>
        <span className="font-serif text-xl text-gold-500">{formatVnd(estimate)}</span>
      </div>

      <p className="text-xs leading-relaxed text-ink-subtle">
        Giá trên chỉ mang tính tham khảo. Salon sẽ tư vấn và chốt giá khi bạn đến tiệm.
      </p>

      <Link
        to="/catalog"
        className="inline-block text-xs uppercase tracking-widest text-ink-subtle hover:text-gold-300"
      >
        + Thêm dịch vụ khác
      </Link>
    </div>
  )
}
