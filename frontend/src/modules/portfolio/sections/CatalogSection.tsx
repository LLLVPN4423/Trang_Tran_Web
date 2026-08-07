import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '@/shared/lib/gsap'
import { SERVICE_HIGHLIGHTS, CONTACT } from '../data/content'

export function CatalogSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from('.catalog-heading', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: { trigger: section, start: 'top 75%' },
      })

      gsap.from('.catalog-item', {
        x: -40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 65%' },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="services"
      className="border-t border-zinc-900 px-6 py-32 md:py-48"
    >
      <div className="mx-auto max-w-5xl">
        <p className="catalog-heading mb-4 text-xs uppercase tracking-[0.35em] text-gold-muted">
          Catalog & Services
        </p>
        <h2 className="catalog-heading font-serif text-4xl text-zinc-100 md:text-6xl">
          Bảng giá
        </h2>
        <p className="catalog-heading mt-4 text-sm text-zinc-500">{CONTACT.note}</p>

        <ul className="mt-16 divide-y divide-zinc-800/80">
          {SERVICE_HIGHLIGHTS.map((service) => (
            <li
              key={service.name}
              className="catalog-item group flex items-baseline justify-between gap-4 py-6 md:py-8"
            >
              <span className="font-serif text-2xl text-zinc-200 transition-colors group-hover:text-gold md:text-4xl">
                {service.name}
              </span>
              <span className="shrink-0 text-sm tracking-wide text-zinc-500 md:text-base">
                {service.range}
              </span>
            </li>
          ))}
        </ul>

        <div className="catalog-item mt-12 text-center">
          <Link
            to="/catalog"
            className="inline-block border border-zinc-700 px-8 py-3 text-xs uppercase tracking-[0.3em] text-zinc-400 transition hover:border-gold hover:text-gold"
          >
            Xem toàn bộ menu
          </Link>
        </div>
      </div>
    </section>
  )
}
