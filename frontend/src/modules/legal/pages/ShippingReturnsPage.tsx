import { Link } from 'react-router-dom'
import { businessInfo, getLegalPageByPath, transactionPolicy } from '@/shared/config/legal'
import { LegalFieldView } from '../components/LegalFieldView'
import { PendingPolicyNote, PolicyPageLayout, PolicySection } from '../components/PolicyPageLayout'

const meta = getLegalPageByPath('/chinh-sach-giao-hang-doi-tra')!

export function ShippingReturnsPage() {
  return (
    <PolicyPageLayout meta={meta}>
      <PolicySection title="A. Sản phẩm vật lý">
        <h3 className="font-display text-xl text-ink">A1. Giao nhận</h3>
        <LegalFieldView label="Phương thức" field={transactionPolicy.fulfillmentMethods} />
        <p>
          Phí và khu vực giao hàng (nếu chọn Delivery) được hệ thống tính và hiển thị tại bước thanh toán. Mức phí chính
          thức công bố trong chính sách pháp lý chỉ được điền sau khi chủ sở hữu xác nhận — trang này không bịa bảng giá.
        </p>
        <LegalFieldView label="Phí giao hàng (văn bản chính sách)" field={transactionPolicy.shippingFeesPolicyText} />
        <LegalFieldView label="Thời gian giao dự kiến" field={transactionPolicy.deliveryTimeEstimates} />
        <LegalFieldView label="Địa điểm nhận tại salon" field={businessInfo.operatingAddress} />

        <h3 className="mt-6 font-display text-xl text-ink">A2. Đổi trả · hoàn tiền · hủy đơn</h3>
        <LegalFieldView label="Đổi / trả sản phẩm" field={transactionPolicy.productReturnConditions} />
        <LegalFieldView label="Hoàn tiền sản phẩm" field={transactionPolicy.productRefundConditions} />
        <LegalFieldView label="Hủy đơn" field={transactionPolicy.productCancelConditions} />
        <PendingPolicyNote topic="Hàng hư hỏng / sai sản phẩm khi nhận" />
      </PolicySection>

      <PolicySection title="B. Dịch vụ salon">
        <p>
          Dịch vụ được thực hiện tại địa điểm salon (sau khi lịch được nhân viên xác nhận). Địa chỉ đăng ký / địa điểm
          hoạt động công bố tại{' '}
          <Link to="/thong-tin-ho-kinh-doanh" className="text-gold-700 hover:text-gold-300">
            Thông tin hộ kinh doanh
          </Link>
          .
        </p>
        <p className="font-medium text-ink">{transactionPolicy.appointmentIsRequestOnly.value}</p>
        <LegalFieldView label="Hủy / đổi lịch" field={transactionPolicy.serviceCancelConditions} />
        <LegalFieldView label="Hoàn tiền / bồi hoàn dịch vụ" field={transactionPolicy.serviceRefundConditions} />
        <LegalFieldView label="Đến muộn" field={transactionPolicy.lateArrivalPolicy} />
      </PolicySection>

      <PolicySection title="C. Liên hệ">
        <p>
          <Link to="/lien-he-khieu-nai" className="text-gold-700 hover:text-gold-300">
            Liên hệ & khiếu nại
          </Link>
          {' · '}
          <Link to="/chinh-sach-thanh-toan" className="text-gold-700 hover:text-gold-300">
            Chính sách thanh toán
          </Link>
        </p>
      </PolicySection>
    </PolicyPageLayout>
  )
}
