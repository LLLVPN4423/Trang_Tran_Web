# Tiến độ & ngữ cảnh — Trang Tran Hair Web

**Cập nhật:** 2026-11-03  
**Dùng file này** khi mở agent/chat mới — đọc trước transcript Cursor (nếu cần chi tiết).

**Production:** https://trangtran-hair.pages.dev  
**API:** Cloud Run `trangtran-api-327982031536.asia-southeast1.run.app`  
**Deploy FE:** Cloudflare Pages project `trangtran-hair` (sau fix → `scripts/deploy-pages.ps1` hoặc build `frontend` + `wrangler pages deploy`)

---

## Trạng thái hiện tại (tóm tắt)

| Hạng mục | Trạng thái |
|----------|-----------|
| Web khách + đặt lịch + shop + admin | Đang chạy production |
| Gallery video-first + swipe mobile | Đã deploy |
| SEO / GSC sitemap | Đã gửi `sitemap.xml`; ~3 URL đã index (`/`, `/catalog`, `/appointment`); `/shop` chưa — hạn ngạch request index hết ngày đó |
| Trang `/khu-vuc` (Cần Thơ / ĐBSCL) | Có URL + sitemap; **ẩn menu** khách (sidebar/footer) |
| `llms.txt` + robots AI bots | Đã lên production |
| Auto-deploy rule Cursor | `.cursor/rules/auto-deploy-after-fix.mdc` |
| Disk NTFS / root `package.json` | Đôi khi lỗi đọc — build từ `frontend/` + load `.env` gốc |

---

## Quyết định quan trọng

1. **Địa chỉ thật:** Sóc Trăng (Tuấn Lan, Hùng Vương). **Không** giả địa chỉ nội thành Cần Thơ.
2. **AI / local:** nhận khách Cần Thơ & ĐBSCL — FAQ + schema `areaServed` + `/khu-vuc` + GBP service areas (tiệm tự làm).
3. **Ẩn `/khu-vuc` khỏi UI** nhưng giữ index cho Google/AI.
4. Commit chỉ khi user yêu cầu; sau fix/feature khách → deploy Pages ngay (rule workspace).

---

## Việc đã xong gần đây (SEO / AI / UX)

- [x] Sitemap gọn (bỏ login/register/booking khỏi sitemap); `robots` Disallow admin/login/…
- [x] Headers/redirects cho `sitemap.xml`, `robots.txt`, `llms.txt`
- [x] FAQ + JSON-LD khu vực Cần Thơ / ĐBSCL
- [x] Docs: `AI_GOI_Y_SALON.md`, GSC, GBP mô tả, tăng khách
- [x] Ẩn link `/khu-vuc` khỏi sidebar + footer

---

## Việc còn lại (ưu tiên)

### Vận hành / tiệm (không chỉ code)

1. Google Business: xác minh, ảnh, **service areas** Cần Thơ+, xin review — xem `docs/AI_GOI_Y_SALON.md`, `docs/SALON_TANG_KHACH.md`
2. GSC: ngày mai request index `/shop` + vài dịch vụ; theo dõi sitemap “Thành công”
3. Demo Admin với chị Trang + handover — xem `docs/JOB_SALON_STATUS.md`, `docs/LO_TRINH_PHO_BIEN_WEB_SALON.md`

### Kỹ thuật (khi cần)

4. Sửa / tránh phụ thuộc root `package.json` bị corrupt NTFS; ưu tiên build từ `frontend/`
5. (Tuỳ chọn) Audit log admin, báo cáo SEO tháng — `JOB_SALON_STATUS.md`

---

## File ngữ cảnh liên quan

| File | Khi nào đọc |
|------|-------------|
| **`docs/TIEN_DO.md`** (file này) | Luôn — snapshot tiến độ |
| `docs/JOB_SALON_STATUS.md` | Gói job / RBAC / SLA với tiệm |
| `docs/AI_GOI_Y_SALON.md` | AI gợi ý + Cần Thơ |
| `docs/LO_TRINH_PHO_BIEN_WEB_SALON.md` | 30 ngày đưa web vào quầy |
| `docs/SOP_AI_LAM_GI.md` | Remote AI làm gì / không làm gì |
| `DEPLOY.md` / `DEVELOPMENT.md` | Deploy & local dev |

---

## Prompt gợi ý cho agent mới

> Đọc `docs/TIEN_DO.md` trước. Production: trangtran-hair.pages.dev. Sau fix frontend → deploy Pages. Không giả địa chỉ Cần Thơ; `/khu-vuc` giữ URL, không hiện menu khách.

---

*Cập nhật file này mỗi khi xong milestone lớn hoặc đổi quyết định vận hành.*
