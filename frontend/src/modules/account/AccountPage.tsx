import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import {
  fetchLoyaltyHistory,
  fetchLoyaltyRules,
  fetchLoyaltySummary,
  fetchMyAppointments,
  fetchOrders,
  syncCustomer,
  updateCustomerMe,
} from '@/shared/api/endpoints'
import type {
  AppointmentResponse,
  LoyaltySummaryResponse,
  LoyaltyTransactionResponse,
  LoyaltyTransactionType,
  OrderResponse,
} from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { PageLayout } from '@/shared/components/PageLayout'
import { LoadingState } from '@/shared/components/LoadingState'
import { ApiErrorState } from '@/shared/components/ApiErrorState'

type AccountTab = 'overview' | 'points' | 'orders' | 'appointments' | 'profile'

const TAB_LABELS: Record<AccountTab, string> = {
  overview: 'Tổng quan',
  points: 'Điểm tích lũy',
  orders: 'Đơn hàng',
  appointments: 'Lịch hẹn',
  profile: 'Hồ sơ',
}

const VALID_TABS = new Set<AccountTab>(['overview', 'points', 'orders', 'appointments', 'profile'])

export function AccountPage() {
  const { user, customerProfile, isLoading, refreshProfile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = useMemo(() => {
    const raw = searchParams.get('tab')
    return raw && VALID_TABS.has(raw as AccountTab) ? (raw as AccountTab) : 'overview'
  }, [searchParams])

  const setTab = (tab: AccountTab) => {
    setSearchParams(tab === 'overview' ? {} : { tab }, { replace: true })
  }

  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [loyaltySummary, setLoyaltySummary] = useState<LoyaltySummaryResponse | null>(null)
  const [loyaltyRules, setLoyaltyRules] = useState<LoyaltySummaryResponse | null>(null)
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyTransactionResponse[]>([])

  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [loadingLoyalty, setLoadingLoyalty] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true)
    setError(null)
    try {
      setOrders(await fetchOrders())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được đơn hàng')
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  const loadAppointments = useCallback(async () => {
    setLoadingAppointments(true)
    try {
      setAppointments(await fetchMyAppointments())
    } catch {
      setAppointments([])
    } finally {
      setLoadingAppointments(false)
    }
  }, [])

  const loadLoyalty = useCallback(async () => {
    setLoadingLoyalty(true)
    try {
      const [summary, rules, history] = await Promise.all([
        fetchLoyaltySummary(),
        fetchLoyaltyRules(),
        fetchLoyaltyHistory(),
      ])
      setLoyaltySummary(summary)
      setLoyaltyRules(rules)
      setLoyaltyHistory(history)
      await refreshProfile()
    } catch {
      setLoyaltySummary(null)
      setLoyaltyRules(null)
      setLoyaltyHistory([])
    } finally {
      setLoadingLoyalty(false)
    }
  }, [refreshProfile])

  useEffect(() => {
    if (user) {
      loadOrders()
      loadAppointments()
      loadLoyalty()
    }
  }, [user, loadOrders, loadAppointments, loadLoyalty])

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingState label="Đang tải..." />
      </PageLayout>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!customerProfile) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-md px-6 py-16">
          <h1 className="font-serif text-3xl text-zinc-100">Hoàn tất hồ sơ</h1>
          <p className="mt-3 text-sm text-zinc-500">Nhập thông tin để tích điểm và theo dõi đơn hàng.</p>
          <ProfileSyncForm
            email={user.email ?? ''}
            defaultName={user.displayName ?? ''}
          />
        </div>
      </PageLayout>
    )
  }

  const points = loyaltySummary?.points ?? customerProfile.loyaltyPoints
  const totalSpent = loyaltySummary?.totalSpent ?? customerProfile.totalSpent
  const pendingAppointments = appointments.filter((a) => a.status === 'Pending' || a.status === 'Confirmed').length
  const paidOrders = orders.filter((o) => o.status === 'Paid').length
  const totalPointsEarned = loyaltyHistory.filter((t) => t.type === 'Earn').reduce((s, t) => s + t.points, 0)
  const totalPointsRedeemed = Math.abs(
    loyaltyHistory.filter((t) => t.type === 'Redeem').reduce((s, t) => s + t.points, 0),
  )

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">Tài khoản</p>
        <h1 className="mt-3 font-serif text-3xl text-zinc-100 sm:text-4xl">
          Xin chào, {customerProfile.name}
        </h1>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
          {customerProfile.phone && <span>SĐT: {customerProfile.phone}</span>}
          {(customerProfile.email ?? user.email) && (
            <span>Email: {customerProfile.email ?? user.email}</span>
          )}
          <span>Thành viên từ {formatDate(customerProfile.createdAt)}</span>
        </div>

        <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-b border-zinc-800/80 pb-4">
          {(Object.keys(TAB_LABELS) as AccountTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTab(tab)}
              className={`text-xs uppercase tracking-widest transition ${
                activeTab === tab ? 'text-gold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>

        {activeTab === 'overview' && (
          <OverviewSection
            points={points}
            totalSpent={totalSpent}
            orderCount={orders.length}
            paidOrders={paidOrders}
            pendingAppointments={pendingAppointments}
            totalPointsEarned={totalPointsEarned}
            totalPointsRedeemed={totalPointsRedeemed}
            rules={loyaltyRules}
            loadingLoyalty={loadingLoyalty}
            recentHistory={loyaltyHistory.slice(0, 5)}
            recentOrders={orders.slice(0, 3)}
            onGoToTab={setTab}
          />
        )}

        {activeTab === 'points' && (
          <PointsSection
            points={points}
            totalSpent={totalSpent}
            totalPointsEarned={totalPointsEarned}
            totalPointsRedeemed={totalPointsRedeemed}
            summary={loyaltySummary}
            rules={loyaltyRules}
            history={loyaltyHistory}
            loading={loadingLoyalty}
            orders={orders}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersSection
            orders={orders}
            loading={loadingOrders}
            error={error}
            onRetry={loadOrders}
            rules={loyaltyRules}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsSection appointments={appointments} loading={loadingAppointments} />
        )}

        {activeTab === 'profile' && (
          <ProfileSection
            name={customerProfile.name}
            phone={customerProfile.phone}
            email={customerProfile.email ?? user.email ?? ''}
            createdAt={customerProfile.createdAt}
            points={points}
            totalSpent={totalSpent}
            onSaved={refreshProfile}
          />
        )}
      </div>
    </PageLayout>
  )
}

function OverviewSection({
  points,
  totalSpent,
  orderCount,
  paidOrders,
  pendingAppointments,
  totalPointsEarned,
  totalPointsRedeemed,
  rules,
  loadingLoyalty,
  recentHistory,
  recentOrders,
  onGoToTab,
}: {
  points: number
  totalSpent: number
  orderCount: number
  paidOrders: number
  pendingAppointments: number
  totalPointsEarned: number
  totalPointsRedeemed: number
  rules: LoyaltySummaryResponse | null
  loadingLoyalty: boolean
  recentHistory: LoyaltyTransactionResponse[]
  recentOrders: OrderResponse[]
  onGoToTab: (tab: AccountTab) => void
}) {
  return (
    <div className="mt-8 space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Điểm hiện tại" value={String(points)} accent onClick={() => onGoToTab('points')} />
        <StatCard label="Tổng chi tiêu" value={formatVnd(totalSpent)} />
        <StatCard label="Đơn hàng" value={String(orderCount)} sub={`${paidOrders} đã thanh toán`} onClick={() => onGoToTab('orders')} />
        <StatCard label="Lịch hẹn" value={String(pendingAppointments)} sub="đang chờ / đã xác nhận" onClick={() => onGoToTab('appointments')} />
      </div>

      {!loadingLoyalty && rules && (
        <div className="border border-zinc-800 p-5 sm:p-6">
          <h2 className="font-serif text-xl text-zinc-200">Chương trình tích điểm</h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li>• Tích {rules.pointsPerTenThousandVnd} điểm / 10.000đ khi thanh toán thành công (làm tròn xuống theo 10.000đ)</li>
            <li>• Đổi {rules.redeemRatePoints} điểm = {formatVnd(rules.redeemRateValueVnd)} giảm giá tại checkout</li>
            <li>• Đã tích <span className="text-emerald-400">+{totalPointsEarned}</span> điểm · Đã dùng <span className="text-amber-400">−{totalPointsRedeemed}</span> điểm</li>
          </ul>
          <button type="button" onClick={() => onGoToTab('points')} className="mt-4 text-xs uppercase tracking-widest text-gold-muted hover:text-gold">
            Xem chi tiết điểm →
          </button>
        </div>
      )}

      <div>
        <SectionHeader title="Giao dịch điểm gần đây" actionLabel="Xem tất cả" onAction={() => onGoToTab('points')} />
        {loadingLoyalty && <LoadingState label="Đang tải điểm..." />}
        {!loadingLoyalty && recentHistory.length === 0 && (
          <p className="text-zinc-500">Chưa có giao dịch điểm. Mua hàng và thanh toán để bắt đầu tích điểm.</p>
        )}
        {!loadingLoyalty && recentHistory.length > 0 && (
          <div className="space-y-2">
            {recentHistory.map((tx) => (
              <LoyaltyTransactionRow key={tx.id} tx={tx} compact />
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHeader title="Đơn hàng gần đây" actionLabel="Xem tất cả" onAction={() => onGoToTab('orders')} />
        {recentOrders.length === 0 ? (
          <p className="text-zinc-500">
            Chưa có đơn. <Link to="/catalog" className="text-gold-muted hover:text-gold">Xem menu →</Link>
          </p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PointsSection({
  points,
  totalSpent,
  totalPointsEarned,
  totalPointsRedeemed,
  summary,
  rules,
  history,
  loading,
  orders,
}: {
  points: number
  totalSpent: number
  totalPointsEarned: number
  totalPointsRedeemed: number
  summary: LoyaltySummaryResponse | null
  rules: LoyaltySummaryResponse | null
  history: LoyaltyTransactionResponse[]
  loading: boolean
  orders: OrderResponse[]
}) {
  const redeemValue = rules
    ? Math.floor(points / rules.redeemRatePoints) * rules.redeemRateValueVnd
    : 0

  const orderById = new Map(orders.map((o) => [o.id, o]))

  if (loading) {
    return (
      <div className="mt-8">
        <LoadingState label="Đang tải thông tin điểm..." />
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-10">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-gold/20 bg-gold/5 p-6">
          <p className="text-xs uppercase tracking-widest text-gold-muted">Số điểm hiện tại</p>
          <p className="mt-3 font-serif text-5xl tabular-nums text-gold">{points}</p>
          {rules && redeemValue > 0 && (
            <p className="mt-2 text-sm text-zinc-400">Có thể đổi tối đa {formatVnd(redeemValue)} tại checkout</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-1">
          <div className="border border-zinc-800 p-5">
            <p className="text-xs uppercase tracking-widest text-zinc-600">Tổng chi tiêu</p>
            <p className="mt-2 font-serif text-2xl tabular-nums text-zinc-200">{formatVnd(totalSpent)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-zinc-800 p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">Đã tích</p>
              <p className="mt-1 font-serif text-xl tabular-nums text-emerald-400">+{totalPointsEarned}</p>
            </div>
            <div className="border border-zinc-800 p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">Đã dùng</p>
              <p className="mt-1 font-serif text-xl tabular-nums text-amber-400">−{totalPointsRedeemed}</p>
            </div>
          </div>
        </div>
      </div>

      {rules && (
        <div className="border border-zinc-800 p-5 sm:p-6 text-sm text-zinc-400">
          <h2 className="font-serif text-xl text-zinc-200">Quy tắc tích & đổi điểm</h2>
          <ul className="mt-4 space-y-2">
            <li>• Tích {rules.pointsPerTenThousandVnd} điểm / 10.000đ trên phần tiền đã thanh toán (làm tròn xuống — ví dụ 19.999đ = 1 điểm)</li>
            <li>• Đổi {rules.redeemRatePoints} điểm = {formatVnd(rules.redeemRateValueVnd)} giảm giá</li>
            <li>• Chỉ áp dụng khi đăng nhập và nhập số điểm tại bước thanh toán</li>
            <li>• Điểm được cộng sau khi salon xác nhận thanh toán (trạng thái Đã thanh toán)</li>
          </ul>
          {summary && (
            <p className="mt-4 text-xs text-zinc-600">
              Số dư đồng bộ: {summary.points} điểm · Chi tiêu tích lũy: {formatVnd(summary.totalSpent)}
            </p>
          )}
        </div>
      )}

      <div>
        <h2 className="font-serif text-2xl text-zinc-200">Lịch sử giao dịch điểm</h2>
        <p className="mt-1 text-sm text-zinc-500">{history.length} giao dịch</p>

        {history.length === 0 ? (
          <p className="mt-6 text-zinc-500">Chưa có giao dịch điểm.</p>
        ) : (
          <div className="mt-6 divide-y divide-zinc-900 border border-zinc-800">
            {history.map((tx) => (
              <LoyaltyTransactionRow
                key={tx.id}
                tx={tx}
                linkedOrder={tx.orderId ? orderById.get(tx.orderId) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OrdersSection({
  orders,
  loading,
  error,
  onRetry,
  rules,
}: {
  orders: OrderResponse[]
  loading: boolean
  error: string | null
  onRetry: () => void
  rules: LoyaltySummaryResponse | null
}) {
  const paid = orders.filter((o) => o.status === 'Paid')
  const stats = {
    total: orders.length,
    paid: paid.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    spent: paid.reduce((s, o) => s + o.totalAmount, 0),
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-4">
        <MiniStat label="Tổng đơn" value={String(stats.total)} />
        <MiniStat label="Đã thanh toán" value={String(stats.paid)} />
        <MiniStat label="Chờ thanh toán" value={String(stats.pending)} />
        <MiniStat label="Đã chi" value={formatVnd(stats.spent)} />
      </div>

      {stats.pending > 0 && (
        <p className="text-sm text-amber-400/90">
          {stats.pending} đơn đang chờ thanh toán — điểm chỉ được cộng khi salon xác nhận đã thanh toán (trạng thái Đã thanh toán).
        </p>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-zinc-200">Lịch sử đơn hàng</h2>
        <Link to="/catalog" className="text-xs uppercase tracking-widest text-gold-muted hover:text-gold">
          Đặt thêm →
        </Link>
      </div>

      {loading && <LoadingState label="Đang tải đơn..." />}
      {error && <ApiErrorState message={error} onRetry={onRetry} />}

      {!loading && !error && orders.length === 0 && (
        <p className="text-zinc-500">Bạn chưa có đơn hàng nào.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} rules={rules} />
        ))}
      </div>
    </div>
  )
}

function AppointmentsSection({
  appointments,
  loading,
}: {
  appointments: AppointmentResponse[]
  loading: boolean
}) {
  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl text-zinc-200">Lịch hẹn của tôi</h2>
        <Link to="/#contact" className="text-xs uppercase tracking-widest text-gold-muted hover:text-gold">
          Đặt lịch mới →
        </Link>
      </div>

      {loading && <LoadingState label="Đang tải lịch hẹn..." />}

      {!loading && appointments.length === 0 && (
        <p className="text-zinc-500">
          Chưa có lịch hẹn. Gửi yêu cầu tại form{' '}
          <Link to="/#contact" className="text-gold-muted hover:text-gold">Đặt lịch</Link> trên trang chủ.
        </p>
      )}

      <div className="space-y-4">
        {appointments.map((item) => (
          <article key={item.id} className="border border-zinc-800 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-lg text-zinc-200">
                  {APPOINTMENT_SERVICE_LABELS[item.serviceInterest] ?? item.serviceInterest}
                </p>
                {item.notes && <p className="mt-2 text-sm text-zinc-500">{item.notes}</p>}
                <dl className="mt-3 grid gap-1 text-xs text-zinc-600 sm:grid-cols-2">
                  <div>
                    <dt className="inline">Gửi lúc: </dt>
                    <dd className="inline">{formatDateTime(item.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="inline">Liên hệ: </dt>
                    <dd className="inline">{item.customerPhone}</dd>
                  </div>
                </dl>
              </div>
              <AppointmentStatusBadge status={item.status} />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function ProfileSection({
  name,
  phone,
  email,
  createdAt,
  points,
  totalSpent,
  onSaved,
}: {
  name: string
  phone: string
  email: string
  createdAt: string
  points: number
  totalSpent: number
  onSaved: () => Promise<void>
}) {
  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Thành viên từ" value={formatDate(createdAt)} />
        <MiniStat label="Điểm hiện tại" value={String(points)} />
        <MiniStat label="Tổng chi tiêu" value={formatVnd(totalSpent)} />
      </div>

      <div className="border border-zinc-800 p-5 sm:p-6">
        <h2 className="font-serif text-xl text-zinc-200">Thông tin cá nhân</h2>
        <p className="mt-1 text-sm text-zinc-500">Cập nhật họ tên và số điện thoại để salon liên hệ và tích điểm chính xác.</p>
        <ProfileEditForm name={name} phone={phone} email={email} onSaved={onSaved} />
      </div>
    </div>
  )
}

function OrderCard({
  order,
  rules,
  compact = false,
}: {
  order: OrderResponse
  rules?: LoyaltySummaryResponse | null
  compact?: boolean
}) {
  const pointsRedeemValue =
    rules && order.pointsRedeemed > 0
      ? Math.floor(order.pointsRedeemed / rules.redeemRatePoints) * rules.redeemRateValueVnd
      : null

  return (
    <article className="border border-zinc-800 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-zinc-300">{order.paymentCode}</p>
          <p className="mt-1 text-xs text-zinc-600">{formatDateTime(order.createdAt)}</p>
          {order.paidAt && order.status === 'Paid' && (
            <p className="text-xs text-emerald-600/80">Thanh toán: {formatDateTime(order.paidAt)}</p>
          )}
        </div>
        <StatusBadge status={order.status} />
      </div>

      <ul className={`space-y-2 text-sm text-zinc-400 ${compact ? 'mt-3' : 'mt-5'}`}>
        {order.items.map((item) => (
          <li key={`${item.itemId}-${item.hairSize}`} className="flex flex-wrap justify-between gap-2">
            <span>
              {item.name}
              {item.hairSize ? ` · size ${item.hairSize}` : ''} × {item.quantity}
            </span>
            <span className="tabular-nums text-zinc-500">{formatVnd(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      {!compact && (
        <dl className="mt-5 space-y-1 border-t border-zinc-900 pt-4 text-sm">
          <div className="flex justify-between text-zinc-500">
            <dt>Tạm tính</dt>
            <dd className="tabular-nums">{formatVnd(order.subtotalAmount)}</dd>
          </div>
          {order.promotionCode && (
            <div className="flex justify-between text-emerald-500/90">
              <dt>Mã {order.promotionCode}</dt>
              <dd className="tabular-nums">−{formatVnd(order.discountAmount)}</dd>
            </div>
          )}
          {!order.promotionCode && order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-500/90">
              <dt>Giảm giá</dt>
              <dd className="tabular-nums">−{formatVnd(order.discountAmount)}</dd>
            </div>
          )}
          {order.pointsRedeemed > 0 && (
            <div className="flex justify-between text-amber-400/90">
              <dt>Đổi {order.pointsRedeemed} điểm{pointsRedeemValue ? ` (${formatVnd(pointsRedeemValue)})` : ''}</dt>
              <dd>−</dd>
            </div>
          )}
          <div className="flex justify-between font-serif text-lg text-zinc-100">
            <dt>Tổng cộng</dt>
            <dd className="tabular-nums">{formatVnd(order.totalAmount)}</dd>
          </div>
        </dl>
      )}

      <div className={`flex flex-wrap gap-3 text-sm ${compact ? 'mt-3' : 'mt-4'}`}>
        {order.status === 'Pending' && order.pointsEarned > 0 && (
          <span className="rounded-sm border border-amber-900/40 px-2 py-0.5 text-amber-400">
            +{order.pointsEarned} điểm sau khi thanh toán
          </span>
        )}
        {order.pointsEarned > 0 && order.status === 'Paid' && (
          <span className="rounded-sm border border-emerald-900/40 px-2 py-0.5 text-emerald-400">
            +{order.pointsEarned} điểm tích
          </span>
        )}
        {order.pointsRedeemed > 0 && (
          <span className="rounded-sm border border-amber-900/40 px-2 py-0.5 text-amber-400">
            −{order.pointsRedeemed} điểm đổi
          </span>
        )}
        {compact && (
          <span className="ml-auto font-serif text-lg tabular-nums text-zinc-200">{formatVnd(order.totalAmount)}</span>
        )}
      </div>
    </article>
  )
}

function LoyaltyTransactionRow({
  tx,
  compact = false,
  linkedOrder,
}: {
  tx: LoyaltyTransactionResponse
  compact?: boolean
  linkedOrder?: OrderResponse
}) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 ${compact ? 'py-3' : 'px-4 py-4'}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <LoyaltyTypeBadge type={tx.type} />
          <p className="text-zinc-300">{tx.description}</p>
        </div>
        <p className="mt-1 text-xs text-zinc-600">{formatDateTime(tx.createdAt)}</p>
        {linkedOrder && (
          <p className="mt-1 font-mono text-xs text-zinc-500">Đơn: {linkedOrder.paymentCode}</p>
        )}
        {tx.orderId && !linkedOrder && (
          <p className="mt-1 font-mono text-xs text-zinc-600">Mã đơn: {tx.orderId.slice(0, 8)}…</p>
        )}
      </div>
      <span
        className={`shrink-0 font-serif text-xl tabular-nums ${
          tx.points >= 0 ? 'text-emerald-400' : 'text-amber-400'
        }`}
      >
        {tx.points >= 0 ? '+' : ''}{tx.points}
      </span>
    </div>
  )
}

function LoyaltyTypeBadge({ type }: { type: LoyaltyTransactionType }) {
  const styles = {
    Earn: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/30',
    Redeem: 'text-amber-400 border-amber-900/50 bg-amber-950/30',
    Adjust: 'text-zinc-400 border-zinc-700 bg-zinc-900/50',
  } as const

  const labels = {
    Earn: 'Tích điểm',
    Redeem: 'Đổi điểm',
    Adjust: 'Điều chỉnh',
  } as const

  return (
    <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${styles[type]}`}>
      {labels[type]}
    </span>
  )
}

