import { useEffect, useRef } from 'react'
import { gsap } from '@/shared/lib/gsap'
import { resolveProductImageUrl } from '@/shared/lib/productMedia'
import { useSiteContent } from '../SiteContentContext'

export function ArtistSection() {
  const { content } = useSiteContent()
  const { artist } = content
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      gsap.from('.artist-heading', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        scrollTrigger: { trigger: section, start: 'top 78%' },
      })

      gsap.from('.artist-bio', {
        y: 28,
        opacity: 0,
        duration: 0.75,
        scrollTrigger: { trigger: section, start: 'top 65%' },
      })

      gsap.from('.artist-photo', {
        y: 36,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: 'top 68%' },
      })

      if (reducedMotion) return

      const marquee = section.querySelector('.artist-marquee-track')
      if (marquee) {
        gsap.fromTo(
          marquee,
          { xPercent: 0 },
          {
            xPercent: -50,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          },
        )
      }
    }, section)

    return () => ctx.revert()
  }, [])

  const marqueeText = artist.statementLines.join('  ·  ')

  return (
    <section ref={sectionRef} id="artist" className="section-shell relative overflow-hidden">
      <div className="section-inner grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div>
          <p className="artist-heading section-eyebrow">{artist.eyebrow}</p>
          <h2 className="artist-heading section-title">
            {artist.heading}
            <span className="italic text-gold">{artist.headingAccent}</span>
          </h2>
          <p className="artist-bio section-body mt-6 max-w-xl">{artist.bio}</p>
        </div>

        <div className="artist-photo relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="media-frame aspect-[4/5] w-full">
            <img
              src={resolveProductImageUrl(artist.mainImageUrl)}
              alt="Mr. Trang Trần — Master Stylist"
              referrerPolicy="no-referrer"
              className="media-cover"
              loading="lazy"
            />
          </div>
          <div className="media-frame absolute -bottom-5 -right-1 w-[38%] shadow-2xl sm:-right-4 sm:w-[40%]">
            <img
              src={resolveProductImageUrl(artist.secondaryImageUrl)}
              alt="Trang Tran Hair — nghệ thuật tạo kiểu"
              referrerPolicy="no-referrer"
              className="aspect-[3/4] w-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {marqueeText.trim() && (
        <div className="artist-marquee mt-16 overflow-hidden whitespace-nowrap md:mt-20">
          <div className="artist-marquee-track inline-flex will-change-transform">
            {[0, 1].map((i) => (
              <span
                key={i}
                className="inline-block px-6 font-serif text-4xl italic text-zinc-800/90 md:text-6xl"
                aria-hidden={i === 1}
              >
                {marqueeText}&nbsp;&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
