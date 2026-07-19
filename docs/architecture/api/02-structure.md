# 02 — `/api/v1/` Resource Structure

**Status:** Target design
**Namespace:** `/api/v1`
**Adapters:** Next.js Route Handlers under `carrieros-app/app/api/v1/**`

---

## Design rules

1. **Resource-oriented** REST-ish JSON over HTTPS.
2. **Plural nouns** for collections (`/loads`, `/drivers`).
3. **Nested resources** only when ownership is clear (`/loads/:id/stops`).
4. **Actions as sub-resources** when not a clean field update (`/loads/:id/assign`).
5. **No business logic in handlers** — call `lib/services/*` (or future `lib/services/<domain>/use-cases`).
6. **Do not duplicate** an endpoint that already works via Server Action until the action shares the same service path (see [14-migration-plan.md](./14-migration-plan.md)).

---

## Top-level tree

```text
/api/v1
  /health                          GET

  /auth                            session, switch-company, step-up (IAM)
  /companies                       current company, entities
  /users                           members, invites
  /roles                           role definitions
  /permissions                     catalog (read), effective grants

  /drivers
  /fleet
    /trucks
    /trailers
  /loads
    /:id/stops
    /:id/assign
    /:id/tracking
  /dispatch                        board / views (read-heavy)
  /customers
  /brokers

  /documents
  /ocr                             jobs + extractions review (not auto-approve)
  /fuel
  /maintenance

  /payroll
  /settlements
  /invoices
  /payments
  /expenses
  /ifta

  /reports
  /notifications
  /messages

  /integrations
  /migration                       Migration Center (preview → human commit)
  /imports
  /exports
  /audit

  /alph                            assist endpoints only
  /settings
  /billing                         SaaS subscription (platform)

  /webhooks                        inbound provider hooks (separate auth)
  /jobs                            job status (authenticated)
```

Full per-module methods: [13-module-catalog.md](./13-module-catalog.md).

---

## Module → path map

| Module | Base path |
|--------|-----------|
| Auth | `/api/v1/auth` |
| Companies | `/api/v1/companies` |
| Users | `/api/v1/users` |
| Roles | `/api/v1/roles` |
| Permissions | `/api/v1/permissions` |
| Drivers | `/api/v1/drivers` |
| Trucks | `/api/v1/fleet/trucks` |
| Trailers | `/api/v1/fleet/trailers` |
| Loads | `/api/v1/loads` |
| Stops | `/api/v1/loads/:loadId/stops` |
| Dispatch | `/api/v1/dispatch` |
| Customers | `/api/v1/customers` |
| Brokers | `/api/v1/brokers` |
| Documents | `/api/v1/documents` |
| OCR | `/api/v1/ocr` |
| Fuel | `/api/v1/fuel` |
| Maintenance | `/api/v1/maintenance` |
| Payroll | `/api/v1/payroll` |
| Settlements | `/api/v1/settlements` |
| Invoices | `/api/v1/invoices` |
| Payments | `/api/v1/payments` |
| Expenses | `/api/v1/expenses` |
| IFTA | `/api/v1/ifta` |
| Reports | `/api/v1/reports` |
| Notifications | `/api/v1/notifications` |
| Messages | `/api/v1/messages` |
| Integrations | `/api/v1/integrations` |
| Migration | `/api/v1/migration` |
| Imports | `/api/v1/imports` |
| Exports | `/api/v1/exports` |
| Audit | `/api/v1/audit` |
| Alph | `/api/v1/alph` |
| Settings | `/api/v1/settings` |
| Billing | `/api/v1/billing` |

---

## Method conventions

| Method | Use |
|--------|-----|
| `GET` | Read one / list |
| `POST` | Create or non-idempotent action (prefer Idempotency-Key) |
| `PATCH` | Partial update |
| `PUT` | Full replace of a sub-resource (roles grants, etc.) |
| `DELETE` | Soft-delete / archive / cancel (prefer soft; see contracts) |

---

## Relationship to Server Actions

```text
UI form ──► Server Action ──┐
                            ├──► lib/services/<domain>
HTTP client ──► /api/v1/* ──┘
```

Both paths must resolve **session → membership → permission → service**.
Server Actions are not a public contract; `/api/v1` is the durable HTTP contract.

---

## Out of `/api/v1` (for now)

| Concern | Where |
|---------|-------|
| RSC page data loaders | `app/**/page.tsx` server components |
| Static marketing | unchanged |
| Future public developer API | May share `/api/v1` with API keys or move to `/api/public/v1` later ([10-versioning.md](./10-versioning.md)) |

---

## Related

- Contracts: [03-contracts.md](./03-contracts.md)
- Catalog: [13-module-catalog.md](./13-module-catalog.md)
- Thin overview: [`../06-apis.md`](../06-apis.md)
