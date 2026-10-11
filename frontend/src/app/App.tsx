import { Suspense, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/shared/auth/AuthProvider'
import { PortfolioPage } from '@/modules/portfolio'
import { CatalogPage } from '@/modules/catalog'
import { ShopPage } from '@/modules/shop'
import { ProductDetailPage } from '@/modules/catalog/ProductDetailPage'
import { ServiceDetailPage } from '@/modules/catalog/ServiceDetailPage'
import { BookingPage } from '@/modules/booking'
import { AppointmentPage } from '@/modules/appointment'
import { OrderDetailPage } from '@/modules/orders'
import { LoginPage, RegisterPage, AccountPage, LoyaltyPage } from '@/modules/account'
import { LoadingState } from '@/shared/components/LoadingState'
import { NotFoundPage } from '@/shared/components/NotFoundPage'
import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'
import { lazyWithRetry } from '@/shared/utils/lazyWithRetry'
import { MobileSalonCtaBar } from '@/shared/components/MobileSalonCtaBar'
import { SalonLocalSeo } from '@/shared/components/SalonLocalSeo'
import { PlatformAdminRoute } from '@/modules/admin/components/PlatformAdminRoute'

const AdminLayout = lazyWithRetry(() =>
  import('@/modules/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminOverview = lazyWithRetry(() =>
  import('@/modules/admin/AdminLayout').then((m) => ({ default: m.AdminOverview })),
)
const OrdersAdminPanel = lazyWithRetry(() =>
  import('@/modules/admin/components/OrdersAdminPanel').then((m) => ({ default: m.OrdersAdminPanel })),
)
const AppointmentsAdminPanel = lazyWithRetry(() =>
  import('@/modules/admin/components/AppointmentsAdminPanel').then((m) => ({ default: m.AppointmentsAdminPanel })),
)
const ServicesAdminPanel = lazyWithRetry(() =>
  import('@/modules/admin/components/ServicesAdminPanel').then((m) => ({ default: m.ServicesAdminPanel })),
)
const ProductsAdminPanel = lazyWithRetry(() =>
  import('@/modules/admin/components/ProductsAdminPanel').then((m) => ({ default: m.ProductsAdminPanel })),
)
const PromotionsAdminPanel = lazyWithRetry(() =>
  import('@/modules/admin/components/PromotionsAdminPanel').then((m) => ({ default: m.PromotionsAdminPanel })),
)
const CustomersAdminPanel = lazyWithRetry(() =>
  import('@/modules/admin/components/CustomersAdminPanel').then((m) => ({ default: m.CustomersAdminPanel })),
)
const SiteContentAdminPanel = lazyWithRetry(() =>
  import('@/modules/admin/components/SiteContentAdminPanel').then((m) => ({ default: m.SiteContentAdminPanel })),
)
const ServiceInvoicesAdminPanel = lazyWithRetry(() =>
  import('@/modules/admin/components/ServiceInvoicesAdminPanel').then((m) => ({
    default: m.ServiceInvoicesAdminPanel,
  })),
)
const RevenueAdminPanel = lazyWithRetry(() =>
  import('@/modules/admin/components/RevenueAdminPanel').then((m) => ({ default: m.RevenueAdminPanel })),
)
const AdminToolsPanel = lazyWithRetry(() =>
  import('@/modules/admin/components/AdminToolsPanel').then((m) => ({ default: m.AdminToolsPanel })),
)
function PlatformAdminOnly({ children }: { children: ReactNode }) {
  return <PlatformAdminRoute>{children}</PlatformAdminRoute>
}

function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ModuleErrorBoundary moduleName="Admin">
      <Suspense fallback={<LoadingState label="Đang tải admin..." />}>{children}</Suspense>
    </ModuleErrorBoundary>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SalonLocalSeo />
        <MobileSalonCtaBar />
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/catalog/product/:id" element={<ProductDetailPage />} />
          <Route path="/catalog/service/:id" element={<ServiceDetailPage />} />
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route
            path="/orders/:id"
            element={
              <ModuleErrorBoundary moduleName="Orders">
                <OrderDetailPage />
              </ModuleErrorBoundary>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/account"
            element={
              <ModuleErrorBoundary moduleName="Account">
                <AccountPage />
              </ModuleErrorBoundary>
            }
          />
          <Route path="/account/loyalty" element={<LoyaltyPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="orders" element={<OrdersAdminPanel />} />
            <Route path="service-invoices" element={<ServiceInvoicesAdminPanel />} />
            <Route path="revenue" element={<RevenueAdminPanel />} />
            <Route path="appointments" element={<AppointmentsAdminPanel />} />
            <Route
              path="services"
              element={
                <PlatformAdminOnly>
                  <ServicesAdminPanel />
                </PlatformAdminOnly>
              }
            />
            <Route
              path="products"
              element={
                <PlatformAdminOnly>
                  <ProductsAdminPanel />
                </PlatformAdminOnly>
              }
            />
            <Route
              path="site-content"
              element={
                <PlatformAdminOnly>
                  <SiteContentAdminPanel />
                </PlatformAdminOnly>
              }
            />
            <Route
              path="promotions"
              element={
                <PlatformAdminOnly>
                  <PromotionsAdminPanel />
                </PlatformAdminOnly>
              }
            />
            <Route path="customers" element={<CustomersAdminPanel />} />
            <Route
              path="tools"
              element={
                <PlatformAdminOnly>
                  <AdminToolsPanel />
                </PlatformAdminOnly>
              }
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
