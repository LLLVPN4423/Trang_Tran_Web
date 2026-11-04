import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchAdminPrivacyRequest,
  fetchAdminPrivacyRequests,
  updateAdminPrivacyRequest,
} from '@/shared/api/endpoints'
import type {
  PrivacyRequestAdminResponse,
  PrivacyRequestStatus,
  PrivacyRequestType,
} from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'

const TYPE_OPTIONS: { value: PrivacyRequestType | ''; label: string }[] = [
  { value: '', label: 'Tất cả loại' },
  { value: 'Access', label: 'Truy cập' },
  { value: 'Correction', label: 'Chỉnh sửa' },
  { value: 'Deletion', label: 'Xóa dữ liệu' },
  { value: 'Restriction', label: 'Hạn chế xử lý' },
  { value: 'Other', label: 'Khác' },
]

const STATUS_OPTIONS: { value: PrivacyRequestStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Submitted', label: 'Đã gửi' },
  { value: 'IdentityVerificationRequired', label: 'Cần xác minh' },
  { value: 'UnderReview', label: 'Đang xem xét' },
  { value: 'MoreInformationRequired', label: 'Cần bổ sung' },
  { value: 'Approved', label: 'Chấp thuận' },
  { value: 'Rejected', label: 'Từ chối' },
  { value: 'Completed', label: 'Hoàn tất' },
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

export function PrivacyRequestsAdminPanel() {
  const [items, setItems] = useState<PrivacyRequestAdminResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<PrivacyRequestType | ''>('')
  const [statusFilter, setStatusFilter] = useState<PrivacyRequestStatus | ''>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<PrivacyRequestAdminResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(
        await fetchAdminPrivacyRequests({
          ...(typeFilter ? { type: typeFilter } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được yêu cầu')
    } finally {
      setLoading(false)
    }
  }, [typeFilter, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  const openDetail = async (id: string) => {
    setSelectedId(id)
    setDetailLoading(true)
    try {
      setDetail(await fetchAdminPrivacyRequest(id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không tải chi tiết')
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const selectedSummary = useMemo(
    () => items.find((i) => i.id === selectedId) ?? detail,
    [items, selectedId, detail],
  )

  if (loading && items.length === 0) return <LoadingState label="Đang tải yêu cầu quyền riêng tư..." />
  if (error && items.length === 0) return <ApiErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-ink-secondary">Yêu cầu quyền riêng tư</h2>
          <p className="mt-1 text-sm text-ink-subtle">
            Tiếp nhận, xác minh và ghi nhận quyết định. Hệ thống không tự xóa đơn hàng / thanh toán /
            Firebase Auth.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="text-xs uppercase tracking-widest text-gold-700">
          Làm mới
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as PrivacyRequestType | '')}
          className="field-input max-w-xs"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PrivacyRequestStatus | '')}
          className="field-input max-w-xs"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-edge text-xs uppercase tracking-widest text-ink-subtle">
              <th className="py-3 pr-4">Mã</th>
              <th className="py-3 pr-4">Khách</th>
              <th className="py-3 pr-4">Loại</th>
              <th className="py-3 pr-4">Trạng thái</th>
              <th className="py-3 pr-4">Gửi lúc</th>
              <th className="py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-edge text-ink-muted">
                <td className="py-3 pr-4 font-mono text-xs text-ink-secondary">{item.id.slice(0, 8)}…</td>
                <td className="py-3 pr-4">
                  <div className="text-ink-secondary">{item.customerNameSnapshot ?? '—'}</div>
                  <div className="text-xs">{item.customerPhoneSnapshot ?? item.customerFirebaseUid.slice(0, 10)}</div>
                </td>
                <td className="py-3 pr-4">{typeLabel(item.type)}</td>
                <td className="py-3 pr-4">{STATUS_LABELS[item.status]}</td>
                <td className="py-3 pr-4 text-xs">{formatDateTime(item.createdAt)}</td>
                <td className="py-3">
                  <button
                    type="button"
                    onClick={() => void openDetail(item.id)}
                    className="text-xs text-gold-700 hover:text-gold-300"
                  >
                    Xử lý
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="mt-4 text-sm text-ink-subtle">Không có yêu cầu phù hợp bộ lọc.</p>}
      </div>

      {selectedId && (
        <div className="border border-edge p-5 sm:p-6">
          {detailLoading && <LoadingState label="Đang tải chi tiết..." />}
          {!detailLoading && detail && (
            <AdminDetail
              detail={detail}
              onUpdated={async (updated) => {
                setDetail(updated)
                setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
              }}
              onClose={() => {
                setSelectedId(null)
                setDetail(null)
              }}
            />
          )}
          {!detailLoading && !detail && selectedSummary && (
            <p className="text-sm text-danger">Không tải được chi tiết yêu cầu.</p>
          )}
        </div>
      )}
    </div>
  )
}

function AdminDetail({
  detail,
  onUpdated,
  onClose,
}: {
  detail: PrivacyRequestAdminResponse
  onUpdated: (updated: PrivacyRequestAdminResponse) => Promise<void>
  onClose: () => void
}) {
  const [status, setStatus] = useState<PrivacyRequestStatus>(detail.status)
  const [customerVisibleResult, setCustomerVisibleResult] = useState(detail.customerVisibleResult ?? '')
  const [customerVisibleNote, setCustomerVisibleNote] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStatus(detail.status)
    setCustomerVisibleResult(detail.customerVisibleResult ?? '')
    setCustomerVisibleNote('')
    setInternalNote('')
    setError(null)
  }, [detail])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const updated = await updateAdminPrivacyRequest(detail.id, {
        status,
        customerVisibleResult: customerVisibleResult.trim() || null,
        customerVisibleNote: customerVisibleNote.trim() || null,
        internalNote: internalNote.trim() || null,
      })
      await onUpdated(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không cập nhật được')
    } finally {
      setSaving(false)
    }
  }

  const isSensitive = detail.type === 'Deletion' || detail.type === 'Restriction'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl text-ink-secondary">Chi tiết yêu cầu</h3>
          <p className="mt-1 font-mono text-xs text-ink-subtle">{detail.id}</p>
        </div>
        <button type="button" onClick={onClose} className="text-xs uppercase tracking-widest text-ink-subtle">
          Đóng
        </button>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Loại" value={typeLabel(detail.type)} />
        <Info label="Trạng thái hiện tại" value={STATUS_LABELS[detail.status]} />
        <Info label="Khách" value={detail.customerNameSnapshot ?? '—'} />
        <Info label="SĐT" value={detail.customerPhoneSnapshot ?? '—'} />
        <Info label="Email" value={detail.customerEmailSnapshot ?? '—'} />
        <Info label="Firebase UID" value={detail.customerFirebaseUid} mono />
        <Info label="Customer Id" value={detail.customerId ?? '—'} mono />
        <Info label="Gửi lúc" value={formatDateTime(detail.createdAt)} />
      </dl>

      <div>
        <p className="text-xs uppercase tracking-widest text-ink-subtle">Nội dung khách gửi</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-secondary">{detail.description}</p>
      </div>

      {isSensitive && (
        <p className="border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
          Yêu cầu {detail.type === 'Deletion' ? 'xóa' : 'hạn chế'}: chỉ ghi nhận quyết định sau khi xác minh.
          Không thực hiện xóa Orders / Payment / Firebase Auth từ màn hình này.
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-4 border-t border-edge pt-5">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-subtle">Cập nhật trạng thái</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PrivacyRequestStatus)}
            className="field-input mt-1"
          >
            {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-subtle">
            Kết quả phản hồi khách {isSensitive ? '(bắt buộc khi Approved/Completed)' : ''}
          </span>
          <textarea
            rows={3}
            value={customerVisibleResult}
            onChange={(e) => setCustomerVisibleResult(e.target.value)}
            className="field-input mt-1"
            placeholder="Khách sẽ thấy nội dung này"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-subtle">Ghi chú hiển thị thêm (lịch sử)</span>
          <textarea
            rows={2}
            value={customerVisibleNote}
            onChange={(e) => setCustomerVisibleNote(e.target.value)}
            className="field-input mt-1"
            placeholder="Ví dụ: Cần bổ sung CCCD / đã xác minh qua SĐT"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-subtle">Ghi chú nội bộ (không trả về khách)</span>
          <textarea
            rows={2}
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            className="field-input mt-1"
            placeholder="Chỉ nhân viên thấy"
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" disabled={saving} className="btn-gold sm:max-w-xs">
          {saving ? 'Đang lưu...' : 'Lưu xử lý'}
        </button>
      </form>

      <div>
        <h4 className="text-xs uppercase tracking-widest text-ink-subtle">Lịch sử xử lý</h4>
        <ul className="mt-3 space-y-3">
          {detail.history.map((h, idx) => (
            <li key={`${h.at}-${idx}`} className="border-l border-edge pl-3 text-sm">
              <p className="text-ink-secondary">
                {STATUS_LABELS[h.toStatus]}
                {h.fromStatus ? ` ← ${STATUS_LABELS[h.fromStatus]}` : ''}
              </p>
              <p className="text-xs text-ink-subtle">
                {formatDateTime(h.at)} · {h.actorRole} · {h.actorUid.slice(0, 10)}…
              </p>
              {h.customerVisibleNote && <p className="mt-1 text-ink-muted">Khách thấy: {h.customerVisibleNote}</p>}
              {h.internalNote && <p className="mt-1 text-warning/90">Nội bộ: {h.internalNote}</p>}
            </li>
          ))}
        </ul>
        {detail.internalNotes && (
          <p className="mt-4 text-xs text-ink-subtle">Ghi chú nội bộ mới nhất: {detail.internalNotes}</p>
        )}
      </div>
    </div>
  )
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-ink-subtle">{label}</dt>
      <dd className={`mt-1 text-ink-secondary ${mono ? 'font-mono text-xs break-all' : ''}`}>{value}</dd>
    </div>
  )
}

function typeLabel(type: PrivacyRequestType) {
  return TYPE_OPTIONS.find((t) => t.value === type)?.label ?? type
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
