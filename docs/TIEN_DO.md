# Tiến độ & ngữ cảnh — Trang Tran Hair Web

**Cập nhật:** 2026-11-04  
**Rule:** mỗi lần thêm/xóa/sửa code → cập nhật file này (`.cursor/rules/update-tien-do.mdc`).  
**Dùng file này** khi mở agent/chat mới — đọc trước transcript Cursor (nếu cần chi tiết).

**Production:** https://trangtran-hair.pages.dev  
**API:** Cloud Run `trangtran-api-327982031536.asia-southeast1.run.app`  
**Deploy FE:** Cloudflare Pages project `trangtran-hair` (sau fix → `scripts/deploy-pages.ps1` hoặc build `frontend` + `wrangler pages deploy`)

---

## Trạng thái hiện tại (tóm tắt)

| Hạng mục | Trạng thái |
|----------|-----------|
| Web khách + đặt lịch + shop + admin | Đang chạy production |
| Thanh toán shop (ops) | VietQR + **staff xác nhận tay**; **không** dùng SePay làm verifier |
| Gallery video-first + swipe mobile | Đã deploy |
| SEO / GSC | Sitemap đã gửi; `/` `/catalog` `/appointment` đã index; `/shop` đã request index (2026-11-04) |
| Trang `/khu-vuc` | Có URL + sitemap; **ẩn menu** khách |
| **Security & Legal audit (docs-only)** | **Xong báo cáo** — `docs/audit/*` — **chờ duyệt remediation** (chưa sửa code) |
| **Master readiness planning (docs-only)** | **Xong** — `docs/planning/*` (2026-11-04) — **chờ owner duyệt trước khi implement** |
| **Phase 1 Legal system** | **1A–1D checkpoint** — branch `release/phase-1a-1d-integration-test` (không push `main`); **chờ owner test trước 1E** |
| Auto-deploy / TIEN_DO rules | `.cursor/rules/*` |
| Disk NTFS / root `package.json` | Đôi khi lỗi đọc — build từ `frontend/` |

---

## Quyết định quan trọng

1. **Địa chỉ thật:** Sóc Trăng. **Không** giả địa chỉ nội thành Cần Thơ.
2. **AI / local:** nhận khách Cần Thơ & ĐBSCL; `/khu-vuc` ẩn menu, giữ index.
3. **Thanh toán:** QR chuyển khoản + xác nhận thủ công; SePay không phải luồng live.
4. Commit khi user yêu cầu; fix khách → deploy Pages (rule).
5. **Audit:** chỉ docs cho đến khi owner duyệt remediation riêng.

---

## Việc đã xong gần đây

- [x] SEO/AI: sitemap, robots, llms.txt, FAQ khu vực, ẩn nav `/khu-vuc`
- [x] Git push tiến độ + Live bypasses (các commit trước)
- [x] GSC: request index `/shop` (hết hạn ngạch ngày trước đã qua)
- [x] **Audit docs-only 2026-11-04:** SECURITY / LEGAL / PRIVACY / RISK / REMEDIATION / TESTING
- [x] **Master readiness planning 2026-11-04:** `docs/planning/MASTER_READINESS_PLAN.md` + 7 satellite plans — **planning only, no code**
- [x] **Phase 1A 2026-11-04:** 6 legal routes + centralized `config/legal` + reports — **build/preview PASS; no deploy/commit**
- [x] **Phase 1B 2026-11-04:** Footer 3 nhóm + contextual links (register/appointment/checkout/order/account) — **build/preview PASS; no deploy/commit**
- [x] **Phase 1C 2026-11-04:** Register privacy disclosure + acknowledgement gate (≠ consent); marketing deferred to 1F — **build/preview PASS; no deploy/commit**
- [x] **Phase 1D audit 2026-11-04:** `PHASE_1D_AUDIT_REPORT.md` — Profile PASS/PARTIAL; privacy-request workflow MISSING
- [x] **Phase 1D implement 2026-11-04:** WP1–WP5 + WP7; WP6 accessToken audit-only; reports `PHASE_1D_IMPLEMENTATION/TEST/PRIVACY_RIGHTS` + `PHASE_1D_WP6_ACCESSTOKEN_AUDIT` — **build + 25 unit tests PASS; no commit/deploy**

