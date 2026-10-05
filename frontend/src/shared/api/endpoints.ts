import { apiClient } from './client'
import { normalizeFulfillmentMethod, normalizePaymentMethod } from '@/shared/lib/orderLabels'
import { normalizeFulfillmentStatus } from '@/shared/lib/orderFulfillment'
import { DEFAULT_SITE_CONTENT } from '@/shared/lib/siteContentDefaults'
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
  UpdateCustomerRequest,
  UpdateProductRequest,
  UpdatePromotionRequest,
  UpdateServiceRequest,
  ValidatePromotionResponse,
  CreateAppointmentRequest,
  AppointmentResponse,
  AppointmentStatus,
  SubmitDisputeRequest,
  UpdateShipmentRequest,
  ShippingZoneOption,
  SiteContentResponse,
  UpdateSiteContentRequest,
  LookbookAspect,
} from './types'

export async function fetchServices(): Promise<ServiceResponse[]> {
  const { data } = await apiClient.get<ServiceResponse[]>('/api/services')
  return data.filter((s) => s.isActive).map(normalizeService)
}

export async function fetchService(id: string): Promise<ServiceResponse> {
  try {
    const { data } = await apiClient.get<ServiceResponse>(`/api/services/${encodeURIComponent(id)}`)
    return normalizeService(data)
  } catch (err) {
    const { data } = await apiClient.get<ServiceResponse[]>('/api/services')
    const found = data.find((s) => s.id === id)
    if (found) return normalizeService(found)
    throw err
  }
}

export async function fetchAllServices(): Promise<ServiceResponse[]> {
  const { data } = await apiClient.get<ServiceResponse[]>('/api/services')
  return data.map(normalizeService)
}

export async function fetchProducts(): Promise<ProductResponse[]> {
  const { data } = await apiClient.get<ProductResponse[]>('/api/products')
  return data.filter((p) => p.isActive).map(normalizeProduct)
}

export async function fetchProduct(id: string): Promise<ProductResponse> {
  try {
    const { data } = await apiClient.get<ProductResponse>(`/api/products/${encodeURIComponent(id)}`)
    return normalizeProduct(data)
  } catch (err) {
    const { data } = await apiClient.get<ProductResponse[]>('/api/products')
    const found = data.find((p) => p.id === id)
    if (found) return normalizeProduct(found)
    throw err
  }
}

function normalizeService(service: ServiceResponse): ServiceResponse {
  return {
    ...service,
    galleryUrls: service.galleryUrls ?? [],
  }
}

function normalizeProduct(product: ProductResponse): ProductResponse {
  return {
    ...product,
    galleryUrls: product.galleryUrls ?? [],
  }
}

export async function fetchAllProducts(): Promise<ProductResponse[]> {
  const { data } = await apiClient.get<ProductResponse[]>('/api/products')
  return data.map(normalizeProduct)
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

function normalizeOrder(order: OrderResponse): OrderResponse {
  return {
    ...order,
    paymentMethod: normalizePaymentMethod(order.paymentMethod),
    fulfillmentMethod: normalizeFulfillmentMethod(order.fulfillmentMethod),
    deliveryAddress: order.deliveryAddress ?? null,
    shippingFee: order.shippingFee ?? 0,
    shippingZone: order.shippingZone ?? null,
    fulfillmentStatus: normalizeFulfillmentStatus(order.fulfillmentStatus),
    trackingCode: order.trackingCode ?? null,
    trackingUrl: order.trackingUrl ?? null,
    carrier: order.carrier ?? null,
    approvedAt: order.approvedAt ?? null,
    shippedAt: order.shippedAt ?? null,
    deliveredAt: order.deliveredAt ?? null,
    completedAt: order.completedAt ?? null,
    disputeReason: order.disputeReason ?? null,
    disputeNotes: order.disputeNotes ?? null,
    disputedAt: order.disputedAt ?? null,
  }
}

export async function createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
  const { data } = await apiClient.post<OrderResponse>('/api/orders', request)
  return normalizeOrder(data)
}

export async function fetchOrder(
  id: string,
  accessToken?: string,
  options?: { live?: boolean },
): Promise<OrderResponse> {
  const { data } = await apiClient.get<OrderResponse>(`/api/orders/${encodeURIComponent(id)}`, {
    params: {
      ...(accessToken ? { token: accessToken } : {}),
      ...(options?.live ? { _t: Date.now() } : {}),
    },
    headers: options?.live ? { 'Cache-Control': 'no-cache' } : undefined,
  })
  return normalizeOrder(data)
}

