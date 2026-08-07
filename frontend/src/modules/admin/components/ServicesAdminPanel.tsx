import { useCallback, useEffect, useState } from 'react'
import {
  deleteService,
  fetchAllServices,
  seedAdminData,
  updateService,
} from '@/shared/api/endpoints'
import type { ServiceResponse } from '@/shared/api/types'
import { CATEGORY_LABELS, formatVnd } from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'

export function ServicesAdminPanel() {
  const [services, setServices] = useState<ServiceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setServices(await fetchAllServices())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dịch vụ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleActive = async (service: ServiceResponse) => {
    await updateService(service.id, {
      name: service.name,
      description: service.description,
      category: service.category,
      stylistLevel: service.stylistLevel,
      basePrice: service.basePrice,
      priceBySize: service.priceBySize,
      durationMinutes: service.durationMinutes,
      isActive: !service.isActive,
    })
    load()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa dịch vụ "${name}"?`)) return
    await deleteService(id)
    load()
  }

  if (loading) return <LoadingState label="Đang tải dịch vụ..." />
  if (error) return <ApiErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-zinc-200">Dịch vụ ({services.length})</h2>
        <button
          type="button"
          onClick={async () => {
            await seedAdminData(false)
            load()
          }}
          className="text-xs uppercase tracking-widest text-zinc-500 hover:text-gold"
        >
          Seed dữ liệu
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500">
              <th className="py-3 pr-4">Tên</th>
              <th className="py-3 pr-4">Loại</th>
              <th className="py-3 pr-4">Giá</th>
              <th className="py-3 pr-4">Trạng thái</th>
              <th className="py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-zinc-900 text-zinc-400">
                <td className="py-3 pr-4 text-zinc-200">{s.name}</td>
                <td className="py-3 pr-4">{CATEGORY_LABELS[s.category]}</td>
                <td className="py-3 pr-4">
                  {s.basePrice != null
                    ? formatVnd(s.basePrice)
                    : s.priceBySize
                      ? `${formatVnd(Object.values(s.priceBySize)[0])} – ${formatVnd(Object.values(s.priceBySize).at(-1)!)}`
                      : '—'}
                </td>
                <td className="py-3 pr-4">
                  <span className={s.isActive ? 'text-emerald-500' : 'text-zinc-600'}>
                    {s.isActive ? 'Active' : 'Off'}
                  </span>
                </td>
                <td className="py-3 space-x-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(s)}
                    className="text-xs uppercase tracking-wider hover:text-gold"
                  >
                    {s.isActive ? 'Tắt' : 'Bật'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id, s.name)}
                    className="text-xs uppercase tracking-wider text-red-400/70 hover:text-red-400"
                  >
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
