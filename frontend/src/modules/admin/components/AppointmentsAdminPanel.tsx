import { useCallback, useEffect, useState } from 'react'
import { fetchAppointments, updateAppointmentStatus } from '@/shared/api/endpoints'
import type { AppointmentResponse, AppointmentStatus } from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'

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
  const [items, setItems] = useState<AppointmentResponse[]>([])
  const [status, setStatus] = useState<AppointmentStatus | ''>('Pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await fetchAppointments(status || undefined))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải lịch hẹn')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  const handleStatus = async (id: string, next: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(id, next)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật')
    }
  }

  if (loading) return <LoadingState label="Đang tải lịch hẹn..." />
  if (error) return <ApiErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-6">
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
        {items.map((item) => (
          <article key={item.id} className="border border-zinc-800 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-xl text-zinc-200">{item.customerName}</p>
                <p className="mt-1 text-sm text-zinc-400">{item.customerPhone}</p>
                <p className="mt-2 text-sm text-gold-muted">
                  {SERVICE_LABELS[item.serviceInterest] ?? item.serviceInterest}
                </p>
                {item.notes && <p className="mt-2 text-sm text-zinc-500">{item.notes}</p>}
                <p className="mt-2 text-xs text-zinc-600">
                  {new Date(item.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <span className="text-xs uppercase tracking-wider text-zinc-500">{item.status}</span>
            </div>
            {item.status === 'Pending' && (
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => handleStatus(item.id, 'Confirmed')} className="text-xs uppercase tracking-widest text-emerald-400">
                  Xác nhận
                </button>
                <button type="button" onClick={() => handleStatus(item.id, 'Cancelled')} className="text-xs uppercase tracking-widest text-red-400">
                  Từ chối
                </button>
              </div>
            )}
            {item.status === 'Confirmed' && (
              <button type="button" onClick={() => handleStatus(item.id, 'Completed')} className="mt-4 text-xs uppercase tracking-widest text-gold">
                Đánh dấu hoàn tất
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
