import { buildFaqJsonLd } from '@/shared/lib/salonFaq'
import { SALON_PUBLIC, buildHairSalonJsonLd, salonOgImageUrl } from '@/shared/lib/salonPublicInfo'

const SALON_ID = '#trang-tran-hair-salon'

export function buildHairSalonNode(origin: string) {
  return {
    ...buildHairSalonJsonLd(origin),
    '@id': `${origin}${SALON_ID}`,
    hasMap: SALON_PUBLIC.mapsSearchUrl,
  }
}

export function buildWebSiteJsonLd(origin: string) {
  return {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    name: SALON_PUBLIC.name,
    alternateName: SALON_PUBLIC.nameVi,
    url: origin,
    description: `Salon tóc Sóc Trăng — nhuộm, uốn, balayage. ${SALON_PUBLIC.address}.`,
    inLanguage: 'vi-VN',
    publisher: { '@id': `${origin}${SALON_ID}` },
  }
}

const BREADCRUMB_LABELS: Record<string, string> = {
  '/catalog': 'Bảng giá dịch vụ',
  '/appointment': 'Đặt lịch',
  '/shop': 'Shop Moroccanoil',
  '/booking': 'Thanh toán',
  '/login': 'Đăng nhập',
  '/register': 'Đăng ký',
}

export function buildBreadcrumbJsonLd(origin: string, pathname: string) {
  if (pathname === '/' || pathname.startsWith('/admin')) return null
  const label = BREADCRUMB_LABELS[pathname]
  if (!label) return null
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: label, item: `${origin}${pathname}` },
    ],
  }
}

export function buildSalonGraphJsonLd(origin: string, pathname: string) {
  const graph: object[] = [
    buildHairSalonNode(origin),
    buildWebSiteJsonLd(origin),
    buildFaqJsonLd(),
  ]
  const crumb = buildBreadcrumbJsonLd(origin, pathname)
  if (crumb) graph.push(crumb)
  return { '@context': 'https://schema.org', '@graph': graph }
}

export { salonOgImageUrl }
