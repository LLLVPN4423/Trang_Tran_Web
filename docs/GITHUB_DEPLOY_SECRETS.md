# GitHub Actions — secrets để tự deploy

Workflow **không chạy deploy** nếu thiếu secrets (job sẽ báo đỏ).

Vào: [Settings → Secrets and variables → Actions](https://github.com/LLLVPN4423/Trang_Tran_Web/settings/secrets/actions)

## Cloud Run API

| Secret | Nội dung |
|--------|----------|
| `GCP_PROJECT_ID` | ID project Google Cloud (vd. `trangtranhairsalon-872c5` hoặc project chứa Cloud Run) |
| `GCP_SA_KEY` | Toàn bộ JSON service account (quyền Cloud Run Admin + có thể build từ source) |

Sau khi thêm: **Actions → Deploy Cloud Run API → Run workflow** (hoặc push `main`).

Deploy `--source ./backend` thường **8–15 phút**.

## Cloudflare Pages

| Secret | Nội dung |
|--------|----------|
| `CLOUDFLARE_API_TOKEN` | Token có quyền Pages Edit |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID Cloudflare |

Tuỳ chọn thêm **Variables** (repo): `VITE_FIREBASE_*`, `VITE_SEPAY_*`, `VITE_API_URL` (URL Cloud Run).

## Kiểm tra sau deploy

```powershell
node scripts/smoke-test-production.js
```

Kỳ vọng **40/40**; `GET /api/admin/revenue/summary` trả **401** (không phải 404).
