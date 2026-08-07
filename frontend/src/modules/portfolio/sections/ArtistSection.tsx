import { useEffect, useRef } from 'react'
import { gsap } from '@/shared/lib/gsap'
import { ARTIST_STATEMENT } from '../data/content'

export function ArtistSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from('.artist-heading', {
        y: 60,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
        },
      })

      gsap.from('.artist-bio', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
        },
      })

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

  const marqueeText = ARTIST_STATEMENT.join('  ·  ')

  return (
    <section
      ref={sectionRef}
      id="artist"
      className="relative overflow-hidden border-t border-zinc-900 py-32 md:py-48"
    >
      <div className="mx-auto max-w-4xl px-6">
        <p className="artist-heading mb-4 text-xs uppercase tracking-[0.35em] text-gold-muted">
          The Artist
        </p>
        <h2 className="artist-heading font-serif text-4xl leading-tight text-zinc-100 md:text-6xl">
          Nghệ thuật trên từng<span className="italic text-gold"> sợi tóc</span>
        </h2>
        <p className="artist-bio mt-8 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
          Mr. Trang Trần — Master Stylist với hơn một thập kỷ kinh nghiệm trong
          nghệ thuật tạo kiểu editorial. Mỗi tác phẩm là sự kết hợp giữa kỹ thuật
          thuần túy và cảm hứng thời trang, biến mái tóc thành canvas sống động.
        </p>
      </div>

      <div className="artist-marquee mt-20 overflow-hidden whitespace-nowrap">
        <div className="artist-marquee-track inline-flex will-change-transform">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="inline-block px-8 font-serif text-5xl italic text-zinc-800 md:text-7xl"
              aria-hidden={i === 1}
            >
              {marqueeText}&nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
