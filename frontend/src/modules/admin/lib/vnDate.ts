/** Ngày lịch VN (YYYY-MM-DD) theo Asia/Ho_Chi_Minh. */
export function vnDateString(d: Date = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
}

export function addDaysToDateString(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const utc = Date.UTC(y, m - 1, d)
  const next = new Date(utc + days * 86400000)
  const ys = next.getUTCFullYear()
  const ms = String(next.getUTCMonth() + 1).padStart(2, '0')
  const ds = String(next.getUTCDate()).padStart(2, '0')
  return `${ys}-${ms}-${ds}`
}

export function startOfMonthVn(): string {
  const today = vnDateString()
  return `${today.slice(0, 8)}01`
}

export type RevenuePreset = 'today' | '7d' | '30d' | 'month' | 'custom'

export function rangeForPreset(preset: RevenuePreset, customFrom: string, customTo: string): { from: string; to: string } {
  const to = vnDateString()
  switch (preset) {
    case 'today':
      return { from: to, to }
    case '7d':
      return { from: addDaysToDateString(to, -6), to }
    case '30d':
      return { from: addDaysToDateString(to, -29), to }
    case 'month':
      return { from: startOfMonthVn(), to }
    case 'custom':
      return { from: customFrom, to: customTo }
  }
}
