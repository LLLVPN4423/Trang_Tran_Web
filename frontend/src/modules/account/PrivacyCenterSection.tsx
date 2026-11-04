import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPrivacyRequest, fetchMyPrivacyRequests } from '@/shared/api/endpoints'
import type {
  CustomerResponse,
  PrivacyRequestCustomerResponse,
  PrivacyRequestStatus,
  PrivacyRequestType,
} from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { FormLegalNotice } from '@/shared/components/FormLegalNotice'

const REQUEST_TYPES: { value: PrivacyRequestType; label: string; hint: string }[] = [
  {
    value: 'Access',
    label: 'Truy cập dữ liệu',
    hint: 'Yêu cầu nhân viên hỗ trợ cung cấp / giải thích thêm dữ liệu đang xử lý.',
  },
  {
    value: 'Correction',
    label: 'Chỉnh sửa (cần hỗ trợ)',
    hint: 'Dùng khi chỉnh sửa Hồ sơ thông thường chưa đủ (vd. dữ liệu lịch sử đơn hàng).',
  },
  {
    value: 'Deletion',
    label: 'Xóa dữ liệu',
    hint: 'Gửi yêu cầu — salon sẽ xác minh và đánh giá. Không xóa tự động đơn hàng/thanh toán.',
  },
  {
    value: 'Restriction',
    label: 'Hạn chế xử lý',
    hint: 'Yêu cầu hạn chế một số mục đích xử lý khi có căn cứ phù hợp.',
  },
  {
    value: 'Other',
    label: 'Yêu cầu khác',
    hint: 'Các yêu cầu quyền riêng tư khác liên quan dữ liệu cá nhân.',
  },
]

const STATUS_LABELS: Record<PrivacyRequestStatus, string> = {
  Submitted: 'Đã gửi',
  IdentityVerificationRequired: 'Cần xác minh danh tính',
  UnderReview: 'Đang xem xét',
  MoreInformationRequired: 'Cần bổ sung thông tin',
  Approved: 'Đã chấp thuận',
  Rejected: 'Từ chối',
  Completed: 'Hoàn tất',
}

