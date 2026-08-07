import { useCallback, useEffect, useState } from 'react'
import {
  deleteProduct,
  fetchAllProducts,
  updateProduct,
} from '@/shared/api/endpoints'
import type { ProductResponse } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { uploadProductImage } from '@/shared/auth/firebase'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'

export function ProductsAdminPanel() {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [imageUrlDraft, setImageUrlDraft] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)

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

  const startEditImage = (product: ProductResponse) => {
    setEditingId(product.id)
    setImageUrlDraft(product.imageUrl ?? '')
  }

  const saveImageUrl = async (product: ProductResponse) => {
    await updateProduct(product.id, {
      name: product.name,
      description: product.description,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      imageUrl: imageUrlDraft.trim() || null,
      isActive: product.isActive,
    })
    setEditingId(null)
    load()
  }

  const handleUpload = async (product: ProductResponse, file: File) => {
    setUploadingId(product.id)
    try {
      const url = await uploadProductImage(file, product.id)
      await updateProduct(product.id, {
        name: product.name,
        description: product.description,
        brand: product.brand,
        price: product.price,
        stock: product.stock,
        imageUrl: url,
        isActive: product.isActive,
      })
      setEditingId(null)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload thất bại')
    } finally {
      setUploadingId(null)
    }
  }

  if (loading) return <LoadingState label="Đang tải sản phẩm..." />
  if (error) return <ApiErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl text-zinc-200">Moroccanoil ({products.length})</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        {products.map((p) => (
          <article key={p.id} className="border border-zinc-800 p-4">
            <div className="flex gap-4">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="h-24 w-24 shrink-0 object-cover" />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-zinc-900 text-xs text-zinc-600">
                  No img
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg text-zinc-200">{p.name}</p>
                <p className="text-sm text-zinc-500">{formatVnd(p.price)} · Tồn {p.stock}</p>
                <p className={`mt-1 text-xs ${p.isActive ? 'text-emerald-500' : 'text-zinc-600'}`}>
                  {p.isActive ? 'Active' : 'Off'}
                </p>
              </div>
            </div>

            {editingId === p.id ? (
              <div className="mt-4 space-y-3">
                <input
                  value={imageUrlDraft}
                  onChange={(e) => setImageUrlDraft(e.target.value)}
                  placeholder="https://... imageUrl"
                  className="w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
                />
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
                    Upload ảnh (Firebase Storage)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingId === p.id}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(p, file)
                    }}
                    className="text-xs text-zinc-500"
                  />
                </label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => saveImageUrl(p)} className="text-xs uppercase tracking-widest text-gold">
                    Lưu URL
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs text-zinc-600">
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => startEditImage(p)} className="text-xs uppercase tracking-wider hover:text-gold">
                  Ảnh
                </button>
                <button type="button" onClick={() => toggleActive(p)} className="text-xs uppercase tracking-wider hover:text-gold">
                  {p.isActive ? 'Tắt' : 'Bật'}
                </button>
                <button type="button" onClick={() => handleDelete(p.id, p.name)} className="text-xs uppercase tracking-wider text-red-400/70 hover:text-red-400">
                  Xóa
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
