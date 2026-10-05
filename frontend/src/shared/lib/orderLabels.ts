import type { FulfillmentMethod, PaymentMethod } from '@/shared/api/types'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BankTransfer: 'Chuyển khoản trước',
  COD: 'Thanh toán khi nhận (COD)',
}

export const FULFILLMENT_METHOD_LABELS: Record<FulfillmentMethod, string> = {
  Pickup: 'Đến tiệm lấy',
  Delivery: 'Giao hàng',
}

export function normalizePaymentMethod(value: string | undefined | null): PaymentMethod {
  return value === 'COD' ? 'COD' : 'BankTransfer'
}

export function normalizeFulfillmentMethod(value: string | undefined | null): FulfillmentMethod {
  return value === 'Delivery' ? 'Delivery' : 'Pickup'
}
