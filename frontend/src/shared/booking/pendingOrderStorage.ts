import type { OrderResponse } from '@/shared/api/types'

const STORAGE_KEY = 'trangtran-pending-order'

type StoredPendingOrder = Pick<
  OrderResponse,
  'id' | 'accessToken' | 'status' | 'paymentCode' | 'totalAmount' | 'customerName' | 'customerPhone'
>

export function savePendingOrder(order: OrderResponse): void {
  try {
    const payload: StoredPendingOrder = {
      id: order.id,
      accessToken: order.accessToken,
      status: order.status,
      paymentCode: order.paymentCode,
      totalAmount: order.totalAmount,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* storage blocked */
  }
}

export function loadPendingOrder(): StoredPendingOrder | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredPendingOrder
    if (!parsed?.id || !parsed?.accessToken) return null
    return parsed
  } catch {
    return null
  }
}

export function clearPendingOrder(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage blocked */
  }
}

export function isPendingCheckoutOrder(order: Pick<OrderResponse, 'status'> | null): boolean {
  return order?.status === 'Pending'
}
