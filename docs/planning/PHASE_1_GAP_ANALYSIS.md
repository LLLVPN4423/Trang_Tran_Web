# Phase 1 — Implementation Gap Analysis

**Date:** 2026-11-04  
**Step:** 1 — Inspection only (no application code modified)  
**Status:** **AWAITING OWNER APPROVAL** before Phase 1A coding  

**Owner name supplied (CONFIRMED for display as owner person):** Trần Xuân Trang  
**Do not assume** this equals registered Hộ KD name until registration documents confirm it.

---

## 1. Inspection summary

| Layer | Verified |
|-------|----------|
| Frontend | React 19 + Vite; routes in `frontend/src/app/App.tsx`; `PageLayout` + `SalonPresenceFooter` |
| Auth | Firebase email/password + Google (`AuthProvider`, `firebase.ts`); customer sync via `POST /api/customers/sync` |
| Customer IDs | `Customer.Id` (app) ≠ `Customer.FirebaseUid` — **keep both** (`CustomerService.SyncAsync`) |
| Appointments | Create = request (`Pending`); admin updates status; form already says salon will call to confirm |
| Checkout | `CheckoutForm` + shipping zones/fees in `orderFulfillment.ts`; VietQR in `VietQrPayment` |
| Payment ops | Pending → Admin Paid; SePay webhook exists but **not** live verifier |
| Admin | Orders, appointments, customers, site-content, etc. — **no** privacy-request module |
| Firestore | Backend Admin SDK collections (`customers`, `orders`, `appointments`, …); **no `firestore.rules` in repo** |
| Legal pages | **None** of the six routes exist |
| Consent / DSR | **No** entities, APIs, or UI |

Planning baselines already exist: `docs/planning/*`, `docs/audit/*`.

---

## 2. Gap matrix vs Phase 1 requirements

| Sub-phase | Requirement | Current state | Gap | Reuse / approach |
|-----------|-------------|----------------|-----|------------------|
| **1A** | Six legal routes | Missing from `App.tsx` | Build pages + shared layout | New module e.g. `modules/legal/`; shared `PolicyPageLayout`; Dark Luxury tokens |
| **1A** | Centralized owner-input config | Only `salonPublicInfo.ts` (public NAP) | New `config/legal/*` with status fields | Single source for all six pages; statuses CONFIRMED / OWNER_INPUT_REQUIRED / LEGAL_REVIEW_REQUIRED / NOT_APPLICABLE |
| **1A** | Placeholder vs production behavior | N/A | Implement env-aware rendering | Dev: labeled placeholders; Prod: hide incomplete optional; never invent; never show raw status enums |
| **1B** | Footer groups (Business / Policies / Support) | Footer has NAP + web links + channels — **no policy links** | Extend `SalonPresenceFooter` | Preserve Maps/Zalo/FB; add three columns/sections |
| **1B** | Policy links on register / appointment / checkout / order / account | Absent | Add `FormLegalNotice` (compact) | Avoid clutter: one notice block per form |
| **1C** | First-time privacy disclosure (email + Google) | Register has no notice/checkbox | Gate registration UX + record acknowledgement | Do **not** rebuild Firebase; Google OAuth scopes unchanged |
| **1C** | Notice ≠ consent; no pre-checked marketing | Marketing not present | Acknowledgement of notice only; marketing opt-in **optional + unchecked** (default: omit marketing unless owner adds) | |
| **1C** | Returning login / policy version bump | N/A | Store `privacyNoticeVersion` acknowledgement; re-prompt only on material version change | Backend record preferred over localStorage-only |
| **1D** | Data subject requests (access/correct/delete/…) | Missing | New API + Firestore collection + account/complaints UI + admin panel | Server-side authz; **no** auto-delete of orders/profiles |
| **1E** | Appointment disclosures | Partial (“chưa chốt lịch”) | Add policy links + explicit request ≠ confirmed | Keep status machine |
| **1E** | Checkout review before submit | Cart + form fields exist | Surface totals/fees/policy links; confirm editable fields | Align with Art. 12 review theme |
| **1E** | VietQR manual verification copy | QR + amount + PaymentCode | Add “staff verifies bank; status Pending until Paid” + support link | **Do not** enable SePay |
| **1F** | Consent / notice audit records | No model | New domain entity + repository + Admin-only writes | Clients must not write privileged audit rows |
| **1F** | Admin privacy-request handling | No panel | Extend admin nav + panel | Mirror `CustomersAdminPanel` patterns |
| **1F** | Firestore Security Rules | Not in repo | Document limitation; API Admin SDK path remains primary | OWNER: export/confirm rules if client access exists |
| **1G** | Tests + five reports | Planning matrices only | After implementation | PASS only if executed |

---

## 3. Centralized legal config — proposed design (not implemented)

Suggested location (adapt on implement):

```text
frontend/src/shared/config/legal/
  types.ts                 # FieldStatus, LegalField<T>
  businessInfo.ts          # HKD / owner / addresses / contacts
  privacyConfig.ts         # processors, retention placeholders, notice version
  transactionPolicy.ts     # shipping/return/cancel/refund placeholders
  legalPageMeta.ts         # routes, titles, version, lastUpdated
  index.ts                 # exports + buildOwnerInputReport()
```

