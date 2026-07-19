# 02 — Authentication & Sessions

**Parent:** [00-README.md](./00-README.md)
**Canonical design:** [`../iam/02-authentication.md`](../iam/02-authentication.md) · [`../iam/08-security-controls.md`](../iam/08-security-controls.md)

---

## Current implementation

### Ops app (`lib/auth/session.ts`)

```ts
// Conceptual — always authenticated demo owner
getCurrentSession() → {
  tenantId, companyId, userId: "alpha-owner",
  role: "owner", isAuthenticated: true
}
```

- No cookies, JWT validation, or logout.
- `requireRole()` exists but only checks the stub role.
- Compatible with UI that assumes a logged-in Owner for alpha demos.

### Customer / broker portal (`lib/portal/session.ts`)

- Email/password checked against **seed users** in the browser.
- Session stored in `localStorage` (not HttpOnly).
- Demo 2FA code flow (not cryptographic MFA).
- **Demo-only.** Must be replaced with server-side AuthN before any real portal tenant.

### IFTA accountant (`lib/ifta/accountant-auth.ts`)

- Same pattern: hardcoded demo credentials + `localStorage`.
- Session marked `readOnly: true` (good intent; not a server enforcement).

### Driver surfaces

- Driver app routes use seed/demo data; no separate production AuthN stack yet.
- Target: narrow driver permissions + device binding ([`../iam/11-future-surfaces.md`](../iam/11-future-surfaces.md)).

---

## Target session model (IAM)

| Property | Target |
|----------|--------|
| Provider | Supabase Auth (recommended) |
| Cookie | `HttpOnly`, `Secure`, `SameSite=Lax` |
| Idle / absolute TTL | Per IAM security controls |
| MFA | Step-up for sensitive permissions |
| Revocation | Password change / suspend / device revoke |
| Impersonation | Time-boxed, audited, Owner-only |

---

## Incremental rules (until IAM ships)

1. Treat all “sessions” as **demo trust** — never store real customer credentials in seed modules for production builds.
2. Do not add a second parallel auth system; implement Supabase per IAM pack.
3. Server Actions that mutate money/compliance must call `resolveApiAuthContext` (or successor) once AuthN is real.
4. Portal/IFTA localStorage auth must not be reused for production APIs.

---

## Compatibility note

This assessment **does not** change login UX or remove portal demo login. Hardening AuthN is Phase A of the [roadmap](./08-remediation-roadmap.md).
