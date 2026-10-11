import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  createServiceInvoice,
  fetchAllCustomers,
  fetchAllProducts,
  fetchAllServices,
  fetchAppointments,
  fetchServiceInvoices,
  updateOrderStatus,
  updateServiceInvoice,
} from '@/shared/api/endpoints'
import type {
  AppointmentResponse,
  CustomerResponse,
  HairSize,
  OrderItemType,
  OrderResponse,
  OrderStatus,
  ProductResponse,
  ServiceInvoiceLineRequest,
  ServiceResponse,
} from '@/shared/api/types'
import { formatVnd, resolveServicePrice } from '@/shared/api/types'
import {
  buildInvoiceLinesFromAppointment,
  extractCustomerNotesFromAppointment,
} from '@/shared/lib/appointmentInvoicePrefill'
import { buildVietQrImageUrl, getVietQrConfigFromEnv } from '@/shared/lib/vietqr'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { AdminLiveBadge, AdminNewItemsBanner } from './AdminLiveBadge'
import { useAuth } from '@/shared/auth/AuthProvider'
import { AdminButton, AdminPanelHeader, adminInputClass } from './AdminFormUi'
import { AdminFilterChips } from './AdminFilterChips'
import {
  computeRevenueBreakdown,
  exportInvoicesCsv,
  finalizeBreakdown,
} from '@/modules/admin/lib/salonRevenue'

const HAIR_SIZES: HairSize[] = ['S', 'M', 'L', 'XL']

type LineDraft = {
  key: string
  itemType: OrderItemType
  itemId: string
  name: string
  hairSize: HairSize | ''
  quantity: number
  unitPrice: string
}

function newLine(partial?: Partial<LineDraft>): LineDraft {
  return {
    key: crypto.randomUUID(),
    itemType: 'Service',
    itemId: '',
    name: '',
    hairSize: 'M',
    quantity: 1,
    unitPrice: '',
    ...partial,
  }
}

function lineSubtotal(line: LineDraft): number {
  const price = Number(line.unitPrice) || 0
  return price * Math.max(1, line.quantity)
}

function validateInvoiceLines(lines: LineDraft[]): string | null {
  const active = lines.filter(
    (l) =>
      l.itemType === 'Custom' ||
      (l.itemType === 'Service' && l.itemId) ||
      (l.itemType === 'Product' && l.itemId),
  )
  if (active.length === 0) return 'Thêm ít nhất một dòng dịch vụ/sản phẩm (chọn tên trong danh sách).'

  for (const l of active) {
    if (l.itemType === 'Service' && !l.itemId) return `Chọn dịch vụ trong danh sách (dòng: ${l.name || 'trống'}).`
    if (l.itemType === 'Product' && !l.itemId) return 'Chọn sản phẩm trong danh sách.'
    if (l.itemType === 'Custom' && !l.name.trim()) return 'Nhập tên phí phát sinh.'
    if (!(Number(l.unitPrice) > 0)) return `Nhập đơn giá > 0 (${l.name || 'dòng hóa đơn'}).`
  }
  return null
}

function toRequestLines(lines: LineDraft[]): ServiceInvoiceLineRequest[] {
  return lines
    .filter(
      (l) =>
        l.itemType === 'Custom' ||
        (l.itemType === 'Service' && l.itemId) ||
        (l.itemType === 'Product' && l.itemId),
    )
    .map((l) => ({
    itemType: l.itemType,
    itemId: l.itemId || null,
    name: l.name || null,
    hairSize: l.hairSize || null,
    quantity: l.quantity,
    unitPrice: l.unitPrice ? Number(l.unitPrice) : null,
    }))
}

const INVOICE_STATUS_CHIPS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'Pending', label: 'Chờ thanh toán' },
  { value: 'Paid', label: 'Đã thanh toán' },
  { value: 'Cancelled', label: 'Đã hủy' },
]

