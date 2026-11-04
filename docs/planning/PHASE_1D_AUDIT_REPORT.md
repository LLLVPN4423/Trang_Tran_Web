# Phase 1D Audit Report — Customer Privacy Rights

**Date:** 2026-11-04 (audit); implementation completed same day after owner approval  
**Mode:** Audit completed → **APPROVED** → implemented (WP1–WP5, WP7; WP6 audit-only)  
**Status:** Implementation local complete — see `PHASE_1D_IMPLEMENTATION_REPORT.md` — **no commit/deploy until owner OK**  

---

## 1. Architecture (related)

| Layer | Evidence |
|-------|----------|
| Auth | Firebase JWT → `CurrentUserService.UserId` (`user_id` / `sub` / NameIdentifier) |
| Customer | Firestore `customers`; `CustomerService.SyncAsync` sets `Id = firebaseUid` and `FirebaseUid = firebaseUid` |
| Profile UI | `/account` tab `profile` — `ProfileEditForm` → `PUT /api/customers/me` |
| Orders | `GET /api/orders` non-admin → `ListOrdersAsync(..., customerId: currentUser.UserId)` |
| Appointments | `GET /api/appointments/me` → `ListByCustomerAsync(currentUser.UserId)` |
| Admin customers | `GET /api/customers` Admin-only; UI loyalty adjust only |
| Privacy requests | **No** entity, controller, collection, or admin panel |
| Consent / ack records | Phase 1C UI gate only — **no** backend persistence |
| Audit log product | **No** dedicated audit module found under backend |
| Firestore rules | **Not in repo** (Admin SDK path primary) |

---

## 2. Requirement classification

| Requirement | Existing implementation | Status | Evidence | Actual gap |
|-------------|-------------------------|--------|----------|------------|
| **View personal data (profile fields)** | Account Profile shows name, phone, email, createdAt, points, totalSpent | **PARTIAL** | `AccountPage` `ProfileSection`; `CustomerResponse` | No structured “inventory” of all processing categories (orders PII, appointment PII, loyalty txs, capability tokens). Customer `Id` (= Firebase UID) returned in API but not explained in UI. |
| **View related personal data (orders / appointments / loyalty)** | Account tabs load own orders, appointments, loyalty history | **PARTIAL** | `fetchOrders()` + server filters by `UserId`; `fetchMyAppointments`; loyalty `/me` | Guest-era data linked by phone may appear after sync — expected but not explained. `accessToken` present on order/appointment API DTOs (capability secret) — returned to client; Account UI does not display it, but payload still includes it. |
| **Correct profile (name/phone/email)** | `PUT /api/customers/me` + Profile form; also `POST sync` | **PASS** (ordinary profile correction) | `CustomersController.UpdateMe`; `CustomerService.UpdateMeAsync` scopes by Firebase UID | Not a formal “DSR correction request”. Phone validation remains presence-oriented (quality gap, not ownership). Cannot change Firebase Auth email/password via this API (Auth-side). |
| **Formal DSR “access request” ticket** | None | **MISSING** | No privacy-request types/APIs | Needed if inventory export / staff-mediated access is required beyond Profile. |
| **Formal DSR “correction request” ticket** | Profile edit covers routine fields | **PARTIAL** | Profile update works | Ticket workflow still needed for corrections staff must apply (e.g. Auth email, historical order name/phone on past orders) — not available today. |
| **Deletion request** | No customer delete API/UI; repo `DeleteAsync` exists on some Live/InMemory interfaces but **not** exposed on `CustomersController`; Firestore customer repo has **no** `DeleteAsync` | **MISSING** (workflow) / **PASS** (no unsafe auto-delete) | Controllers + `FirestoreCustomerRepository` | Need staff-mediated deletion/anonymization request — **must not** auto-wipe orders/payments. |
| **Withdraw consent** | No marketing consent stored; 1C ack ≠ consent | **NOT APPLICABLE** (today) / **MISSING** (when 1F adds marketing) | `PHASE_1C_PRIVACY_DISCLOSURE_REVIEW.md` | Do not invent withdraw UI for non-existent consent records. |
| **Restrict processing** | None | **MISSING** | — | Request type + admin handling only. |
| **Track request status** | None | **MISSING** | — | Need request ID + status history. |
| **Staff intake / process** | Admin customers list; complaints page is static content; order dispute is order-specific only | **PARTIAL** | `CustomersAdminPanel`; `/lien-he-khieu-nai` text-only; `SubmitDispute` on orders | No privacy-request admin workflow. Order dispute ≠ PDPD DSR. |
| **Identity verification for sensitive DSR** | Login/JWT for account actions; no extra step for deletion | **PARTIAL** | `[Authorize]` on customer/me | Deletion/restriction should require authenticated customer + staff verification steps. |
| **IDOR isolation (profile)** | Get/Update me by Firebase UID | **PASS** (code-level) | Controller uses `currentUser.UserId` only | Live cross-account probe **NOT VERIFIED** this pass (no destructive/prod probing). |
| **IDOR isolation (orders list)** | Non-admin list forces `customerId = currentUser.UserId` | **PASS** (code-level) | `OrdersController.List` | Phone query alone cannot widen past own `customerId` filter (intersection). Live probe **NOT VERIFIED**. |
| **Durable privacy acknowledgement** | 1C checkbox UI | **MISSING** (backend) | Register disclosure | Belongs primarily to **Phase 1F**; 1D should not fake records. |
| **Client cannot set privileged statuses** | N/A (no privacy request API yet) | **MISSING** to implement correctly | — | Design: status transitions Admin-only. |

