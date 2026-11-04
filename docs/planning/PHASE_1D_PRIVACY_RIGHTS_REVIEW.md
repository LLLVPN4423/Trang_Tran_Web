# Phase 1D — Privacy Rights Review

**Date:** 2026-11-04  
**Scope:** Customer rights vs implemented controls after Phase 1D

---

## Rights coverage

| Right | Mechanism | Status after 1D |
|-------|-----------|-----------------|
| View personal data (account fields) | Account Profile + Privacy Center inventory | **Met** for verified field groups |
| View related data (orders, appointments, loyalty) | Existing Account tabs + inventory links | **Met** (in-product access); formal Access ticket also available |
| Ordinary correction (name/phone/email) | Profile → `PUT /api/customers/me` | **Met** — reused, not duplicated as mandatory ticket |
| Staff-mediated correction | Privacy request type `Correction` | **Met** (workflow) |
| Access request ticket | Type `Access` | **Met** (workflow) |
| Deletion request | Type `Deletion` — intake + review only | **Met** as request; **not** automated erasure |
| Restriction request | Type `Restriction` | **Met** as request |
| Withdraw marketing consent | N/A | **Out of scope** — no marketing consent store (Phase 1F) |
| Track request status | Customer Privacy Center list/detail + history | **Met** |
| Staff intake / decision | Admin `/admin/privacy-requests` | **Met** |

---

## Safety principles applied

1. Authenticated UID is the only customer identity for create/list/get-mine.  
2. Status changes are Admin-policy only; history is append-only.  
3. Internal notes never appear on customer DTOs.  
4. Completing Deletion/Restriction records a decision; it does **not** delete Orders, Payment records, Appointments, Customer docs, or Firebase Auth.  
5. No invented consent records.

---

## Business / legal caveats (owner)

- Formal retention schedule still **OWNER_INPUT** — staff must decide case-by-case until policy exists.  
- Anonymization / Auth disable are **not** automated and must not be improvised without approved playbook.  
- Order dispute remains a commerce flow, separate from DSR.  
- Phase 1C registration acknowledgement remains UI-only until 1F.

---

## Security notes carried forward

- See `PHASE_1D_WP6_ACCESSTOKEN_AUDIT.md` for AccessToken exposure on list/`me` DTOs (deferred).  
- Firestore Security Rules still not in repo (Admin SDK path primary).
