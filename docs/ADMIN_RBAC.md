# Phân quyền Admin (Platform vs Salon)

## Vai trò

| Vai trò | Env UID | Quyền |
|---------|---------|--------|
| **Platform Admin** | `FIREBASE_ADMIN_UIDS` | Toàn bộ admin + seed, catalog, site content, khuyến mãi |
| **Salon Admin** | `FIREBASE_SALON_ADMIN_UIDS` | Lịch hẹn, đơn shop, hóa đơn DV, doanh thu (**xem trên web**), danh sách khách — **không xuất CSV** |

Platform Admin **kế thừa** mọi quyền Salon Admin, gồm **xuất CSV** (doanh thu, hóa đơn DV).

Chỉ **hai role**: `platform` và `salon` — không thêm role staff.

## Platform Admin (bạn) — lần đầu / mất quyền

1. UID phải có trong **Cloud Run** `FIREBASE_ADMIN_UIDS`.
2. Chạy trên máy có `firebase-service-account.json`:
   ```bash
   node scripts/set-admin.js <UID_CUA_BAN> platform
   ```
3. **Đăng xuất → đăng nhập lại** trên web.

Nếu vào `/admin` báo không quyền nhưng API cũ: hard refresh (Ctrl+F5) sau khi deploy front.

## Cấp Salon Admin (nhân viên / chị Trang)

**Cách 1 — Platform Admin trên web (khuyên dùng):** `/admin/tools` → **Cấp quyền Salon Admin** → dán Firebase UID → Cấp. Hệ thống ghi Firestore + claim Firebase.

**Cách 2 — Env:** `FIREBASE_SALON_ADMIN_UIDS` + `node scripts/set-admin.js <UID> salon`.

Platform Admin **không** cấp thêm Platform Admin qua web (chỉ env + script).

## API

- Policy `Admin` / `SalonAdmin`: vận hành tiệm
- Policy `PlatformAdmin`: cấu hình web & seed

`GET /api/health/admin` trả `{ role: "platform" | "salon" }`.

## Re-seed

Chỉ Platform Admin — menu **Công cụ kỹ thuật** (`/admin/tools`), gõ `SEED` để xác nhận.
