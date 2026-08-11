import type { FormEvent, ReactNode } from 'react'

export function AdminPanelHeader({
  title,
  count,
  action,
}: {
  title: string
  count?: number
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-serif text-2xl text-zinc-200">
        {title}
        {count != null && ` (${count})`}
      </h2>
      {action}
    </div>
  )
}

export function AdminButton({
  children,
  onClick,
  variant = 'default',
  type = 'button',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'primary' | 'danger'
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const styles = {
    default: 'border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
    primary: 'border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20',
    danger: 'border border-red-900/50 text-red-400/80 hover:text-red-400',
  } as const

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-xs uppercase tracking-wider transition disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

export function AdminModal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16">
      <div
        className={`w-full border border-zinc-800 bg-zinc-950 p-5 shadow-2xl sm:p-6 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h3 className="font-serif text-xl text-zinc-100">{title}</h3>
          <button type="button" onClick={onClose} className="text-zinc-600 hover:text-zinc-300">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function AdminField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-zinc-500">{label}</span>
      {children}
    </label>
  )
}

export const adminInputClass =
  'w-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-gold/60'

export function AdminFormActions({
  onCancel,
  submitLabel,
  loading,
}: {
  onCancel: () => void
  submitLabel: string
  loading?: boolean
}) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <AdminButton type="submit" variant="primary" disabled={loading}>
        {loading ? 'Đang lưu...' : submitLabel}
      </AdminButton>
      <AdminButton onClick={onCancel}>Hủy</AdminButton>
    </div>
  )
}

export function useAdminFormSubmit(onSubmit: () => Promise<void>, onSuccess?: () => void) {
  return async (e: FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit()
      onSuccess?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Thao tác thất bại')
    }
  }
}
