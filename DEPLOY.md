# Hướng dẫn Deploy — Trang Tran Hair Salon

Tài liệu gồm **2 phương án**:

| | Phương án B (test / ngân sách tối thiểu) | Phương án dài hạn (vận hành lâu dài) |
|--|------------------------------------------|--------------------------------------|
| **Mục đích** | Deploy test, thử vận hành, chi phí ~0đ/tháng | Go-live ổn định, mở rộng, không cold start |
| **Frontend** | Cloudflare Pages (free) | VPS + Docker hoặc Cloud Run min=1 |
| **API** | Google Cloud Run (scale-to-zero) | Container chạy 24/7 |
| **DB/Auth** | Firebase Spark (free) | Firebase Blaze (pay-as-you-go) |
| **Chi phí ước tính** | **~0–500k VND/năm** (chủ yếu domain nếu có) | **~2,5–4M VND/năm** |

> Firebase + cấu hình cơ bản: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)  
> Vận hành hàng ngày: [OPERATIONS_GUIDE.md](./OPERATIONS_GUIDE.md)  
> Dev local: [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## Sơ đồ Phương án B

```
Khách → Cloudflare Pages (React static)
              │
              │  HTTPS  VITE_API_URL
              ▼
        Google Cloud Run (.NET API)
              │
              ▼
        Firebase (Auth + Firestore)
```

**Lưu ý:** Trên phương án B, frontend **gọi thẳng** URL Cloud Run (không proxy `/api` như Docker VPS). Mọi tính năng (đăng ký, mua hàng, admin, điểm thưởng) **giống local** nếu cấu hình đủ env + domain Firebase.

---

# PHẦN 1 — Phương án B (Deploy test / ~0đ)

Phù hợp khi: traffic thấp, thử vận hành vài tuần/tháng, chấp nhận **cold start 5–15 giây** lần đầu sau khi API ngủ.

## Chuẩn bị (làm 1 lần)

### 1.1 Firebase (đã có project)

Project hiện tại: `trangtranhairsalon-872c5`. Cần có:

- [ ] Authentication: Email + Google
- [ ] Firestore database
- [ ] File `firebase-service-account.json` (tải từ Firebase Console → Project settings → Service accounts)
- [ ] Admin UID trong `FIREBASE_ADMIN_UIDS` + chạy `node scripts/set-admin.js YOUR_UID`

Chi tiết: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### 1.2 Tài khoản Google Cloud

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project GCP (có thể **link cùng project Firebase** hoặc tạo riêng rồi bật billing — Cloud Run free tier vẫn cần **bật billing** nhưng ít traffic gần như 0đ)
3. Bật API:
   - **Cloud Run API**
   - **Artifact Registry API**
   - **Secret Manager API** (khuyến nghị cho Firebase JSON)

4. Cài [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install) trên máy dev

```powershell
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
gcloud config set run/region asia-southeast1
```

Region gần VN: `asia-southeast1` (Singapore).

### 1.3 Copy env mẫu

```powershell
copy .env.plan-b.example .env
# Điền VITE_FIREBASE_* , FIREBASE_* , SEPAY_* , FRONTEND_URL
```

---

## Bước 2 — Deploy Backend lên Cloud Run

Backend = folder `backend/`, Docker image từ `backend/Dockerfile`, chạy `TrangTranHair.Api.dll` port **8080**.

### 2.1 Lưu Firebase credentials vào Secret Manager

```powershell
# Tạo secret (chỉ làm 1 lần)
gcloud secrets create firebase-service-account `
  --replication-policy=automatic

gcloud secrets versions add firebase-service-account `
  --data-file=firebase-service-account.json
```

### 2.2 Build & push Docker image

```powershell
cd D:\download\TrangTranHair_Web

# Tạo repo Artifact Registry (1 lần)
gcloud artifacts repositories create trangtran `
  --repository-format=docker `
  --location=asia-southeast1 `
  --description="Trang Tran Hair API"

gcloud auth configure-docker asia-southeast1-docker.pkg.dev

$IMAGE = "asia-southeast1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/trangtran/api:latest"

docker build -t $IMAGE ./backend
docker push $IMAGE
```

### 2.3 Deploy Cloud Run service

Thay `YOUR_GCP_PROJECT_ID` và `https://trangtran-hair.pages.dev` bằng domain frontend thật (cập nhật lại sau bước 3 nếu chưa biết URL Pages).

```powershell
gcloud run deploy trangtran-api `
  --image $IMAGE `
  --platform managed `
  --region asia-southeast1 `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 3 `
  --timeout 60 `
  --set-secrets="/app/secrets/firebase-credentials.json=firebase-service-account:latest" `
  --set-env-vars="ASPNETCORE_ENVIRONMENT=Production" `
  --set-env-vars="Firebase__ProjectId=trangtranhairsalon-872c5" `
  --set-env-vars="Firebase__CredentialsPath=/app/secrets/firebase-credentials.json" `
  --set-env-vars="Firebase__AdminUids=5CuKXbEoGfhPenvA8JjOMEnYEow1" `
  --set-env-vars="SePay__WebhookSecret=YOUR_SEPAY_SECRET" `
  --set-env-vars="Cors__Origins__0=https://trangtran-hair.pages.dev"
```

Sau deploy, gcloud in URL dạng:

```
https://trangtran-api-xxxxx-asia-southeast1.run.app
```

**Ghi vào `.env`:**

```env
VITE_API_URL=https://trangtran-api-xxxxx-asia-southeast1.run.app
```

### 2.4 Kiểm tra API

```powershell
curl https://trangtran-api-xxxxx-asia-southeast1.run.app/api/health
```

Kỳ vọng: JSON báo Firestore connected / healthy.

**Lần đầu sau khi sleep:** có thể mất 5–15 giây — bình thường với `--min-instances 0`.

### 2.5 Seed dữ liệu (1 lần)

Sau khi frontend + admin login hoạt động, gọi seed với **token admin**:

```powershell
# Lấy token: đăng nhập admin trên web → DevTools → hoặc Firebase CLI
curl -X POST "https://trangtran-api-xxxxx.asia-southeast1.run.app/api/seed?force=true" `
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

Endpoint: `POST /api/seed?force=true` — yêu cầu policy **Admin**.

> Chỉ dev local: `POST /api/seed/dev?force=true` (không auth, **Production trả 404**).

---

## Bước 3 — Deploy Frontend lên Cloudflare Pages

### 3.1 Kết nối GitHub

1. Push repo lên GitHub (đã có: `LLLVPN4423/Trang_Tran_Web`)
2. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Connect to Git**
3. Chọn repo `Trang_Tran_Web`

### 3.2 Cấu hình build

| Mục | Giá trị |
|-----|---------|
| **Production branch** | `main` |
| **Root directory** | `/` (repo root) |
| **Build command** | `npm run install:all && npm run build:frontend` |
| **Build output directory** | `frontend/dist` |
| **Node version** | 20+ |

### 3.3 Biến môi trường build (Settings → Environment variables)

Đặt cho **Production** (bắt buộc khi build Vite):

| Biến | Ví dụ |
|------|-------|
| `VITE_API_URL` | `https://trangtran-api-xxxxx.asia-southeast1.run.app` |
| `VITE_FIREBASE_API_KEY` | từ Firebase Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | `trangtranhairsalon-872c5.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `trangtranhairsalon-872c5` |
| `VITE_SEPAY_BANK_NAME` | Vietcombank |
| `VITE_SEPAY_ACCOUNT_NUMBER` | STK thật |
| `VITE_SEPAY_ACCOUNT_NAME` | TRANG TRAN HAIR SALON |

**Deploy** → URL mặc định: `https://trangtran-hair.pages.dev` (hoặc tên project bạn chọn).

File `frontend/public/_redirects` đã có rule SPA (`/* → index.html`) — route `/admin`, `/account` hoạt động trên Pages.

### 3.4 Cập nhật CORS Cloud Run

Sau khi có URL Pages thật, **deploy lại** Cloud Run với CORS đúng:

```powershell
gcloud run services update trangtran-api `
  --region asia-southeast1 `
  --update-env-vars="Cors__Origins__0=https://trangtran-hair.pages.dev"
```

Nếu thêm domain custom sau này:

```powershell
--update-env-vars="Cors__Origins__0=https://trangtranhair.vn,Cors__Origins__1=https://www.trangtranhair.vn"
```

(.NET đọc mảng CORS qua `Cors__Origins__0`, `Cors__Origins__1`, …)

---

## Bước 4 — Firebase Authorized Domains

1. [Firebase Console](https://console.firebase.google.com/) → **Authentication** → **Settings** → **Authorized domains**
2. Thêm:
   - `trangtran-hair.pages.dev` (hoặc subdomain Pages của bạn)
   - Domain custom nếu có (vd: `trangtranhair.vn`)

**Google Sign-In** sẽ lỗi nếu thiếu bước này.

---

## Bước 5 — SePay webhook (khi bán thật)

| Mục | Giá trị |
|-----|---------|
| Webhook URL | `https://trangtran-api-xxxxx.asia-southeast1.run.app/api/webhooks/sepay` |
| Secret | Cùng `SEPAY_WEBHOOK_SECRET` / `SePay__WebhookSecret` trên Cloud Run |

Trước khi webhook xong: admin xác nhận đơn **Paid** thủ công tại `/admin/orders`.

---

## Bước 6 — Checklist test sau deploy

- [ ] Mở trang chủ Pages — không lỗi console `VITE_API_URL`
- [ ] `/api/health` trả OK (có thể chậm lần đầu)
- [ ] Đăng ký email → hoàn tất hồ sơ
- [ ] Google login
- [ ] Thêm SP vào giỏ → checkout → đơn Pending
- [ ] Admin `/admin` — CRUD sản phẩm, duyệt đơn
- [ ] Tích điểm sau khi Paid
- [ ] Đặt lịch → thấy trong `/account` và `/admin/appointments`
- [ ] Test 2 tài khoản: **Chrome thường + cửa sổ ẩn danh** (cùng browser 2 tab = 1 user)

---

## Cập nhật code sau này (Phương án B)

| Thay đổi | Việc cần làm |
|----------|--------------|
| **Frontend only** | Push `main` → Cloudflare Pages tự build |
| **Backend only** | `docker build` + `docker push` + `gcloud run deploy` |
| **Đổi env frontend** | Sửa biến trên Cloudflare → **Redeploy** |
| **Đổi env backend** | `gcloud run services update ...` |

---

## Nhược điểm Phương án B (cần biết trước)

| Vấn đề | Giải thích |
|--------|------------|
| **Cold start** | API ngủ khi không traffic → lần đầu 5–15s; timeout frontend 15s — hiếm khi fail, F5 thường OK |
| **Billing GCP** | Cần bật billing dù chi phí thấp; theo dõi [Cloud Billing alerts](https://console.cloud.google.com/billing) |
| **Cấu hình rải rác** | Env ở Cloudflare + Cloud Run + Firebase — phức tạp hơn 1 file `.env` trên VPS |
| **SePay** | Webhook phải trỏ URL Cloud Run public |

---

# PHẦN 2 — Phương án dài hạn (vận hành & mở rộng)

Khi salon **go-live thật**, muốn **ổn định**, **không cold start**, dễ mở rộng (thêm ảnh, email, traffic cao hơn).

## Khuyến nghị: VPS + Docker Compose (Phương án A)

Đây là phương án **cân bằng nhất** cho salon vừa tại VN: một máy chạy 24/7, frontend + API cùng stack đã có sẵn trong repo.

### Kiến trúc

```
Khách → Domain (Cloudflare DNS free)
              │
              ▼
        VPS (nginx trong Docker)
         ├── /     → React static
         └── /api  → .NET API (proxy nội bộ)
              │
              ▼
        Firebase Blaze (Auth + Firestore)
```

### Thành phần

| Thành phần | Dịch vụ gợi ý | Ghi chú |
|------------|---------------|---------|
| **VPS** | TinoHost, Vietnix, Contabo, Vultr | 2 GB RAM, 1 vCPU — đủ cho salon |
| **Frontend + API** | `docker-compose.prod.yml` (có sẵn) | `VITE_API_URL` **để trống** — nginx proxy `/api` |
| **DB/Auth** | Firebase **Blaze** | Spark vẫn dùng được; Blaze khi vượt free tier |
| **CDN/SSL** | Cloudflare (free) | Proxy domain → VPS, SSL tự động |
| **Domain** | `.vn` / `.com` | ~250–400k/năm |

### Deploy VPS (tóm tắt)

```bash
# Trên VPS (Ubuntu 22+)
git clone https://github.com/LLLVPN4423/Trang_Tran_Web.git
cd Trang_Tran_Web
cp .env.production.example .env
# Điền Firebase, SePay, FRONTEND_URL=https://tenmien.vn
# Copy firebase-service-account.json vào thư mục gốc

docker compose -f docker-compose.prod.yml up -d --build
```

- Port 80 (hoặc 443 qua Cloudflare)
- SePay webhook: `https://tenmien.vn/api/webhooks/sepay`
- Firebase authorized domain: `tenmien.vn`

Chi tiết env: [.env.production.example](./.env.production.example)

### Chi phí ước tính theo năm (Phương án A)

| Hạng mục | VND/năm (ước tính) |
|----------|-------------------|
| VPS 100–150k/tháng | 1,2 – 1,8 triệu |
| Domain `.vn` / `.com` | 250 – 400 nghìn |
| Firebase Blaze (salon vừa) | 0 – 600 nghìn (thường thấp) |
| Cloudflare | 0 |
| **Tổng** | **~1,5 – 2,8 triệu/năm** |

### Khi nào nên nâng cấp thêm

| Nhu cầu | Hướng mở rộng |
|---------|---------------|
| Nhiều ảnh upload từ admin | Firebase Storage (Blaze) hoặc Cloudinary |
| Email xác nhận đơn | SendGrid / Resend (~free tier) |
| Traffic cao | VPS 4GB hoặc tách API riêng |
| Backup Firestore | Export định kỳ (Blaze) |
| Giám sát | UptimeRobot (free) + log Docker |

---

## Phương án thay thế dài hạn: Cloud Run min-instances=1

Nếu **không muốn quản VPS** nhưng cần **hết cold start**:

```powershell
gcloud run services update trangtran-api `
  --region asia-southeast1 `
  --min-instances 1
```

| | Ưu | Nhược |
|--|-----|-------|
| Cloud Run min=1 | Không cold start, auto-scale | ~300–600k VND/tháng (~4–7M/năm) — đắt hơn VPS |
| VPS Docker | Rẻ, kiểm soát full, stack có sẵn | Tự patch OS, monitor |

**Kết luận:** Test → **Phương án B**. Go-live lâu dài → **VPS + Docker** (~2M/năm). Chỉ chọn Cloud Run min=1 nếu team không ai maintain VPS.

---

## Lộ trình đề xuất

```
Giai đoạn 1 (1–2 tháng)
  Phương án B — Cloudflare Pages + Cloud Run + Firebase Spark
  → Test đầy đủ: đăng ký, mua, admin, SePay, điểm

Giai đoạn 2 (go-live)
  Mua domain + chuyển sang VPS Docker (Phương án A)
  → Giữ nguyên Firebase project (không mất data)
  → Cập nhật: authorized domains, CORS, SePay webhook, VITE_* (nếu build lại)

Giai đoạn 3 (mở rộng)
  Firebase Blaze khi cần
  + Storage / email / backup theo nhu cầu salon
```

---

## So sánh nhanh

| Tiêu chí | Phương án B | VPS Docker (dài hạn) |
|----------|-------------|----------------------|
| Chi phí/năm | ~0–500k | ~1,5–2,8M |
| Cold start | Có (5–15s) | Không |
| Độ phức tạp setup | Cao | Trung bình |
| Tính năng web | Đủ | Đủ |
| Phù hợp | Test, demo, ít khách | Vận hành salon thật |

---

## Liên hệ / tham chiếu

- Repo: https://github.com/LLLVPN4423/Trang_Tran_Web
- Health API: `GET /api/health`
- SePay webhook: `POST /api/webhooks/sepay`
- Admin script: `node scripts/set-admin.js YOUR_UID`
