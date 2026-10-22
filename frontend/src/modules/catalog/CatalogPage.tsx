import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'
import { PageLayout } from '@/shared/components/PageLayout'
import { LoadingState } from '@/shared/components/LoadingState'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { ServiceCard } from './components/ServiceCard'
import { filterServices, useCatalogData } from './hooks/useCatalogData'
import { CATEGORY_LABELS, type ServiceCategory } from '@/shared/api/types'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useServiceCartStore } from '@/shared/store/serviceCartStore'
import { selectServiceCartCount } from '@/shared/store/serviceCartSelectors'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ServiceCategory, string][]

export function CatalogPage() {
  return (
    <ModuleErrorBoundary moduleName="Catalog">
      <CatalogContent />
    </ModuleErrorBoundary>
  )
}

function CatalogContent() {
  const { data, error, loading, reload } = useCatalogData()
  const [category, setCategory] = useState<ServiceCategory | 'all'>('all')
  const serviceCount = useServiceCartStore(selectServiceCartCount)

  const services = data ? filterServices(data.services, category) : []

  return (
    <PageLayout>
      <div className="section-inner px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="section-eyebrow">Catalog</p>
            <h1 className="section-title">Bảng giá dịch vụ</h1>
            <p className="section-body mt-4 max-w-2xl">
              Salon Trang Trần — Tuấn Lan, Hùng Vương. Chọn dịch vụ, thêm vào danh sách rồi gửi lịch một lần.
              Thanh toán tại tiệm.{' '}
              <Link to="/shop" className="text-gold-700 hover:text-gold-300">
                Mua sản phẩm Moroccanoil online
              </Link>
              .
            </p>
          </div>

          {serviceCount > 0 && (
            <Link
              to="/appointment"
              className="btn-gold shrink-0 self-start px-5 py-3 text-xs uppercase tracking-widest"
            >
              Xem & gửi lịch ({serviceCount})
            </Link>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <FilterChip active={category === 'all'} onClick={() => setCategory('all')} label="Tất cả" />
          {CATEGORIES.map(([key, label]) => (
            <FilterChip
              key={key}
              active={category === key}
              onClick={() => setCategory(key)}
              label={label}
            />
          ))}
        </div>

        {loading && <LoadingState label="Đang tải bảng giá..." />}
        {error && !loading && <ApiErrorState message={error} onRetry={reload} />}

        {!loading && !error && (
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
            {services.length === 0 && (
              <p className="col-span-full py-12 text-center text-ink-subtle">Không có dịch vụ.</p>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs transition ${
        active
          ? 'bg-elevated text-ink ring-1 ring-edge-strong/80'
          : 'text-ink-subtle hover:bg-elevated/80 hover:text-ink-secondary'
      }`}
    >
      {label}
    </button>
  )
}
