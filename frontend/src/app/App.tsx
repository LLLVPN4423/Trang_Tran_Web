import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/shared/auth/AuthProvider'
import { PortfolioPage } from '@/modules/portfolio'
import { CatalogPage } from '@/modules/catalog'
import { BookingPage } from '@/modules/booking'
import { AdminPage } from '@/modules/admin'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
