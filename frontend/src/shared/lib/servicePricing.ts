import type { HairSize, ServiceCategory, ServiceResponse } from '@/shared/api/types'
import { CATEGORY_LABELS, formatVnd, resolveServicePrice } from '@/shared/api/types'
import type { ServiceCartLine } from '@/shared/store/serviceCartStore'

export function formatServicePriceRange(service: ServiceResponse): string | null {
  if (service.basePrice != null) return null
  if (!service.priceBySize) return null

  const values = Object.values(service.priceBySize).filter((v): v is number => v != null)
  if (values.length <= 1) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  return `${formatVnd(min)} – ${formatVnd(max)}`
}

export function formatServiceCardPrice(service: ServiceResponse): string {
  const range = formatServicePriceRange(service)
  if (range) return range

  if (service.basePrice != null) return formatVnd(service.basePrice)

  if (service.priceBySize) {
    const values = Object.values(service.priceBySize).filter((v): v is number => v != null)
    if (values.length === 0) return 'Liên hệ'
    if (values.length === 1) return formatVnd(values[0])
    return `Từ ${formatVnd(Math.min(...values))}`
  }

  return 'Liên hệ'
}

export function getServicePriceValues(service: ServiceResponse): number[] {
  if (service.basePrice != null) return [service.basePrice]
  if (!service.priceBySize) return []
  return Object.values(service.priceBySize).filter((v): v is number => typeof v === 'number' && v > 0)
}

export type CategoryPriceHighlight = {
  name: string
  range: string
  category: ServiceCategory
}

/** Nhóm giá min–max theo danh mục dịch vụ (cho trang chủ / tóm tắt). */
export function buildCategoryPriceHighlights(services: ServiceResponse[]): CategoryPriceHighlight[] {
  const buckets = new Map<ServiceCategory, number[]>()

  for (const service of services) {
    const prices = getServicePriceValues(service)
    if (prices.length === 0) continue
    const prev = buckets.get(service.category) ?? []
    buckets.set(service.category, [...prev, ...prices])
  }

  return (Object.keys(CATEGORY_LABELS) as ServiceCategory[])
    .filter((cat) => buckets.has(cat))
    .map((cat) => {
      const prices = buckets.get(cat)!
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      const range = min === max ? formatVnd(min) : `${formatVnd(min)} – ${formatVnd(max)}`
      return { name: CATEGORY_LABELS[cat], range, category: cat }
    })
}

export function serviceNeedsHairSize(service: ServiceResponse): boolean {
  return service.basePrice == null && service.priceBySize != null
}

export function buildServiceCartLine(
  service: ServiceResponse,
  hairSize: HairSize,
): Omit<ServiceCartLine, 'cartLineId'> {
  const needsSize = serviceNeedsHairSize(service)
  const unitPrice = resolveServicePrice(service, hairSize)

  return {
    serviceId: service.id,
    name: service.name,
    category: service.category,
    hairSize: needsSize ? hairSize : null,
    unitPrice,
    priceLabel: formatVnd(unitPrice),
    priceRangeLabel: formatServicePriceRange(service),
    durationMinutes: service.durationMinutes,
  }
}

export function buildAppointmentPayload(
  lines: ServiceCartLine[],
  customerName: string,
  customerPhone: string,
  customerNotes: string,
) {
  const serviceInterest = lines
    .map((line) => line.name)
    .join(', ')
    .slice(0, 240)

  const detailLines = lines.map((line) => {
    const sizePart = line.hairSize ? ` · Size ${line.hairSize}` : ''
    const rangePart = line.priceRangeLabel ? ` _(khoảng ${line.priceRangeLabel})_` : ''
    return `- **${line.name}**${sizePart} · **${line.priceLabel}**${rangePart}`
  })

  const estimateTotal = lines.reduce((sum, line) => sum + line.unitPrice, 0)

  const noteSections = [
    '## Dịch vụ đã chọn',
    '',
    ...detailLines,
    '',
    '## Tổng ước tính',
    '',
    `**${formatVnd(estimateTotal)}**`,
    '',
    '_Giá chốt tại tiệm sau khi tư vấn._',
  ]

  if (customerNotes.trim()) {
    noteSections.push('', '## Ghi chú khách', '', customerNotes.trim())
  }

  const notes = noteSections.join('\n')

  return {
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    serviceInterest,
    notes,
  }
}
