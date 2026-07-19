# 03 — Backend Architecture

## Purpose

Application and domain layers for Transpo.ai: Clean Architecture inside a Phase 1 modular monolith, with a clear path to Phase 2 workers/services.

---

## Layering (Clean Architecture)

```
┌─────────────────────────────────────────┐
│  Interface adapters                      │
│  Route Handlers · Server Actions · Jobs  │
├─────────────────────────────────────────┤
│  Application (use cases)                 │
│  lib/services/<domain>/ · orchestrators  │
├─────────────────────────────────────────┤
│  Domain                                  │
│  entities · value objects · policies     │
│  (types + pure rules; no Next.js imports)│
├─────────────────────────────────────────┤
│  Infrastructure                          │
│  db · storage · queues · email · ELD     │
└─────────────────────────────────────────┘
```

**Dependency rule:** outer → inner only. Domain never imports `next/*`, React, or providers.

---

## API layer (BFF)

Phase 1 BFF lives in Next.js:

| Mechanism | Use |
|-----------|-----|
| Server Actions | Form mutations, Alph confirmations, most ops writes |
| Route Handlers `app/api/**` | Webhooks, mobile/Driver clients, public tokens, future public API |
| RSC data loaders | Read models for pages |

Future: extract a dedicated BFF/API service only when non-Next clients and rate-limit isolation demand it ([06-apis.md](./06-apis.md)).

Conventions:

- Validate input at the edge (schema)
- Resolve session + tenant
- Authorize (`lib/permissions`)
- Call one application use-case
- Append audit for sensitive actions
- Return typed DTO (never leak internal rows blindly)

---

## Domain services

Organize by bounded context (see [13-module-catalog.md](./13-module-catalog.md)):

```
lib/
  <domain>/           # types, policies, pure helpers (today)
  services/<domain>/  # use cases / application services (emerging)
```

Application service responsibilities:

- Orchestrate repositories + external ports
- Enforce invariants and AI gates before critical mutations
- Emit domain events (in-process bus Phase 1; outbox Phase 2)

Example use-cases: `AssignDriverToLoad`, `ApproveOcrExtraction`, `PreviewMigrationMapping`, `PreparePayrollDraft` (draft only — human approves).

---

## Workers & jobs

| Job family | Examples | SLA |
|------------|----------|-----|
| Document / OCR | Extract, classify, thumbnail | Minutes |
| Migration | Chunk import, validate, report | Minutes–hours |
| Notifications | Email/SMS/push fan-out | Seconds–minutes |
| Integrations | ELD pull, webhook retry | Seconds–minutes |
| Analytics | Rollups, report materialization | Hourly/daily |

Phase 1: same repo, queue table or managed queue (e.g. SQS / Cloud Tasks).
Phase 2: separate worker deployable sharing domain packages.

Job contract:

```
job_id, tenant_id, type, payload, idempotency_key,
attempts, status, last_error, created_at, run_after
```

**Do not overengineer:** no Kubernetes job mesh until a single worker pool saturates.

---

## Events & outbox

Phase 1: synchronous in-process hooks after commit for simple cases.
When integrations grow: **transactional outbox** table + publisher worker.

Events are facts (`LoadAssigned`, `DocumentReady`), not UI commands. Consumers must be idempotent.

---

## Error model

| Class | Handling |
|-------|----------|
| Validation | 400 + field errors |
| AuthN | 401 |
| AuthZ | 403 |
| Not found (tenant-safe) | 404 |
| Conflict / concurrency | 409 |
| Upstream / OCR | 502 + retryable flag |
| Uncertainty (AI) | Soft failure → needs verification, never fabricate |

---

## Mapping to today

| Target | Current |
|--------|---------|
| Use cases | `lib/services/{loads,fleet,drivers,documents,tracking}` + ad-hoc actions in `app/**/actions.ts` |
| Domain types | `lib/types/*`, `lib/*/types.ts` |
| Persistence | Seed/in-memory stores → replace with repositories |
| AI execution | `lib/alph/executor.ts` + `lib/ai-safety/run-suggested-action.ts` |

---

## Testing posture

- Domain: pure unit tests
- Use cases: with fake repositories
- Route Handlers: contract tests for webhooks/auth
- No need for full E2E on every module — prioritize money, safety, migration, OCR approval paths

---

## Phase 2 extraction order (backend)

1. OCR / document workers
2. Migration import workers
3. Notification dispatch
4. Tracking ingest / high-write telematics
5. Public API gateway (if external developers)

Keep shared domain packages versioned inside the monorepo until a hard team/process split exists.
