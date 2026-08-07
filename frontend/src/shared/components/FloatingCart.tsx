import { Link } from 'react-router-dom'
import { useCartStore } from '@/shared/store/cartStore'

export function FloatingCart() {
  const itemCount = useCartStore((s) => s.itemCount())

  if (itemCount === 0) return null

  return (
    <Link
      to="/booking"
      className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-gold/95 px-5 py-3 text-xs font-medium uppercase tracking-widest text-zinc-950 shadow-lg transition hover:bg-gold"
    >
      Giỏ hàng
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-950/20 px-1.5">
        {itemCount}
      </span>
    </Link>
  )
}
