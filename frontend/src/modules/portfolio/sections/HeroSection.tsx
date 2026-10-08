import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '@/shared/lib/gsap'
import { resolveProductImageUrl } from '@/shared/lib/productMedia'
import { useSiteContent } from '../SiteContentContext'

export function HeroSection() {
  const { content } = useSiteContent()
  const { hero } = content
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const bg = bgRef.current
    const contentEl = contentRef.current
    if (!section || !bg || !contentEl) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      gsap.to(bg, {
        yPercent: 24,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to(contentEl, {
        yPercent: -12,
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
        y: 48,
        opacity: 0,
        duration: 1.2,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.2,
      })

      gsap.from('.hero-tagline', {
        y: 20,
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        delay: 0.75,
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[100dvh] overflow-hidden"
    >
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        <img
          src={resolveProductImageUrl(hero.imageUrl)}
          alt="Trang Tran Hair Salon"
          fetchPriority="high"
          decoding="async"
          referrerPolicy="no-referrer"
          className="media-cover min-h-[115%] min-w-full object-[center_22%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/35 via-zinc-950/55 to-zinc-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/30 via-transparent to-amber-950/15" />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 pb-16 pt-[calc(var(--header-height)+2rem)] text-center sm:px-8"
      >
        <p className="hero-tagline mb-5 section-eyebrow tracking-[0.36em]">
          {hero.eyebrow}
        </p>
        <h1 className="overflow-hidden">
          <span
            className="hero-title-line block font-serif font-light text-zinc-50"
            style={{ fontSize: 'clamp(2.75rem, 7vw + 0.5rem, 5.5rem)' }}
          >
            {hero.title}
          </span>
        </h1>
        <p
          className="hero-tagline mt-5 max-w-md font-serif italic text-zinc-300/90"
          style={{ fontSize: 'clamp(1.0625rem, 1.5vw + 0.75rem, 1.5rem)' }}
        >
          {hero.tagline}
        </p>
        <div className="hero-tagline mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/catalog" className="btn-gold px-6 py-2.5 text-[10px] uppercase tracking-widest">
            Bảng giá · Sóc Trăng
          </Link>
          <Link
            to="/appointment"
            className="btn-editorial px-6 py-2.5 text-[10px] uppercase tracking-widest"
          >
            Đặt lịch online
          </Link>
        </div>
        <div className="hero-tagline mt-10">
          <span className="mx-auto block h-10 w-px bg-gradient-to-b from-gold/50 to-transparent" />
        </div>
      </div>
    </section>
  )
}
