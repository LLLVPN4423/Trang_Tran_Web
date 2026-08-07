import { NavLink } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import { useCartStore } from '@/shared/store/cartStore'

export interface SidebarNavItem {
  to: string
  label: string
  end?: boolean
  badge?: number
  adminOnly?: boolean
  guestOnly?: boolean
}

const MAIN_NAV: SidebarNavItem[] = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/catalog', label: 'Bảng giá' },
  { to: '/booking', label: 'Giỏ hàng & Thanh toán' },
  { to: '/account', label: 'Tài khoản', guestOnly: false },
  { to: '/account/loyalty', label: 'Tích điểm' },
]

const ADMIN_NAV: SidebarNavItem[] = [
  { to: '/admin', label: 'Tổng quan', end: true, adminOnly: true },
  { to: '/admin/orders', label: 'Đơn hàng', adminOnly: true },
  { to: '/admin/appointments', label: 'Lịch hẹn', adminOnly: true },
  { to: '/admin/services', label: 'Dịch vụ', adminOnly: true },
  { to: '/admin/products', label: 'Sản phẩm', adminOnly: true },
  { to: '/admin/promotions', label: 'Khuyến mãi', adminOnly: true },
  { to: '/admin/customers', label: 'Khách hàng', adminOnly: true },
]

interface Props {
  variant?: 'customer' | 'admin'
  onNavigate?: () => void
}

export function AppSidebar({ variant = 'customer', onNavigate }: Props) {
  const { user, isAdmin, logout } = useAuth()
  const itemCount = useCartStore((s) => s.itemCount())

  const items = variant === 'admin' ? ADMIN_NAV : MAIN_NAV

  return (
    <aside className="flex h-full flex-col border-r border-zinc-800 bg-zinc-950/95 p-6">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">
          {variant === 'admin' ? 'Admin Portal' : 'Trang Tran Hair'}
        </p>
        <h2 className="mt-2 font-serif text-2xl text-zinc-100">
          {variant === 'admin' ? 'Quản trị' : 'Salon Menu'}
        </h2>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          if (item.adminOnly && !isAdmin) return null
          if (item.guestOnly === false && !user && item.to.startsWith('/account')) {
            return (
              <NavLink
                key={item.to}
                to="/login"
                onClick={onNavigate}
                className="rounded-sm px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-200"
              >
                Đăng nhập / Đăng ký
              </NavLink>
            )
          }

          const badge = item.to === '/booking' ? itemCount : item.badge

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `rounded-sm px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-zinc-900 text-gold'
                    : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-200'
                }`
              }
            >
              <span className="flex items-center justify-between gap-3">
                <span>{item.label}</span>
                {badge != null && badge > 0 && (
                  <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium text-zinc-950">
                    {badge}
                  </span>
                )}
              </span>
            </NavLink>
          )
        })}

        {isAdmin && variant !== 'admin' && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              `mt-4 rounded-sm border px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'border-gold/40 bg-gold/10 text-gold'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
              }`
            }
          >
            Admin Portal
          </NavLink>
        )}
      </nav>

      {user && (
        <div className="mt-auto border-t border-zinc-800 pt-4">
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
          <button
            type="button"
            onClick={() => {
              logout()
              onNavigate?.()
            }}
            className="mt-3 text-xs uppercase tracking-widest text-zinc-600 hover:text-red-400"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </aside>
  )
}
