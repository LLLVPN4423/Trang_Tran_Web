import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createAppointment } from '@/shared/api/endpoints'
import { useAuth } from '@/shared/auth/AuthProvider'
import { buildAppointmentPayload } from '@/shared/lib/servicePricing'
import { useServiceCartStore } from '@/shared/store/serviceCartStore'

export function AppointmentForm() {
  const { user, customerProfile } = useAuth()
  const items = useServiceCartStore((s) => s.items)
  const clearCart = useServiceCartStore((s) => s.clearCart)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (items.length === 0) return

    const formEl = e.currentTarget
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    const form = new FormData(formEl)
    const payload = buildAppointmentPayload(
      items,
      String(form.get('name')),
      String(form.get('phone')),
      String(form.get('notes')),
    )

    try {
      await createAppointment({
        ...payload,
        notes: payload.notes || null,
      })
      clearCart()
      setSuccess(true)
      formEl.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gửi được yêu cầu')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-sm border border-emerald-900/50 bg-emerald-950/20 px-6 py-8">
        <p className="font-serif text-2xl text-emerald-200">Đã gửi yêu cầu đặt lịch</p>
        <p className="mt-3 text-sm leading-relaxed text-emerald-300/90">
          Salon sẽ liên hệ xác nhận lịch trong vòng 24 giờ. Cảm ơn bạn!
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/catalog" className="btn-editorial px-5 py-2.5">
            Xem thêm dịch vụ
          </Link>
          <Link to="/" className="text-sm text-zinc-500 hover:text-gold">
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border-t border-zinc-800 pt-10">
      <div>
        <h2 className="font-serif text-2xl text-zinc-200">Thông tin liên hệ</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Điền thông tin để salon gọi xác nhận lịch hẹn.
        </p>
      </div>

      {error && (
        <p className="rounded-sm border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="appointment-name" className="label-caps mb-2 block">
          Họ tên
        </label>
        <input
          id="appointment-name"
          name="name"
          required
          defaultValue={customerProfile?.name}
          className="field-input"
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div>
        <label htmlFor="appointment-phone" className="label-caps mb-2 block">
          Số điện thoại
        </label>
        <input
          id="appointment-phone"
          name="phone"
          type="tel"
          required
          defaultValue={customerProfile?.phone}
          className="field-input"
          placeholder="0986 586 058"
        />
      </div>

      <div>
        <label htmlFor="appointment-notes" className="label-caps mb-2 block">
          Ghi chú thêm
        </label>
        <textarea
          id="appointment-notes"
          name="notes"
          rows={3}
          className="field-input resize-none"
          placeholder="Ngày/giờ mong muốn, tình trạng tóc..."
        />
      </div>

      {user && <p className="text-xs text-zinc-600">Đăng nhập với {user.email}</p>}

      <button type="submit" disabled={submitting} className="btn-gold w-full">
        {submitting ? 'Đang gửi...' : 'Gửi yêu cầu đặt lịch'}
      </button>
    </form>
  )
}
