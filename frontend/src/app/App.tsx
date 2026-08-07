import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/shared/auth/AuthProvider'
import { PortfolioPage } from '@/modules/portfolio'
import { CatalogPage } from '@/modules/catalog'
import { BookingPage } from '@/modules/booking'
import { LoginPage, RegisterPage, AccountPage, LoyaltyPage } from '@/modules/account'
import { AdminLayout, AdminOverview } from '@/modules/admin/AdminLayout'
import { ServicesAdminPanel } from '@/modules/admin/components/ServicesAdminPanel'
import { ProductsAdminPanel } from '@/modules/admin/components/ProductsAdminPanel'
import { OrdersAdminPanel } from '@/modules/admin/components/OrdersAdminPanel'
import { PromotionsAdminPanel } from '@/modules/admin/components/PromotionsAdminPanel'
import { AppointmentsAdminPanel } from '@/modules/admin/components/AppointmentsAdminPanel'
import { CustomersAdminPanel } from '@/modules/admin/components/CustomersAdminPanel'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/loyalty" element={<LoyaltyPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="orders" element={<OrdersAdminPanel />} />
            <Route path="appointments" element={<AppointmentsAdminPanel />} />
            <Route path="services" element={<ServicesAdminPanel />} />
            <Route path="products" element={<ProductsAdminPanel />} />
            <Route path="promotions" element={<PromotionsAdminPanel />} />
            <Route path="customers" element={<CustomersAdminPanel />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
