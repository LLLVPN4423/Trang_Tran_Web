# Trạng thái gói vận hành web & nhận job — cập nhật sau RBAC + CSV

Production: https://trangtran-hair.pages.dev  
Hai role duy nhất: **Platform Admin** (quản trị web) · **Salon Admin** (vận hành tiệm).

---

## 1. Checklist “Bắt buộc” — trạng thái thực tế

| Hạng mục | Trạng thái | Ghi chú |
|----------|------------|---------|
| **RBAC (API + menu)** | **Xong** | Policy `PlatformAdmin` / `Admin` (Salon); menu `platformOnly`; cấp Salon qua `/admin/tools`. |
| **Salon xem doanh thu, không CSV** | **Xong** | Salon vào `/admin/revenue`; nút **Xuất CSV** chỉ Platform. HĐ DV: CSV chỉ Platform. |
| **Tài liệu 1 trang + video 5–10 phút** | **Chưa** | Có `ADMIN_RBAC.md`, `HUONG_DAN_VAN_HANH.md` — cần PDF/Zalo + clip demo 2 role cho chị Trang. |
| **Quy trình HĐ DV + điểm (3 bước)** | **Một phần** | Có trên web; cần 1 tờ dán quầy + thử 1 ca thật. |
| **Handover kỹ thuật (1 trang)** | **Chưa gửi tiệm** | Bạn giữ GitHub/GCP/Platform; hướng dẫn cấp Salon: `/admin/tools` hoặc `set-admin.js salon`. |
| **SLA (Zalo / sự cố web)** | **Chưa chốt HĐ** | Đề xuất: phản hồi trong ngày; web down ưu tiên ≤ 4h. |

---

## 2. Checklist “Nên có”

| Hạng mục | Trạng thái |
|----------|------------|
| **Audit log admin** | Chưa |
| **Dashboard “Hôm nay”** | Một phần — chuông thông báo + Tổng quan (thu hôm nay, thẻ chờ) |
| **Báo cáo SEO/tháng (1 trang)** | Chưa quy trình cố định |
| **Portfolio ↔ web 2 chiều** | Web → portfolio có; portfolio Vercel → `/catalog`, `/appointment` cần chỉnh site Vercel |

---

## 3. Nên làm tiếp theo (ưu tiên)

### Tuần 1 — Chốt tin & thử việc

1. **Demo 15 phút** với chị Trang: Salon (lịch, HĐ, doanh thu xem); Platform (cấp UID Salon, CSV).
2. **Gửi 1 trang Zalo/PDF** — copy bảng “Ai làm gì” từ `ADMIN_RBAC.md`.
3. **Video ngắn** — Salon flow + cấp quyền.
4. **3 bước HĐ DV** — bullet trong group tiệm.
5. **Chốt SLA + 3tr/tháng** (tách nghiệm thu web cũ nếu còn).
6. **Handover 1 trang** — ai trả bill Google Cloud.

### Tuần 2

7. Nút portfolio → web chính.  
8. Mẫu **báo cáo tuần** (copy số admin → Doc → Zalo).  
9. (Tuỳ chọn code) Audit log hoặc màn “Hôm nay”.

---

## 4. Khi đã nhận job — đầu việc hàng tháng

**Salon Admin (tiệm):** duyệt lịch, đơn shop, tạo/cập nhật HĐ DV, xem doanh thu trên web, trả lời khách FB/Zalo, Maps/review.

**Platform Admin (bạn, ~3tr — phí server tiệm tự trả):**

| Chu kỳ | Việc |
|--------|------|
| **Ngày** | Kiểm tra web; bullet Zalo: doanh thu ngày, lịch/HĐ/đơn treo (từ admin). |
| **Tuần** | Báo cáo 1 trang; nhắc thiếu HĐ; **CSV kỳ** (Platform) nếu chị cần file. |
| **Tháng** | Báo cáo tháng + call ~15 phút; SEO checklist; cập nhật giá/nội dung (≤ vài lần). |
| **Sự cố** | Sửa lỗi, deploy; hỗ trợ admin kẹt. |
| **Không gồm** | Trực FB thay tiệm, cam kết top Google, cấp Platform qua web. |

---

## Phân quyền tóm tắt (2 role)

| | Salon Admin | Platform Admin |
|--|-------------|----------------|
| Lịch, đơn, HĐ DV, khách, xem doanh thu | Có | Có |
| Xuất CSV | Không | Có |
| Giá, dịch vụ, SP, site, KM, seed, cấp Salon Admin | Không | Có |

Chi tiết kỹ thuật: [ADMIN_RBAC.md](./ADMIN_RBAC.md)
