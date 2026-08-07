import { useState } from 'react'
import type { ProductResponse } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { useCartStore } from '@/shared/store/cartStore'

interface Props {
  product: ProductResponse
}

export function ProductCard({ product }: Props) {
  const addProduct = useCartStore((s) => s.addProduct)
  const [added, setAdded] = useState(false)
  const outOfStock = product.stock <= 0

  const handleAdd = () => {
    if (outOfStock) return
    addProduct(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <article className="group flex flex-col justify-between border border-zinc-800/60 p-4 transition hover:border-zinc-700 sm:p-6">
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="mb-4 aspect-square w-full object-cover"
          loading="lazy"
        />
      )}
      <div>
        <p className="text-xs uppercase tracking-widest text-gold-muted">{product.brand}</p>
        <h3 className="mt-2 font-serif text-2xl text-zinc-100">{product.name}</h3>
        {product.description && (
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">{product.description}</p>
        )}
        <p className="mt-3 text-xs text-zinc-600">
          {outOfStock ? 'Hết hàng' : `Còn ${product.stock} sản phẩm`}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="font-serif text-xl text-zinc-200">{formatVnd(product.price)}</span>
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="shrink-0 border border-zinc-700 px-4 py-2 text-xs uppercase tracking-widest text-zinc-400 transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added ? 'Đã thêm ✓' : 'Thêm'}
        </button>
      </div>
    </article>
  )
}
