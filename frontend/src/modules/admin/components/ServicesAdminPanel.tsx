import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  createService,
  deleteService,
  fetchAllServices,
  updateService,
} from '@/shared/api/endpoints'
import type {
  CreateServiceRequest,
  ServiceCategory,
  ServiceResponse,
  StylistLevel,
  UpdateServiceRequest,
} from '@/shared/api/types'
import {
  CATEGORY_LABELS,
  formatVnd,
  HAIR_SIZES,
  STYLIST_LABELS,
} from '@/shared/api/types'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import {
  galleryToTextarea,
  getCatalogGallery,
  GOOGLE_DRIVE_SHARE_HINT,
  MAX_PRODUCT_GALLERY,
  parseGalleryLines,
  resolveProductImageUrl,
} from '@/shared/lib/productMedia'
import {
  AdminButton,
  AdminField,
  AdminFormActions,
  AdminModal,
  AdminPanelHeader,
  adminInputClass,
} from './AdminFormUi'

type FormMode = { type: 'create' } | { type: 'edit'; service: ServiceResponse }

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ServiceCategory, string][]
const STYLISTS = Object.entries(STYLIST_LABELS) as [StylistLevel, string][]

export function ServicesAdminPanel() {
  const [services, setServices] = useState<ServiceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formMode, setFormMode] = useState<FormMode | null>(null)
  const [saving, setSaving] = useState(false)

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
    try {
      await updateService(service.id, toUpdateRequest(service, !service.isActive))
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa dịch vụ "${name}"?`)) return
    try {
      await deleteService(id)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    const pricingMode = String(form.get('pricingMode'))
    const basePriceRaw = String(form.get('basePrice')).trim()
    const priceBySize =
      pricingMode === 'size'
        ? Object.fromEntries(
            HAIR_SIZES.map((size) => {
              const raw = Number(form.get(`price_${size}`))
              return [size, raw] as const
            }).filter(([, v]) => !Number.isNaN(v) && v > 0),
          )
        : null

    const stylistRaw = String(form.get('stylistLevel'))
    let galleryUrls = parseGalleryLines(String(form.get('galleryUrls') ?? ''))
    const payload = {
      name: String(form.get('name')).trim(),
      description: String(form.get('description')).trim() || null,
      category: String(form.get('category')) as ServiceCategory,
      stylistLevel: stylistRaw ? (stylistRaw as StylistLevel) : null,
      basePrice: pricingMode === 'fixed' && basePriceRaw ? Number(basePriceRaw) : null,
      priceBySize: pricingMode === 'size' && Object.keys(priceBySize ?? {}).length > 0 ? priceBySize : null,
      durationMinutes: Number(form.get('durationMinutes')) || null,
      imageUrl: galleryUrls[0] ?? null,
      galleryUrls,
      videoUrl: String(form.get('videoUrl')).trim() || null,
      isActive: form.get('isActive') === 'on',
    }

    try {
      if (formMode?.type === 'edit') {
        await updateService(formMode.service.id, payload as UpdateServiceRequest)
      } else {
        await createService(payload as CreateServiceRequest)
      }
      setFormMode(null)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể lưu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Đang tải dịch vụ..." />
  if (error) return <ApiErrorState message={error} onRetry={load} />

  return (
    <div className="space-y-4">
      <AdminPanelHeader
        title="Dịch vụ"
        count={services.length}
        action={
          <AdminButton variant="primary" onClick={() => setFormMode({ type: 'create' })}>
            + Thêm dịch vụ
          </AdminButton>
        }
      />

      <p className="text-sm text-zinc-500">
        Ảnh &amp; video trên <strong className="text-zinc-400">Google Drive</strong> — chia sẻ &quot;Bất kỳ ai có
        link&quot; → dán vào form (tối đa {MAX_PRODUCT_GALLERY} ảnh). {GOOGLE_DRIVE_SHARE_HINT}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500">
              <th className="py-3 pr-4">Tên</th>
              <th className="py-3 pr-4">Loại</th>
              <th className="py-3 pr-4">Giá</th>
              <th className="py-3 pr-4">Thời gian</th>
              <th className="py-3 pr-4">Trạng thái</th>
              <th className="py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => {
              const gallery = getCatalogGallery(s)
              const thumb = gallery[0]
              return (
              <tr key={s.id} className="border-b border-zinc-900 text-zinc-400">
                <td className="py-3 pr-4">
                  <div className="flex items-start gap-3">
                    {thumb ? (
                      <img
                        src={resolveProductImageUrl(thumb)}
                        alt=""
                        className="h-14 w-14 shrink-0 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-zinc-900 text-[0.625rem] text-zinc-600">
                        —
                      </div>
                    )}
                    <div>
                      <p className="text-zinc-200">{s.name}</p>
                      {s.description && <p className="mt-0.5 text-xs text-zinc-600 line-clamp-1">{s.description}</p>}
                      {gallery.length > 0 && (
                        <p className="mt-0.5 text-xs text-zinc-600">
                          {gallery.length} ảnh{s.videoUrl ? ' · video' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">{CATEGORY_LABELS[s.category]}</td>
                <td className="py-3 pr-4">{formatServicePrice(s)}</td>
                <td className="py-3 pr-4">{s.durationMinutes ? `${s.durationMinutes} phút` : '—'}</td>
                <td className="py-3 pr-4">
                  <span className={s.isActive ? 'text-emerald-500' : 'text-zinc-600'}>
                    {s.isActive ? 'Active' : 'Off'}
                  </span>
                </td>
                <td className="py-3 space-x-2">
                  <button type="button" onClick={() => setFormMode({ type: 'edit', service: s })} className="text-xs hover:text-gold">
                    Sửa
                  </button>
                  <button type="button" onClick={() => toggleActive(s)} className="text-xs hover:text-gold">
                    {s.isActive ? 'Tắt' : 'Bật'}
                  </button>
                  <button type="button" onClick={() => handleDelete(s.id, s.name)} className="text-xs text-red-400/70 hover:text-red-400">
                    Xóa
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {formMode && (
        <AdminModal
          title={formMode.type === 'create' ? 'Thêm dịch vụ' : 'Sửa dịch vụ'}
          onClose={() => setFormMode(null)}
          wide
        >
          <ServiceForm
            service={formMode.type === 'edit' ? formMode.service : null}
            onSubmit={handleSubmit}
            onCancel={() => setFormMode(null)}
            saving={saving}
          />
        </AdminModal>
      )}
    </div>
  )
}

function ServiceForm({
  service,
  onSubmit,
  onCancel,
  saving,
}: {
  service: ServiceResponse | null
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  saving: boolean
}) {
  const useSizePricing = service ? service.basePrice == null && service.priceBySize != null : false

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AdminField label="Tên dịch vụ *">
        <input name="name" required defaultValue={service?.name} className={adminInputClass} />
      </AdminField>

      <AdminField label="Mô tả">
        <textarea name="description" rows={3} defaultValue={service?.description ?? ''} className={adminInputClass} />
      </AdminField>

      <AdminField label={`Gallery ảnh — Google Drive (tối đa ${MAX_PRODUCT_GALLERY}, mỗi dòng 1 link)`}>
        <textarea
          name="galleryUrls"
          rows={5}
          placeholder={
            'https://drive.google.com/file/d/XXXX/view?usp=sharing\nhttps://drive.google.com/file/d/YYYY/view?usp=sharing'
          }
          defaultValue={service ? galleryToTextarea(getCatalogGallery(service)) : ''}
          className={`${adminInputClass} resize-y font-mono text-xs`}
        />
      </AdminField>

      <AdminField label="Video — Google Drive hoặc YouTube (tùy chọn)">
        <input
          name="videoUrl"
          placeholder="https://drive.google.com/file/d/XXXX/view?usp=sharing"
          defaultValue={service?.videoUrl ?? ''}
          className={adminInputClass}
        />
      </AdminField>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Loại *">
          <select name="category" required defaultValue={service?.category ?? 'Cut'} className={adminInputClass}>
            {CATEGORIES.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Stylist">
          <select name="stylistLevel" defaultValue={service?.stylistLevel ?? ''} className={adminInputClass}>
            <option value="">— Không áp dụng —</option>
            {STYLISTS.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </AdminField>
      </div>

      <AdminField label="Thời gian (phút)">
        <input name="durationMinutes" type="number" min={0} defaultValue={service?.durationMinutes ?? ''} className={adminInputClass} />
      </AdminField>

      <AdminField label="Cách tính giá *">
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <label className="flex items-center gap-2">
            <input type="radio" name="pricingMode" value="fixed" defaultChecked={!useSizePricing} />
            Giá cố định
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="pricingMode" value="size" defaultChecked={useSizePricing} />
            Giá theo size tóc (S/M/L/XL)
          </label>
        </div>
      </AdminField>

      <AdminField label="Giá cố định (VND)">
        <input name="basePrice" type="number" min={0} step={1000} defaultValue={service?.basePrice ?? ''} className={adminInputClass} />
      </AdminField>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {HAIR_SIZES.map((size) => (
          <AdminField key={size} label={`Giá ${size}`}>
            <input
              name={`price_${size}`}
              type="number"
              min={0}
              step={1000}
              defaultValue={service?.priceBySize?.[size] ?? ''}
              className={adminInputClass}
            />
          </AdminField>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-400">
        <input type="checkbox" name="isActive" defaultChecked={service?.isActive ?? true} />
        Hiển thị trên catalog
      </label>

      <AdminFormActions onCancel={onCancel} submitLabel={service ? 'Cập nhật' : 'Tạo mới'} loading={saving} />
    </form>
  )
}

function toUpdateRequest(service: ServiceResponse, isActive: boolean): UpdateServiceRequest {
  const gallery = getCatalogGallery(service)
  return {
    name: service.name,
    description: service.description,
    category: service.category,
    stylistLevel: service.stylistLevel,
    basePrice: service.basePrice,
    priceBySize: service.priceBySize,
    durationMinutes: service.durationMinutes,
    imageUrl: gallery[0] ?? null,
    galleryUrls: gallery,
    videoUrl: service.videoUrl,
    isActive,
  }
}

function formatServicePrice(service: ServiceResponse): string {
  if (service.basePrice != null) return formatVnd(service.basePrice)
  if (service.priceBySize) {
    const values = Object.values(service.priceBySize)
    if (values.length === 0) return '—'
    return `${formatVnd(values[0])} – ${formatVnd(values.at(-1)!)}`
  }
  return '—'
}