export function PrivacyCenterSection({
  profile,
  onGoToProfile,
}: {
  profile: CustomerResponse
  onGoToProfile: () => void
}) {
  const [requests, setRequests] = useState<PrivacyRequestCustomerResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRequests(await fetchMyPrivacyRequests())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được yêu cầu quyền riêng tư')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const selected = selectedId ? requests.find((r) => r.id === selectedId) : null

  return (
    <div className="mt-8 space-y-10">
      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-ink-secondary">Dữ liệu cá nhân đang được xử lý</h2>
        <p className="text-sm text-ink-subtle">
          Chỉ liệt kê các nhóm dữ liệu đã xác minh có trong hệ thống hiện tại. Không bao gồm dữ liệu giả
          hoặc mục đích chưa triển khai.
        </p>

        <div className="space-y-3 border border-edge divide-y divide-edge">
          <DataGroup
            title="Thông tin tài khoản"
            body={`Họ tên, số điện thoại, email (nếu có), điểm tích lũy, tổng chi tiêu, ngày tạo hồ sơ. Mã tài khoản nội bộ gắn với đăng nhập Firebase.`}
            extras={[
              `Họ tên: ${profile.name}`,
              `SĐT: ${profile.phone}`,
              `Email: ${profile.email ?? '—'}`,
              `Điểm: ${profile.loyaltyPoints}`,
            ]}
            action={
              <button
                type="button"
                onClick={onGoToProfile}
                className="text-xs uppercase tracking-widest text-gold-700 hover:text-gold-300"
              >
                Chỉnh sửa hồ sơ →
              </button>
            }
          />
          <DataGroup
            title="Thông tin đơn hàng"
            body="Họ tên/SĐT/email trên đơn, địa chỉ giao (nếu có), mã thanh toán, trạng thái, sản phẩm/dịch vụ, điểm đổi/tích. Xem tại tab Đơn hàng."
            action={
              <Link to="/account?tab=orders" className="text-xs uppercase tracking-widest text-gold-700 hover:text-gold-300">
                Xem đơn hàng →
              </Link>
            }
          />
          <DataGroup
            title="Thông tin lịch hẹn"
            body="Họ tên, SĐT, dịch vụ quan tâm, ghi chú khách gửi, trạng thái yêu cầu đặt lịch. Xem tại tab Lịch hẹn."
            action={
              <Link
                to="/account?tab=appointments"
                className="text-xs uppercase tracking-widest text-gold-700 hover:text-gold-300"
              >
                Xem lịch hẹn →
              </Link>
            }
          />
          <DataGroup
            title="Điểm tích lũy & giao dịch điểm"
            body="Số dư điểm, lịch sử tích/đổi/điều chỉnh điểm và liên kết đơn hàng (nếu có). Xem tại tab Điểm tích lũy."
            action={
              <Link to="/account?tab=points" className="text-xs uppercase tracking-widest text-gold-700 hover:text-gold-300">
                Xem điểm →
              </Link>
            }
          />
          <DataGroup
            title="Yêu cầu quyền riêng tư"
            body="Nội dung yêu cầu bạn gửi, trạng thái xử lý, phản hồi hiển thị cho khách (không gồm ghi chú nội bộ của nhân viên)."
          />
        </div>

        <p className="text-xs text-ink-subtle">
          Chỉnh sửa họ tên / SĐT / email thông thường: dùng{' '}
          <button type="button" onClick={onGoToProfile} className="text-gold-700 hover:underline">
            Hồ sơ
          </button>
          . Form bên dưới dành cho yêu cầu cần nhân viên tiếp nhận (truy cập mở rộng, xóa, hạn chế, sửa dữ liệu
          lịch sử…).
        </p>
      </section>

      <PrivacyRequestForm
        onCreated={async (created) => {
          setRequests((prev) => [created, ...prev])
          setSelectedId(created.id)
        }}
      />

      <section>
        <h2 className="font-serif text-2xl text-ink-secondary">Yêu cầu của bạn</h2>
        {loading && <LoadingState label="Đang tải yêu cầu..." />}
        {error && <ApiErrorState message={error} onRetry={load} />}
        {!loading && !error && requests.length === 0 && (
          <p className="mt-4 text-sm text-ink-subtle">Chưa có yêu cầu quyền riêng tư nào.</p>
        )}
        {!loading && !error && requests.length > 0 && (
          <div className="mt-4 space-y-3">
            {requests.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                className="w-full border border-edge p-4 text-left transition hover:border-edge-strong"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-ink-subtle">{item.id}</p>
                    <p className="mt-1 text-ink-secondary">{typeLabel(item.type)}</p>
                    <p className="mt-1 text-xs text-ink-subtle">{formatDateTime(item.createdAt)}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <article className="mt-6 border border-edge p-5 sm:p-6">
            <h3 className="font-serif text-xl text-ink-secondary">Chi tiết yêu cầu</h3>
            <dl className="mt-4 space-y-2 text-sm text-ink-muted">
              <div>
                <dt className="inline text-ink-subtle">Mã: </dt>
                <dd className="inline font-mono">{selected.id}</dd>
              </div>
              <div>
                <dt className="inline text-ink-subtle">Loại: </dt>
                <dd className="inline">{typeLabel(selected.type)}</dd>
              </div>
              <div>
                <dt className="text-ink-subtle">Nội dung</dt>
                <dd className="mt-1 whitespace-pre-wrap text-ink-secondary">{selected.description}</dd>
              </div>
              {selected.customerVisibleResult && (
                <div>
                  <dt className="text-ink-subtle">Kết quả / phản hồi</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-ink-secondary">{selected.customerVisibleResult}</dd>
                </div>
              )}
            </dl>

            <h4 className="mt-6 text-xs uppercase tracking-widest text-ink-subtle">Lịch sử xử lý</h4>
            <ul className="mt-3 space-y-3">
              {selected.history.map((h, idx) => (
                <li key={`${h.at}-${idx}`} className="border-l border-edge pl-3 text-sm">
                  <p className="text-ink-secondary">
                    {STATUS_LABELS[h.toStatus]}
                    {h.fromStatus ? ` (từ ${STATUS_LABELS[h.fromStatus]})` : ''}
                  </p>
                  <p className="text-xs text-ink-subtle">{formatDateTime(h.at)} · {h.actorRole}</p>
                  {h.customerVisibleNote && (
                    <p className="mt-1 text-ink-muted">{h.customerVisibleNote}</p>
                  )}
                </li>
              ))}
            </ul>
          </article>
        )}
      </section>

      <FormLegalNotice
        preface="Tài liệu liên quan"
        links={[
          { to: '/chinh-sach-bao-mat', label: 'Chính sách bảo mật' },
          { to: '/lien-he-khieu-nai', label: 'Liên hệ & khiếu nại' },
        ]}
      />
    </div>
  )
}

function PrivacyRequestForm({
  onCreated,
}: {
  onCreated: (created: PrivacyRequestCustomerResponse) => Promise<void>
}) {
  const [type, setType] = useState<PrivacyRequestType>('Access')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const hint = REQUEST_TYPES.find((t) => t.value === type)?.hint

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const created = await createPrivacyRequest({ type, description: description.trim() })
      setDescription('')
      setSuccess(`Đã gửi yêu cầu. Mã: ${created.id}`)
      await onCreated(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gửi được yêu cầu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="border border-edge p-5 sm:p-6">
      <h2 className="font-serif text-xl text-ink-secondary">Gửi yêu cầu quyền riêng tư</h2>
      <p className="mt-1 text-sm text-ink-subtle">
        Yêu cầu được gắn với tài khoản đang đăng nhập. Không thể gửi thay người khác.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-subtle">Loại yêu cầu</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PrivacyRequestType)}
            className="field-input mt-1"
          >
            {REQUEST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {hint && <p className="mt-2 text-xs text-ink-subtle">{hint}</p>}
        </label>

        {(type === 'Deletion' || type === 'Restriction') && (
          <p className="border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
            Yêu cầu {type === 'Deletion' ? 'xóa' : 'hạn chế'} chỉ được tiếp nhận để nhân viên xác minh và đánh
            giá. Hệ thống không tự xóa đơn hàng, thanh toán hay tài khoản Firebase khi bạn gửi form này.
          </p>
        )}

        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-subtle">Mô tả yêu cầu *</span>
          <textarea
            required
            minLength={10}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả rõ nội dung bạn cần hỗ trợ (tối thiểu 10 ký tự)"
            className="field-input mt-1"
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">{success}</p>}

        <button type="submit" disabled={loading} className="btn-gold sm:max-w-xs">
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </form>
    </section>
  )
}

function DataGroup({
  title,
  body,
  extras,
  action,
}: {
  title: string
  body: string
  extras?: string[]
  action?: React.ReactNode
}) {
  return (
    <div className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-serif text-lg text-ink-secondary">{title}</h3>
        {action}
      </div>
      <p className="mt-2 text-sm text-ink-muted">{body}</p>
      {extras && extras.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-ink-subtle">
          {extras.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: PrivacyRequestStatus }) {
  return (
    <span className="rounded-sm border border-edge px-2 py-1 text-[10px] uppercase tracking-wider text-ink-muted">
      {STATUS_LABELS[status]}
    </span>
  )
}

function typeLabel(type: PrivacyRequestType) {
  return REQUEST_TYPES.find((t) => t.value === type)?.label ?? type
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
