# Transpo.ai Enterprise API Architecture

**Status:** Target architecture + incremental foundation
**Audience:** Engineers, architects, security
**Code foundation:** `carrieros-app/lib/api/` · example route `app/api/v1/health`
**Governance:** [`/constitution`](../../../constitution/INDEX.md) — Master Constitution Version 1.0 is highest authority
**Parents:** [`../00-README.md`](../00-README.md) · [`../06-apis.md`](../06-apis.md) · [`../iam/10-api-security.md`](../iam/10-api-security.md)

---

## Purpose

Define a **versioned, secure, tenant-isolated HTTP API** (`/api/v1/`) that evolves the current Next.js BFF (Server Actions + domain services) **without** rebuilding the app, duplicating working endpoints, or weakening Constitution AI gates.

This pack is the **authoritative API design**. Thin summary remains in [`../06-apis.md`](../06-apis.md) — **this folder wins on conflict**.

---

## Non-goals

- Rewriting UI pages or replacing existing Server Actions in one pass
- Premature public developer platform (Phase 2+)
- Parallel permission systems or AI “approve” shortcuts
- Exposing Supabase service-role keys to the browser
- Trusting client-supplied `company_id` without membership verification

---

## Principles

Aligned with Master Constitution + Foundation + IAM:

1. **AI assists; humans decide** — Alph uses the **same permissions** as the acting user; critical actions require human confirmation (`lib/ai-safety/`).
2. **Never trust the client** — AuthN, membership, permission, and resource tenancy re-checked on every mutation.
3. **Thin adapters** — Route Handlers call application services; no business rules only in handlers.
4. **Evolve, don’t rewrite** — Server Actions remain valid BFF; `/api/v1` grows alongside for mobile, webhooks, partners.
5. **Safer → simpler → maintainable** — cursor pagination, idempotency, and rate limits where money/side effects demand them; not everywhere on day one.
6. **Constitution overrides features** — conflict → stop, explain, redesign.

---

## Reading order

| # | Doc | Contents |
|---|-----|----------|
| 1 | [01-inventory.md](./01-inventory.md) | What exists today (handlers, actions, services) |
| 2 | [02-structure.md](./02-structure.md) | Proposed `/api/v1/` resource tree |
| 3 | [03-contracts.md](./03-contracts.md) | Request/response, pagination, soft-delete |
| 4 | [04-validation.md](./04-validation.md) | Shared validation strategy |
| 5 | [05-authorization.md](./05-authorization.md) | Auth + RBAC + company isolation + RLS |
| 6 | [06-errors.md](./06-errors.md) | Error envelope |
| 7 | [07-idempotency.md](./07-idempotency.md) | Money, bulk, webhooks, jobs |
| 8 | [08-jobs.md](./08-jobs.md) | Background jobs |
| 9 | [09-webhooks.md](./09-webhooks.md) | Inbound/outbound webhooks |
| 10 | [10-versioning.md](./10-versioning.md) | `/api/v1/` strategy |
| 11 | [11-performance.md](./11-performance.md) | Pagination, caching, N+1, scale |
| 12 | [12-alph.md](./12-alph.md) | Alph API rules |
| 13 | [13-module-catalog.md](./13-module-catalog.md) | Per-module endpoint catalog |
| 14 | [14-migration-plan.md](./14-migration-plan.md) | Incremental path without breaking pages |

---

## Current vs target (one glance)

| Today | Target |
|-------|--------|
| Almost no `app/api/**` Route Handlers | Versioned `/api/v1/**` for HTTP clients + webhooks |
| Server Actions in `app/*/actions.ts` | Keep; share services with `/api/v1` |
| `lib/services/{loads,drivers,fleet,documents,tracking}` | Canonical application layer |
| Demo session (`lib/auth/session.ts`) | Supabase Auth + membership (IAM design) |
| Form parsers (no Zod yet) | Shared validators at edge; Zod optional when added |
| Permission catalog `page.*` / `button.*` | Map toward `resource:action` (IAM) without forking AuthZ |

---

## Foundation code (Phase B)

| Path | Role |
|------|------|
| `carrieros-app/lib/api/` | Errors, request ID, auth context stub, pagination, idempotency/rate-limit interfaces |
| `carrieros-app/app/api/v1/health/route.ts` | Non-breaking health probe |

Do **not** migrate all modules in the foundation pass. See [14-migration-plan.md](./14-migration-plan.md).

---

## Related

- System: [`../01-system-overview.md`](../01-system-overview.md) · Backend: [`../03-backend.md`](../03-backend.md)
- IAM: [`../iam/00-README.md`](../iam/00-README.md) · Database RLS: [`../database/81-security-rls.md`](../database/81-security-rls.md)
- Security: [`../security/00-README.md`](../security/00-README.md)
- Domain modules: [`../13-module-catalog.md`](../13-module-catalog.md)
- Product hubs: `/platform/governance`, `/platform/migration`
