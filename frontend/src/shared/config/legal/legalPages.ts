import type { LegalPageMeta } from './types'

export const LEGAL_POLICY_VERSION = '1.0.0-draft'
export const LEGAL_LAST_UPDATED = '2026-11-04'

export const legalPages: LegalPageMeta[] = [
  {
    id: 'privacy',
    path: '/chinh-sach-bao-mat',
    title: 'Chính sách bảo mật & dữ liệu cá nhân',
    shortTitle: 'Bảo mật',
    description:
      'Thông tin về việc thu thập và xử lý dữ liệu cá nhân khi sử dụng website Trang Trần Hair.',
    version: LEGAL_POLICY_VERSION,
    lastUpdated: LEGAL_LAST_UPDATED,
    publicationStatus: 'PENDING_OWNER_INPUT',
    mandatoryFieldKeys: [
      'businessInfo.registeredBusinessName',
      'businessInfo.privacyRequestContact',
      'privacyConfig.dataControllerDisplayName',
      'privacyConfig.retentionOrders',
    ],
  },
  {
    id: 'terms',
    path: '/dieu-khoan-giao-dich',
    title: 'Điều khoản giao dịch',
    shortTitle: 'Điều khoản',
    description: 'Điều kiện sử dụng website, đặt lịch dịch vụ và mua sản phẩm.',
    version: LEGAL_POLICY_VERSION,
    lastUpdated: LEGAL_LAST_UPDATED,
    publicationStatus: 'PENDING_OWNER_INPUT',
    mandatoryFieldKeys: [
      'businessInfo.registeredBusinessName',
      'transactionPolicy.productCancelConditions',
      'transactionPolicy.serviceCancelConditions',
    ],
  },
  {
    id: 'payment',
    path: '/chinh-sach-thanh-toan',
    title: 'Chính sách thanh toán',
    shortTitle: 'Thanh toán',
    description: 'Hướng dẫn VietQR, chuyển khoản và xác minh thanh toán thủ công.',
    version: LEGAL_POLICY_VERSION,
    lastUpdated: LEGAL_LAST_UPDATED,
    publicationStatus: 'PENDING_OWNER_INPUT',
    mandatoryFieldKeys: ['businessInfo.officialPhone', 'transactionPolicy.misTransferHandling'],
  },
  {
    id: 'shipping',
    path: '/chinh-sach-giao-hang-doi-tra',
    title: 'Chính sách giao hàng, đổi trả & hoàn tiền',
    shortTitle: 'Giao hàng · Đổi trả',
    description: 'Giao hàng sản phẩm và điều kiện dịch vụ salon — tách biệt hai nhóm.',
    version: LEGAL_POLICY_VERSION,
    lastUpdated: LEGAL_LAST_UPDATED,
    publicationStatus: 'PENDING_OWNER_INPUT',
    mandatoryFieldKeys: [
      'transactionPolicy.shippingFeesPolicyText',
      'transactionPolicy.productReturnConditions',
      'transactionPolicy.serviceCancelConditions',
    ],
  },
  {
    id: 'complaints',
    path: '/lien-he-khieu-nai',
    title: 'Liên hệ & khiếu nại',
    shortTitle: 'Khiếu nại',
    description: 'Kênh liên hệ và quy trình gửi khiếu nại / yêu cầu hỗ trợ.',
    version: LEGAL_POLICY_VERSION,
    lastUpdated: LEGAL_LAST_UPDATED,
    publicationStatus: 'PENDING_OWNER_INPUT',
    mandatoryFieldKeys: [
      'businessInfo.complaintContact',
      'transactionPolicy.complaintResponseTime',
    ],
  },
  {
    id: 'business',
    path: '/thong-tin-ho-kinh-doanh',
    title: 'Thông tin hộ kinh doanh',
    shortTitle: 'Hộ kinh doanh',
    description: 'Thông tin nhận diện hộ kinh doanh và người vận hành website.',
    version: LEGAL_POLICY_VERSION,
    lastUpdated: LEGAL_LAST_UPDATED,
    publicationStatus: 'PENDING_OWNER_INPUT',
    mandatoryFieldKeys: [
      'businessInfo.registeredBusinessName',
      'businessInfo.registeredAddress',
      'businessInfo.officialPhone',
    ],
  },
]

export function getLegalPageByPath(path: string): LegalPageMeta | undefined {
  return legalPages.find((p) => p.path === path)
}

export function isPageReadyForFinalPublication(page: LegalPageMeta): boolean {
  return page.publicationStatus === 'READY_FOR_OWNER_APPROVAL'
}
