import { Link } from 'react-router-dom'
import { businessInfo, getLegalPageByPath, transactionPolicy } from '@/shared/config/legal'
import { LegalFieldView } from '../components/LegalFieldView'
import { PendingPolicyNote, PolicyPageLayout, PolicySection } from '../components/PolicyPageLayout'

const meta = getLegalPageByPath('/dieu-khoan-giao-dich')!

export function TransactionTermsPage() {
  return (
    <PolicyPageLayout meta={meta}>
      <PolicySection title="1. Phạm vi">
        <p>
          Điều khoản này áp dụng khi bạn sử dụng website Trang Trần Hair để xem dịch vụ/sản phẩm, tạo tài khoản, gửi yêu
          cầu đặt lịch hoặc đặt mua sản phẩm.
        </p>
        <LegalFieldView label="Người vận hành" field={businessInfo.ownerName} />
        <LegalFieldView label="Tên hộ kinh doanh đăng ký" field={businessInfo.registeredBusinessName} />
        <LegalFieldView label="Hoạt động trên website" field={businessInfo.businessActivitySummary} />
        <LegalFieldView label="Website" field={businessInfo.websiteUrl} />
      </PolicySection>

      <PolicySection title="2. Tài khoản">
        <p>
          Bạn chịu trách nhiệm bảo mật thông tin đăng nhập. Thông tin hồ sơ phải chính xác để salon liên hệ. Hành vi gian
          lận, spam hoặc xâm phạm hệ thống có thể dẫn tới hạn chế truy cập.
        </p>
      </PolicySection>

      <PolicySection title="3. Đặt lịch dịch vụ">
        <p className="font-medium text-ink">{transactionPolicy.appointmentIsRequestOnly.value}</p>
        <p>
          Sau khi gửi form, trạng thái ban đầu là yêu cầu chờ xử lý. Nhân viên mới xác nhận, từ chối hoặc điều chỉnh lịch
          qua quy trình nội bộ. Bạn nên giữ máy để salon gọi/nhắn theo số đã cung cấp.
        </p>
        <PendingPolicyNote topic="Quy định hủy / đổi lịch sau khi đã xác nhận" />
        <LegalFieldView label="Hủy / đổi lịch dịch vụ" field={transactionPolicy.serviceCancelConditions} />
      </PolicySection>

      <PolicySection title="4. Mua sản phẩm trên website">
        <p>
          Giá sản phẩm hiển thị trên catalog/shop. Tổng thanh toán (gồm phí giao nếu có) được tính tại bước đặt hàng. Bạn
          có trách nhiệm kiểm tra tên, số lượng, địa chỉ và phương thức trước khi gửi đơn.
        </p>
        <LegalFieldView label="Phương thức nhận hàng" field={transactionPolicy.fulfillmentMethods} />
        <LegalFieldView label="Hủy đơn sản phẩm" field={transactionPolicy.productCancelConditions} />
        <p>
          Chi tiết giao hàng / đổi trả:{' '}
          <Link to="/chinh-sach-giao-hang-doi-tra" className="text-gold-700 hover:text-gold-300">
            Chính sách giao hàng, đổi trả & hoàn tiền
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="5. Thanh toán">
        <LegalFieldView label="Phương thức" field={transactionPolicy.acceptedPaymentMethods} />
        <LegalFieldView label="Xác minh" field={transactionPolicy.paymentVerificationMethod} />
        <p>
          Xem thêm{' '}
          <Link to="/chinh-sach-thanh-toan" className="text-gold-700 hover:text-gold-300">
            Chính sách thanh toán
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="6. Trách nhiệm các bên">
        <p>
          Salon cung cấp thông tin dịch vụ/sản phẩm trung thực theo khả năng vận hành; xác nhận lịch và đơn theo quy trình
          nhân viên. Khách cung cấp thông tin liên hệ chính xác và thanh toán đúng số tiền / nội dung khi chọn chuyển khoản.
        </p>
        <PendingPolicyNote topic="Giới hạn trách nhiệm / bồi thường cụ thể" />
      </PolicySection>

      <PolicySection title="7. Khiếu nại và tranh chấp">
        <p>
          Ưu tiên giải quyết qua kênh trên trang{' '}
          <Link to="/lien-he-khieu-nai" className="text-gold-700 hover:text-gold-300">
            Liên hệ & khiếu nại
          </Link>
          . Pháp luật Việt Nam áp dụng đối với giao dịch phát sinh từ website này, trừ khi quy định bắt buộc khác.
        </p>
        <LegalFieldView label="Kênh khiếu nại" field={businessInfo.complaintContact} />
      </PolicySection>

      <PolicySection title="8. Dữ liệu cá nhân">
        <p>
          Việc xử lý dữ liệu được mô tả tại{' '}
          <Link to="/chinh-sach-bao-mat" className="text-gold-700 hover:text-gold-300">
            Chính sách bảo mật
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyPageLayout>
  )
}
