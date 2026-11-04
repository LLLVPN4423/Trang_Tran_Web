import { Link } from 'react-router-dom'
import { businessInfo, getLegalPageByPath, transactionPolicy } from '@/shared/config/legal'
import { LegalFieldView } from '../components/LegalFieldView'
import { PendingPolicyNote, PolicyPageLayout, PolicySection } from '../components/PolicyPageLayout'

const meta = getLegalPageByPath('/lien-he-khieu-nai')!

export function ContactComplaintsPage() {
  return (
    <PolicyPageLayout meta={meta}>
      <PolicySection title="1. Kênh liên hệ">
        <LegalFieldView label="Khiếu nại / hỗ trợ chính thức" field={businessInfo.complaintContact} />
        <LegalFieldView label="Điện thoại chính thức" field={businessInfo.officialPhone} />
        <LegalFieldView label="Điện thoại hỗ trợ" field={businessInfo.supportPhone} />
        <LegalFieldView label="Email" field={businessInfo.businessEmail} />
        <LegalFieldView label="Giờ hỗ trợ" field={businessInfo.supportHours} />
        <LegalFieldView label="Yêu cầu dữ liệu cá nhân" field={businessInfo.privacyRequestContact} />
        <p className="text-sm text-ink-subtle">
          Các kênh marketing (Facebook, Zalo công khai trên footer) có thể dùng để liên hệ nhanh nhưng không thay thế
          thông tin đăng ký hộ kinh doanh cho đến khi chủ sở hữu xác nhận kênh chính thức ở trên.
        </p>
      </PolicySection>

      <PolicySection title="2. Cách gửi khiếu nại (giai đoạn 1A)">
        <p>
          Trong Phase 1A, form khiếu nại có gắn mã đơn/lịch và quy trình admin sẽ được bổ sung ở giai đoạn sau. Hiện bạn
          có thể gửi yêu cầu qua kênh chính thức (khi đã công bố) với các thông tin:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Họ tên và số điện thoại đã dùng khi đặt lịch / đặt hàng.</li>
          <li>Mã đơn hàng hoặc mã lịch hẹn (nếu có).</li>
          <li>Mã nội dung chuyển khoản (PaymentCode) nếu liên quan thanh toán.</li>
          <li>Mô tả vấn đề và bằng chứng (ảnh biên lai, ảnh sản phẩm…).</li>
          <li>Phân loại: đơn hàng · lịch hẹn · thanh toán · sản phẩm · dịch vụ · dữ liệu cá nhân · khác.</li>
        </ul>
        <PendingPolicyNote topic="Form gửi khiếu nại trên website" />
      </PolicySection>

      <PolicySection title="3. Quy trình xử lý dự kiến">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Tiếp nhận và ghi nhận thông tin.</li>
          <li>Đối chiếu đơn / lịch / sao kê (nếu có).</li>
          <li>Phản hồi hướng xử lý.</li>
          <li>Cập nhật kết quả.</li>
        </ol>
        <LegalFieldView label="Thời gian phản hồi mục tiêu" field={transactionPolicy.complaintResponseTime} />
      </PolicySection>

      <PolicySection title="4. Tài liệu liên quan">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link to="/dieu-khoan-giao-dich" className="text-gold-700 hover:text-gold-300">
              Điều khoản giao dịch
            </Link>
          </li>
          <li>
            <Link to="/chinh-sach-thanh-toan" className="text-gold-700 hover:text-gold-300">
              Chính sách thanh toán
            </Link>
          </li>
          <li>
            <Link to="/chinh-sach-bao-mat" className="text-gold-700 hover:text-gold-300">
              Chính sách bảo mật
            </Link>
          </li>
          <li>
            <Link to="/thong-tin-ho-kinh-doanh" className="text-gold-700 hover:text-gold-300">
              Thông tin hộ kinh doanh
            </Link>
          </li>
        </ul>
      </PolicySection>
    </PolicyPageLayout>
  )
}
