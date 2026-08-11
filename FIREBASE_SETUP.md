# Hướng dẫn cấu hình Firebase — Trang Tran Hair



Tài liệu này hướng dẫn **cấu hình sơ bộ** để website vận hành. **Không cần trả phí Firebase Storage** — ảnh sản phẩm dùng file tĩnh hoặc URL.



| Tính năng | Cần Firebase | Gói Spark (miễn phí) |

|-----------|--------------|----------------------|

| Đăng nhập / đăng ký (email + Google) | Authentication | ✅ |

| Tài khoản, tích điểm, đơn hàng | Auth + Firestore | ✅ (giới hạn free tier) |

| Admin Portal | Auth + custom claim `admin` | ✅ |

| **Ảnh sản phẩm** | Chỉ lưu **URL** trong Firestore | ✅ **Không cần Storage** |

| Upload ảnh từ trình duyệt | Storage (Blaze) | ⚠️ Tùy chọn — thường bắt billing |



---



## Lộ trình khuyến nghị (không Storage)



Làm **theo thứ tự** — bỏ qua mục 6 nếu không muốn trả phí:



1. Tạo project Firebase  

2. Thêm Web app → điền `.env`  

3. Bật Authentication (Email + Google)  

4. Tải Service Account JSON (backend)  

5. Tạo Firestore  

6. ~~Storage~~ → **bỏ qua**, dùng ảnh tĩnh (mục **Ảnh sản phẩm không Storage** bên dưới)  

7. Cấp quyền Admin  

8. Seed dữ liệu + test  



---



## 1. Tạo project Firebase



