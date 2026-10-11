import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/shared/api/client'
import {
  fetchAppointments,
  fetchOrders,
  fetchServiceInvoices,
} from '@/shared/api/endpoints'
import {
  appointmentsMissingInvoice,
  computeRevenueBreakdown,
} from '@/modules/admin/lib/salonRevenue'
import { useAdminPoll } from './useAdminLiveRefresh'

export type AdminNotificationItem = {
  id: string
  tone: 'warning' | 'info'
  title: string
  detail?: string
  href?: string
  linkLabel?: string
}

export function useAdminNotifications() {
  const [items, setItems] = useState<AdminNotificationItem[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [appointments, serviceInvoices, retailOrders, healthRes] = await Promise.all([
        fetchAppointments(undefined, { live: true }),
        fetchServiceInvoices({ live: true }),
        fetchOrders({ kind: 'Retail', live: true }),
        apiClient.get<{ persistence?: { mode?: string; detail?: string } }>('/api/health').catch(() => null),
      ])

      const next: AdminNotificationItem[] = []
      const missing = appointmentsMissingInvoice(appointments ?? [], serviceInvoices ?? [])
      if (missing.length > 0) {
        next.push({
          id: 'missing-invoice',
          tone: 'warning',
          title: `${missing.length} lịch chưa có hóa đơn HD`,
          detail: 'Lịch đã xác nhận hoặc hoàn tất nhưng chưa tạo hóa đơn dịch vụ.',
          href: '/admin/appointments',
          linkLabel: 'Mở lịch hẹn',
        })
      }

      const pendingAppt = (appointments ?? []).filter((a) => a.status === 'Pending').length
      if (pendingAppt > 0) {
        next.push({
          id: 'pending-appointments',
          tone: 'info',
          title: `${pendingAppt} lịch chờ duyệt`,
          href: '/admin/appointments',
          linkLabel: 'Duyệt lịch',
        })
      }

      const rev = computeRevenueBreakdown(retailOrders ?? [], serviceInvoices ?? [])
      if (rev.pendingService > 0) {
        next.push({
          id: 'pending-service-invoices',
          tone: 'info',
          title: `${rev.pendingService} hóa đơn DV chờ thanh toán`,
          href: '/admin/service-invoices',
          linkLabel: 'Xem hóa đơn',
        })
      }

      if (rev.pendingRetail > 0) {
        const pendingRetail = rev.pendingRetail
        next.push({
          id: 'pending-retail',
          tone: 'info',
          title: `${pendingRetail} đơn shop cần xử lý`,
          href: '/admin/orders',
          linkLabel: 'Xem đơn',
        })
      }

      const health = healthRes?.data
      if (health?.persistence && health.persistence.mode !== 'firestore') {
        next.push({
          id: 'persistence-ram',
          tone: 'warning',
          title: 'Dữ liệu đang lưu tạm (RAM)',
          detail:
            health.persistence.detail ??
            'API chưa kết nối Firestore — kiểm tra .env và firebase-service-account.json.',
        })
      }

      setItems(next)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useAdminPoll(() => load(), 'notifications')

  return { items, loading, reload: load }
}
