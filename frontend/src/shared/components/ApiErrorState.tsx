interface Props {
  message?: string
  onRetry?: () => void
}

export function ApiErrorState({ message, onRetry }: Props) {
  return (
    <div className="rounded-sm border border-danger/30 bg-danger/10 px-6 py-8 text-center">
      <p className="text-sm text-danger/90">
        {message ?? 'Không thể tải dữ liệu. Vui lòng thử lại.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 text-xs uppercase tracking-widest text-ink-muted underline-offset-4 hover:underline"
        >
          Thử lại
        </button>
      )}
    </div>
  )
}
