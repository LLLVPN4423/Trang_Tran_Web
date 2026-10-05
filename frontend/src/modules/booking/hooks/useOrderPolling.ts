import { useEffect, useRef, useState } from 'react'
import { fetchOrder } from '@/shared/api/endpoints'
import type { OrderResponse } from '@/shared/api/types'

const POLL_INTERVAL_MS = 3000
const SLOW_POLL_INTERVAL_MS = 15_000

function isTerminalStatus(status: OrderResponse['status'] | undefined): boolean {
  return status === 'Paid' || status === 'Cancelled'
}

export function useOrderPolling(orderId: string | null, accessToken: string | null, enabled: boolean) {
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pollingExhausted, setPollingExhausted] = useState(false)
  const fastPolls = useRef(0)

  useEffect(() => {
    if (!orderId || !accessToken || !enabled) return

    fastPolls.current = 0
    setError(null)
    setPollingExhausted(false)
    setOrder(null)

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const schedule = (delayMs: number) => {
      if (cancelled) return
      timer = setTimeout(() => void tick(), delayMs)
    }

    const tick = async () => {
      if (cancelled) return

      try {
        const result = await fetchOrder(orderId, accessToken, { live: true })
        if (cancelled) return

        setOrder(result)
        setError(null)

        if (isTerminalStatus(result.status)) return

        fastPolls.current += 1
        if (fastPolls.current >= 40) {
          setPollingExhausted(true)
          schedule(SLOW_POLL_INTERVAL_MS)
          return
        }

        schedule(POLL_INTERVAL_MS)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Lỗi kiểm tra đơn hàng')
        schedule(POLL_INTERVAL_MS)
      }
    }

    void tick()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [orderId, accessToken, enabled])

  return {
    order,
    error,
    isPaid: order?.status === 'Paid',
    isCancelled: order?.status === 'Cancelled',
    pollingExhausted,
  }
}
