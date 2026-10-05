import type { FulfillmentMethod, PaymentMethod } from '@/shared/api/types'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BankTransfer: 'Chuyển khoản trước',
  COD: 'Thanh toán khi nhận (COD)',
  CashAtSalon: 'Tiền mặt tại tiệm',
}

export const ORDER_KIND_LABELS: Record<import('@/shared/api/types').OrderKind, string> = {
  Retail: 'Đơn sản phẩm',
  ServiceInvoice: 'Hóa đơn dịch vụ',
}

export const FULFILLMENT_METHOD_LABELS: Record<FulfillmentMethod, string> = {
  Pickup: 'Đến tiệm lấy',
  Delivery: 'Giao hàng',
}

export function normalizePaymentMethod(value: string | undefined | null): PaymentMethod {
  if (value === 'COD') return 'COD'
  if (value === 'CashAtSalon') return 'CashAtSalon'
  return 'BankTransfer'
}

export function normalizeOrderKind(value: string | undefined | null): import('@/shared/api/types').OrderKind {
  return value === 'ServiceInvoice' ? 'ServiceInvoice' : 'Retail'
}

export function normalizeFulfillmentMethod(value: string | undefined | null): FulfillmentMethod {
  return value === 'Delivery' ? 'Delivery' : 'Pickup'
}
