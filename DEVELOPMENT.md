# Hướng dẫn phát triển — Trang Tran Hair Salon

Tài liệu kỹ thuật cho developer làm việc trên monorepo **TrangTranHair_Web**.

---

## Mục lục

1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cấu trúc monorepo](#2-cấu-trúc-monorepo)
3. [Biến môi trường](#3-biến-môi-trường)
4. [Chạy & build](#4-chạy--build)
5. [Kiến trúc backend](#5-kiến-trúc-backend)
6. [Kiến trúc frontend](#6-kiến-trúc-frontend)
7. [API endpoints](#7-api-endpoints)
8. [Firestore collections](#8-firestore-collections)
9. [Firebase setup](#9-firebase-setup)
10. [Deploy production](#10-deploy-production)
11. [Checklist trước go-live](#11-checklist-trước-go-live)

---

## 1. Yêu cầu hệ thống

| Tool | Phiên bản |
|------|-----------|
| Node.js | 20+ |
| .NET SDK | 10 |
| Git | 2.x |
| Docker (tuỳ chọn) | 24+ |

---

## 2. Cấu trúc monorepo

```
backend/
  src/
    TrangTranHair.Domain/         # Entities, Enums
    TrangTranHair.Application/    # Services, DTOs, Interfaces
    TrangTranHair.Infrastructure/ # Firestore, InMemory, Firebase Auth
    TrangTranHair.Api/            # Controllers, Middleware, Program.cs

frontend/
  src/
    app/                # App.tsx, providers
    modules/
      portfolio/        # Trang chủ parallax
      catalog/          # Bảng giá
      booking/          # Checkout
      account/          # Login, register, loyalty
      admin/            # Admin portal
    shared/
      api/              # Axios client, endpoints, types
      auth/             # Firebase Auth
      components/       # AppShell, AppSidebar, PageLayout...
      store/            # cartStore (Zustand)
  public/images/        # Ảnh tĩnh salon
```

**Clean Architecture flow:** `Api → Application (Services) → Domain ← Infrastructure (Repositories)`

---

## 3. Biến môi trường

Copy `.env.example` → `.env` ở thư mục gốc. Vite đọc file này qua `frontend/vite.config.ts` (`envDir: ..`).

### Backend

| Biến | Mô tả |
|------|-------|
| `FIREBASE_PROJECT_ID` | ID project Firebase |
| `FIREBASE_CREDENTIALS_PATH` | Đường dẫn service account JSON |
| `SEPAY_WEBHOOK_SECRET` | Secret xác thực webhook SePay |

### Frontend (prefix `VITE_`)

| Biến | Mô tả |
|------|-------|
| `VITE_API_URL` | URL API (`http://localhost:5000` dev; để trống khi nginx proxy) |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `{project}.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Cùng project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `{project}.appspot.com` — bắt buộc cho upload ảnh SP |
| `VITE_SEPAY_*` | Hiển thị thông tin CK trên trang checkout |

> **Không commit:** `.env`, `firebase-service-account.json`

---

## 4. Chạy & build

```bash
# Cài tất cả
npm run install:all

# Dev full stack
npm run dev:all

# Build
npm run build:backend
npm run build:frontend

# Docker dev
npm run docker:dev

# Docker production
npm run docker:prod
```

### Seed dữ liệu

| Môi trường | Endpoint | Auth |
|------------|----------|------|
| Dev (in-memory) | `POST /api/seed/dev?force=true` | Không |
| Production (Firestore) | `POST /api/seed?force=true` | Admin JWT |

Seed gồm: **26 dịch vụ**, **6 sản phẩm Moroccanoil**, **2 mã KM** (`WELCOME10`, `SALON50K`).

Nguồn seed: `backend/src/TrangTranHair.Application/Seed/SalonSeedData.cs`

---

## 5. Kiến trúc backend

### Controllers

| Controller | Route prefix |
|------------|--------------|
| HealthController | `/api/health` |
| ServicesController | `/api/services` |
| ProductsController | `/api/products` |
| OrdersController | `/api/orders` |
| AppointmentsController | `/api/appointments` |
| CustomersController | `/api/customers` |
| PromotionsController | `/api/promotions` |
| LoyaltyController | `/api/loyalty` |
| SeedController | `/api/seed` |
| SePayWebhookController | `/api/webhooks/sepay` |

### Auth policies

- **Public:** catalog, tạo đơn, đặt lịch, validate KM
- **Authorize (JWT bất kỳ):** `/api/customers/me`, `/api/orders` (khách xem đơn của mình)
- **Admin (`admin: true` claim):** CRUD admin, list orders/appointments, adjust loyalty

### Fallback in-memory

Nếu thiếu `FIREBASE_PROJECT_ID` hoặc credentials → repositories dùng **InMemory** (mất data khi restart).

---

## 6. Kiến trúc frontend

### Routing (`frontend/src/app/App.tsx`)

| Path | Module |
|------|--------|
| `/` | Portfolio (không sidebar) |
| `/catalog`, `/booking`, `/account/*`, `/login`, `/register` | AppShell + sidebar |
| `/admin/*` | AdminLayout + sidebar admin |

### State

- **Giỏ hàng:** Zustand + localStorage (`trang-tran-cart`)
- **Auth:** Firebase Auth + React Context (`AuthProvider`)
- **API token:** Axios interceptor tự gắn Bearer JWT

### Sửa giá dịch vụ trong code

1. Chỉnh `SalonSeedData.cs`
2. `POST /api/seed/dev?force=true` hoặc Admin → Force Re-seed

### Sửa ảnh tĩnh portfolio

1. Thêm file vào `frontend/public/images/`
2. Cập nhật `frontend/src/modules/portfolio/data/content.ts` hoặc section TSX
3. Commit & deploy

---

## 7. API endpoints

### Orders

```
POST   /api/orders              # Tạo đơn (promoCode, pointsToRedeem)
GET    /api/orders/{id}         # Xem đơn (public)
GET    /api/orders              # List (Admin: all | Customer: của mình)
PATCH  /api/orders/{id}/status  # Admin cập nhật trạng thái
```

### Appointments

```
POST   /api/appointments              # Form đặt lịch portfolio
GET    /api/appointments              # Admin list
PATCH  /api/appointments/{id}/status  # Admin duyệt
```

### Loyalty

```
GET  /api/loyalty/rules       # Quy tắc tích điểm (public)
GET  /api/loyalty/me          # Số dư (JWT)
GET  /api/loyalty/me/history  # Lịch sử (JWT)
POST /api/loyalty/adjust      # Admin điều chỉnh điểm
```

Quy tắc: **1 điểm / 10.000đ** spent; **100 điểm = 10.000đ** giảm giá.

---

## 8. Firestore collections

| Collection | Document ID | Ghi chú |
|------------|-------------|---------|
| `services` | `svc-*` | Bảng giá dịch vụ |
| `products` | `prd-*` | Sản phẩm + `imageUrl` |
| `orders` | UUID | Đơn checkout |
| `appointments` | UUID | Lịch hẹn portfolio |
| `customers` | Firebase UID | Hồ sơ + `loyaltyPoints` |
| `promotions` | `promo-*` | Mã KM |
| `loyaltyTransactions` | UUID | Lịch sử điểm |

Tài khoản login: **Firebase Authentication** (không có collection `users`).

---

## 9. Firebase setup

### Bước 1 — Tạo project

1. https://console.firebase.google.com/
2. Thêm Web app → copy config vào `.env`

### Bước 2 — Authentication

- Bật **Email/Password**
- Bật **Google** (Sign-in method → Google → Enable)
- Thêm domain vào **Authorized domains** (`localhost` + domain production)

> Chi tiết từng bước: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### Bước 3 — Firestore

- Tạo database (production mode)
- Deploy rules phù hợp (backend dùng Admin SDK, client chỉ qua API)

### Bước 4 — Ảnh sản phẩm (không bắt buộc Storage)

- Đặt ảnh vào `frontend/public/images/products/`
- Admin → dán URL `/images/products/...` — **miễn phí, không cần billing**
- Storage + `VITE_FIREBASE_STORAGE_BUCKET` chỉ khi muốn upload từ trình duyệt (thường cần Blaze)

### Bước 5 — Cấp quyền Admin

Script `set-admin.js` (xem OPERATIONS_GUIDE.md mục 3). User phải **đăng xuất & đăng nhập lại** sau khi cấp claim.

---

## 10. Deploy production

```bash
copy .env.production.example .env
# Điền Firebase, SePay, domain

npm run docker:prod
```

- Frontend: nginx serve static + proxy `/api`
- Backend: container .NET 10
- Đặt `firebase-service-account.json` cạnh docker-compose (không commit)

---

## 11. Checklist trước go-live

- [ ] Firebase Auth + Firestore đã cấu hình (Storage **không bắt buộc**)
- [ ] Admin account có claim `admin: true`
- [ ] SePay webhook trỏ tới `https://domain/api/webhooks/sepay`
- [ ] `VITE_SEPAY_*` đúng số TK thật
- [ ] Force Re-seed trên Firestore production
- [ ] Upload ảnh sản phẩm qua `/admin/products`
- [ ] Test luồng: đăng ký → đặt hàng → CK → webhook → tích điểm
- [ ] Test form đặt lịch → duyệt tại `/admin/appointments`
- [ ] SSL/HTTPS trên domain

---

*Cập nhật: phiên bản 2.0 — sau tích hợp loyalty, admin portal, appointments.*
