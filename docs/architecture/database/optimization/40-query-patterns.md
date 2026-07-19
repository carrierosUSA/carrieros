# 40 — Query, Pagination & N+1 Guidance

**Status:** Documentation only — no runtime change.
**Audience:** Future repository / server-action authors replacing in-memory stores.

---

## 1. List / board queries (hot path)

**Pattern:** Filter by `company_id` (from session, never client-trusted alone) + status + date range; sort on indexed columns; project narrow columns.

```text
SELECT id, reference, status, pickup_at, delivery_at, rate, driver_id, truck_id
FROM loads
WHERE company_id = $1
  AND deleted_at IS NULL
  AND status = ANY($2)
  AND pickup_at >= $3 AND pickup_at < $4
ORDER BY pickup_at ASC
LIMIT $5 OFFSET $6;   -- prefer keyset below
```

Use indexes from [20-indexes.md](./20-indexes.md) (`loads (company_id, status, pickup_at)`).

---

## 2. Pagination

| Method | Use |
|--------|-----|
| **Keyset (seek)** | Default for large lists: `WHERE (pickup_at, id) > ($cursor_at, $cursor_id) ORDER BY pickup_at, id LIMIT n` |
| **Offset** | Acceptable for small admin pages (< few thousand); avoid deep offsets on loads/activity |
| **Cursor tokens** | Opaque base64 of sort keys; never expose internal offsets as API contract |

Always include a unique tie-breaker (`id`) in ORDER BY for stable pages.

---

## 3. Sort & filter

| Rule | Practice |
|------|----------|
| Whitelist sort columns | Map UI sort keys → indexed columns only |
| Status / type filters | Prefer `= ANY($array)` over dynamic OR soup |
| Full-text | `search_vector @@ plainto_tsquery` on documents; not `ILIKE '%x%'` on large tables |
| JSON filters | Only on `metadata` with GIN if measured need; prefer columns for hot filters |
| Soft delete | Default `deleted_at IS NULL` in repositories |

---

## 4. Avoiding N+1 (when leaving in-memory Maps)

Today many boards do `new Map(rows.map…)` in process — fine for seeds. Against Postgres:

| Anti-pattern | Prefer |
|--------------|--------|
| Loop: load → query driver → query truck | Single query with `LEFT JOIN` or two batched `WHERE id = ANY($ids)` |
| Per-row document fetch | `document_links` by `(entity_type, entity_id = ANY(...))` then group in app |
| Per-row activity count | Cached counter column / materialized count / approximate at T2+ |
| SELECT * then hydrate everything | Detail endpoint vs list DTO |

**Batching helper shape (app):** `loadByIds(ids)`, `driversByIds(ids)`, `documentsForEntities(type, ids)` — mirrors current Map joins without chatty SQL.

---

## 5. Aggregations

| Need | Approach |
|------|----------|
| Board KPI counts | Conditional aggregates in one query, or Redis/cache with short TTL at T2 |
| AR aging buckets | `GROUP BY` status / date_bin on indexed `(company_id, status, due_at)` |
| IFTA / fuel | Aggregate `fuel_records` by truck + month; never scan loads for gallons |
| Exact global counts | Avoid on huge tables; use estimates or cached counters |

Do not create denormalized “god” summary tables as source of truth; caches must be rebuildable ([01-principles.md](../01-principles.md)).

---

## 6. Connection efficiency (Supabase)

| Tier | Practice |
|------|----------|
| T0–T1 | Supabase transaction/pooler URL for serverless; few long-lived connections from Node |
| T2+ | PgBouncer transaction mode; short statements; no session-only features without sticky sessions |
| Server actions | One logical unit of work per request; avoid opening a client per tiny helper |
| Workers | Dedicated pool; batch GPS / outbox poll with `FOR UPDATE SKIP LOCKED` |
| Browser | Never direct service role; prefer Next.js server with user-scoped client |

---

## 7. Write-path hygiene

- Outbox row in **same transaction** as business write
- OCR/AI async — enqueue, do not block load create
- Batch GPS inserts (multi-row `INSERT`)
- `updated_at` / `version` via trigger or single UPDATE path
- Soft delete = UPDATE, not DELETE

---

## 8. Read-path hygiene

- Dispatch/finance boards: narrow projections
- Detail pages: join children in one round-trip (`load` + `stops` + current assignment)
- Timelines: keyset on `occurred_at` with limit (e.g. 50)
- Never join `tracking_positions` into board list queries — separate live endpoint

---

## 9. Frontend compatibility

Keep existing board DTO shapes from `lib/*` services. Repositories adapt SQL → current TypeScript types. No UI rewrite required for index/RLS adoption.
