# Legal Review Required — Phase 1A

**Date:** 2026-11-04  
**Nature:** Technical drafting flags — **not** legal advice. Have a qualified Vietnamese lawyer review before treating pages as final compliance artifacts.

---

## 1. Items flagged in config

| ID | Topic | Why review needed | Config / page |
|----|-------|-------------------|---------------|
| LR-01 | Legal bases for processing | Map each purpose to Luật 91/2025 + NĐ 356/2025; consent vs contract vs other bases | `privacyConfig.legalBasesReview` · `/chinh-sach-bao-mat` |
| LR-02 | Household-business carve-outs | Art. 41 NĐ 356 exemptions from Art. 21/22/33(2) Luật 91 are **conditional** — not a blanket waiver | Privacy + business identity |
| LR-03 | E-commerce operator disclosures | Luật 122/2025 Art. 11–12 public information completeness once HKD fields filled | All six pages |
| LR-04 | Art. 14 notification | Online product ordering likely in scope; filing is owner duty (NĐ 248) — site pages ≠ notification | `ecommerceNotificationStatus` |
| LR-05 | Controller identity | Until registered HKD name/address confirmed, controller block is incomplete | Privacy + business pages |
| LR-06 | Retention vs deletion rights | Cannot promise immediate deletion of order records without retention analysis | Privacy §7 |
| LR-07 | Processor / DPA posture | Firebase, GCP, Cloudflare, VietQR image host listed from code; contractual status unknown | Privacy §5 |
| LR-08 | Shipping fee disclosure | Checkout has technical fees; legal policy text intentionally empty until owner+counsel approve | Shipping page |
| LR-09 | Tax ID public display | Do not assert mandatory public MST without exact applicable provision | Business page |

---

## 2. Drafting choices that need counsel confirmation

1. Wording that Google OAuth ≠ salon-wide consent (kept intentionally conservative).
2. Statement that SePay is not the live payment verifier.
3. Appointment request ≠ confirmed appointment.
4. Customer-facing banner that documents are not final legal publication while `publicationStatus !== READY_FOR_OWNER_APPROVAL`.

---

## 3. What Phase 1A does **not** claim

- Full PDPD / e-commerce compliance.
- Completed Ministry notification.
- Approved return/refund/cancel schedules.
- That publishing these routes alone satisfies Art. 11–14 duties.

---

## 4. Suggested review package for counsel

1. Export or share the six routes (local preview or staging after deploy approval).  
2. `OWNER_INPUT_REPORT.md` + filled HKD documents.  
3. `docs/planning/LEGAL_COMPLIANCE_MATRIX.md` + `docs/audit/LEGAL_COMPLIANCE_AUDIT.md`.  
4. Confirm marketing: none planned vs opt-in later.
