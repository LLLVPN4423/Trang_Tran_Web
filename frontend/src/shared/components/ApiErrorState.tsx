interface Props {
  message?: string
  onRetry?: () => void
}

export function ApiErrorState({ message, onRetry }: Props) {
  return (
    <div className="rounded-sm border border-red-900/50 bg-red-950/20 px-6 py-8 text-center">
      <p className="text-sm text-red-300/90">
        {message ?? 'Không thể tải dữ liệu. Vui lòng thử lại.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 text-xs uppercase tracking-widest text-zinc-400 underline-offset-4 hover:underline"
        >
          Thử lại
        </button>
      )}
    </div>
  )
}
