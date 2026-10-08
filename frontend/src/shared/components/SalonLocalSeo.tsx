import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { buildFaqJsonLd } from '@/shared/lib/salonFaq'
import { SALON_PUBLIC, buildHairSalonJsonLd, salonOgImageUrl } from '@/shared/lib/salonPublicInfo'

const JSON_LD_ID = 'salon-json-ld'

const PUBLIC_PATHS = new Set(['/', '/catalog', '/appointment', '/shop', '/booking', '/login', '/register'])

const PAGE_SEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: `${SALON_PUBLIC.nameVi} · Nhuộm, uốn, balayage Sóc Trăng`,
    description: `Salon tóc tại ${SALON_PUBLIC.address}. Đặt lịch online, bảng giá, Moroccanoil. ${SALON_PUBLIC.phoneDisplay}. ${SALON_PUBLIC.openingHours}.`,
  },
  '/catalog': {
    title: `Bảng giá dịch vụ · ${SALON_PUBLIC.nameVi}`,
    description: `Xem giá cắt, uốn, nhuộm, balayage tại Sóc Trăng. Chọn dịch vụ và đặt lịch online — ${SALON_PUBLIC.phoneDisplay}.`,
  },
  '/appointment': {
    title: `Đặt lịch salon · ${SALON_PUBLIC.nameVi}`,
    description: `Gửi lịch làm tóc online tại Tuấn Lan, Hùng Vương, Sóc Trăng. Hotline ${SALON_PUBLIC.phoneDisplay}.`,
  },
  '/shop': {
    title: `Shop Moroccanoil · ${SALON_PUBLIC.nameVi}`,
    description: `Mua Moroccanoil chính hãng — giao hàng, tích điểm. Salon ${SALON_PUBLIC.nameVi}, Sóc Trăng.`,
  },
  '/booking': {
    title: `Thông tin đặt chỗ · ${SALON_PUBLIC.nameVi}`,
    description: `Hướng dẫn đặt lịch và liên hệ salon Sóc Trăng — ${SALON_PUBLIC.address}.`,
  },
}

/** Meta + JSON-LD (HairSalon + FAQ) — miễn phí, hỗ trợ Google & preview khi share link. */
export function SalonLocalSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/admin')) return

    const origin = typeof window !== 'undefined' ? window.location.origin : SALON_PUBLIC.siteUrl
    const seoKey = PUBLIC_PATHS.has(pathname) ? pathname : '/'
    const seo = PAGE_SEO[seoKey] ?? PAGE_SEO['/']
    const canonical = `${origin}${seoKey === '/' ? '/' : seoKey}`
    const ogImage = salonOgImageUrl(origin)

    document.title = seo.title

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', seo.description)
    setMeta('keywords', SALON_PUBLIC.keywords)
    setMeta('og:title', seo.title, true)
    setMeta('og:description', seo.description, true)
    setMeta('og:url', canonical, true)
    setMeta('og:type', 'website', true)
    setMeta('og:locale', 'vi_VN', true)
    setMeta('og:site_name', SALON_PUBLIC.name, true)
    setMeta('og:image', ogImage, true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', seo.title)
    setMeta('twitter:description', seo.description)
    setMeta('twitter:image', ogImage)

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical

    const structured = {
      '@context': 'https://schema.org',
      '@graph': [buildHairSalonJsonLd(origin), buildFaqJsonLd()],
    }

    let script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = JSON_LD_ID
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(structured)

    return () => {
      document.getElementById(JSON_LD_ID)?.remove()
    }
  }, [pathname])

  return null
}
