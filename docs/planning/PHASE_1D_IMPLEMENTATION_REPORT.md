# Phase 1D Implementation Report — Customer Privacy Rights

**Date:** 2026-11-04  
**Status:** Implementation complete (local) — **awaiting owner approval** for commit/push/deploy  
**Approved plan:** Owner approval prompt (WP1–WP5, WP7; WP6 audit-only)

---

## 1. Summary

Phase 1D adds a staff-mediated privacy request (DSR) workflow and an Account Privacy Center, without duplicating Profile edit, without auto-deleting data, and without changing Customer identity mapping.

---

## 2. Reused (unchanged architecture)

| Area | Reuse |
|------|-------|
| Account / Profile | Existing tab + `PUT /api/customers/me` for ordinary correction |
| Firebase Auth + Customer sync | Unchanged; requests bind to `currentUser.UserId` |
| AdminLayout / Admin policy | New panel under `/admin/privacy-requests` |
| Firestore Admin SDK patterns | Same repository/document mapping style as appointments |
| Legal pages | Linked from Privacy Center; not rewritten |

---

## 3. Fixed / extended

| Item | Change |
|------|--------|
| Account tabs | Added `privacy` tab → `PrivacyCenterSection` |
| Admin overview | Link card to privacy requests |
| Audit report | Marked approved / implemented |

---

## 4. Built new

### Backend
- Domain: `PrivacyRequest`, `PrivacyRequestHistoryEntry`, enums `PrivacyRequestType`, `PrivacyRequestStatus`
- Application: DTOs, `IPrivacyRequestRepository` / `IPrivacyRequestService`, `PrivacyRequestService` (status machine, ownership, internal-note filtering)
- Infrastructure: `FirestorePrivacyRequestRepository` → collection `privacyRequests`; `InMemoryPrivacyRequestRepository`
- API: `PrivacyRequestsController` at `/api/privacy-requests`
  - Customer: `POST`, `GET me`, `GET me/{id}`
  - Admin: `GET`, `GET {id}`, `PATCH {id}`

### Frontend
- Types + endpoints for privacy requests
- `PrivacyCenterSection` (inventory + form + tracker)
- `PrivacyRequestsAdminPanel`

### Tests
- `PrivacyRequestServiceTests` (7 cases)

### Docs
- This report, test report, rights review, WP6 accessToken audit

---

## 5. WP5 deletion safety (enforced in code)

- No customer/order/payment/appointment/Firebase Auth delete APIs wired to privacy completion.
- `PrivacyRequestService.AdminUpdateAsync` only updates request fields + append-only history.
- Deletion/Restriction → Approved/Completed requires `customerVisibleResult` explaining the manual decision.
- UI warnings on customer form and admin detail.

---

## 6. Explicit non-actions

- No second Profile system
- No marketing consent withdraw (no marketing consent yet)
- No durable 1C acknowledgement persistence (deferred to 1F)
- No WP6 DTO/token stripping (audit only — see `PHASE_1D_WP6_ACCESSTOKEN_AUDIT.md`)
- No deploy / commit / push
- No Phase 1E

---

## 7. Files touched (primary)

**Backend:** Domain enums/entity; Application DTOs/interfaces/service/DI; Infrastructure repos/DI; Api `PrivacyRequestsController`; tests `PrivacyRequestServiceTests.cs`

**Frontend:** `AccountPage.tsx`, `PrivacyCenterSection.tsx`, `PrivacyRequestsAdminPanel.tsx`, `App.tsx`, `AdminLayout.tsx`, `shared/api/types.ts`, `shared/api/endpoints.ts`

**Docs:** `PHASE_1D_*` reports, `TIEN_DO.md`, audit report status update

---

## 8. Remaining / carry-forward

| Item | Target |
|------|--------|
| Retention policy + approved anonymization playbook | Owner + later phase |
| Durable registration acknowledgement | Phase 1F |
| Marketing consent + withdraw | Phase 1F |
| accessToken DTO hardening | Post-WP6 owner decision |
| Live HTTP IDOR probe against Cloud Run | Manual / staging with test accounts |
| Firestore Security Rules in repo | Separate security work |
| Production deploy of 1D | After commit approval |
