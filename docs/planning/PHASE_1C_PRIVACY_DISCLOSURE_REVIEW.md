# Phase 1C — Privacy Disclosure Review

**Date:** 2026-11-04  
**Nature:** Product/legal-process note for Phase 1C — not a compliance certificate.

---

## 1. Distinctions implemented

| Concept | How Phase 1C treats it |
|---------|------------------------|
| **Notice** | Short explanation of account-related processing + links to full privacy & terms |
| **Acknowledgement** | Checkbox: “đã đọc thông báo…” — UI gate for register (email + Google) |
| **Consent (legal basis)** | Not collected as blanket consent; copy clarifies acknowledgement ≠ consent |
| **Marketing consent** | **Not activated** — would mislead without durable recording (→ Phase 1F) |

---

## 2. Vietnamese disclosure (summary)

- Purpose: hồ sơ, đơn hàng, đặt lịch, hỗ trợ; Google = authentication only.
- Links: Chính sách bảo mật · Điều khoản giao dịch.
- Version: `privacyConfig.noticeVersion` via `getPrivacyNoticeVersion()`.
- Ack help text: không phải đồng ý mọi mục đích; không phải marketing.

---

## 3. Why marketing was deferred

Owner prompt: do not claim consent recorded unless backend confirms. Phase 1C forbids new Firestore/consent APIs. A visible marketing checkbox without persistence would imply legal capture that does not exist → **deferred to 1F**.

---

## 4. Version / re-acknowledgement

| Mechanism | Status |
|-----------|--------|
| Central version string | Done |
| `materialChangeId` for future re-prompt | Config present |
| Force ack every login | **Not done** (correct) |
| Durable store of ack version per customer | **1F** |
| Re-prompt existing users after material change | **1F** |

---

## 5. Backend dependencies (explicit)

| Need | Phase |
|------|-------|
| Append-only acknowledgement events (uid, noticeVersion, timestamp, source) | 1F |
| Optional marketing consent grant/withdraw | 1F |
| Admin review of records | 1F |
| DSR workflows | 1D/1F |

Until then, the checkbox is a **product UX gate**, not an audit-grade legal record.

---

## 6. Residual legal / product issues

1. Privacy pages remain drafts pending owner HKD inputs (`PENDING_OWNER_INPUT`).
2. Acknowledgement without server persistence has limited evidentiary value.
3. Google OAuth screen ≠ salon privacy notice (stated in UI; still needs counsel review of bases — see `LEGAL_REVIEW_REQUIRED.md`).
4. No claim that Phase 1C completes PDPD / e-commerce compliance.
