import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import { fetchLoyaltyHistory, fetchLoyaltyRules, fetchLoyaltySummary } from '@/shared/api/endpoints'
import type { LoyaltySummaryResponse, LoyaltyTransactionResponse } from '@/shared/api/types'
import { formatVnd } from '@/shared/api/types'
import { PageLayout } from '@/shared/components/PageLayout'
import { LoadingState } from '@/shared/components/LoadingState'

export function LoyaltyPage() {
  const { user, isLoading } = useAuth()
  const [summary, setSummary] = useState<LoyaltySummaryResponse | null>(null)
  const [rules, setRules] = useState<LoyaltySummaryResponse | null>(null)
  const [history, setHistory] = useState<LoyaltyTransactionResponse[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, r, h] = await Promise.all([
        fetchLoyaltySummary(),
        fetchLoyaltyRules(),
        fetchLoyaltyHistory(),
      ])
      setSummary(s)
      setRules(r)
      setHistory(h)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) load()
  }, [user, load])

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingState />
      </PageLayout>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">Loyalty</p>
        <h1 className="mt-3 font-serif text-3xl text-zinc-100 sm:text-4xl">Tích điểm thành viên</h1>

        {loading && <div className="mt-10"><LoadingState label="Đang tải..." /></div>}

        {!loading && summary && rules && (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="border border-gold/20 bg-gold/5 p-6">
                <p className="text-xs uppercase tracking-widest text-gold-muted">Số điểm hiện tại</p>
                <p className="mt-3 font-serif text-5xl text-gold">{summary.points}</p>
              </div>
              <div className="border border-zinc-800 p-6">
                <p className="text-xs uppercase tracking-widest text-zinc-600">Tổng chi tiêu</p>
                <p className="mt-3 font-serif text-3xl text-zinc-200">{formatVnd(summary.totalSpent)}</p>
              </div>
            </div>

            <div className="mt-10 rounded-sm border border-zinc-800 p-6 text-sm text-zinc-400">
              <h2 className="mb-4 font-serif text-xl text-zinc-200">Quy tắc tích điểm</h2>
              <ul className="space-y-2">
                <li>• Tích {rules.pointsPerTenThousandVnd} điểm / 10.000đ khi thanh toán thành công</li>
                <li>• Đổi {rules.redeemRatePoints} điểm = {formatVnd(rules.redeemRateValueVnd)} giảm giá tại checkout</li>
                <li>• Chỉ áp dụng khi đăng nhập tài khoản</li>
              </ul>
            </div>

            <div className="mt-10">
              <h2 className="mb-4 font-serif text-2xl text-zinc-200">Lịch sử điểm</h2>
              {history.length === 0 ? (
                <p className="text-zinc-500">Chưa có giao dịch điểm.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between border-b border-zinc-900 py-3 text-sm">
                      <div>
                        <p className="text-zinc-300">{tx.description}</p>
                        <p className="text-xs text-zinc-600">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <span className={tx.points >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                        {tx.points >= 0 ? '+' : ''}{tx.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  )
}
