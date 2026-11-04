# Phase 1B Implementation Report

**Date:** 2026-11-04  
**Scope:** Global footer + contextual policy links  
**Deploy / commit / push:** **Not performed**  
**Phase 1C+:** **Not started**

---

## 1. Summary

Integrated the six Phase 1A legal routes into `SalonPresenceFooter` (three customer-facing groups) and added compact policy notices on registration, appointment, checkout, order detail, and account overview. Publication safeguards from 1A are unchanged. No sitemap entries for legal pages. No auth/consent/backend/payment changes.

---

## 2. Footer structure

| Column | Contents |
|--------|----------|
| Brand / NAP | Existing `SALON_PUBLIC` name, blurb, address, hours, phone + catalog / appointment / shop |
| Thông tin kinh doanh | `/thong-tin-ho-kinh-doanh`, `/#artist` (Giới thiệu), `/#faq` |
| Chính sách & điều khoản | Privacy, terms, payment, shipping/returns |
| Hỗ trợ khách hàng | `/lien-he-khieu-nai` + Maps / Facebook / Zalo / Portfolio |

Layout: `sm:grid-cols-2` · `lg:grid-cols-4`. Tap targets via `min-h-11` on links.

**Not done:** copying SEO NAP into legal config.

---

## 3. Contextual links

| Location | Links | Notes |
|----------|-------|-------|
| `/register` | Privacy + Terms | Disclosure text only — **no** consent checkbox |
| Appointment form | Terms + Privacy | Only when service cart has items; request ≠ confirmed copy |
| Checkout | Payment (near method); Terms + Payment + Shipping before submit; Shipping notice when Delivery | |
| Order detail | Payment + Shipping + Complaints | Below order actions |
| Account overview | Privacy + Complaints + Terms | Single block; avoid clutter |

Shared component: `FormLegalNotice`.

---

## 4. Files

### Created
- `frontend/src/shared/components/FormLegalNotice.tsx`
- `docs/planning/PHASE_1B_IMPLEMENTATION_REPORT.md`
- `docs/planning/PHASE_1B_TEST_REPORT.md`

### Modified
- `frontend/src/shared/components/SalonPresenceFooter.tsx`
- `frontend/src/modules/account/RegisterPage.tsx`
- `frontend/src/modules/appointment/components/AppointmentForm.tsx`
- `frontend/src/modules/booking/components/CheckoutForm.tsx`
- `frontend/src/modules/orders/OrderDetailPage.tsx`
- `frontend/src/modules/account/AccountPage.tsx`
- `docs/TIEN_DO.md`

---

## 5. Preview

- Build verified: `npm run build` (exit 0)
- Local preview: `http://127.0.0.1:4174/` (also tested earlier on `:4173`)

---

## 6. Limitations

- Appointment / checkout legal notices require non-empty carts (by design).
- Account overview links need login — not exercised with a real session this pass.
- Order-detail links require a loaded order — not exercised with a real order id.
- Sticky mobile CTA can intercept footer clicks in automation; footer links remain in DOM and work via navigation.
- Legal pages remain drafts (`PENDING_OWNER_INPUT`); banners preserved.
