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
    <Link
      to={`/catalog/product/${product.id}`}
      className="group flex h-full flex-col justify-between border border-zinc-800/70 bg-zinc-950/40 p-4 transition hover:border-zinc-700/90 sm:p-5"
    >
      <div>
        <div className="media-frame mb-4 aspect-[4/5] w-full">
          {thumb ? (
            <img
              src={resolveProductImageUrl(thumb)}
              alt={product.name}
              className="media-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-900/60">
              <span className="label-caps text-zinc-600">Chưa có ảnh</span>
            </div>
          )}
        </div>
        <p className="section-eyebrow mb-2">{product.brand}</p>
        <h3 className="font-serif text-xl leading-snug text-zinc-100 transition group-hover:text-gold md:text-2xl">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">{product.description}</p>
        )}
        <p className="mt-3 text-xs text-zinc-600">
          {outOfStock ? 'Hết hàng' : `Còn ${product.stock} sản phẩm`}
          {imageCount > 0 && ` · ${imageCount} ảnh`}
          {product.videoUrl && ' · Có video'}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-zinc-800/60 pt-4">
        <span className="font-serif text-lg tabular-nums text-zinc-200 md:text-xl">
          {formatVnd(product.price)}
        </span>
        <div className="flex shrink-0 gap-2">
          <span className="hidden text-xs uppercase tracking-wider text-zinc-500 group-hover:inline sm:inline">
            Chi tiết
          </span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className="btn-editorial px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {added ? 'Đã thêm ✓' : 'Thêm'}
          </button>
        </div>
      </div>
    </Link>
  )
}
