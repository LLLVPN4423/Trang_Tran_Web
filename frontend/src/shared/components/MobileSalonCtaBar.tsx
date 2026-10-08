import { Link, useLocation } from 'react-router-dom'
import { SALON_PUBLIC } from '@/shared/lib/salonPublicInfo'

/** Thanh CTA gọi / Zalo / đặt lịch — mobile, ẩn trên admin. */
export function MobileSalonCtaBar() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-2 py-2 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <a
          href={`tel:${SALON_PUBLIC.phoneRaw}`}
          className="flex-1 rounded-sm border border-gold/40 bg-gold/10 py-2.5 text-center text-[10px] font-medium uppercase tracking-widest text-gold"
        >
          Gọi
        </a>
        <a
          href={SALON_PUBLIC.zalo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-sm border border-zinc-700 py-2.5 text-center text-[10px] font-medium uppercase tracking-widest text-zinc-300"
        >
          Zalo
        </a>
        <Link
          to="/appointment"
          className="flex-[1.2] rounded-sm bg-gold/90 py-2.5 text-center text-[10px] font-medium uppercase tracking-widest text-zinc-950"
        >
          Đặt lịch
        </Link>
      </div>
    </div>
  )
}
