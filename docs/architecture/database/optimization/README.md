# Database Optimization Pack

**Status:** Design / planning only — **no live SQL schema exists; nothing applied**
**Date:** 2026-07-19
**Authority:** [`/constitution`](../../../../constitution/INDEX.md) · parent design pack [`../README.md`](../README.md)
**Engine (target):** PostgreSQL (Supabase)

---

## Reality check (verified)

| Surface | Finding |
|---------|---------|
| Prisma / Drizzle / TypeORM | **Not present** |
| Supabase migrations / `*.sql` in repo | **None** |
| Applied tables | **None** |
| Runtime persistence today | In-memory / seed stores under `carrieros-app/lib/**/store*` and `lib/data/*` |
| Authoritative target schema | [`docs/architecture/database/`](../README.md) table catalogs |

**Implication:** There are no production tables to alter. Optimization work is **assessment + recommended additive DDL** (labeled **NOT APPLIED / future apply**). Do not invent destructive migrations. Do not apply SQL until design approval ([`90-migration-from-current.md`](../90-migration-from-current.md) Phase B).

---

## Reading order

| # | Document | Purpose |
|---|----------|---------|
| 1 | [00-assessment.md](./00-assessment.md) | Current assessment, checklist review, bottlenecks |
| 2 | [10-standard-fields.md](./10-standard-fields.md) | Standard columns + when to use each |
| 3 | [20-indexes.md](./20-indexes.md) | Full recommended index catalog (extends [80](../80-performance-scale.md)) |
| 4 | [30-rls-security.md](./30-rls-security.md) | RLS patterns, least privilege, policy performance |
| 5 | [40-query-patterns.md](./40-query-patterns.md) | Pagination, sort/filter, N+1, connections, aggregations |
| 6 | [50-ai-embeddings.md](./50-ai-embeddings.md) | Future embeddings without harming current perf |
| 7 | [60-backup-dr.md](./60-backup-dr.md) | Backup & disaster recovery strategy |
| 8 | [70-fk-validation.md](./70-fk-validation.md) | Relationship / FK validation approach |
| 9 | [90-status.md](./90-status.md) | Completed vs recommended; remaining work |
| 10 | [sql/](./sql/) | Optional **additive** SQL stubs — **NOT APPLIED** |

---

## Constraints honored

- No redesign of the application; no table deletion; no relationship breakage
- Frontend compatibility preserved (stores unchanged; adapters come later)
- Align with documented tables only
- Additive / future-apply SQL only; never drop columns/tables
- Constitution: AI assists; humans decide; auditability; tenant isolation

---

## Quick verdict

The design pack is already strong on normalization, tenancy, soft delete, AI approval state, and scale tiers. This folder **closes the optimization gap** with a concrete apply-ready index/RLS/standard-field plan, query guidance, backup/DR, and FK validation checklist — ready for Phase B foundation DDL after approval.
