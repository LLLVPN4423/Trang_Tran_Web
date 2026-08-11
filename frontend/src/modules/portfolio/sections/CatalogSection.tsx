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
        y: 36,
        opacity: 0,
        duration: 0.75,
        scrollTrigger: { trigger: section, start: 'top 78%' },
      })

      gsap.from('.catalog-item', {
        y: 20,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        scrollTrigger: { trigger: section, start: 'top 68%' },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="services" className="section-shell">
      <div className="section-inner">
        <p className="catalog-heading section-eyebrow">Catalog & Services</p>
        <h2 className="catalog-heading section-title">Bảng giá</h2>
        <p className="catalog-heading section-lead">{CONTACT.note}</p>

        <ul className="mt-12 divide-y divide-zinc-800/70">
          {SERVICE_HIGHLIGHTS.map((service) => (
            <li key={service.name} className="catalog-item group price-row">
              <span className="price-row-name">{service.name}</span>
              <span className="price-row-leader" aria-hidden />
              <span className="price-row-value">{service.range}</span>
            </li>
          ))}
        </ul>

        <div className="catalog-item mt-10 text-center">
          <Link to="/catalog" className="btn-editorial">
            Xem toàn bộ menu
          </Link>
        </div>
      </div>
    </section>
  )
}
