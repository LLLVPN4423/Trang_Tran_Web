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
    <article className="group flex h-full flex-col justify-between border border-zinc-800/70 bg-zinc-950/40 p-4 transition hover:border-zinc-700/90 sm:p-5">
      <Link to={`/catalog/service/${service.id}`} className="block flex-1">
        <div className="media-frame mb-4 aspect-[4/3] w-full">
          {thumb ? (
            <img
              src={resolveProductImageUrl(thumb)}
              alt={service.name}
              className="media-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-900/60">
              <span className="label-caps text-zinc-600">Chưa có ảnh</span>
            </div>
          )}
        </div>

        <p className="section-eyebrow mb-2">{CATEGORY_LABELS[service.category]}</p>
        <h3 className="font-serif text-xl leading-snug text-zinc-100 transition group-hover:text-gold md:text-2xl">
          {service.name}
        </h3>

        {service.stylistLevel && (
          <p className="mt-1 text-xs text-zinc-600">{STYLIST_LABELS[service.stylistLevel]}</p>
        )}

        {service.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">{service.description}</p>
        )}

        <p className="mt-3 text-xs text-zinc-600">
          {service.durationMinutes ? `~${service.durationMinutes} phút` : null}
          {service.durationMinutes && gallery.length > 0 ? ' · ' : null}
          {gallery.length > 0 && `${gallery.length} ảnh`}
          {service.videoUrl && `${gallery.length > 0 ? ' · ' : ''}Có video`}
        </p>
      </Link>

      <div className="mt-5 space-y-4 border-t border-zinc-800/60 pt-4">
        <div>
          <p className="font-serif text-lg tabular-nums text-zinc-200 md:text-xl">{displayPrice}</p>
          {needsSize && (
            <p className="mt-1 text-[0.625rem] uppercase tracking-[0.2em] text-zinc-600">
              Chọn size để xem giá cụ thể
            </p>
          )}
        </div>

        {needsSize && service.priceBySize && (
          <div>
            <p className="text-[0.625rem] uppercase tracking-[0.2em] text-zinc-600">Size tóc</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {HAIR_SIZES.filter((size) => service.priceBySize?.[size] != null).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setHairSize(size)}
                  className={`min-w-10 px-3 py-1.5 text-[0.625rem] uppercase tracking-[0.15em] transition ${
                    hairSize === size
                      ? 'bg-gold/15 text-gold ring-1 ring-gold/30'
                      : 'border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm tabular-nums text-zinc-400">
              {formatVnd(service.priceBySize[hairSize] ?? 0)}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Link
            to={`/catalog/service/${service.id}`}
            className="text-xs uppercase tracking-wider text-zinc-500 hover:text-gold"
          >
            Chi tiết
          </Link>

          <div className="flex items-center gap-2">
            {feedback && <span className="text-[0.625rem] text-gold">{feedback}</span>}
            <button type="button" onClick={handleAdd} className="btn-editorial shrink-0 px-4 py-2">
              Thêm
            </button>
          </div>
        </div>

        <p className="text-[0.625rem] uppercase tracking-[0.2em] text-zinc-600">
          Thanh toán tại tiệm · không mua online
        </p>
      </div>
    </article>
  )
}
