import { NavLink } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import { SALON_PUBLIC } from '@/shared/lib/salonPublicInfo'
import { useCartStore } from '@/shared/store/cartStore'
import { selectCartItemCount } from '@/shared/store/cartSelectors'
import { useServiceCartStore } from '@/shared/store/serviceCartStore'
import { selectServiceCartCount } from '@/shared/store/serviceCartSelectors'

export interface SidebarNavItem {
  to: string
  label: string
  end?: boolean
  badge?: number
  adminOnly?: boolean
  /** Chỉ Platform Admin (quản trị web) — ẩn với Salon Admin. */
  platformOnly?: boolean
  guestOnly?: boolean
}

const MAIN_NAV: SidebarNavItem[] = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/catalog', label: 'Bảng giá dịch vụ' },
  { to: '/appointment', label: 'Đặt lịch dịch vụ' },
  { to: '/shop', label: 'Mua sản phẩm' },
  { to: '/booking', label: 'Thanh toán' },
  { to: '/account', label: 'Tài khoản', guestOnly: false },
  { to: '/account/loyalty', label: 'Tích điểm' },
]

const ADMIN_NAV: SidebarNavItem[] = [
  { to: '/admin', label: 'Tổng quan', end: true, adminOnly: true },
  { to: '/admin/orders', label: 'Đơn hàng', adminOnly: true },
  { to: '/admin/service-invoices', label: 'Hóa đơn DV', adminOnly: true },
  { to: '/admin/revenue', label: 'Doanh thu', adminOnly: true },
  { to: '/admin/appointments', label: 'Lịch hẹn', adminOnly: true },
  { to: '/admin/services', label: 'Dịch vụ', adminOnly: true, platformOnly: true },
  { to: '/admin/products', label: 'Sản phẩm', adminOnly: true, platformOnly: true },
  { to: '/admin/site-content', label: 'Nội dung & liên hệ', adminOnly: true, platformOnly: true },
  { to: '/admin/promotions', label: 'Khuyến mãi', adminOnly: true, platformOnly: true },
  { to: '/admin/customers', label: 'Khách hàng', adminOnly: true },
  { to: '/admin/tools', label: 'Công cụ kỹ thuật', adminOnly: true, platformOnly: true },
]

interface Props {
  variant?: 'customer' | 'admin'
  onNavigate?: () => void
}

export function AppSidebar({ variant = 'customer', onNavigate }: Props) {
  const { user, isAdmin, adminRole, logout } = useAuth()
  const itemCount = useCartStore(selectCartItemCount)
  const serviceCount = useServiceCartStore(selectServiceCartCount)

  const items = variant === 'admin' ? ADMIN_NAV : MAIN_NAV

  return (
    <aside className="flex h-full flex-col border-r border-edge/80 bg-section/95 p-5 sm:p-6">
      <div className="mb-7">
        <p className="section-eyebrow">
          {variant === 'admin' ? 'Admin Portal' : 'Trang Tran Hair'}
        </p>
        <h2 className="mt-2 font-serif text-xl text-ink sm:text-2xl">
          {variant === 'admin' ? 'Quản trị' : 'Salon Menu'}
        </h2>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          if (item.adminOnly && !isAdmin) return null
          if (item.platformOnly && adminRole !== 'platform') return null
          if (item.guestOnly === false && !user && item.to.startsWith('/account')) {
            return (
              <NavLink
                key={item.to}
                to="/login"
                onClick={onNavigate}
                className="rounded-sm px-3 py-2.5 text-sm text-ink-subtle transition hover:bg-elevated hover:text-ink"
              >
                Đăng nhập / Đăng ký
              </NavLink>
            )
          }

          const badge =
            item.to === '/booking' ? itemCount : item.to === '/appointment' ? serviceCount : item.badge

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `rounded-sm px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-elevated text-gold-300'
                    : 'text-ink-subtle hover:bg-elevated/70 hover:text-ink-secondary'
                }`
              }
            >
              <span className="flex items-center justify-between gap-3">
                <span>{item.label}</span>
                {badge != null && badge > 0 && (
                  <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-medium text-canvas">
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
                  ? 'border-gold-500/40 bg-gold-500/10 text-gold-300'
                  : 'border-edge text-ink-subtle hover:border-edge-strong hover:text-ink-secondary'
              }`
            }
          >
            Admin Portal
          </NavLink>
        )}
      </nav>

      {variant === 'customer' && (
        <div className="mt-6 space-y-2 border-t border-edge/80 pt-4 text-xs">
          <p className="label-caps">Maps & MXH</p>
          <a
            href={SALON_PUBLIC.mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-ink-subtle transition hover:text-gold-300"
          >
            Google Maps
          </a>
          <a
            href={SALON_PUBLIC.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-ink-subtle transition hover:text-gold-300"
          >
            Facebook
          </a>
          <a
            href={SALON_PUBLIC.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-ink-subtle transition hover:text-gold-300"
          >
            Portfolio
          </a>
        </div>
      )}

      {user && (
        <div className="mt-auto border-t border-edge pt-4">
          <p className="truncate text-xs text-ink-subtle">{user.email}</p>
          <button
            type="button"
            onClick={() => {
              logout()
              onNavigate?.()
            }}
            className="mt-3 text-xs uppercase tracking-widest text-ink-subtle transition hover:text-danger"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </aside>
  )
}
