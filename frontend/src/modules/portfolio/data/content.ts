export const SALON_TAGLINE = 'Where hair becomes art'

/** Static assets in frontend/public/images — served at /images/... */
export const HERO_IMAGE = '/images/hero/Hero.jpg'

export const ARTIST_IMAGES = {
  main: '/images/about/The Artist.jpg',
  secondary: '/images/about/The Artist 1.jpg',
} as const

export const ARTIST_STATEMENT = [
  'Every strand tells a story.',
  'Editorial precision.',
  'Timeless elegance.',
  'Crafted with intention.',
  'Your canvas, reimagined.',
]

export const LOOKBOOK_ITEMS = [
  { id: 1, label: 'Không gian salon', aspect: 'tall', speed: 0.15, image: '/images/salon-tour/Salon Tour.jpg' },
  { id: 2, label: 'Studio styling', aspect: 'wide', speed: 0.08, image: '/images/salon-tour/Salon Tour1.jpg' },
  { id: 3, label: 'Góc làm việc', aspect: 'square', speed: 0.22, image: '/images/salon-tour/Salon Tour2.jpg' },
  { id: 4, label: 'Salon interior', aspect: 'wide', speed: 0.12, image: '/images/salon-tour/Salon Tour3.jpg' },
  { id: 5, label: 'Chi tiết nội thất', aspect: 'tall', speed: 0.18, image: '/images/salon-tour/Salon Tour4.jpg' },
  { id: 6, label: 'Khu vực gội', aspect: 'square', speed: 0.1, image: '/images/salon-tour/Salon Tour5.jpg' },
  { id: 7, label: 'Không gian chờ', aspect: 'square', speed: 0.14, image: '/images/salon-tour/Salon Tour6.jpg' },
  { id: 8, label: 'Gương & ánh sáng', aspect: 'tall', speed: 0.11, image: '/images/salon-tour/Salon Tour7.jpg' },
  { id: 9, label: 'Team Trang Tran', aspect: 'wide', speed: 0.09, image: '/images/salon-tour/Salon Tour8.jpg' },
  { id: 10, label: 'Salon tour', aspect: 'square', speed: 0.16, image: '/images/salon-tour/Salon Tour9.jpg' },
  { id: 11, label: 'Trải nghiệm salon', aspect: 'wide', speed: 0.13, image: '/images/salon-tour/Salon Tour10.jpg' },
] as const

export const SERVICE_HIGHLIGHTS = [
  { name: 'Cắt tóc', range: '200K — 300K' },
  { name: 'Gội & Tạo kiểu', range: '50K — 150K' },
  { name: 'Uốn / Duỗi', range: '350K — 1.6M' },
  { name: 'Nhuộm / Tẩy', range: '450K — 1.6M' },
  { name: 'Balayage', range: '4M — 6M' },
  { name: 'Phục hồi', range: '300K — 1.8M' },
]

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/trang.tran.352944?locale=vi_VN',
  instagram: 'https://www.instagram.com/trang_tran_hair',
  threads: 'https://www.threads.com/@trang_tran_hair',
  tiktok: 'https://www.tiktok.com/@trangtranhair',
} as const

export const CONTACT = {
  phone: '0986 586 058',
  phoneRaw: '0986586058',
  address: '18-19LK2 KDC Tuấn Lan, Hùng Vương, TP. Sóc Trăng',
  hours: 'Liên hệ trực tiếp để đặt lịch',
  note: 'Tóc dày và dài sẽ được tính UpSize (S → M → L → XL)',
}
