import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getProductGallery,
  parseProductVideoUrl,
  resolveProductImageUrl,
  type ProductVideoEmbed,
} from '@/shared/lib/productMedia'

interface Props {
  images: string[]
  alt: string
  /** Nếu có video — hiện đầu tiên trong gallery (kiểu Shopee/Lazada). */
  videoUrl?: string | null
  /** Tỉ lệ khung chính; dịch vụ dùng gần vuông, SP Moroccanoil giữ 4/5. */
  aspectClassName?: string
}

type MediaItem =
  | { kind: 'video'; parsed: ProductVideoEmbed }
  | { kind: 'image'; src: string }

const SWIPE_MIN_PX = 48

function VideoSlide({
  parsed,
  title,
  unlocked,
}: {
  parsed: ProductVideoEmbed
  title: string
  unlocked: boolean
}) {
  if (parsed.kind === 'drive' || parsed.kind === 'youtube') {
    return (
      <iframe
        src={parsed.embedUrl}
        title={`Video ${title}`}
        className={`h-full w-full ${unlocked ? '' : 'pointer-events-none'}`}
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    )
  }

  if (parsed.kind === 'mp4') {
    return (
      <video
        src={parsed.src}
        controls={unlocked}
        className={`h-full w-full object-contain ${unlocked ? '' : 'pointer-events-none'}`}
        preload="metadata"
        playsInline
      >
        Trình duyệt không hỗ trợ video.
      </video>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-elevated/60 px-4 text-center">
      <span className="label-caps text-ink-subtle">Video</span>
      <a
        href={parsed.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gold-700 hover:text-gold-300 hover:underline"
      >
        Xem video (TikTok / link ngoài) →
      </a>
    </div>
  )
}

function VideoThumb() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-black">
      <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <span
        className="relative flex h-7 w-7 items-center justify-center rounded-full border border-gold-500/70 bg-black/55 text-[0.55rem] text-gold-300"
        aria-hidden
      >
        ▶
      </span>
    </div>
  )
}

export function ProductGallery({
  images,
  alt,
  videoUrl = null,
  aspectClassName = 'aspect-[4/5]',
}: Props) {
  const gallery = useMemo(() => images.slice(0, 7), [images])
  const parsedVideo = useMemo(() => parseProductVideoUrl(videoUrl), [videoUrl])

  const items = useMemo<MediaItem[]>(() => {
    const list: MediaItem[] = []
    if (parsedVideo) list.push({ kind: 'video', parsed: parsedVideo })
    for (const src of gallery) list.push({ kind: 'image', src })
    return list
  }, [parsedVideo, gallery])

  const [active, setActive] = useState(0)
  const [videoUnlocked, setVideoUnlocked] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const activeIndex = items.length === 0 ? 0 : Math.min(active, items.length - 1)

  useEffect(() => {
    setVideoUnlocked(false)
  }, [videoUrl, activeIndex])

  const goTo = (index: number) => {
    if (items.length === 0) return
    const next = Math.max(0, Math.min(index, items.length - 1))
    setActive(next)
    const el = scrollerRef.current
    if (!el) return
    const w = el.clientWidth
    if (w <= 0) return
    el.scrollTo({ left: next * w, behavior: 'smooth' })
  }

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start || items.length < 2) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) goTo(activeIndex + 1)
    else goTo(activeIndex - 1)
  }

  const onScroll = () => {
    const el = scrollerRef.current
    if (!el || items.length === 0) return
    const w = el.clientWidth
    if (w <= 0) return
    const next = Math.round(el.scrollLeft / w)
    if (next !== activeIndex && next >= 0 && next < items.length) setActive(next)
  }

  if (items.length === 0) {
    return (
      <div className={`media-frame ${aspectClassName} w-full bg-elevated/60`}>
        <div className="flex h-full items-center justify-center">
          <span className="label-caps text-ink-subtle">Chưa có ảnh</span>
        </div>
      </div>
    )
  }

  const imageCount = gallery.length
  const hasVideo = Boolean(parsedVideo)
  const current = items[activeIndex]

  return (
    <div className="space-y-3">
      <div
        className={`media-frame relative ${aspectClassName} w-full overflow-hidden bg-black`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={scrollerRef}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={onScroll}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items.map((item, index) => (
            <div
              key={item.kind === 'video' ? 'video' : `${item.src}-${index}`}
              className="relative h-full w-full shrink-0 snap-center snap-always"
            >
              {item.kind === 'video' ? (
                <>
                  <VideoSlide
                    parsed={item.parsed}
                    title={alt}
                    unlocked={videoUnlocked && activeIndex === index}
                  />
                  {!videoUnlocked && activeIndex === index && (
                    <button
                      type="button"
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/25 px-4 text-center"
                      onClick={() => setVideoUnlocked(true)}
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/80 bg-black/60 text-lg text-gold-300">
                        ▶
                      </span>
                      <span className="text-xs text-ink-secondary">Chạm để xem video</span>
                      {items.length > 1 && (
                        <span className="text-[0.65rem] uppercase tracking-widest text-ink-subtle">
                          Vuốt để xem ảnh
                        </span>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <img
                  src={resolveProductImageUrl(item.src)}
                  alt={`${alt} — ảnh ${gallery.indexOf(item.src) + 1}`}
                  className="media-cover pointer-events-none"
                  draggable={false}
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          ))}
        </div>

        {items.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
            {items.map((item, index) => (
              <span
                key={item.kind === 'video' ? 'dot-video' : `dot-${index}`}
                className={`h-1.5 rounded-full transition ${
                  index === activeIndex ? 'w-4 bg-gold-500' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item, index) => (
            <button
              key={item.kind === 'video' ? 'thumb-video' : `thumb-${item.src}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              className={`h-16 w-16 shrink-0 overflow-hidden border transition sm:h-20 sm:w-20 ${
                index === activeIndex
                  ? 'border-gold ring-1 ring-gold-500/40'
                  : 'border-edge opacity-70 hover:border-edge-strong hover:opacity-100'
              }`}
              aria-label={item.kind === 'video' ? 'Video' : `Ảnh ${index + (hasVideo ? 0 : 1)}`}
            >
              {item.kind === 'video' ? (
                <VideoThumb />
              ) : (
                <img
                  src={resolveProductImageUrl(item.src)}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-ink-subtle">
        {items.length > 1 ? 'Vuốt ngang để xem tiếp · ' : null}
        {hasVideo ? 'Video' : null}
        {hasVideo && imageCount > 0 ? ' · ' : null}
        {imageCount > 0 ? `${imageCount} ảnh${imageCount < 7 ? '' : ' (tối đa 7)'}` : null}
        {!hasVideo && imageCount === 0 ? 'Chưa có media' : null}
        {current?.kind === 'video' && items.length > 1 ? ' · Chạm ▶ rồi vuốt sang ảnh' : null}
      </p>
    </div>
  )
}

export function ProductGalleryFromProduct({
  product,
}: {
  product: { imageUrl: string | null; galleryUrls: string[]; videoUrl?: string | null; name: string }
}) {
  return (
    <ProductGallery
      images={getProductGallery(product)}
      alt={product.name}
      videoUrl={product.videoUrl}
    />
  )
}
