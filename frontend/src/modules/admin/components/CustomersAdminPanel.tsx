import { useCallback, useEffect, useState } from 'react'
import { adjustLoyalty, fetchAllCustomers } from '@/shared/api/endpoints'
import type { CustomerResponse } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'

export function CustomersAdminPanel() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCustomers(await fetchAllCustomers())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải khách hàng')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAdjust = async (customer: CustomerResponse) => {
    const raw = prompt(`Cộng/trừ điểm cho ${customer.name} (vd: 100 hoặc -50):`)
    if (!raw) return
    const points = Number(raw)
    if (Number.isNaN(points)) return
    try {
      await adjustLoyalty(customer.id, points, `Admin điều chỉnh ${points} điểm`)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể điều chỉnh điểm')
    }
  }

  if (loading) return <LoadingState label="Đang tải khách hàng..." />
  if (error) return <ApiErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl text-zinc-200">Khách hàng ({customers.length})</h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500">
              <th className="py-3 pr-4">Tên</th>
              <th className="py-3 pr-4">SĐT</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Điểm</th>
              <th className="py-3 pr-4">Chi tiêu</th>
              <th className="py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-zinc-900 text-zinc-400">
                <td className="py-3 pr-4 text-zinc-200">{c.name}</td>
                <td className="py-3 pr-4">{c.phone}</td>
                <td className="py-3 pr-4">{c.email ?? '—'}</td>
                <td className="py-3 pr-4 text-gold-muted">{c.loyaltyPoints}</td>
                <td className="py-3 pr-4">{formatVnd(c.totalSpent)}</td>
                <td className="py-3">
                  <button type="button" onClick={() => handleAdjust(c)} className="text-xs hover:text-gold">
                    Điều chỉnh điểm
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
