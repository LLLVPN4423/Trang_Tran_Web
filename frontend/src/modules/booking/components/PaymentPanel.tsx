import { formatVnd, type OrderResponse } from '@/shared/api/types'

interface Props {
  order: OrderResponse
  pollingExhausted?: boolean
}

export function PaymentPending({ order, pollingExhausted }: Props) {
  const bankName = import.meta.env.VITE_SEPAY_BANK_NAME || 'Vietcombank'
  const accountNumber = import.meta.env.VITE_SEPAY_ACCOUNT_NUMBER || '0123456789'
  const accountName = import.meta.env.VITE_SEPAY_ACCOUNT_NAME || 'TRANG TRAN HAIR SALON'

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-gold/30 bg-gold/5 p-6">
        <p className="text-xs uppercase tracking-widest text-gold-muted">Chờ thanh toán</p>
        <p className="mt-4 font-serif text-3xl text-gold">{formatVnd(order.totalAmount)}</p>
        <p className="mt-2 text-sm text-zinc-400">
          Mã thanh toán:{' '}
          <strong className="font-mono text-zinc-200">{order.paymentCode}</strong>
        </p>
      </div>

      <div className="space-y-4 text-sm text-zinc-400">
        <h3 className="text-xs uppercase tracking-widest text-zinc-500">Hướng dẫn chuyển khoản SePay</h3>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Mở app ngân hàng và chọn chuyển khoản.</li>
          <li>
            Nhập số tiền <strong className="text-zinc-200">{formatVnd(order.totalAmount)}</strong>.
          </li>
          <li>
            Nội dung chuyển khoản:{' '}
            <strong className="font-mono text-gold">{order.paymentCode}</strong>
          </li>
          <li>Hệ thống tự xác nhận trong vài phút.</li>
          <li>Sản phẩm trong đơn được <strong className="text-zinc-300">giữ tồn kho 15 phút</strong> — thanh toán trước khi hết hạn.</li>
        </ol>
      </div>

      <dl className="grid gap-3 rounded-sm border border-zinc-800 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-500">Ngân hàng</dt>
          <dd className="text-zinc-300">{bankName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Số tài khoản</dt>
          <dd className="font-mono text-zinc-300">{accountNumber}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Chủ tài khoản</dt>
          <dd className="text-zinc-300">{accountName}</dd>
        </div>
      </dl>

      <div className="flex items-center gap-3 text-sm text-zinc-500">
        {!pollingExhausted ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-gold" />
            Đang chờ xác nhận thanh toán...
          </>
        ) : (
          <p>
            Chưa nhận xác nhận tự động. Nếu đã chuyển khoản, salon sẽ duyệt thủ công — giữ mã{' '}
            <strong className="font-mono text-gold">{order.paymentCode}</strong>.
          </p>
        )}
      </div>
    </div>
  )
}

export function PaymentSuccess({ order }: Props) {
  return (
    <div className="rounded-sm border border-emerald-900/50 bg-emerald-950/20 p-8 text-center">
      <p className="text-4xl">✓</p>
      <h2 className="mt-4 font-serif text-3xl text-emerald-300">Thanh toán thành công</h2>
      <p className="mt-2 text-zinc-400">
        Đơn hàng <strong className="text-zinc-200">{order.paymentCode}</strong> đã được xác nhận.
      </p>
      <p className="mt-4 text-sm text-zinc-500">
        Tổng: {formatVnd(order.totalAmount)}
        {order.pointsEarned > 0 && (
          <> · Bạn nhận <strong className="text-gold">{order.pointsEarned} điểm</strong></>
        )}
      </p>
    </div>
  )
}