| Field | Initial value | Status |
|-------|---------------|--------|
| `ownerName` | `"Trần Xuân Trang"` | **CONFIRMED** |
| `businessName` (registered HKD) | `null` | OWNER_INPUT_REQUIRED |
| `taxCode` | `null` | OWNER_INPUT_REQUIRED |
| `registrationNumber` / date | `null` | OWNER_INPUT_REQUIRED |
| `registeredAddress` | `null` | OWNER_INPUT_REQUIRED |
| `operatingAddress` | May **reference** existing public salon address in `SALON_PUBLIC` only after owner confirms “same as public salon” | OWNER_INPUT_REQUIRED until confirmation |
| Official / support / complaint phone & email | `null` for **legal pages** until confirmed | OWNER_INPUT_REQUIRED |
| Support hours | `null` | OWNER_INPUT_REQUIRED |
| Return / refund / cancel policy text | `null` | OWNER_INPUT_REQUIRED |
| Retention periods | `null` | OWNER_INPUT_REQUIRED |
| Privacy request contact | `null` | OWNER_INPUT_REQUIRED |
| Shipping zone fees | Values exist in `orderFulfillment.ts` | Treat as **system-implemented fees**; public policy text still needs owner confirmation / LEGAL_REVIEW before calling them “official policy” |

**Important split:**  
`SALON_PUBLIC` (SEO/CTA phone `0986 586 058`, Tuấn Lan address) remains for marketing NAP.  
Legal/HKD fields stay in `config/legal` and stay empty until owner confirms — **do not silently copy** registration fields from SEO constants.

---

## 4. Backend / data — proposed additions (not implemented)

| Piece | Proposal | Notes |
|-------|----------|-------|
| Collection `privacyRequests` | id, firebaseUid, customerId, type, body, orderId?, appointmentId?, status, createdAt, history[] | Create by authenticated customer (or verified flow); status updates **Admin only** |
| Collection `privacyAcknowledgements` / consent events | customerId, firebaseUid, noticeVersion, purpose, action (`notice_ack` / `consent_grant` / `consent_withdraw`), timestamp, source | Append-only; no overwrite history |
| Policy metadata | version string in frontend config (+ optional backend mirror later) | Material change → re-ack |
| Endpoints | `POST/GET /api/privacy-requests` (me); Admin list/patch | Mirror `CustomersController` auth patterns |
| Auto-delete | **Forbidden** on request submit | Staff workflow + legal retention check |

**Do not** change existing `Customer.Id` generation or Firebase UID linkage.

---

## 5. Frontend integration points (files likely touched later)

| Area | Files |
|------|-------|
| Routes | `App.tsx` |
| Footer | `SalonPresenceFooter.tsx` |
| Register / Google | `RegisterPage.tsx`, `GoogleSignInButton.tsx` / AuthForm |
| Appointment | `AppointmentForm.tsx` |
| Checkout / payment | `CheckoutForm.tsx`, `VietQrPayment.tsx`, `PaymentPanel.tsx`, `OrderDetailPage.tsx` |
| Account | `AccountPage.tsx` (new tab or link) |
| Complaints | new page + form → privacy/complaint API |
| Admin | `AdminLayout.tsx` + new panel |
| Sitemap | `frontend/public/sitemap.xml` |
| API client | `endpoints.ts`, `types.ts` |

---

## 6. Risks if implementation starts without controls

1. Publishing invented HKD/tax/return deadlines → **compliance & trust failure**.  
2. Treating Google OAuth as blanket salon consent → incorrect legal framing.  
3. Client-writable “consent” or request-status fields → integrity failure.  
4. Auto-deleting orders/loyalty on DSR → breaks retention / accounting.  
5. Cluttering every screen with duplicate policy walls → UX regression.  
6. Enabling SePay or changing Paid flow → **out of scope / forbidden**.  
7. Deploy/commit without approval → violates absolute restrictions.

---

## 7. Recommended implementation sequence (after approval)

As mandated: **1A → 1B → 1C → 1D → 1E → 1F → 1G**, stop between sub-phases for owner approval.

**First coding slice after approval (1A only):**
1. Create `shared/config/legal/*` with statuses.  
2. Create six routes + shared policy layout + content composed from config.  
3. Generate draft `OWNER_INPUT_REPORT.md` from config (dev/report).  
4. No footer/auth/DSR yet until 1A accepted.

---

## 8. Owner decisions requested before / with 1A approval

1. Approve starting **Phase 1A only** (legal pages + central config; no deploy/commit).  
2. Confirm whether public salon phone/address in `SALON_PUBLIC` may be shown on legal pages as **operating contact** while HKD registration fields remain blank.  
3. Confirm: **no marketing** opt-in in Phase 1 (recommended default).  
4. Confirm SePay remains **disabled** as live verifier (already owner fact).  
5. Any known return/refund/cancel text already decided? (else leave OWNER_INPUT_REQUIRED).

---

## 9. Explicit non-actions in this step

- No source code changes.  
- No Firebase / Cloud Run / Cloudflare / Firestore changes.  
- No SePay activation.  
- No deploy, commit, or push.  
- No remediation of SEC-* items (those are Phase 2+ security roadmap).

---

## 10. Definition of ready to code 1A

Owner replies approving Step 2 / Phase 1A (and preferably answers §8 items 2–3). Until then: **STOP**.
