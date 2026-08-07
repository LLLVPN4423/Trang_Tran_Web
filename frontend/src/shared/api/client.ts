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
    const message = error.response.data?.message ?? error.message
    return Promise.reject(new Error(message))
  },
)

export function isApiConfigured(): boolean {
  return import.meta.env.DEV || Boolean(import.meta.env.VITE_API_URL)
}
