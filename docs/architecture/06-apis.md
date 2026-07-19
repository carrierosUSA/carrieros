# 06 — APIs

> **Authoritative pack:** [`api/00-README.md`](./api/00-README.md) — inventory, `/api/v1` structure, contracts, AuthZ, errors, idempotency, jobs, webhooks, Alph, module catalog, migration. **This file is a thin summary; the `api/` folder wins on conflict.**

## Purpose

Private (product) APIs, webhooks, and a future public API — versioned, rate-limited, and AuthZ-aware.

---

## API classes

| Class | Consumers | Phase |
|-------|-----------|-------|
| **Private BFF** | Ops web, Driver App, Portal | Phase 1 (Server Actions + Route Handlers) |
| **Partner webhooks (inbound)** | ELD, email, payments | Phase 1 |
| **Outbound webhooks** | Customer automation | Phase 1–2 |
| **Public API** | External developers | Phase 2+ (`/platform/developers`) |

---

## Private API conventions

- REST-ish JSON over HTTPS; resource-oriented paths.
- Namespace: `/api/v1/...` for Route Handlers; server actions remain RPC-style but share the same use-cases.
- Every request: correlation ID, tenant context, actor.
- Idempotency-Key on creates/payments/imports.
- Error envelope: `{ code, message, details?, retryable? }`.

Example private resources:

```
/api/v1/loads
/api/v1/loads/:id/assign
/api/v1/documents
/api/v1/documents/:id/extractions
/api/v1/drivers
/api/v1/fleet/trucks
/api/v1/migrations/:id/commit
/api/v1/webhooks/eld/:provider
```

---

## Versioning

| Strategy | Rule |
|----------|------|
| URL version | `/api/v1` for public & durable private HTTP |
| Additive changes | Preferred |
| Breaking changes | New version; deprecate ≥ 6 months |
| Server actions | Not a public contract — may churn with UI |

---

## Rate limits

| Surface | Guidance |
|---------|----------|
| Interactive BFF | Per user + per company burst limits |
| Driver sync | Higher read; write coalesced |
| Webhooks inbound | Per provider key; reject replay |
| Public API | Per API key tiers; publish limits |
| OCR / migration | Queue fairness per tenant — not unlimited parallel |

Return `429` with `Retry-After`. Store counters in cache when available; in-memory only for single-node dev.

**Do not overengineer:** start with coarse limits; refine abusers with metrics.

---

## Webhooks

### Inbound

1. Verify signature + timestamp window
2. Persist raw payload (`webhook_inbox`)
3. Ack quickly
4. Process async idempotently

### Outbound

- Customer registers HTTPS endpoints
- Sign payloads; at-least-once delivery with retries + dead-letter
- Event types versioned (`load.assigned.v1`)
- User can rotate secrets; never log full secrets

---

## Future public API

Principles:

- OAuth2 scopes mapped to permission catalog
- Least privilege defaults
- Separate from session cookie auth
- OpenAPI spec published from `/platform/developers`
- Sandbox tenant for partners
- Constitution: public API must not expose AI “approve” shortcuts — same gates as UI

---

## Compatibility with domains

APIs are thin adapters over application services ([03-backend.md](./03-backend.md)). No business rules only in Route Handlers.
