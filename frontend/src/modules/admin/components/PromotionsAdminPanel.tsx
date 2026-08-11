import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  createPromotion,
  deletePromotion,
  fetchAllPromotions,
  updatePromotion,
} from '@/shared/api/endpoints'
import type {
  CreatePromotionRequest,
  PromotionResponse,
  PromotionType,
  UpdatePromotionRequest,
} from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import {
  AdminButton,
  AdminField,
  AdminFormActions,
  AdminModal,
  AdminPanelHeader,
  adminInputClass,
} from './AdminFormUi'

type FormMode = { type: 'create' } | { type: 'edit'; promotion: PromotionResponse }

export function PromotionsAdminPanel() {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<FormMode | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPromotions(await fetchAllPromotions())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải khuyến mãi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleActive = async (promo: PromotionResponse) => {
    try {
      await updatePromotion(promo.id, toUpdateRequest(promo, !promo.isActive))
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật')
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Xóa mã ${code}?`)) return
    try {
      await deletePromotion(id)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    const expiresRaw = String(form.get('expiresAt')).trim()
    const maxUsesRaw = String(form.get('maxUses')).trim()

    const payload = {
      code: String(form.get('code')).trim().toUpperCase(),
      name: String(form.get('name')).trim(),
      description: String(form.get('description')).trim() || null,
      type: String(form.get('type')) as PromotionType,
      value: Number(form.get('value')),
      minOrderAmount: Number(form.get('minOrderAmount')),
      maxUses: maxUsesRaw ? Number(maxUsesRaw) : null,
      expiresAt: expiresRaw ? new Date(expiresRaw).toISOString() : null,
      isActive: form.get('isActive') === 'on',
    }

    try {
      if (formMode?.type === 'edit') {
        await updatePromotion(formMode.promotion.id, payload as UpdatePromotionRequest)
      } else {
        await createPromotion(payload as CreatePromotionRequest)
      }
      setFormMode(null)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể lưu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Đang tải khuyến mãi..." />
  if (error) return <ApiErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-4">
      <AdminPanelHeader
        title="Khuyến mãi"
        count={promotions.length}
        action={
          <AdminButton variant="primary" onClick={() => setFormMode({ type: 'create' })}>
            + Thêm mã
          </AdminButton>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
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
                <td className="py-3 pr-4">{p.type === 'Percentage' ? `${p.value}%` : formatVnd(p.value)}</td>
                <td className="py-3 pr-4">{formatVnd(p.minOrderAmount)}</td>
                <td className="py-3 pr-4">{p.usedCount}{p.maxUses != null ? ` / ${p.maxUses}` : ''}</td>
                <td className="py-3 pr-4">{p.isActive ? 'Active' : 'Off'}</td>
                <td className="py-3 space-x-2">
                  <button type="button" onClick={() => setFormMode({ type: 'edit', promotion: p })} className="text-xs hover:text-gold">
                    Sửa
                  </button>
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

      {formMode && (
        <AdminModal
          title={formMode.type === 'create' ? 'Thêm khuyến mãi' : 'Sửa khuyến mãi'}
          onClose={() => setFormMode(null)}
          wide
        >
          <PromotionForm
            promotion={formMode.type === 'edit' ? formMode.promotion : null}
            onSubmit={handleSubmit}
            onCancel={() => setFormMode(null)}
            saving={saving}
          />
        </AdminModal>
      )}
    </div>
  )
}

function PromotionForm({
  promotion,
  onSubmit,
  onCancel,
  saving,
}: {
  promotion: PromotionResponse | null
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  saving: boolean
}) {
  const expiresValue = promotion?.expiresAt
    ? new Date(promotion.expiresAt).toISOString().slice(0, 16)
    : ''

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Mã *">
          <input name="code" required defaultValue={promotion?.code ?? ''} className={adminInputClass} />
        </AdminField>
        <AdminField label="Tên *">
          <input name="name" required defaultValue={promotion?.name ?? ''} className={adminInputClass} />
        </AdminField>
      </div>
      <AdminField label="Mô tả">
        <input name="description" defaultValue={promotion?.description ?? ''} className={adminInputClass} />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Loại *">
          <select name="type" defaultValue={promotion?.type ?? 'Percentage'} className={adminInputClass}>
            <option value="Percentage">Phần trăm (%)</option>
            <option value="FixedAmount">Số tiền cố định (VND)</option>
          </select>
        </AdminField>
        <AdminField label="Giá trị *">
          <input name="value" type="number" min={0} required defaultValue={promotion?.value ?? 10} className={adminInputClass} />
        </AdminField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Đơn tối thiểu (VND) *">
          <input name="minOrderAmount" type="number" min={0} required defaultValue={promotion?.minOrderAmount ?? 300000} className={adminInputClass} />
        </AdminField>
        <AdminField label="Giới hạn lượt dùng">
          <input name="maxUses" type="number" min={1} defaultValue={promotion?.maxUses ?? ''} placeholder="Không giới hạn" className={adminInputClass} />
        </AdminField>
      </div>
      <AdminField label="Hết hạn">
        <input name="expiresAt" type="datetime-local" defaultValue={expiresValue} className={adminInputClass} />
      </AdminField>
      <label className="flex items-center gap-2 text-sm text-zinc-400">
        <input type="checkbox" name="isActive" defaultChecked={promotion?.isActive ?? true} />
        Kích hoạt mã
      </label>
      <AdminFormActions onCancel={onCancel} submitLabel={promotion ? 'Cập nhật' : 'Tạo mới'} loading={saving} />
    </form>
  )
}

function toUpdateRequest(promo: PromotionResponse, isActive: boolean): UpdatePromotionRequest {
  return {
    code: promo.code,
    name: promo.name,
    description: promo.description,
    type: promo.type,
    value: promo.value,
    minOrderAmount: promo.minOrderAmount,
    maxUses: promo.maxUses,
    expiresAt: promo.expiresAt,
    isActive,
  }
}
