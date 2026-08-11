import { useEffect, useRef } from 'react'
import { gsap } from '@/shared/lib/gsap'
import { LOOKBOOK_ITEMS } from '../data/content'

const TILE_CLASS = {
  tall: 'col-span-1 aspect-[3/4] sm:aspect-[4/5] lg:row-span-2 lg:aspect-auto lg:min-h-[420px]',
  wide: 'col-span-2 aspect-[16/10]',
  square: 'col-span-1 aspect-[4/5]',
} as const

export function LookbookSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      gsap.from('.lookbook-heading', {
        y: 36,
        opacity: 0,
        duration: 0.75,
        scrollTrigger: { trigger: section, start: 'top 78%' },
      })

      if (reducedMotion) return

      section.querySelectorAll<HTMLElement>('.lookbook-item').forEach((item) => {
        const speed = parseFloat(item.dataset.speed ?? '0.1')
        gsap.to(item, {
          y: speed * -80,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="lookbook" className="section-shell">
      <div className="section-inner-wide">
        <p className="lookbook-heading section-eyebrow">Salon Tour</p>
        <h2 className="lookbook-heading section-title">Lookbook</h2>

        <div className="mt-12 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-flow-dense lg:grid-cols-3 lg:gap-4">
          {LOOKBOOK_ITEMS.map((item, index) => (
            <article
              key={item.id}
              data-speed={item.speed}
              className={`lookbook-item group relative overflow-hidden rounded-sm will-change-transform ${TILE_CLASS[item.aspect]}`}
            >
              <img
                src={encodeURI(item.image)}
                alt={item.label}
                className="media-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading={index < 4 ? 'eager' : 'lazy'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <span className="label-caps text-gold-muted/90">
                  {String(index + 1).padStart(2, '0')}
                </span>
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
