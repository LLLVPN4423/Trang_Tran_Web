# Trang Tran Hair Salon — Website

Website chính thức cho **Trang Tran Hair Salon** (Sóc Trăng): portfolio salon, bảng giá dịch vụ, mua sản phẩm Moroccanoil, thanh toán SePay, tài khoản khách hàng, tích điểm, và Admin Portal quản trị toàn diện.

**Repository:** https://github.com/LLLVPN4423/Trang_Tran_Web.git

---

## Trạng thái dự án

| Hạng mục | Trạng thái |
|----------|------------|
| Portfolio (Hero, Artist, Lookbook, ảnh salon) | ✅ Hoàn thiện |
| Gallery tóc mẫu (cấu hình qua `content.ts`) | ✅ Sẵn sàng — thêm ảnh + mục `GALLERY_ITEMS` |
| Bảng giá 26 dịch vụ + sản phẩm | ✅ Hoàn thiện |
| Giỏ hàng & checkout SePay | ✅ Hoàn thiện |
| Đăng ký / đăng nhập khách | ✅ Hoàn thiện (email + Google — cần Firebase) |
| Tích điểm & mã khuyến mãi | ✅ Hoàn thiện |
| Form đặt lịch → database + theo dõi tại `/account` | ✅ Hoàn thiện |
| Admin Portal (CRUD dịch vụ/SP/KM, đơn, lịch, khách) | ✅ Hoàn thiện |
| Trừ tồn kho + tích điểm khi đơn Paid | ✅ Hoàn thiện |
| Responsive mobile / desktop | ✅ Hoàn thiện |
| Production deploy (Docker) | ✅ Sẵn sàng (cần cấu hình Firebase + domain) |
| Email/SMS thông báo tự động | ⏳ Chưa có — salon gọi điện / Zalo |
| Đặt lịch chọn giờ slot tự động | ⏳ Chưa có — admin gọi xác nhận giờ |

**Kết luận:** Website **đã sẵn sàng vận hành** cho salon (xem portfolio, bán dịch vụ/sản phẩm, duyệt lịch, quản trị). Cần **cấu hình Firebase + SePay production** trước khi go-live thật.

---

## Công nghệ

| Layer | Stack |
|-------|-------|
| Frontend | React 19, Vite 6, TypeScript, Tailwind CSS 4, Zustand, Firebase Auth |
| Backend | .NET 10, Clean Architecture, Firebase JWT, Firestore |
| Thanh toán | SePay webhook (chuyển khoản) |
| Deploy | Docker Compose, nginx |

---

## Khởi chạy nhanh (Local)

```bash
# 1. Cài dependencies
npm run install:all

# 2. Copy env
copy .env.example .env
# Chỉnh FIREBASE_* và VITE_* trong .env

# 3. Chạy API + Frontend
npm run dev:all
```

| Dịch vụ | URL |
|---------|-----|
| Website | http://localhost:5173 |
| API | http://localhost:5000 |
| Admin | http://localhost:5173/admin |
| Đăng ký | http://localhost:5173/register |

**Seed dữ liệu mẫu (dev, không cần Firebase):**

```bash
curl -X POST "http://localhost:5000/api/seed/dev?force=true"
```

---

## Tài liệu

| File | Dành cho |
|------|----------|
| [OPERATIONS_GUIDE.md](./OPERATIONS_GUIDE.md) | Chủ salon / vận hành hàng ngày |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Developer — cấu trúc code, API, môi trường |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Cấu hình Firebase (Auth Google, Firestore, Storage, Admin) |
| [HUONG_DAN_VAN_HANH.md](./HUONG_DAN_VAN_HANH.md) | **Checklist việc bạn cần làm + vận hành salon hàng ngày** |
| [.env.example](./.env.example) | Biến môi trường mẫu |
| [.env.production.example](./.env.production.example) | Deploy production |

---

## Cấu trúc thư mục

```
TrangTranHair_Web/
├── backend/          # .NET API
├── frontend/         # React SPA
├── docker-compose.yml
├── docker-compose.prod.yml
├── OPERATIONS_GUIDE.md
├── DEVELOPMENT.md
└── README.md
```

---

## Liên hệ salon

- **Điện thoại:** 0986 586 058
- **Địa chỉ:** 18-19LK2 KDC Tuấn Lan, Hùng Vương, TP. Sóc Trăng
