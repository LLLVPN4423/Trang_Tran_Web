import type { SiteContentResponse } from '@/shared/api/types'

/** Fallback when API unavailable — mirrors backend SiteContentDefaults + content.ts */
export const DEFAULT_SITE_CONTENT: SiteContentResponse = {
  hero: {
    imageUrl: '/images/hero/Hero.jpg',
    eyebrow: 'Hair Salon · Editorial',
    title: 'Trang Tran',
    tagline: 'Where hair becomes art',
  },
  artist: {
    mainImageUrl: '/images/about/The Artist.jpg',
    secondaryImageUrl: '/images/about/The Artist 1.jpg',
    eyebrow: 'The Artist',
    heading: 'Nghệ thuật trên từng',
    headingAccent: ' sợi tóc',
    bio: 'Mr. Trang Trần — Master Stylist với hơn một thập kỷ kinh nghiệm trong nghệ thuật tạo kiểu editorial. Mỗi tác phẩm là sự kết hợp giữa kỹ thuật thuần túy và cảm hứng thời trang, biến mái tóc thành canvas sống động.',
    statementLines: [
      'Every strand tells a story.',
      'Editorial precision.',
      'Timeless elegance.',
      'Crafted with intention.',
      'Your canvas, reimagined.',
    ],
  },
  lookbook: {
    eyebrow: 'Salon Tour',
    title: 'Lookbook',
    items: [
      { id: 1, label: 'Không gian salon', imageUrl: '/images/salon-tour/Salon Tour.jpg', aspect: 'tall', speed: 0.15 },
      { id: 2, label: 'Studio styling', imageUrl: '/images/salon-tour/Salon Tour1.jpg', aspect: 'wide', speed: 0.08 },
      { id: 3, label: 'Góc làm việc', imageUrl: '/images/salon-tour/Salon Tour2.jpg', aspect: 'square', speed: 0.22 },
      { id: 4, label: 'Salon interior', imageUrl: '/images/salon-tour/Salon Tour3.jpg', aspect: 'wide', speed: 0.12 },
      { id: 5, label: 'Chi tiết nội thất', imageUrl: '/images/salon-tour/Salon Tour4.jpg', aspect: 'tall', speed: 0.18 },
      { id: 6, label: 'Khu vực gội', imageUrl: '/images/salon-tour/Salon Tour5.jpg', aspect: 'square', speed: 0.1 },
      { id: 7, label: 'Không gian chờ', imageUrl: '/images/salon-tour/Salon Tour6.jpg', aspect: 'square', speed: 0.14 },
      { id: 8, label: 'Gương & ánh sáng', imageUrl: '/images/salon-tour/Salon Tour7.jpg', aspect: 'tall', speed: 0.11 },
      { id: 9, label: 'Team Trang Tran', imageUrl: '/images/salon-tour/Salon Tour8.jpg', aspect: 'wide', speed: 0.09 },
      { id: 10, label: 'Salon tour', imageUrl: '/images/salon-tour/Salon Tour9.jpg', aspect: 'square', speed: 0.16 },
      { id: 11, label: 'Trải nghiệm salon', imageUrl: '/images/salon-tour/Salon Tour10.jpg', aspect: 'wide', speed: 0.13 },
    ],
  },
  contact: {
    phone: '0986 586 058',
    phoneRaw: '0986586058',
    address: '18-19LK2 KDC Tuấn Lan, Hùng Vương, TP. Sóc Trăng',
    note: 'Tóc dày và dài sẽ được tính UpSize (S → M → L → XL)',
  },
  socialLinks: [
    { label: 'Facebook', url: 'https://www.facebook.com/trang.tran.352944?locale=vi_VN' },
    { label: 'Instagram', url: 'https://www.instagram.com/trang_tran_hair' },
    { label: 'Threads', url: 'https://www.threads.com/@trang_tran_hair' },
    { label: 'TikTok', url: 'https://www.tiktok.com/@trangtranhair' },
    { label: 'Portfolio', url: 'https://trang-tran-portfolio.vercel.app/' },
  ],
}

/** Gộp dữ liệu API (có thể thiếu contact/social) với mặc định — tránh crash Admin. */
export function mergeSiteContentForm(raw: SiteContentResponse | null | undefined): SiteContentResponse {
  const base = DEFAULT_SITE_CONTENT
  if (!raw) return base

  const contact =
    raw.contact?.phone?.trim()
      ? {
          phone: raw.contact.phone.trim(),
          phoneRaw: raw.contact.phoneRaw?.trim() || raw.contact.phone.replace(/\D/g, ''),
          address: raw.contact.address?.trim() ?? base.contact.address,
          note: raw.contact.note?.trim() ?? base.contact.note,
        }
      : base.contact

  const socialFromApi = (raw.socialLinks ?? []).filter((l) => l?.label?.trim() && l?.url?.trim())
  const socialLinks =
    socialFromApi.length > 0
      ? socialFromApi.map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
      : base.socialLinks

  return {
    hero: { ...base.hero, ...raw.hero },
    artist: {
      ...base.artist,
      ...raw.artist,
      statementLines: raw.artist?.statementLines?.length
        ? raw.artist.statementLines
        : base.artist.statementLines,
    },
    lookbook: {
      ...base.lookbook,
      ...raw.lookbook,
      items: raw.lookbook?.items?.length ? raw.lookbook.items : base.lookbook.items,
    },
    contact,
    socialLinks,
  }
}
