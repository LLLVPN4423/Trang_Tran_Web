# Phase 1A Test Report

**Date:** 2026-11-04  
**Environment:** Local production build (`npm run build`) + `vite preview` at `http://127.0.0.1:4173`  
**Statuses used:** PASS | FAIL | BLOCKED | NOT RUN

---

## Build / static

| Test ID | Steps | Expected | Result | Status |
|---------|-------|----------|--------|--------|
| T-BUILD-01 | `npm run build` in `frontend/` | `tsc --noEmit` + Vite build succeed | Exit 0; dist produced | **PASS** |
| T-CFG-01 | Inspect `shared/config/legal/*` | Central fields; ownerName CONFIRMED; other HKD null | As implemented | **PASS** |
| T-CFG-02 | Production UI missing fields | No invented tax/phone; text “Thông tin đang được cập nhật.” | Verified via browser CDP + snapshots | **PASS** |
| T-CFG-03 | Production UI status enums | No visible `OWNER_INPUT_REQUIRED` / `PENDING_OWNER_INPUT` in page text | CDP: `hasRawStatus: false` on privacy page | **PASS** |

---

## Routes (preview)

| Test ID | URL | Expected | Status |
|---------|-----|----------|--------|
| T-RTE-01 | `/chinh-sach-bao-mat` | Title + owner name + processors from code + missing placeholders | **PASS** |
| T-RTE-02 | `/dieu-khoan-giao-dich` | Appointment request ≠ confirmed sentence present | **PASS** |
| T-RTE-03 | `/chinh-sach-thanh-toan` | Manual Paid / SePay not live verifier | **PASS** |
| T-RTE-04 | `/chinh-sach-giao-hang-doi-tra` | Product vs service sections; fees not invented | **PASS** |
| T-RTE-05 | `/lien-he-khieu-nai` | Contacts pending; process outline | **PASS** |
| T-RTE-06 | `/thong-tin-ho-kinh-doanh` | Trần Xuân Trang; HKD fields pending | **PASS** |
| T-NAV-01 | PolicyNav links between six pages | Links present; current page marked | **PASS** |
| T-BAN-01 | Non-ready publication banner | Customer-safe “chưa phải bản công bố…” present | **PASS** (CDP `hasBanner: true`) |

---

## Responsive

| Test ID | Steps | Result | Status |
|---------|-------|--------|--------|
| T-MOB-01 | Emulate 390×844; open `/thong-tin-ho-kinh-doanh` | Content readable; PolicyNav wraps; Dark Luxury layout holds | **PASS** (screenshot reviewed) |
| T-TAB-01 | Tablet widths | — | **NOT RUN** |
| T-DESK-01 | Wide desktop screenshot pass | Used default desktop snapshots during route checks | **PASS** (partial; via normal viewport snapshots) |

---

## Regression / out of scope for 1A

| Test ID | Area | Status |
|---------|------|--------|
| T-AUTH-01 | Google / email login | **NOT RUN** (unchanged; not in 1A scope) |
| T-APT-01 | Appointment submit | **NOT RUN** |
| T-PAY-01 | Checkout / VietQR / Paid | **NOT RUN** |
| T-ADM-01 | Admin panels | **NOT RUN** |
| T-FOOT-01 | Footer legal column | **NOT RUN** / N/A — Phase 1B |

No automated Jest/Vitest suite exists in `frontend/package.json` — no unit tests executed.

---

## Defects found in 1A

None blocking. Notes:

1. Existing site footer still shows public salon phone/address (pre-existing SEO footer) — **not** copied into legal HKD fields; legal pages keep those fields empty.
2. Complaint “form” called out as future work on the complaints page (expected for 1A).

---

## Conclusion

Phase 1A technical checks that were executed all **PASS**. Content is **not** legally final until owner inputs + legal review + publication status upgrade.
