import type { AppointmentResponse, HairSize, ServiceCategory, ServiceResponse } from '@/shared/api/types'
import { resolveServicePrice } from '@/shared/api/types'
import { normalizeAppointmentNotesMarkdown } from '@/shared/lib/appointmentNotes'

export type InvoiceLinePrefill = {
  itemType: 'Service' | 'Custom' | 'Product'
  itemId: string
  name: string
  hairSize: HairSize | ''
  quantity: number
  unitPrice: string
}

const SERVICE_LINE_RE =
  /^-\s+\*\*(.+?)\*\*(?:\s*·\s*Size\s+(S|M|L|XL))?\s*·\s+\*\*(.+?)\*\*/i

const INTEREST_TO_CATEGORIES: Record<string, ServiceCategory[]> = {
  cut: ['Cut', 'Styling'],
  perm: ['Perm', 'Straightening'],
  color: ['Dye', 'Bleach', 'Highlight', 'Balayage'],
  recovery: ['Recovery'],
  retail: [],
}

function parseVndLoose(text: string): number | null {
  const digits = text.replace(/[^\d]/g, '')
  if (!digits) return null
  const n = Number(digits)
  return Number.isFinite(n) && n > 0 ? n : null
}

function findServiceByName(services: ServiceResponse[], name: string): ServiceResponse | undefined {
  const t = name.trim().toLowerCase()
  if (!t) return undefined
  return (
    services.find((s) => s.name.toLowerCase() === t) ??
    services.find((s) => s.name.toLowerCase().includes(t) || t.includes(s.name.toLowerCase()))
  )
}

function pickServiceForInterestKey(services: ServiceResponse[], key: string): ServiceResponse | undefined {
  const categories = INTEREST_TO_CATEGORIES[key.trim().toLowerCase()]
  if (!categories?.length) return undefined
  for (const cat of categories) {
    const match = services.find((s) => s.category === cat && s.isActive)
    if (match) return match
  }
  return undefined
}

function parseMarkdownServiceLines(notes: string): Array<{ name: string; hairSize: HairSize | ''; price: number | null }> {
  const md = normalizeAppointmentNotesMarkdown(notes)
  const out: Array<{ name: string; hairSize: HairSize | ''; price: number | null }> = []
  let inServices = false

  for (const raw of md.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('## ')) {
      inServices = line.includes('Dịch vụ đã chọn')
      continue
    }
    if (!inServices || !line.startsWith('-')) continue

    const m = line.match(SERVICE_LINE_RE)
    if (m) {
      out.push({
        name: m[1].trim(),
        hairSize: (m[2]?.toUpperCase() as HairSize) || '',
        price: parseVndLoose(m[3]),
      })
      continue
    }

    // Legacy: "- Tên dịch vụ · 500.000đ"
    const plain = line.replace(/^-\s+/, '').replace(/\*\*/g, '')
    const parts = plain.split('·').map((p) => p.trim())
    if (parts[0]) {
      const sizeMatch = parts[0].match(/Size\s+(S|M|L|XL)/i)
      const name = parts[0].replace(/\s*·?\s*Size\s+(S|M|L|XL)/i, '').trim()
      const price = parseVndLoose(parts[parts.length - 1] ?? '')
      out.push({
        name,
        hairSize: (sizeMatch?.[1]?.toUpperCase() as HairSize) || '',
        price,
      })
    }
  }

  return out
}

function linesFromServiceInterest(
  serviceInterest: string,
  services: ServiceResponse[],
): InvoiceLinePrefill[] {
  const key = serviceInterest.trim().toLowerCase()
  if (INTEREST_TO_CATEGORIES[key]) {
    const svc = pickServiceForInterestKey(services, key)
    if (!svc) return []
    const hairSize: HairSize = 'M'
    const price = resolveServicePrice(svc, hairSize)
    return [
      {
        itemType: 'Service',
        itemId: svc.id,
        name: svc.name,
        hairSize: svc.basePrice != null ? '' : hairSize,
        quantity: 1,
        unitPrice: String(price),
      },
    ]
  }

  const names = serviceInterest.split(/[,;|/]+/).map((s) => s.trim()).filter(Boolean)
  const lines: InvoiceLinePrefill[] = []

  for (const name of names) {
    const svc = findServiceByName(services, name)
    if (!svc) {
      lines.push({
        itemType: 'Custom',
        itemId: '',
        name,
        hairSize: '',
        quantity: 1,
        unitPrice: '',
      })
      continue
    }
    const hairSize: HairSize = 'M'
    const price = resolveServicePrice(svc, hairSize)
    lines.push({
      itemType: 'Service',
      itemId: svc.id,
      name: svc.name,
      hairSize: svc.basePrice != null ? '' : hairSize,
      quantity: 1,
      unitPrice: String(price),
    })
  }

  return lines
}

function toInvoiceLine(
  services: ServiceResponse[],
  parsed: { name: string; hairSize: HairSize | ''; price: number | null },
): InvoiceLinePrefill {
  const svc = findServiceByName(services, parsed.name)
  if (svc) {
    const size = (parsed.hairSize || 'M') as HairSize
    const resolved =
      parsed.price ??
      (() => {
        try {
          return resolveServicePrice(svc, size)
        } catch {
          return null
        }
      })()
    return {
      itemType: 'Service',
      itemId: svc.id,
      name: svc.name,
      hairSize: svc.basePrice != null ? '' : parsed.hairSize || 'M',
      quantity: 1,
      unitPrice: String(resolved ?? ''),
    }
  }

  return {
    itemType: 'Custom',
    itemId: '',
    name: parsed.name,
    hairSize: '',
    quantity: 1,
    unitPrice: parsed.price != null ? String(parsed.price) : '',
  }
}

/** Gợi ý dòng hóa đơn từ lịch hẹn (notes markdown hoặc serviceInterest). */
export function buildInvoiceLinesFromAppointment(
  appointment: AppointmentResponse,
  services: ServiceResponse[],
): InvoiceLinePrefill[] {
  const active = services.filter((s) => s.isActive)
  if (appointment.notes?.trim()) {
    const parsed = parseMarkdownServiceLines(appointment.notes)
    if (parsed.length > 0) return parsed.map((p) => toInvoiceLine(active, p))
  }

  if (appointment.serviceInterest?.trim()) {
    const fromInterest = linesFromServiceInterest(appointment.serviceInterest, active)
    if (fromInterest.length > 0) return fromInterest
  }

  return []
}

export function extractCustomerNotesFromAppointment(notes: string | null | undefined): string {
  if (!notes?.trim()) return ''
  const md = normalizeAppointmentNotesMarkdown(notes)
  const marker = '## Ghi chú khách'
  const idx = md.indexOf(marker)
  if (idx < 0) return ''
  return md
    .slice(idx + marker.length)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n')
}
