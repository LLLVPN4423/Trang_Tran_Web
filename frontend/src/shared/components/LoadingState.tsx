export function LoadingState({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-gold" />
      <p className="mt-4 text-xs uppercase tracking-widest text-zinc-500">{label}</p>
    </div>
  )
}
