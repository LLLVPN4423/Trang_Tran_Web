import type { LegalField } from './types'

/**
 * Transaction / shipping / refund policy choices.
 * Do not invent fees or deadlines. Checkout may show system fees separately — legal text stays empty until owner confirms.
 */
export const transactionPolicy = {
  acceptedPaymentMethods: {
    value:
      'Chuyển khoản ngân hàng qua VietQR (BankTransfer) và thanh toán khi nhận / tại salon (COD) theo lựa chọn trên trang thanh toán.',
    status: 'VERIFIED_FROM_CODE',
    purpose: 'Phương thức thanh toán đang có trong checkout.',
    usedBy: ['/chinh-sach-thanh-toan', '/dieu-khoan-giao-dich'],
    customerFacing: true,
  } satisfies LegalField<string>,

  paymentVerificationMethod: {
    value:
      'Nhân viên đối chiếu sao kê ngân hàng thực tế với mã nội dung chuyển khoản (PaymentCode) rồi cập nhật trạng thái Paid trên hệ thống. Website không tự xác nhận đã nhận tiền.',
    status: 'VERIFIED_FROM_CODE',
    purpose: 'Luồng xác minh thanh toán vận hành thực tế.',
    usedBy: ['/chinh-sach-thanh-toan', '/dieu-khoan-giao-dich'],
    customerFacing: true,
  } satisfies LegalField<string>,

  appointmentIsRequestOnly: {
    value:
      'Yêu cầu đặt lịch không đồng nghĩa lịch đã được xác nhận. Salon sẽ liên hệ và xác nhận sau khi nhân viên xử lý.',
    status: 'VERIFIED_FROM_CODE',
    purpose: 'Ngữ nghĩa nghiệp vụ appointment.',
    usedBy: ['/dieu-khoan-giao-dich', '/chinh-sach-giao-hang-doi-tra'],
    customerFacing: true,
  } satisfies LegalField<string>,

  fulfillmentMethods: {
    value: 'Nhận tại salon (Pickup) hoặc giao hàng (Delivery) — theo lựa chọn lúc đặt hàng sản phẩm.',
    status: 'VERIFIED_FROM_CODE',
    purpose: 'Phương thức fulfillment trong mã nguồn.',
    usedBy: ['/chinh-sach-giao-hang-doi-tra', '/dieu-khoan-giao-dich'],
    customerFacing: true,
  } satisfies LegalField<string>,

  shippingFeesPolicyText: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose:
      'Phí giao hàng chính thức công bố trong chính sách. (Hệ thống checkout có bảng phí kỹ thuật — không tự đưa vào văn bản pháp lý trước khi owner xác nhận.)',
    usedBy: ['/chinh-sach-giao-hang-doi-tra'],
    customerFacing: true,
  } satisfies LegalField<string>,

  deliveryTimeEstimates: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Thời gian giao hàng dự kiến theo khu vực.',
    usedBy: ['/chinh-sach-giao-hang-doi-tra'],
    customerFacing: true,
  } satisfies LegalField<string>,

  productReturnConditions: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Điều kiện đổi/trả sản phẩm.',
    usedBy: ['/chinh-sach-giao-hang-doi-tra', '/dieu-khoan-giao-dich'],
    customerFacing: true,
  } satisfies LegalField<string>,

  productRefundConditions: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Điều kiện hoàn tiền sản phẩm.',
    usedBy: ['/chinh-sach-giao-hang-doi-tra', '/chinh-sach-thanh-toan'],
    customerFacing: true,
  } satisfies LegalField<string>,

  productCancelConditions: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Hủy đơn hàng sản phẩm trước/sau thanh toán.',
    usedBy: ['/chinh-sach-giao-hang-doi-tra', '/dieu-khoan-giao-dich'],
    customerFacing: true,
  } satisfies LegalField<string>,

  serviceCancelConditions: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Hủy / đổi lịch dịch vụ salon.',
    usedBy: ['/chinh-sach-giao-hang-doi-tra', '/dieu-khoan-giao-dich'],
    customerFacing: true,
  } satisfies LegalField<string>,

  serviceRefundConditions: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Hoàn tiền / bồi hoàn dịch vụ salon (nếu có).',
    usedBy: ['/chinh-sach-giao-hang-doi-tra'],
    customerFacing: true,
  } satisfies LegalField<string>,

  lateArrivalPolicy: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Quy định đến muộn khi đã xác nhận lịch.',
    usedBy: ['/chinh-sach-giao-hang-doi-tra'],
    customerFacing: true,
  } satisfies LegalField<string>,

  misTransferHandling: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Xử lý sai nội dung CK / thiếu-thừa tiền / chuyển trùng.',
    usedBy: ['/chinh-sach-thanh-toan'],
    customerFacing: true,
  } satisfies LegalField<string>,

  complaintResponseTime: {
    value: null,
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Thời gian phản hồi khiếu nại mục tiêu.',
    usedBy: ['/lien-he-khieu-nai'],
    customerFacing: true,
  } satisfies LegalField<string>,

  ecommerceNotificationStatus: {
    value: 'Chủ sở hữu xác nhận: chưa hoàn tất thông báo hoạt động thương mại điện tử (nếu thuộc diện).',
    status: 'OWNER_INPUT_REQUIRED',
    purpose: 'Trạng thái thủ tục thông báo TMĐT — cập nhật khi đã nộp.',
    usedBy: ['LEGAL_REVIEW_REQUIRED.md', '/thong-tin-ho-kinh-doanh'],
    customerFacing: false,
  } satisfies LegalField<string>,
} as const

export type TransactionPolicyKey = keyof typeof transactionPolicy
