# Hướng dẫn vận hành — Trang Tran Hair Salon

Tài liệu này mô tả cách sử dụng website, quản trị dữ liệu, phân quyền Admin và quy trình làm việc với Git cho dự án **Trang Tran Hair Salon**.

---

## Mục lục

1. [Hướng dẫn chức năng người dùng (User)](#1-hướng-dẫn-chức-năng-người-dùng-user)
2. [Hướng dẫn chức năng Admin](#2-hướng-dẫn-chức-năng-admin)
3. [Phân quyền (Authorization)](#3-phân-quyền-authorization)
4. [Truy cập Database (Firestore)](#4-truy-cập-database-firestore)
5. [Quản lý hình ảnh (Asset Management)](#5-quản-lý-hình-ảnh-asset-management)
6. [Quy trình push lên Git](#6-quy-trình-push-lên-git)

---

## 1. Hướng dẫn chức năng người dùng (User)

Website gồm bốn trang chính:

| Đường dẫn | Mục đích |
|-----------|----------|
| `/` | Portfolio — giới thiệu salon |
| `/catalog` | Bảng giá dịch vụ & sản phẩm |
| `/booking` | Giỏ hàng & thanh toán |
| `/admin` | Cổng quản trị (chỉ Admin) |

### 1.1. Xem Portfolio (`/`)

Trang chủ trình bày salon qua các section cuộn dọc:

1. **Hero** — ảnh nền và slogan salon.
2. **Artist** — giới thiệu stylist Trang Trần.
3. **Lookbook** — album ảnh tóc mẫu.
4. **Catalog preview** — xem nhanh một số dịch vụ, có nút dẫn sang trang bảng giá đầy đủ.
5. **Booking / Contact** — form đặt lịch và thông tin liên hệ (điện thoại, địa chỉ, mạng xã hội).

**Liên hệ trực tiếp:** Khách có thể gọi **0986 586 058** hoặc nhắn qua Facebook / Instagram / Threads / TikTok (link hiển thị ở cuối trang).

> **Lưu ý:** Form “Gửi yêu cầu đặt lịch” trên trang Portfolio hiện chỉ là giao diện minh họa — dữ liệu **chưa được gửi lên server**. Khách nên gọi điện hoặc nhắn tin để xác nhận lịch. (Tính năng lưu lịch hẹn vào database sẽ được bổ sung trong phiên bản sau.)

### 1.2. Xem bảng giá (`/catalog`)

Luồng khách hàng:

1. Mở **Bảng giá** từ menu hoặc từ section Catalog trên trang chủ.
2. Dữ liệu được tải từ API `GET /api/services` và `GET /api/products`.
3. Lọc theo **loại dịch vụ** (Cắt, Uốn, Nhuộm, Phục hồi, v.v.) hoặc **sản phẩm retail**.
4. Với dịch vụ có giá theo size tóc, chọn **Size S / M / L** trước khi thêm vào giỏ.
5. Nhấn **Thêm vào giỏ** — giỏ hàng lưu trên trình duyệt (Zustand store).
6. Chuyển sang **Thanh toán** (`/booking`) khi đã chọn xong.

### 1.3. Đặt lịch & thanh toán (`/booking`)

Đây là luồng **mua dịch vụ / sản phẩm online** (khác với form đặt lịch trên Portfolio):

1. **Xem giỏ hàng** — danh sách item, số lượng, tổng tiền.
2. **Nhập thông tin khách** — Họ tên, SĐT, Email (tuỳ chọn), Ghi chú.
3. **Tạo đơn** — Frontend gọi `POST /api/orders`. Backend tính giá server-side và trả về:
   - Mã đơn (`Id`)
   - Mã thanh toán (`PaymentCode`) — dùng làm nội dung chuyển khoản
   - Tổng tiền (`TotalAmount`)
   - Trạng thái `Pending`
4. **Thanh toán SePay** — Màn hình hiển thị thông tin chuyển khoản (số TK, ngân hàng, nội dung CK). Cấu hình qua biến môi trường `VITE_SEPAY_*`.
5. **Xác nhận tự động** — Khi khách chuyển khoản đúng nội dung, SePay gửi webhook tới `POST /api/webhooks/sepay`. Backend cập nhật đơn sang `Paid`. Frontend tự poll `GET /api/orders/{id}` và hiển thị thông báo thành công.

**Khởi chạy local:**

```bash
npm run install:all
npm run dev:all
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:5000  

---

## 2. Hướng dẫn chức năng Admin

Truy cập: **http://localhost:5173/admin** (hoặc domain production + `/admin`).

### 2.1. Đăng nhập

1. Mở `/admin`.
2. Đăng nhập bằng **Email / Password** qua Firebase Authentication.
3. Hệ thống kiểm tra custom claim `admin: true` (JWT) và gọi `GET /api/health/admin` để xác nhận quyền.
4. Nếu chưa có quyền Admin, trang hiển thị thông báo “Không có quyền Admin” — xem [mục 3](#3-phân-quyền-authorization) để cấp quyền.

### 2.2. Quản lý dịch vụ & bảng giá

Tab **Dịch vụ** trong Admin Portal:

| Thao tác | Mô tả |
|----------|-------|
| Xem danh sách | Toàn bộ dịch vụ (kể cả đang ẩn) |
| Bật / Tắt | `isActive` — ẩn khỏi catalog công khai |
| Xóa | Xóa vĩnh viễn khỏi database |
| Seed dữ liệu | Nạp dữ liệu mẫu từ `SalonSeedData.cs` (26 dịch vụ) |
| Force Re-seed | Ghi đè toàn bộ dịch vụ & sản phẩm bằng dữ liệu seed |

API backend (yêu cầu JWT Admin):

- `GET /api/services` — xem
- `POST /api/services` — tạo mới
- `PUT /api/services/{id}` — cập nhật (giá, tên, category, v.v.)
- `DELETE /api/services/{id}` — xóa

### 2.3. Quản lý sản phẩm

Tab **Sản phẩm**:

- Bật/tắt hiển thị, xóa sản phẩm retail (Moroccanoil, v.v.).
- Chỉnh sửa `imageUrl` (URL ảnh — thường trỏ tới Firebase Storage hoặc CDN).

API: `GET/POST/PUT/DELETE /api/products`.

### 2.4. Xem đơn hàng

> **Trạng thái hiện tại:** Admin Portal **chưa có giao diện** danh sách đơn hàng.

Cách xem đơn hàng hiện tại:

1. **Firebase Console → Firestore** — collection `orders` (xem [mục 4](#4-truy-cập-database-firestore)).
2. **API trực tiếp** — `GET /api/orders/{id}` nếu biết mã đơn (không yêu cầu đăng nhập).

Trường quan trọng trong document `orders`:

| Trường | Ý nghĩa |
|--------|---------|
| `status` | `Pending` → chờ CK; `Paid` → đã thanh toán |
| `paymentCode` | Nội dung chuyển khoản |
| `totalAmount` | Tổng tiền (VND) |
| `customerName`, `customerPhone` | Thông tin khách |
| `items` | Chi tiết dịch vụ/sản phẩm |

### 2.5. Duyệt lịch hẹn

> **Trạng thái hiện tại:** Form đặt lịch trên Portfolio **chưa lưu** vào database. **Không có** màn hình duyệt lịch trong Admin.

Quy trình vận hành tạm thời:

1. Tiếp nhận yêu cầu qua **điện thoại / mạng xã hội**.
2. Ghi chép lịch bằng công cụ nội bộ (sổ, Google Calendar, v.v.).

Khi tính năng lịch hẹn được triển khai, dữ liệu sẽ lưu vào Firestore và có thể quản lý từ Admin Portal.

---

## 3. Phân quyền (Authorization)

### 3.1. Cơ chế hoạt động

Dự án dùng **Firebase Authentication** + **Custom Claims**:

1. Người dùng đăng nhập Admin Portal → Firebase cấp **ID Token (JWT)**.
2. Backend xác thực JWT qua `securetoken.google.com/{projectId}`.
3. Policy **Admin** yêu cầu claim: `"admin": "true"` (trong JWT payload).
4. Backend còn gọi Firebase Admin SDK để đọc `CustomClaims` từ user record (double-check).

File cấu hình: `backend/src/TrangTranHair.Api/Extensions/AuthenticationExtensions.cs`

```csharp
.AddPolicy("Admin", policy =>
    policy.RequireClaim("admin", "true"));
```

Frontend kiểm tra claim qua `AuthProvider` và endpoint `GET /api/health/admin`.

### 3.2. Cấp quyền Admin cho tài khoản

> **Lưu ý:** Dự án **không có** endpoint `POST /api/set-admin`. Việc cấp quyền thực hiện qua **Firebase Admin SDK** hoặc Firebase Console (Cloud Functions).

#### Cách 1 — Script Node.js (khuyến nghị)

1. Tải **Service Account JSON** từ Firebase Console → Project Settings → Service accounts → Generate new private key.
2. Đặt file tại `./firebase-service-account.json` (đã có trong `.gitignore`).
3. Tạo file tạm `set-admin.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Thay bằng UID hoặc email của tài khoản cần cấp quyền
const uid = 'FIREBASE_USER_UID_HERE';

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Đã cấp admin: true cho UID:', uid);
    process.exit(0);
  })
  .catch(console.error);
```

4. Chạy: `node set-admin.js`
5. **Quan trọng:** User phải **đăng xuất và đăng nhập lại** (hoặc refresh token) để JWT mới chứa claim `admin`.

**Lấy UID:** Firebase Console → Authentication → Users → cột **User UID**.

#### Cách 2 — Firebase CLI + Cloud Functions (production)

Triển khai Cloud Function callable chỉ super-admin mới gọi được, bên trong gọi `admin.auth().setCustomUserClaims(uid, { admin: true })`.

#### Cách 3 — Thu hồi quyền Admin

```javascript
admin.auth().setCustomUserClaims(uid, { admin: false });
// hoặc
admin.auth().setCustomUserClaims(uid, null);
```

### 3.3. Biến môi trường cần thiết

**Backend** (`.env` hoặc `appsettings`):

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
```

**Frontend** (`.env`):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

---

## 4. Truy cập Database (Firestore)

### 4.1. Đăng nhập Firebase Console

1. Truy cập https://console.firebase.google.com/
2. Chọn project **Trang Tran Hair** (đúng `FIREBASE_PROJECT_ID`).
3. Menu trái → **Build** → **Firestore Database**.

### 4.2. Collections trong dự án

| Collection | Nội dung |
|------------|----------|
| `services` | Dịch vụ salon (tên, giá, category, size, duration, isActive) |
| `products` | Sản phẩm retail (tên, giá, imageUrl, isActive) |
| `orders` | Đơn hàng checkout (khách, items, total, status, paymentCode) |

> **Không có** collection `users` trong Firestore — tài khoản đăng nhập nằm ở **Firebase Authentication**, không phải Firestore.

### 4.3. Xem & chỉnh sửa trực tiếp

1. Chọn collection (ví dụ `services`).
2. Click document để xem/sửa field.
3. **Thêm document:** nút **Add document** (cần đúng schema — tham khảo document seed có sẵn).
4. **Xóa document:** menu ⋮ → Delete.

**Khuyến nghị:**

- Chỉnh giá hàng loạt: dùng Admin Portal hoặc Force Re-seed từ `SalonSeedData.cs`.
- Chỉnh tay trên Firestore khi cần sửa nhanh 1–2 field; cẩn thận kiểu dữ liệu (`number`, `boolean`, `map`).

### 4.4. Môi trường Development (không có Firebase)

Nếu **chưa cấu hình** `FIREBASE_PROJECT_ID`, backend dùng **In-Memory repository** — dữ liệu **mất khi restart API**. Gọi `POST /api/seed/dev?force=true` để nạp lại 26 dịch vụ mẫu.

---

## 5. Quản lý hình ảnh (Asset Management)

### 5.1. Ảnh tĩnh (Hero, Background, Artist, Lookbook)

Ảnh gắn cứng trong code hoặc file frontend — **không** qua Firebase Storage.

**Thư mục khuyến nghị:**

```
frontend/public/images/
├── hero/
├── artist/
├── lookbook/
└── backgrounds/
```

**Cách dùng:**

1. Copy file `.jpg` / `.webp` vào `frontend/public/images/...`
2. Tham chiếu trong component: `/images/hero/salon-hero.webp`

Ví dụ hiện tại: `HeroSection.tsx` đang dùng URL Unsplash — có thể thay bằng:

```tsx
url('/images/hero/salon-hero.webp')
```

**`src/assets/`:** Dùng khi ảnh cần import trực tiếp trong TSX (Vite bundle). Với ảnh lớn, ưu tiên `public/` để tránh phình bundle.

Sau khi đổi ảnh tĩnh: `npm run build:frontend` hoặc commit & deploy lại.

### 5.2. Ảnh động (Dịch vụ, sản phẩm mới)

Ảnh sản phẩm lưu qua field **`imageUrl`** trong Firestore (`products` collection).

> **Trạng thái hiện tại:** Admin Portal **chưa có** nút upload file. Cập nhật ảnh theo một trong các cách sau:

#### Cách A — Firebase Storage (Console)

1. Firebase Console → **Storage** → **Upload file**.
2. Tạo thư mục gợi ý: `products/`, `services/`.
3. Sau khi upload, click file → copy **Download URL** (hoặc public URL nếu đã cấu hình Rules).
4. Dán URL vào field `imageUrl`:
   - Admin Portal → tab Sản phẩm → sửa (nếu có form URL), **hoặc**
   - Firestore Console → document `products/{id}` → field `imageUrl`.

#### Cách B — URL bên ngoài

Dùng link CDN / hosting ảnh hợp lệ (HTTPS), gán vào `imageUrl`.

#### Storage Rules (tham khảo)

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.admin == true;
    }
  }
}
```

#### Tương lai

Tính năng **upload trực tiếp từ Admin Portal** (chọn file → upload Storage → tự điền `imageUrl`) có thể được bổ sung trong phiên bản sau.

---

## 6. Quy trình push lên Git

Repository: https://github.com/LLLVPN4423/Trang_Tran_Web.git

### 6.1. Chuẩn bị

```bash
cd D:\download\TrangTranHair_Web
git status
```

Kiểm tra nhánh hiện tại (thường là `main`):

```bash
git branch
```

### 6.2. Commit thay đổi

```bash
git add .
git commit -m "docs: Add operations and management guide"
```

**Lưu ý:** Không commit file nhạy cảm:

- `firebase-service-account.json`
- `.env` (chỉ commit `.env.example`)

Các file này đã được liệt kê trong `.gitignore`.

### 6.3. Push lên GitHub

```bash
git push -u origin main
```

Nếu làm việc trên nhánh feature:

```bash
git checkout -b feature/ten-nhanh
# ... chỉnh sửa ...
git add .
git commit -m "feat: mo ta thay doi"
git push -u origin feature/ten-nhanh
```

Sau đó tạo Pull Request trên GitHub.

### 6.4. Đồng bộ từ remote

```bash
git pull origin main
```

### 6.5. Xử lý lỗi Git trên Windows

Nếu gặp lỗi ` dubious ownership `, chạy từng lệnh với flag (không đổi git config global):

```bash
git -c safe.directory=D:/download/TrangTranHair_Web status
git -c safe.directory=D:/download/TrangTranHair_Web push -u origin main
```

---

## Phụ lục — Lệnh vận hành nhanh

| Mục đích | Lệnh |
|----------|------|
| Chạy full stack local | `npm run dev:all` |
| Build production | `npm run build:backend` + `npm run build:frontend` |
| Docker production | `npm run docker:prod` |
| Seed dev (in-memory) | `POST http://localhost:5000/api/seed/dev?force=true` |
| Seed admin (Firestore) | Nút “Seed dữ liệu” hoặc `POST /api/seed?force=true` (JWT Admin) |

---

*Tài liệu cập nhật theo codebase phiên bản 1.0 — Trang Tran Hair Salon.*
