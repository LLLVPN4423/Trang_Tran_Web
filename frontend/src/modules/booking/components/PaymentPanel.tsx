import { Link } from 'react-router-dom'
import { formatVnd, type OrderResponse } from '@/shared/api/types'
import {
  FULFILLMENT_METHOD_LABELS,
  normalizeFulfillmentMethod,
  normalizePaymentMethod,
  PAYMENT_METHOD_LABELS,
} from '@/shared/lib/orderLabels'
import { FULFILLMENT_STATUS_LABELS, getShippingLabel } from '@/shared/lib/orderFulfillment'
import { VietQrPayment } from './VietQrPayment'

interface Props {
  order: OrderResponse
  pollingExhausted?: boolean
}

function OrderTrackingLink({ order }: { order: OrderResponse }) {
  return (
    <Link
      to={`/orders/${order.id}?token=${encodeURIComponent(order.accessToken)}`}
      className="mt-4 inline-block text-xs uppercase tracking-widest text-gold-muted hover:text-gold"
    >
      Theo dõi đơn & xác nhận nhận hàng
    </Link>
  )
}

function OrderMeta({ order }: { order: OrderResponse }) {
  const paymentMethod = normalizePaymentMethod(order.paymentMethod)
  const fulfillmentMethod = normalizeFulfillmentMethod(order.fulfillmentMethod)
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
      <span>{PAYMENT_METHOD_LABELS[paymentMethod]}</span>
      <span>·</span>
      <span>{FULFILLMENT_METHOD_LABELS[fulfillmentMethod]}</span>
      {order.shippingFee > 0 && (
        <>
          <span>·</span>
          <span>
            Ship {formatVnd(order.shippingFee)}
            {order.shippingZone ? ` (${getShippingLabel(order.shippingZone)})` : ''}
          </span>
        </>
      )}
      {fulfillmentMethod === 'Delivery' && order.fulfillmentStatus !== 'None' && (
        <>
          <span>·</span>
          <span className="text-zinc-400">{FULFILLMENT_STATUS_LABELS[order.fulfillmentStatus]}</span>
        </>
      )}
      {order.deliveryAddress && (
        <>
          <span>·</span>
          <span className="text-zinc-400">{order.deliveryAddress}</span>
        </>
      )}
    </div>
  )
}

export function PaymentPending({ order, pollingExhausted }: Props) {
  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-gold/30 bg-gold/5 p-6">
        <p className="text-xs uppercase tracking-widest text-gold-muted">Chờ chuyển khoản</p>
        <p className="mt-4 font-serif text-3xl text-gold">{formatVnd(order.totalAmount)}</p>
        <p className="mt-2 text-sm text-zinc-400">
          Mã đơn:{' '}
          <strong className="font-mono text-zinc-200">{order.paymentCode}</strong>
        </p>
        <OrderMeta order={order} />
      </div>

      <VietQrPayment order={order} />

      <div className="space-y-4 text-sm text-zinc-400">
        <h3 className="text-xs uppercase tracking-widest text-zinc-500">Hướng dẫn</h3>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Mở app ngân hàng → <strong className="text-zinc-300">Quét mã QR</strong> ở trên.
          </li>
          <li>
            Kiểm tra số tiền <strong className="text-zinc-200">{formatVnd(order.totalAmount)}</strong> và nội dung{' '}
            <strong className="font-mono text-gold">{order.paymentCode}</strong> đã điền sẵn.
          </li>
          <li>Xác thực và hoàn tất chuyển khoản.</li>
          <li>
            Salon xác nhận sau khi nhận tiền — trang tự chuyển sang{' '}
            <strong className="text-zinc-300">Thanh toán thành công</strong>.
          </li>
          <li>
            {order.fulfillmentMethod === 'Delivery' ? (
              <>
                Sau khi xác nhận, salon sẽ <strong className="text-zinc-300">giao hàng</strong> theo địa chỉ bạn đã
                nhập.
              </>
            ) : (
              <>
                Sau khi xác nhận, bạn có thể <strong className="text-zinc-300">đến tiệm lấy hàng</strong>.
              </>
            )}
          </li>
          <li>
            Sản phẩm được <strong className="text-zinc-300">giữ tồn 15 phút</strong> — chuyển khoản trước khi hết hạn.
          </li>
        </ol>
      </div>

      <div className="flex items-center gap-3 text-sm text-zinc-500">
        {!pollingExhausted ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-gold" />
            Đang chờ salon xác nhận — trang tự cập nhật mỗi vài giây...
          </>
        ) : (
          <p>
            Vẫn đang chờ xác nhận. Nếu salon hủy đơn, màn hình sẽ tự chuyển sang{' '}
            <strong className="text-zinc-300">Đã hủy</strong>.
          </p>
        )}
      </div>

      <OrderTrackingLink order={order} />
    </div>
  )
}

