import { useState } from 'react'
import { getProductGallery, resolveProductImageUrl } from '@/shared/lib/productMedia'

interface Props {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: Props) {
  const gallery = images.slice(0, 7)
  const [active, setActive] = useState(0)

  if (gallery.length === 0) {
    return (
      <div className="media-frame aspect-[4/5] w-full bg-elevated/60">
        <div className="flex h-full items-center justify-center">
          <span className="label-caps text-ink-subtle">Chưa có ảnh</span>
        </div>
      </div>
    )
  }

  const activeIndex = Math.min(active, gallery.length - 1)

  return (
    <div className="space-y-3">
      <div className="media-frame aspect-[4/5] w-full overflow-hidden bg-elevated/40">
        <img
          src={resolveProductImageUrl(gallery[activeIndex])}
          alt={`${alt} — ảnh ${activeIndex + 1}`}
          className="media-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`h-16 w-16 shrink-0 overflow-hidden border transition sm:h-20 sm:w-20 ${
                index === activeIndex
                  ? 'border-gold ring-1 ring-gold-500/40'
                  : 'border-edge opacity-70 hover:border-edge-strong hover:opacity-100'
              }`}
            >
              <img
                src={resolveProductImageUrl(src)}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-ink-subtle">
        {gallery.length} ảnh{gallery.length < 7 ? '' : ' (tối đa 7)'}
      </p>
    </div>
  )
}

export function ProductGalleryFromProduct({
  product,
}: {
  product: { imageUrl: string | null; galleryUrls: string[]; name: string }
}) {
  return <ProductGallery images={getProductGallery(product)} alt={product.name} />
}
