import { useEffect, useState } from 'react'

import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'

import { PageLayout } from '@/shared/components/PageLayout'

import { CartSummary } from './components/CartSummary'

import { CheckoutForm } from './components/CheckoutForm'

import {
  CodOrderPending,
  PaymentCancelled,
  PaymentPending,
  PaymentSuccess,
} from './components/PaymentPanel'

import { useAuth } from '@/shared/auth/AuthProvider'

import { useOrderPolling } from './hooks/useOrderPolling'

import { useCartStore } from '@/shared/store/cartStore'
import { selectCartItemCount } from '@/shared/store/cartSelectors'

import type { OrderResponse } from '@/shared/api/types'

import { normalizePaymentMethod } from '@/shared/lib/orderLabels'

import {

  clearPendingOrder,

  isPendingCheckoutOrder,

  loadPendingOrder,

  savePendingOrder,

} from '@/shared/booking/pendingOrderStorage'



export function BookingPage() {

  return (

    <ModuleErrorBoundary moduleName="Booking">

      <BookingContent />

    </ModuleErrorBoundary>

  )

}



function BookingContent() {

  const [placedOrder, setPlacedOrder] = useState<OrderResponse | null>(() => {

    const stored = loadPendingOrder()

    if (!stored || !isPendingCheckoutOrder(stored)) return null

    return stored as OrderResponse

  })

  const productCount = useCartStore(selectCartItemCount)

  const { refreshProfile } = useAuth()



  const pollingEnabled = isPendingCheckoutOrder(placedOrder)



  const { order: polledOrder, isPaid, isCancelled, pollingExhausted } = useOrderPolling(

    placedOrder?.id ?? null,

    placedOrder?.accessToken ?? null,

    pollingEnabled,

  )



  const activeOrder = polledOrder ?? placedOrder

  const showCancelled = isCancelled || activeOrder?.status === 'Cancelled'

  const paymentMethod = activeOrder ? normalizePaymentMethod(activeOrder.paymentMethod) : 'BankTransfer'



  useEffect(() => {

    if (placedOrder && isPendingCheckoutOrder(placedOrder)) {

      savePendingOrder(placedOrder)

    }

  }, [placedOrder])



  useEffect(() => {

    if (isPaid || showCancelled) {

      clearPendingOrder()

    }

  }, [isPaid, showCancelled])



  useEffect(() => {

    if (isPaid) refreshProfile()

  }, [isPaid, refreshProfile])



  const handleOrderPlaced = (order: OrderResponse) => {

    savePendingOrder(order)

    setPlacedOrder(order)

  }



  return (

    <PageLayout>

      <div className="mx-auto max-w-3xl px-6 py-16">

        <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">Mua sản phẩm</p>

        <h1 className="mt-3 font-serif text-4xl text-zinc-100">Đặt hàng Moroccanoil</h1>

        <p className="mt-2 text-sm text-zinc-500">
          Dịch vụ salon —{' '}
          <a href="/appointment" className="text-gold-muted hover:text-gold">
            đặt lịch dịch vụ
          </a>
        </p>



        {isPaid && activeOrder && <PaymentSuccess order={activeOrder} />}



        {showCancelled && activeOrder && <PaymentCancelled order={activeOrder} />}



        {!isPaid && !showCancelled && activeOrder && paymentMethod === 'COD' && (

          <CodOrderPending order={activeOrder} pollingExhausted={pollingExhausted} />

        )}



        {!isPaid && !showCancelled && activeOrder && paymentMethod === 'BankTransfer' && (

          <PaymentPending order={activeOrder} pollingExhausted={pollingExhausted} />

        )}



        {!activeOrder && (

          <div className="mt-10 space-y-12">

            <CartSummary />

            {productCount > 0 && <CheckoutForm onSuccess={handleOrderPlaced} />}

          </div>

        )}

      </div>

    </PageLayout>

  )

}

