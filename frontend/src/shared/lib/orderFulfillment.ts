import type { FulfillmentStatus, ShippingZone } from '@/shared/api/types'

export const SHIPPING_ZONES: { zone: ShippingZone; label: string; fee: number }[] = [
  { zone: 'SocTrangCity', label: 'Sóc Trăng nội thành', fee: 20_000 },
  { zone: 'SocTrangProvince', label: 'Sóc Trăng huyện / lân cận', fee: 35_000 },
  { zone: 'MekongNearby', label: 'Cần Thơ · An Giang · Bạc Liêu…', fee: 45_000 },
  { zone: 'Nationwide', label: 'TP lớn / tỉnh xa', fee: 55_000 },
]

export function getShippingFee(zone: ShippingZone): number {
  return SHIPPING_ZONES.find((z) => z.zone === zone)?.fee ?? 55_000
}

export function getShippingLabel(zone: ShippingZone): string {
  return SHIPPING_ZONES.find((z) => z.zone === zone)?.label ?? zone
}

export function normalizeFulfillmentStatus(value: string | undefined | null): FulfillmentStatus {
  const allowed: FulfillmentStatus[] = [
    'None',
    'AwaitingApproval',
    'Approved',
    'Shipped',
    'Delivered',
    'Completed',
    'Disputed',
  ]
  return allowed.includes(value as FulfillmentStatus) ? (value as FulfillmentStatus) : 'None'
}

export const FULFILLMENT_STATUS_LABELS: Record<FulfillmentStatus, string> = {
  None: 'Chưa giao',
  AwaitingApproval: 'Chờ duyệt COD',
  Approved: 'Sẵn sàng giao',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao tới khách',
  Completed: 'Khách đã xác nhận',
  Disputed: 'Khiếu nại',
}

export const DISPUTE_REASONS = [
  'Chưa nhận hàng',
  'Sai / thiếu sản phẩm',
  'Hàng hư hỏng',
  'Khác',
] as const

export type TimelineStep = {
  key: string
  label: string
  at: string | null
  active: boolean
  done: boolean
}

export function buildFulfillmentTimeline(order: {
  fulfillmentMethod: string
  fulfillmentStatus: FulfillmentStatus
  paymentMethod: string
  status: string
  approvedAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  completedAt: string | null
  paidAt: string | null
  createdAt: string
}): TimelineStep[] {
  if (order.fulfillmentMethod !== 'Delivery') {
    return [
      {
        key: 'placed',
        label: 'Đặt hàng',
        at: order.createdAt,
        active: order.status === 'Pending',
        done: true,
      },
      {
        key: 'paid',
        label: 'Thanh toán',
        at: order.paidAt,
        active: order.status === 'Pending',
        done: order.status === 'Paid',
      },
      {
        key: 'pickup',
        label: 'Nhận tại salon',
        at: order.completedAt,
        active: order.status === 'Paid' && order.fulfillmentStatus !== 'Completed',
        done: order.fulfillmentStatus === 'Completed',
      },
    ]
  }

  const fs = order.fulfillmentStatus
  const isCod = order.paymentMethod === 'COD'

  return [
    {
      key: 'placed',
      label: 'Đặt hàng',
      at: order.createdAt,
      active: false,
      done: true,
    },
    ...(isCod
      ? [
          {
            key: 'approve',
            label: 'Salon duyệt COD',
            at: order.approvedAt,
            active: fs === 'AwaitingApproval',
            done: ['Approved', 'Shipped', 'Delivered', 'Completed'].includes(fs),
          },
        ]
      : []),
    {
      key: 'paid',
      label: isCod ? 'Thanh toán khi nhận' : 'Chuyển khoản',
      at: order.paidAt,
      active: !isCod && order.status === 'Pending',
      done: order.status === 'Paid' || (isCod && ['Delivered', 'Completed'].includes(fs)),
    },
    {
      key: 'ship',
      label: 'Giao cho đơn vị vận chuyển',
      at: order.shippedAt,
      active: fs === 'Approved',
      done: ['Shipped', 'Delivered', 'Completed'].includes(fs),
    },
    {
      key: 'deliver',
      label: 'Đã giao tới bạn',
      at: order.deliveredAt,
      active: fs === 'Shipped',
      done: ['Delivered', 'Completed'].includes(fs),
    },
    {
      key: 'confirm',
      label: 'Bạn xác nhận đã nhận',
      at: order.completedAt,
      active: fs === 'Delivered',
      done: fs === 'Completed',
    },
  ]
}

export function canCustomerConfirm(order: {
  fulfillmentMethod: string
  fulfillmentStatus: FulfillmentStatus
  status: string
}): boolean {
  if (order.fulfillmentStatus === 'Completed' || order.fulfillmentStatus === 'Disputed') return false
  if (order.fulfillmentMethod === 'Delivery') return order.fulfillmentStatus === 'Delivered'
  return order.status === 'Paid' && order.fulfillmentStatus === 'None'
}

export function canCustomerDispute(order: {
  fulfillmentMethod: string
  fulfillmentStatus: FulfillmentStatus
}): boolean {
  return (
    order.fulfillmentMethod === 'Delivery' &&
    (order.fulfillmentStatus === 'Shipped' || order.fulfillmentStatus === 'Delivered')
  )
}
