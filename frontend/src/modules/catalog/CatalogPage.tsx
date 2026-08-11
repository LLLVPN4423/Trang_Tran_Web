import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'
import { PageLayout } from '@/shared/components/PageLayout'
import { LoadingState } from '@/shared/components/LoadingState'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { ServiceCard } from './components/ServiceCard'
import { ProductCard } from './components/ProductCard'
import { filterServices, useCatalogData } from './hooks/useCatalogData'
import { CATEGORY_LABELS, type ServiceCategory } from '@/shared/api/types'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/shared/store/cartStore'

type Tab = 'services' | 'products'

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
  const [tab, setTab] = useState<Tab>('services')
  const [category, setCategory] = useState<ServiceCategory | 'all'>('all')
  const itemCount = useCartStore((s) => s.itemCount())

  const services = data ? filterServices(data.services, category) : []
  const products = data?.products ?? []

  return (
    <PageLayout>
      <div className="section-inner px-5 py-12 sm:px-8 sm:py-16">
        <p className="section-eyebrow">Catalog</p>
        <h1 className="section-title">Menu dịch vụ</h1>

        <div className="mt-8 flex flex-wrap items-center gap-4 border-b border-zinc-800/80 pb-4">
          <button
            type="button"
            onClick={() => setTab('services')}
            className={`label-caps transition ${
              tab === 'services' ? 'text-gold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Dịch vụ tóc
          </button>
          <button
            type="button"
            onClick={() => setTab('products')}
            className={`label-caps transition ${
              tab === 'products' ? 'text-gold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Moroccanoil
          </button>
          {itemCount > 0 && (
            <Link
              to="/booking"
              className="label-caps ml-auto text-gold-muted hover:text-gold"
            >
              Thanh toán ({itemCount}) →
            </Link>
          )}
        </div>

        {tab === 'services' && (
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
        )}

        {loading && <LoadingState label="Đang tải menu..." />}
        {error && !loading && <ApiErrorState message={error} onRetry={reload} />}

        {!loading && !error && tab === 'services' && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
            {services.length === 0 && (
              <p className="col-span-full py-12 text-center text-zinc-500">Không có dịch vụ.</p>
            )}
          </div>
        )}

        {!loading && !error && tab === 'products' && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {products.length === 0 && (
              <p className="col-span-full py-12 text-center text-zinc-500">Không có sản phẩm.</p>
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
          ? 'bg-zinc-800/90 text-zinc-100 ring-1 ring-zinc-700/80'
          : 'text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  )
}
