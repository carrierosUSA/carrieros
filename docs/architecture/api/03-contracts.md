# 03 — Request / Response Contracts

**Status:** Target design
**Applies to:** All `/api/v1` JSON endpoints (unless noted for webhooks/multipart)

---

## Success envelope

### Single resource

```json
{
  "data": { "id": "…", "…": "…" },
  "meta": {
    "request_id": "req_…"
  }
}
```

### Collection

```json
{
  "data": [ { "id": "…" } ],
  "meta": {
    "request_id": "req_…",
    "pagination": {
      "next_cursor": "eyJ…",
      "prev_cursor": null,
      "has_more": true,
      "limit": 50
    }
  }
}
```

Offset mode (allowed for admin/simple lists; prefer cursor for hot paths):

```json
"pagination": {
  "page": 1,
  "per_page": 50,
  "total": 1234,
  "has_more": true
}
```

Errors: [06-errors.md](./06-errors.md).

---

## Common headers

| Header | Direction | Purpose |
|--------|-----------|---------|
| `X-Request-Id` | both | Correlation; server generates if missing |
| `Idempotency-Key` | request | Required on money / bulk / webhook-driven creates |
| `Authorization` | request | Bearer JWT (future) or session cookie |
| `X-Company-Id` | request | **Hint only** — must match verified membership; never sole trust |
| `Accept` | request | `application/json` |
| `Content-Type` | request | `application/json` (or `multipart/form-data` for uploads) |

---

## Query conventions

| Param | Meaning |
|-------|---------|
| `limit` | Page size (default 25, max 100 unless export) |
| `cursor` | Opaque cursor for next page |
| `page` / `per_page` | Offset mode when enabled |
| `sort` | `field` or `-field` (desc); whitelist per resource |
| `q` | Full-text / fuzzy search string |
| `filter[status]` | Equality filter (extend with `filter[field]`) |
| `include` | Sparse related embeds (`stops`, `driver`) — whitelist |
| `fields` | Sparse fieldsets (optional later) |

Unknown query keys → ignore or `400` with `validation_error` (prefer ignore for forward-compat on reads; reject on writes).

---

## Filter / sort / search rules

1. **Whitelist** filter and sort fields per resource in the module catalog.
2. Search (`q`) is **tenant-scoped** and permission-scoped (e.g. hide PII fields without `drivers:sensitive_read`).
3. Default sort: stable (`created_at` desc or business key) so pagination does not skip/duplicate.
4. Never accept raw SQL / arbitrary column names from the client.

---

## Soft-delete / archive

| Concept | Behavior |
|---------|----------|
| **Soft-delete** | Set `deleted_at`; exclude from default lists; `GET` by id → `404` for normal roles |
| **Archive** | Business “inactive” without purge (`status=archived` or `archived_at`) |
| **Hard delete** | Rare; Owner + step-up + audit; often deferred to retention jobs |
| **Restore** | `POST /:resource/:id/restore` with `*:edit` or `*:delete` as defined per module |

List flags:

- `include_deleted=true` — requires elevated permission
- `status=archived` — normal filter when archive is a first-class status

---

## Timestamps & IDs

- IDs: opaque strings (ULID/UUID); never sequential across tenants.
- Timestamps: ISO-8601 UTC (`2026-07-19T15:00:00.000Z`).
- Money: integer **cents** + `currency` (ISO 4217) in API contracts (adapters may map from existing number fields during migration).

---

## Write body rules

1. Do **not** accept `company_id` / `tenant_id` from body as authoritative — set from auth context.
2. Do **not** accept `role` / `permissions` elevation fields except on dedicated admin endpoints with step-up.
3. Partial updates via `PATCH` ignore unknown fields or reject (`validation_error`) — pick one per resource; default **reject unknown** on money resources.

---

## Multipart uploads

Documents / OCR / imports:

1. Authenticate + permission + quota check
2. Store blob in object storage
3. Create DB row + optional job
4. Return document/job resource (not raw storage credentials)

---

## Related

- Validation: [04-validation.md](./04-validation.md)
- Pagination performance: [11-performance.md](./11-performance.md)
- Errors: [06-errors.md](./06-errors.md)
