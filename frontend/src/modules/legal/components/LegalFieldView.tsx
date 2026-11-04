import {
  resolveFieldDisplay,
  showLegalDraftDiagnostics,
  type LegalField,
} from '@/shared/config/legal'

interface Props {
  label: string
  field: LegalField<string>
  as?: 'p' | 'dd'
}

/** Renders a config field: confirmed value, or non-invented missing placeholder. */
export function LegalFieldView({ label, field, as = 'p' }: Props) {
  const display = resolveFieldDisplay(field)
  const showDiag = showLegalDraftDiagnostics()
  const Tag = as

  return (
    <div className="space-y-1">
      <p className="label-caps text-ink-subtle">{label}</p>
      <Tag
        className={
          display.kind === 'missing'
            ? 'text-sm leading-relaxed text-ink-subtle italic'
            : 'text-sm leading-relaxed text-ink-muted sm:text-base'
        }
      >
        {display.text}
      </Tag>
      {showDiag && (
        <p className="font-mono text-[10px] uppercase tracking-wider text-warning/90">
          status: {field.status}
          {field.value === null ? ' · value: null' : ''}
        </p>
      )}
    </div>
  )
}
