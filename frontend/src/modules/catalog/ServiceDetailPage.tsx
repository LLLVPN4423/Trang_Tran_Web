import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchService } from '@/shared/api/endpoints'
import type { HairSize, ServiceResponse } from '@/shared/api/types'
import {
  CATEGORY_LABELS,
  formatVnd,
  HAIR_SIZES,
  resolveServicePrice,
  STYLIST_LABELS,
} from '@/shared/api/types'
import { useCartStore } from '@/shared/store/cartStore'
import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'
import { PageLayout } from '@/shared/components/PageLayout'
import { LoadingState } from '@/shared/components/LoadingState'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { ProductGallery } from './components/ProductGallery'
import { ProductVideo } from './components/ProductVideo'
import { getCatalogGallery } from '@/shared/lib/productMedia'

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
  const [added, setAdded] = useState(false)
  const [hairSize, setHairSize] = useState<HairSize>('M')
  const addService = useCartStore((s) => s.addService)
  const itemCount = useCartStore((s) => s.itemCount())

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetchService(id)
      .then(setService)
      .catch((err) => setError(err instanceof Error ? err.message : 'Không tải được dịch vụ'))
      .finally(() => setLoading(false))
  }, [id])

  const needsSize = service?.basePrice == null && service?.priceBySize != null
  const price = service
    ? needsSize
      ? resolveServicePrice(service, hairSize)
      : (service.basePrice ?? 0)
    : 0
  const gallery = service ? getCatalogGallery(service) : []

  const handleAdd = () => {
    if (!service) return
    addService(service, needsSize ? hairSize : 'M')
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <PageLayout>
      <div className="section-inner px-5 py-12 sm:px-8 sm:py-16">
        <Link to="/catalog" className="text-xs uppercase tracking-widest text-gold-muted hover:text-gold">
          ← Quay lại catalog
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
              {service.stylistLevel && (
                <p className="mt-2 text-sm text-zinc-500">{STYLIST_LABELS[service.stylistLevel]}</p>
              )}

              {needsSize ? (
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-widest text-zinc-500">Chọn độ dài tóc</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {HAIR_SIZES.map((size) => (
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
                <p className="mt-4 font-serif text-3xl text-gold">{formatVnd(service.basePrice ?? 0)}</p>
              )}

              {service.durationMinutes && (
                <p className="mt-2 text-sm text-zinc-500">Thời gian ước tính: ~{service.durationMinutes} phút</p>
              )}

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

              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={handleAdd} className="btn-gold">
                  {added ? 'Đã thêm ✓' : 'Thêm vào giỏ'}
                </button>
                <Link to="/booking" className="btn-editorial px-6 py-3">
                  Đặt lịch tư vấn
                </Link>
                {itemCount > 0 && (
                  <Link to="/booking" className="btn-editorial px-6 py-3">
                    Thanh toán ({itemCount})
                  </Link>
                )}
              </div>
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
