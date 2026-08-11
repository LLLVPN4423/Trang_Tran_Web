import { useEffect, useRef } from 'react'
import { gsap } from '@/shared/lib/gsap'
import { GALLERY_ITEMS } from '../data/content'

export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from('.gallery-heading', {
        y: 36,
        opacity: 0,
        duration: 0.75,
        scrollTrigger: { trigger: section, start: 'top 78%' },
      })

      gsap.from('.gallery-item', {
        y: 24,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        scrollTrigger: { trigger: section, start: 'top 70%' },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  if (GALLERY_ITEMS.length === 0) return null

  return (
    <section ref={sectionRef} id="gallery" className="section-shell">
      <div className="section-inner-wide">
        <p className="gallery-heading section-eyebrow">Portfolio</p>
        <h2 className="gallery-heading section-title">Tóc mẫu</h2>
        <p className="gallery-heading section-lead max-w-2xl">
          Balayage, precision cut và các phong cách signature tại Trang Tran Hair.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 lg:gap-4">
          {GALLERY_ITEMS.map((item, index) => (
            <article
              key={item.id}
              className="gallery-item group relative aspect-[4/5] overflow-hidden rounded-sm"
            >
              <img
                src={encodeURI(item.image)}
                alt={item.label}
                className="media-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading={index < 3 ? 'eager' : 'lazy'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                {item.category && (
                  <span className="label-caps text-gold-muted/90">{item.category}</span>
                )}
                <p className="mt-1 font-serif text-lg leading-snug text-zinc-100 sm:text-xl">
                  {item.label}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
