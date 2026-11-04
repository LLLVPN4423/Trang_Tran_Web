# Phase 1B Test Report

**Date:** 2026-11-04  
**Environment:** `npm run build` + Vite preview `http://127.0.0.1:4173` / `:4174`  
**Statuses:** PASS | FAIL | BLOCKED | NOT RUN

---

## Build

| ID | Result | Status |
|----|--------|--------|
| T1B-BUILD-01 | `tsc` + Vite production build exit 0 (after footer + contextual links; rebuild after register dedupe) | **PASS** |

---

## Footer & legal navigation

| ID | Steps | Status |
|----|-------|--------|
| T1B-FOOT-01 | Home footer shows groups: brand, Thông tin kinh doanh, Chính sách & điều khoản, Hỗ trợ | **PASS** |
| T1B-FOOT-02 | Six legal routes linked from footer (snapshot link names) | **PASS** |
| T1B-FOOT-03 | Giới thiệu → `/#artist`, FAQ → `/#faq` present | **PASS** |
| T1B-FOOT-04 | Existing NAP phone/address/social preserved | **PASS** |
| T1B-FOOT-05 | Mobile 390: footer label-caps present via CDP after scroll | **PASS** |
| T1B-FOOT-06 | Tablet 768: same footer groups via CDP | **PASS** |
| T1B-LEG-01 | Open `/chinh-sach-bao-mat` — page loads; draft publication messaging retained | **PASS** |
| T1B-LEG-02 | Sitemap still 30 URLs (legal routes not added) | **PASS** |
| T1B-LEG-03 | No visible raw status enums on legal page UI | **PASS** (prior 1A + page content check) |

---

## Contextual links

| ID | Surface | Status |
|----|---------|--------|
| T1B-REG-01 | `/register` shows Privacy + Terms + preface (no checkbox) | **PASS** |
| T1B-APT-01 | Appointment form with seeded service cart: request note + Terms + Privacy | **PASS** |
| T1B-APT-02 | Empty cart: form (and notice) hidden — expected | **PASS** |
| T1B-CHK-01 | `/booking` with seeded product cart: payment policy + pre-submit Terms/Payment/Shipping | **PASS** |
| T1B-CHK-02 | Select Delivery → extra shipping policy notice | **PASS** (CDP) |
| T1B-ORD-01 | Order detail with real order | **NOT RUN** (no real order id; avoided creating production data) |
| T1B-ACC-01 | Account overview policy block | **BLOCKED** (requires authenticated session) |

---

## Regression (light)

| ID | Area | Status |
|----|------|--------|
| T1B-NAV-01 | Home / catalog / shop / appointment routes still render | **PASS** (navigated) |
| T1B-AUTH-01 | Full Google/email register submit | **NOT RUN** (no new accounts; UI links only) |
| T1B-PAY-01 | Create order / mark Paid | **NOT RUN** (out of 1B; no payment change) |

---

## Defects found & fixed in 1B

1. Register showed duplicate Privacy/Terms blocks (form + Google) → removed Google block duplicate; Google copy points to links above. Rebuild **PASS**.

---

## Conclusion

Executed Phase 1B UI/navigation checks **PASS**. Account and live order-detail contextual links remain **BLOCKED/NOT RUN** pending credentials / order fixture. No deploy.
