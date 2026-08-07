import { useEffect, useRef, useState, type FormEvent } from 'react'
import { gsap } from '@/shared/lib/gsap'
import { createAppointment } from '@/shared/api/endpoints'
import { useAuth } from '@/shared/auth/AuthProvider'
import { CONTACT, SOCIAL_LINKS } from '../data/content'

export function BookingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { user, customerProfile } = useAuth()
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
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    const form = new FormData(e.currentTarget)
    try {
      await createAppointment({
        customerName: String(form.get('name')).trim(),
        customerPhone: String(form.get('phone')).trim(),
        serviceInterest: String(form.get('service')),
        notes: String(form.get('notes')).trim() || null,
      })
      setSuccess(true)
      e.currentTarget.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gửi được yêu cầu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="border-t border-zinc-900 px-6 py-32 md:py-48"
    >
      <div className="booking-content mx-auto grid max-w-6xl gap-16 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold-muted">
            Booking
          </p>
          <h2 className="font-serif text-4xl text-zinc-100 md:text-6xl">
            Đặt lịch
          </h2>
          <p className="mt-6 max-w-md text-zinc-400">
            Hãy để lại thông tin — chúng tôi sẽ liên hệ xác nhận lịch hẹn trong
            vòng 24 giờ.
          </p>

          <dl className="mt-12 space-y-4 text-sm text-zinc-500">
            <div>
              <dt className="text-xs uppercase tracking-widest text-zinc-600">Điện thoại</dt>
              <dd className="mt-1">
                <a href={`tel:${CONTACT.phoneRaw}`} className="text-zinc-300 hover:text-gold">
                  {CONTACT.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-zinc-600">Địa chỉ</dt>
              <dd className="mt-1 text-zinc-300">{CONTACT.address}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-zinc-600">Lưu ý</dt>
              <dd className="mt-1 text-zinc-400">{CONTACT.note}</dd>
            </div>
            <div>
              <dt className="mb-2 text-xs uppercase tracking-widest text-zinc-600">Mạng xã hội</dt>
              <dd className="flex flex-wrap gap-x-4 gap-y-2">
                <SocialLink href={SOCIAL_LINKS.facebook} label="Facebook" />
                <SocialLink href={SOCIAL_LINKS.instagram} label="Instagram" />
                <SocialLink href={SOCIAL_LINKS.threads} label="Threads" />
                <SocialLink href={SOCIAL_LINKS.tiktok} label="TikTok" />
              </dd>
            </div>
          </dl>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          data-lenis-prevent
        >
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
            <label htmlFor="name" className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
              Họ tên
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={customerProfile?.name}
              className="w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200 outline-none transition focus:border-gold"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
              Số điện thoại
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              defaultValue={customerProfile?.phone}
              className="w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200 outline-none transition focus:border-gold"
              placeholder="0986 586 058"
            />
          </div>
          <div>
            <label htmlFor="service" className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
              Dịch vụ quan tâm
            </label>
            <select
              id="service"
              name="service"
              className="w-full border-b border-zinc-800 bg-transparent py-3 text-zinc-200 outline-none transition focus:border-gold"
            >
              <option value="cut">Cắt tóc</option>
              <option value="perm">Uốn / Duỗi</option>
              <option value="color">Nhuộm / Balayage</option>
              <option value="recovery">Phục hồi</option>
              <option value="retail">Moroccanoil</option>
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
              Ghi chú
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full resize-none border-b border-zinc-800 bg-transparent py-3 text-zinc-200 outline-none transition focus:border-gold"
              placeholder="Size tóc, mong muốn..."
            />
          </div>
          {user && (
            <p className="text-xs text-zinc-600">Đăng nhập với {user.email}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold/90 py-4 text-xs font-medium uppercase tracking-[0.3em] text-zinc-950 transition hover:bg-gold disabled:opacity-50"
          >
            {submitting ? 'Đang gửi...' : 'Gửi yêu cầu đặt lịch'}
          </button>
        </form>
      </div>

      <footer className="mx-auto mt-32 max-w-6xl border-t border-zinc-900 pt-8 text-center text-xs text-zinc-600">
        <p>TRANG TRẦN HAIR · {CONTACT.address}</p>
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
