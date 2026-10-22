import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProductResponse } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { getProductGallery, resolveProductImageUrl } from '@/shared/lib/productMedia'
import { useCartStore } from '@/shared/store/cartStore'

interface Props {
  product: ProductResponse
}

export function ProductCard({ product }: Props) {
  const addProduct = useCartStore((s) => s.addProduct)
  const [added, setAdded] = useState(false)
  const outOfStock = product.stock <= 0
  const thumb = getProductGallery(product)[0]
  const imageCount = getProductGallery(product).length

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    addProduct(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link to={`/catalog/product/${product.id}`} className="catalog-card group">
      <div className="min-w-0">
        <div className="media-frame mb-2.5 aspect-square w-full sm:mb-4 sm:aspect-[4/5]">
          {thumb ? (
            <img
              src={resolveProductImageUrl(thumb)}
              alt={product.name}
              className="media-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-elevated">
              <span className="label-caps">Chưa có ảnh</span>
            </div>
          )}
        </div>
        <p className="catalog-card-meta">{product.brand}</p>
        <h3 className="catalog-card-title">{product.name}</h3>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted max-sm:hidden">
            {product.description}
          </p>
        )}
        <p className="mt-1.5 text-[0.65rem] text-ink-subtle sm:mt-3 sm:text-xs">
          {outOfStock ? 'Hết hàng' : `Còn ${product.stock}`}
          <span className="hidden sm:inline">
            {!outOfStock && ' sản phẩm'}
            {imageCount > 0 && ` · ${imageCount} ảnh`}
            {product.videoUrl && ' · Có video'}
          </span>
        </p>
      </div>

      <div className="mt-3 flex min-w-0 items-center justify-between gap-2 border-t border-edge/70 pt-2.5 sm:mt-5 sm:pt-4">
        <span className="min-w-0 truncate font-serif text-sm tabular-nums text-ink-secondary sm:text-lg md:text-xl">
          {formatVnd(product.price)}
        </span>
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="btn-editorial shrink-0 px-2.5 py-1.5 text-[0.65rem] sm:px-3 sm:py-2 sm:text-xs"
        >
          {added ? 'Đã thêm ✓' : 'Thêm'}
        </button>
      </div>
    </Link>
  )
}
