import { Link } from 'react-router-dom'
import { businessInfo, getLegalPageByPath } from '@/shared/config/legal'
import { LegalFieldView } from '../components/LegalFieldView'
import { PolicyPageLayout, PolicySection } from '../components/PolicyPageLayout'

const meta = getLegalPageByPath('/thong-tin-ho-kinh-doanh')!

export function BusinessInfoPage() {
  return (
    <PolicyPageLayout meta={meta}>
      <PolicySection title="1. Người vận hành website">
        <LegalFieldView label="Họ tên chủ sở hữu (đã xác nhận)" field={businessInfo.ownerName} />
        <p className="text-sm text-ink-subtle">
          Đây là tên chủ sở hữu cung cấp cho dự án website. Không suy đoán đây là tên hộ kinh doanh trên giấy đăng ký.
        </p>
      </PolicySection>

      <PolicySection title="2. Thông tin hộ kinh doanh đăng ký">
        <LegalFieldView label="Tên hộ kinh doanh" field={businessInfo.registeredBusinessName} />
        <LegalFieldView label="Mã số thuế" field={businessInfo.taxCode} />
        <LegalFieldView label="Số đăng ký" field={businessInfo.registrationNumber} />
        <LegalFieldView label="Ngày đăng ký" field={businessInfo.registrationDate} />
        <LegalFieldView label="Địa chỉ đăng ký" field={businessInfo.registeredAddress} />
      </PolicySection>

      <PolicySection title="3. Địa điểm hoạt động & liên hệ">
        <LegalFieldView label="Địa điểm salon / hoạt động" field={businessInfo.operatingAddress} />
        <LegalFieldView label="Điện thoại chính thức" field={businessInfo.officialPhone} />
        <LegalFieldView label="Email" field={businessInfo.businessEmail} />
        <LegalFieldView label="Giờ hỗ trợ / làm việc công bố" field={businessInfo.supportHours} />
        <LegalFieldView label="Website" field={businessInfo.websiteUrl} />
      </PolicySection>

      <PolicySection title="4. Ngành nghề / hoạt động trên website">
        <LegalFieldView label="Mô tả" field={businessInfo.businessActivitySummary} />
        <p className="text-sm text-ink-subtle">
          Mô tả trên dựa trên chức năng website hiện có; ngành nghề đăng ký chính thức cần khớp giấy HKD khi chủ sở hữu
          bổ sung.
        </p>
      </PolicySection>

      <PolicySection title="5. Tài liệu liên quan">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link to="/chinh-sach-bao-mat" className="text-gold-700 hover:text-gold-300">
              Chính sách bảo mật
            </Link>
          </li>
          <li>
            <Link to="/dieu-khoan-giao-dich" className="text-gold-700 hover:text-gold-300">
              Điều khoản giao dịch
            </Link>
          </li>
          <li>
            <Link to="/lien-he-khieu-nai" className="text-gold-700 hover:text-gold-300">
              Liên hệ & khiếu nại
            </Link>
          </li>
        </ul>
      </PolicySection>
    </PolicyPageLayout>
  )
}
