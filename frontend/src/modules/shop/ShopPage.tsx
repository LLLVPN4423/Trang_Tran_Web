import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'
import { PageLayout } from '@/shared/components/PageLayout'
import { LoadingState } from '@/shared/components/LoadingState'
import { ApiErrorState } from '@/shared/components/ApiErrorState'
import { ProductCard } from '@/modules/catalog/components/ProductCard'
import { useCatalogData } from '@/modules/catalog/hooks/useCatalogData'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/shared/store/cartStore'
import { selectCartItemCount } from '@/shared/store/cartSelectors'

export function ShopPage() {
  return (
    <ModuleErrorBoundary moduleName="Shop">
      <ShopContent />
    </ModuleErrorBoundary>
  )
}

function ShopContent() {
  const { data, error, loading, reload } = useCatalogData()
  const itemCount = useCartStore(selectCartItemCount)
  const products = data?.products ?? []

  return (
    <PageLayout>
      <div className="section-inner px-5 py-12 sm:px-8 sm:py-16">
        <p className="section-eyebrow">Moroccanoil</p>
        <h1 className="section-title">Mua sản phẩm online</h1>
        <p className="section-body mt-4 max-w-2xl">
          Dầu gội, dưỡng tóc Moroccanoil — chọn sản phẩm, thanh toán chuyển khoản hoặc COD.{' '}
          <Link to="/catalog" className="text-gold-muted hover:text-gold">
            Xem bảng giá dịch vụ
          </Link>
          {' · '}
          Dịch vụ salon{' '}
          <Link to="/appointment" className="text-gold-muted hover:text-gold">
            đặt lịch dịch vụ
          </Link>
          .
        </p>

        {itemCount > 0 && (
          <div className="mt-6">
            <Link to="/booking" className="btn-gold inline-block px-6 py-3 text-xs uppercase tracking-widest">
              Thanh toán ({itemCount}) →
            </Link>
          </div>
        )}

        {loading && <LoadingState label="Đang tải sản phẩm..." />}
        {error && !loading && <ApiErrorState message={error} onRetry={reload} />}

        {!loading && !error && (
          <div className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
              <p className="col-span-full py-12 text-center text-zinc-500">Chưa có sản phẩm.</p>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
