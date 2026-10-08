# Nhận diện & phổ biến salon — **0 đồng** (làm lâu dài)

Tài liệu này chỉ gồm cách **không mua quảng cáo**, **không đăng ký dịch vụ trả phí** (Zalo OA gói trả phí, email marketing, influencer trả tiền…).

---

## Phần đã làm trên web (kỹ thuật, miễn phí hosting Cloudflare)

| Việc | Lợi ích |
|------|---------|
| SEO tiếng Việt + từ khóa địa phương | Khách tìm “salon tóc Sóc Trăng”, “Hùng Vương” dễ thấy hơn |
| `robots.txt` + `sitemap.xml` + chặn `/admin` | Google index đúng trang khách, bỏ trang quản trị |
| JSON-LD **HairSalon** + **FAQ** | Maps / Search hiểu địa chỉ, giờ, dịch vụ |
| Ảnh **og:image** khi share link | Post Facebook/Zalo đẹp, không cần thiết kế riêng |
| Meta riêng cho `/`, `/catalog`, `/appointment`, `/shop` | Share từng trang có tiêu đề phù hợp |
| **Copy link / Facebook / Chia sẻ** trên trang liên hệ & đặt lịch | Khách & nhân viên giới thiệu tiệm không tốn phí |
| FAQ công khai trên trang chủ | Trả lời sẵn câu hỏi hay hỏi → giảm inbox, tốt SEO |
| Thanh **Gọi · Zalo · Đặt lịch** (mobile) | Chuyển đổi ngay từ điện thoại |
| `site.webmanifest` | Khách “Thêm vào màn hình chính” — logo salon trên điện thoại |

**Sau khi deploy front:** nhờ 5–10 khách quen bấm **Copy link** hoặc **Chia sẻ Facebook** trên web (mục liên hệ / đặt lịch).

---

## Việc salon làm thêm — vẫn **miễn phí**, không phải trả tiền hàng tháng

### 1. Google Business Profile (Maps)

- Tạo / xác minh tiệm trên Google — **miễn phí**.
- Điền đúng NAP: **Trang Tran Hair**, địa chỉ Tuấn Lan, **0986 586 058**, giờ **8:30–20:30**, website = link Cloudflare.
- Đăng ảnh salon (tự chụp), trả lời đánh giá.

### 2. Facebook / TikTok / Instagram (organic)

- Chỉ cần tài khoản & fanpage có sẵn — **không boost post**.
- Mỗi tuần 3–5 bài: before/after, tip chăm sóc tóc.
- **CTA cố định:** link `https://trangtran-hair.pages.dev/appointment` hoặc “Inbox đặt lịch”.

### 3. Mẫu caption copy-paste (không phí)

**Bài đặt lịch (ghim fanpage):**

```
Trang Tran Hair · Sóc Trăng
Nhuộm · Uốn · Balayage · Phục hồi tóc
📍 18–19 LK2 Tuấn Lan, Hùng Vương
⏰ 8:30–20:30 (T2–CN)
📞 0986 586 058 · Zalo cùng số
👉 Đặt lịch online: https://trangtran-hair.pages.dev/appointment
👉 Bảng giá: https://trangtran-hair.pages.dev/catalog
```

**Bài giới thiệu shop:**

```
Moroccanoil chính hãng — đặt trên web salon, tích điểm thành viên.
https://trangtran-hair.pages.dev/shop
Hotline 0986 586 058
```

**Hashtag gợi ý (miễn phí):** `#soc trang #trangtranhair #salontoc #nhuomtoc #lamtocSocTrang`

### 4. Vận hành hàng ngày (tăng doanh thu, không phí tool)

- Duyệt **Lịch hẹn** admin trong giờ mở cửa → không mất khách inbox.
- Tạo **Hóa đơn dịch vụ** sau khi làm xong → số liệu đúng (khi API đã deploy).
- Nhắc khách hài lòng **đánh giá Google** (lời nói + QR in tại quầy — chỉ tốn giấy in).

### 5. Tích điểm & mã khuyến mãi (đã có trên web)

- Admin tạo mã **Khuyến mãi** (giảm % shop) — không cần quảng cáo trả phí.
- Khách **đăng ký / tích điểm** — quay lại tiệm, giới thiệu bạn bè.

---

## **Không** nằm trong gói “0 đồng” (tránh nhầm)

- Quảng cáo Facebook / Google Ads / TikTok Ads  
- Zalo Official Account **gói trả phí** (chatbot, broadcast trả phí)  
- Thuê KOL, mua banner, SMS marketing trả phí  
- Tên miền `.com` riêng (tuỳ chọn; hiện dùng `*.pages.dev` **miễn phí**)

---

## Checklist 2 tuần (chỉ thời gian, không tiền)

- [ ] Deploy bản web mới (Cloudflare Connect Git hoặc push repo)  
- [ ] Google Business: xác minh + 10 ảnh + link web  
- [ ] Ghim post FB với link `/appointment`  
- [ ] 6 bài social (3 ảnh before/after + 3 tip ngắn)  
- [ ] Nhờ 5 khách share link web hoặc đánh giá Maps  
- [ ] Admin duyệt 100% lịch trong ngày  

Chi tiết thêm: [SALON_TANG_KHACH.md](./SALON_TANG_KHACH.md).
