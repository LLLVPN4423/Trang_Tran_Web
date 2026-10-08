/** Thông tin công khai salon — SEO, JSON-LD, CTA (đồng bộ với site content mặc định). */
export const SALON_PUBLIC = {
  name: 'Trang Tran Hair Salon',
  nameVi: 'Salon Trang Trần',
  siteUrl: 'https://trangtran-hair.pages.dev',
  phoneRaw: '0986586058',
  phoneDisplay: '0986 586 058',
  address: '18–19 LK2, KDC Tuấn Lan, Hùng Vương, TP. Sóc Trăng',
  openingHours: '8:30 – 20:30, Thứ Hai – Chủ Nhật',
  geo: { latitude: 9.6032, longitude: 105.98 },
  keywords:
    'salon tóc Sóc Trăng, nhuộm tóc, uốn tóc, balayage, Trang Tran Hair, làm tóc Hùng Vương, Moroccanoil',
  facebook: 'https://www.facebook.com/TrangTranHair/',
  portfolioUrl: 'https://trang-tran-portfolio.vercel.app/',
  zalo: 'https://zalo.me/0986586058',
  mapsSearchUrl:
    'https://www.google.com/maps/search/?api=1&query=18-19+LK2+Tu%E1%BA%A5n+Lan+H%C3%B9ng+V%C6%B0%C6%A1ng+S%C3%B3c+Tr%C4%83ng',
  /** Ảnh preview khi share link (Facebook/Zalo) — file có sẵn trên host, không phí CDN riêng. */
  ogImagePath: '/images/hero/Hero.jpg',
} as const

export function salonOgImageUrl(origin: string = SALON_PUBLIC.siteUrl): string {
  return `${origin.replace(/\/$/, '')}${SALON_PUBLIC.ogImagePath}`
}

export function buildHairSalonJsonLd(origin: string = SALON_PUBLIC.siteUrl) {
  return {
    '@type': 'HairSalon',
    name: SALON_PUBLIC.name,
    alternateName: SALON_PUBLIC.nameVi,
    url: origin,
    telephone: `+84${SALON_PUBLIC.phoneRaw.replace(/^0/, '')}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '18–19 LK2, KDC Tuấn Lan, Hùng Vương',
      addressLocality: 'Sóc Trăng',
      addressRegion: 'Sóc Trăng',
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SALON_PUBLIC.geo.latitude,
      longitude: SALON_PUBLIC.geo.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:30',
        closes: '20:30',
      },
    ],
    sameAs: [
      origin,
      SALON_PUBLIC.facebook,
      SALON_PUBLIC.portfolioUrl,
      'https://www.instagram.com/trang_tran_hair',
      'https://www.tiktok.com/@trangtranhair',
    ],
    priceRange: '$$',
    areaServed: { '@type': 'City', name: 'Sóc Trăng' },
    image: salonOgImageUrl(origin),
  }
}