---

## 3. What already works (reuse)

1. **Account / Profile** — view + edit name/phone/email via authenticated APIs.  
2. **Customer identity model** — `Id` + `FirebaseUid` (currently aligned at create); do **not** renumber.  
3. **Own orders / appointments / loyalty** — server-scoped listing.  
4. **Admin authz** — `Admin` policy for customer list and order status.  
5. **Legal pages + complaints contact placeholders** — link targets for “how to request”.  
6. **Order dispute** — keep as commerce dispute, **not** as PDPD DSR substitute.

---

## 4. Verified gaps / risks

| ID | Finding | Severity |
|----|---------|----------|
| G-01 | No privacy-request entity/API/admin UI | High (1D scope) |
| G-02 | No deletion / anonymization / restriction workflow | High |
| G-03 | No customer-facing request tracker | Medium–High |
| G-04 | `accessToken` in list/detail DTOs may over-expose capability secrets | Medium (hardening; can be 1D or security phase) |
| G-05 | No structured personal-data inventory in Account | Medium (UX/transparency) |
| G-06 | 1C acknowledgement not durable | Medium — **prefer 1F** |
| G-07 | Retention policy text still OWNER_INPUT | Blocks automated deletion decisions |
| G-08 | Firestore Security Rules not in repo | Unknown client direct access — document limitation |
| G-09 | `ICustomerServiceLive.DeleteAsync` / InMemory delete without public API | Low (dead/unused surface) — do not wire blindly |

---

## 5. Implementation plan (proposed — **not approved yet**)

### Principles
- Extend `/account` (new tab or Profile subsection) — **no second profile system**.  
- New privacy-request workflow only where MISSING.  
- Deletion = **request + staff decision**, never auto-delete orders/payments.  
- No fake consent withdraw.  
- No deploy/commit in implementation until separately authorized.

### Proposed work packages (after approval)

| WP | Action | Reuse | New |
|----|--------|-------|-----|
| WP1 | Privacy center in Account: inventory copy + links to profile edit + submit DSR form | Account tabs, legal links | UI section |
| WP2 | Backend `PrivacyRequest` model + Firestore collection + customer create/list-own + admin list/patch | Auth, Admin policy, repository patterns | Entity, DTOs, controller, repo |
| WP3 | Status machine: Submitted → IdentityVerificationRequired → UnderReview → MoreInformationRequired → Approved/Rejected → Completed | — | Enum + history append-only |
| WP4 | Admin panel under `/admin` for privacy requests | AdminLayout patterns | Panel + route |
| WP5 | Deletion safety: request type `Deletion`; completion actions limited to documented staff checklist (anonymize profile fields / disable account) — **no cascade delete orders** | Order/Appointment retention | Guardrails + admin notes |
| WP6 | Optional: strip `accessToken` from `/appointments/me` and authenticated order list responses (keep on create/get-by-token paths) | Controllers/DTOs | Mapping change |
| WP7 | Tests: authz, ownership, no client status write, no order wipe on deletion request | Existing patterns | New tests |

**Out of this 1D plan (explicit):** durable registration acknowledgement / marketing consent (1F); SePay; payment flow changes; Firebase rebuild.

### Likely files/APIs/collections (if approved)

| Area | Candidates |
|------|------------|
| Domain | `PrivacyRequest` entity + status enum + history entry |
| Application | `IPrivacyRequestService`, DTOs, validation |
| Infrastructure | `FirestorePrivacyRequestRepository` → collection `privacyRequests` |
| API | `PrivacyRequestsController` (`POST`, `GET me`, Admin `GET`, `PATCH`) |
| Frontend | Account privacy tab/section; admin panel; `endpoints.ts` / types |
| Docs | Implementation + test + rights review after build |

### Risks
- Legal over-automation of deletion without retention rules (G-07).  
- Confusion between order dispute and DSR.  
- Exposing internal staff notes to customers if DTO not filtered.  
- NTFS/Live file aliases — edit canonical sources carefully.

### Test plan (post-implementation)
Per master prompt Part 7: ownership, unauthenticated reject, no cross-UID submit, no client status mutation, admin RBAC, deletion does not wipe orders, profile/sync/auth regression, responsive, build. Use test accounts only — **no production customer deletion**.

---

## 6. Approval gate questions for owner

1. Approve WP1–WP5 as Phase 1D scope?  
2. Include WP6 (token stripping) in 1D or defer to security phase?  
3. Confirm deletion completion actions allowed for staff (e.g. clear name/phone/email on customer doc vs Firebase Auth disable) — without inventing legal outcomes.  
4. Confirm marketing consent remains out of 1D (recommended).

---

## 7. Explicit non-actions in this step

- No application source changes for 1D features.  
- No Firestore/API creation.  
- No deploy, commit, or push.  
- No Phase 1E started.

**UPDATE:** Owner approved WP1–WP5 + WP7; WP6 deferred to audit-only. Implementation reports filed. Stop before commit/push/deploy and before Phase 1E.
