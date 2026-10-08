import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchService } from '@/shared/api/endpoints'
import type { HairSize, ServiceResponse } from '@/shared/api/types'
import {
  CATEGORY_LABELS,
  formatVnd,
  HAIR_SIZES,
  STYLIST_LABELS,
} from '@/shared/api/types'
import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'
import { PageLayout } from '@/shared/components/PageLayout'
import { LoadingState } from '@/shared/components/LoadingState'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { ProductGallery } from './components/ProductGallery'
import { ProductVideo } from './components/ProductVideo'
import { getCatalogGallery } from '@/shared/lib/productMedia'
import {
  formatServiceCardPrice,
  formatServicePriceRange,
  serviceNeedsHairSize,
} from '@/shared/lib/servicePricing'
import { useServiceCartStore } from '@/shared/store/serviceCartStore'
import { selectServiceCartCount } from '@/shared/store/serviceCartSelectors'
import { useSalonDocumentMeta } from '@/shared/hooks/useSalonDocumentMeta'
import { SALON_PUBLIC } from '@/shared/lib/salonPublicInfo'

function buildServiceMetaDescription(service: ServiceResponse): string {
  const category = CATEGORY_LABELS[service.category]
  const lead = service.description?.trim()
    ? `${service.description.trim().slice(0, 120)}${service.description.length > 120 ? '…' : ''} `
    : ''
  return `${lead}${service.name} — ${category} tại Trang Tran Hair, Sóc Trăng. ${SALON_PUBLIC.address}. Đặt lịch · ${SALON_PUBLIC.phoneDisplay}.`
}

export function ServiceDetailPage() {
  return (
    <ModuleErrorBoundary moduleName="ServiceDetail">
      <ServiceDetailContent />
    </ModuleErrorBoundary>
  )
}

function ServiceDetailContent() {
  const { id } = useParams<{ id: string }>()
  const [service, setService] = useState<ServiceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hairSize, setHairSize] = useState<HairSize>('M')
  const [feedback, setFeedback] = useState<string | null>(null)
  const addService = useServiceCartStore((s) => s.addService)
  const serviceCount = useServiceCartStore(selectServiceCartCount)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetchService(id)
      .then(setService)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không tải được dịch vụ'))
      .finally(() => setLoading(false))
  }, [id])

  const needsSize = service ? serviceNeedsHairSize(service) : false
  const price = service
    ? needsSize
      ? (service.priceBySize?.[hairSize] ?? 0)
      : (service.basePrice ?? 0)
    : 0
  const priceRange = service ? formatServicePriceRange(service) : null
  const gallery = service ? getCatalogGallery(service) : []

  const metaActive = Boolean(service?.isActive && id)
  const categoryLabel = service ? CATEGORY_LABELS[service.category] : ''
  useSalonDocumentMeta(metaActive, {
    title: service
      ? `${service.name} · ${categoryLabel} Sóc Trăng · Trang Tran Hair`
      : 'Trang Tran Hair',
    description: service ? buildServiceMetaDescription(service) : SALON_PUBLIC.name,
    canonicalPath: id ? `/catalog/service/${id}` : '/catalog',
  })

  const handleAdd = () => {
    if (!service) return
    const result = addService(service, hairSize)
    setFeedback(result === 'duplicate' ? 'Đã có trong danh sách' : 'Đã thêm vào danh sách')
    window.setTimeout(() => setFeedback(null), 2500)
  }

  return (
    <PageLayout>
      <div className="section-inner px-5 py-12 sm:px-8 sm:py-16">
        <Link to="/catalog" className="text-xs uppercase tracking-widest text-gold-muted hover:text-gold">
          ← Quay lại bảng giá
        </Link>

        {loading && (
          <div className="mt-10">
            <LoadingState label="Đang tải dịch vụ..." />
          </div>
        )}
        {error && !loading && (
          <div className="mt-10">
            <ApiErrorState message={error} />
          </div>
        )}

        {!loading && !error && service && !service.isActive && (
          <p className="mt-10 text-center text-zinc-500">Dịch vụ không còn được cung cấp.</p>
        )}

        {!loading && !error && service && service.isActive && (
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <ProductGallery images={gallery} alt={service.name} />
            </div>

            <div>
              <p className="section-eyebrow">{CATEGORY_LABELS[service.category]}</p>
              <h1 className="section-title mt-2">{service.name}</h1>
              <p className="mt-2 text-sm text-zinc-500">
                {categoryLabel} tại salon Sóc Trăng (Tuấn Lan, Hùng Vương) — đặt lịch online Trang Tran Hair.
              </p>
              {service.stylistLevel && (
                <p className="mt-2 text-sm text-zinc-500">{STYLIST_LABELS[service.stylistLevel]}</p>
              )}

              {needsSize ? (
                <div className="mt-6">
                  {priceRange && (
                    <p className="text-sm text-zinc-500">
                      Khoảng giá: <span className="text-zinc-300">{priceRange}</span>
                    </p>
                  )}
                  <p className="mt-4 text-xs uppercase tracking-widest text-zinc-500">Chọn size tóc</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {HAIR_SIZES.filter((size) => service.priceBySize?.[size] != null).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setHairSize(size)}
                        className={`min-w-12 px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                          hairSize === size
                            ? 'bg-gold/15 text-gold ring-1 ring-gold/30'
                            : 'border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 font-serif text-3xl text-gold">{formatVnd(price)}</p>
                </div>
              ) : (
                <p className="mt-4 font-serif text-3xl text-gold">{formatServiceCardPrice(service)}</p>
              )}

              {service.durationMinutes && (
                <p className="mt-2 text-sm text-zinc-500">Thời gian ước tính: ~{service.durationMinutes} phút</p>
              )}

              <p className="mt-4 text-sm text-zinc-500">
                Giá chốt tại tiệm sau khi tư vấn. Thanh toán khi làm dịch vụ — không thanh toán online.
              </p>

              {needsSize && service.priceBySize && (
                <div className="mt-6 border-t border-zinc-800/80 pt-6">
                  <h2 className="text-xs uppercase tracking-widest text-zinc-500">Bảng giá theo size</h2>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                    {HAIR_SIZES.filter((size) => service.priceBySize?.[size] != null).map((size) => (
                      <li key={size} className="flex justify-between gap-4 border-b border-zinc-900/80 pb-2">
                        <span>Size {size}</span>
                        <span className="tabular-nums text-zinc-200">{formatVnd(service.priceBySize![size])}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.description && (
                <div className="mt-8 border-t border-zinc-800/80 pt-6">
                  <h2 className="text-xs uppercase tracking-widest text-zinc-500">Mô tả dịch vụ</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                    {service.description}
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button type="button" onClick={handleAdd} className="btn-gold">
                  Thêm vào danh sách
                </button>
                {serviceCount > 0 && (
                  <Link to="/appointment" className="btn-editorial px-6 py-3">
                    Xem & gửi lịch ({serviceCount})
                  </Link>
                )}
                <Link to="/shop" className="text-sm text-zinc-500 hover:text-gold">
                  Mua Moroccanoil
                </Link>
              </div>
              {feedback && <p className="mt-3 text-sm text-gold">{feedback}</p>}
            </div>
          </div>
        )}

        {!loading && !error && service && service.isActive && (
          <ProductVideo videoUrl={service.videoUrl} title={service.name} />
        )}
      </div>
    </PageLayout>
  )
}
