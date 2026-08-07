import { apiClient } from './client'
import type {
  CreateOrderRequest,
  CreateProductRequest,
  CreatePromotionRequest,
  CreateServiceRequest,
  CustomerResponse,
  LoyaltySummaryResponse,
  LoyaltyTransactionResponse,
  OrderResponse,
  OrderStatus,
  ProductResponse,
  PromotionResponse,
  ServiceResponse,
  SyncCustomerRequest,
  UpdateProductRequest,
  UpdatePromotionRequest,
  UpdateServiceRequest,
  ValidatePromotionResponse,
  CreateAppointmentRequest,
  AppointmentResponse,
  AppointmentStatus,
} from './types'

export async function fetchServices(): Promise<ServiceResponse[]> {
  const { data } = await apiClient.get<ServiceResponse[]>('/api/services')
  return data.filter((s) => s.isActive)
}

export async function fetchAllServices(): Promise<ServiceResponse[]> {
  const { data } = await apiClient.get<ServiceResponse[]>('/api/services')
  return data
}

export async function fetchProducts(): Promise<ProductResponse[]> {
  const { data } = await apiClient.get<ProductResponse[]>('/api/products')
  return data.filter((p) => p.isActive)
}

export async function fetchAllProducts(): Promise<ProductResponse[]> {
  const { data } = await apiClient.get<ProductResponse[]>('/api/products')
  return data
}

export async function createService(request: CreateServiceRequest): Promise<ServiceResponse> {
  const { data } = await apiClient.post<ServiceResponse>('/api/services', request)
  return data
}

export async function updateService(id: string, request: UpdateServiceRequest): Promise<ServiceResponse> {
  const { data } = await apiClient.put<ServiceResponse>(`/api/services/${id}`, request)
  return data
}

export async function deleteService(id: string): Promise<void> {
  await apiClient.delete(`/api/services/${id}`)
}

export async function createProduct(request: CreateProductRequest): Promise<ProductResponse> {
  const { data } = await apiClient.post<ProductResponse>('/api/products', request)
  return data
}

export async function updateProduct(id: string, request: UpdateProductRequest): Promise<ProductResponse> {
  const { data } = await apiClient.put<ProductResponse>(`/api/products/${id}`, request)
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/products/${id}`)
}

export async function createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
  const { data } = await apiClient.post<OrderResponse>('/api/orders', request)
  return data
}

export async function fetchOrder(id: string): Promise<OrderResponse> {
  const { data } = await apiClient.get<OrderResponse>(`/api/orders/${id}`)
  return data
}

export async function fetchOrders(params?: { status?: OrderStatus; phone?: string }): Promise<OrderResponse[]> {
  const { data } = await apiClient.get<OrderResponse[]>('/api/orders', { params })
  return data
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderResponse> {
  const { data } = await apiClient.patch<OrderResponse>(`/api/orders/${id}/status`, { status })
  return data
}

export async function syncCustomer(request: SyncCustomerRequest): Promise<CustomerResponse> {
  const { data } = await apiClient.post<CustomerResponse>('/api/customers/sync', request)
  return data
}

export async function fetchCustomerMe(): Promise<CustomerResponse> {
  const { data } = await apiClient.get<CustomerResponse>('/api/customers/me')
  return data
}

export async function fetchAllCustomers(): Promise<CustomerResponse[]> {
  const { data } = await apiClient.get<CustomerResponse[]>('/api/customers')
  return data
}

export async function fetchPromotions(): Promise<PromotionResponse[]> {
  const { data } = await apiClient.get<PromotionResponse[]>('/api/promotions')
  return data
}

export async function createPromotion(request: CreatePromotionRequest): Promise<PromotionResponse> {
  const { data } = await apiClient.post<PromotionResponse>('/api/promotions', request)
  return data
}

export async function updatePromotion(id: string, request: UpdatePromotionRequest): Promise<PromotionResponse> {
  const { data } = await apiClient.put<PromotionResponse>(`/api/promotions/${id}`, request)
  return data
}

export async function deletePromotion(id: string): Promise<void> {
  await apiClient.delete(`/api/promotions/${id}`)
}

export async function validatePromotion(code: string, subtotalAmount: number): Promise<ValidatePromotionResponse> {
  const { data } = await apiClient.post<ValidatePromotionResponse>('/api/promotions/validate', {
    code,
    subtotalAmount,
  })
  return data
}

export async function fetchLoyaltySummary(): Promise<LoyaltySummaryResponse> {
  const { data } = await apiClient.get<LoyaltySummaryResponse>('/api/loyalty/me')
  return data
}

export async function fetchLoyaltyHistory(): Promise<LoyaltyTransactionResponse[]> {
  const { data } = await apiClient.get<LoyaltyTransactionResponse[]>('/api/loyalty/me/history')
  return data
}

export async function fetchLoyaltyRules(): Promise<LoyaltySummaryResponse> {
  const { data } = await apiClient.get<LoyaltySummaryResponse>('/api/loyalty/rules')
  return data
}

export async function adjustLoyalty(customerId: string, points: number, description: string): Promise<void> {
  await apiClient.post('/api/loyalty/adjust', { customerId, points, description })
}

export async function createAppointment(request: CreateAppointmentRequest): Promise<AppointmentResponse> {
  const { data } = await apiClient.post<AppointmentResponse>('/api/appointments', request)
  return data
}

export async function fetchAppointments(status?: AppointmentStatus): Promise<AppointmentResponse[]> {
  const { data } = await apiClient.get<AppointmentResponse[]>('/api/appointments', {
    params: status ? { status } : undefined,
  })
  return data
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<AppointmentResponse> {
  const { data } = await apiClient.patch<AppointmentResponse>(`/api/appointments/${id}/status`, { status })
  return data
}

export async function seedDevData(force = false): Promise<void> {
  await apiClient.post(`/api/seed/dev?force=${force}`)
}

export async function seedAdminData(force = false): Promise<{
  servicesSeeded: number
  productsSeeded: number
  promotionsSeeded: number
  skipped: boolean
  message: string
}> {
  const { data } = await apiClient.post(`/api/seed?force=${force}`)
  return data
}

export async function verifyAdminAccess(): Promise<boolean> {
  try {
    await apiClient.get('/api/health/admin')
    return true
  } catch {
    return false
  }
}
