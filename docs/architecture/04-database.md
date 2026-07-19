# 04 — Database (summary)

**Status:** Target design — documentation only
**Deep design (authoritative for schema):** [`database/README.md`](./database/README.md)
**Engine:** PostgreSQL (Supabase)
**Governance:** [`/constitution`](../../constitution/INDEX.md)

> **SQL migrations not yet generated — design approval first.**
> No tables have been applied. Illustrative DDL in the deep docs is labeled **NOT APPLIED — documentation only**.

This file is the architecture-index entry for database strategy. For complete table catalogs, ER diagrams, RLS, and scale plans, use the [`database/`](./database/) folder — it **extends and supersedes** the level of detail formerly expected in a single `04-database.md`.

---

## Role of the database

Postgres is the system of record for tenant business data. Object storage holds document bytes. Search indexes and warehouses are optional later — not dual sources of truth.

---

## Non-negotiables

| Rule | Detail |
|------|--------|
| Company isolation | `company_id` on every business table; Supabase RLS |
| Soft delete | `deleted_at` (+ `deleted_by`) on business tables |
| Audit columns | `created_at`, `updated_at`, `created_by`, `updated_by` |
| AI | Recommendations with confidence + approval state; never auto-approve critical actions |
| Documents | Unified polymorphic model + versions/OCR/tags/links |
| Simplicity | Normalize; partition only at measured T3/T4 scale |

---

## Bounded contexts → schemas (logical)

Logical grouping (physical Postgres schemas optional later):

| Context | Catalog |
|---------|---------|
| Identity & tenancy | [database/10-identity-tenancy.md](./database/10-identity-tenancy.md) |
| Fleet | [database/20-fleet.md](./database/20-fleet.md) |
| Operations | [database/30-operations.md](./database/30-operations.md) |
| Finance | [database/40-finance.md](./database/40-finance.md) |
| Documents & AI | [database/50-documents-ai.md](./database/50-documents-ai.md) |
| Comms & audit | [database/60-comms-audit.md](./database/60-comms-audit.md) |
| Platform | [database/70-platform.md](./database/70-platform.md) |

Cross-cutting patterns: [database/02-cross-cutting.md](./database/02-cross-cutting.md).

---

## Scale posture

| Tier | Posture |
|------|---------|
| T0–T2 | Single DB, strong indexes, workers |
| T3+ | Partition loads/activity/audit/GPS; archive |
| T4 | Extract high-churn writers only if measured; sharding last resort |

Details: [database/80-performance-scale.md](./database/80-performance-scale.md).

**Optimization pack (assessment + recommended indexes/RLS/standard fields/backup-DR + future-apply SQL stubs — NOT APPLIED):** [database/optimization/README.md](./database/optimization/README.md).

---

## Evolution from current app

Today’s `tenantId` + in-memory stores under `carrieros-app/lib/` evolve via repositories — no big-bang rewrite.

See [database/90-migration-from-current.md](./database/90-migration-from-current.md).

---

## Related architecture docs

- [00-README.md](./00-README.md) — enterprise architecture index
- [01-system-overview.md](./01-system-overview.md) — tenancy & context
- Future: auth, APIs, AI/OCR product docs should link here when added
