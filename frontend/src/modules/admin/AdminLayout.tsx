import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/shared/auth/AuthProvider'
import { PageLayout } from '@/shared/components/PageLayout'
import { LoadingState } from '@/shared/components/LoadingState'
import {
  fetchAllCustomers,
  fetchAppointments,
  fetchOrders,
  seedAdminData,
} from '@/shared/api/endpoints'
import { formatVnd } from '@/shared/api/types'
import { FirebaseStatusBanner } from './components/FirebaseStatusBanner'

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
          <p className="mt-4 text-sm text-zinc-500">
            Tài khoản này là khách hàng thường. Admin chỉ dành cho UID có trong{' '}
            <code className="text-zinc-400">FIREBASE_ADMIN_UIDS</code> và đã chạy{' '}
            <code className="text-zinc-400">set-admin.js</code>.
          </p>
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

        <FirebaseStatusBanner />

        <Outlet />
      </div>
    </PageLayout>
  )
}

export function AdminOverview() {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    pendingAppointments: 0,
    customers: 0,
    revenueToday: 0,
  })
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const [orders, appointments, customers] = await Promise.all([
        fetchOrders(),
        fetchAppointments(),
        fetchAllCustomers(),
      ])
      const today = new Date().toDateString()
      const revenueToday = orders
        .filter(
          (o) =>
            o.status === 'Paid' &&
            new Date(o.paidAt ?? o.createdAt).toDateString() === today,
        )
        .reduce((sum, o) => sum + o.totalAmount, 0)

      setStats({
        pendingOrders: orders.filter((o) => o.status === 'Pending').length,
        pendingAppointments: appointments.filter((a) => a.status === 'Pending').length,
        customers: customers.length,
        revenueToday,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Đơn chờ thanh toán" value={loading ? '…' : String(stats.pendingOrders)} href="/admin/orders" />
        <StatCard label="Lịch hẹn chờ duyệt" value={loading ? '…' : String(stats.pendingAppointments)} href="/admin/appointments" />
        <StatCard label="Khách hàng" value={loading ? '…' : String(stats.customers)} href="/admin/customers" />
        <StatCard label="Doanh thu hôm nay" value={loading ? '…' : formatVnd(stats.revenueToday)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: '/admin/orders', label: 'Theo dõi đơn hàng', desc: 'Xem chi tiết, xác nhận thanh toán CK' },
          { to: '/admin/appointments', label: 'Lịch hẹn', desc: 'Duyệt yêu cầu đặt lịch từ website' },
          { to: '/admin/services', label: 'Quản lý dịch vụ', desc: 'Thêm/sửa bảng giá, bật/tắt dịch vụ' },
          { to: '/admin/products', label: 'Sản phẩm retail', desc: 'Moroccanoil — giá, tồn kho, ảnh' },
          { to: '/admin/promotions', label: 'Khuyến mãi', desc: 'Tạo/sửa mã giảm giá' },
          { to: '/admin/customers', label: 'Khách hàng', desc: 'Điểm tích lũy, điều chỉnh thủ công' },
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
    </div>
  )
}

function StatCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="border border-zinc-800 p-5 transition hover:border-zinc-700">
      <p className="text-xs uppercase tracking-widest text-zinc-600">{label}</p>
      <p className="mt-2 font-serif text-2xl text-zinc-100">{value}</p>
    </div>
  )
  return href ? <Link to={href}>{content}</Link> : content
}
