import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '@/shared/lib/gsap'
import { fetchServices } from '@/shared/api/endpoints'
import { buildCategoryPriceHighlights } from '@/shared/lib/servicePricing'
import { useSiteContent } from '../SiteContentContext'

export function CatalogSection() {
  const { content } = useSiteContent()
  const sectionRef = useRef<HTMLElement>(null)
  const [highlights, setHighlights] = useState<{ name: string; range: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const services = await fetchServices()
        if (!cancelled) {
          setHighlights(buildCategoryPriceHighlights(services))
        }
      } catch {
        if (!cancelled) setHighlights([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
  }, [highlights.length, loading])

  return (
    <section ref={sectionRef} id="services" className="section-shell">
      <div className="section-inner">
        <p className="catalog-heading section-eyebrow">Catalog & Services</p>
        <h2 className="catalog-heading section-title">Bảng giá</h2>
        <p className="catalog-heading section-lead">{content.contact.note}</p>

        {loading ? (
          <p className="catalog-heading mt-12 text-sm text-zinc-500">Đang tải bảng giá...</p>
        ) : highlights.length === 0 ? (
          <p className="catalog-heading mt-12 text-sm text-zinc-500">
            Xem chi tiết tại{' '}
            <Link to="/catalog" className="text-gold-muted hover:text-gold">
              bảng giá dịch vụ
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-12 divide-y divide-zinc-800/70">
            {highlights.map((service) => (
              <li key={service.name} className="catalog-item group price-row">
                <span className="price-row-name">{service.name}</span>
                <span className="price-row-leader" aria-hidden />
                <span className="price-row-value tabular-nums">{service.range}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="catalog-item mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/catalog" className="btn-editorial">
            Bảng giá dịch vụ
          </Link>
          <Link to="/shop" className="btn-editorial">
            Mua Moroccanoil
          </Link>
        </div>
      </div>
    </section>
  )
}
