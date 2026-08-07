import { useEffect, useRef } from 'react'
import { gsap } from '@/shared/lib/gsap'
import { HERO_IMAGE, SALON_TAGLINE } from '../data/content'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const bg = bgRef.current
    const content = contentRef.current
    if (!section || !bg || !content) return

    const ctx = gsap.context(() => {
      gsap.to(bg, {
        yPercent: 40,
        scale: 1.15,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to(content, {
        yPercent: -20,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.from('.hero-title-line', {
        y: 80,
        opacity: 0,
        duration: 1.4,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3,
      })

      gsap.from('.hero-tagline', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        delay: 0.9,
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen overflow-hidden"
    >
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `
              linear-gradient(to bottom, rgba(9,9,11,0.3) 0%, rgba(9,9,11,0.7) 60%, rgba(9,9,11,1) 100%),
              url('${encodeURI(HERO_IMAGE)}')
            `,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/40 via-transparent to-amber-950/20" />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p className="hero-tagline mb-6 text-xs uppercase tracking-[0.4em] text-gold-muted">
          Hair Salon · Editorial
        </p>
        <h1 className="overflow-hidden">
          <span className="hero-title-line block font-serif text-6xl font-light tracking-wide text-zinc-50 md:text-8xl lg:text-9xl">
            Trang Tran
          </span>
        </h1>
        <p className="hero-tagline mt-6 max-w-md font-serif text-xl italic text-zinc-400 md:text-2xl">
          {SALON_TAGLINE}
        </p>
        <div className="hero-tagline mt-16 animate-pulse">
          <span className="block h-12 w-px bg-gradient-to-b from-gold/60 to-transparent mx-auto" />
        </div>
      </div>
    </section>
  )
}
