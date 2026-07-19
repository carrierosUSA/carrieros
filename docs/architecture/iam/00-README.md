# Transpo.ai Enterprise Authentication & Permissions (IAM)

**Status:** Design documentation only — **not yet implemented**
**Audience:** Engineers, architects, security, product
**Scope:** Identity, authentication, sessions, multi-tenant isolation, RBAC, team lifecycle, audit, API security
**Governance:** [`/constitution`](../../../constitution/INDEX.md) — Master Constitution Version 1.0 is highest authority
**Parent architecture:** [`../00-README.md`](../00-README.md)
**Database companion:** [`../database/10-identity-tenancy.md`](../database/10-identity-tenancy.md)
**Security assessment:** [`../security/00-README.md`](../security/00-README.md)

---

## Critical notice

| Item | Status |
|------|--------|
| IAM design pack (this folder) | **Complete** (docs 00–13; verify against checklist before coding) |
| Login pages / auth UI | **Not implemented in this task** |
| Password hashing / session middleware | **Not implemented** |
| SQL migrations for auth tables | **Not generated** |
| Production IdP wiring | **Not wired** |

This folder defines the **target enterprise IAM**. Do not treat stub sessions or demo roles in `carrieros-app` as the production model.

**Thin predecessor:** [`../05-auth-authorization.md`](../05-auth-authorization.md) remains a short summary. **This pack is the canonical IAM design** and supersedes thin auth sections where they conflict.

---

## Principles

Aligned with Master Constitution v1.0, Trust & Safety Charter, Foundation, and Engineering Constitution:

1. **Humans control critical actions** — IAM never grants AI authority to approve payroll, payments, dispatch, compliance, or legal outcomes.
2. **Least privilege / deny by default** — no permission unless explicitly granted.
3. **Never trust the frontend** — UI may hide controls; **backend and RLS enforce** every check.
4. **Strict multi-tenancy** — every company isolated at DB, API, and UI; never cross-tenant access.
5. **Simple UX, enterprise security** — calm invite/login flows; strong crypto, rate limits, audit.
6. **RBAC first** — optional ABAC later for resource ownership / step-up MFA; do not overengineer.
7. **Evolve, don’t rewrite** — map from today’s stubs (`lib/auth/session.ts`, `lib/permissions/*`) to DB-backed memberships.
8. **Audit sensitive access** — log auth events, role/permission changes, and sensitive data reads.
9. **Scalable** — designed for many users per tenant and fleets to **100k+ trucks** without redesigning identity.

Tradeoff order (Foundation): safer → trustworthy → simpler → maintainable → reliable → performant.

---

## Key decisions (summary)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **IdP / AuthN** | **Supabase Auth** (GoTrue) as primary IdP | Aligns with PostgreSQL/Supabase DB design; sessions + JWT claims; OAuth providers; less custom crypto |
| **App identity** | `public.users` + `identities` linked to `auth.users` | Stable app FK; IdP can rotate without rewriting business tables |
| **AuthZ model** | **RBAC** (roles → permissions); ABAC optional later | Matches existing `lib/permissions`; clear, maintainable |
| **Tenancy** | `company_memberships` + RLS on `company_id` | Isolation at DB; API sets tenant from membership, not client alone |
| **Passwords** | Argon2id (Supabase default) or bcrypt if custom path | Never plaintext; never reversible encryption for passwords |
| **2FA** | TOTP + WebAuthn (phased) | Step-up for payroll, banking, role grants |
| **SSO (later)** | SAML / OIDC enterprise | Phase 4; map IdP groups → roles |

Details: [02-authentication.md](./02-authentication.md), [03-multi-tenancy.md](./03-multi-tenancy.md), [04-roles.md](./04-roles.md), [05-permissions.md](./05-permissions.md).

---

## Reading order

