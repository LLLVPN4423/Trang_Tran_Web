import { useEffect, useRef, useState } from 'react'
import { fetchOrder } from '@/shared/api/endpoints'
import type { OrderResponse } from '@/shared/api/types'

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 120

export function useOrderPolling(orderId: string | null, accessToken: string | null, enabled: boolean) {
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pollingExhausted, setPollingExhausted] = useState(false)
  const pollCount = useRef(0)

  useEffect(() => {
    if (!orderId || !accessToken || !enabled) return

    pollCount.current = 0
    setError(null)
    setPollingExhausted(false)

    const poll = async () => {
      try {
        const result = await fetchOrder(orderId, accessToken)
        setOrder(result)
        if (result.status === 'Paid') return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi kiểm tra đơn hàng')
      }
      pollCount.current += 1
      if (pollCount.current >= MAX_POLLS) {
        setPollingExhausted(true)
        return true
      }
      return false
    }

    const interval = setInterval(async () => {
      const done = await poll()
      if (done) clearInterval(interval)
    }, POLL_INTERVAL_MS)

    poll()

    return () => clearInterval(interval)
  }, [orderId, accessToken, enabled])

  return { order, error, isPaid: order?.status === 'Paid', pollingExhausted }
}
