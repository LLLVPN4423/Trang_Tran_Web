import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorResponse } from './types'

const TIMEOUT_MS = 15_000

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
})

let tokenProvider: (() => Promise<string | null>) | null = null

export function setAuthTokenProvider(provider: () => Promise<string | null>) {
  tokenProvider = provider
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
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
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Kết nối quá thời gian chờ. Vui lòng thử lại.'))
    }
    if (!error.response) {
      return Promise.reject(new Error('Không thể kết nối máy chủ. Kiểm tra mạng hoặc thử lại sau.'))
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
  return import.meta.env.DEV || Boolean(import.meta.env.VITE_API_URL)
}
