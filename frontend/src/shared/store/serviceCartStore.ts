import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HairSize, ServiceCategory, ServiceResponse } from '@/shared/api/types'
import { buildServiceCartLine } from '@/shared/lib/servicePricing'

export interface ServiceCartLine {
  cartLineId: string
  serviceId: string
  name: string
  category: ServiceCategory
  hairSize: HairSize | null
  unitPrice: number
  priceLabel: string
  priceRangeLabel: string | null
  durationMinutes?: number | null
}

interface ServiceCartState {
  items: ServiceCartLine[]
  addService: (service: ServiceResponse, hairSize: HairSize) => 'added' | 'duplicate'
  removeLine: (cartLineId: string) => void
  clearCart: () => void
}

function lineKey(serviceId: string, hairSize: HairSize | null) {
  return `${serviceId}:${hairSize ?? ''}`
}

type PersistedServiceCartState = Pick<ServiceCartState, 'items'>

export const useServiceCartStore = create<ServiceCartState>()(
  persist(
    (set) => ({
      items: [],

      addService: (service, hairSize) => {
        const line = buildServiceCartLine(service, hairSize)
        const key = lineKey(line.serviceId, line.hairSize)
        let result: 'added' | 'duplicate' = 'added'

        set((state) => {
          if (state.items.some((item) => lineKey(item.serviceId, item.hairSize) === key)) {
            result = 'duplicate'
            return state
          }

          return {
            items: [
              ...state.items,
              {
                ...line,
                cartLineId: crypto.randomUUID(),
              },
            ],
          }
        })

        return result
      },

      removeLine: (cartLineId) =>
        set((state) => ({
          items: state.items.filter((item) => item.cartLineId !== cartLineId),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'trang-tran-service-cart',
      version: 1,
      partialize: (state): PersistedServiceCartState => ({ items: state.items }),
    },
  ),
)
