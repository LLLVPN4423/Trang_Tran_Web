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
  isActive: boolean
}

export interface CreateOrderItemRequest {
  itemId: string
  itemType: OrderItemType
  quantity?: number
  hairSize?: HairSize | null
}

export interface CreateOrderRequest {
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  notes?: string | null
  items: CreateOrderItemRequest[]
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

export interface OrderResponse {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  notes: string | null
  items: OrderItemResponse[]
  totalAmount: number
  status: OrderStatus
  paymentCode: string
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
  isActive: boolean
}

export interface CreateProductRequest {
  name: string
  description?: string | null
  brand: string
  price: number
  stock: number
  imageUrl?: string | null
  isActive?: boolean
}

export interface UpdateProductRequest {
  name: string
  description?: string | null
  brand: string
  price: number
  stock: number
  imageUrl?: string | null
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
