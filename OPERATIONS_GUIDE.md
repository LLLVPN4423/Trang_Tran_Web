# Hướng dẫn vận hành — Trang Tran Hair Salon

Tài liệu dành cho **chủ salon / nhân viên vận hành** — hướng dẫn sử dụng website, quản trị dữ liệu, xử lý đơn hàng & lịch hẹn hàng ngày.

> Tài liệu kỹ thuật cho developer: xem [DEVELOPMENT.md](./DEVELOPMENT.md)  
> Tổng quan dự án: xem [README.md](./README.md)

---

## Mục lục

1. [Tổng quan website](#1-tổng-quan-website)
2. [Hướng dẫn khách hàng (User)](#2-hướng-dẫn-khách-hàng-user)
3. [Tài khoản & tích điểm](#3-tài-khoản--tích-điểm)
4. [Hướng dẫn Admin Portal](#4-hướng-dẫn-admin-portal)
5. [Phân quyền Admin](#5-phân-quyền-admin)
6. [Database (Firestore)](#6-database-firestore)
7. [Quản lý hình ảnh](#7-quản-lý-hình-ảnh)
8. [Thanh toán SePay](#8-thanh-toán-sepay)
9. [Quy trình Git](#9-quy-trình-git)
10. [Checklist vận hành hàng ngày](#10-checklist-vận-hành-hàng-ngày)

---

## 1. Tổng quan website

### Website đã hoàn thiện chưa?

**Có — website đã sẵn sàng vận hành** cho salon Trang Tran Hair với đầy đủ chức năng cốt lõi:

| Chức năng | Trạng thái |
|-----------|------------|
| Giới thiệu salon (ảnh thật) | ✅ |
| Bảng giá 26 dịch vụ | ✅ |
| Bán sản phẩm Moroccanoil | ✅ |
| Thanh toán chuyển khoản SePay | ✅ |
| Đăng ký / đăng nhập khách | ✅ |
| Tích điểm & mã giảm giá | ✅ |
| Đặt lịch online | ✅ |
| Admin quản trị toàn bộ | ✅ |
| Giao diện mobile | ✅ |

**Chưa có (có thể bổ sung sau):** gửi email/SMS tự động, trừ tồn kho tự động, form tạo dịch vụ mới trong Admin (hiện dùng seed + Firestore).

### Bản đồ trang

| URL | Mô tả | Sidebar |
|-----|-------|---------|
| `/` | Trang chủ Portfolio | Không |
| `/catalog` | Bảng giá | Có |
| `/booking` | Giỏ hàng & thanh toán | Có |
| `/login` | Đăng nhập | Có |
| `/register` | Đăng ký | Có |
| `/account` | Tài khoản & đơn hàng | Có |
| `/account/loyalty` | Điểm tích lũy | Có |
| `/admin` | Quản trị | Sidebar Admin |

**Menu sidebar (mobile: nút ☰ góc trái):** Trang chủ · Bảng giá · Giỏ hàng · Tài khoản · Tích điểm · Admin Portal (nếu có quyền).

---

## 2. Hướng dẫn khách hàng (User)

### 2.1. Xem Portfolio (`/`)

Trang chủ gồm:

1. **Hero** — ảnh salon (`/images/hero/Hero.jpg`)
2. **Artist** — giới thiệu Mr. Trang Trần + ảnh
3. **Lookbook / Salon Tour** — 11 ảnh không gian salon
4. **Catalog preview** — xem nhanh giá, link sang bảng giá đầy đủ
5. **Đặt lịch** — form gửi yêu cầu lên hệ thống (xem 2.2)

**Liên hệ:** 0986 586 058 · Facebook · Instagram · Threads · TikTok (link cuối trang).

### 2.2. Đặt lịch (form Portfolio)

1. Cuộn xuống section **Đặt lịch** hoặc mục **Booking** trên trang chủ.
2. Điền **Họ tên, SĐT, dịch vụ quan tâm, ghi chú**.
3. Nhấn **Gửi yêu cầu đặt lịch**.
4. Hệ thống lưu vào database → Admin duyệt tại `/admin/appointments`.
5. Salon liên hệ khách trong **24 giờ** để xác nhận.

> Nếu đã đăng nhập, form tự điền tên/SĐT từ hồ sơ.

### 2.3. Mua dịch vụ / sản phẩm

1. Vào **Bảng giá** (`/catalog`).
2. Chọn loại dịch vụ hoặc sản phẩm Moroccanoil.
3. Với dịch vụ có giá theo size tóc → chọn **S / M / L / XL**.
4. **Thêm vào giỏ** → icon giỏ hàng trên header hiện số lượng.
5. Vào **Giỏ hàng & Thanh toán** (`/booking`).

### 2.4. Thanh toán (`/booking`)

1. Kiểm tra giỏ hàng, chỉnh số lượng.
2. Nhập thông tin khách (tự điền nếu đã đăng nhập).
3. *(Tuỳ chọn)* Nhập mã KM → **Áp dụng** (vd: `WELCOME10`, `SALON50K`).
4. *(Nếu đã đăng nhập)* Kéo thanh trượt **đổi điểm** tích lũy.
5. **Xác nhận & Thanh toán SePay** → hiện mã CK và số tiền.
6. Khách chuyển khoản đúng **nội dung CK** → hệ thống tự xác nhận (vài phút).
7. Màn hình **Thanh toán thành công** + thông báo điểm tích lũy.

---

## 3. Tài khoản & tích điểm

### 3.1. Đăng ký

1. Sidebar → **Đăng nhập / Đăng ký** hoặc `/register`.
2. Nhập Họ tên, SĐT, Email, Mật khẩu (≥ 6 ký tự).
3. Sau đăng ký → vào `/account`.

> **Yêu cầu:** Firebase Authentication phải được bật (Email/Password). Xem [DEVELOPMENT.md](./DEVELOPMENT.md).

### 3.2. Đăng nhập

- URL: `/login`
- Admin cũng đăng nhập tại `/login`, sau đó vào `/admin` từ sidebar.

### 3.3. Quy tắc tích điểm

| Quy tắc | Giá trị |
|---------|---------|
| Tích điểm | **1 điểm** / 10.000đ thanh toán thành công |
| Đổi điểm | **100 điểm** = giảm **10.000đ** tại checkout |
| Điều kiện | Phải **đăng nhập** trước khi thanh toán |

Xem số dư: `/account/loyalty` hoặc thẻ trên trang Tài khoản.

### 3.4. Mã khuyến mãi mặc định (sau seed)

| Mã | Giảm | Điều kiện |
|----|------|-----------|
| `WELCOME10` | 10% | Đơn từ 200.000đ |
| `SALON50K` | 50.000đ | Đơn từ 500.000đ |

Quản lý thêm/sửa tại `/admin/promotions`.

---

## 4. Hướng dẫn Admin Portal

**URL:** `/admin` — yêu cầu tài khoản có quyền Admin.

### 4.1. Đăng nhập Admin

1. Vào `/login` → đăng nhập email/password đã được cấp claim `admin: true`.
2. Mở `/admin` (sidebar Admin Portal).
3. Nếu thấy "Không có quyền Admin" → xem [mục 5](#5-phân-quyền-admin).

### 4.2. Tổng quan (`/admin`)

Dashboard liên kết nhanh tới các module quản trị.

### 4.3. Đơn hàng (`/admin/orders`)

| Thao tác | Cách làm |
|----------|----------|
| Xem tất cả đơn | Mở trang, lọc theo trạng thái |
| Lọc theo SĐT | Nhập SĐT → Lọc |
| Xác nhận thủ công | Nút **Paid** (khi SePay chưa webhook) |
| Hủy đơn | Nút **Hủy** |

**Trạng thái:** `Pending` (chờ CK) → `Paid` (đã thanh toán) → hoặc `Cancelled`.

### 4.4. Lịch hẹn (`/admin/appointments`)

| Thao tác | Cách làm |
|----------|----------|
| Xem yêu cầu mới | Lọc **Chờ duyệt** |
| Xác nhận lịch | **Xác nhận** → gọi khách |
| Từ chối | **Từ chối** |
| Hoàn tất | Sau khi khách đến salon → **Đánh dấu hoàn tất** |

### 4.5. Dịch vụ (`/admin/services`)

- Xem 26 dịch vụ, **Bật/Tắt** hiển thị trên catalog.
- **Xóa** dịch vụ không còn dùng.
- **Seed dữ liệu** / **Force Re-seed** (Admin header) — nạp lại bảng giá từ code.

> Sửa giá hàng loạt: chỉnh file `SalonSeedData.cs` (developer) rồi Force Re-seed.

### 4.6. Sản phẩm (`/admin/products`)

- Xem sản phẩm Moroccanoil.
- Nút **Ảnh** → upload file lên Firebase Storage **hoặc** dán URL.
- **Bật/Tắt**, **Xóa** sản phẩm.

### 4.7. Khuyến mãi (`/admin/promotions`)

- Xem danh sách mã KM.
- **Tạo mẫu** → chỉnh code/giá trị trên Firestore hoặc qua API.
- **Bật/Tắt**, **Xóa** mã.

### 4.8. Khách hàng (`/admin/customers`)

- Xem hồ sơ khách đã đăng ký.
- **Điều chỉnh điểm** thủ công (cộng/trừ) khi cần.

### 4.9. Force Re-seed

Nút **Force Re-seed** trên header Admin → ghi đè dịch vụ, sản phẩm, khuyến mãi bằng dữ liệu mặc định trong code.

⚠️ **Cẩn thận trên production** — sẽ reset dữ liệu catalog. Ảnh sản phẩm (`imageUrl`) có thể cần upload lại.

---

## 5. Phân quyền Admin

### Cơ chế

- **Khách hàng:** Firebase Auth thường (email/password), không cần claim đặc biệt.
- **Admin:** cùng Firebase Auth + custom claim **`admin: true`** trong JWT.

### Cấp quyền Admin (một lần)

1. Tải **Service Account JSON** từ Firebase Console.
2. Tạo file `set-admin.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const uid = 'PASTE_FIREBASE_USER_UID_HERE';

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => { console.log('OK'); process.exit(0); })
  .catch(console.error);
```

3. Chạy: `node set-admin.js`
4. User **đăng xuất và đăng nhập lại**.

**Lấy UID:** Firebase Console → Authentication → Users.

### Thu hồi quyền

```javascript
admin.auth().setCustomUserClaims(uid, { admin: false });
```

---

## 6. Database (Firestore)

### Truy cập

1. https://console.firebase.google.com/
2. Project → **Firestore Database**

### Collections

| Collection | Nội dung |
|------------|----------|
| `services` | Bảng giá dịch vụ |
| `products` | Sản phẩm + `imageUrl` |
| `orders` | Đơn checkout |
| `appointments` | Lịch hẹn từ form Portfolio |
| `customers` | Hồ sơ khách + `loyaltyPoints` |
| `promotions` | Mã khuyến mãi |
| `loyaltyTransactions` | Lịch sử cộng/trừ điểm |

**Tài khoản login** nằm ở **Authentication**, không phải Firestore.

### Dev local (không Firebase)

Backend dùng bộ nhớ tạm — **mất data khi restart**. Seed lại:

```
POST http://localhost:5000/api/seed/dev?force=true
```

---

## 7. Quản lý hình ảnh

### 7.1. Ảnh tĩnh (Hero, Artist, Salon Tour)

**Thư mục:** `frontend/public/images/`

```
public/images/
├── hero/Hero.jpg
├── about/The Artist.jpg
├── salon-tour/Salon Tour1.jpg …
└── gallery/          ← ảnh tóc mẫu (tương lai)
```

- Đường dẫn web: `/images/hero/Hero.jpg`
- Sau khi thêm ảnh → cập nhật `content.ts` (developer) → commit Git → deploy.

### 7.2. Ảnh sản phẩm (động)

**Cách 1 — Admin Portal (khuyến nghị):**

1. `/admin/products` → nút **Ảnh**
2. Chọn file → upload Firebase Storage (cần `VITE_FIREBASE_STORAGE_BUCKET`)
3. Hoặc dán URL → **Lưu URL**

**Cách 2 — Firestore Console:**

Sửa field `imageUrl` trong document `products/{id}`.

**Cách 3 — Firebase Storage Console:**

Upload thủ công → copy URL → dán vào Admin hoặc Firestore.

---

## 8. Thanh toán SePay

### Cấu hình hiển thị (`.env`)

```env
VITE_SEPAY_BANK_NAME=Vietcombank
VITE_SEPAY_ACCOUNT_NUMBER=0123456789
VITE_SEPAY_ACCOUNT_NAME=TRANG TRAN HAIR SALON
SEPAY_WEBHOOK_SECRET=your-secret
```

### Luồng

1. Khách tạo đơn → nhận mã `DHxxxxxxxx` (nội dung CK).
2. Khách chuyển khoản **đúng số tiền + đúng nội dung**.
3. SePay gửi webhook → backend đánh dấu `Paid` → tích điểm tự động.

### Xử lý sự cố

| Vấn đề | Xử lý |
|--------|-------|
| Khách CK sai nội dung | Tìm đơn theo SĐT tại `/admin/orders` → **Paid** thủ công |
| Webhook không chạy | Kiểm tra `SEPAY_WEBHOOK_SECRET` và URL webhook trên SePay |
| Số tiền không khớp | SePay từ chối — liên hệ khách chuyển bổ sung |

---

## 9. Quy trình Git

**Repo:** https://github.com/LLLVPN4423/Trang_Tran_Web.git

```bash
cd D:\download\TrangTranHair_Web
git status
git add .
git commit -m "mo ta thay doi"
git push origin main
```

**Windows (lỗi ownership):**

```bash
git -c safe.directory=D:/download/TrangTranHair_Web status
git -c safe.directory=D:/download/TrangTranHair_Web push origin main
```

**Không commit:** `.env`, `firebase-service-account.json`

---

## 10. Checklist vận hành hàng ngày

### Buổi sáng

- [ ] Mở `/admin/appointments` → duyệt lịch hẹn mới (Pending)
- [ ] Mở `/admin/orders` → kiểm tra đơn Pending chưa thanh toán

### Khi có đơn mới

- [ ] Xác nhận SePay đã webhook (trạng thái Paid)
- [ ] Nếu chưa Paid sau 30 phút → gọi khách nhắc CK

### Hàng tuần

- [ ] Kiểm tra tồn kho sản phẩm trên `/admin/products`
- [ ] Review mã KM sắp hết hạn tại `/admin/promotions`

### Khi cần đổi giá

- [ ] Liên hệ developer chỉnh `SalonSeedData.cs` → Force Re-seed
- [ ] Hoặc sửa trực tiếp trên Firestore (cẩn thận kiểu số)

---

## Phụ lục — Lệnh nhanh

| Mục đích | Lệnh / URL |
|----------|------------|
| Chạy website local | `npm run dev:all` |
| Seed dữ liệu dev | `POST /api/seed/dev?force=true` |
| Trang admin | http://localhost:5173/admin |
| Firebase Console | https://console.firebase.google.com/ |
| Docker production | `npm run docker:prod` |

---

*Phiên bản 2.0 — Cập nhật sau tích hợp loyalty, admin portal, appointments, upload ảnh sản phẩm.*
