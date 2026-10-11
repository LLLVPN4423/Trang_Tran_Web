import { useState } from 'react'
import { seedAdminData } from '@/shared/api/endpoints'
import { SalonAdminGrantPanel } from './SalonAdminGrantPanel'

export function AdminToolsPanel() {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [ack, setAck] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const canRun = confirmText === 'SEED' && ack && !busy

  const runSeed = async () => {
    if (!canRun) return
    setBusy(true)
    setResult(null)
    try {
      const res = await seedAdminData(true)
      setResult(res.message)
      setOpen(false)
      setConfirmText('')
      setAck(false)
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Seed thất bại')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">Platform Admin</p>
        <h2 className="mt-2 font-serif text-2xl text-zinc-100">Công cụ kỹ thuật</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Chỉ quản trị hệ thống. Salon Admin không thấy mục này.
        </p>
      </div>

      <SalonAdminGrantPanel />

      <div className="rounded-sm border border-zinc-800 bg-zinc-900/30 p-4">
        <h3 className="text-sm font-medium text-zinc-200">Ghi đè dữ liệu seed</h3>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Tạo lại dịch vụ/sản phẩm/khuyến mãi mẫu từ seed. Không dùng trên production khi tiệm đã có
          bảng giá thật.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 text-xs uppercase tracking-widest text-zinc-500 hover:text-amber-400"
        >
          Mở xác nhận re-seed…
        </button>
      </div>

      {result && (
        <p className="rounded-sm border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
          {result}
        </p>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng"
            className="absolute inset-0 bg-black/75"
            onClick={() => !busy && setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-sm border border-zinc-700 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="font-serif text-xl text-zinc-100">Xác nhận Force Re-seed</h3>
            <p className="mt-3 text-sm text-zinc-400">
              Thao tác này có thể ghi đè dữ liệu catalog mẫu. Gõ <strong className="text-amber-200">SEED</strong>{' '}
              để tiếp tục.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-4 w-full border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
              placeholder="SEED"
              autoComplete="off"
            />
            <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                className="mt-1"
              />
              Tôi hiểu rủi ro và chỉ chạy khi cần thiết.
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpen(false)}
                className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!canRun}
                onClick={() => void runSeed()}
                className="btn-gold px-4 py-2 text-xs uppercase tracking-widest disabled:opacity-40"
              >
                {busy ? 'Đang chạy…' : 'Chạy seed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