export function CodOrderPending({ order, pollingExhausted }: Props) {
  const awaitingApproval =
    order.fulfillmentMethod === 'Delivery' && order.fulfillmentStatus === 'AwaitingApproval'

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-amber-900/40 bg-amber-950/20 p-6">
        <p className="text-xs uppercase tracking-widest text-amber-200/80">
          {awaitingApproval ? 'COD giao hàng — chờ salon duyệt' : 'Đơn COD — chờ salon xác nhận'}
        </p>
        <p className="mt-4 font-serif text-3xl text-amber-100">{formatVnd(order.totalAmount)}</p>
        <p className="mt-2 text-sm text-zinc-400">
          Mã đơn:{' '}
          <strong className="font-mono text-zinc-200">{order.paymentCode}</strong>
        </p>
        <OrderMeta order={order} />
      </div>

      <div className="space-y-4 text-sm text-zinc-400">
        <h3 className="text-xs uppercase tracking-widest text-zinc-500">Tiếp theo</h3>
        <ol className="list-decimal space-y-2 pl-5">
          {awaitingApproval ? (
            <>
              <li>
                Salon <strong className="text-zinc-300">duyệt đơn COD</strong> trước khi giao — thường trong vài giờ
                làm việc.
              </li>
              <li>
                Sau khi duyệt, hàng được giao — bạn trả{' '}
                <strong className="text-zinc-300">{formatVnd(order.totalAmount)}</strong> khi nhận.
              </li>
            </>
          ) : (
            <li>
              Salon sẽ <strong className="text-zinc-300">gọi điện / nhắn Zalo</strong> xác nhận đơn trong thời gian sớm
              nhất.
            </li>
          )}
          <li>
            {order.fulfillmentMethod === 'Delivery' ? (
              <>
                Hàng sẽ được <strong className="text-zinc-300">giao</strong> — bạn trả tiền khi nhận (
                {formatVnd(order.totalAmount)}).
              </>
            ) : (
              <>
                Bạn <strong className="text-zinc-300">đến tiệm lấy</strong> và trả tiền mặt / chuyển khoản tại quầy.
              </>
            )}
          </li>
          <li>
            Đơn được giữ tồn <strong className="text-zinc-300">48 giờ</strong>. Nếu không liên hệ được, đơn có thể bị
            hủy.
          </li>
          <li>Sau khi salon thu tiền, trang sẽ hiện <strong className="text-zinc-300">Đơn hoàn tất</strong>.</li>
        </ol>
      </div>

      <div className="flex items-center gap-3 text-sm text-zinc-500">
        {!pollingExhausted ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-400" />
            Đang chờ salon xử lý — trang tự cập nhật...
          </>
        ) : (
          <p>Cần hỗ trợ gấp? Gọi salon qua số trên trang chủ.</p>
        )}
      </div>

      <OrderTrackingLink order={order} />
    </div>
  )
}

export function PaymentCancelled({ order }: Props) {
  return (
    <div className="rounded-sm border border-zinc-700 bg-zinc-900/40 p-8 text-center">
      <p className="text-4xl text-zinc-500">×</p>
      <h2 className="mt-4 font-serif text-3xl text-zinc-300">Đơn hàng đã hủy</h2>
      <p className="mt-2 text-zinc-400">
        Đơn <strong className="font-mono text-zinc-200">{order.paymentCode}</strong> không còn hiệu lực.
      </p>
      <p className="mt-4 text-sm text-zinc-500">
        {order.paymentMethod === 'BankTransfer'
          ? 'Vui lòng không chuyển khoản.'
          : 'Đơn COD đã bị hủy — không cần thanh toán.'}{' '}
        Tổng ban đầu: {formatVnd(order.totalAmount)}.
      </p>
      <Link
        to="/catalog"
        className="mt-8 inline-block text-xs uppercase tracking-widest text-gold-muted hover:text-gold"
      >
        Quay lại mua hàng
      </Link>
    </div>
  )
}

export function PaymentSuccess({ order }: Props) {
  const fulfillmentNote =
    order.fulfillmentMethod === 'Delivery'
      ? 'Salon sẽ giao hàng theo địa chỉ bạn đã cung cấp.'
      : 'Bạn có thể đến tiệm lấy hàng nếu chưa nhận.'

  return (
    <div className="rounded-sm border border-emerald-900/50 bg-emerald-950/20 p-8 text-center">
      <p className="text-4xl">✓</p>
      <h2 className="mt-4 font-serif text-3xl text-emerald-300">Đơn hàng hoàn tất</h2>
      <p className="mt-2 text-zinc-400">
        Đơn <strong className="text-zinc-200">{order.paymentCode}</strong> đã được salon xác nhận.
      </p>
      <p className="mt-4 text-sm text-zinc-500">
        Tổng: {formatVnd(order.totalAmount)}
        {order.pointsEarned > 0 && (
          <>
            {' '}
            · Bạn nhận <strong className="text-gold">{order.pointsEarned} điểm</strong>
          </>
        )}
      </p>
      <p className="mt-3 text-sm text-zinc-500">{fulfillmentNote}</p>
      <OrderMeta order={order} />
      <Link
        to={`/orders/${order.id}?token=${encodeURIComponent(order.accessToken)}`}
        className="mt-6 inline-block text-xs uppercase tracking-widest text-gold-muted hover:text-gold"
      >
        Xem chi tiết đơn
      </Link>
    </div>
  )
}
