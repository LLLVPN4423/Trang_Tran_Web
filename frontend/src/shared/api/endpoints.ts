import { apiClient } from './client'
import type {
  CreateOrderRequest,
  CreateProductRequest,
  CreateServiceRequest,
  OrderResponse,
  ProductResponse,
  ServiceResponse,
  UpdateProductRequest,
  UpdateServiceRequest,
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

export async function seedDevData(force = false): Promise<void> {
  await apiClient.post(`/api/seed/dev?force=${force}`)
}

export async function seedAdminData(force = false): Promise<{ servicesSeeded: number; productsSeeded: number; skipped: boolean; message: string }> {
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
