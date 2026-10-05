import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProductResponse } from '@/shared/api/types'

export interface CartLine {
  cartLineId: string
  itemId: string
  itemType: 'Product'
  name: string
  quantity: number
  hairSize: null
  unitPrice: number
  maxStock?: number
}

interface CartState {
  items: CartLine[]
  addProduct: (product: ProductResponse) => void
  removeLine: (cartLineId: string) => void
  setQuantity: (cartLineId: string, quantity: number) => void
  clearCart: () => void
}

function lineKey(itemId: string) {
  return `Product:${itemId}:`
}

type PersistedCartState = Pick<CartState, 'items'>

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addProduct: (product) => {
        const key = lineKey(product.id)
        set((state) => {
          const existing = state.items.find((i) => lineKey(i.itemId) === key)
          const nextQty = (existing?.quantity ?? 0) + 1
          if (nextQty > product.stock) return state

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cartLineId === existing.cartLineId ? { ...i, quantity: nextQty } : i,
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
    }),
    {
      name: 'trang-tran-cart',
      version: 3,
      partialize: (state): PersistedCartState => ({ items: state.items }),
      migrate: (persisted, version) => {
        const state = persisted as { items?: Array<{ itemType?: string }> }
        if (version >= 3) return persisted as PersistedCartState
        if (!state?.items) return { items: [] }
        return {
          items: state.items
            .filter((i) => i.itemType === 'Product')
            .map((i) => ({
              ...i,
              itemType: 'Product' as const,
              hairSize: null,
            })),
        }
      },
    },
  ),
)
