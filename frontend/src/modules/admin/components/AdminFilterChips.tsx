export function AdminFilterChips<T extends string>({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
}: {
  value: T | ''
  onChange: (value: T | '') => void
  options: { value: T | ''; label: string }[]
  'aria-label'?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`whitespace-nowrap border px-3 py-1.5 text-xs uppercase tracking-wider transition ${
              active
                ? 'border-gold/50 bg-gold/10 text-gold'
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
