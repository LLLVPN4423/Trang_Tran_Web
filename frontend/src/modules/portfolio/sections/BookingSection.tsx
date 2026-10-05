import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '@/shared/lib/gsap'
import { createAppointment } from '@/shared/api/endpoints'
import { useAuth } from '@/shared/auth/AuthProvider'
import { useServiceCartStore } from '@/shared/store/serviceCartStore'
import { selectServiceCartCount } from '@/shared/store/serviceCartSelectors'
import { useSiteContent } from '../SiteContentContext'

export function BookingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { content } = useSiteContent()
  const { contact, socialLinks } = content
  const { user, customerProfile } = useAuth()
  const serviceCount = useServiceCartStore(selectServiceCartCount)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from('.booking-content > *', {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: 'top 70%' },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formEl = e.currentTarget
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    const form = new FormData(formEl)
    try {
      await createAppointment({
        customerName: String(form.get('name')).trim(),
        customerPhone: String(form.get('phone')).trim(),
        serviceInterest: String(form.get('service')),
        notes: String(form.get('notes')).trim() || null,
      })
      setSuccess(true)
      formEl.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gửi được yêu cầu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section ref={sectionRef} id="contact" className="section-shell">
      <div className="booking-content section-inner grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="section-eyebrow">Booking</p>
          <h2 className="section-title">Đặt lịch</h2>
          <p className="section-body mt-5 max-w-md">
            Chọn dịch vụ từ bảng giá, thêm vào danh sách và gửi lịch một lần — không bị kéo xuống form
            giữa chừng.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/catalog" className="btn-editorial px-5 py-2.5">
              Bảng giá dịch vụ
            </Link>
            {serviceCount > 0 ? (
              <Link to="/appointment" className="btn-gold px-5 py-2.5">
                Xem & gửi lịch ({serviceCount})
              </Link>
            ) : (
              <Link to="/appointment" className="text-sm text-zinc-500 hover:text-gold">
                Trang đặt lịch →
              </Link>
            )}
          </div>

          <dl className="mt-10 space-y-5 text-sm">
            <div>
              <dt className="label-caps text-zinc-600">Điện thoại</dt>
              <dd className="mt-1.5">
                <a href={`tel:${contact.phoneRaw}`} className="text-zinc-300 hover:text-gold">
                  {contact.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="label-caps text-zinc-600">Địa chỉ</dt>
              <dd className="mt-1.5 leading-relaxed text-zinc-300">{contact.address}</dd>
            </div>
            <div>
              <dt className="label-caps text-zinc-600">Lưu ý</dt>
              <dd className="mt-1.5 leading-relaxed text-zinc-400">{contact.note}</dd>
            </div>
            <div>
              <dt className="mb-2 label-caps text-zinc-600">Mạng xã hội</dt>
              <dd className="flex flex-wrap gap-x-4 gap-y-2">
                {socialLinks.map((link) => (
                  <SocialLink key={`${link.label}-${link.url}`} href={link.url} label={link.label} />
                ))}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <p className="label-caps mb-4 text-zinc-600">Liên hệ nhanh</p>
          <form onSubmit={handleSubmit} className="space-y-5 lg:pt-2" data-lenis-prevent>
            {success && (
              <p className="rounded-sm border border-emerald-900/50 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-300">
                Đã gửi yêu cầu đặt lịch! Salon sẽ liên hệ sớm.
              </p>
            )}
            {error && (
              <p className="rounded-sm border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="name" className="label-caps mb-2 block">
                Họ tên
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={customerProfile?.name}
                className="field-input"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label htmlFor="phone" className="label-caps mb-2 block">
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                defaultValue={customerProfile?.phone}
                className="field-input"
                placeholder="0986 586 058"
              />
            </div>
            <div>
              <label htmlFor="service" className="label-caps mb-2 block">
                Dịch vụ quan tâm
              </label>
              <select id="service" name="service" className="field-input">
                <option value="cut">Cắt tóc</option>
                <option value="perm">Uốn / Duỗi</option>
                <option value="color">Nhuộm / Balayage</option>
                <option value="recovery">Phục hồi</option>
                <option value="retail">Moroccanoil</option>
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="label-caps mb-2 block">
                Ghi chú
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="field-input resize-none"
                placeholder="Size tóc, mong muốn..."
              />
            </div>
            {user && <p className="text-xs text-zinc-600">Đăng nhập với {user.email}</p>}
            <button type="submit" disabled={submitting} className="btn-gold w-full">
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu nhanh'}
            </button>
            <p className="text-xs leading-relaxed text-zinc-600">
              Muốn chọn nhiều dịch vụ kèm giá? Dùng{' '}
              <Link to="/catalog" className="text-gold-muted hover:text-gold">
                bảng giá
              </Link>{' '}
              và{' '}
              <Link to="/appointment" className="text-gold-muted hover:text-gold">
                trang đặt lịch
              </Link>
              .
            </p>
          </form>
        </div>
      </div>

      <footer className="section-inner mt-20 border-t border-zinc-900/90 pt-8 text-center text-xs leading-relaxed text-zinc-600 md:mt-28">
        <p>TRANG TRẦN HAIR · {contact.address}</p>
        <p className="mt-2">© {new Date().getFullYear()} Trang Tran Hair Salon</p>
      </footer>
    </section>
  )
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gold-muted underline-offset-4 hover:text-gold hover:underline"
    >
      {label}
    </a>
  )
}
