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
    const name = String(form.get('name') ?? '').trim()
    const phone = String(form.get('phone') ?? '').trim()
    const preferredAt = String(form.get('preferredAt') ?? '').trim()
    const notes = String(form.get('notes') ?? '').trim()

    if (!name || !phone) {
      setError('Vui lòng nhập đầy đủ họ tên và số điện thoại để salon liên hệ.')
      setSubmitting(false)
      return
    }

    if (!preferredAt) {
      setError('Vui lòng ghi ngày/giờ mong muốn để salon gọi xác nhận lịch.')
      setSubmitting(false)
      return
    }

    const payload = buildAppointmentPayload(items, name, phone, preferredAt, notes)

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
      <div className="rounded-sm border border-success/30 bg-success/10 px-6 py-8">
        <p className="font-serif text-2xl text-success">Đã gửi yêu cầu đặt lịch</p>
        <p className="mt-3 text-sm leading-relaxed text-success/90">
          Salon sẽ liên hệ xác nhận lịch trong vòng 24 giờ. Cảm ơn bạn!
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/catalog" className="btn-editorial px-5 py-2.5">
            Xem thêm dịch vụ
          </Link>
          <Link to="/" className="text-sm text-ink-subtle hover:text-gold-300">
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border-t border-edge pt-10">
      <div>
        <h2 className="font-serif text-2xl text-ink-secondary">Thông tin liên hệ</h2>
        <p className="mt-2 text-sm text-ink-subtle">
          {user
            ? 'Kiểm tra họ tên và số điện thoại trước khi gửi — salon sẽ gọi xác nhận lịch hẹn.'
            : 'Chưa đăng nhập: bắt buộc nhập họ tên và số điện thoại để salon gọi xác nhận lịch hẹn.'}
        </p>
      </div>

      {error && (
        <p className="rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="appointment-name" className="label-caps mb-2 block">
          Họ tên <span className="text-gold-500">*</span>
        </label>
        <input
          id="appointment-name"
          name="name"
          required
          autoComplete="name"
          defaultValue={customerProfile?.name}
          className="field-input"
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div>
        <label htmlFor="appointment-phone" className="label-caps mb-2 block">
          Số điện thoại <span className="text-gold-500">*</span>
        </label>
        <input
          id="appointment-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          defaultValue={customerProfile?.phone}
          className="field-input"
          placeholder="0986 586 058"
        />
      </div>

      <div>
        <label htmlFor="appointment-preferred-at" className="label-caps mb-2 block">
          Ngày/giờ mong muốn <span className="text-gold-500">*</span>
        </label>
        <textarea
          id="appointment-preferred-at"
          name="preferredAt"
          required
          rows={2}
          className="field-input resize-none"
          placeholder="VD: Thứ 7 tuần này, sau 14h"
        />
        <p className="mt-1.5 text-xs text-ink-subtle">
          Chưa chốt lịch — salon sẽ gọi xác nhận trong giờ mở cửa.
        </p>
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
          placeholder="Tình trạng tóc, dị ứng thuốc nhuộm..."
        />
      </div>

      {user && <p className="text-xs text-ink-subtle">Đăng nhập với {user.email}</p>}

      <button type="submit" disabled={submitting} className="btn-gold w-full">
        {submitting ? 'Đang gửi...' : 'Gửi yêu cầu đặt lịch'}
      </button>
    </form>
  )
}
