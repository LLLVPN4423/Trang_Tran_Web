import { Navigate } from 'react-router-dom'

/** Giữ route cũ — nội dung điểm nằm trong tab Tài khoản */
export function LoyaltyPage() {
  return <Navigate to="/account?tab=points" replace />
}
