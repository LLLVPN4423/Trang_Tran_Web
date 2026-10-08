import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SALON_META_KEYWORDS } from '@/shared/lib/salonKeywords'
import { SALON_PUBLIC, salonOgImageUrl } from '@/shared/lib/salonPublicInfo'
import { buildSalonGraphJsonLd } from '@/shared/lib/salonStructuredData'

const JSON_LD_ID = 'salon-json-ld'

const PUBLIC_PATHS = new Set(['/', '/catalog', '/appointment', '/shop', '/booking', '/login', '/register'])

const PAGE_SEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: `${SALON_PUBLIC.nameVi} · Nhuộm, uốn, balayage Sóc Trăng`,
    description: `Salon tóc tại ${SALON_PUBLIC.address}. Cắt, nhuộm, uốn, phục hồi — đặt lịch online Trang Tran Hair. ${SALON_PUBLIC.phoneDisplay}. ${SALON_PUBLIC.openingHours}.`,
  },
  '/catalog': {
    title: `Bảng giá salon tóc Sóc Trăng · ${SALON_PUBLIC.nameVi}`,
    description: `Giá cắt, uốn, nhuộm, balayage tại Tuấn Lan, Hùng Vương. Xem chi tiết từng dịch vụ và đặt lịch online — ${SALON_PUBLIC.phoneDisplay}.`,
  },
  '/appointment': {
    title: `Đặt lịch làm tóc Sóc Trăng · ${SALON_PUBLIC.nameVi}`,
    description: `Đặt lịch salon online tại ${SALON_PUBLIC.address} (Hùng Vương, Tuấn Lan). Hotline ${SALON_PUBLIC.phoneDisplay}. ${SALON_PUBLIC.openingHours}.`,
  },
  '/shop': {
    title: `Moroccanoil chính hãng · ${SALON_PUBLIC.nameVi} Sóc Trăng`,
    description: `Mua Moroccanoil online tại Sóc Trăng — tích điểm. Salon ${SALON_PUBLIC.nameVi}, ${SALON_PUBLIC.phoneDisplay}.`,
  },
  '/booking': {
    title: `Thanh toán đơn hàng · ${SALON_PUBLIC.nameVi}`,
    description: `Hoàn tất đơn Moroccanoil — salon Sóc Trăng. Liên hệ ${SALON_PUBLIC.phoneDisplay}.`,
  },
}

/** Meta + JSON-LD (WebSite, HairSalon, FAQ, Breadcrumb) — hiện diện Google & share. */
export function SalonLocalSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/admin')) return

    const isServiceDetail = pathname.startsWith('/catalog/service/')
    const origin = typeof window !== 'undefined' ? window.location.origin : SALON_PUBLIC.siteUrl
    const seoKey = PUBLIC_PATHS.has(pathname) ? pathname : isServiceDetail ? '/catalog' : '/'
    const seo = PAGE_SEO[seoKey] ?? PAGE_SEO['/']
    const canonical = `${origin}${seoKey === '/' ? '/' : seoKey}`
    const ogImage = salonOgImageUrl(origin)

    if (!isServiceDetail) {
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
      setMeta('keywords', SALON_META_KEYWORDS)
      setMeta('geo.placename', 'Sóc Trăng, Vietnam')
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
    }

    const script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null
    const el =
      script ??
      (() => {
        const s = document.createElement('script')
        s.id = JSON_LD_ID
        s.type = 'application/ld+json'
        document.head.appendChild(s)
        return s
      })()
    el.textContent = JSON.stringify(buildSalonGraphJsonLd(origin, seoKey))

    return () => {
      document.getElementById(JSON_LD_ID)?.remove()
    }
  }, [pathname])

  return null
}
