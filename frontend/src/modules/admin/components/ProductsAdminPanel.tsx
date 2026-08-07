import { useCallback, useEffect, useState } from 'react'
import {
  deleteProduct,
  fetchAllProducts,
  updateProduct,
} from '@/shared/api/endpoints'
import type { ProductResponse } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'

export function ProductsAdminPanel() {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts(await fetchAllProducts())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải sản phẩm')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleActive = async (product: ProductResponse) => {
    await updateProduct(product.id, {
      name: product.name,
      description: product.description,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isActive: !product.isActive,
    })
    load()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return
    await deleteProduct(id)
    load()
  }

  if (loading) return <LoadingState label="Đang tải sản phẩm..." />
  if (error) return <ApiErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl text-zinc-200">Moroccanoil ({products.length})</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500">
              <th className="py-3 pr-4">Tên</th>
              <th className="py-3 pr-4">Giá</th>
              <th className="py-3 pr-4">Tồn kho</th>
              <th className="py-3 pr-4">Trạng thái</th>
              <th className="py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-zinc-900 text-zinc-400">
                <td className="py-3 pr-4 text-zinc-200">{p.name}</td>
                <td className="py-3 pr-4">{formatVnd(p.price)}</td>
                <td className="py-3 pr-4">{p.stock}</td>
                <td className="py-3 pr-4">
                  <span className={p.isActive ? 'text-emerald-500' : 'text-zinc-600'}>
                    {p.isActive ? 'Active' : 'Off'}
                  </span>
                </td>
                <td className="py-3 space-x-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(p)}
                    className="text-xs uppercase tracking-wider hover:text-gold"
                  >
                    {p.isActive ? 'Tắt' : 'Bật'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id, p.name)}
                    className="text-xs uppercase tracking-wider text-red-400/70 hover:text-red-400"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
