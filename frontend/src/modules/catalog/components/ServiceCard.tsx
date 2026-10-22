import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { HairSize, ServiceResponse } from '@/shared/api/types'
import {
  CATEGORY_LABELS,
  formatVnd,
  HAIR_SIZES,
  STYLIST_LABELS,
} from '@/shared/api/types'
import {
  formatServiceCardPrice,
  serviceNeedsHairSize,
} from '@/shared/lib/servicePricing'
import { getCatalogGallery, resolveProductImageUrl } from '@/shared/lib/productMedia'
import { useServiceCartStore } from '@/shared/store/serviceCartStore'

interface Props {
  service: ServiceResponse
}

export function ServiceCard({ service }: Props) {
  const addService = useServiceCartStore((s) => s.addService)
  const [hairSize, setHairSize] = useState<HairSize>('M')
  const [feedback, setFeedback] = useState<string | null>(null)

  const needsSize = serviceNeedsHairSize(service)
  const gallery = getCatalogGallery(service)
  const thumb = gallery[0]
  const displayPrice = formatServiceCardPrice(service)

  const handleAdd = () => {
    const result = addService(service, hairSize)
    setFeedback(result === 'duplicate' ? 'Đã có trong danh sách' : 'Đã thêm')
    window.setTimeout(() => setFeedback(null), 2000)
  }

  return (
    <article className="catalog-card group">
      <Link to={`/catalog/service/${service.id}`} className="block min-w-0 flex-1">
        <div className="media-frame mb-2.5 aspect-square w-full sm:mb-4 sm:aspect-[4/3]">
          {thumb ? (
            <img
              src={resolveProductImageUrl(thumb)}
              alt={service.name}
              className="media-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-elevated">
              <span className="label-caps">Chưa có ảnh</span>
            </div>
          )}
        </div>

        <p className="catalog-card-meta">{CATEGORY_LABELS[service.category]}</p>
        <h3 className="catalog-card-title">{service.name}</h3>

        {service.stylistLevel && (
          <p className="mt-1 hidden text-xs text-ink-subtle sm:block">{STYLIST_LABELS[service.stylistLevel]}</p>
        )}

        {service.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted max-sm:hidden">
            {service.description}
          </p>
        )}

        <p className="mt-1.5 text-[0.65rem] text-ink-subtle sm:mt-3 sm:text-xs">
          {service.durationMinutes ? `~${service.durationMinutes} phút` : null}
          {service.durationMinutes && gallery.length > 0 ? ' · ' : null}
          <span className="hidden sm:inline">
            {gallery.length > 0 && `${gallery.length} ảnh`}
            {service.videoUrl && `${gallery.length > 0 ? ' · ' : ''}Có video`}
          </span>
        </p>
      </Link>

      <div className="mt-3 space-y-2.5 border-t border-edge/70 pt-2.5 sm:mt-5 sm:space-y-4 sm:pt-4">
        <div>
          <p className="font-serif text-sm tabular-nums text-ink-secondary sm:text-lg md:text-xl">{displayPrice}</p>
          {needsSize && (
            <p className="mt-1 hidden text-[0.625rem] uppercase tracking-[0.2em] text-ink-subtle sm:block">
              Chọn size để xem giá cụ thể
            </p>
          )}
        </div>

        {needsSize && service.priceBySize && (
          <div>
            <p className="hidden text-[0.625rem] uppercase tracking-[0.2em] text-ink-subtle sm:block">Size tóc</p>
            <div className="flex flex-wrap gap-1 sm:mt-2 sm:gap-1.5">
              {HAIR_SIZES.filter((size) => service.priceBySize?.[size] != null).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setHairSize(size)}
                  className={`min-w-7 px-1.5 py-1 text-[0.6rem] uppercase tracking-[0.12em] sm:min-w-10 sm:px-3 sm:py-1.5 sm:text-[0.625rem] sm:tracking-[0.15em] ${
                    hairSize === size ? 'control-selected' : 'control-idle'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs tabular-nums text-ink-muted sm:mt-2 sm:text-sm">
              {formatVnd(service.priceBySize[hairSize] ?? 0)}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <Link
            to={`/catalog/service/${service.id}`}
            className="hidden text-xs uppercase tracking-wider text-ink-subtle transition hover:text-gold-300 sm:inline"
          >
            Chi tiết
          </Link>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {feedback && <span className="text-[0.6rem] text-gold-500 sm:text-[0.625rem]">{feedback}</span>}
            <button
              type="button"
              onClick={handleAdd}
              className="btn-editorial shrink-0 px-2.5 py-1.5 text-[0.65rem] sm:px-4 sm:py-2 sm:text-xs"
            >
              Thêm
            </button>
          </div>
        </div>

        <p className="hidden text-[0.625rem] uppercase tracking-[0.2em] text-ink-subtle sm:block">
          Thanh toán tại tiệm · không mua online
        </p>
      </div>
    </article>
  )
}
