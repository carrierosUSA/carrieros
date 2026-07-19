# Transpo.ai Enterprise Architecture

**Status:** Target architecture (documentation only)
**Audience:** Engineers, architects, product, security
**Codebase today:** `carrieros-app/` — Next.js App Router monolith with domain modules under `lib/`
**Governance:** [`/constitution`](../../constitution/INDEX.md) — Master Constitution Version 1.0 is highest authority

---

## Vision

Transpo.ai is a **trusted AI-powered trucking operating platform**. Architecture must support carriers from a single truck to enterprise fleets (**1 → 10 → 100 → 1,000 → 10,000 → 100,000+ trucks**) without a ground-up redesign.

This documentation defines the **target enterprise design** that evolves the current codebase. It is not a mandate to rewrite. Prefer Clean Architecture, DDD boundaries, SOLID, and reusable modules — **without overengineering**.

### Non-goals

- New product features or random feature code
- Premature microservices, sharding, or multi-region complexity
- Parallel AI/approval systems that weaken the Constitution

---

## Scale targets

| Tier | Fleet size | Architecture posture |
|------|------------|----------------------|
| T0 | 1–10 | Monolith + Postgres + object storage |
| T1 | 10–100 | Same; indexes, background jobs, CDN |
| T2 | 100–1,000 | Read replicas optional; queue workers; cache hot paths |
| T3 | 1,000–10,000 | Dedicated workers, search index, stronger observability |
| T4 | 10,000–100,000+ | Extract high-churn services; consider partitioning only when measured |

**Do not overengineer:** stay on Phase 1 (modular monolith) until metrics force Phase 2 extraction. See [14-scalability-roadmap.md](./14-scalability-roadmap.md).

---

## Principles (architecture)

Aligned with [`constitution/00-master-constitution.md`](../../constitution/00-master-constitution.md):

1. **AI assists; humans decide** — confirmation and automation levels via `lib/ai-safety/`.
2. **Security & least privilege** — tenant isolation, RBAC/ABAC, audit.
3. **Modular domains** — clear boundaries; no god modules.
4. **Maintainable simplicity** — configuration over customization; prefer integrations.
5. **Clean Architecture / DDD / SOLID** — domain at the center; UI and infra at the edges.
6. **Evolve, don’t rewrite** — map target folders to current `carrieros-app` paths.
7. **Constitution overrides features** — conflict → stop, explain, redesign.

Tradeoff order (Foundation): safer → trustworthy → simpler → maintainable → reliable → performant → faster only if the above remain intact.

---

## How to read these docs

| Doc | Contents |
|-----|----------|
| [01-system-overview.md](./01-system-overview.md) | Context, tenancy, request flows, C4-style diagrams |
| [02-frontend.md](./02-frontend.md) | Next.js, portals, Driver App, UI, performance |
| [03-backend.md](./03-backend.md) | API/BFF, domain services, workers |
| [04-database.md](./04-database.md) | Database strategy summary (pointer) |
| [database/](./database/README.md) | **Enterprise Database design (authoritative)** — tables, ER, RLS, scale; SQL not yet generated |
| [05-auth-authorization.md](./05-auth-authorization.md) | AuthN/AuthZ summary (pointer to `iam/`) |
| [iam/](./iam/00-README.md) | **Enterprise IAM design (authoritative)** — threat model, auth, tenancy, RBAC, team, audit, API security, roadmap |
| [06-apis.md](./06-apis.md) | Public/private APIs summary (pointer) |
| [api/](./api/00-README.md) | **Enterprise API architecture (authoritative)** — inventory, `/api/v1` structure, contracts, AuthZ, errors, idempotency, jobs, webhooks, Alph, module catalog, migration |
| [07-ai-ocr-documents.md](./07-ai-ocr-documents.md) | Alph, OCR, approval gates, storage |
| [08-search-notifications-email.md](./08-search-notifications-email.md) | Search, notifications, email |
| [09-analytics-reporting-billing.md](./09-analytics-reporting-billing.md) | Analytics, reporting, billing |
| [10-integrations-migration.md](./10-integrations-migration.md) | Integration bus, Migration Center |
| [11-future-surfaces.md](./11-future-surfaces.md) | Driver App, Exchange, public APIs |
| [12-folder-structure.md](./12-folder-structure.md) | Target folders ↔ current paths |
| [13-module-catalog.md](./13-module-catalog.md) | Per-module enterprise catalog |
| [14-scalability-roadmap.md](./14-scalability-roadmap.md) | Scale tiers and when to add complexity |
| [15-security-compliance.md](./15-security-compliance.md) | Encryption, privacy, constitution alignment (summary) |
| [16-alph-architecture.md](./16-alph-architecture.md) | **Alph AI architecture** — one assistant, context, tools, approval, audit |
| [security/](./security/00-README.md) | **Enterprise Security Architecture (authoritative assessment)** — threats, auth, AuthZ, API/secrets, headers, Alph, roadmap |

