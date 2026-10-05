import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getApiBaseUrl, getProductionApiUrl } from '@/shared/config/env'
import type { ApiErrorResponse } from './types'

const TIMEOUT_MS = 30_000

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
})

let tokenProvider: (() => Promise<string | null>) | null = null

export function setAuthTokenProvider(provider: () => Promise<string | null>) {
  tokenProvider = provider
}

function isSpaHtmlPayload(data: unknown): boolean {
  return typeof data === 'string' && /^\s*<!doctype html/i.test(data)
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  config.baseURL = getApiBaseUrl()
  if (tokenProvider) {
    try {
      const token = await tokenProvider()
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      // Auth unavailable — continue without token
    }
  }
  return config
})

apiClient.interceptors.response.use(
  async (response) => {
    const config = response.config as InternalAxiosRequestConfig & { _directApiFallback?: boolean }
    if (
      import.meta.env.PROD &&
      config &&
      !config._directApiFallback &&
      isSpaHtmlPayload(response.data) &&
      getApiBaseUrl() !== getProductionApiUrl()
    ) {
      config._directApiFallback = true
      config.baseURL = getProductionApiUrl()
      return apiClient.request(config)
    }
    return response
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const config = error.config as (InternalAxiosRequestConfig & {
      _coldStartRetry?: boolean
      _networkRetry?: boolean
      _directApiFallback?: boolean
    }) | undefined

    if (
      config &&
      !config._directApiFallback &&
      error.response &&
      isSpaHtmlPayload(error.response.data) &&
      getApiBaseUrl() !== getProductionApiUrl()
    ) {
      config._directApiFallback = true
      config.baseURL = getProductionApiUrl()
      return apiClient.request(config)
    }

    const isGet = (config?.method ?? 'get').toLowerCase() === 'get'

    // Cloud Run scale-to-zero: first request may timeout — retry GET once.
    if (config && !config._coldStartRetry && error.code === 'ECONNABORTED' && isGet) {
      config._coldStartRetry = true
      await new Promise((resolve) => setTimeout(resolve, 2500))
      return apiClient.request(config)
    }

    // Mạng/CORS tạm thời — thử lại GET một lần.
    if (config && !config._networkRetry && !error.response && isGet) {
      config._networkRetry = true
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return apiClient.request(config)
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Kết nối quá thời gian chờ. API đang khởi động — thử lại sau vài giây.'))
    }
    if (!error.response) {
      return Promise.reject(
        new Error(
          'Không thể kết nối máy chủ. Kiểm tra mạng, thử Ctrl+F5, hoặc đợi vài giây (API Cloud Run đang bật).',
        ),
      )
    }
    if (error.response.status === 401) {
      return Promise.reject(
        new Error(
          'Phiên đăng nhập không hợp lệ (401). Kiểm tra FIREBASE_PROJECT_ID khớp frontend/backend, rồi đăng xuất và đăng nhập lại.',
        ),
      )
    }
    if (error.response.status === 403) {
      return Promise.reject(
        new Error(
          'Không có quyền Admin (403). Chạy node scripts/set-admin.js YOUR_UID rồi đăng xuất/đăng nhập lại.',
        ),
      )
    }
    if (error.response.status === 404) {
      const detail = error.response.data?.message
      return Promise.reject(
        new Error(detail ?? 'Không tìm thấy dữ liệu (404). Kiểm tra backend đang chạy và VITE_API_URL.'),
      )
    }
    if (error.response.status === 405) {
      return Promise.reject(new Error('Phương thức API không được hỗ trợ (405). Liên hệ dev.'))
    }
    const message = error.response.data?.message ?? error.message
    return Promise.reject(new Error(message))
  },
)

export function isApiConfigured(): boolean {
  return import.meta.env.DEV || Boolean(getApiBaseUrl())
}
