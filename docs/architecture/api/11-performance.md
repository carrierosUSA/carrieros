# 11 — Performance

**Status:** Target design
**Scale posture:** [`../14-scalability-roadmap.md`](../14-scalability-roadmap.md)

---

## Pagination

| Mode | Use |
|------|-----|
| **Cursor** | Default for hot lists (loads, drivers, documents, audit) |
| **Offset** | Small admin lists, exports preview |

Cursor properties:

- Opaque, signed or encrypted payload (`sort_value`, `id`)
- Stable sort tie-breaker on `id`
- `limit` default 25, max 100 (exports use jobs, not giant pages)

Helpers: `carrieros-app/lib/api/pagination.ts`.

---

## Caching

| Layer | Guidance |
|-------|----------|
| Company config / permission set | Short TTL in-memory or Redis later |
| Dashboard aggregates | Precompute / snapshot at T2+ |
| HTTP `Cache-Control` | Private for tenant data; never public CDN for PII |
| ETag / If-None-Match | Optional on infrequently changing resources |

**Never** cache across tenants. Cache keys must include `company_id`.

---

## N+1 and query shape

1. List endpoints return **summary DTOs**, not full graphs.
2. Use `include=` whitelist for relations; cap fan-out.
3. Prefer single query + joins or dataloaders in services.
4. Detail endpoints may load richer graphs with explicit permission checks per section (e.g. driver medical).

---

## Batch APIs

For bulk ops (assign many, status update many):

```text
POST /api/v1/loads/batch
Idempotency-Key: …
{ "ops": [ … ] }  // capped (e.g. 100)
```

Return per-item results; partial success documented. Prefer jobs for large batches.

---

## Rate limiting

Interface stub: `lib/api/rate-limit.ts`.

| Surface | Guidance |
|---------|----------|
| Interactive BFF | Per user + per company burst |
| Driver sync | Higher read; coalesce writes |
| Webhooks | Per provider key |
| OCR / migration | Queue fairness — not unlimited parallel |
| Public API | Per API key tier |

Respond `429` + `Retry-After`. Start coarse; refine with metrics.

---

## Observability

- Propagate `request_id` to logs and job payloads
- Time service calls and DB
- Alert on 5xx rate and queue lag — not vanity dashboards

---

## Scale triggers (do not overengineer early)

Stay modular monolith until measured pain: read replicas, search index, extracted workers — see scalability roadmap.

---

## Related

- Contracts: [03-contracts.md](./03-contracts.md)
- Jobs: [08-jobs.md](./08-jobs.md)
- Database perf: [`../database/80-performance-scale.md`](../database/80-performance-scale.md)
