import { Link } from 'react-router-dom'
import { useCartStore } from '@/shared/store/cartStore'
import { useAuth } from '@/shared/auth/AuthProvider'

interface Props {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function SiteHeader({ onMenuClick, showMenuButton = true }: Props) {
  const itemCount = useCartStore((s) => s.itemCount())
  const { user, customerProfile } = useAuth()

  return (
    <header className="site-header sticky top-0 z-50 border-b border-zinc-900/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <button
              type="button"
              aria-label="Mở menu"
              onClick={onMenuClick}
              className="rounded-sm border border-zinc-800 px-2.5 py-2 text-zinc-400 hover:border-zinc-700 hover:text-gold lg:hidden"
            >
              <span className="block h-0.5 w-4 bg-current" />
              <span className="mt-1 block h-0.5 w-4 bg-current" />
              <span className="mt-1 block h-0.5 w-4 bg-current" />
            </button>
          )}
          <Link to="/" className="font-serif text-lg tracking-wide text-zinc-100 sm:text-xl">
            Trang Tran
          </Link>
        </div>

        <nav className="hidden items-center gap-5 text-[0.6875rem] font-medium uppercase tracking-[0.22em] md:flex">
          <Link to="/catalog" className="text-zinc-500 transition hover:text-gold">
            Menu
          </Link>
          <Link to="/booking" className="relative text-zinc-500 transition hover:text-gold">
            Giỏ hàng
            {itemCount > 0 && (
              <span className="absolute -right-4 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-zinc-950">
                {itemCount}
              </span>
            )}
          </Link>
          <Link to={user ? '/account' : '/login'} className="text-zinc-500 transition hover:text-gold">
            {user ? 'Tài khoản' : 'Đăng nhập'}
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          {user && customerProfile && (
            <Link to="/account/loyalty" className="text-[10px] uppercase tracking-wider text-gold-muted">
              {customerProfile.loyaltyPoints} điểm
            </Link>
          )}
          <Link
            to="/booking"
            className="relative rounded-sm border border-zinc-800 px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-400"
          >
            Giỏ
            {itemCount > 0 && (
              <span className="ml-1 text-gold">{itemCount}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