**Enterprise Design System (UI):** [`../design-system/00-README.md`](../design-system/00-README.md) — permanent visual/interaction language (documentation only; aligns with `carrieros-app` tokens). Complements [02-frontend.md](./02-frontend.md); does not outrank `/constitution`.

---

## IAM (Authentication & Permissions)

**Canonical design:** [`iam/00-README.md`](./iam/00-README.md) — documentation only; **not yet implemented**.

Covers threat model, authentication (Supabase Auth recommended), multi-tenancy, RBAC roles/permissions, custom roles, team lifecycle, security controls, audit, API security, future surfaces, data model, and phased roadmap.

Database companion: [`database/10-identity-tenancy.md`](./database/10-identity-tenancy.md).
Thin summary retained at [`05-auth-authorization.md`](./05-auth-authorization.md) — **IAM pack wins on conflict**.

---

## Enterprise API (`/api/v1`)

**Canonical design:** [`api/00-README.md`](./api/00-README.md) — documentation + incremental foundation in `carrieros-app/lib/api/` (health example only).

Covers inventory of Server Actions/services, resource structure, contracts, validation, authorization alignment with IAM/RLS, errors, idempotency, jobs, webhooks, versioning, performance, Alph rules, per-module catalog, and migration without breaking UI.

Thin summary retained at [`06-apis.md`](./06-apis.md) — **API pack wins on conflict**.

---

## Enterprise Security

**Canonical assessment:** [`security/00-README.md`](./security/00-README.md) — current posture, honest findings, incremental hardening in `carrieros-app/lib/security/`, `proxy.ts`, Alph RBAC gate.

Thin principles retained at [`15-security-compliance.md`](./15-security-compliance.md) — **security pack wins on conflict for assessment/roadmap**; IAM/API packs remain authoritative for AuthN/AuthZ and `/api/v1` contracts. Constitution always wins over all architecture packs.

---

## Relation to `/constitution`

| Layer | Role |
|-------|------|
| Master Constitution v1.0 | Highest authority — AI MAY / MUST NEVER, Migration Center, engineering standard |
| Trust & Safety Charter | No-decision, autonomy limits |
| Foundation | Architecture tradeoffs, long-term quality |
| Engineering Constitution | Twelve principles (humans in control, auditability, etc.) |
| AI Safety & Legal Policy | Confirmations, automation levels |
| **This folder** | Technical enterprise design implementing the above |

Product hubs: `/platform/governance`, `/platform/migration`, `/platform/foundation`.

Runtime helpers (summaries only): `carrieros-app/lib/ai-safety/`, `lib/constitution/`, `lib/foundation/`. **Folder `/constitution` wins on conflict.**

---

## Phased delivery

### Phase 1 — Modular monolith (current-friendly)

- Single Next.js deployable (`carrieros-app`)
- Domain packages under `lib/<domain>/` + thin UI in `app/` / `components/`
- Postgres (target), object storage for documents — see [`database/`](./database/) (**design only; migrations not applied**)
- In-process or managed queues for OCR/import
- Route Handlers + server actions as BFF

### Phase 2 — Extract services (only when needed)

- Extract workers (OCR, migration import, notifications) first
- Then high-throughput domains (tracking, search, webhooks)
- Keep domain contracts stable; no big-bang rewrite

---

## Current codebase alignment (light inventory)

Observed modules under `carrieros-app/lib/` that this architecture must evolve, not replace:

`fleet`, `drivers`, `dispatch` / loads, `finance`, `documents`, `wallet`, `network`, `exchange`, `platform`, `driver-app`, `migration`, `alph`, `alph-copilot`, `ai-safety`, `integrations` / `eld`, `workforce`, `notifications`, `permissions`, `settings`, `compliance`, `ifta`, `portal`, `communications`, `admin`, `workflows`.

App surfaces: `app/dashboard`, `loads`, `fleet`, `drivers`, `documents`, `finance`, `wallet`, `network`, `exchange`, `platform`, `driver`, `alph`, `integrations`, `workforce`, etc.

---

## Document ownership

Architecture docs are updated when:

- Domain boundaries change
- Tenancy or auth model changes
- A Phase 2 extraction is approved
- Constitution precedence or AI approval rules change (cross-link only; never fork policy here)
