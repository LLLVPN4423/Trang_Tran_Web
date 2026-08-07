import { Link } from 'react-router-dom'
import { useCartStore } from '@/shared/store/cartStore'

export function SiteHeader() {
  const itemCount = useCartStore((s) => s.itemCount())

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-serif text-xl tracking-wide text-zinc-200">
          Trang Tran
        </Link>
        <nav className="flex items-center gap-6 text-xs uppercase tracking-[0.2em]">
          <Link to="/catalog" className="text-zinc-500 transition hover:text-gold">
            Menu
          </Link>
          <Link
            to="/booking"
            className="relative text-zinc-500 transition hover:text-gold"
          >
            Giỏ hàng
            {itemCount > 0 && (
              <span className="absolute -right-4 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-zinc-950">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
