# 00 — Optimization Assessment

**Status:** Documentation only — no tables applied.
**Inspected:** 2026-07-19 · repo `/Users/onkarlove/carrieros`

---

## 1. Current state

### What exists

| Layer | Reality |
|-------|---------|
| **Target schema** | Complete design pack: identity, fleet, operations, finance, documents/AI, comms/audit, platform ([catalog](../README.md)) |
| **Performance design** | [80-performance-scale.md](../80-performance-scale.md) — indexes, partitioning tiers, RLS notes |
| **Security design** | [81-security-rls.md](../81-security-rls.md) — RLS concepts, PII, least privilege |
| **Principles** | [01-principles.md](../01-principles.md) — standard columns, soft delete, naming, ownership |
| **Live DB** | **None** — no Prisma schema, no Supabase folder, no SQL migrations in repo |
| **App data** | In-memory/`lib/*/store` + seed arrays; `tenantId` → maps to future `company_id` |

### What does not exist yet

- Applied Postgres tables, indexes, FKs, RLS policies
- Connection pooler configuration in app
- Partitioned high-churn tables
- Document object-storage buckets wired to schema
- Embedding / vector indexes
- Automated FK integrity tests against a real DB

---

## 2. Review checklist results

| Area | Assessment | Severity |
|------|------------|----------|
| **Naming** | Consistent `snake_case` plural tables; FK `<entity>_id`; tenant root = `companies`, CRM = `parties` — correct | OK |
| **Relationships / ownership** | Clear owner→dependent; circular FK avoided (`invoices.load_id` owns; load invoice cache optional) | OK |
| **PKs** | UUID `id` on business tables — correct for multi-tenant APIs | OK |
| **FKs** | Documented; not yet enforced in SQL | Gap (expected) |
| **Constraints** | Status CHECKs and partial unique indexes documented per table | OK (design) |
| **Indexes** | Representative set in 80; gaps filled in [20-indexes.md](./20-indexes.md) | Improved here |
| **RLS** | Concept + example policy; needs helper functions + policy matrix | Improved in [30-rls-security.md](./30-rls-security.md) |
| **Nullables** | Soft delete / optional FKs sensible; money/status not nullable where required | OK |
| **Duplicates** | Principles forbid shadow finance facts; parties unify customers/brokers | OK |
| **Missing tables** | Marketplace / Network / Exchange largely outside core catalog — document as future bounded contexts, do not invent into Phase B | Note |
| **Audit fields** | Standard set in principles; extend with `status`, `archived_at`, `version`, `notes`, `metadata` where appropriate — [10-standard-fields.md](./10-standard-fields.md) | Gap closed in plan |
| **Bottlenecks (projected)** | Loads board, GPS points, activity/audit volume, document search, notification inbox, outbox workers | Addressed in 20/40/50 |

---

## 3. Scale mission fit (1 truck → enterprise → millions of rows)

| Goal | Design posture | Optimization posture |
|------|----------------|----------------------|
| Solo / small fleet (T0–T1) | Single Postgres + indexes | Ship Phase B indexes only; no partitions |
| Mid fleet / brokerage (T2) | Pooler + workers + cache hot counts | Composite indexes + RLS initplan pattern |
| Large (T3) | Partition candidates | Range partition loads/activity/audit/GPS when measured |
| Enterprise / marketplace (T4) | Archive + optional extract high-churn | Embeddings in separate table; never block OLTP |
| AI readiness | `ai_recommendations` + OCR + approval_state | Future `*_embeddings` sidecar — [50-ai-embeddings.md](./50-ai-embeddings.md) |

Constitution alignment: recommendations default `pending`; critical actions never auto-approved; audit logs for money/compliance/safety changes.

---

## 4. Projected bottlenecks (when SQL lands)

1. **Dispatch board** — `loads` filtered by `company_id + status + pickup_at`; must hit composite index; avoid `SELECT *` with heavy JSON.
2. **Compliance dashboards** — license/medical/insurance `expires_at` queries across fleet.
3. **Document library** — type/status filters + full-text; GIN `search_vector` + link reverse lookup.
4. **AR aging / settlements** — status + due/period indexes.
5. **Timelines & audit export** — high insert rate; partition at T3+.
6. **GPS / tracking** — highest churn; short retention + batch insert; never join raw points into board queries.
7. **RLS misconfiguration** — policies without `(select auth_company_id())` cause sequential scans.
8. **N+1 from stores** — when repositories replace in-memory maps, prefer batched joins / DataLoader patterns ([40-query-patterns.md](./40-query-patterns.md)).

---

## 5. Marketplace / Network / Exchange note

Current `lib/exchange`, `lib/network` stores are product surfaces ahead of the core enterprise DDL. **Do not block Phase B** on them. When promoted:

- Prefer same tenancy + standard fields
- Marketplace listings as first-class tables or `parties`/`documents` extensions
- Cross-org visibility via explicit grants — never weaken RLS with “share everything”

---

## 6. Optimizations completed in this pack (docs only)

| Item | Location |
|------|----------|
| Reality check + checklist | This file |
| Standard fields matrix | [10-standard-fields.md](./10-standard-fields.md) |
| Expanded index catalog | [20-indexes.md](./20-indexes.md) |
| RLS policy matrix + helpers | [30-rls-security.md](./30-rls-security.md) |
| Query / N+1 / connection guidance | [40-query-patterns.md](./40-query-patterns.md) |
| Embedding readiness | [50-ai-embeddings.md](./50-ai-embeddings.md) |
| Backup / DR | [60-backup-dr.md](./60-backup-dr.md) |
| FK validation approach | [70-fk-validation.md](./70-fk-validation.md) |
| Additive SQL stubs (NOT APPLIED) | [sql/](./sql/) |

**No live schema changes.** App code untouched; localhost behavior unchanged.

---

## 7. What remains after design approval

See [90-status.md](./90-status.md). Short list: approve design → generate Phase B foundation DDL from catalogs → apply indexes/RLS from this pack → repository adapters → measure → partition only if needed.
