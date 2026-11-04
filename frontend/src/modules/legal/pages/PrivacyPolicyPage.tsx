import { Link } from 'react-router-dom'
import {
  businessInfo,
  getLegalPageByPath,
  getPrivacyNoticeVersion,
  privacyConfig,
} from '@/shared/config/legal'
import { LegalFieldView } from '../components/LegalFieldView'
import { PendingPolicyNote, PolicyPageLayout, PolicySection } from '../components/PolicyPageLayout'

const meta = getLegalPageByPath('/chinh-sach-bao-mat')!

export function PrivacyPolicyPage() {
  return (
    <PolicyPageLayout meta={meta}>
      <PolicySection title="1. Phạm vi và chủ thể">
        <p>
          Chính sách này mô tả cách website Trang Trần Hair thu thập và xử lý dữ liệu cá nhân khi bạn đăng ký tài
          khoản, đặt lịch, đặt hàng hoặc liên hệ qua các tính năng trên site.
        </p>
        <LegalFieldView label="Người vận hành (theo chủ sở hữu)" field={businessInfo.ownerName} />
        <LegalFieldView label="Chủ thể / hộ kinh doanh công bố" field={privacyConfig.dataControllerDisplayName} />
        <LegalFieldView label="Tên HKD đăng ký" field={businessInfo.registeredBusinessName} />
        <LegalFieldView label="Địa chỉ đăng ký" field={businessInfo.registeredAddress} />
        <p className="text-sm text-ink-subtle">
          Tên chủ sở hữu đã cung cấp không được suy ra là tên hộ kinh doanh đăng ký cho đến khi có giấy tờ xác nhận.
        </p>
      </PolicySection>

      <PolicySection title="2. Dữ liệu được thu thập (theo luồng thực tế)">
        <ul className="list-disc space-y-2 pl-5">
          <li>Tài khoản: email, mật khẩu (Firebase Authentication) hoặc thông tin từ Google OAuth; hồ sơ tên, số điện thoại đồng bộ qua API.</li>
          <li>Yêu cầu đặt lịch: họ tên, số điện thoại, dịch vụ quan tâm, thời gian mong muốn, ghi chú.</li>
          <li>Đơn hàng sản phẩm: họ tên, điện thoại, email (nếu có), địa chỉ giao (nếu chọn giao hàng), sản phẩm, mã thanh toán.</li>
          <li>Mã truy cập đơn/lịch (capability token) để xem chi tiết khi chưa đăng nhập.</li>
          <li>Điểm tích lũy / lịch sử đơn gắn với tài khoản (nếu dùng chương trình thành viên).</li>
        </ul>
        <p>
          Website <strong className="font-medium text-ink">không</strong> tự động ghi nhận thanh toán đã thành công chỉ vì bạn quét VietQR — trạng thái Paid do nhân viên cập nhật sau khi đối chiếu sao kê.
        </p>
      </PolicySection>

      <PolicySection title="3. Mục đích xử lý">
        <ul className="list-disc space-y-2 pl-5">
          <li>Xác thực và quản lý tài khoản khách.</li>
          <li>Tiếp nhận và xử lý yêu cầu đặt lịch dịch vụ.</li>
          <li>Tạo và theo dõi đơn hàng, hướng dẫn chuyển khoản, giao/nhận sản phẩm.</li>
          <li>Liên hệ xác nhận lịch, đơn hàng hoặc hỗ trợ khi có sự cố.</li>
          <li>Vận hành admin nội bộ và bảo mật hệ thống.</li>
        </ul>
        <p>
          Việc đăng nhập Google chỉ chứng minh bạn ủy quyền cho Firebase/Google xác thực danh tính với website —{' '}
          <strong className="font-medium text-ink">không</strong> đồng nghĩa bạn đã đồng ý mọi mục đích xử lý khác của salon ngoài những gì cần thiết để cung cấp dịch vụ đã yêu cầu.
        </p>
        <PendingPolicyNote topic="Marketing / quảng cáo qua SMS, Zalo, email" />
      </PolicySection>

      <PolicySection title="4. Cơ sở pháp lý">
        <p>
          Các hoạt động xử lý gắn với thực hiện giao dịch, yêu cầu đặt lịch và vận hành tài khoản thường dựa trên nhu cầu thực hiện hợp đồng / yêu cầu của bạn trước khi giao kết và vận hành hệ thống an toàn. Ánh xạ chi tiết theo Luật Bảo vệ dữ liệu cá nhân và nghị định hướng dẫn cần luật sư rà soát.
        </p>
        <LegalFieldView label="Ghi chú rà soát pháp lý" field={privacyConfig.legalBasesReview} />
      </PolicySection>

      <PolicySection title="5. Bên nhận / hạ tầng kỹ thuật đã xác minh trong mã nguồn">
        <ul className="list-disc space-y-2 pl-5">
          <li>{privacyConfig.processorFirebaseAuth.value}</li>
          <li>{privacyConfig.processorFirestore.value}</li>
          <li>{privacyConfig.processorCloudRun.value}</li>
          <li>{privacyConfig.processorCloudflarePages.value}</li>
          <li>{privacyConfig.processorVietQrImage.value}</li>
          <li>{privacyConfig.processorSePay.value}</li>
        </ul>
        <LegalFieldView label="Nhà cung cấp khác (nếu có)" field={privacyConfig.otherProcessors} />
        <p className="text-sm text-ink-subtle">
          Việc liệt kê hạ tầng kỹ thuật không thay thế hợp đồng xử lý dữ liệu (nếu pháp luật yêu cầu) — tình trạng DPA cần xác nhận riêng.
        </p>
      </PolicySection>

      <PolicySection title="6. Lưu trữ, bảo mật và thời hạn">
        <p>
          Dữ liệu nghiệp vụ được lưu qua API trên hạ tầng Google Cloud / Firestore. Biện pháp bảo mật kỹ thuật (xác thực JWT, phân quyền admin, giới hạn tốc độ ghi công khai) được áp dụng ở mức ứng dụng; không mô tả chi tiết kiểm soát nội bộ nhạy cảm tại đây.
        </p>
        <LegalFieldView label="Thời hạn lưu đơn hàng" field={privacyConfig.retentionOrders} />
        <LegalFieldView label="Thời hạn lưu lịch hẹn" field={privacyConfig.retentionAppointments} />
        <LegalFieldView label="Thời hạn lưu tài khoản" field={privacyConfig.retentionAccounts} />
      </PolicySection>

      <PolicySection title="7. Quyền của bạn">
        <p>
          Tùy điều kiện pháp luật áp dụng, bạn có thể có quyền được biết, truy cập, chỉnh sửa, xóa, hạn chế xử lý, rút sự đồng ý (khi xử lý dựa trên đồng ý), và khiếu nại. Một số dữ liệu giao dịch có thể phải giữ lại theo nghĩa vụ pháp lý khác — yêu cầu xóa không được hiểu là xóa ngay lập tức mọi hồ sơ đơn hàng.
        </p>
        <p>
          Nếu đã có tài khoản, bạn có thể xem nhóm dữ liệu đang xử lý và gửi yêu cầu quyền riêng tư tại{' '}
          <Link to="/account?tab=privacy" className="text-gold-700 hover:text-gold-300">
            Tài khoản → Quyền riêng tư
          </Link>
          . Yêu cầu xóa / hạn chế được nhân viên tiếp nhận và đánh giá — hệ thống không tự xóa đơn hàng hay thanh toán.
        </p>
        <LegalFieldView label="Kênh yêu cầu dữ liệu cá nhân (bổ sung)" field={businessInfo.privacyRequestContact} />
        <p>
          Bạn cũng có thể dùng trang{' '}
          <Link to="/lien-he-khieu-nai" className="text-gold-700 hover:text-gold-300">
            Liên hệ & khiếu nại
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="8. Cập nhật chính sách">
        <p>
          Phiên bản hiện tại:{' '}
          <strong className="font-medium text-ink">{getPrivacyNoticeVersion()}</strong>. Khi nội dung thay đổi đáng kể,
          website sẽ cập nhật ngày trên trang này; quy trình nhắc acknowledgement cho khách đã đăng ký sẽ được bổ sung
          ở giai đoạn lưu hồ sơ (không bắt lại mỗi lần đăng nhập).
        </p>
        <p className="text-sm text-ink-subtle">
          Trang chính sách không tự chứng minh website đã tuân thủ đầy đủ mọi nghĩa vụ pháp lý.
        </p>
      </PolicySection>
    </PolicyPageLayout>
  )
}
