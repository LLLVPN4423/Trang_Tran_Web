import { useMemo, useState } from 'react'
import { formatVnd, type OrderResponse } from '@/shared/api/types'
import { normalizePaymentMethod } from '@/shared/lib/orderLabels'
import { buildVietQrImageUrl, formatBankDisplayName, getVietQrConfigFromEnv } from '@/shared/lib/vietqr'

interface Props {
  order: OrderResponse
}

export function VietQrPayment({ order }: Props) {
  const config = useMemo(() => getVietQrConfigFromEnv(), [])
  const paymentMethod = normalizePaymentMethod(order.paymentMethod)
  const showQr = order.status === 'Pending' && paymentMethod === 'BankTransfer'
  const qrUrl = useMemo(
    () =>
      showQr
        ? buildVietQrImageUrl(config, {
            amount: order.totalAmount,
            paymentCode: order.paymentCode,
          })
        : null,
    [config, order.paymentCode, order.totalAmount, showQr],
  )
  const [qrFailed, setQrFailed] = useState(false)

  if (!showQr) {
    return null
  }

  return (
    <div className="space-y-4">
      {qrUrl && !qrFailed ? (
        <div className="flex flex-col items-center gap-4 rounded-sm border border-zinc-800 bg-white p-4">
          <img
            src={qrUrl}
            alt={`QR chuyển khoản ${formatVnd(order.totalAmount)} — ${order.paymentCode}`}
            className="h-auto w-full max-w-[280px] rounded-sm"
            width={280}
            height={360}
            loading="eager"
            decoding="async"
            onError={() => setQrFailed(true)}
          />
          <p className="text-center text-xs text-zinc-600">
            Quét bằng app ngân hàng — số tiền và nội dung sẽ được điền sẵn.
          </p>
        </div>
      ) : (
        <div className="rounded-sm border border-amber-900/40 bg-amber-950/20 p-4 text-sm text-amber-200/90">
          Không tạo được QR tự động — vui lòng chuyển khoản thủ công theo thông tin bên dưới.
        </div>
      )}

      <dl className="grid gap-3 rounded-sm border border-zinc-800 p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Ngân hàng</dt>
          <dd className="text-right text-zinc-300">{formatBankDisplayName(config.bankName)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Số tài khoản</dt>
          <dd className="font-mono text-zinc-300">{config.accountNumber}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Chủ tài khoản</dt>
          <dd className="text-right text-zinc-300">{config.accountName}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-zinc-800 pt-3">
          <dt className="text-zinc-500">Số tiền</dt>
          <dd className="font-serif text-gold">{formatVnd(order.totalAmount)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Nội dung</dt>
          <dd className="font-mono text-gold">{order.paymentCode}</dd>
        </div>
      </dl>
    </div>
  )
}
