import { useCallback, useEffect, useState } from 'react'
import {
  createPromotion,
  deletePromotion,
  fetchPromotions,
  updatePromotion,
} from '@/shared/api/endpoints'
import type { CreatePromotionRequest, PromotionResponse } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'

export function PromotionsAdminPanel() {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPromotions(await fetchPromotions())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải khuyến mãi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    const request: CreatePromotionRequest = {
      code: 'NEWCODE',
      name: 'Khuyến mãi mới',
      type: 'Percentage',
      value: 5,
      minOrderAmount: 300_000,
      isActive: true,
    }
    await createPromotion(request)
    load()
  }

  const toggleActive = async (promo: PromotionResponse) => {
    await updatePromotion(promo.id, {
      code: promo.code,
      name: promo.name,
      description: promo.description,
      type: promo.type,
      value: promo.value,
      minOrderAmount: promo.minOrderAmount,
      maxUses: promo.maxUses,
      expiresAt: promo.expiresAt,
      isActive: !promo.isActive,
    })
    load()
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Xóa mã ${code}?`)) return
    await deletePromotion(id)
    load()
  }

  if (loading) return <LoadingState label="Đang tải khuyến mãi..." />
  if (error) return <ApiErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-zinc-200">Khuyến mãi ({promotions.length})</h2>
        <button type="button" onClick={handleCreate} className="text-xs uppercase tracking-widest text-gold">
          + Tạo mẫu
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500">
              <th className="py-3 pr-4">Mã</th>
              <th className="py-3 pr-4">Tên</th>
              <th className="py-3 pr-4">Giá trị</th>
              <th className="py-3 pr-4">Đơn tối thiểu</th>
              <th className="py-3 pr-4">Đã dùng</th>
              <th className="py-3 pr-4">Trạng thái</th>
              <th className="py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((p) => (
              <tr key={p.id} className="border-b border-zinc-900 text-zinc-400">
                <td className="py-3 pr-4 font-mono text-gold-muted">{p.code}</td>
                <td className="py-3 pr-4 text-zinc-200">{p.name}</td>
                <td className="py-3 pr-4">
                  {p.type === 'Percentage' ? `${p.value}%` : formatVnd(p.value)}
                </td>
                <td className="py-3 pr-4">{formatVnd(p.minOrderAmount)}</td>
                <td className="py-3 pr-4">{p.usedCount}{p.maxUses != null ? ` / ${p.maxUses}` : ''}</td>
                <td className="py-3 pr-4">{p.isActive ? 'Active' : 'Off'}</td>
                <td className="py-3 space-x-3">
                  <button type="button" onClick={() => toggleActive(p)} className="text-xs hover:text-gold">
                    {p.isActive ? 'Tắt' : 'Bật'}
                  </button>
                  <button type="button" onClick={() => handleDelete(p.id, p.code)} className="text-xs text-red-400/70 hover:text-red-400">
                    Xóa
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
