import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import { ServicesAdminPanel } from './ServicesAdminPanel'
import { ProductsAdminPanel } from './ProductsAdminPanel'
type Tab = 'services' | 'products'

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('services')

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-edge pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold-700">Admin Portal</p>
          <h1 className="mt-2 font-serif text-3xl text-ink">Quản lý Salon</h1>
          <p className="mt-1 text-sm text-ink-subtle">{user?.email}</p>
        </div>
        <div className="flex gap-4">
          <Link to="/" className="text-xs uppercase tracking-widest text-ink-subtle hover:text-gold-300">
            ← Trang chủ
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="text-xs uppercase tracking-widest text-ink-subtle hover:text-danger"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        <TabButton active={tab === 'services'} onClick={() => setTab('services')} label="Dịch vụ" />
        <TabButton active={tab === 'products'} onClick={() => setTab('products')} label="Sản phẩm" />
      </div>

      {tab === 'services' && <ServicesAdminPanel />}
      {tab === 'products' && <ProductsAdminPanel />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs uppercase tracking-widest ${
        active ? 'text-gold-500' : 'text-ink-subtle hover:text-ink-secondary'
      }`}
    >
      {label}
    </button>
  )
}
