import { Link } from 'react-router-dom'
import { useCartStore } from '@/shared/store/cartStore'
import { selectCartItemCount } from '@/shared/store/cartSelectors'
import { useServiceCartStore } from '@/shared/store/serviceCartStore'
import { selectServiceCartCount } from '@/shared/store/serviceCartSelectors'
import { useAuth } from '@/shared/auth/AuthProvider'

interface Props {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function SiteHeader({ onMenuClick, showMenuButton = true }: Props) {
  const itemCount = useCartStore(selectCartItemCount)
  const serviceCount = useServiceCartStore(selectServiceCartCount)
  const { user, customerProfile } = useAuth()

  return (
    <header className="site-header sticky top-0 z-50 border-b border-edge/70 bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <button
              type="button"
              aria-label="Mở menu"
              onClick={onMenuClick}
              className="rounded-sm border border-edge px-2.5 py-2 text-ink-muted transition hover:border-edge-strong hover:text-gold-500 lg:hidden"
            >
              <span className="block h-0.5 w-4 bg-current" />
              <span className="mt-1 block h-0.5 w-4 bg-current" />
              <span className="mt-1 block h-0.5 w-4 bg-current" />
            </button>
          )}
          <Link to="/" className="flex items-center" aria-label="Trang Tran Hair Salon">
            <img
              src="/logo.png"
              alt="Trang Tran Hair Salon"
              className="h-9 w-auto sm:h-10"
              width={160}
              height={40}
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-5 text-[0.6875rem] font-medium uppercase tracking-[0.22em] md:flex">
          <Link to="/catalog" className="text-ink-subtle transition hover:text-gold-300">
            Bảng giá
          </Link>
          <Link to="/appointment" className="relative text-ink-subtle transition hover:text-gold-300">
            Đặt lịch
            {serviceCount > 0 && (
              <span className="absolute -right-4 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-medium text-canvas">
                {serviceCount}
              </span>
            )}
          </Link>
          <Link to="/shop" className="text-ink-subtle transition hover:text-gold-300">
            Moroccanoil
          </Link>
          <Link to="/booking" className="relative text-ink-subtle transition hover:text-gold-300">
            Thanh toán
            {itemCount > 0 && (
              <span className="absolute -right-4 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-medium text-canvas">
                {itemCount}
              </span>
            )}
          </Link>
          <Link to={user ? '/account' : '/login'} className="text-ink-subtle transition hover:text-gold-300">
            {user ? 'Tài khoản' : 'Đăng nhập'}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {user && customerProfile && (
            <Link to="/account/loyalty" className="text-[10px] uppercase tracking-wider text-gold-700">
              {customerProfile.loyaltyPoints} điểm
            </Link>
          )}
          <HeaderQuickLink to="/appointment" label="Lịch" count={serviceCount} />
          <HeaderQuickLink to="/booking" label="Giỏ" count={itemCount} />
        </div>
      </div>
    </header>
  )
}

function HeaderQuickLink({ to, label, count }: { to: string; label: string; count: number }) {
  return (
    <Link
      to={to}
      className="rounded-sm border border-edge px-3 py-1.5 text-[10px] uppercase tracking-wider text-ink-muted transition hover:border-edge-strong hover:text-ink"
    >
      {label}
      {count > 0 && <span className="ml-1 text-gold-500">{count}</span>}
    </Link>
  )
}
