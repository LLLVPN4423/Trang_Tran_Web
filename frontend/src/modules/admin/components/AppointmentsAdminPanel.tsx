import { Link } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { fetchAppointments, updateAppointmentStatus } from '@/shared/api/endpoints'
import type { AppointmentStatus } from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { AdminLiveBadge, AdminNewItemsBanner } from './AdminLiveBadge'
import { AppointmentNotesView } from '@/shared/lib/appointmentNotes'

const STATUS_OPTIONS: { value: AppointmentStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'Pending', label: 'Chờ duyệt' },
  { value: 'Confirmed', label: 'Đã xác nhận' },
  { value: 'Completed', label: 'Hoàn tất' },
  { value: 'Cancelled', label: 'Đã hủy' },
]

const SERVICE_LABELS: Record<string, string> = {
  cut: 'Cắt tóc',
  perm: 'Uốn / Duỗi',
  color: 'Nhuộm / Balayage',
  recovery: 'Phục hồi',
  retail: 'Moroccanoil',
}

export function AppointmentsAdminPanel() {
  const [status, setStatus] = useState<AppointmentStatus | ''>('Pending')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchFn = useCallback(
    () => fetchAppointments(status || undefined, { live: true }),
    [status],
  )

  const {
    items,
    initialLoading,
    refreshing,
    error,
    lastUpdated,
    newIds,
    refresh,
    dismissNew,
    dismissAllNew,
    setItems,
  } = useAdminLiveRefresh(fetchFn, status)

  const handleStatus = async (id: string, next: AppointmentStatus) => {
    setUpdatingId(id)
    try {
      await updateAppointmentStatus(id, next)
      dismissNew(id)
      setItems((prev) => {
        if (status && status !== next) {
          return prev.filter((a) => a.id !== id)
        }
        return prev.map((a) => (a.id === id ? { ...a, status: next } : a))
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật')
    } finally {
      setUpdatingId(null)
    }
  }

  if (initialLoading) return <LoadingState label="Đang tải lịch hẹn..." />
  if (error) return <ApiErrorState message={error} onRetry={() => refresh(true)} />

  return (
    <div className="space-y-6">
      <AdminLiveBadge
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        newCount={newIds.size}
        onRefresh={() => refresh(true)}
        onDismissNew={dismissAllNew}
      />

      <AdminNewItemsBanner
        count={newIds.size}
        label="lịch hẹn"
        onDismiss={dismissAllNew}
      />

      <div className="flex flex-wrap items-center gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AppointmentStatus | '')}
          className="border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="text-sm text-zinc-500">{items.length} lịch hẹn</span>
      </div>

      <div className="space-y-4">
        {items.length === 0 && <p className="text-zinc-500">Không có lịch hẹn.</p>}
        {items.map((item) => {
          const isNew = newIds.has(item.id)
          return (
            <article
              key={item.id}
              className={`border p-4 transition-colors sm:p-6 ${
                isNew
                  ? 'border-emerald-700/60 bg-emerald-950/20 ring-1 ring-emerald-700/30'
                  : 'border-zinc-800'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-serif text-xl text-zinc-200">{item.customerName}</p>
                    {isNew && (
                      <span className="rounded-sm bg-emerald-900/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-emerald-400">
                        Mới
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{item.customerPhone}</p>
                  <p className="mt-2 text-sm text-gold-muted">
                    {SERVICE_LABELS[item.serviceInterest] ?? item.serviceInterest}
                  </p>
                  {item.notes && <AppointmentNotesView notes={item.notes} className="mt-3" />}
                  <p className="mt-2 text-xs text-zinc-600">
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-wider text-zinc-500">{item.status}</span>
              </div>
              {item.status === 'Pending' && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => handleStatus(item.id, 'Confirmed')}
                    className="text-xs uppercase tracking-widest text-emerald-400 disabled:opacity-50"
                  >
                    Xác nhận
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => handleStatus(item.id, 'Cancelled')}
                    className="text-xs uppercase tracking-widest text-red-400 disabled:opacity-50"
                  >
                    Từ chối
                  </button>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-4">
                <Link
                  to={`/admin/service-invoices?appointmentId=${encodeURIComponent(item.id)}`}
                  className="text-xs uppercase tracking-widest text-gold hover:text-gold-muted"
                >
                  Tạo hóa đơn
                </Link>
                {item.status === 'Confirmed' && (
                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => handleStatus(item.id, 'Completed')}
                    className="text-xs uppercase tracking-widest text-zinc-400 hover:text-gold disabled:opacity-50"
                  >
                    Đánh dấu hoàn tất
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
