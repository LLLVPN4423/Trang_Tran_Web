import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import { PageLayout } from '@/shared/components/PageLayout'
import { LoadingState } from '@/shared/components/LoadingState'
import { seedAdminData } from '@/shared/api/endpoints'
import { useState } from 'react'

const TITLES: Record<string, string> = {
  '/admin': 'Tổng quan',
  '/admin/orders': 'Đơn hàng',
  '/admin/appointments': 'Lịch hẹn',
  '/admin/services': 'Dịch vụ',
  '/admin/products': 'Sản phẩm',
  '/admin/promotions': 'Khuyến mãi',
  '/admin/customers': 'Khách hàng',
}

export function AdminLayout() {
  const { isConfigured, isLoading, isAdmin, user } = useAuth()
  const location = useLocation()
  const [seedMsg, setSeedMsg] = useState<string | null>(null)

  if (!isConfigured) {
    return (
      <PageLayout variant="admin">
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-serif text-3xl text-zinc-200">Firebase chưa cấu hình</h1>
          <Link to="/" className="mt-8 inline-block text-sm text-gold-muted hover:underline">← Trang chủ</Link>
        </div>
      </PageLayout>
    )
  }

  if (isLoading) {
    return (
      <PageLayout variant="admin">
        <LoadingState label="Đang kiểm tra quyền..." />
      </PageLayout>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-serif text-3xl text-zinc-200">Không có quyền Admin</h1>
          <Link to="/" className="mt-8 inline-block text-sm text-gold-muted hover:underline">← Trang chủ</Link>
        </div>
      </PageLayout>
    )
  }

  const handleForceSeed = async () => {
    if (!confirm('Ghi đè toàn bộ dữ liệu seed?')) return
    const result = await seedAdminData(true)
    setSeedMsg(result.message)
  }

  return (
    <PageLayout variant="admin">
      <div className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">Admin Portal</p>
            <h1 className="mt-2 font-serif text-2xl text-zinc-100 sm:text-3xl">
              {TITLES[location.pathname] ?? 'Quản lý Salon'}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleForceSeed}
            className="text-xs uppercase tracking-widest text-zinc-600 hover:text-gold"
          >
            Force Re-seed
          </button>
        </div>

        {seedMsg && (
          <p className="mb-6 rounded-sm border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
            {seedMsg}
          </p>
        )}

        <Outlet />
      </div>
    </PageLayout>
  )
}

export function AdminOverview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[
        { to: '/admin/orders', label: 'Theo dõi đơn hàng', desc: 'Xem, cập nhật trạng thái thanh toán' },
        { to: '/admin/appointments', label: 'Lịch hẹn', desc: 'Duyệt yêu cầu đặt lịch từ website' },
        { to: '/admin/services', label: 'Quản lý dịch vụ', desc: 'Bảng giá salon, bật/tắt dịch vụ' },
        { to: '/admin/products', label: 'Sản phẩm retail', desc: 'Moroccanoil, tồn kho, ảnh' },
        { to: '/admin/promotions', label: 'Khuyến mãi', desc: 'Mã giảm giá WELCOME10, SALON50K...' },
        { to: '/admin/customers', label: 'Khách hàng', desc: 'Điểm tích lũy, lịch sử chi tiêu' },
      ].map((card) => (
        <Link
          key={card.to}
          to={card.to}
          className="border border-zinc-800 p-6 transition hover:border-zinc-700 hover:bg-zinc-900/30"
        >
          <h2 className="font-serif text-xl text-zinc-200">{card.label}</h2>
          <p className="mt-2 text-sm text-zinc-500">{card.desc}</p>
        </Link>
      ))}
    </div>
  )
}
