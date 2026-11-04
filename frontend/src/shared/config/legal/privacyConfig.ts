import type { LegalField } from './types'

/**
 * Privacy-related config. Processor list mixes VERIFIED_FROM_CODE vs owner/legal review.
 */
export const privacyConfig = {
  noticeVersion: {
    value: '1.0.0-draft',
    status: 'CONFIRMED',
    purpose:
      'Phiên bản thông báo bảo mật nội bộ (draft đến khi owner/luật sư duyệt). Đổi giá trị này khi có thay đổi trọng yếu cần nhắc acknowledgement mới (Phase 1F sẽ lưu durable).',
    usedBy: ['/chinh-sach-bao-mat', 'register-disclosure', 'future-ack-workflow'],
    customerFacing: true,
  } satisfies LegalField<string>,

  /**
   * Bump when policy change is material enough that returning customers should re-acknowledge.
   * Must stay in sync with noticeVersion for Phase 1C UI; durable enforcement is Phase 1F.
   */
  materialChangeId: {
    value: '1.0.0-draft',
    status: 'CONFIRMED',
    purpose: 'Khóa nhận diện thay đổi trọng yếu — không bắt acknowledgement mỗi lần đăng nhập.',
    usedBy: ['register-disclosure', 'future-ack-workflow'],
    customerFacing: false,
  } satisfies LegalField<string>,

  dataControllerDisplayName: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Tên chủ thể xử lý dữ liệu công bố (thường là tên HKD đăng ký).',
    usedBy: ['/chinh-sach-bao-mat'],
    customerFacing: true,
  } satisfies LegalField<string>,

  retentionOrders: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Thời hạn lưu đơn hàng / chứng từ giao dịch.',
    usedBy: ['/chinh-sach-bao-mat'],
    customerFacing: true,
  } satisfies LegalField<string>,

  retentionAppointments: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Thời hạn lưu yêu cầu / lịch hẹn.',
    usedBy: ['/chinh-sach-bao-mat'],
    customerFacing: true,
  } satisfies LegalField<string>,

  retentionAccounts: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Thời hạn lưu hồ sơ tài khoản khách.',
    usedBy: ['/chinh-sach-bao-mat'],
    customerFacing: true,
  } satisfies LegalField<string>,

  retentionLogs: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Thời hạn lưu nhật ký hệ thống có thể chứa PII.',
    usedBy: ['/chinh-sach-bao-mat'],
    customerFacing: false,
  } satisfies LegalField<string>,

  /** Verified infrastructure processors — describe factually; DPA/legal status needs review. */
  processorFirebaseAuth: {
    value: 'Firebase Authentication (Google) — đăng nhập email/mật khẩu và Google OAuth.',
    status: 'VERIFIED_FROM_CODE',
    purpose: 'Xác thực danh tính người dùng.',
    usedBy: ['/chinh-sach-bao-mat'],
    customerFacing: true,
  } satisfies LegalField<string>,

  processorFirestore: {
    value: 'Cloud Firestore (Google) — lưu hồ sơ khách, đơn hàng, lịch hẹn qua API backend.',
    status: 'VERIFIED_FROM_CODE',
    purpose: 'Lưu trữ nghiệp vụ.',
    usedBy: ['/chinh-sach-bao-mat'],
    customerFacing: true,
  } satisfies LegalField<string>,

  processorCloudRun: {
    value: 'Google Cloud Run — API ASP.NET xử lý nghiệp vụ và gọi Firestore bằng Admin SDK.',
    status: 'VERIFIED_FROM_CODE',
    purpose: 'Xử lý máy chủ.',
    usedBy: ['/chinh-sach-bao-mat'],
    customerFacing: true,
  } satisfies LegalField<string>,

  processorCloudflarePages: {
    value: 'Cloudflare Pages — phục vụ giao diện website tĩnh/SPA.',
    status: 'VERIFIED_FROM_CODE',
    purpose: 'Hosting frontend.',
    usedBy: ['/chinh-sach-bao-mat'],
    customerFacing: true,
  } satisfies LegalField<string>,

  processorVietQrImage: {
    value:
      'Dịch vụ tạo ảnh VietQR (img.vietqr.io) — nhận tham số số tiền và nội dung chuyển khoản từ trình duyệt để hiển thị QR.',
    status: 'VERIFIED_FROM_CODE',
    purpose: 'Hướng dẫn thanh toán chuyển khoản.',
    usedBy: ['/chinh-sach-bao-mat', '/chinh-sach-thanh-toan'],
    customerFacing: true,
  } satisfies LegalField<string>,

  processorSePay: {
    value:
      'SePay — mã webhook còn trong hệ thống nhưng không phải phương thức xác minh thanh toán đang dùng; xác minh Paid do nhân viên đối chiếu sao kê.',
    status: 'VERIFIED_FROM_CODE',
    purpose: 'Làm rõ phạm vi xử lý (dormant).',
    usedBy: ['/chinh-sach-bao-mat', '/chinh-sach-thanh-toan'],
    customerFacing: true,
  } satisfies LegalField<string>,

  otherProcessors: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Đơn vị vận chuyển, email, chat, analytics hoặc nhà cung cấp khác (nếu có).',
    usedBy: ['/chinh-sach-bao-mat'],
    customerFacing: true,
  } satisfies LegalField<string>,

  marketingCommunicationsPlanned: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Có gửi marketing SMS/Zalo/email hay không (mặc định kỹ thuật: chưa triển khai).',
    usedBy: ['/chinh-sach-bao-mat', 'future-consent'],
    customerFacing: false,
  } satisfies LegalField<string>,

  legalBasesReview: {
    value: null,
    status: 'LEGAL_REVIEW_REQUIRED',
    purpose: 'Ánh xạ cơ sở pháp lý xử lý DLCN theo Luật 91/2025 và NĐ 356/2025 (gồm ngoại lệ HKD).',
    usedBy: ['/chinh-sach-bao-mat'],
    customerFacing: false,
  } satisfies LegalField<string>,
} as const

export type PrivacyConfigKey = keyof typeof privacyConfig
