import { useEffect } from 'react'
import { SALON_META_KEYWORDS } from '@/shared/lib/salonKeywords'
import { SALON_PUBLIC, salonOgImageUrl } from '@/shared/lib/salonPublicInfo'

/** Gắn title/description/canonical cho trang động (chi tiết dịch vụ/sản phẩm). */
export function useSalonDocumentMeta(
  active: boolean,
  opts: { title: string; description: string; canonicalPath: string },
) {
  useEffect(() => {
    if (!active) return

    const origin = typeof window !== 'undefined' ? window.location.origin : SALON_PUBLIC.siteUrl
    const canonical = `${origin}${opts.canonicalPath.startsWith('/') ? opts.canonicalPath : `/${opts.canonicalPath}`}`
    const ogImage = salonOgImageUrl(origin)

    document.title = opts.title

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

    setMeta('description', opts.description)
    setMeta('keywords', SALON_META_KEYWORDS)
    setMeta('og:title', opts.title, true)
    setMeta('og:description', opts.description, true)
    setMeta('og:url', canonical, true)
    setMeta('og:image', ogImage, true)

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical
  }, [active, opts.title, opts.description, opts.canonicalPath])
}
