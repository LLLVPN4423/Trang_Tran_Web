# Google Search Console — thao tác trên Chrome (Trang Tran Hair)

Property: **https://trangtran-hair.pages.dev/**  
Sitemap: **https://trangtran-hair.pages.dev/sitemap.xml**  
Xác minh: file `googlecf7fae87e4fb333d.html` (đã deploy).

> Cursor **không đăng nhập được** Gmail của bạn — các bước dưới làm **trên Chrome bạn đã mở GSC**.

---

## A. Một lần (5 phút)

1. Vào [Search Console](https://search.google.com/search-console) → chọn property **`https://trangtran-hair.pages.dev/`** (URL prefix).
2. Menu trái **Sitemap** (Sơ đồ trang web).
3. Ô “Thêm sitemap mới” → gõ: **`sitemap.xml`** → **Gửi**.
4. Đợi vài phút → trạng thái **Thành công**, số URL đã phát hiện (khoảng 20+ URL).

---

## B. Yêu cầu lập chỉ mục (ưu tiên)

Menu **Kiểm tra URL** (hoặc ô tìm trên đầu) — dán từng link → **Enter** → **Yêu cầu lập chỉ mục** (nếu chưa index):

```
https://trangtran-hair.pages.dev/
https://trangtran-hair.pages.dev/catalog
https://trangtran-hair.pages.dev/appointment
https://trangtran-hair.pages.dev/shop
https://trangtran-hair.pages.dev/catalog/service/svc-balayage
https://trangtran-hair.pages.dev/catalog/service/svc-highlight-full
https://trangtran-hair.pages.dev/catalog/service/svc-keratin
```

*(Google giới hạn số lần request/ngày — ưu tiên 5 link đầu trước.)*

---

## C. Mỗi tuần (~10 phút)

| Mục menu | Xem gì |
|----------|--------|
| **Hiệu suất** | Query: `salon tóc Sóc Trăng`, `Trang Tran Hair`, `nhuộm tóc Sóc Trăng` — impression/click |
| **Trang** → **Lập chỉ mục** | Trang “Chưa lập chỉ mục” / “Đã thu thập dữ liệu - chưa lập chỉ mục” |
| **Trải nghiệm** → **Core Web Vitals** | Mobile có URL “Cần cải thiện” không |

Sau mỗi lần **deploy web** hoặc đổi giá/dịch vụ lớn: lặp lại **B** cho `/catalog` và 1–2 trang dịch vụ.

---

## D. Song song (quan trọng hơn GSC cho salon)

- **Google Business Profile**: tên/địa chỉ/SĐT/giờ **trùng web**, link website = `trangtran-hair.pages.dev`, ảnh + review.
- FB/TikTok: mỗi bài gắn link **/appointment** hoặc **/catalog/service/...**

Chi tiết: `docs/SALON_TANG_KHACH.md`.

---

## E. Kiểm tra kỹ thuật (đã OK)

- `robots.txt`: Allow `/`, Disallow `/admin`, có dòng Sitemap.
- `sitemap.xml`: HTTP 200, gồm trang chủ + catalog + từng dịch vụ.
- JSON-LD HairSalon + FAQ trên web (React `SalonLocalSeo`).

Nếu Sitemap báo lỗi: báo lại để chạy build (`npm run build` có `generate-sitemap.mjs`) và deploy Cloudflare Pages.
