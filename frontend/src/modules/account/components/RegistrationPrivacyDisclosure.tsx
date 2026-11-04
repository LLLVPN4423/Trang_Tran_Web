import { Link } from 'react-router-dom'
import { getPrivacyNoticeVersion, showLegalDraftDiagnostics } from '@/shared/config/legal'

interface Props {
  acknowledged: boolean
  onAcknowledgedChange: (value: boolean) => void
}

/**
 * Phase 1C — registration privacy notice (acknowledgement ≠ consent ≠ marketing).
 * Client-side gate only; durable audit recording is Phase 1F.
 */
export function RegistrationPrivacyDisclosure({ acknowledged, onAcknowledgedChange }: Props) {
  const version = getPrivacyNoticeVersion()
  const draftUi = showLegalDraftDiagnostics()

  return (
    <div className="mb-8 space-y-4 border border-edge/80 bg-section/40 px-4 py-5 sm:px-5">
      <div>
        <p className="label-caps text-ink-subtle">Thông báo bảo mật</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Khi tạo tài khoản, salon xử lý họ tên, số điện thoại và email để quản lý hồ sơ, đơn hàng, yêu cầu đặt lịch và
          liên hệ hỗ trợ. Google chỉ dùng để xác thực đăng nhập — không thay thế thông báo bảo mật của salon.
        </p>
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
          <Link
            to="/chinh-sach-bao-mat"
            className="min-h-11 inline-flex items-center text-gold-700 underline-offset-2 transition hover:text-gold-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          >
            Chính sách bảo mật
          </Link>
          <span className="text-edge-strong" aria-hidden="true">
            ·
          </span>
          <Link
            to="/dieu-khoan-giao-dich"
            className="min-h-11 inline-flex items-center text-gold-700 underline-offset-2 transition hover:text-gold-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          >
            Điều khoản giao dịch
          </Link>
        </p>
        <p className="mt-2 text-xs text-ink-subtle">Phiên bản thông báo: {version}</p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-muted">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-gold-500"
          checked={acknowledged}
          onChange={(e) => onAcknowledgedChange(e.target.checked)}
          aria-describedby="privacy-ack-help"
        />
        <span>
          Tôi xác nhận đã đọc thông báo bảo mật và điều khoản giao dịch nêu trên.
          <span className="mt-1 block text-xs text-ink-subtle" id="privacy-ack-help">
            Đây là xác nhận đã nhận thông tin — <strong className="font-medium text-ink-muted">không</strong> phải đồng
            ý (consent) cho mọi mục đích xử lý, và không phải đồng ý nhận marketing.
          </span>
        </span>
      </label>

      <p className="text-xs leading-relaxed text-ink-subtle">
        Hiện chưa yêu cầu đồng ý nhận tin marketing khi đăng ký. Nếu có sau này, sẽ là lựa chọn riêng, không bắt buộc
        để tạo tài khoản.
      </p>

      {draftUi && (
        <p className="font-mono text-[10px] uppercase tracking-wider text-warning/90">
          DEV: acknowledgement is UI gate only — not a durable audit record (Phase 1F)
        </p>
      )}
    </div>
  )
}