1. Mở [Firebase Console](https://console.firebase.google.com/)

2. **Add project** → đặt tên (vd: `trang-tran-hair`)

3. Tắt Google Analytics nếu không cần → **Create project**



> Gói **Spark (miễn phí)** đủ cho Auth + Firestore cơ bản.



---



## 2. Thêm Web app & copy config

1. Project Overview → biểu tượng **Web** (`</>`)
2. App nickname: `TrangTranHair Web` → Register app
3. Copy các giá trị config

Tạo file `.env` ở **thư mục gốc repo** (copy từ `.env.example`):

```env
# ⚠️ HAI DÒNG NÀY PHẢI CÙNG MỘT GIÁ TRỊ (project ID thật từ Firebase Console)
FIREBASE_PROJECT_ID=trangtranhairsalon-872c5
VITE_FIREBASE_PROJECT_ID=trangtranhairsalon-872c5

FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json

VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=AIza...          # từ Firebase Console → Web app
VITE_FIREBASE_AUTH_DOMAIN=trangtranhairsalon-872c5.firebaseapp.com

# KHÔNG bật nếu chưa trả phí Storage:
# VITE_FIREBASE_STORAGE_BUCKET=
```

**Kiểm tra trước khi chạy:**

```bash
npm run check:firebase
```

**Sau khi chạy API**, mở http://localhost:5000/api/health — phải thấy:

```json
"persistence": { "mode": "firestore", ... }
```

Nếu `"mode": "inmemory"` → dữ liệu **chỉ tạm trong RAM**, mất khi restart. Xem mục **Xử lý lỗi** bên dưới.

> **Không commit** `.env` và `firebase-service-account.json`.



---



## 3. Authentication



### 3.1. Email / Password



1. **Build** → **Authentication** → **Get started**

2. Tab **Sign-in method**

3. **Email/Password** → **Enable** → Save



### 3.2. Google (đăng nhập bằng tài khoản Google)



1. Cùng tab **Sign-in method**

2. **Google** → **Enable**

3. Chọn **Project support email** (email của bạn)

4. **Save**



### 3.3. Authorized domains



**Authentication** → **Settings** → **Authorized domains**



| Domain | Mục đích |

|--------|----------|

| `localhost` | Dev local |

| `your-domain.com` | Production |



---



## 4. Service Account (backend .NET)



1. **Project settings** (⚙️) → **Service accounts**

2. **Generate new private key** → tải JSON

3. Đổi tên thành `firebase-service-account.json`, đặt ở **thư mục gốc repo**

4. Khớp `FIREBASE_CREDENTIALS_PATH` trong `.env`



---



## 5. Firestore Database



1. **Build** → **Firestore Database** → **Create database**

2. Chọn region gần VN (vd: `asia-southeast1`)

3. **Production mode**



Collections tạo tự động khi app chạy / seed:



`services`, `products`, `orders`, `appointments`, `customers`, `promotions`, `loyaltyTransactions`



**Seed dữ liệu mẫu:**



```http

POST http://localhost:5000/api/seed/dev?force=true

```



---



## Ảnh sản phẩm — không cần Storage (miễn phí)



Firebase Storage thường yêu cầu **nâng gói Blaze (billing)**. Website **vẫn chạy đầy đủ** nếu bạn **không dùng Storage**.



### Cách 1 — Ảnh tĩnh trong project (khuyến nghị)



1. Copy ảnh vào `frontend/public/images/products/`

2. Admin → **Sản phẩm** → **Ảnh** → dán URL:



```

/images/products/prd-moroccanoil-shampoo.jpg

```



3. **Lưu URL**



Chi tiết: `frontend/public/images/products/README.md`



### Cách 2 — Link ảnh bên ngoài



Dán URL public (Google Drive share link, Imgur, CDN…) vào field `imageUrl` tại Admin hoặc Firestore Console.



### Cách 3 — Firebase Storage (tùy chọn, trả phí)



Chỉ khi bạn đã bật Blaze và tạo bucket:



```env

VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app

```



Admin sẽ hiện thêm nút upload file.



---



## 6. Storage (TÙY CHỌN — thường cần billing)



> **Bỏ qua mục này** nếu Firebase bắt trả phí. Dùng mục **Ảnh sản phẩm — không cần Storage** ở trên.



1. **Build** → **Storage** → **Get started** (có thể yêu cầu upgrade Blaze)

2. Copy bucket name → `VITE_FIREBASE_STORAGE_BUCKET`



---



## 7. Cấp quyền Admin



1. Đăng ký / đăng nhập trên web (`/login` hoặc Google)

2. Firebase Console → **Authentication** → **Users** → copy **User UID**

3. Chạy:



```bash

npm install firebase-admin

node scripts/set-admin.js YOUR_FIREBASE_UID

```



4. **Đăng xuất và đăng nhập lại** → vào `/admin`



---



## 8. Luồng đăng nhập Google



1. **Tiếp tục với Google** tại `/login`

2. Lần đầu: `/account` → nhập SĐT (hoàn tất hồ sơ)

3. Dùng giỏ hàng, tích điểm, đơn hàng bình thường



---



## 9. Kiểm tra nhanh



```bash

npm run install:all

npm run dev:all

```



| Bước | Kỳ vọng |

|------|---------|

| `/login` | Đăng nhập email hoặc Google |

| `/catalog` → `/booking` | Đặt hàng được |

| Cấp admin → login lại | Vào `/admin` |

| Admin → Sản phẩm → Lưu URL ảnh | Hiện ảnh trên catalog (không cần Storage) |



---



## 10. Production



1. Copy `.env.production.example` → `.env`

2. **Không bắt buộc** `VITE_FIREBASE_STORAGE_BUCKET`

3. `npm run docker:prod`

4. Mount `firebase-service-account.json`



---



## Xử lý lỗi thường gặp

| Lỗi | Cách sửa |
|-----|----------|
| Admin API **401** | `FIREBASE_PROJECT_ID` ≠ `VITE_FIREBASE_PROJECT_ID` hoặc vẫn là placeholder — chạy `npm run check:firebase` |
| Admin API **403** | Chạy `node scripts/set-admin.js UID` → đăng xuất/đăng nhập lại |
| Dữ liệu **mất sau restart** | API đang dùng `inmemory` — sửa `.env` + Firestore, xem `/api/health` |
| `persistence.mode: inmemory` | Tạo Firestore trên Console; đặt đúng `FIREBASE_PROJECT_ID`; có `firebase-service-account.json` |
| Storage bắt trả phí | **Bỏ qua Storage** — comment `VITE_FIREBASE_STORAGE_BUCKET`, dùng `/images/products/...` |
| `Firebase chưa được cấu hình` | Điền `VITE_FIREBASE_*` (trừ Storage), restart dev |
| `operation-not-allowed` | Bật Google ở mục 3.2 |



---



*Cập nhật: lộ trình không Storage — phù hợp gói Spark miễn phí.*