export function ServiceInvoicesAdminPanel() {
  const { adminRole } = useAuth()
  const canExportCsv = adminRole === 'platform'
  const [searchParams] = useSearchParams()
  const appliedApptFromUrl = useRef<string | null>(null)
  const [status, setStatus] = useState<OrderStatus | ''>('Pending')
  const [phoneFilter, setPhoneFilter] = useState('')

  const [services, setServices] = useState<ServiceResponse[]>([])
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [appointmentId, setAppointmentId] = useState('')
  const [notes, setNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [manualDiscount, setManualDiscount] = useState('0')
  const [promoCode, setPromoCode] = useState('')
  const [pointsToRedeem, setPointsToRedeem] = useState('0')
  const [paymentMode, setPaymentMode] = useState<'bank' | 'cash'>('bank')
  const [lines, setLines] = useState<LineDraft[]>([newLine()])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [createdLink, setCreatedLink] = useState<OrderResponse | null>(null)

  const fetchFn = useCallback(
    () =>
      fetchServiceInvoices({
        status: status || undefined,
        phone: phoneFilter.trim() || undefined,
        live: true,
      }),
    [status, phoneFilter],
  )

  const {
    items: invoices,
    initialLoading,
    refreshing,
    error,
    lastUpdated,
    newIds,
    refresh,
    dismissNew,
    dismissAllNew,
    setItems: setInvoices,
  } = useAdminLiveRefresh(fetchFn, `${status}|${phoneFilter.trim()}`)

  useEffect(() => {
    void (async () => {
      try {
        const [svc, prod, cust, appt] = await Promise.all([
          fetchAllServices(),
          fetchAllProducts(),
          fetchAllCustomers(),
          fetchAppointments(undefined, { live: true }),
        ])
        setServices(svc.filter((s) => s.isActive))
        setProducts(prod.filter((p) => p.isActive))
        setCustomers(cust)
        setAppointments(appt)
      } finally {
        setCatalogLoading(false)
      }
    })()
  }, [])

  const applyAppointmentToForm = useCallback(
    (appt: AppointmentResponse) => {
      setAppointmentId(appt.id)
      setCustomerName(appt.customerName)
      setCustomerPhone(appt.customerPhone)
      if (appt.customerId) setCustomerId(appt.customerId)

      const prefill = buildInvoiceLinesFromAppointment(appt, services)
      if (prefill.length > 0) {
        setLines(prefill.map((p) => newLine(p)))
      }

      const customerNote = extractCustomerNotesFromAppointment(appt.notes)
      setNotes(customerNote || appt.serviceInterest)
    },
    [services],
  )

  useEffect(() => {
    setCreatedLink((c) => {
      if (!c) return c
      const fresh = invoices.find((i) => i.id === c.id)
      if (!fresh) return c
      if (fresh.status === 'Pending') return fresh
      return null
    })
  }, [invoices])

  useEffect(() => {
    const fromAppt = searchParams.get('appointmentId')
    if (!fromAppt || appointments.length === 0 || services.length === 0) return
    if (appliedApptFromUrl.current === fromAppt) return
    const appt = appointments.find((a) => a.id === fromAppt)
    if (!appt) return
    appliedApptFromUrl.current = fromAppt
    applyAppointmentToForm(appt)
  }, [searchParams, appointments, services, applyAppointmentToForm])

  const revenueSummary = useMemo(
    () => finalizeBreakdown(computeRevenueBreakdown([], invoices)),
    [invoices],
  )

  const subtotalPreview = useMemo(() => lines.reduce((s, l) => s + lineSubtotal(l), 0), [lines])
  const discountPreview = Math.max(0, Number(manualDiscount) || 0)
  const totalPreview = Math.max(0, subtotalPreview - discountPreview)

  const applyCustomer = (id: string) => {
    setCustomerId(id)
    const c = customers.find((x) => x.id === id)
    if (c) {
      setCustomerName(c.name)
      setCustomerPhone(c.phone)
    }
  }

  const syncServicePrice = (line: LineDraft, serviceId: string, size: HairSize | '') => {
    const svc = services.find((s) => s.id === serviceId)
    if (!svc) return line.unitPrice
    try {
      const price = svc.basePrice ?? resolveServicePrice(svc, (size || 'M') as HairSize)
      return String(price)
    } catch {
      return line.unitPrice
    }
  }

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l
        const next = { ...l, ...patch }
        if (patch.itemId && next.itemType === 'Service') {
          next.unitPrice = syncServicePrice(next, patch.itemId, next.hairSize)
          const svc = services.find((s) => s.id === patch.itemId)
          if (svc) next.name = svc.name
        }
        if (patch.hairSize && next.itemType === 'Service' && next.itemId) {
          next.unitPrice = syncServicePrice(next, next.itemId, patch.hairSize)
        }
        if (patch.itemId && next.itemType === 'Product') {
          const p = products.find((x) => x.id === patch.itemId)
          if (p) {
            next.name = p.name
            next.unitPrice = String(p.price)
          }
        }
        return next
      }),
    )
  }

  const loadInvoiceToForm = (inv: OrderResponse) => {
    setEditingId(inv.id)
    setCustomerName(inv.customerName)
    setCustomerPhone(inv.customerPhone)
    setCustomerId(inv.customerId ?? '')
    setAppointmentId(inv.appointmentId ?? '')
    setNotes(inv.notes ?? '')
    setInternalNotes(inv.internalNotes ?? '')
    setManualDiscount(String(inv.manualDiscountAmount))
    setPromoCode(inv.promotionCode ?? '')
    setPointsToRedeem(String(inv.pointsRedeemed))
    setPaymentMode(inv.paymentMethod === 'CashAtSalon' ? 'cash' : 'bank')
    setLines(
      inv.items.map((i) =>
        newLine({
          itemType: i.itemType,
          itemId: i.itemId,
          name: i.name,
          hairSize: i.hairSize ?? '',
          quantity: i.quantity,
          unitPrice: String(i.unitPrice),
        }),
      ),
    )
    setCreatedLink(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setCustomerName('')
    setCustomerPhone('')
    setCustomerId('')
    setAppointmentId('')
    setNotes('')
    setInternalNotes('')
    setManualDiscount('0')
    setPromoCode('')
    setPointsToRedeem('0')
    setPaymentMode('bank')
    setLines([newLine()])
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const lineError = validateInvoiceLines(lines)
    if (lineError) {
      setFormError(lineError)
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: null,
        customerId: customerId || null,
        appointmentId: appointmentId || null,
        notes: notes.trim() || null,
        internalNotes: internalNotes.trim() || null,
        lines: toRequestLines(lines),
        manualDiscountAmount: Number(manualDiscount) || 0,
        promoCode: promoCode.trim() || null,
        pointsToRedeem: Number(pointsToRedeem) || 0,
        paymentMethod: paymentMode === 'cash' ? ('CashAtSalon' as const) : ('BankTransfer' as const),
        markPaidImmediately: paymentMode === 'cash',
      }

      if (editingId) {
        const updated = await updateServiceInvoice(editingId, payload)
        dismissNew(updated.id)
        setInvoices((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
        setCreatedLink(updated.status === 'Pending' ? updated : null)
        resetForm()
      } else {
        const created = await createServiceInvoice(payload)
        dismissNew(created.id)
        setInvoices((prev) => [created, ...prev])
        setCreatedLink(created.status === 'Pending' ? created : null)
        resetForm()
      }
      await refresh(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Không thể lưu hóa đơn')
    } finally {
      setSubmitting(false)
    }
  }

  const copyPaymentLink = (order: OrderResponse) => {
    const url = `${window.location.origin}/orders/${order.id}?token=${encodeURIComponent(order.accessToken)}`
    void navigator.clipboard.writeText(url)
    alert('Đã copy link thanh toán')
  }

  const qrUrl =
    createdLink && createdLink.status === 'Pending'
      ? buildVietQrImageUrl(getVietQrConfigFromEnv(), {
          amount: createdLink.totalAmount,
          paymentCode: createdLink.paymentCode,
        })
      : null

  if (catalogLoading && initialLoading) {
    return <LoadingState label="Đang tải..." />
  }

  return (
    <div className="space-y-10">
      <AdminPanelHeader
        title="Hóa đơn dịch vụ"
        count={invoices.length}
        action={
          canExportCsv ? (
            <AdminButton
              onClick={() => {
                const csv = exportInvoicesCsv(invoices)
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `hoa-don-dich-vu-${new Date().toISOString().slice(0, 10)}.csv`
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              Xuất CSV
            </AdminButton>
          ) : undefined
        }
      />

      <div className="rounded-sm border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-400">
        <p className="text-zinc-300">
          Hóa đơn lưu trong Firebase Firestore, collection <code className="text-gold">orders</code>, mã{' '}
          <strong className="text-zinc-200">HD…</strong> (khác đơn shop <strong>DH…</strong>).
        </p>
        <p className="mt-2">
          Đã thu (tất cả HD Paid):{' '}
          <strong className="text-gold">{formatVnd(revenueSummary.paidServiceAllTime)}</strong>
          {' · '}
          Hôm nay: <strong className="text-zinc-200">{formatVnd(revenueSummary.servicePaidToday)}</strong>
          {' · '}
          Chờ TT: <strong className="text-amber-300">{revenueSummary.pendingService}</strong> hóa đơn
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Quy tắc: giảm giá &gt;50% cần ghi chú nội bộ; giá dịch vụ &lt;75% bảng giá bị chặn; hóa đơn CK chờ quá 72h tự hủy;
          mọi hóa đơn ghi UID admin tạo.
        </p>
      </div>

      {formError && <ApiErrorState message={formError} onRetry={() => setFormError(null)} />}

      {createdLink?.status === 'Pending' && (
        <div className="rounded-sm border border-gold/30 bg-gold/5 p-4 text-sm text-zinc-300">
          <p className="font-serif text-lg text-gold">Hóa đơn {createdLink.paymentCode}</p>
          <p className="mt-1">Tổng: {formatVnd(createdLink.totalAmount)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <AdminButton variant="primary" onClick={() => copyPaymentLink(createdLink)}>
              Copy link thanh toán
            </AdminButton>
            <Link
              to={`/orders/${createdLink.id}?token=${encodeURIComponent(createdLink.accessToken)}`}
              className="inline-flex items-center border border-zinc-600 px-3 py-1.5 text-xs uppercase tracking-widest text-zinc-300 hover:border-gold/40"
              target="_blank"
              rel="noreferrer"
            >
              Mở trang khách
            </Link>
          </div>
          {qrUrl && (
            <img src={qrUrl} alt="VietQR" className="mt-4 max-w-[220px] rounded border border-zinc-700" />
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-sm border border-zinc-800 p-4 sm:p-6">
        <h3 className="font-serif text-xl text-zinc-200">{editingId ? 'Sửa hóa đơn' : 'Tạo hóa đơn mới'}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs text-zinc-500">
            Từ lịch hẹn
            <select
              className={adminInputClass}
              value={appointmentId}
              onChange={(e) => {
                const id = e.target.value
                if (!id) {
                  setAppointmentId('')
                  return
                }
                const appt = appointments.find((a) => a.id === id)
                if (appt) applyAppointmentToForm(appt)
              }}
            >
              <option value="">— Walk-in / không từ lịch —</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.customerName} · {a.customerPhone} · {a.serviceInterest}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-zinc-500">
            Khách có tài khoản (điểm thưởng)
            <select className={adminInputClass} value={customerId} onChange={(e) => applyCustomer(e.target.value)}>
              <option value="">Khách vãng lai</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.phone} · {c.loyaltyPoints} điểm
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-zinc-500">
            Họ tên
            <input required className={adminInputClass} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </label>
          <label className="block text-xs text-zinc-500">
            SĐT
            <input required className={adminInputClass} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </label>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Dòng hóa đơn</p>
          {lines.map((line) => (
            <div key={line.key} className="grid gap-2 rounded border border-zinc-800 p-3 sm:grid-cols-12">
              <select
                className={`${adminInputClass} sm:col-span-2`}
                value={line.itemType}
                onChange={(e) =>
                  updateLine(line.key, {
                    itemType: e.target.value as OrderItemType,
                    itemId: '',
                    name: '',
                    unitPrice: '',
                  })
                }
              >
                <option value="Service">Dịch vụ</option>
                <option value="Product">Sản phẩm</option>
                <option value="Custom">Phí phát sinh</option>
              </select>
              {line.itemType === 'Custom' ? (
                <input
                  placeholder="Tên phí"
                  className={`${adminInputClass} sm:col-span-3`}
                  value={line.name}
                  onChange={(e) => updateLine(line.key, { name: e.target.value })}
                />
              ) : (
                <select
                  className={`${adminInputClass} sm:col-span-3`}
                  value={line.itemId}
                  onChange={(e) => updateLine(line.key, { itemId: e.target.value })}
                >
                  <option value="">Chọn...</option>
                  {(line.itemType === 'Service' ? services : products).map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              )}
              {line.itemType === 'Service' && (
                <select
                  className={`${adminInputClass} sm:col-span-1`}
                  value={line.hairSize}
                  onChange={(e) => updateLine(line.key, { hairSize: e.target.value as HairSize })}
                >
                  {HAIR_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="number"
                min={1}
                className={`${adminInputClass} sm:col-span-1`}
                value={line.quantity}
                onChange={(e) => updateLine(line.key, { quantity: Number(e.target.value) || 1 })}
              />
              <input
                type="number"
                min={0}
                step={1000}
                placeholder="Đơn giá"
                className={`${adminInputClass} sm:col-span-2`}
                value={line.unitPrice}
                onChange={(e) => updateLine(line.key, { unitPrice: e.target.value })}
              />
              <div className="flex items-center justify-between gap-2 sm:col-span-3">
                <span className="text-sm text-zinc-400">{formatVnd(lineSubtotal(line))}</span>
                <AdminButton
                  variant="danger"
                  onClick={() => setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== line.key)))}
                >
                  Xóa
                </AdminButton>
              </div>
            </div>
          ))}
          <AdminButton onClick={() => setLines((p) => [...p, newLine()])}>+ Thêm dòng</AdminButton>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs text-zinc-500">
            Giảm giá tay (VND)
            <input className={adminInputClass} type="number" min={0} value={manualDiscount} onChange={(e) => setManualDiscount(e.target.value)} />
          </label>
          <label className="block text-xs text-zinc-500">
            Mã khuyến mãi
            <input className={adminInputClass} value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
          </label>
          <label className="block text-xs text-zinc-500">
            Điểm đổi
            <input className={adminInputClass} type="number" min={0} step={10} value={pointsToRedeem} onChange={(e) => setPointsToRedeem(e.target.value)} />
          </label>
          <label className="block text-xs text-zinc-500">
            Thanh toán
            <select
              className={adminInputClass}
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as 'bank' | 'cash')}
            >
              <option value="bank">Gửi link CK / VietQR</option>
              <option value="cash">Đã thu tiền mặt tại tiệm</option>
            </select>
          </label>
          <label className="block text-xs text-zinc-500 sm:col-span-2">
            Ghi chú (khách thấy)
            <textarea className={adminInputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <label className="block text-xs text-zinc-500 sm:col-span-2">
            Ghi chú nội bộ
            <textarea className={adminInputClass} rows={2} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
          </label>
        </div>

        <p className="text-sm text-zinc-400">
          Tạm tính: {formatVnd(subtotalPreview)} · Giảm: {formatVnd(discountPreview)} ·{' '}
          <strong className="text-gold">≈ {formatVnd(totalPreview)}</strong> (chưa tính KM/điểm)
        </p>

        <div className="flex flex-wrap gap-2">
          <AdminButton type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật hóa đơn' : 'Tạo hóa đơn'}
          </AdminButton>
          {editingId && (
            <AdminButton onClick={resetForm} disabled={submitting}>
              Hủy sửa
            </AdminButton>
          )}
        </div>
      </form>

      <AdminLiveBadge
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        newCount={newIds.size}
        onRefresh={() => refresh(true)}
        onDismissNew={dismissAllNew}
      />
      <AdminNewItemsBanner count={newIds.size} onDismiss={dismissAllNew} label="hóa đơn mới" />

      {initialLoading ? (
        <LoadingState label="Đang tải danh sách..." />
      ) : error ? (
        <ApiErrorState message={error} onRetry={() => refresh(true)} />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <AdminFilterChips
              value={status}
              onChange={setStatus}
              options={INVOICE_STATUS_CHIPS}
              aria-label="Lọc trạng thái hóa đơn"
            />
            <input
              className={`${adminInputClass} w-full sm:max-w-xs`}
              placeholder="Lọc SĐT"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
            />
          </div>
          {invoices.map((inv) => (
            <div key={inv.id} className="rounded border border-zinc-800 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-gold">{inv.paymentCode}</p>
                  <p className="text-sm text-zinc-300">
                    {inv.customerName} · {inv.customerPhone}
                  </p>
                  <p className="text-lg text-zinc-100">{formatVnd(inv.totalAmount)} · {inv.status}</p>
                  {inv.createdByAdminUid && (
                    <p className="mt-1 font-mono text-[10px] text-zinc-600">Admin: {inv.createdByAdminUid}</p>
                  )}
                  <p className="text-xs text-zinc-600">
                    {new Date(inv.createdAt).toLocaleString('vi-VN')}
                    {inv.paidAt ? ` → TT ${new Date(inv.paidAt).toLocaleString('vi-VN')}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {inv.status === 'Pending' && (
                    <>
                      <AdminButton onClick={() => loadInvoiceToForm(inv)}>Sửa</AdminButton>
                      <AdminButton variant="primary" onClick={() => copyPaymentLink(inv)}>
                        Link CK
                      </AdminButton>
                      <AdminButton
                        variant="primary"
                        onClick={async () => {
                          const u = await updateOrderStatus(inv.id, 'Paid')
                          dismissNew(u.id)
                          setInvoices((prev) => prev.map((o) => (o.id === u.id ? u : o)))
                          setCreatedLink((c) => (c?.id === u.id ? null : c))
                        }}
                      >
                        Đã CK
                      </AdminButton>
                    </>
                  )}
                </div>
              </div>
              <ul className="mt-2 text-xs text-zinc-500">
                {inv.items.map((i, idx) => (
                  <li key={idx}>
                    {i.name} ×{i.quantity} — {formatVnd(i.subtotal)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
