import type { LegalField } from './types'

/**
 * Household-business / operator identity for legal pages.
 * Do NOT copy SEO constants from salonPublicInfo without owner confirmation.
 */
export const businessInfo = {
  ownerName: {
    value: 'Trần Xuân Trang',
    status: 'CONFIRMED',
    purpose: 'Chủ hộ / người vận hành website (theo thông tin chủ sở hữu cung cấp). Không đồng nghĩa tên HKD đăng ký.',
    usedBy: ['/thong-tin-ho-kinh-doanh', '/dieu-khoan-giao-dich', '/chinh-sach-bao-mat'],
    customerFacing: true,
  } satisfies LegalField<string>,

  registeredBusinessName: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Tên hộ kinh doanh đúng theo giấy đăng ký.',
    usedBy: ['/thong-tin-ho-kinh-doanh', '/dieu-khoan-giao-dich', '/lien-he-khieu-nai'],
    customerFacing: true,
  } satisfies LegalField<string>,

  taxCode: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Mã số thuế (nếu công bố theo yêu cầu pháp lý / quyết định chủ sở hữu).',
    usedBy: ['/thong-tin-ho-kinh-doanh'],
    customerFacing: true,
  } satisfies LegalField<string>,

  registrationNumber: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Số đăng ký hộ kinh doanh.',
    usedBy: ['/thong-tin-ho-kinh-doanh'],
    customerFacing: true,
  } satisfies LegalField<string>,

  registrationDate: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Ngày đăng ký hộ kinh doanh.',
    usedBy: ['/thong-tin-ho-kinh-doanh'],
    customerFacing: true,
  } satisfies LegalField<string>,

  registeredAddress: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Địa chỉ đăng ký kinh doanh trên giấy phép.',
    usedBy: ['/thong-tin-ho-kinh-doanh', '/chinh-sach-bao-mat'],
    customerFacing: true,
  } satisfies LegalField<string>,

  operatingAddress: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose:
      'Địa điểm salon thực tế nếu khác địa chỉ đăng ký. Không tự điền từ bản SEO công khai cho đến khi chủ sở hữu xác nhận.',
    usedBy: ['/thong-tin-ho-kinh-doanh', '/chinh-sach-giao-hang-doi-tra', '/lien-he-khieu-nai'],
    customerFacing: true,
  } satisfies LegalField<string>,

  officialPhone: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Số điện thoại liên hệ chính thức cho chính sách / khiếu nại.',
    usedBy: ['/thong-tin-ho-kinh-doanh', '/lien-he-khieu-nai', '/chinh-sach-thanh-toan'],
    customerFacing: true,
  } satisfies LegalField<string>,

  supportPhone: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Số hỗ trợ khách hàng (nếu khác số chính thức).',
    usedBy: ['/lien-he-khieu-nai', '/chinh-sach-thanh-toan'],
    customerFacing: true,
  } satisfies LegalField<string>,

  businessEmail: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Email doanh nghiệp công bố.',
    usedBy: ['/thong-tin-ho-kinh-doanh', '/lien-he-khieu-nai', '/chinh-sach-bao-mat'],
    customerFacing: true,
  } satisfies LegalField<string>,

  complaintContact: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Kênh tiếp nhận khiếu nại (SĐT / email / Zalo chính thức).',
    usedBy: ['/lien-he-khieu-nai', '/dieu-khoan-giao-dich'],
    customerFacing: true,
  } satisfies LegalField<string>,

  privacyRequestContact: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Kênh tiếp nhận yêu cầu quyền dữ liệu cá nhân.',
    usedBy: ['/chinh-sach-bao-mat', '/lien-he-khieu-nai'],
    customerFacing: true,
  } satisfies LegalField<string>,

  supportHours: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Giờ hỗ trợ khách hàng / phản hồi khiếu nại.',
    usedBy: ['/lien-he-khieu-nai', '/thong-tin-ho-kinh-doanh'],
    customerFacing: true,
  } satisfies LegalField<string>,

  websiteUrl: {
    value: 'https://trangtran-hair.pages.dev',
    status: 'CONFIRMED',
    purpose: 'URL website đang vận hành (Cloudflare Pages).',
    usedBy: ['/thong-tin-ho-kinh-doanh', 'all-legal-pages'],
    customerFacing: true,
  } satisfies LegalField<string>,

  businessActivitySummary: {
    value:
      'Cung cấp dịch vụ làm tóc tại salon và bán sản phẩm chăm sóc tóc qua website (đặt hàng online).',
    status: 'CONFIRMED',
    purpose: 'Mô tả hoạt động trên website (không thay thế ngành nghề đăng ký HKD).',
    usedBy: ['/thong-tin-ho-kinh-doanh', '/dieu-khoan-giao-dich'],
    customerFacing: true,
  } satisfies LegalField<string>,
} as const

export type BusinessInfoKey = keyof typeof businessInfo
