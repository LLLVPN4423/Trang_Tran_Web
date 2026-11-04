# Phase 1C Implementation Report

**Date:** 2026-11-04  
**Scope:** Authentication & privacy disclosure (frontend)  
**Deploy / commit / push:** **Not performed**  
**Phase 1D+:** **Not started**

---

## 1. Summary

Registration (email/password and Google) now shares one privacy disclosure block: short purpose text, links to `/chinh-sach-bao-mat` and `/dieu-khoan-giao-dich`, notice version from centralized config, and an **acknowledgement** checkbox that gates both submit and Google.

Firebase Auth, OAuth, customer sync, and login for returning users are unchanged. No backend acknowledgement/consent APIs. Marketing consent **deferred** to Phase 1F (would be misleading without durable recording).

---

## 2. Behaviour

| Flow | Behaviour |
|------|-----------|
| Register | Disclosure above form; unchecked ack by default; email submit + Google disabled until checked |
| Login | No re-acknowledgement (not every login) |
| Google on register | Same disclosure; OAuth scopes/config untouched |
| Marketing | Explicit copy: not requested at registration; future opt-in separate |

**Wording:** acknowledgement = “đã đọc thông báo” — explicitly **not** blanket consent and **not** marketing consent.

---

## 3. Version strategy

| Source | Role |
|--------|------|
| `privacyConfig.noticeVersion` | Customer-facing version (`1.0.0-draft`) |
| `privacyConfig.materialChangeId` | Key to bump for future renewed-ack (1F) |
| `getPrivacyNoticeVersion()` / `getPrivacyMaterialChangeId()` | Single helpers in `config/legal` |

Privacy policy page uses `getPrivacyNoticeVersion()`. Policy remains draft / not legally approved.

---

## 4. Files

### Created
- `frontend/src/modules/account/components/RegistrationPrivacyDisclosure.tsx`
- `docs/planning/PHASE_1C_IMPLEMENTATION_REPORT.md`
- `docs/planning/PHASE_1C_TEST_REPORT.md`
- `docs/planning/PHASE_1C_PRIVACY_DISCLOSURE_REVIEW.md`

### Modified
- `frontend/src/modules/account/RegisterPage.tsx`
- `frontend/src/modules/account/LoginPage.tsx` (`AuthForm` submitDisabled / beforeSubmit)
- `frontend/src/shared/components/GoogleSignInButton.tsx` (`disabled` / `disabledHint`)
- `frontend/src/shared/config/legal/privacyConfig.ts` (`materialChangeId`)
- `frontend/src/shared/config/legal/index.ts` (version helpers)
- `frontend/src/modules/legal/pages/PrivacyPolicyPage.tsx` (version helper)
- `docs/TIEN_DO.md`

---

## 5. Deferred to Phase 1F

- Durable acknowledgement / consent records (Firestore + API)
- Re-prompt on material policy change for existing customers
- Optional marketing consent UI + recording
- Admin audit view of acknowledgements

Client checkbox is a **UI gate only**, not a legal audit trail.

---

## 6. Preview

`http://127.0.0.1:4175/register` · `http://127.0.0.1:4175/login`
