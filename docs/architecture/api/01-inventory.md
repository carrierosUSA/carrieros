# 01 — Current API Inventory

**Status:** Inspected from `carrieros-app` (documentation)
**Date context:** 2026-07
**Goal:** Record what exists **today** so `/api/v1` can wrap services without duplicating or breaking working routes.

---

## Summary

| Surface | Count / state | Notes |
|---------|---------------|-------|
| `app/api/**` Route Handlers | **None** before foundation | No HTTP API tree yet; foundation adds `GET /api/v1/health` only |
| Server Actions (`"use server"`) | **8 files** | Primary write BFF for ops UI |
| Application services | `lib/services/{loads,drivers,fleet,documents,tracking}` | Preferred reuse target for `/api/v1` |
| Domain libs | Many under `lib/*` | Boards, stores, parsers, Alph, migration, finance, etc. |
| Auth | Demo session stub | `getCurrentSession()` — not Supabase-wired yet |
| Permissions | In-memory catalog + role matrix | `lib/permissions` — UI + `can()` checks |
| Schema validation | Hand-rolled FormData parsers | No Zod dependency in `package.json` |

**Implication:** Pages work via RSC + Server Actions. Introducing `/api/v1` is **additive**. Do not replace action paths until a thin adapter calls the same service.

---

## Route Handlers (`app/api`)

| Path | Methods | Status |
|------|---------|--------|
| *(none prior to this architecture pass)* | — | — |
| `app/api/v1/health` | `GET` | Foundation scaffold (health only) |

No webhooks, public API, or resource CRUD under `/api` yet. Partner/webhook ingress is design-only ([09-webhooks.md](./09-webhooks.md)).

---

## Server Actions

| File | Domain | Representative actions |
|------|--------|------------------------|
| `app/loads/actions.ts` | Loads / dispatch | `createLoadAction`, `updateLoadAction`, `assignDriverAction`, `assignTruckAction`, status updates, etc. |
| `app/drivers/actions.ts` | Drivers | Create/update/assign/time-off style mutations |
| `app/fleet/actions.ts` | Fleet | Truck/trailer mutations |
| `app/documents/actions.ts` | Documents | Upload / packet / request flows |
| `app/tracking/actions.ts` | Tracking | Tracking-related mutations |
| `app/workforce/actions.ts` | Workforce / hiring | Candidate / hiring mutations |
| `app/actions/alph.ts` | Alph | Alph command entry |
| `app/actions/command-palette.ts` | Navigation | Command palette helpers |

**Auth pattern today:** `requireRole(["owner", "dispatcher", …])` from `lib/auth/session.ts` — coarse role gate, not fine-grained `can(permission)` on every action.

**Tenant pattern today:** `tenantId` from session / `getActiveTenantId()`; services take `tenantId` as first argument. Client is **not** the source of truth for tenant in well-written actions (session is), but session itself is still a **demo stub**.

---

## Application services (`lib/services`)

| Module | Entry | Responsibility |
|--------|-------|----------------|
| Loads | `lib/services/loads` | CRUD, assign driver/truck, form parsing |
| Drivers | `lib/services/drivers` | Driver lifecycle, licenses, medical, payroll views, safety, time-off |
| Fleet | `lib/services/fleet` | Trucks/trailers operations |
| Documents | `lib/services/documents` | Document service + form parsing |
| Tracking | `lib/services/tracking` | Tracking helpers/service |

These are the **canonical reuse points** for future `/api/v1` handlers. New HTTP endpoints should call these (or thin use-case wrappers), not reimplement stores.

---

## Domain libraries (selected)

| Area | Paths | API relevance |
|------|-------|---------------|
| Auth session | `lib/auth/session.ts` | Stub session; foundation auth-context wraps this until Supabase |
| Tenant / company | `lib/data/tenant.ts`, `lib/companies/` | Active company; `requireCompany` for directory pages |
| Permissions | `lib/permissions/*` | Catalog (`page.*`, `button.*`, `document.*`), `can()`, audit helpers |
| AI safety | `lib/ai-safety/*` | Confirmation, automation levels, audit — required for Alph + critical APIs |
| Alph | `lib/alph/*`, `lib/alph-copilot/*` | Assist-only executor; must not bypass approvals |
| Finance | `lib/finance/*`, `lib/data/finance-store.ts` | Invoices, settlements, revenue (mostly store/demo) |
| Documents | `lib/documents/*` | Health, packets, permissions |
| Dispatch | `lib/dispatch/*` | Board, status chips, Alph issues |
| Fleet boards | `lib/fleet/*` | Truck/trailer/maintenance boards |
| Drivers | `lib/drivers/*` | Driver board, Alph alerts |
| Brokers / customers | `lib/brokers/*`, `lib/data/customers.ts` | Directory helpers |
| IFTA | `lib/ifta/*` | Tax + accountant auth helpers |
| Integrations / ELD | `lib/integrations/*`, `lib/eld/*` | Health, catalog, sync concepts |
| Migration | `lib/migration/*` | Import parsers, store, cleaning — Migration Center |
| Notifications / comms | `lib/notifications/*`, `lib/communications/*` | Alerts, messaging timeline |
| Portal | `lib/portal/*` | Portal session/permissions (separate surface) |
| Wallet / network / exchange | `lib/wallet/*`, `lib/network/*`, `lib/exchange/*` | Adjacent products; API later |
| Workflows | `lib/workflows/*` | Workflow types/store |
| Platform / admin | `lib/platform/*`, `lib/admin/*` | Platform surfaces |

---

## Data access today

| Pattern | Location | Notes |
|---------|----------|-------|
| In-memory / seed stores | `lib/data/*` | Loads, drivers, finance, compliance, workflows |
| Service facades | `lib/services/*` | Prefer these over calling stores from UI |
| No Supabase client in API layer yet | — | Target: user-scoped client + RLS ([../iam/](../iam/00-README.md)) |

**Hard rule (target):** Never put service-role credentials in client bundles. Server-only env for privileged jobs; browser uses anon/user session only.

---

## Gaps vs enterprise API target

| Gap | Risk if ignored | Plan |
|-----|-----------------|------|
| No HTTP resource API | Mobile/partners blocked; webhooks awkward | Add `/api/v1` incrementally |
| Demo auth | False sense of security | Wire Supabase + membership (IAM roadmap) |
| Role gates ≠ permission catalog | Privilege drift | Move mutations to `requirePermission` |
| No standard error envelope | Inconsistent clients | `lib/api/errors` |
| No idempotency | Double pay / double import | Keys on money + bulk ([07-idempotency.md](./07-idempotency.md)) |
| No request ID | Hard ops debugging | `X-Request-Id` helper |
| Form parsers only | Hard to reuse from JSON APIs | Shared validators ([04-validation.md](./04-validation.md)) |
| Soft-delete / archive inconsistent | Data loss vs restore confusion | Contracts ([03-contracts.md](./03-contracts.md)) |

---

## What must not break

- Existing `app/**` pages and Server Action imports
- Existing `lib/services/*` method signatures used by actions (extend; don’t rename casually)
- Permission catalog IDs already used in UI (map forward; don’t fork)
- Alph confirmation flows (`lib/ai-safety`)

---

## Related

- Structure: [02-structure.md](./02-structure.md)
- Migration: [14-migration-plan.md](./14-migration-plan.md)
- Backend layering: [`../03-backend.md`](../03-backend.md)
