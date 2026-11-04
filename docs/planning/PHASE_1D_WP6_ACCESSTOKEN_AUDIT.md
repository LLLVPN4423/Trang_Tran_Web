# Phase 1D — WP6 accessToken Security Audit (DEFERRED — no code change)

**Date:** 2026-11-04  
**Scope:** Identify where `accessToken` appears in DTOs/APIs and how the frontend uses it.  
**Action taken:** Audit only — **no DTO/API changes** in Phase 1D.

---

## 1. DTOs that include AccessToken

| DTO | File | Field |
|-----|------|-------|
| `OrderResponse` | `backend/.../DTOs/OrderDtosLive.cs` | `AccessToken` |
| `AppointmentResponse` | `backend/.../DTOs/AppointmentDtos.cs` | `AccessToken` |

Domain entities also store tokens: `Order.AccessToken`, `Appointment.AccessToken`.

---

## 2. APIs that return the token

| Endpoint | When token is returned | Auth model |
|----------|------------------------|------------|
| `POST /api/orders` (create) | Always on create response | Public write + rate limit |
| `GET /api/orders/{id}` | Full `OrderResponse` when authorized via admin, owner, or `?token=` | Mixed |
| `GET /api/orders` (list) | Mapped via same `OrderResponse` — **includes AccessToken for authenticated customer/admin list** | Authorize / Admin |
| Service invoice create/update paths | Same `OrderResponse` mapper | Admin |
| `POST /api/appointments` | Create returns AccessToken | Public write |
| `GET /api/appointments/me` | List uses same mapper — **includes AccessToken** | Authorize |
| `GET /api/appointments/{id}` | Full response when authorized | Mixed |
| `GET /api/appointments` (admin list) | Full responses with tokens | Admin |

Capability check: `AccessTokenGenerator.Matches` on order/appointment get-by-id and some mutations (`ConfirmReceived`, dispute).

---

## 3. Frontend / workflow consumers

| Consumer | Usage |
|----------|--------|
| `PaymentPanel` / booking success | Deep-link `/orders/{id}?token=...` |
| `pendingOrderStorage` | Persists `{ id, accessToken, ... }` in localStorage for guest resume |
| `useOrderPolling` | Polls `fetchOrder(id, accessToken)` until Paid |
| `ServiceInvoicesAdminPanel` | Copies share link with token for customer |
| `OrderDetailPage` / query `token` | Guest access without login |
| Account UI | Does **not** display AccessToken in DOM; may still receive it in JSON for own orders/appointments |

---

## 4. Risk assessment

| Risk | Severity | Notes |
|------|----------|-------|
| Authenticated list/me responses re-expose capability secrets already held by owner | Medium | Redundant if JWT already proves ownership; increases XSS/localStorage blast radius |
| Admin list responses include all customers’ tokens | Medium–High | Admin compromise or XSS on admin page yields guest capability URLs |
| Token in URL query string | Medium | Leaks via Referer, browser history, shared screenshots |
| Guest checkout depends on token | — | Stripping create/get-by-token responses would break guest payment tracking |

---

## 5. Proposed remediation (future phase — owner decision)

1. **Split DTOs:** `OrderPublicResponse` (no token) vs `OrderCreatedResponse` / `OrderCapabilityResponse` (with token).  
2. **Strip from list/`me`:** Keep token only on `POST` create and on get-by-id when access was via query token (or return once).  
3. **Admin lists:** Never return AccessToken; admin uses Admin policy, not capability tokens.  
4. **Optional:** Move guest token from query string to fragment or one-time session storage (larger UX change).  
5. **Do not** remove token generation itself — guest VietQR / order tracking still needs a capability secret until an alternate design is approved.

**Blast radius if stripped carelessly:** booking payment polling, pending order resume, invoice share links, guest order detail.

---

## 6. Phase 1D decision

**Deferred.** No code changes under WP6. Owner should approve a dedicated security hardening package before modifying DTO mapping.
