import { Link } from 'react-router-dom'

export type LegalNoticeLink = {
  to: string
  label: string
}

interface Props {
  /** Short context line above the links. */
  preface?: string
  links: LegalNoticeLink[]
  className?: string
}

/**
 * Compact policy links for forms (Phase 1B).
 * No checkboxes / consent capture — disclosure links only.
 */
export function FormLegalNotice({ preface, links, className = '' }: Props) {
  if (links.length === 0) return null

  return (
    <div className={`space-y-2 text-xs leading-relaxed text-ink-subtle ${className}`.trim()}>
      {preface && <p>{preface}</p>}
      <p className="flex flex-wrap gap-x-3 gap-y-1">
        {links.map((link, i) => (
          <span key={link.to} className="inline-flex items-center gap-3">
            {i > 0 && <span className="text-edge-strong" aria-hidden="true">·</span>}
            <Link
              to={link.to}
              className="min-h-11 inline-flex items-center text-gold-700 underline-offset-2 transition hover:text-gold-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            >
              {link.label}
            </Link>
          </span>
        ))}
      </p>
    </div>
  )
}
