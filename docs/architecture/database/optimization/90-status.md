# 90 — Status: Completed, Recommended, Remaining

**As of:** 2026-07-19
**Live schema:** None — all work is documentation + future-apply SQL stubs.

---

## 1. Current assessment (summary)

Transpo.ai has a solid **documented** enterprise Postgres design and **in-memory** app stores. There is nothing to migrate or index in production yet. Optimization value today is a clear, constitution-aligned apply plan so Phase B DDL ships with the right indexes, RLS, standard fields, and ops runbooks — avoiding a second redesign under load.

---

## 2. Optimizations completed (this pack)

| Item | Status |
|------|--------|
| Reality check (no Prisma / no SQL / stores only) | Done |
| Checklist review (naming, FKs, RLS, gaps) | Done |
| Standard fields matrix (`status`, `archived_at`, `version`, …) | Done — [10](./10-standard-fields.md) |
| Expanded index catalog (all domains) | Done — [20](./20-indexes.md) |
| RLS helpers + policy matrix + FORCE RLS | Done — [30](./30-rls-security.md) |
| Query / keyset / N+1 / pooler guidance | Done — [40](./40-query-patterns.md) |
| Embeddings sidecar plan (non-blocking) | Done — [50](./50-ai-embeddings.md) |
| Backup / DR strategy | Done — [60](./60-backup-dr.md) |
| FK validation approach + SQL checks | Done — [70](./70-fk-validation.md) |
| Additive SQL stubs labeled NOT APPLIED | Done — [sql/](./sql/) |
| Cross-link from database README | Done |

**Indexes added to live DB:** none (no DB).
**Relationships improved in live DB:** none (documented ownership already sound).
**Security improvements applied:** none live; policy design strengthened on paper.
**App / tsc:** no code touched — localhost unchanged; no data loss risk.

---

## 3. Recommended optimizations (apply after design approval)

### Phase B — Foundation (additive)

1. Create `companies`, `users`, memberships, RBAC
2. Apply [sql/01_standard_helpers.sql](./sql/01_standard_helpers.sql) (`updated_at` trigger, extensions)
3. Apply RLS helpers + baseline policies ([sql/03…](./sql/03_rls_helpers_and_policies.sql))
4. Standard columns on every new table per [10](./10-standard-fields.md)

### Phase C — Core ops + indexes

1. Parties, loads, stops, dispatch, fleet tables from catalogs
2. Apply [sql/02_indexes_additive.sql](./sql/02_indexes_additive.sql) as tables land
3. Repository adapters behind existing services

### Phase D–E — Documents, AI, finance, platform

1. Documents/OCR/AI recommendations with approval_state
2. Finance + outbox + migration tables
3. Notification / activity / audit indexes

### Phase F — Measure then scale

1. Partition high-churn tables only if measured ([80](../80-performance-scale.md))
2. Optional embeddings ([sql/04…](./sql/04_embeddings_future.sql))
3. Covering indexes only for proven hot queries

---

## 4. Security improvements (recommended)

- `FORCE ROW LEVEL SECURITY` on all tenant tables
- `(select auth_company_id())` initplan pattern
- Membership check via `auth_has_company`
- Driver-scoped policies in Phase C+
- Signed URL document access; no service role in browser
- Audit redaction for secrets / SSN

---

## 5. Performance improvements (recommended)

- Composite tenant indexes on loads, invoices, documents, notifications, activity
- Partial uniques for soft-delete
- Keyset pagination on large lists
- Batch joins instead of N+1
- Outbox + async OCR/AI
- GPS short retention; never on board joins

---

## 6. Future recommendations

| Topic | When |
|-------|------|
| Marketplace / Network / Exchange DDL | After core ops stable; same tenancy rules |
| pgvector embeddings | Product RAG/search need |
| External search (OpenSearch etc.) | T3+ document volume |
| Read replica | T2+ read-heavy reporting |
| Partitioning | Measured T3/T4 |
| Per-tenant DB | Avoid; last resort only |

---

## 7. Remaining work

- [ ] Explicit design approval for schema pack
- [ ] Generate real Supabase migrations from catalogs (not from destructive rewrites)
- [ ] Apply foundation + indexes + RLS in staging
- [ ] FK validation CI job
- [ ] First backup restore drill
- [ ] Cut over repositories behind feature flags
- [ ] Load-test dispatch board + RLS `EXPLAIN`

---

## 8. Files changed (this effort)

```text
docs/architecture/database/README.md                          (cross-link)
docs/architecture/database/optimization/README.md
docs/architecture/database/optimization/00-assessment.md
docs/architecture/database/optimization/10-standard-fields.md
docs/architecture/database/optimization/20-indexes.md
docs/architecture/database/optimization/30-rls-security.md
docs/architecture/database/optimization/40-query-patterns.md
docs/architecture/database/optimization/50-ai-embeddings.md
docs/architecture/database/optimization/60-backup-dr.md
docs/architecture/database/optimization/70-fk-validation.md
docs/architecture/database/optimization/90-status.md
docs/architecture/database/optimization/sql/README.md
docs/architecture/database/optimization/sql/01_standard_helpers.sql
docs/architecture/database/optimization/sql/02_indexes_additive.sql
docs/architecture/database/optimization/sql/03_rls_helpers_and_policies.sql
docs/architecture/database/optimization/sql/04_embeddings_future.sql
docs/architecture/04-database.md                              (cross-link)
```
