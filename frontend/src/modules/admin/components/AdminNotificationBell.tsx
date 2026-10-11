import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminNotifications } from '@/modules/admin/hooks/useAdminNotifications'

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AdminNotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { items, loading, reload } = useAdminNotifications()

  const warningCount = items.filter((i) => i.tone === 'warning').length
  const badge = items.length

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label={badge > 0 ? `${badge} thông báo` : 'Thông báo'}
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v)
          if (!open) void reload()
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-sm border border-zinc-800 text-zinc-400 transition hover:border-zinc-600 hover:text-gold"
      >
        <BellIcon className="h-5 w-5" />
        {badge > 0 && (
          <span
            className={`absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium ${
              warningCount > 0 ? 'bg-amber-600 text-zinc-950' : 'bg-gold text-zinc-950'
            }`}
          >
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-sm border border-zinc-800 bg-zinc-950 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">Thông báo</p>
            <button
              type="button"
              onClick={() => void reload()}
              className="text-[10px] uppercase tracking-wider text-zinc-600 hover:text-gold"
            >
              Làm mới
            </button>
          </div>

          <ul className="max-h-72 overflow-y-auto py-1">
            {loading && items.length === 0 && (
              <li className="px-3 py-4 text-sm text-zinc-500">Đang tải…</li>
            )}
            {!loading && items.length === 0 && (
              <li className="px-3 py-4 text-sm text-zinc-500">Không có việc cần xử lý.</li>
            )}
            {items.map((item) => (
              <li
                key={item.id}
                className={`border-b border-zinc-900/80 px-3 py-3 last:border-0 ${
                  item.tone === 'warning' ? 'bg-amber-950/15' : ''
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    item.tone === 'warning' ? 'text-amber-100/95' : 'text-zinc-200'
                  }`}
                >
                  {item.title}
                </p>
                {item.detail && (
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.detail}</p>
                )}
                {item.href && item.linkLabel && (
                  <Link
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="mt-2 inline-block text-xs text-gold underline"
                  >
                    {item.linkLabel}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
