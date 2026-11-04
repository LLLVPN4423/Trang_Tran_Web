import { Link } from 'react-router-dom'
import { businessInfo, getLegalPageByPath, transactionPolicy } from '@/shared/config/legal'
import { LegalFieldView } from '../components/LegalFieldView'
import { PendingPolicyNote, PolicyPageLayout, PolicySection } from '../components/PolicyPageLayout'

const meta = getLegalPageByPath('/chinh-sach-thanh-toan')!

export function PaymentPolicyPage() {
  return (
    <PolicyPageLayout meta={meta}>
      <PolicySection title="1. Phương thức được hỗ trợ">
        <LegalFieldView label="Phương thức" field={transactionPolicy.acceptedPaymentMethods} />
        <p>
          SePay (nếu còn trong hệ thống kỹ thuật) <strong className="font-medium text-ink">không</strong> phải kênh xác
          minh thanh toán đang vận hành cho khách.
        </p>
      </PolicySection>

      <PolicySection title="2. Thanh toán VietQR / chuyển khoản">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Đặt hàng và chọn chuyển khoản ngân hàng.</li>
          <li>Hệ thống tạo mã nội dung chuyển khoản (PaymentCode) và số tiền trên đơn.</li>
          <li>Quét VietQR hoặc chuyển khoản thủ công đúng số tiền và đúng nội dung.</li>
          <li>Đơn ở trạng thái chờ thanh toán (Pending) cho đến khi nhân viên xác nhận.</li>
        </ol>
        <p>
          Bạn nên đối chiếu lại: ngân hàng thụ hưởng, số tài khoản, tên chủ tài khoản, số tiền và nội dung trước khi xác
          nhận trên app ngân hàng.
        </p>
      </PolicySection>

      <PolicySection title="3. Xác minh thủ công">
        <LegalFieldView label="Cách xác minh" field={transactionPolicy.paymentVerificationMethod} />
        <p>
          Trạng thái Paid trên website phản ánh việc nhân viên đã ghi nhận khớp sao kê — không phải xác nhận tức thời từ
          ngân hàng qua website.
        </p>
      </PolicySection>

      <PolicySection title="4. Sự cố chuyển khoản">
        <PendingPolicyNote topic="Sai nội dung / thiếu tiền / thừa tiền / chuyển trùng" />
        <LegalFieldView label="Hướng xử lý sự cố" field={transactionPolicy.misTransferHandling} />
        <p>
          Nếu đơn lâu chưa chuyển Paid sau khi đã chuyển khoản, hãy giữ biên lai và liên hệ kèm mã đơn / PaymentCode.
        </p>
        <LegalFieldView label="Liên hệ hỗ trợ thanh toán" field={businessInfo.supportPhone} />
        <LegalFieldView label="Điện thoại chính thức" field={businessInfo.officialPhone} />
      </PolicySection>

      <PolicySection title="5. Hoàn tiền liên quan thanh toán">
        <LegalFieldView label="Hoàn tiền sản phẩm" field={transactionPolicy.productRefundConditions} />
        <p>
          Chi tiết đổi trả:{' '}
          <Link to="/chinh-sach-giao-hang-doi-tra" className="text-gold-700 hover:text-gold-300">
            Chính sách giao hàng, đổi trả & hoàn tiền
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="6. Khiếu nại">
        <p>
          <Link to="/lien-he-khieu-nai" className="text-gold-700 hover:text-gold-300">
            Gửi khiếu nại / hỗ trợ
          </Link>
        </p>
      </PolicySection>
    </PolicyPageLayout>
  )
}
