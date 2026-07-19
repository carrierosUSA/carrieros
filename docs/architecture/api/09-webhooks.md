# 09 — Webhooks

**Status:** Target design
**Parent:** [`../06-apis.md`](../06-apis.md) · IAM [`../iam/10-api-security.md`](../iam/10-api-security.md)

---

## Inbound (providers → Transpo)

Examples: ELD, email inbound, payment processor, SMS.

### Security pipeline

1. **Verify signature** (HMAC) + **timestamp window** (reject replay outside skew).
2. **Persist raw payload** to `webhook_inbox` (tenant resolved via provider key mapping).
3. **Ack quickly** (`2xx`) after durable persist.
4. **Process async** with idempotency key = provider event id (or hash).
5. **Dedupe** on `(provider, event_id)` unique constraint.
6. **Log** verification result, latency, process status — never log full secrets.

### Routes (target)

```text
POST /api/v1/webhooks/eld/:provider
POST /api/v1/webhooks/payments/:provider
POST /api/v1/webhooks/email/:provider
```

Auth: **not** user session — provider secrets / signatures only.

---

## Outbound (Transpo → customer)

1. Customer registers HTTPS endpoint + secret (settings UI).
2. Events versioned: `load.assigned.v1`, `document.ready.v1`, …
3. Sign body (`X-Transpo-Signature`, `X-Transpo-Timestamp`).
4. At-least-once delivery with exponential backoff + **dead-letter**.
5. Customer can rotate secrets; audit rotations.
6. Replay tool for admins: requeue by `delivery_id` (audited).

### Delivery log

Store: event type, version, attempt, response code, next_retry, final status.
Payload retention per policy; redact PII in support views when required.

---

## Versioning

| Concern | Rule |
|---------|------|
| Event type | Include `.v1` suffix |
| Additive fields | Allowed in same version |
| Breaking payload | New version; dual-publish during deprecation |
| Endpoint URL | Customer-owned; our senders respect their URL |

---

## Retries & dedupe

| Direction | Retry | Dedupe key |
|-----------|-------|------------|
| Inbound process | Worker retries | Provider `event_id` |
| Outbound deliver | Backoff → DLQ | `delivery_id` / `(subscription_id, event_id)` |

Consumers (ours and theirs) must treat handlers as **idempotent**.

---

## Related

- Idempotency: [07-idempotency.md](./07-idempotency.md)
- Jobs: [08-jobs.md](./08-jobs.md)
- Integrations module: [13-module-catalog.md](./13-module-catalog.md)
