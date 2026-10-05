import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

export const ADMIN_LIVE_POLL_MS = 3000

type LiveRefreshState<T extends { id: string }> = {
  items: T[]
  initialLoading: boolean
  refreshing: boolean
  error: string | null
  lastUpdated: Date | null
  newIds: Set<string>
  refresh: (showSpinner?: boolean) => Promise<void>
  dismissNew: (id: string) => void
  dismissAllNew: () => void
  setItems: Dispatch<SetStateAction<T[]>>
}

export function useAdminLiveRefresh<T extends { id: string }>(
  fetchFn: () => Promise<T[]>,
  resetKey: string,
): LiveRefreshState<T> {
  const [items, setItems] = useState<T[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [newIds, setNewIds] = useState<Set<string>>(() => new Set())

  const knownIdsRef = useRef<Set<string>>(new Set())
  const hasLoadedRef = useRef(false)
  const fetchRef = useRef(fetchFn)
  fetchRef.current = fetchFn

  const refresh = useCallback(async (showSpinner = false) => {
    const isFirst = !hasLoadedRef.current
    if (isFirst || showSpinner) {
      if (isFirst) setInitialLoading(true)
      else setRefreshing(true)
    }

    const loadOnce = async () => fetchRef.current()

    try {
      let data: T[]
      try {
        data = await loadOnce()
      } catch (firstErr) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        data = await loadOnce()
        if (firstErr && !showSpinner && !isFirst) {
          /* recovered on retry */
        }
      }

      if (!hasLoadedRef.current) {
        knownIdsRef.current = new Set(data.map((d) => d.id))
        hasLoadedRef.current = true
      } else {
        const fresh = data.filter((d) => !knownIdsRef.current.has(d.id))
        if (fresh.length > 0) {
          setNewIds((prev) => {
            const next = new Set(prev)
            fresh.forEach((d) => next.add(d.id))
            return next
          })
          fresh.forEach((d) => knownIdsRef.current.add(d.id))
        }
      }

      setItems(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi tải dữ liệu'
      if (!hasLoadedRef.current || showSpinner) {
        setError(message)
      }
    } finally {
      setInitialLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    hasLoadedRef.current = false
    knownIdsRef.current = new Set()
    setNewIds(new Set())
    void refresh(true)
  }, [resetKey, refresh])

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'hidden') return
      void refresh(false)
    }

    const interval = setInterval(tick, ADMIN_LIVE_POLL_MS)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refresh(false)
    }
    window.addEventListener('focus', tick)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', tick)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [refresh, resetKey])

  const dismissNew = useCallback((id: string) => {
    setNewIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const dismissAllNew = useCallback(() => setNewIds(new Set()), [])

  return {
    items,
    initialLoading,
    refreshing,
    error,
    lastUpdated,
    newIds,
    refresh,
    dismissNew,
    dismissAllNew,
    setItems,
  }
}

export function useAdminPoll(
  callback: () => void | Promise<void>,
  resetKey: string,
  intervalMs = ADMIN_LIVE_POLL_MS,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'hidden') return
      void callbackRef.current()
    }

    const interval = setInterval(tick, intervalMs)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void callbackRef.current()
    }
    window.addEventListener('focus', tick)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', tick)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [resetKey, intervalMs])
}
