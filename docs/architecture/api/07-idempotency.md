# 07 — Idempotency

**Status:** Target design · Interface stub in `carrieros-app/lib/api/idempotency.ts`

---

## Why

At-least-once clients, double-clicks, webhook retries, and job redeliveries must not double-charge, double-pay, or double-import.

---

## When required

| Operation class | Idempotency |
|-----------------|-------------|
| Payments / payment capture | **Required** |
| Payroll run submit / finalize | **Required** |
| Invoice issue / void (side-effecting) | **Required** |
| Settlements finalize | **Required** |
| Imports / migration commit chunks | **Required** |
| Bulk assign / bulk update | **Required** |
| Outbound webhook delivery attempts | **Required** (delivery id) |
| Document OCR job enqueue | **Required** |
| Simple PATCH of non-money fields | Optional (recommend If-Match / version) |
| GET | N/A (safe) |

---

## Client contract

```http
POST /api/v1/payments
Idempotency-Key: ike_01HZX…
Content-Type: application/json
```

| Rule | Detail |
|------|--------|
| Scope | Per `(company_id, actor_or_api_key, route, key)` |
| TTL | ≥ 24h for money; ≥ 7d for imports (configurable) |
| First request | Execute; store hash(body) + response snapshot |
| Replay same body | Return **stored** response (same status + body) |
| Same key, different body | `409 idempotency_conflict` |
| In-flight | `409` or `425` with retryable — pick one and document; prefer wait/retry |

---

## Storage (Phase 1)

Table sketch: `idempotency_keys`

| Column | Purpose |
|--------|---------|
| `id` | PK |
| `company_id` | Tenant |
| `key` | Client key |
| `request_hash` | Hash of canonical body |
| `response_status` | HTTP status |
| `response_body` | JSON snapshot (size-capped) |
| `created_at` / `expires_at` | TTL |

Workers use the same store with `job.idempotency_key`.

---

## Implementation notes

1. Begin transaction / lock key row before side effects.
2. Side effects (Stripe, ACH, email) must also be idempotent at the provider when possible.
3. Do not store secrets in response snapshots.
4. Foundation exports `IdempotencyStore` interface only — in-memory no-op until DB exists.

---

## Related

- Webhooks: [09-webhooks.md](./09-webhooks.md)
- Jobs: [08-jobs.md](./08-jobs.md)
- Payments modules: [13-module-catalog.md](./13-module-catalog.md)
