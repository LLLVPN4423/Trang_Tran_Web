import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HairSize, OrderItemType, ProductResponse, ServiceResponse } from '@/shared/api/types'
import { resolveServicePrice } from '@/shared/api/types'

export interface CartLine {
  cartLineId: string
  itemId: string
  itemType: OrderItemType
  name: string
  quantity: number
  hairSize: HairSize | null
  unitPrice: number
  maxStock?: number
}

interface CartState {
  items: CartLine[]
  addService: (service: ServiceResponse, hairSize: HairSize) => void
  addProduct: (product: ProductResponse) => void
  removeLine: (cartLineId: string) => void
  setQuantity: (cartLineId: string, quantity: number) => void
  clearCart: () => void
  itemCount: () => number
  estimatedTotal: () => number
}

function lineKey(itemId: string, itemType: OrderItemType, hairSize: HairSize | null) {
  return `${itemType}:${itemId}:${hairSize ?? ''}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addService: (service, hairSize) => {
        const key = lineKey(service.id, 'Service', hairSize)
        set((state) => {
          const existing = state.items.find(
            (i) => lineKey(i.itemId, i.itemType, i.hairSize) === key,
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cartLineId === existing.cartLineId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                cartLineId: crypto.randomUUID(),
                itemId: service.id,
                itemType: 'Service',
                name: service.name,
                quantity: 1,
                hairSize,
                unitPrice: resolveServicePrice(service, hairSize),
              },
            ],
          }
        })
      },

      addProduct: (product) => {
        const key = lineKey(product.id, 'Product', null)
        set((state) => {
          const existing = state.items.find(
            (i) => lineKey(i.itemId, i.itemType, i.hairSize) === key,
          )
          const nextQty = (existing?.quantity ?? 0) + 1
          if (nextQty > product.stock) return state

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cartLineId === existing.cartLineId
                  ? { ...i, quantity: nextQty }
                  : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                cartLineId: crypto.randomUUID(),
                itemId: product.id,
                itemType: 'Product',
                name: product.name,
                quantity: 1,
                hairSize: null,
                unitPrice: product.price,
                maxStock: product.stock,
              },
            ],
          }
        })
      },

      removeLine: (cartLineId) =>
        set((state) => ({
          items: state.items.filter((i) => i.cartLineId !== cartLineId),
        })),

      setQuantity: (cartLineId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => {
              if (i.cartLineId !== cartLineId) return i
              const max = i.maxStock ?? 99
              const qty = Math.max(0, Math.min(quantity, max))
              return { ...i, quantity: qty }
            })
            .filter((i) => i.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      estimatedTotal: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: 'trang-tran-cart' },
  ),
)
