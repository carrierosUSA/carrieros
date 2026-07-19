# 08 — Search, Notifications & Email

## Purpose

Cross-cutting discovery and communications architecture. Prefer simple, reliable channels over clever delivery graphs.

---

## Search

### Phase 1 (monolith-friendly)

- **Postgres full-text / trigram** (`pg_trgm`) for drivers, loads, brokers, documents metadata, equipment.
- Command palette (`lib/command-palette`) queries the same search service with AuthZ filters.
- Always scope by `company_id` (+ portal share rules).

### Phase 2 (when needed)

- Dedicated search index when Postgres search CPU dominates or relevance needs rise (Exchange catalog, Network directory).
- Async indexer from outbox events.
- Multi-tenant index filters mandatory.

**Do not overengineer:** do not introduce Elasticsearch at T0–T1.

| Entity | Searchable fields (examples) |
|--------|------------------------------|
| Loads | reference, cities, broker name, status |
| Drivers | name, phone, license |
| Trucks/Trailers | unit #, VIN, plate |
| Documents | filename, type, linked entity |
| Network/Exchange | public profile fields only |

---

## Notifications

**In-app** (`lib/notifications`, `app/notifications`):

- `notifications` table: actor, recipient, type, payload, read_at
- Preference center: channel × event type
- Realtime optional (SSE/WebSocket) later; polling acceptable early

**Push (Driver App):** provider adapter (APNs/FCM); quiet hours; trip-critical exceptions.

**Event examples:** load assigned, doc needs review, payroll ready for approval, migration finished, compliance expiry.

Rules:

- Alph-generated messages still need policy checks before external send.
- Never notify cross-tenant without a share grant.
- Deduplicate by idempotency key.

---

## Email & SMS

Anchors: `lib/communications/*`.

| Channel | Use |
|---------|-----|
| Transactional email | Invites, invoices, rate cons, magic links |
| SMS | Driver urgent / OTP (cost-aware) |
| In-app | Default for ops chatter |

Architecture:

```
Domain event → Notification planner → Channel adapters → Provider
                     ↓
              preferences + suppression
```

- Templates versioned; tenant branding optional
- Bounce/complaint handling updates suppression list
- Secrets for providers in env/secret manager
- Accountant/portal emails must not leak other tenants’ data in CC or headers

**Do not overengineer:** one email provider + one SMS provider adapters; no custom ESP until volume/compliance demands.

---

## Observability

Track delivery rates, latency, provider errors, and per-tenant send volume (abuse detection). Admin health surfaces can reuse `lib/admin/health` patterns.
