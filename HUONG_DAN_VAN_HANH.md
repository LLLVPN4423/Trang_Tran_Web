# Hướng dẫn vận hành salon — Trang Tran Hair

Tài liệu này liệt kê **việc bạn phải làm** (cấu hình bên ngoài) và **cách vận hành hàng ngày** trên website.

> Chi tiết kỹ thuật Firebase: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)  
> Hướng dẫn dev/deploy: [DEVELOPMENT.md](./DEVELOPMENT.md) · [OPERATIONS_GUIDE.md](./OPERATIONS_GUIDE.md)

---

## BẮT ĐẦU TẠI ĐÂY — 7 việc bạn làm, dev không làm thay được

Làm **đúng thứ tự**. Mỗi bước xong thì tick ✓.

| Bước | Bạn làm gì | Kết quả mong đợi |
|------|------------|------------------|
| **1** | Tạo Firebase project, bật Auth (Email + Google), Firestore, tải `firebase-service-account.json` vào **thư mục gốc repo** | File JSON + project ID |
| **2** | Copy `.env.example` → `.env`, điền project ID + **`FIREBASE_ADMIN_UIDS=UID admin`** + API key | Chạy `npm run check:firebase` → không lỗi |
| **3** | Chạy `npm run install:all` rồi `npm run dev:all` | Web http://localhost:5173 + API http://localhost:5000 |
| **4** | Thêm UID vào `FIREBASE_ADMIN_UIDS` → `node scripts/set-admin.js YOUR_UID` → **đăng xuất + đăng nhập lại** | Vào được `/admin` |
| **5** | Admin → **Force Re-seed** (hoặc `POST /api/seed?force=true` kèm token admin) | `/catalog` hiện ~26 dịch vụ + 6 sản phẩm |
| **6** | Up ảnh/video SP lên **Google Drive** → chia sẻ **"Bất kỳ ai có link"** → Admin → Sản phẩm → dán link Drive (tối đa 7 ảnh + 1 video) | Ảnh hiện trên catalog & trang chi tiết SP |
| **7** | Điền `VITE_SEPAY_*` = **số TK ngân hàng thật** của salon (webhook SePay làm sau khi có domain HTTPS) | Khách thấy đúng STK khi checkout |

**Ảnh tóc mẫu (tùy chọn):** copy vào `frontend/public/images/gallery/` → mở `frontend/src/modules/portfolio/data/content.ts` → thêm mục vào `GALLERY_ITEMS` → section **Tóc mẫu** tự hiện trên trang chủ.

**Khi cần dev hỗ trợ**, gửi: URL lỗi + ảnh chụp màn hình + bước đang làm (1–7). **Không gửi** mật khẩu, file service account, webhook secret.

---

## Phần A — Việc BẠN cần làm (một lần, trước go-live)

Làm **theo thứ tự**. Tick ✓ khi xong.

### A1. Firebase (bắt buộc — gói Spark miễn phí đủ)

