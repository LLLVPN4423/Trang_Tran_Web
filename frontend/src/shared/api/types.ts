export type HairSize = 'S' | 'M' | 'L' | 'XL'

export type ServiceCategory =
  | 'Cut'
  | 'Styling'
  | 'Perm'
  | 'Straightening'
  | 'Dye'
  | 'Bleach'
  | 'Highlight'
  | 'Balayage'
  | 'Recovery'

export type StylistLevel = 'MasterTrangTran' | 'Senior' | 'Junior' | 'BangTrim'

export type OrderItemType = 'Service' | 'Product'

export type OrderStatus = 'Pending' | 'Paid' | 'Cancelled'

export interface ServiceResponse {
  id: string
  name: string
  description: string | null
  category: ServiceCategory
  stylistLevel: StylistLevel | null
  basePrice: number | null
  priceBySize: Record<string, number> | null
  durationMinutes: number | null
  imageUrl: string | null
  galleryUrls: string[]
  videoUrl: string | null
  isActive: boolean
}

export interface ProductResponse {
  id: string
  name: string
  description: string | null
  brand: string
  price: number
  stock: number
  imageUrl: string | null
  galleryUrls: string[]
  videoUrl: string | null
  isActive: boolean
}

export interface CreateOrderItemRequest {
  itemId: string
  itemType: OrderItemType
  quantity?: number
  hairSize?: HairSize | null
}

export interface OrderItemResponse {
  itemId: string
  itemType: OrderItemType
  name: string
  quantity: number
  unitPrice: number
  hairSize: HairSize | null
  subtotal: number
}

export interface CreateOrderRequest {
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  notes?: string | null
  items: CreateOrderItemRequest[]
  promoCode?: string | null
  pointsToRedeem?: number
}

export interface OrderResponse {
  id: string
  customerId: string | null
  customerName: string
  customerPhone: string
  customerEmail: string | null
  notes: string | null
  items: OrderItemResponse[]
  subtotalAmount: number
  discountAmount: number
  promotionCode: string | null
  pointsRedeemed: number
  pointsEarned: number
  totalAmount: number
  status: OrderStatus
  paymentCode: string
  accessToken: string
  createdAt: string
  paidAt?: string | null
}

export type PromotionType = 'Percentage' | 'FixedAmount'

export interface PromotionResponse {
  id: string
  code: string
  name: string
  description: string | null
  type: PromotionType
  value: number
  minOrderAmount: number
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
}

export interface CreatePromotionRequest {
  code: string
  name: string
  description?: string | null
  type: PromotionType
  value: number
  minOrderAmount: number
  maxUses?: number | null
  expiresAt?: string | null
  isActive?: boolean
}

export interface UpdatePromotionRequest {
  code: string
  name: string
  description?: string | null
  type: PromotionType
  value: number
  minOrderAmount: number
  maxUses?: number | null
  expiresAt?: string | null
  isActive: boolean
}

export interface ValidatePromotionResponse {
  isValid: boolean
  message: string | null
  discountAmount: number
  promotionId: string | null
  promotionName: string | null
}

export interface CustomerResponse {
  id: string
  name: string
  phone: string
  email: string | null
  loyaltyPoints: number
  totalSpent: number
  createdAt: string
}

export interface SyncCustomerRequest {
  name: string
  phone: string
  email?: string | null
}

export interface LoyaltySummaryResponse {
  points: number
  totalSpent: number
  pointsPerTenThousandVnd: number
  redeemRatePoints: number
  redeemRateValueVnd: number
}

export type LoyaltyTransactionType = 'Earn' | 'Redeem' | 'Adjust'

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'

export interface CreateAppointmentRequest {
  customerName: string
  customerPhone: string
  serviceInterest: string
  notes?: string | null
}

export interface AppointmentResponse {
  id: string
  customerId: string | null
  customerName: string
  customerPhone: string
  serviceInterest: string
  notes: string | null
  status: AppointmentStatus
  createdAt: string
}

export interface LoyaltyTransactionResponse {
  id: string
  type: LoyaltyTransactionType
  points: number
  description: string
  orderId: string | null
  createdAt: string
}

export interface ApiErrorResponse {
  statusCode: number
  message: string
  traceId?: string
  errors?: Record<string, string[]>
}

export interface CreateServiceRequest {
  name: string
  description?: string | null
  category: ServiceCategory
  stylistLevel?: StylistLevel | null
  basePrice?: number | null
  priceBySize?: Record<string, number> | null
  durationMinutes?: number | null
  imageUrl?: string | null
  galleryUrls?: string[] | null
  videoUrl?: string | null
  isActive?: boolean
}

export interface UpdateServiceRequest {
  name: string
  description?: string | null
  category: ServiceCategory
  stylistLevel?: StylistLevel | null
  basePrice?: number | null
  priceBySize?: Record<string, number> | null
  durationMinutes?: number | null
  imageUrl?: string | null
  galleryUrls?: string[] | null
  videoUrl?: string | null
  isActive: boolean
}

export interface CreateProductRequest {
  name: string
  description?: string | null
  brand: string
  price: number
  stock: number
  imageUrl?: string | null
  galleryUrls?: string[] | null
  videoUrl?: string | null
  isActive?: boolean
}

export interface UpdateProductRequest {
  name: string
  description?: string | null
  brand: string
  price: number
  stock: number
  imageUrl?: string | null
  galleryUrls?: string[] | null
  videoUrl?: string | null
  isActive: boolean
}

export const HAIR_SIZES: HairSize[] = ['S', 'M', 'L', 'XL']

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  Cut: 'Cắt tóc',
  Styling: 'Gội & Tạo kiểu',
  Perm: 'Uốn',
  Straightening: 'Duỗi',
  Dye: 'Nhuộm',
  Bleach: 'Tẩy',
  Highlight: 'Highlight',
  Balayage: 'Balayage',
  Recovery: 'Phục hồi',
}

export const STYLIST_LABELS: Record<StylistLevel, string> = {
  MasterTrangTran: 'Master Trang Trần',
  Senior: 'Senior',
  Junior: 'Junior',
  BangTrim: 'Cắt mái',
}

export interface UpdateCustomerRequest {
  name: string
  phone: string
  email?: string | null
}

export function resolveServicePrice(service: ServiceResponse, hairSize: HairSize): number {
  if (service.basePrice != null) return service.basePrice
  if (service.priceBySize?.[hairSize] != null) return service.priceBySize[hairSize]
  if (service.priceBySize?.['M'] != null) return service.priceBySize['M']
  return 0
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}
