import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/AuthProvider'
import { PageLayout } from '@/shared/components/PageLayout'
import { GoogleSignInButton } from '@/shared/components/GoogleSignInButton'
import { RegistrationPrivacyDisclosure } from './components/RegistrationPrivacyDisclosure'
import { AuthDivider, AuthForm } from './LoginPage'

const ACK_HINT = 'Vui lòng xác nhận đã đọc thông báo bảo mật trước khi đăng ký.'

export function RegisterPage() {
  const { isConfigured, register, user } = useAuth()
  const [noticeAcknowledged, setNoticeAcknowledged] = useState(false)

  if (user) return <Navigate to="/account" replace />

  if (!isConfigured) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <p className="text-ink-subtle">Firebase chưa cấu hình.</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-md px-6 py-16">
        <RegistrationPrivacyDisclosure
          acknowledged={noticeAcknowledged}
          onAcknowledgedChange={setNoticeAcknowledged}
        />

        <AuthForm
          title="Đăng ký"
          subtitle="Tạo tài khoản để tích điểm và theo dõi đơn hàng."
          showProfileFields
          submitDisabled={!noticeAcknowledged}
          submitDisabledHint={ACK_HINT}
          onSubmit={(email, password, name, phone) => register(email, password, name!, phone!)}
          footer={
            <p className="text-sm text-ink-subtle">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-gold-500 hover:underline">
                Đăng nhập
              </Link>
            </p>
          }
        />

        <AuthDivider />

        <p className="mb-4 text-center text-xs text-ink-subtle">
          Đăng ký bằng Google dùng chung thông báo bảo mật phía trên. Bạn có thể bổ sung số điện thoại sau tại trang Tài
          khoản.
        </p>
        <GoogleSignInButton disabled={!noticeAcknowledged} disabledHint={ACK_HINT} />
      </div>
    </PageLayout>
  )
}