| # | Việc làm | Cách làm cụ thể |
|---|----------|-----------------|
| 1 | Tạo project Firebase | [console.firebase.google.com](https://console.firebase.google.com/) → Add project |
| 2 | Bật **Authentication** | Email/Password + **Google** → Save |
| 3 | Thêm **Authorized domains** | `localhost` + domain production (vd: `trangtranhair.vn`) |
| 4 | Tạo **Firestore** | Build → Firestore → region `asia-southeast1` |
| 5 | Tải **Service Account JSON** | Project settings → Service accounts → Generate key → đặt tên `firebase-service-account.json` ở **thư mục gốc repo** |
| 6 | Tạo file **`.env`** | Copy từ `.env.example`, điền các dòng `VITE_FIREBASE_*` và `FIREBASE_*` |
| 7 | **Không cần Firebase Storage** | Ảnh SP dùng **Google Drive** (miễn phí) — xem A5 |

**Kiểm tra:** `npm run dev:all` → `/login` hiện form + nút Google (không báo "Firebase chưa cấu hình").

---

### A2. Tài khoản Admin (bạn) — bảo mật 2 lớp

| # | Việc làm | Cách làm cụ thể |
|---|----------|-----------------|
| 1 | Thêm UID vào **allowlist** | Trong `.env`: `FIREBASE_ADMIN_UIDS=UID_CUA_BAN` (chỉ UID trong danh sách này mới có thể admin) |
| 2 | Đăng ký / đăng nhập web | `/login` hoặc Google |
| 3 | Lấy **UID** | Firebase Console → Authentication → Users → copy UID (phải **trùng** UID đã ghi ở bước 1) |
| 4 | Cấp claim admin | `node scripts/set-admin.js YOUR_UID` — script **từ chối** nếu UID không nằm trong `FIREBASE_ADMIN_UIDS` |
| 5 | **Đăng xuất + đăng nhập lại** | Bắt buộc để JWT có claim `admin` |
| 6 | Vào `/admin` | Phải thấy dashboard + sidebar |

> **Khách đăng ký thường không bao giờ thành admin** — thiếu allowlist hoặc thiếu claim → API trả 403, UI hiện "Không có quyền Admin".
>
> Thu hồi quyền: `node scripts/revoke-admin.js UID` rồi xóa UID khỏi `FIREBASE_ADMIN_UIDS` nếu cần.

---

### A3. Dữ liệu salon (seed)

| # | Việc làm | Cách làm cụ thể |
|---|----------|-----------------|
| 1 | Seed lần đầu | Đăng nhập admin → `/admin` → nút **Force Re-seed** (hoặc `POST http://localhost:5000/api/seed?force=true` kèm token admin) |
| 2 | Dev local không Firebase | `POST http://localhost:5000/api/seed/dev?force=true` |
| 3 | Kiểm tra catalog | `/catalog` — thấy ~26 dịch vụ + 6 sản phẩm Moroccanoil |

⚠️ **Force Re-seed** ghi đè bảng giá về mặc định — chỉ dùng khi cần reset.

---

### A4. SePay / chuyển khoản (bắt buộc khi bán thật)

| # | Việc làm | Cách làm cụ thể |
|---|----------|-----------------|
| 1 | Mở tài khoản **SePay** / liên kết TK ngân hàng salon | Theo hướng dẫn SePay |
| 2 | Điền `.env` | `VITE_SEPAY_BANK_NAME`, `VITE_SEPAY_ACCOUNT_NUMBER`, `VITE_SEPAY_ACCOUNT_NAME` — **số TK thật** |
| 3 | Webhook secret | `SEPAY_WEBHOOK_SECRET=...` (SePay cung cấp) |
| 4 | Cấu hình webhook URL trên SePay | `https://DOMAIN-CUA-BAN/api/webhooks/sepay` |
| 5 | Test CK | Đặt hàng → CK đúng số tiền + nội dung = mã `DHxxxxxxxx` → đơn tự **Paid** |

**Nếu chưa có webhook:** Admin vào `/admin/orders` → bấm **Xác nhận đã thanh toán** thủ công (vẫn tích điểm + trừ tồn kho).

---

### A5. Ảnh & video sản phẩm — Google Drive (không cần trả phí Storage)

| # | Việc làm | Cách làm cụ thể |
|---|----------|-----------------|
| 1 | Chuẩn bị file | JPG/PNG (~4:5 cho ảnh), MP4 hoặc video trên Drive; tối đa **7 ảnh** + **1 video** / sản phẩm |
| 2 | Up lên Google Drive | Tạo thư mục riêng (vd: `TrangTranHair/Products`) trên Drive của salon |
| 3 | Chia sẻ từng file | Chuột phải → **Chia sẻ** → **Bất kỳ ai có đường liên kết** → **Sao chép liên kết** |
| 4 | Gắn vào Admin | `/admin/products` → **Sửa** → dán link vào **Gallery ảnh** (mỗi dòng 1 link) và **Video** (nếu có) → **Lưu** |
| 5 | Kiểm tra | Mở `/catalog` → bấm sản phẩm → gallery + video (nếu có) hiển thị đúng |

**Ví dụ link Drive (dán nguyên link chia sẻ):**
```
https://drive.google.com/file/d/1ABC...xyz/view?usp=sharing
```

Web tự chuyển link Drive sang dạng hiển thị được — **không cần deploy lại** mỗi lần thêm/đổi ảnh.

**Video:** dán link file video trên Drive (cùng cách chia sẻ) hoặc link YouTube. Để trống nếu không có video.

> **Dịch vụ (cắt tóc, nhuộm…):** cùng cách gắn ảnh Drive như sản phẩm — Admin → **Dịch vụ** → **Sửa** → Gallery + Video.

**Phương án dự phòng (ít dùng):** copy ảnh vào `frontend/public/images/products/` → URL `/images/products/ten-anh.jpg` — **cần deploy lại** khi thêm file mới. Xem mục **Quản lý ảnh sau deploy** bên dưới.

---

## Quản lý ảnh sau khi deploy — cái nào cần deploy lại?

Web có **3 loại ảnh**, cách cập nhật khác nhau:

| Loại | Ảnh ở đâu | Thêm / sửa / xóa thế nào | Cần deploy lại frontend? |
|------|-----------|---------------------------|---------------------------|
| **Sản phẩm** (Moroccanoil) | **Google Drive** — URL lưu trong **Firestore** (Admin → Sản phẩm) | Up Drive → chia sẻ link → Admin dán URL → Lưu | **Không** |
| **Sản phẩm** — file trong repo (dự phòng) | `frontend/public/images/products/` | Copy file JPG mới vào thư mục | **Có** — push code + build lại |
| **Sản phẩm** — link khác | Imgur, CDN, YouTube… | Admin → dán URL mới | **Không** |
| **Trang chủ** (hero, salon tour) | `frontend/public/images/` + `content.ts` | Đổi file hoặc sửa đường dẫn trong code | **Có** |
| **Gallery tóc mẫu** | `public/images/gallery/` + `GALLERY_ITEMS` trong `content.ts` | Thêm ảnh + sửa `content.ts` | **Có** |
| **Dịch vụ** | **Google Drive** — URL trong Firestore (Admin → Dịch vụ) | Up Drive → chia sẻ link → Admin dán URL | **Không** |

### Quy trình thực tế cho salon (khuyến nghị — Google Drive)

**Cách chính — Google Drive (miễn phí, không deploy khi đổi ảnh)**  
1. Up ảnh/video lên Drive (thư mục salon tự quản)  
2. Mỗi file: **Chia sẻ → Bất kỳ ai có link → Sao chép liên kết**  
3. Admin → **Sản phẩm** → **Gallery** (tối đa 7 dòng) + **Video** (1 link, tùy chọn) → **Lưu**  
4. Khách xem gallery trên trang chi tiết sản phẩm — **không cần build/deploy lại**

**Cách dự phòng — File trong project**  
1. Copy ảnh vào `frontend/public/images/products/`  
2. Deploy lại frontend (1 lần)  
3. Admin → URL `/images/products/ten-file.jpg`

**Giá, tồn kho, tên SP, bảng giá dịch vụ:** luôn sửa qua **Admin** → lưu Firestore → **không deploy**.

---

### A6. Deploy production (khi lên web thật)

| # | Việc làm | Cách làm cụ thể |
|---|----------|-----------------|
| 1 | Copy env | `.env.production.example` → `.env`, điền đủ |
| 2 | Domain + SSL | HTTPS bắt buộc (SePay webhook + Firebase authorized domain) |
| 3 | Chạy Docker | `npm run docker:prod` |
| 4 | Mount Firebase JSON | File service account cạnh docker-compose |
| 5 | Thêm domain Firebase | Authorized domains trên Firebase Console |

---

## Phần B — Vận hành hàng ngày (salon)

### Buổi sáng / mở cửa

1. Mở `/admin` — xem **Tổng quan**: đơn chờ, lịch chờ duyệt  
2. `/admin/appointments` — duyệt lịch hẹn qua đêm (**Xác nhận** / **Từ chối**)  
3. `/admin/orders` — kiểm tra đơn **Pending** (nhắc khách CK nếu quá 30 phút)

### Khi khách đặt hàng online

| Bước | Ai làm | Việc |
|------|--------|------|
| 1 | Khách | `/catalog` → thêm giỏ → `/booking` → điền SĐT → đặt hàng |
| 2 | Khách | CK theo hướng dẫn (đúng số tiền + mã `DH...`) |
| 3 | Hệ thống | SePay webhook → đơn **Paid** → tích điểm + trừ tồn SP |
| 3b | Admin (dự phòng) | `/admin/orders` → **Xác nhận đã thanh toán** nếu webhook chưa về |

### Khi khách gửi form đặt lịch (trang chủ)

1. Khách điền form **Đặt lịch** cuối trang chủ  
2. Admin `/admin/appointments` → **Xác nhận** → gọi khách hẹn giờ  
3. Sau khi khách đến → **Đánh dấu hoàn tất**

> Website **chưa có** chọn giờ/slot tự động — salon gọi điện xác nhận giờ.

### Cập nhật bảng giá / sản phẩm

| Mục | Admin path | Thao tác |
|-----|------------|----------|
| Dịch vụ | `/admin/services` | **+ Thêm** / **Sửa** giá, loại, thời gian, **ảnh Drive** |
| Sản phẩm | `/admin/products` | **+ Thêm** / **Sửa** giá, tồn kho, ảnh |
| Khuyến mãi | `/admin/promotions` | Tạo mã `WELCOME10`, `SALON50K`, v.v. |

### Khách hàng & tích điểm

- Khách **đăng ký / Google** → hoàn tất SĐT tại `/account`  
- Mua hàng **đã Paid** → tích điểm tự động  
- Admin điều chỉnh điểm: `/admin/customers` → **Điều chỉnh điểm**

---

## Phần C — Checklist trước mở thử 1 tuần

```
[ ] Firebase Auth + Firestore hoạt động
[ ] Admin UID đã cấp claim, vào được /admin
[ ] Seed dữ liệu xong, catalog hiển thị giá
[ ] Ảnh sản phẩm đã gắn (ít nhất SP bán chính)
[ ] VITE_SEPAY_* = TK ngân hàng thật
[ ] Test: khách đặt hàng → admin xác nhận Paid → điểm cộng
[ ] Test: form đặt lịch → admin xác nhận
[ ] Test: sửa giá dịch vụ trên admin → catalog cập nhật
[ ] (Production) Webhook SePay + HTTPS + domain Firebase
```

---

## Phần D — Xử lý sự cố nhanh

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|-------------|------------------------|------------|
| "Firebase chưa cấu hình" | Thiếu `.env` hoặc chưa restart dev | Điền `VITE_FIREBASE_*`, `npm run dev:all` lại |
| Không vào `/admin` | Chưa claim admin hoặc chưa login lại | Chạy `set-admin.js`, logout/login |
| Admin API **401** | Backend thiếu/sai `FIREBASE_PROJECT_ID` hoặc không khớp frontend | `.env`: `FIREBASE_PROJECT_ID` = cùng giá trị `VITE_FIREBASE_PROJECT_ID`, restart `npm run dev:all` |
| Admin API **403** | Token cũ hoặc chưa cấp admin | `node scripts/set-admin.js UID` → logout/login; cần `firebase-service-account.json` ở thư mục gốc repo |
| Admin API **404** | Backend chưa chạy hoặc sai `VITE_API_URL` | Chạy `npm run dev:all`, kiểm tra http://localhost:5000/api/health |
| Đơn không tự Paid | Webhook SePay chưa cấu hình / sai số tiền | Admin bấm Paid thủ công; kiểm tra webhook |
| Tích điểm = 0 | Khách chưa hoàn tất hồ sơ `/account` | Nhập SĐT tại Tài khoản |
| Ảnh SP không hiện | Drive chưa chia sẻ public hoặc sai link | Drive → **Bất kỳ ai có link**; dán đúng URL `drive.google.com/file/d/...` trong Admin |
| API 401/403 | Backend thiếu `firebase-service-account.json` | Tải JSON từ Firebase, đặt đúng path `.env` |

---

## Phần E — Việc CHƯA có trên web (cần làm thêm sau)

| Tính năng | Ghi chú |
|-----------|---------|
| Email / SMS tự động | Chưa tích hợp — salon gọi điện / nhắn Zalo thủ công |
| Đặt lịch chọn giờ slot | Form chỉ ghi nhận yêu cầu, admin gọi xác nhận |
| Firebase Storage upload | Tùy chọn trả phí — dùng ảnh tĩnh `/images/products/` là đủ |

**Gallery tóc mẫu:** đã có section trên trang chủ — chỉ cần thêm ảnh + cấu hình `GALLERY_ITEMS` (xem bước tùy chọn ở đầu tài liệu).

---

## Liên hệ hỗ trợ dev

Khi cần dev sửa tiếp, gửi kèm:

1. **URL** đang lỗi (vd: `/admin/orders`)  
2. **Ảnh chụp màn hình** hoặc thông báo lỗi  
3. **Bước đã làm** trong checklist A  
4. **Không gửi** mật khẩu, file `firebase-service-account.json`, webhook secret

---

*Cập nhật: checklist vận hành salon + tích hợp thanh toán / admin CRUD hoàn chỉnh.*
