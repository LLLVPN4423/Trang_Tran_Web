import { Link, useLocation } from 'react-router-dom'
import { SALON_PUBLIC } from '@/shared/lib/salonPublicInfo'

/** Thanh CTA gọi / Zalo / đặt lịch — mobile, ẩn trên admin. */
export function MobileSalonCtaBar() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-edge bg-canvas/95 px-2 py-2 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <a
          href={`tel:${SALON_PUBLIC.phoneRaw}`}
          className="flex-1 rounded-sm border border-gold-500/40 bg-gold-500/10 py-2.5 text-center text-[10px] font-medium uppercase tracking-widest text-gold-300"
        >
          Gọi
        </a>
        <a
          href={SALON_PUBLIC.zalo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-sm border border-edge-strong py-2.5 text-center text-[10px] font-medium uppercase tracking-widest text-ink-secondary"
        >
          Zalo
        </a>
        <Link
          to="/appointment"
          className="btn-gold flex-[1.2] rounded-sm py-2.5 text-center text-[10px]"
        >
          Đặt lịch
        </Link>
      </div>
    </div>
  )
}
