import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { HairSize, ServiceResponse } from '@/shared/api/types'
import {
  CATEGORY_LABELS,
  formatVnd,
  HAIR_SIZES,
  resolveServicePrice,
  STYLIST_LABELS,
} from '@/shared/api/types'
import { getCatalogGallery, resolveProductImageUrl } from '@/shared/lib/productMedia'
import { useCartStore } from '@/shared/store/cartStore'

interface Props {
  service: ServiceResponse
}

function formatCardPrice(service: ServiceResponse): string {
  if (service.basePrice != null) return formatVnd(service.basePrice)
  if (service.priceBySize) {
    const values = Object.values(service.priceBySize)
    if (values.length === 0) return 'Liên hệ'
    if (values.length === 1) return formatVnd(values[0])
    return `Từ ${formatVnd(Math.min(...values))}`
  }
  return 'Liên hệ'
}

export function ServiceCard({ service }: Props) {
  const addService = useCartStore((s) => s.addService)
  const needsSize = service.basePrice == null && service.priceBySize != null
  const [hairSize, setHairSize] = useState<HairSize>('M')
  const [added, setAdded] = useState(false)
  const gallery = getCatalogGallery(service)
  const thumb = gallery[0]

  const price = needsSize ? resolveServicePrice(service, hairSize) : (service.basePrice ?? 0)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addService(service, needsSize ? hairSize : 'M')
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link
      to={`/catalog/service/${service.id}`}
      className="group flex h-full flex-col justify-between border border-zinc-800/70 bg-zinc-950/40 p-4 transition hover:border-zinc-700/90 sm:p-5"
    >
      <div>
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
      </div>

      <div className="mt-5 space-y-4 border-t border-zinc-800/60 pt-4">
        {needsSize && (
          <div className="flex flex-wrap gap-2" onClick={(e) => e.preventDefault()}>
            {HAIR_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setHairSize(size)
                }}
                className={`min-w-10 px-3 py-1.5 text-[0.6875rem] uppercase tracking-[0.2em] transition ${
                  hairSize === size
                    ? 'bg-gold/15 text-gold ring-1 ring-gold/30'
                    : 'border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <span className="font-serif text-lg tabular-nums text-zinc-200 md:text-xl">
            {needsSize ? formatVnd(price) : formatCardPrice(service)}
          </span>
          <div className="flex shrink-0 gap-2">
            <span className="hidden text-xs uppercase tracking-wider text-zinc-500 group-hover:inline sm:inline">
              Chi tiết
            </span>
            <button type="button" onClick={handleAdd} className="btn-editorial shrink-0 px-4 py-2">
              {added ? 'Đã thêm ✓' : 'Thêm'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
