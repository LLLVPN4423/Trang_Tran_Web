import type { CartLine } from '@/shared/store/cartStore'

export function selectCartItemCount(state: { items: CartLine[] }): number {
  return state.items.reduce((sum, item) => sum + item.quantity, 0)
}

export function selectCartSubtotal(state: { items: CartLine[] }): number {
  return state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}
