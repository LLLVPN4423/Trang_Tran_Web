import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchRevenueSummary } from '@/shared/api/endpoints'
import type { RevenueSummaryResponse } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PAYMENT_METHOD_LABELS, normalizePaymentMethod } from '@/shared/lib/orderLabels'
import { AdminButton, AdminPanelHeader, adminInputClass } from './AdminFormUi'
import { type RevenuePreset, rangeForPreset } from '@/modules/admin/lib/vnDate'

const PRESETS: { id: RevenuePreset; label: string }[] = [
  { id: 'today', label: 'Hôm nay' },
  { id: '7d', label: '7 ngày' },
  { id: '30d', label: '30 ngày' },
  { id: 'month', label: 'Tháng này' },
  { id: 'custom', label: 'Tùy chọn' },
]

function exportRevenueCsv(summary: RevenueSummaryResponse): string {
  const lines = [
    `Tu,${summary.fromLocal},Den,${summary.toLocal}`,
    `Tong,${summary.current.total},DichVu,${summary.current.totalService},SanPham,${summary.current.totalRetail}`,
    '',
    'Ngay,DichVu,SanPham,Tong',
    ...summary.daily.map((d) => `${d.dateLocal},${d.service},${d.retail},${d.total}`),
  ]
  return lines.join('\n')
}

export function RevenueAdminPanel() {
  const [preset, setPreset] = useState<RevenuePreset>('7d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [summary, setSummary] = useState<RevenueSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const range = useMemo(
    () => rangeForPreset(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  )

  const load = useCallback(async () => {
    if (preset === 'custom' && (!customFrom || !customTo || customTo < customFrom)) {
      setError('Chọn khoảng ngày hợp lệ (từ ≤ đến).')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRevenueSummary(range)
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được báo cáo')
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [range, preset, customFrom, customTo])

  useEffect(() => {
    if (preset !== 'custom') void load()
  }, [load, preset])

  const maxDaily = useMemo(
    () => Math.max(1, ...(summary?.daily.map((d) => d.total) ?? [1])),
    [summary],
  )

  const pct = summary?.comparison.percentChangeTotal

  return (
    <div className="space-y-8">
      <AdminPanelHeader title="Doanh thu tiệm" count={summary?.current.orderCount ?? 0} />

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={`border px-3 py-1.5 text-xs uppercase tracking-widest ${
              preset === p.id
                ? 'border-gold/50 bg-gold/10 text-gold'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="block text-xs text-zinc-500">
            Từ
            <input
              type="date"
              className={adminInputClass}
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
          </label>
          <label className="block text-xs text-zinc-500">
            Đến
            <input
              type="date"
              className={adminInputClass}
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </label>
          <AdminButton variant="primary" onClick={() => void load()}>
            Xem báo cáo
          </AdminButton>
        </div>
      )}

      {loading && <LoadingState label="Đang tải báo cáo..." />}
      {error && !loading && <ApiErrorState message={error} onRetry={() => void load()} />}

      {summary && !loading && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Tổng thu" value={formatVnd(summary.current.total)} />
            <Stat label="Dịch vụ (HD)" value={formatVnd(summary.current.totalService)} />
            <Stat label="Sản phẩm (DH)" value={formatVnd(summary.current.totalRetail)} />
            <Stat
              label="So với kỳ trước"
              value={
                pct == null
                  ? '—'
                  : `${pct >= 0 ? '+' : ''}${pct}% (${formatVnd(summary.comparison.previous.total)})`
              }
            />
          </div>

          <div className="rounded-sm border border-zinc-800 p-4">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500">Theo ngày</h3>
            <div className="mt-4 flex items-end gap-1 overflow-x-auto pb-2" style={{ minHeight: 120 }}>
              {summary.daily.map((d) => (
                <div key={d.dateLocal} className="flex min-w-[28px] flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full max-w-[40px] rounded-t bg-gold/70"
                    style={{ height: `${Math.max(4, (d.total / maxDaily) * 96)}px` }}
                    title={`${d.dateLocal}: ${formatVnd(d.total)}`}
                  />
                  <span className="text-[9px] text-zinc-600">{d.dateLocal.slice(8)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-sm border border-zinc-800 p-4">
              <h3 className="text-xs uppercase tracking-widest text-zinc-500">Theo hình thức TT</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {summary.byPaymentMethod.map((b) => (
                  <li key={b.paymentMethod} className="flex justify-between gap-2 text-zinc-400">
                    <span>{PAYMENT_METHOD_LABELS[normalizePaymentMethod(b.paymentMethod)] ?? b.paymentMethod}</span>
                    <span className="text-zinc-200">
                      {formatVnd(b.amount)} <span className="text-zinc-600">({b.orderCount})</span>
                    </span>
                  </li>
                ))}
                {summary.byPaymentMethod.length === 0 && (
                  <li className="text-zinc-600">Không có đơn Paid trong kỳ.</li>
                )}
              </ul>
            </div>

            <div className="rounded-sm border border-zinc-800 p-4">
              <h3 className="text-xs uppercase tracking-widest text-zinc-500">Top dịch vụ / sản phẩm</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {summary.topItems.map((t) => (
                  <li key={`${t.itemType}-${t.name}`} className="flex justify-between gap-2 text-zinc-400">
                    <span>
                      {t.name}{' '}
                      <span className="text-zinc-600">
                        ({t.itemType === 'Product' ? 'SP' : t.itemType === 'Service' ? 'DV' : 'Khác'} ×{t.quantity})
                      </span>
                    </span>
                    <span className="text-zinc-200">{formatVnd(t.revenue)}</span>
                  </li>
                ))}
                {summary.topItems.length === 0 && (
                  <li className="text-zinc-600">Chưa có dòng hàng trong kỳ.</li>
                )}
              </ul>
            </div>
          </div>

          <AdminButton
            onClick={() => {
              const csv = exportRevenueCsv(summary)
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `doanh-thu-${summary.fromLocal}_${summary.toLocal}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            Xuất CSV kỳ này
          </AdminButton>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-zinc-800 bg-zinc-950/40 p-4">
      <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-2 font-serif text-xl text-zinc-100">{value}</p>
    </div>
  )
}
