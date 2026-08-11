import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProduct } from '@/shared/api/endpoints'
import type { ProductResponse } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { useCartStore } from '@/shared/store/cartStore'
import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'
import { PageLayout } from '@/shared/components/PageLayout'
import { LoadingState } from '@/shared/components/LoadingState'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { ProductGalleryFromProduct } from './components/ProductGallery'
import { ProductVideo } from './components/ProductVideo'
import { getProductGallery } from '@/shared/lib/productMedia'

export function ProductDetailPage() {
  return (
    <ModuleErrorBoundary moduleName="ProductDetail">
      <ProductDetailContent />
    </ModuleErrorBoundary>
  )
}

function ProductDetailContent() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const addProduct = useCartStore((s) => s.addProduct)
  const itemCount = useCartStore((s) => s.itemCount())

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetchProduct(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không tải được sản phẩm'))
      .finally(() => setLoading(false))
  }, [id])

  const outOfStock = (product?.stock ?? 0) <= 0
  const galleryCount = product ? getProductGallery(product).length : 0

  const handleAdd = () => {
    if (!product || outOfStock) return
    addProduct(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <PageLayout>
      <div className="section-inner px-5 py-12 sm:px-8 sm:py-16">
        <Link to="/catalog" className="text-xs uppercase tracking-widest text-gold-muted hover:text-gold">
          ← Quay lại catalog
        </Link>

        {loading && <div className="mt-10"><LoadingState label="Đang tải sản phẩm..." /></div>}
        {error && !loading && <div className="mt-10"><ApiErrorState message={error} /></div>}

        {!loading && !error && product && !product.isActive && (
          <p className="mt-10 text-center text-zinc-500">Sản phẩm không còn bán.</p>
        )}

        {!loading && !error && product && product.isActive && (
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <ProductGalleryFromProduct product={product} />
            </div>

            <div>
              <p className="section-eyebrow">{product.brand}</p>
              <h1 className="section-title mt-2">{product.name}</h1>
              <p className="mt-4 font-serif text-3xl text-gold">{formatVnd(product.price)}</p>
              <p className="mt-2 text-sm text-zinc-500">
                {outOfStock ? 'Hết hàng' : `Còn ${product.stock} sản phẩm`}
                {galleryCount > 0 && ` · ${galleryCount} ảnh`}
              </p>

              {product.description && (
                <div className="mt-8 border-t border-zinc-800/80 pt-6">
                  <h2 className="text-xs uppercase tracking-widest text-zinc-500">Mô tả</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={outOfStock}
                  className="btn-gold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {added ? 'Đã thêm ✓' : 'Thêm vào giỏ'}
                </button>
                {itemCount > 0 && (
                  <Link to="/booking" className="btn-editorial px-6 py-3">
                    Thanh toán ({itemCount})
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && product && product.isActive && (
          <ProductVideo videoUrl={product.videoUrl} title={product.name} />
        )}
      </div>
    </PageLayout>
  )
}
