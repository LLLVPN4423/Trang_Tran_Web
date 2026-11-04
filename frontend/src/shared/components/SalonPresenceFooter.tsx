import { Link } from 'react-router-dom'
import { SALON_PUBLIC } from '@/shared/lib/salonPublicInfo'

const linkClass =
  'inline-flex min-h-11 items-center text-ink-muted transition hover:text-gold-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500'

/** NAP + legal / support groups — mọi trang khách (Phase 1B). */
export function SalonPresenceFooter() {
  return (
    <footer className="border-t border-edge/80 bg-section px-5 py-10 sm:px-8">
      <div className="section-inner grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="label-caps">{SALON_PUBLIC.nameVi}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Salon tóc tại Sóc Trăng — nhận khách Cần Thơ & ĐBSCL. Nhuộm, uốn, balayage, phục hồi. Đặt lịch
            online hoặc gọi{' '}
            <a href={`tel:${SALON_PUBLIC.phoneRaw}`} className="text-gold-700 transition hover:text-gold-300">
              {SALON_PUBLIC.phoneDisplay}
            </a>
            .
          </p>
          <p className="mt-2 text-sm text-ink-subtle">{SALON_PUBLIC.address}</p>
          <p className="mt-1 text-sm text-ink-subtle">{SALON_PUBLIC.openingHours}</p>
          <ul className="mt-4 space-y-1 text-sm">
            <li>
              <Link to="/catalog" className={linkClass}>
                Bảng giá dịch vụ
              </Link>
            </li>
            <li>
              <Link to="/appointment" className={linkClass}>
                Đặt lịch online
              </Link>
            </li>
            <li>
              <Link to="/shop" className={linkClass}>
                Shop Moroccanoil
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label-caps">Thông tin kinh doanh</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link to="/thong-tin-ho-kinh-doanh" className={linkClass}>
                Thông tin hộ kinh doanh
              </Link>
            </li>
            <li>
              <Link to="/#artist" className={linkClass}>
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link to="/#faq" className={linkClass}>
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label-caps">Chính sách & điều khoản</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link to="/chinh-sach-bao-mat" className={linkClass}>
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link to="/dieu-khoan-giao-dich" className={linkClass}>
                Điều khoản giao dịch
              </Link>
            </li>
            <li>
              <Link to="/chinh-sach-thanh-toan" className={linkClass}>
                Chính sách thanh toán
              </Link>
            </li>
            <li>
              <Link to="/chinh-sach-giao-hang-doi-tra" className={linkClass}>
                Giao hàng & đổi trả
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label-caps">Hỗ trợ khách hàng</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link to="/lien-he-khieu-nai" className={linkClass}>
                Liên hệ & khiếu nại
              </Link>
            </li>
            <li>
              <a
                href={SALON_PUBLIC.mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Google Maps
              </a>
            </li>
            <li>
              <a href={SALON_PUBLIC.facebook} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Facebook TrangTranHair
              </a>
            </li>
            <li>
              <a href={SALON_PUBLIC.zalo} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Zalo {SALON_PUBLIC.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={SALON_PUBLIC.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
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
