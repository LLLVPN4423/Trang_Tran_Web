import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import { ServicesAdminPanel } from './ServicesAdminPanel'
import { ProductsAdminPanel } from './ProductsAdminPanel'
import { seedAdminData } from '@/shared/api/endpoints'

type Tab = 'services' | 'products'

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('services')
  const [seedMsg, setSeedMsg] = useState<string | null>(null)

  const handleForceSeed = async () => {
    if (!confirm('Ghi đè toàn bộ dữ liệu seed?')) return
    const result = await seedAdminData(true)
    setSeedMsg(result.message)
  }

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">Admin Portal</p>
          <h1 className="mt-2 font-serif text-3xl text-zinc-100">Quản lý Salon</h1>
          <p className="mt-1 text-sm text-zinc-500">{user?.email}</p>
        </div>
        <div className="flex gap-4">
          <Link to="/" className="text-xs uppercase tracking-widest text-zinc-500 hover:text-gold">
            ← Trang chủ
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="text-xs uppercase tracking-widest text-zinc-500 hover:text-red-400"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        <TabButton active={tab === 'services'} onClick={() => setTab('services')} label="Dịch vụ" />
        <TabButton active={tab === 'products'} onClick={() => setTab('products')} label="Sản phẩm" />
        <button
          type="button"
          onClick={handleForceSeed}
          className="ml-auto text-xs uppercase tracking-widest text-zinc-600 hover:text-gold"
        >
          Force Re-seed
        </button>
      </div>

      {seedMsg && (
        <p className="mb-6 rounded-sm border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
          {seedMsg}
        </p>
      )}

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
        active ? 'text-gold' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  )
}