function StatCard({
  label,
  value,
  sub,
  accent,
  onClick,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
  onClick?: () => void
}) {
  const className = `border p-5 transition ${
    accent ? 'border-gold/20 bg-gold/5 hover:border-gold/30' : 'border-zinc-800 hover:border-zinc-700'
  } ${onClick ? 'cursor-pointer text-left w-full' : ''}`

  const inner = (
    <>
      <p className="text-xs uppercase tracking-widest text-zinc-600">{label}</p>
      <p className={`mt-2 font-serif text-2xl tabular-nums ${accent ? 'text-gold' : 'text-zinc-100'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-600">{sub}</p>}
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    )
  }

  return <div className={className}>{inner}</div>
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-800 p-4">
      <p className="text-[10px] uppercase tracking-widest text-zinc-600">{label}</p>
      <p className="mt-1 font-serif text-lg tabular-nums text-zinc-200">{value}</p>
    </div>
  )
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-serif text-2xl text-zinc-200">{title}</h2>
      <button type="button" onClick={onAction} className="text-xs uppercase tracking-widest text-gold-muted hover:text-gold">
        {actionLabel} →
      </button>
    </div>
  )
}

function ProfileEditForm({
  name,
  phone,
  email,
  onSaved,
}: {
  name: string
  phone: string
  email: string
  onSaved: () => Promise<void>
}) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    const form = new FormData(e.currentTarget)
    try {
      await updateCustomerMe({
        name: String(form.get('name')),
        phone: String(form.get('phone')),
        email: String(form.get('email')) || null,
      })
      await onSaved()
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu hồ sơ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
      <input name="name" required defaultValue={name} placeholder="Họ tên" className="field-input" />
      <input name="phone" required defaultValue={phone} placeholder="Số điện thoại" className="field-input" />
      <input name="email" defaultValue={email} placeholder="Email" className="field-input sm:col-span-2" />
      {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
      {success && <p className="text-sm text-emerald-400 sm:col-span-2">Đã cập nhật hồ sơ.</p>}
      <button type="submit" disabled={loading} className="btn-gold sm:col-span-2 sm:max-w-xs">
        {loading ? 'Đang lưu...' : 'Cập nhật hồ sơ'}
      </button>
    </form>
  )
}

function ProfileSyncForm({
  email,
  defaultName = '',
}: {
  email: string
  defaultName?: string
}) {
  const { applyCustomerProfile } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const phone = String(form.get('phone') ?? '').trim()
    const profileEmail = String(form.get('email') ?? '').trim() || email

    if (!name) {
      setError('Vui lòng nhập họ tên.')
      setLoading(false)
      return
    }
    if (!phone) {
      setError('Vui lòng nhập số điện thoại.')
      setLoading(false)
      return
    }

    try {
      const profile = await syncCustomer({ name, phone, email: profileEmail })
      applyCustomerProfile(profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu hồ sơ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-xs uppercase tracking-widest text-zinc-600">Họ tên *</span>
        <input
          name="name"
          required
          defaultValue={defaultName}
          placeholder="Nguyễn Văn A"
          className="mt-1 w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-widest text-zinc-600">Số điện thoại *</span>
        <input
          name="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="0901234567"
          className="mt-1 w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200"
        />
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-widest text-zinc-600">Email</span>
        <input
          name="email"
          type="email"
          defaultValue={email}
          placeholder="email@example.com"
          className="mt-1 w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200"
        />
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gold/90 py-3 text-xs uppercase tracking-widest text-zinc-950 disabled:opacity-50"
      >
        {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
      </button>
    </form>
  )
}

const APPOINTMENT_SERVICE_LABELS: Record<string, string> = {
  cut: 'Cắt tóc',
  perm: 'Uốn / Duỗi',
  color: 'Nhuộm / Balayage',
  recovery: 'Phục hồi',
  retail: 'Moroccanoil',
}

function AppointmentStatusBadge({ status }: { status: AppointmentResponse['status'] }) {
  const styles = {
    Pending: 'text-amber-400 border-amber-900/50',
    Confirmed: 'text-emerald-400 border-emerald-900/50',
    Completed: 'text-zinc-400 border-zinc-700',
    Cancelled: 'text-zinc-500 border-zinc-700',
  } as const

  const labels = {
    Pending: 'Chờ salon xác nhận',
    Confirmed: 'Đã xác nhận',
    Completed: 'Hoàn tất',
    Cancelled: 'Đã hủy',
  } as const

  return (
    <span className={`rounded-sm border px-2 py-1 text-[10px] uppercase tracking-wider ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function StatusBadge({ status }: { status: OrderResponse['status'] }) {
  const styles = {
    Pending: 'text-amber-400 border-amber-900/50',
    Paid: 'text-emerald-400 border-emerald-900/50',
    Cancelled: 'text-zinc-500 border-zinc-700',
  } as const

  const labels = { Pending: 'Chờ thanh toán', Paid: 'Đã thanh toán', Cancelled: 'Đã hủy' }

  return (
    <span className={`rounded-sm border px-2 py-1 text-[10px] uppercase tracking-wider ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
