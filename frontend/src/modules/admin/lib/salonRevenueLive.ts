import type { AppointmentResponse, OrderResponse } from '@/shared/api/types'

export type RevenueBreakdown = {
  retailPaidToday: number
  servicePaidToday: number
  totalPaidToday: number
  pendingRetail: number
  pendingService: number
  paidServiceAllTime: number
  paidRetailAllTime: number
}

function isToday(iso: string | null | undefined): boolean {
  if (!iso) return false
  return new Date(iso).toDateString() === new Date().toDateString()
}

export function computeRevenueBreakdown(
  retailOrders: OrderResponse[],
  serviceInvoices: OrderResponse[],
): RevenueBreakdown {
  const paidRetail = retailOrders.filter((o) => o.status === 'Paid')
  const paidService = serviceInvoices.filter((o) => o.status === 'Paid')

  return {
    retailPaidToday: paidRetail
      .filter((o) => isToday(o.paidAt ?? o.createdAt))
      .reduce((s, o) => s + o.totalAmount, 0),
    servicePaidToday: paidService
      .filter((o) => isToday(o.paidAt ?? o.createdAt))
      .reduce((s, o) => s + o.totalAmount, 0),
    totalPaidToday: 0,
    pendingRetail: retailOrders.filter((o) => o.status === 'Pending').length,
    pendingService: serviceInvoices.filter((o) => o.status === 'Pending').length,
    paidRetailAllTime: paidRetail.reduce((s, o) => s + o.totalAmount, 0),
    paidServiceAllTime: paidService.reduce((s, o) => s + o.totalAmount, 0),
  }
}

export function finalizeBreakdown(b: RevenueBreakdown): RevenueBreakdown {
  return { ...b, totalPaidToday: b.retailPaidToday + b.servicePaidToday }
}

/** Lịch đã xác nhận/hoàn tất nhưng chưa có hóa đơn (HD) gắn appointmentId. */
export function appointmentsMissingInvoice(
  appointments: AppointmentResponse[],
  serviceInvoices: OrderResponse[],
): AppointmentResponse[] {
  const linked = new Set(
    serviceInvoices
      .filter((i) => i.appointmentId && i.status !== 'Cancelled')
      .map((i) => i.appointmentId as string),
  )
  return appointments.filter(
    (a) =>
      (a.status === 'Confirmed' || a.status === 'Completed') &&
      !linked.has(a.id),
  )
}

export function exportInvoicesCsv(invoices: OrderResponse[]): string {
  const header = 'MaHD,TrangThai,NgayTao,NgayTT,Khach,SDT,TongTien,AdminUID'
  const rows = invoices.map((i) =>
    [
      i.paymentCode,
      i.status,
      i.createdAt,
      i.paidAt ?? '',
      `"${i.customerName.replace(/"/g, '""')}"`,
      i.customerPhone,
      i.totalAmount,
      i.createdByAdminUid ?? '',
    ].join(','),
  )
  return [header, ...rows].join('\n')
}
