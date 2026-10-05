import { lazy, type ComponentType } from 'react'

/** Retry once after deploy — stale index.html often causes "Đang bảo trì" on admin chunks. */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      return await importer()
    } catch (error) {
      const key = 'chunk-reload'
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1')
        window.location.reload()
        await new Promise(() => {})
      }
      sessionStorage.removeItem(key)
      throw error
    }
  })
}
