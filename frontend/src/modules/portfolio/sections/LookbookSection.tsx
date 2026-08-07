import { useEffect, useRef } from 'react'
import { gsap } from '@/shared/lib/gsap'
import { LOOKBOOK_ITEMS } from '../data/content'

const GRADIENTS = [
  'from-amber-950/80 via-zinc-900 to-zinc-950',
  'from-zinc-800 via-zinc-900 to-black',
  'from-stone-800 via-zinc-900 to-zinc-950',
  'from-neutral-800 via-zinc-900 to-black',
  'from-yellow-950/60 via-zinc-900 to-zinc-950',
  'from-zinc-700 via-zinc-900 to-black',
]

const ASPECT_CLASS = {
  tall: 'row-span-2 min-h-[420px]',
  wide: 'col-span-2 min-h-[280px]',
  square: 'min-h-[320px]',
} as const

export function LookbookSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from('.lookbook-heading', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: section, start: 'top 75%' },
      })

      section.querySelectorAll<HTMLElement>('.lookbook-item').forEach((item) => {
        const speed = parseFloat(item.dataset.speed ?? '0.1')
        gsap.to(item, {
          y: speed * -200,
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
    <section
      ref={sectionRef}
      id="lookbook"
      className="border-t border-zinc-900 px-6 py-32 md:py-48"
    >
      <div className="mx-auto max-w-7xl">
        <p className="lookbook-heading mb-4 text-xs uppercase tracking-[0.35em] text-gold-muted">
          Salon Tour
        </p>
        <h2 className="lookbook-heading font-serif text-4xl text-zinc-100 md:text-6xl">
          Lookbook
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOOKBOOK_ITEMS.map((item, index) => (
            <div
              key={item.id}
              data-speed={item.speed}
              className={`lookbook-item group relative overflow-hidden rounded-sm will-change-transform ${ASPECT_CLASS[item.aspect]}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} transition-transform duration-700 group-hover:scale-105`}
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(201,169,98,0.15),transparent_60%)]" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="text-xs uppercase tracking-[0.25em] text-gold-muted">
                  0{index + 1}
                </span>
                <p className="mt-1 font-serif text-2xl text-zinc-200">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