export async function fetchOrders(
  params?: { status?: OrderStatus; phone?: string; live?: boolean },
): Promise<OrderResponse[]> {
  const { live, ...query } = params ?? {}
  const { data } = await apiClient.get<OrderResponse[]>('/api/orders', {
    params: {
      ...query,
      ...(live ? { _t: Date.now() } : {}),
    },
    headers: live ? { 'Cache-Control': 'no-cache' } : undefined,
  })
  return data.map(normalizeOrder)
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderResponse> {
  const { data } = await apiClient.patch<OrderResponse>(`/api/orders/${id}/status`, { status })
  return normalizeOrder(data)
}

export async function approveOrderFulfillment(id: string): Promise<OrderResponse> {
  const { data } = await apiClient.post<OrderResponse>(`/api/orders/${id}/approve`)
  return normalizeOrder(data)
}

export async function updateOrderShipment(id: string, request: UpdateShipmentRequest): Promise<OrderResponse> {
  const { data } = await apiClient.patch<OrderResponse>(`/api/orders/${id}/shipment`, request)
  return normalizeOrder(data)
}

export async function markOrderDelivered(id: string): Promise<OrderResponse> {
  const { data } = await apiClient.post<OrderResponse>(`/api/orders/${id}/delivered`)
  return normalizeOrder(data)
}

export async function confirmOrderReceived(id: string, accessToken?: string): Promise<OrderResponse> {
  const { data } = await apiClient.post<OrderResponse>(`/api/orders/${encodeURIComponent(id)}/confirm-received`, null, {
    params: accessToken ? { token: accessToken } : undefined,
  })
  return normalizeOrder(data)
}

export async function submitOrderDispute(
  id: string,
  request: SubmitDisputeRequest,
  accessToken?: string,
): Promise<OrderResponse> {
  const { data } = await apiClient.post<OrderResponse>(`/api/orders/${encodeURIComponent(id)}/dispute`, request, {
    params: accessToken ? { token: accessToken } : undefined,
  })
  return normalizeOrder(data)
}

export async function fetchShippingZones(): Promise<ShippingZoneOption[]> {
  const { data } = await apiClient.get<ShippingZoneOption[]>('/api/shipping/zones')
  return data
}

export async function fetchSiteContent(): Promise<SiteContentResponse> {
  const { data } = await apiClient.get<SiteContentResponse>('/api/site-content')
  return normalizeSiteContent(data)
}

export async function updateSiteContent(request: UpdateSiteContentRequest): Promise<SiteContentResponse> {
  const { data } = await apiClient.put<SiteContentResponse>('/api/site-content', request)
  return normalizeSiteContent(data)
}

function normalizeSiteContent(content: SiteContentResponse): SiteContentResponse {
  const defaults = DEFAULT_SITE_CONTENT
  const contact = content.contact?.phone?.trim()
    ? {
        phone: content.contact.phone.trim(),
        phoneRaw:
          content.contact.phoneRaw?.trim() ||
          content.contact.phone.replace(/\D/g, ''),
        address: content.contact.address?.trim() ?? '',
        note: content.contact.note?.trim() ?? '',
      }
    : defaults.contact

  const socialLinks =
    content.socialLinks?.filter((l) => l.label?.trim() && l.url?.trim()).map((l) => ({
      label: l.label.trim(),
      url: l.url.trim(),
    })) ?? []

  return {
    hero: { ...defaults.hero, ...content.hero },
    artist: {
      ...defaults.artist,
      ...content.artist,
      statementLines: content.artist.statementLines ?? defaults.artist.statementLines,
    },
    lookbook: {
      ...defaults.lookbook,
      ...content.lookbook,
      items: (content.lookbook.items ?? defaults.lookbook.items).map((item) => ({
        ...item,
        aspect: (['tall', 'wide', 'square'].includes(item.aspect) ? item.aspect : 'square') as LookbookAspect,
      })),
    },
    contact,
    socialLinks: socialLinks.length > 0 ? socialLinks : defaults.socialLinks,
  }
}

export async function syncCustomer(request: SyncCustomerRequest): Promise<CustomerResponse> {
  const { data } = await apiClient.post<CustomerResponse>('/api/customers/sync', request)
  return data
}

export async function fetchCustomerMe(): Promise<CustomerResponse> {
  const { data } = await apiClient.get<CustomerResponse>('/api/customers/me')
  return data
}

export async function updateCustomerMe(request: UpdateCustomerRequest): Promise<CustomerResponse> {
  const { data } = await apiClient.put<CustomerResponse>('/api/customers/me', request)
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

export async function fetchAllPromotions(): Promise<PromotionResponse[]> {
  const { data } = await apiClient.get<PromotionResponse[]>('/api/promotions/all')
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

export async function fetchMyAppointments(): Promise<AppointmentResponse[]> {
  const { data } = await apiClient.get<AppointmentResponse[]>('/api/appointments/me')
  return data
}

export async function fetchAppointments(
  status?: AppointmentStatus,
  options?: { live?: boolean },
): Promise<AppointmentResponse[]> {
  const { data } = await apiClient.get<AppointmentResponse[]>('/api/appointments', {
    params: {
      ...(status ? { status } : {}),
      ...(options?.live ? { _t: Date.now() } : {}),
    },
    headers: options?.live ? { 'Cache-Control': 'no-cache' } : undefined,
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
