# Phân quyền Admin (Platform vs Salon)

## Vai trò

| Vai trò | Env UID | Quyền |
|---------|---------|--------|
| **Platform Admin** | `FIREBASE_ADMIN_UIDS` | Toàn bộ admin + seed, catalog, site content, khuyến mãi |
| **Salon Admin** | `FIREBASE_SALON_ADMIN_UIDS` | Lịch hẹn, đơn shop, hóa đơn DV, doanh thu (xem), danh sách khách |

Platform Admin **kế thừa** mọi quyền Salon Admin.

## Cấp quyền Firebase

1. Thêm UID vào `.env` (local) hoặc Cloud Run env:
   - Platform: `FIREBASE_ADMIN_UIDS=uid-dev`
   - Salon: `FIREBASE_SALON_ADMIN_UIDS=uid-chi-trang`
2. Chạy:
   ```bash
   node scripts/set-admin.js <UID> platform
   node scripts/set-admin.js <UID> salon
   ```
3. User **đăng xuất và đăng nhập lại** trên web.

## API

- Policy `Admin` / `SalonAdmin`: vận hành tiệm
- Policy `PlatformAdmin`: cấu hình web & seed

`GET /api/health/admin` trả `{ role: "platform" | "salon" }`.

## Re-seed

Chỉ Platform Admin — menu **Công cụ kỹ thuật** (`/admin/tools`), gõ `SEED` để xác nhận.
