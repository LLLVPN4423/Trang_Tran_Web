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

export type OrderItemType = 'Service' | 'Product' | 'Custom'

export type OrderKind = 'Retail' | 'ServiceInvoice'

export type OrderStatus = 'Pending' | 'Paid' | 'Cancelled'

export type PaymentMethod = 'BankTransfer' | 'COD' | 'CashAtSalon'

export type FulfillmentMethod = 'Pickup' | 'Delivery'

export type FulfillmentStatus =
  | 'None'
  | 'AwaitingApproval'
  | 'Approved'
  | 'Shipped'
  | 'Delivered'
  | 'Completed'
  | 'Disputed'

export type ShippingZone =
  | 'SocTrangCity'
  | 'SocTrangProvince'
  | 'MekongNearby'
  | 'Nationwide'

export interface ShippingZoneOption {
  zone: ShippingZone
  label: string
  fee: number
}

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
  paymentMethod?: PaymentMethod
  fulfillmentMethod?: FulfillmentMethod
  deliveryAddress?: string | null
  shippingZone?: ShippingZone | null
}

export interface UpdateShipmentRequest {
  trackingCode: string
  trackingUrl?: string | null
  carrier?: string | null
}

export interface SubmitDisputeRequest {
  reason: string
  notes?: string | null
}

export interface ServiceInvoiceLineRequest {
  itemType: OrderItemType
  itemId?: string | null
  name?: string | null
  hairSize?: HairSize | null
  quantity?: number
  unitPrice?: number | null
}

export interface CreateServiceInvoiceRequest {
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  customerId?: string | null
  appointmentId?: string | null
  notes?: string | null
  internalNotes?: string | null
  lines: ServiceInvoiceLineRequest[]
  manualDiscountAmount?: number
  promoCode?: string | null
  pointsToRedeem?: number
  paymentMethod?: PaymentMethod
  markPaidImmediately?: boolean
}

export interface UpdateServiceInvoiceRequest {
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  customerId?: string | null
  appointmentId?: string | null
  notes?: string | null
  internalNotes?: string | null
  lines: ServiceInvoiceLineRequest[]
  manualDiscountAmount?: number
  promoCode?: string | null
  pointsToRedeem?: number
  paymentMethod?: PaymentMethod
}

export interface OrderResponse {
  id: string
  kind: OrderKind
  appointmentId: string | null
  internalNotes: string | null
  manualDiscountAmount: number
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
  paymentMethod: PaymentMethod
  fulfillmentMethod: FulfillmentMethod
  deliveryAddress: string | null
  shippingFee: number
  shippingZone: ShippingZone | null
  fulfillmentStatus: FulfillmentStatus
  trackingCode: string | null
  trackingUrl: string | null
  carrier: string | null
  approvedAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  completedAt: string | null
  disputeReason: string | null
  disputeNotes: string | null
  disputedAt: string | null
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

export type LookbookAspect = 'tall' | 'wide' | 'square'

export interface LookbookItemContent {
  id: number
  label: string
  imageUrl: string
  aspect: LookbookAspect
  speed: number
}

export interface HeroContent {
  imageUrl: string
  eyebrow: string
  title: string
  tagline: string
}

export interface ArtistContent {
  mainImageUrl: string
  secondaryImageUrl: string
  eyebrow: string
  heading: string
  headingAccent: string
  bio: string
  statementLines: string[]
}

export interface LookbookSectionContent {
  eyebrow: string
  title: string
  items: LookbookItemContent[]
}

export interface ContactContent {
  phone: string
  phoneRaw: string
  address: string
  note: string
}

export interface SocialLinkContent {
  label: string
  url: string
}

export interface SiteContentResponse {
  hero: HeroContent
  artist: ArtistContent
  lookbook: LookbookSectionContent
  contact: ContactContent
  socialLinks: SocialLinkContent[]
}

export type UpdateSiteContentRequest = SiteContentResponse

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
