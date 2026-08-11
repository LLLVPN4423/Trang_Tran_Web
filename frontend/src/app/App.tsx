import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/shared/auth/AuthProvider'
import { PortfolioPage } from '@/modules/portfolio'
import { CatalogPage } from '@/modules/catalog'
import { ProductDetailPage } from '@/modules/catalog/ProductDetailPage'
import { ServiceDetailPage } from '@/modules/catalog/ServiceDetailPage'
import { BookingPage } from '@/modules/booking'
import { LoginPage, RegisterPage, AccountPage, LoyaltyPage } from '@/modules/account'
import { LoadingState } from '@/shared/components/LoadingState'
import { NotFoundPage } from '@/shared/components/NotFoundPage'
import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'

const AdminLayout = lazy(() =>
  import('@/modules/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminOverview = lazy(() =>
  import('@/modules/admin/AdminLayout').then((m) => ({ default: m.AdminOverview })),
)
const OrdersAdminPanel = lazy(() =>
  import('@/modules/admin/components/OrdersAdminPanel').then((m) => ({ default: m.OrdersAdminPanel })),
)
const AppointmentsAdminPanel = lazy(() =>
  import('@/modules/admin/components/AppointmentsAdminPanel').then((m) => ({ default: m.AppointmentsAdminPanel })),
)
const ServicesAdminPanel = lazy(() =>
  import('@/modules/admin/components/ServicesAdminPanel').then((m) => ({ default: m.ServicesAdminPanel })),
)
const ProductsAdminPanel = lazy(() =>
  import('@/modules/admin/components/ProductsAdminPanel').then((m) => ({ default: m.ProductsAdminPanel })),
)
const PromotionsAdminPanel = lazy(() =>
  import('@/modules/admin/components/PromotionsAdminPanel').then((m) => ({ default: m.PromotionsAdminPanel })),
)
const CustomersAdminPanel = lazy(() =>
  import('@/modules/admin/components/CustomersAdminPanel').then((m) => ({ default: m.CustomersAdminPanel })),
)

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
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/product/:id" element={<ProductDetailPage />} />
          <Route path="/catalog/service/:id" element={<ServiceDetailPage />} />
          <Route path="/booking" element={<BookingPage />} />
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
            <Route
              index
              element={
                <AdminRoute>
                  <AdminOverview />
                </AdminRoute>
              }
            />
            <Route path="orders" element={<AdminRoute><OrdersAdminPanel /></AdminRoute>} />
            <Route path="appointments" element={<AdminRoute><AppointmentsAdminPanel /></AdminRoute>} />
            <Route path="services" element={<AdminRoute><ServicesAdminPanel /></AdminRoute>} />
            <Route path="products" element={<AdminRoute><ProductsAdminPanel /></AdminRoute>} />
            <Route path="promotions" element={<AdminRoute><PromotionsAdminPanel /></AdminRoute>} />
            <Route path="customers" element={<AdminRoute><CustomersAdminPanel /></AdminRoute>} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
