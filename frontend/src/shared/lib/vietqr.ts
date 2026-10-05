/** BIN ngân hàng NAPAS — dùng cho VietQR (img.vietqr.io, miễn phí). */
const BANK_BIN_BY_NAME: Record<string, string> = {
  vietcombank: '970436',
  vcb: '970436',
  mb: '970422',
  mbbank: '970422',
  'mb bank': '970422',
  techcombank: '970407',
  tcb: '970407',
  bidv: '970418',
  agribank: '970405',
  vietinbank: '970415',
  vietin: '970415',
  acb: '970416',
  'ngân hàng acb': '970416',
  'ngan hang acb': '970416',
  'asia commercial bank': '970416',
  vpbank: '970432',
  tpbank: '970423',
  sacombank: '970403',
  hdbank: '970437',
  shb: '970443',
  vib: '970441',
  msb: '970426',
  ocb: '970448',
  lienvietpostbank: '970449',
  seabank: '970440',
  cake: '546034',
  timo: '963388',
}

export function formatBankDisplayName(bankName: string): string {
  const key = bankName.trim().toLowerCase()
  if (key === 'acb') return 'ACB (Ngân hàng Á Châu)'
  if (key === 'techcombank' || key === 'tcb') return 'Techcombank'
  return bankName.trim()
}

export interface VietQrConfig {
  bankBin: string
  accountNumber: string
  accountName: string
  bankName: string
}

export interface VietQrOrderParams {
  amount: number
  paymentCode: string
}

export function resolveBankBin(bankName: string, explicitBin?: string): string | null {
  const trimmed = explicitBin?.trim()
  if (trimmed && /^\d{6}$/.test(trimmed)) return trimmed

  const key = bankName.trim().toLowerCase()
  return BANK_BIN_BY_NAME[key] ?? null
}

export function getVietQrConfigFromEnv(): VietQrConfig {
  return {
    bankName: import.meta.env.VITE_SEPAY_BANK_NAME || 'Vietcombank',
    bankBin: import.meta.env.VITE_SEPAY_BANK_BIN || '',
    accountNumber: (import.meta.env.VITE_SEPAY_ACCOUNT_NUMBER || '').replace(/\s/g, ''),
    accountName: import.meta.env.VITE_SEPAY_ACCOUNT_NAME || '',
  }
}

/** URL ảnh QR động — số tiền + nội dung cố định theo đơn (VietQR.io public, miễn phí). */
export function buildVietQrImageUrl(
  config: VietQrConfig,
  order: VietQrOrderParams,
  template: 'compact' | 'compact2' | 'qr_only' = 'compact2',
): string | null {
  const bankBin = resolveBankBin(config.bankName, config.bankBin)
  const accountNumber = config.accountNumber.replace(/\s/g, '')

  if (!bankBin || !accountNumber || order.amount <= 0 || !order.paymentCode.trim()) {
    return null
  }

  const amount = Math.round(order.amount)
  const addInfo = encodeURIComponent(order.paymentCode.trim())
  const accountName = encodeURIComponent(config.accountName.trim())

  return `https://img.vietqr.io/image/${bankBin}-${accountNumber}-${template}.jpg?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`
}
