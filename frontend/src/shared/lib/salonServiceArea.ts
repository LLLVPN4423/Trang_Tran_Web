/** Khu vực phục vụ — JSON-LD areaServed + trang /khu-vuc (AI & local SEO). */
export const SALON_SERVICE_AREAS = [
  {
    name: 'Sóc Trăng',
    type: 'City' as const,
    role: 'primary' as const,
    note: 'Địa chỉ tiệm — 18–19 LK2, KDC Tuấn Lan, Hùng Vương, TP. Sóc Trăng.',
  },
  {
    name: 'Cần Thơ',
    type: 'City' as const,
    role: 'travel' as const,
    note: 'Nhận khách từ TP. Cần Thơ và các quận/huyện — khoảng 1–1,5 giờ xe. Nên đặt lịch trước.',
  },
  {
    name: 'Hậu Giang',
    type: 'AdministrativeArea' as const,
    role: 'travel' as const,
    note: 'Khách từ Vị Thanh, Ngã Bảy, Châu Thành… đặt lịch online hoặc gọi trước khi đến.',
  },
  {
    name: 'Vĩnh Long',
    type: 'City' as const,
    role: 'travel' as const,
    note: 'Phục vụ khách đi ngày — balayage, nhuộm, uốn/duỗi, phục hồi.',
  },
  {
    name: 'Bạc Liêu',
    type: 'City' as const,
    role: 'travel' as const,
    note: 'Khách từ Bạc Liêu / vùng lân cận Sóc Trăng được ưu tiên xếp lịch cuối tuần.',
  },
  {
    name: 'Đồng bằng sông Cửu Long',
    type: 'AdministrativeArea' as const,
    role: 'region' as const,
    note: 'Salon chuyên nhuộm–uốn–balayage cho khách trong khu vực ĐBSCL muốn làm tóc kỹ, đặt lịch trước.',
  },
] as const

export function buildAreaServedJsonLd() {
  return SALON_SERVICE_AREAS.map((area) => ({
    '@type': area.type,
    name: area.name,
  }))
}
