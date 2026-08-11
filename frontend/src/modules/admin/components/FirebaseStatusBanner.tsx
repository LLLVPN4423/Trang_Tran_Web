import { useEffect, useState } from 'react'
import { apiClient } from '@/shared/api/client'

interface HealthPayload {
  persistence?: {
    mode?: string
    detail?: string
  }
  firebase?: {
    configuredProjectId?: string
    credentialsFound?: boolean
  }
}

export function FirebaseStatusBanner() {
  const [health, setHealth] = useState<HealthPayload | null>(null)

  useEffect(() => {
    apiClient
      .get<HealthPayload>('/api/health')
      .then(({ data }) => setHealth(data))
      .catch(() => setHealth(null))
  }, [])

  if (!health?.persistence) return null

  if (health.persistence.mode === 'firestore') return null

  return (
    <div className="mb-6 rounded-sm border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
      <p className="font-medium">⚠ Dữ liệu đang lưu tạm (RAM) — chưa kết nối Firestore</p>
      <p className="mt-1 text-amber-200/80">
        {health.persistence.detail ?? 'Kiểm tra .env và firebase-service-account.json.'} Chạy{' '}
        <code className="text-amber-100">npm run check:firebase</code> rồi restart API. Xem{' '}
        <code className="text-amber-100">FIREBASE_SETUP.md</code>.
      </p>
      {health.firebase && !health.firebase.credentialsFound && (
        <p className="mt-2 text-amber-200/80">Thiếu file firebase-service-account.json ở thư mục gốc repo.</p>
      )}
    </div>
  )
}
