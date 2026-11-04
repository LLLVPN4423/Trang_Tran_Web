# Phase 1C Test Report

**Date:** 2026-11-04  
**Environment:** `npm run build` + preview `http://127.0.0.1:4175`  
**Statuses:** PASS | FAIL | BLOCKED | NOT RUN

---

## Build

| ID | Result | Status |
|----|--------|--------|
| T1C-BUILD-01 | Production build exit 0 | **PASS** |

---

## Registration UI

| ID | Steps | Status |
|----|-------|--------|
| T1C-REG-01 | `/register` shows single disclosure, version `1.0.0-draft`, privacy + terms links | **PASS** |
| T1C-REG-02 | Ack unchecked → Đăng ký + Google **disabled** | **PASS** |
| T1C-REG-03 | Check ack → both buttons enabled | **PASS** |
| T1C-REG-04 | Copy states acknowledgement ≠ consent ≠ marketing | **PASS** |
| T1C-REG-05 | No marketing checkbox present | **PASS** |
| T1C-REG-06 | No duplicate FormLegalNotice under email form | **PASS** |
| T1C-REG-07 | Mobile 390 layout of disclosure | **PASS** (viewport + snapshot) |

---

## Auth submission / OAuth

| ID | Steps | Status |
|----|-------|--------|
| T1C-EMAIL-01 | Complete email/password registration to Firebase | **NOT RUN** (avoid new production accounts) |
| T1C-GOOGLE-01 | Complete Google OAuth registration | **NOT RUN** (UI gate only; no live OAuth this pass) |
| T1C-LOGIN-01 | `/login` has no privacy ack gate; email + Google available | **PASS** |
| T1C-LOGIN-02 | Successful login with real credentials | **NOT RUN** |
| T1C-RECOVERY-01 | Password reset / account recovery | **NOT RUN** (unchanged; no UI in scope) |
| T1C-SYNC-01 | Customer sync after register | **NOT RUN** (no new account created) |

---

## Version / policy

| ID | Steps | Status |
|----|-------|--------|
| T1C-VER-01 | Register shows same version string as `getPrivacyNoticeVersion()` | **PASS** |
| T1C-POL-01 | Privacy policy page still loads; version helper used | **PASS** (build includes page; prior route verified in 1A/1B) |

---

## Conclusion

UI/disclosure gates for Phase 1C **PASS**. Live Firebase account creation / OAuth completion **NOT RUN** by design (no unnecessary production accounts).
