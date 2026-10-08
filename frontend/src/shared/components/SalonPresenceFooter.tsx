import { Link } from 'react-router-dom'
import { SALON_PUBLIC } from '@/shared/lib/salonPublicInfo'

/** NAP + liên kết đa kênh — mọi trang khách (SEO nội bộ, Maps, MXH). */
export function SalonPresenceFooter() {
  return (
    <footer className="border-t border-zinc-900/90 bg-zinc-950 px-5 py-10 sm:px-8">
      <div className="section-inner grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="label-caps text-zinc-600">{SALON_PUBLIC.nameVi}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Salon tóc tại Sóc Trăng — nhuộm, uốn, balayage, phục hồi. Đặt lịch online hoặc gọi{' '}
            <a href={`tel:${SALON_PUBLIC.phoneRaw}`} className="text-gold-muted hover:text-gold">
              {SALON_PUBLIC.phoneDisplay}
            </a>
            .
          </p>
          <p className="mt-2 text-sm text-zinc-500">{SALON_PUBLIC.address}</p>
          <p className="mt-1 text-sm text-zinc-500">{SALON_PUBLIC.openingHours}</p>
        </div>

        <div>
          <p className="label-caps text-zinc-600">Trên web</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/catalog" className="text-zinc-400 hover:text-gold">
                Bảng giá dịch vụ
              </Link>
            </li>
            <li>
              <Link to="/appointment" className="text-zinc-400 hover:text-gold">
                Đặt lịch online
              </Link>
            </li>
            <li>
              <Link to="/shop" className="text-zinc-400 hover:text-gold">
                Shop Moroccanoil
              </Link>
            </li>
            <li>
              <Link to="/#faq" className="text-zinc-400 hover:text-gold">
                Câu hỏi thường gặp
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label-caps text-zinc-600">Kênh khác</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={SALON_PUBLIC.mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-gold"
              >
                Google Maps · Salon Trang Trần
              </a>
            </li>
            <li>
              <a
                href={SALON_PUBLIC.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-gold"
              >
                Facebook TrangTranHair
              </a>
            </li>
            <li>
              <a
                href={SALON_PUBLIC.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-gold"
              >
                Zalo {SALON_PUBLIC.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={SALON_PUBLIC.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-gold"
              >
                Portfolio nghệ thuật tóc
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="section-inner mt-8 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} {SALON_PUBLIC.name} · {SALON_PUBLIC.siteUrl.replace('https://', '')}
      </p>
    </footer>
  )
}
