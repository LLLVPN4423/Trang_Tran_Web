import { type ReactNode } from 'react'

/** Chuyển notes cũ (plain text) sang markdown nếu chưa có. */
export function normalizeAppointmentNotesMarkdown(notes: string): string {
  const trimmed = notes.trim()
  if (!trimmed) return ''
  if (trimmed.includes('## ')) return trimmed

  const lines = trimmed.split('\n')
  const out: string[] = []
  let section: 'none' | 'services' | 'estimate' | 'customer' = 'none'

  for (const raw of lines) {
    const line = raw.trimEnd()
    const t = line.trim()

    if (!t) {
      if (out.length > 0 && out[out.length - 1] !== '') out.push('')
      continue
    }

    if (t === 'Dịch vụ đã chọn:' || t.startsWith('Dịch vụ đã chọn')) {
      out.push('## Dịch vụ đã chọn', '')
      section = 'services'
      continue
    }

    if (t.startsWith('Ước tính tham khảo:')) {
      out.push('## Tổng ước tính', '', `**${t.replace('Ước tính tham khảo:', '').trim()}**`, '')
      section = 'estimate'
      continue
    }

    if (t === 'Giá chốt tại tiệm sau khi tư vấn.' || t.startsWith('Giá chốt')) {
      out.push(`_${t}_`, '')
      continue
    }

    if (t === 'Ghi chú khách:' || t.startsWith('Ghi chú khách')) {
      out.push('## Ghi chú khách', '')
      section = 'customer'
      continue
    }

    if (section === 'services' && t.startsWith('- ')) {
      out.push(formatLegacyServiceLine(t.slice(2)))
      continue
    }

    if (section === 'customer') {
      out.push(t)
      continue
    }

    out.push(t)
  }

  return out.join('\n').trim()
}

function formatLegacyServiceLine(body: string): string {
  const sized = body.match(/^(.+?) \((Size [A-Z]+)\): (.+?) · khoảng (.+)$/i)
  if (sized) {
    const [, name, size, price, range] = sized
    return `- **${name.trim()}** · ${size} · **${price.trim()}** _(khoảng ${range.trim()})_`
  }

  const plain = body.match(/^(.+?): (.+)$/)
  if (plain) {
    return `- **${plain[1].trim()}** · **${plain[2].trim()}**`
  }

  return `- ${body}`
}

function parseInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re = /(\*\*.+?\*\*|_.+?_)/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(
        <strong key={key++} className="font-medium text-zinc-200">
          {token.slice(2, -2)}
        </strong>,
      )
    } else {
      parts.push(
        <em key={key++} className="text-zinc-500 not-italic">
          {token.slice(1, -1)}
        </em>,
      )
    }
    last = match.index + token.length
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts.length ? parts : [text]
}

export function AppointmentNotesView({ notes, className = '' }: { notes: string; className?: string }) {
  const markdown = normalizeAppointmentNotesMarkdown(notes)
  if (!markdown) return null

  const blocks: ReactNode[] = []
  const lines = markdown.split('\n')
  let listBuffer: string[] = []
  let blockKey = 0

  const flushList = () => {
    if (listBuffer.length === 0) return
    blocks.push(
      <ul key={`ul-${blockKey++}`} className="mt-2 space-y-2 pl-1">
        {listBuffer.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-300">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold/70" aria-hidden />
            <span>{parseInline(item)}</span>
          </li>
        ))}
      </ul>,
    )
    listBuffer = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const t = line.trim()

    if (!t) {
      flushList()
      continue
    }

    if (t.startsWith('## ')) {
      flushList()
      blocks.push(
        <h3
          key={`h-${blockKey++}`}
          className="mt-4 first:mt-0 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500"
        >
          {t.slice(3)}
        </h3>,
      )
      continue
    }

    if (t.startsWith('- ')) {
      listBuffer.push(t.slice(2))
      continue
    }

    flushList()
    blocks.push(
      <p key={`p-${blockKey++}`} className="mt-2 text-sm leading-relaxed text-zinc-400">
        {parseInline(t)}
      </p>,
    )
  }

  flushList()

  return (
    <div className={`rounded-sm border border-zinc-800/80 bg-zinc-950/50 p-4 ${className}`.trim()}>
      {blocks}
    </div>
  )
}
