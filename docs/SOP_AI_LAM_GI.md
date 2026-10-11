# Salon Trang Tran — Ai làm gì trên web (1 trang)

## Salon Admin (chị Trang / nhân viên được cấp quyền)

- **Lịch hẹn** — duyệt, hủy, hoàn tất.
- **Hóa đơn dịch vụ** — tạo sau khi làm tóc; khách mở link; đánh dấu đã thu → **tích điểm**.
- **Đơn shop** (Moroccanoil) — xử lý giao hàng / trạng thái.
- **Doanh thu** — **xem** trên màn hình (ngày/tuần/tháng); **không** tải file CSV.
- **Khách hàng** — tra cứu danh sách.

**Không được:** sửa bảng giá, sản phẩm, nội dung trang chủ, khuyến mãi, công cụ kỹ thuật.

## Platform Admin (quản trị web — dev)

- Mọi việc Salon Admin **cộng thêm:** sửa giá/dịch vụ, nội dung web, KM, **xuất CSV**, seed dữ liệu, **cấp / thu hồi Salon Admin** (`/admin/tools`).
- Giữ **GitHub, Cloud Run, Cloudflare**, billing Google Cloud.

## Ba bước hóa đơn dịch vụ (gợi ý)

1. Admin tạo **Hóa đơn DV** (gắn lịch nếu có).  
2. Khách mở link / xác nhận trên web (nếu dùng).  
3. Admin đánh dấu **Đã thanh toán** → điểm loyalty cộng tự động.

## Liên hệ kỹ thuật

Sự cố web / admin kẹt → Zalo quản trị web (Platform Admin).
