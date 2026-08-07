import { useState } from 'react'
import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'
import { PageLayout } from '@/shared/components/PageLayout'
import { CartSummary } from './components/CartSummary'
import { CheckoutForm } from './components/CheckoutForm'
import { PaymentPending, PaymentSuccess } from './components/PaymentPanel'
import { useOrderPolling } from './hooks/useOrderPolling'
import { useCartStore } from '@/shared/store/cartStore'
import type { OrderResponse } from '@/shared/api/types'

export function BookingPage() {
  return (
    <ModuleErrorBoundary moduleName="Booking">
      <BookingContent />
    </ModuleErrorBoundary>
  )
}

function BookingContent() {
  const [placedOrder, setPlacedOrder] = useState<OrderResponse | null>(null)
  const itemCount = useCartStore((s) => s.itemCount())
  const { order: polledOrder, isPaid } = useOrderPolling(
    placedOrder?.id ?? null,
    placedOrder?.status === 'Pending',
  )

  const activeOrder = polledOrder ?? placedOrder

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">Checkout</p>
        <h1 className="mt-3 font-serif text-4xl text-zinc-100">Thanh toán</h1>

        {isPaid && activeOrder && <PaymentSuccess order={activeOrder} />}

        {!isPaid && activeOrder && <PaymentPending order={activeOrder} />}

        {!activeOrder && (
          <div className="mt-10 space-y-12">
            <CartSummary />
            {itemCount > 0 && <CheckoutForm onSuccess={setPlacedOrder} />}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
