import type { ServiceCartLine } from '@/shared/store/serviceCartStore'

export function selectServiceCartCount(state: { items: ServiceCartLine[] }): number {
  return state.items.length
}

export function selectServiceCartEstimate(state: { items: ServiceCartLine[] }): number {
  return state.items.reduce((sum, item) => sum + item.unitPrice, 0)
}
