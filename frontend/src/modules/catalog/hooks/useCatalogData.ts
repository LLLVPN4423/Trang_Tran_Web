import { useCallback, useEffect, useState } from 'react'
import { fetchProducts, fetchServices, seedDevData } from '@/shared/api/endpoints'
import type { ProductResponse, ServiceCategory, ServiceResponse } from '@/shared/api/types'

interface CatalogData {
  services: ServiceResponse[]
  products: ProductResponse[]
}

export function useCatalogData() {
  const [data, setData] = useState<CatalogData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let services = await fetchServices()
      let products = await fetchProducts()

      if (services.length === 0 && products.length === 0 && import.meta.env.DEV) {
        await seedDevData()
        services = await fetchServices()
        products = await fetchProducts()
      }

      setData({ services, products })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { data, error, loading, reload: load }
}

export function filterServices(
  services: ServiceResponse[],
  category: ServiceCategory | 'all',
): ServiceResponse[] {
  if (category === 'all') return services
  return services.filter((s) => s.category === category)
}
