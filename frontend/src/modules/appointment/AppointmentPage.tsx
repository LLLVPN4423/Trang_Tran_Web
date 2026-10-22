import { Link } from 'react-router-dom'
import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'
import { PageLayout } from '@/shared/components/PageLayout'
import { AppointmentForm } from './components/AppointmentForm'
import { ServiceCartSummary } from './components/ServiceCartSummary'
import { useServiceCartStore } from '@/shared/store/serviceCartStore'

export function AppointmentPage() {
  return (
    <ModuleErrorBoundary moduleName="Appointment">
      <AppointmentContent />
    </ModuleErrorBoundary>
  )
}

function AppointmentContent() {
  const itemCount = useServiceCartStore((s) => s.items.length)

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-700">Dịch vụ salon</p>
        <h1 className="mt-3 font-serif text-4xl text-ink">Đặt lịch dịch vụ</h1>
        <p className="mt-2 text-sm text-ink-subtle">
          Chọn dịch vụ từ{' '}
          <Link to="/catalog" className="text-gold-700 hover:text-gold-300">
            bảng giá
          </Link>
          , xem lại và gửi lịch một lần. Thanh toán khi làm dịch vụ tại tiệm.
        </p>

        <div className="mt-10 space-y-12">
          <ServiceCartSummary />
          {itemCount > 0 && <AppointmentForm />}
        </div>
      </div>
    </PageLayout>
  )
}
