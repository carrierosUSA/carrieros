# 80 — Indexing, Performance & Scale

**Status:** Documentation only — no tables applied.
**Principle:** Normalized schema first; partition/archive only when measured need appears.

---

## 1. Indexing principles

1. **Lead with `company_id`** on nearly all tenant indexes (RLS-friendly).
2. Match **real list/board queries**: status + date, assignment lookups, expiry dashboards.
3. Prefer **partial indexes** for active rows: `WHERE deleted_at IS NULL`.
4. Index **FKs** used in joins.
5. Avoid indexing every column; unused indexes hurt write throughput.
6. For soft-deleted uniqueness: `UNIQUE (company_id, reference) WHERE deleted_at IS NULL`.

### Representative index catalog (design target)

| Table | Index | Purpose |
|-------|-------|---------|
| `loads` | `(company_id, status, pickup_at)` | Dispatch board |
| `loads` | unique `(company_id, reference) WHERE deleted_at IS NULL` | Idempotency |
| `load_stops` | `(load_id, sequence)` | Ordered stops |
| `drivers` | `(company_id, status)` | Directory |
| `trucks` | unique `(company_id, unit_number) WHERE deleted_at IS NULL` | Asset id |
| `documents` | `(company_id, document_type, status)` | Doc library |
| `documents` | GIN `search_vector` | Full text |
| `document_links` | `(company_id, entity_type, entity_id)` | Reverse lookup |
| `invoices` | `(company_id, status, due_at)` | AR aging |
| `fuel_records` | `(company_id, truck_id, fueled_at)` | IFTA / truck cost |
| `activity_events` | `(company_id, entity_type, entity_id, occurred_at DESC)` | Timelines |
| `audit_logs` | `(company_id, created_at DESC)` | Compliance export |
| `ai_recommendations` | `(company_id, approval_state, created_at DESC)` | Approval inbox |
| `notifications` | `(company_id, recipient_user_id, created_at DESC)` | Inbox |
| `integration_outbox` | `(status, next_attempt_at) WHERE status = 'pending'` | Workers |

---

## 2. Scale tiers & when to add complexity

Aligned with [`../00-README.md`](../00-README.md):

| Tier | Fleet | Action |
|------|-------|--------|
| T0–T1 (1–100 trucks) | Single Postgres, indexes above, object storage for files | **Do nothing else** |
| T2 (100–1k) | Connection pooling (Supabase pooler), background workers, cache hot counts | Optional read replica |
| T3 (1k–10k) | **Partition candidates**; search index; archive cold GPS | Measure first |
| T4 (10k–100k+) | Stronger partitioning + archival; consider extract high-churn writers | Sharding **only** if single-primary saturates |

**Partitioning becomes relevant around 100k+ trucks / millions of loads** — or earlier if a single table’s hot set exceeds operational comfort (bloat, vacuum, index size). Do not partition empty tables on day one.

---

## 3. Partitioning strategy (planned, not applied)

| Table | Partition key | Method | Retention |
|-------|---------------|--------|-----------|
| `loads` | `pickup_at` or `created_at` | Range (month/quarter) | Hot 24–36 months online |
| `load_status_history` | `occurred_at` | Range | Align with loads |
| `activity_events` | `occurred_at` | Range | 12–24 months then archive |
| `audit_logs` | `created_at` | Range | Legal retention policy |
| `tracking_positions` | `recorded_at` | Range (week/month) | Short TTL (30–90 days) then aggregate |
| `import_rows` | `created_at` | Range | Drop after remediation window |
| `notification_deliveries` | `created_at` | Range | Short TTL |
| `integration_outbox` | `created_at` | Range | Delete after publish + grace |

**Always include `company_id` in local indexes** on each partition.

**Sharding:** Not in design scope until a single Postgres primary cannot meet SLO with partitioning, replicas, and archival. Prefer company-based shard only as last resort (operational cost is high).

---

## 4. Archival

| Data class | Approach |
|------------|----------|
| Cold loads/docs metadata | Archive schema or object-storage export + tombstone |
| GPS points | Downsample to trip summaries; drop raw points |
| OCR raw text | Keep structured fields; compress/archive raw_text |
| Outbox | Delete published rows after retention |

Archival jobs are platform workers; they write `audit_logs` when customer data leaves the hot DB.

---

## 5. Supabase RLS performance notes

1. **Wrap auth functions** in `SELECT` for initplans: `(select auth.uid())` / `(select auth_company_id())` — avoids per-row re-eval pitfalls.
2. Policies should be **simple equality** on `company_id` indexed.
3. Avoid RLS expressions that join large tables per row.
4. For admin/service roles, use **service role** only on server; never in the browser.
5. Composite indexes starting with `company_id` keep RLS + filter selective.
6. Prefer **security definer** RPCs sparingly for cross-cutting reads; document each exception.

See [81-security-rls.md](./81-security-rls.md).

---

## 6. Write-path hygiene

- Batch GPS inserts.
- Async OCR/AI: enqueue jobs; do not block load create on OCR.
- Outbox in the same transaction as the business write.
- `updated_at` via trigger to keep app honest.

---

## 7. Read-path hygiene

- Dispatch boards: narrow columns + keyed indexes; avoid `SELECT *` with heavy JSON.
- Document search: tsvector first; external search at T3+.
- Counts: cached counters or approximate when exact global counts are expensive.

---

## 8. What not to do early

- Multi-region active-active Postgres
- Per-tenant databases for every customer
- Premature microservice databases
- Wide denormalized “god” tables as source of truth

→ [81-security-rls.md](./81-security-rls.md)
