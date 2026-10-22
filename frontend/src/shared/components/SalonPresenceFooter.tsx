import { Link } from 'react-router-dom'
import { SALON_PUBLIC } from '@/shared/lib/salonPublicInfo'

/** NAP + liên kết đa kênh — mọi trang khách (SEO nội bộ, Maps, MXH). */
export function SalonPresenceFooter() {
  return (
    <footer className="border-t border-edge/80 bg-section px-5 py-10 sm:px-8">
      <div className="section-inner grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="label-caps">{SALON_PUBLIC.nameVi}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Salon tóc tại Sóc Trăng — nhuộm, uốn, balayage, phục hồi. Đặt lịch online hoặc gọi{' '}
            <a href={`tel:${SALON_PUBLIC.phoneRaw}`} className="text-gold-700 transition hover:text-gold-300">
              {SALON_PUBLIC.phoneDisplay}
            </a>
            .
          </p>
          <p className="mt-2 text-sm text-ink-subtle">{SALON_PUBLIC.address}</p>
          <p className="mt-1 text-sm text-ink-subtle">{SALON_PUBLIC.openingHours}</p>
        </div>

        <div>
          <p className="label-caps">Trên web</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/catalog" className="text-ink-muted transition hover:text-gold-300">
                Bảng giá dịch vụ
              </Link>
            </li>
            <li>
              <Link to="/appointment" className="text-ink-muted transition hover:text-gold-300">
                Đặt lịch online
              </Link>
            </li>
            <li>
              <Link to="/shop" className="text-ink-muted transition hover:text-gold-300">
                Shop Moroccanoil
              </Link>
            </li>
            <li>
              <Link to="/#faq" className="text-ink-muted transition hover:text-gold-300">
                Câu hỏi thường gặp
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label-caps">Kênh khác</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={SALON_PUBLIC.mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted transition hover:text-gold-300"
              >
                Google Maps · Salon Trang Trần
              </a>
            </li>
            <li>
              <a
                href={SALON_PUBLIC.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted transition hover:text-gold-300"
              >
                Facebook TrangTranHair
              </a>
            </li>
            <li>
              <a
                href={SALON_PUBLIC.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted transition hover:text-gold-300"
              >
                Zalo {SALON_PUBLIC.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={SALON_PUBLIC.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-muted transition hover:text-gold-300"
              >
                Portfolio nghệ thuật tóc
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="section-inner mt-8 text-center text-xs text-ink-subtle">
        © {new Date().getFullYear()} {SALON_PUBLIC.name} · {SALON_PUBLIC.siteUrl.replace('https://', '')}
      </p>
    </footer>
  )
}
