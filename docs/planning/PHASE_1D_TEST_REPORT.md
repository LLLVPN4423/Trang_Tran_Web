# Phase 1D Test Report

**Date:** 2026-11-04  
**Environment:** Local developer machine  
**Rule:** PASS only if actually executed

---

## 1. Build

| Check | Result | Evidence |
|-------|--------|----------|
| Backend `dotnet build` (Api) | **PASS** | 0 errors |
| Frontend `npm run build` | **PASS** | Vite `✓ built` |
| Application unit tests (full suite) | **PASS** | 25 passed, 0 failed |
| PrivacyRequest unit tests | **PASS** | 7 passed |

---

## 2. Backend / service tests (executed)

| Case | Result |
|------|--------|
| Create binds to authenticated UID; status Submitted | **PASS** |
| ListMine returns only own requests | **PASS** |
| GetMine for other UID → NotFound | **PASS** |
| Customer DTO excludes internal notes | **PASS** |
| Invalid status transition after Completed | **PASS** |
| Deletion Completed requires visible result; customer doc not deleted | **PASS** |
| IsAllowedTransition rules | **PASS** |

---

## 3. API / authz matrix

| Case | Result | Notes |
|------|--------|-------|
| Unauthenticated create/list me | **NOT RUN** | Covered by `[Authorize]` pattern; no live HTTP harness in this pass |
| Customer A cannot read B’s request | **PASS** (service) | `GetMine` NotFound |
| Customer cannot set status | **PASS** (design + code) | No customer PATCH endpoint |
| Customer cannot read internal notes | **PASS** (service) | Mapper strips internal fields |
| Non-admin admin APIs | **NOT RUN** | Relies on existing `Admin` policy; no live probe |
| Admin update + history append | **PASS** (service) | Unit tests |
| Deletion does not wipe orders/payments | **PASS** (service + code review) | No delete calls; customer retained |

---

## 4. Frontend

| Case | Result | Notes |
|------|--------|-------|
| Privacy Center compiles / types | **PASS** | Production build |
| Form / list / admin panel code present | **PASS** | Code review + build |
| Responsive / empty / error states | **NOT RUN** | Visual browser pass not executed this session |
| Live submit against Firestore | **NOT RUN** | No production/test Firebase write in this pass |

---

## 5. Regression

| Area | Result | Notes |
|------|--------|-------|
| Profile view/edit code paths | **PASS** (unchanged + build) | Only added privacy tab |
| Customer sync / Firebase Auth | **NOT RUN** live | No identity mapping changes |
| Appointments / Orders / Checkout / VietQR | **NOT RUN** live | No payment/booking code edits |
| Loyalty | **NOT RUN** live | Untouched |
| Admin customers | **PASS** (build) | Untouched panel; new sibling route |
| Existing unit tests | **PASS** | Full suite 25/25 |

---

## 6. Destructive / production

| Check | Result |
|-------|--------|
| Used production customer delete | **NOT DONE** (forbidden) |
| Secrets in fixtures | **PASS** — synthetic UIDs only |

---

## 7. Residual test gaps

1. Live Cloud Run IDOR probes with two test accounts.  
2. Browser smoke: Account → Quyền riêng tư → submit → Admin process.  
3. Confirm Firestore `privacyRequests` writable with current service account in staging.
