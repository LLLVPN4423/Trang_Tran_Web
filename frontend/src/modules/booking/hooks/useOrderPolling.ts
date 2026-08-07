import { useEffect, useRef, useState } from 'react'
import { fetchOrder } from '@/shared/api/endpoints'
import type { OrderResponse } from '@/shared/api/types'

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 60

export function useOrderPolling(orderId: string | null, enabled: boolean) {
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollCount = useRef(0)

  useEffect(() => {
    if (!orderId || !enabled) return

    pollCount.current = 0
    setError(null)

    const poll = async () => {
      try {
        const result = await fetchOrder(orderId)
        setOrder(result)
        if (result.status === 'Paid') return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi kiểm tra đơn hàng')
      }
      pollCount.current += 1
      return pollCount.current >= MAX_POLLS
    }

    const interval = setInterval(async () => {
      const done = await poll()
      if (done) clearInterval(interval)
    }, POLL_INTERVAL_MS)

    poll()

    return () => clearInterval(interval)
  }, [orderId, enabled])

  return { order, error, isPaid: order?.status === 'Paid' }
}