| # | Document | Contents |
|---|----------|----------|
| 00 | [00-README.md](./00-README.md) | Index, principles, decisions (this file) |
| 01 | [01-threat-model.md](./01-threat-model.md) | Threats and mitigations |
| 02 | [02-authentication.md](./02-authentication.md) | Methods, sessions, flows, IdP choice |
| 03 | [03-multi-tenancy.md](./03-multi-tenancy.md) | Isolation, memberships, impersonation |
| 04 | [04-roles.md](./04-roles.md) | Built-in roles, defaults, ownership transfer |
| 05 | [05-permissions.md](./05-permissions.md) | Permission catalog, evaluation, deny-default |
| 06 | [06-custom-roles.md](./06-custom-roles.md) | Company custom roles |
| 07 | [07-team-management.md](./07-team-management.md) | Invite lifecycle, ownership, state machine |
| 08 | [08-security-controls.md](./08-security-controls.md) | Crypto, rate limits, devices, alerts |
| 09 | [09-audit-logs.md](./09-audit-logs.md) | Auth/access audit, retention |
| 10 | [10-api-security.md](./10-api-security.md) | Middleware, service checks, API keys |
| 11 | [11-future-surfaces.md](./11-future-surfaces.md) | Driver App, portals, marketplace, APIs |
| 12 | [12-data-model.md](./12-data-model.md) | Tables, PKs/FKs/indexes; DB cross-ref |
| 13 | [13-implementation-roadmap.md](./13-implementation-roadmap.md) | Phased delivery (no code) |

---

## Relation to constitution & database docs

| Layer | Role |
|-------|------|
| Master Constitution v1.0 | Highest authority — AI MAY / MUST NEVER; humans responsible |
| Trust & Safety Charter | No-decision; users decide; no silent privilege |
| Foundation | Prefer safer, simpler, maintainable IdP integration |
| Engineering Constitution | Auditability, least privilege, security |
| AI Safety & Legal Policy | Confirmations; AI cannot grant itself permissions |
| [`../database/`](../database/README.md) | Canonical table shapes for identity/tenancy |
| **This folder** | AuthN/AuthZ product & security design implementing the above |

Cross-links:

- Identity tables → [`../database/10-identity-tenancy.md`](../database/10-identity-tenancy.md)
- RLS → [`../database/81-security-rls.md`](../database/81-security-rls.md)
- Audit events → [`../database/60-comms-audit.md`](../database/60-comms-audit.md)
- APIs → [`../06-apis.md`](../06-apis.md)
- Future surfaces → [`../11-future-surfaces.md`](../11-future-surfaces.md)

---

## Current codebase (evolution path)

| Today (stub / demo) | Target |
|---------------------|--------|
| `lib/auth/session.ts` — hardcoded `CarrierOSSession` (`userId: "alpha-owner"`, single role) | Real Supabase session + membership-resolved tenant/roles |
| `CarrierOSRole` union + `requireRole()` | Permission checks (`hasPermission`) + role assignment via memberships |
| `lib/permissions/*` — in-memory catalog, custom roles, audit demo | DB-backed `permissions`, `roles`, `role_permissions`, `membership_roles`, `auth_events` |
| `getActiveCompany()` / `tenantId` from data helpers | Server-derived tenant from session membership; RLS enforces |
| Portal 2FA route stub (`app/portal/verify-2fa`) | Real TOTP/WebAuthn factors via IdP |

**Stable vocabulary:** Keep permission *intent* stable while normalizing codes to `resource:action` (see [05-permissions.md](./05-permissions.md)). Map legacy `page.*` / `button.*` / `document.*` during migration.

---

## Non-goals (this pack)

- Implementing login UI, middleware, or migrations
- Parallel AI/approval gates that weaken the Constitution
- Premature microservices for auth
- Full ABAC engine before RBAC is production-solid
- Cross-tenant “superuser” product access without audited break-glass rules

---

## File tree

```text
docs/architecture/iam/
├── 00-README.md                 ← you are here
├── 01-threat-model.md
├── 02-authentication.md
├── 03-multi-tenancy.md
├── 04-roles.md
├── 05-permissions.md
├── 06-custom-roles.md
├── 07-team-management.md
├── 08-security-controls.md
├── 09-audit-logs.md
├── 10-api-security.md
├── 11-future-surfaces.md
├── 12-data-model.md
└── 13-implementation-roadmap.md
```

Product hubs (when UI exists): Settings → Team & roles; `/platform/security` for platform posture. Until then, this folder is the source of truth for IAM design.