---

## Việc còn lại (ưu tiên)

### Chờ owner

1. **Duyệt checkpoint Phase 1D** (commit/push message đề xuất) — **không** tự deploy; rồi mới cho Phase 1E.
2. Điền `OWNER_INPUT_REPORT.md` / checklist HKD + chính sách giao-hủy-hoàn + liên hệ khiếu nại/DSR; retention trước khi anonymize.
3. **Duyệt remediation** bảo mật theo `docs/audit/*` / backlog — tách khỏi Phase 1 legal.
4. Xác nhận giữ endpoint SePay nhưng **không** bật làm verifier live.
5. Duyệt kế hoạch tổng `MASTER_READINESS_PLAN.md` nếu chưa.

### Vận hành / SEO

6. GBP service areas + review; GSC tiếp URL dịch vụ khi còn hạn ngạch.
7. Demo Admin / handover — `JOB_SALON_STATUS.md`

### Kỹ thuật

8. NTFS / package.json ghost files.
9. Sau duyệt audit: branch `security/audit-remediation`.

---

## File ngữ cảnh liên quan

| File | Khi nào đọc |
|------|-------------|
| **`docs/TIEN_DO.md`** | Luôn |
| **`docs/audit/SECURITY_AUDIT.md`** | Bảo mật |
| **`docs/audit/PRIVACY_AUDIT.md`** | Quyền riêng tư / DLCN |
| **`docs/audit/LEGAL_COMPLIANCE_AUDIT.md`** | Pháp lý VN |
| **`docs/audit/RISK_REGISTER.md`** | Tổng hợp rủi ro |
| **`docs/audit/REMEDIATION_ROADMAP.md`** | Kế hoạch sửa (chờ duyệt) |
| **`docs/audit/TESTING_REPORT.md`** | Phương pháp & giới hạn test |
| **`docs/planning/MASTER_READINESS_PLAN.md`** | Kế hoạch readiness tổng (chờ duyệt) |
| **`docs/planning/OWNER_INPUT_CHECKLIST.md`** | Câu hỏi bắt buộc từ owner |
| **`docs/planning/OWNER_INPUT_REPORT.md`** | Field thiếu sau Phase 1A + file config cần sửa |
| **`docs/planning/PHASE_1A_IMPLEMENTATION_REPORT.md`** | Báo cáo triển khai 1A |
| **`docs/planning/PHASE_1B_IMPLEMENTATION_REPORT.md`** | Footer + contextual links |
| **`docs/planning/PHASE_1B_TEST_REPORT.md`** | Kết quả test 1B |
| **`docs/planning/PHASE_1C_IMPLEMENTATION_REPORT.md`** | Auth / privacy disclosure |
| **`docs/planning/PHASE_1C_PRIVACY_DISCLOSURE_REVIEW.md`** | Ack vs consent vs marketing |
| `docs/AI_GOI_Y_SALON.md` | AI / Cần Thơ |
| `DEPLOY.md` / `DEVELOPMENT.md` | Deploy & local |

---

## Prompt gợi ý cho agent mới

> Đọc `docs/TIEN_DO.md`, `docs/planning/MASTER_READINESS_PLAN.md`, `docs/audit/RISK_REGISTER.md`. Production: trangtran-hair.pages.dev. Thanh toán = VietQR + manual Paid. **Không** bắt đầu implementation/remediation nếu chưa có lệnh duyệt riêng. Không giả địa chỉ Cần Thơ.

---

*Cập nhật file này mỗi khi xong milestone lớn hoặc đổi quyết định vận hành.*
