type AdminLiveBadgeProps = {
  lastUpdated: Date | null
  refreshing?: boolean
  newCount?: number
  onRefresh?: () => void
  onDismissNew?: () => void
}

export function AdminLiveBadge({
  lastUpdated,
  refreshing,
  newCount = 0,
  onRefresh,
  onDismissNew,
}: AdminLiveBadgeProps) {
  const timeLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-subtle">
      <span className="inline-flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="uppercase tracking-widest text-success/90">Live</span>
        {refreshing && <span className="text-ink-subtle">· đang cập nhật</span>}
      </span>

      <span>Cập nhật {timeLabel}</span>

      {newCount > 0 && (
        <button
          type="button"
          onClick={onDismissNew}
          className="rounded-sm border border-success/40 bg-success/10 px-2 py-0.5 text-success hover:bg-success/15"
        >
          {newCount} mới
        </button>
      )}

      {onRefresh && (
        <button type="button" onClick={onRefresh} className="uppercase tracking-widest text-gold-500 hover:underline">
          Làm mới
        </button>
      )}
    </div>
  )
}

export function AdminNewItemsBanner({
  count,
  label,
  onDismiss,
}: {
  count: number
  label: string
  onDismiss: () => void
}) {
  if (count <= 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
      <p>
        <strong>{count}</strong> {label} mới — có thể duyệt ngay bên dưới.
      </p>
      <button type="button" onClick={onDismiss} className="text-xs uppercase tracking-widest text-success/80 hover:text-success">
        Đã xem
      </button>
    </div>
  )
}
