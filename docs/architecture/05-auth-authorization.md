# 05 — Auth & Authorization

> **Canonical IAM design:** [`iam/00-README.md`](./iam/00-README.md)
> This file is a **short summary**. Where details conflict, the **IAM pack supersedes** this document.
> **Status:** Design documentation only — login/auth **not yet implemented**.

## Purpose

Enterprise AuthN/AuthZ for multi-tenant carriers, drivers, portal users, and platform admins. Aligns with least privilege and Constitution accountability.

**Current anchors (stubs):** `lib/auth/session.ts`, `lib/permissions/*`, portal 2FA route `app/portal/verify-2fa`.
**Authoritative IAM design:** [`iam/00-README.md`](./iam/00-README.md) (threat model, tenancy, roles). This file is the architecture-index summary.

---

## Authentication (AuthN)

| Principal | Method (target) |
|-----------|-----------------|
| Ops users | Email/password or SSO (SAML/OIDC) + optional MFA |
| Drivers | Phone/email magic link or password; device-bound session |
| Portal (broker/customer) | Invite-based accounts + MFA |
| Platform admin | SSO + MFA mandatory; separate role plane |
| Service / webhooks | Signed secrets, mTLS optional later |
| Public track links | Opaque unguessable tokens (not user sessions) |

### Session model

- Server-side session (cookie, `HttpOnly`, `Secure`, `SameSite`) or short-lived access + rotating refresh.
- Session payload: `user_id`, `company_id` (active tenant), `roles`, `auth_strength` (password vs MFA).
- Tenant switch (multi-entity) re-issues session claims; never trust client-supplied `company_id` alone.
- Idle and absolute timeouts; step-up MFA for payroll, banking, permission changes, migration commit.

**Do not overengineer:** one IdP integration path (e.g. OIDC) covering SSO; avoid custom crypto.

---

## Authorization (AuthZ)

Hybrid **RBAC + ABAC**:

### RBAC

Roles (examples; catalog in `lib/permissions/roles.ts` / permissions-catalog):

| Role | Typical access |
|------|----------------|
| Owner | Full company |
| Dispatcher | Loads, drivers, docs (ops) |
| Accountant | Finance, payroll drafts, IFTA |
| Safety | Compliance, DVIR, incidents |
| Driver | Self + assigned loads |
| PortalUser | Shared loads/invoices only |
| PlatformAdmin | Cross-tenant support tools |

Permissions are fine-grained strings (`loads:assign`, `payroll:approve`, `migration:commit`, …).

### ABAC attributes

- `company_id` / entity membership
- Resource ownership (assigned driver)
- Record status (cannot edit locked settlement)
- Auth strength (MFA required)
- AI automation level (company settings) — does not grant AuthZ; only shapes suggestions

Evaluation order: authenticate → resolve tenant → RBAC permission → ABAC constraints → audit if sensitive.

---

## Least privilege

- Default deny.
- Nav hiding is UX only; every mutation re-checks.
- Break-glass support access: time-boxed, audited, reason-coded.
- Alph and automations run **as the user** (or a constrained service principal) — never as implicit superuser.

---

## MFA & SSO

| Trigger | Requirement |
|---------|-------------|
| Portal login | MFA recommended / required for financial docs |
| Payroll approve, bank change, role grant | Step-up MFA |
| Enterprise customers | SSO available; SCIM later (T2+) |
| Platform admin | MFA always |

Store TOTP/WebAuthn factors encrypted; never log secrets.

---

## AI-related authorization

Per [Master Constitution](../../constitution/00-master-constitution.md) and `lib/ai-safety/`:

- AI cannot grant itself permissions.
- Critical action kinds require human confirmation regardless of role convenience settings.
- Automation levels may auto-run **non-critical** actions only when policy allows — still AuthZ-checked and audited.

---

## API auth

| Client | Mechanism |
|--------|-----------|
| Browser ops | Session cookie |
| Driver app | Session or bearer bound to device |
| Public API (future) | OAuth2 client credentials / user tokens, scoped |
| Webhooks inbound | HMAC signature + timestamp |
| Track tokens | Capability URL |

---

## Mapping to today

Evolve `lib/permissions/{check,roles,permissions-catalog,audit}` into DB-backed memberships. Normalize permission codes toward `resource:action` (see IAM [05-permissions.md](./iam/05-permissions.md)); keep intent stable during migration.

## Full design pack

| Topic | Doc |
|-------|-----|
| Index & decisions | [iam/00-README.md](./iam/00-README.md) |
| Threats | [iam/01-threat-model.md](./iam/01-threat-model.md) |
| AuthN / sessions | [iam/02-authentication.md](./iam/02-authentication.md) |
| Tenancy | [iam/03-multi-tenancy.md](./iam/03-multi-tenancy.md) |
| Roles / permissions | [iam/04-roles.md](./iam/04-roles.md) · [iam/05-permissions.md](./iam/05-permissions.md) |
| Roadmap | [iam/13-implementation-roadmap.md](./iam/13-implementation-roadmap.md) |
| DB tables | [database/10-identity-tenancy.md](./database/10-identity-tenancy.md) · [iam/12-data-model.md](./iam/12-data-model.md) |
