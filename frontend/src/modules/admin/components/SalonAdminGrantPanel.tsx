import { useCallback, useEffect, useState } from 'react'
import {
  fetchSalonAdmins,
  grantSalonAdmin,
  revokeSalonAdmin,
  type SalonAdminEntry,
} from '@/shared/api/endpoints'

export function SalonAdminGrantPanel() {
  const [list, setList] = useState<SalonAdminEntry[]>([])
  const [uid, setUid] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      setList(await fetchSalonAdmins())
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không tải danh sách')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const onGrant = async () => {
    const id = uid.trim()
    if (!id) return
    setMsg(null)
    setErr(null)
    try {
      await grantSalonAdmin(id)
      setMsg(`Đã cấp Salon Admin cho ${id}. Nhắc họ đăng xuất/đăng nhập lại.`)
      setUid('')
      await reload()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Cấp quyền thất bại')
    }
  }

  const onRevoke = async (userId: string) => {
    if (!confirm(`Thu hồi Salon Admin của ${userId}?`)) return
    setMsg(null)
    setErr(null)
    try {
      await revokeSalonAdmin(userId)
      setMsg(`Đã thu hồi ${userId}`)
      await reload()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Thu hồi thất bại')
    }
  }

  return (
    <div className="rounded-sm border border-zinc-800 bg-zinc-900/30 p-4">
      <h3 className="text-sm font-medium text-zinc-200">Cấp quyền Salon Admin</h3>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        Platform Admin cấp quyền vận hành (lịch, hóa đơn, đơn shop) — không sửa giá/web. Lấy UID tại Firebase
        Console → Authentication. Không cấp Platform Admin qua đây.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          placeholder="Firebase UID nhân viên / chị Trang"
          className="min-w-0 flex-1 border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
        <button type="button" onClick={() => void onGrant()} className="btn-gold shrink-0 px-4 py-2 text-xs uppercase tracking-widest">
          Cấp Salon Admin
        </button>
      </div>

      {msg && <p className="mt-3 text-sm text-gold">{msg}</p>}
      {err && <p className="mt-3 text-sm text-red-400/90">{err}</p>}

      <div className="mt-6">
        <p className="text-xs uppercase tracking-widest text-zinc-600">Đang có quyền Salon</p>
        {loading && <p className="mt-2 text-sm text-zinc-500">Đang tải…</p>}
        {!loading && list.length === 0 && (
          <p className="mt-2 text-sm text-zinc-500">Chưa có UID (env + Firestore).</p>
        )}
        <ul className="mt-2 space-y-2">
          {list.map((row) => (
            <li
              key={row.userId}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900/80 py-2 text-sm"
            >
              <span className="font-mono text-xs text-zinc-300">{row.userId}</span>
              <span className="text-xs text-zinc-600">
                {row.fromEnvironment && 'env '}
                {row.fromFirestore && 'Firestore'}
              </span>
              {!row.fromEnvironment && (
                <button
                  type="button"
                  onClick={() => void onRevoke(row.userId)}
                  className="text-xs text-zinc-500 hover:text-red-400"
                >
                  Thu hồi
                </button>
              )}
            </li>
          ))}
        </ul>
        {list.some((r) => r.fromEnvironment) && (
          <p className="mt-2 text-xs text-zinc-600">UID trong env (.env / Cloud Run) — sửa env để gỡ, không thu hồi tại đây.</p>
        )}
      </div>
    </div>
  )
}
