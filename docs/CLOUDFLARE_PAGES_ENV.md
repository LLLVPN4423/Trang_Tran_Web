# Biến môi trường Cloudflare Pages (frontend)

Chỉ cần các biến **`VITE_*`** cho bước build. **Không** đặt biến backend (`FIREBASE_ADMIN_UIDS`, `FIREBASE_CREDENTIALS_PATH`, `SEPAY_WEBHOOK_SECRET`) trên Pages — chúng chỉ dùng trên **Cloud Run**.

## Build settings (Dashboard)

| Mục | Giá trị |
|-----|---------|
| Build command | `npm run build:cloudflare` |
| Build output directory | `frontend/dist` |
| Root directory | *(để trống)* |

## Environment variables (Production)

| Name | Giá trị đúng | Ghi chú |
|------|----------------|---------|
| `VITE_API_URL` | `https://trangtran-api-327982031536.asia-southeast1.run.app` | **Hoặc xóa hẳn** — **KHÔNG** dùng `http://localhost:5000` |
| `VITE_FIREBASE_API_KEY` | *(Firebase Console → Web app)* | |
| `VITE_FIREBASE_AUTH_DOMAIN` | `trangtranhairsalon-872c5.firebaseapp.com` | |
| `VITE_FIREBASE_PROJECT_ID` | `trangtranhairsalon-872c5` | |
| `VITE_SEPAY_BANK_NAME` | `Techcombank` | |
| `VITE_SEPAY_BANK_BIN` | *(mã BIN ngân hàng, nếu có)* | |
| `VITE_SEPAY_ACCOUNT_NUMBER` | `19037055104011` | |
| `VITE_SEPAY_ACCOUNT_NAME` | `TRAN XUAN TRANG` | |

Sau khi sửa biến: **Deployments → Retry deployment** (build lại mới nhúng env vào JS).

## Xóa trên Pages (không dùng cho static build)

- `FIREBASE_ADMIN_UIDS`
- `FIREBASE_CREDENTIALS_PATH`
- `FIREBASE_PROJECT_ID` *(backend — frontend dùng `VITE_FIREBASE_PROJECT_ID`)*
- `SEPAY_WEBHOOK_SECRET`

Code đã tự **bỏ qua `localhost`** nếu vẫn set nhầm `VITE_API_URL=http://localhost:5000`, nhưng nên sửa/xóa trên Dashboard cho rõ ràng.
