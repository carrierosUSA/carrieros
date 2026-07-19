# 13 — API Module Catalog

**Status:** Target `/api/v1` contracts
**Legend:** Permissions use IAM target codes (`resource:action`); map from today’s `page.*` / `button.*` during migration.
**Schemas:** Outlines only — refine when implementing each module.
**Shared:** Errors [06](./06-errors.md) · Validation [04](./04-validation.md) · AuthZ [05](./05-authorization.md) · Idempotency [07](./07-idempotency.md)

Default list behavior: cursor pagination, `q` search where noted, tenant from auth context.

---

## Auth

| Field | Detail |
|-------|--------|
| **Resource** | Session, company switch, step-up |
| **Endpoints** | `GET /auth/session` · `POST /auth/switch-company` · `POST /auth/step-up` · `POST /auth/sign-out` |
| **Methods** | GET/POST |
| **Purpose** | Establish authenticated API context |
| **Request** | Switch: `{ company_id }` (verified membership) |
| **Response** | `{ user, company, roles, permissions[] }` |
| **Permission** | Authenticated; switch requires active membership |
| **Validation** | `company_id` format; membership assert |
| **Errors** | `unauthorized`, `forbidden` |
| **Audit** | Company switches, step-up |
| **Rate-limit** | Strict on step-up / switch |
| **Idempotency** | N/A |
| **Pagination** | N/A |
| **Search/filter** | N/A |

---

## Companies

| Field | Detail |
|-------|--------|
| **Resource** | Tenant company profile / entities |
| **Endpoints** | `GET /companies/current` · `PATCH /companies/current` · `GET /companies/:id` (membership) |
| **Methods** | GET/PATCH |
| **Purpose** | Read/update carrier org profile |
| **Request** | Patch: name, DOT/MC, branding fields (whitelist) |
| **Response** | Company DTO |
| **Permission** | `company:view` / `company:manage` |
| **Validation** | Legal id formats; no `company_id` spoof |
| **Errors** | `not_found`, `validation_error`, `forbidden` |
| **Audit** | Profile changes |
| **Rate-limit** | Standard |
| **Idempotency** | Optional on PATCH |
| **Pagination** | N/A (single) |
| **Search/filter** | N/A |

---

## Users

| Field | Detail |
|-------|--------|
| **Resource** | Company members |
| **Endpoints** | `GET /users` · `GET /users/:id` · `POST /users/invite` · `PATCH /users/:id` · `POST /users/:id/deactivate` |
| **Methods** | GET/POST/PATCH |
| **Purpose** | Team lifecycle |
| **Request** | Invite: `{ email, role_ids[] }` |
| **Response** | User/membership DTO |
| **Permission** | `users:view` / `users:invite` / `users:manage` |
| **Validation** | Email; role_ids in-tenant |
| **Errors** | `conflict` (duplicate), `forbidden` |
| **Audit** | Invites, role changes, deactivate |
| **Rate-limit** | Invite capped |
| **Idempotency** | Invite key recommended |
| **Pagination** | Cursor |
| **Search/filter** | `q`, `filter[status]` |

---

## Roles

| Field | Detail |
|-------|--------|
| **Resource** | RBAC roles |
| **Endpoints** | `GET /roles` · `POST /roles` · `PATCH /roles/:id` · `PUT /roles/:id/permissions` · `PUT /memberships/:id/roles` |
| **Methods** | GET/POST/PATCH/PUT |
| **Purpose** | Define and assign roles |
| **Request** | Permissions: `{ permission_ids[] }` |
| **Response** | Role DTO + grants |
| **Permission** | `roles:view` / `roles:manage` (+ step-up) |
| **Validation** | No privilege escalation beyond actor |
| **Errors** | `forbidden`, `step_up_required` |
| **Audit** | **Required** all changes |
| **Rate-limit** | Standard |
| **Idempotency** | Optional |
| **Pagination** | Offset OK (small) |
| **Search/filter** | `q` |

---

## Permissions

| Field | Detail |
|-------|--------|
| **Resource** | Permission catalog + effective grants |
| **Endpoints** | `GET /permissions` · `GET /permissions/effective` |
| **Methods** | GET |
| **Purpose** | Clients discover AuthZ vocabulary |
| **Request** | — |
| **Response** | Catalog entries; effective codes for session |
| **Permission** | Authenticated (`roles:manage` for full catalog admin notes) |
| **Validation** | N/A |
| **Errors** | `unauthorized` |
| **Audit** | N/A (read) |
| **Rate-limit** | Cacheable |
| **Idempotency** | N/A |
| **Pagination** | Optional |
| **Search/filter** | `q`, `filter[module]` |

---

## Drivers

| Field | Detail |
|-------|--------|
| **Resource** | Driver master data |
| **Endpoints** | `GET|POST /drivers` · `GET|PATCH|DELETE /drivers/:id` · `POST /drivers/:id/assign` · `GET /drivers/:id/timeline` · nested license/medical/docs/time-off |
| **Methods** | CRUD + actions |
| **Purpose** | Driver lifecycle (wraps `lib/services/drivers`) |
| **Request** | Create/Update per `CreateDriverInput` |
| **Response** | Driver DTO; sensitive fields gated |
| **Permission** | `drivers:view|create|edit|delete|assign` · `drivers:documents:*` · sensitive read |
| **Validation** | Phone/email/CDL; status enum |
| **Errors** | `validation_error`, `conflict`, `not_found` |
| **Audit** | Create/update/delete/assign |
| **Rate-limit** | Standard |
| **Idempotency** | Create optional; assign recommended |
| **Pagination** | Cursor |
| **Search/filter** | `q`, `filter[status]` |

---

## Trucks

| Field | Detail |
|-------|--------|
| **Resource** | Power units |
| **Endpoints** | `GET|POST /fleet/trucks` · `GET|PATCH|DELETE /fleet/trucks/:id` |
| **Methods** | CRUD |
| **Purpose** | Fleet register (wraps `lib/services/fleet`) |
| **Request** | Unit number, VIN, status, specs |
| **Response** | Truck DTO |
| **Permission** | `fleet:trucks:view|create|edit|delete` |
| **Validation** | VIN format soft-check; unique unit# per company |
| **Errors** | `conflict`, `validation_error` |
| **Audit** | Mutations |
| **Rate-limit** | Standard |
| **Idempotency** | Create optional |
| **Pagination** | Cursor |
| **Search/filter** | `q`, `filter[status]` |

---

## Trailers

| Field | Detail |
|-------|--------|
| **Resource** | Trailers |
| **Endpoints** | `GET|POST /fleet/trailers` · `GET|PATCH|DELETE /fleet/trailers/:id` |
| **Methods** | CRUD |
| **Purpose** | Trailer register |
| **Request** | Unit#, type, status |
| **Response** | Trailer DTO |
| **Permission** | `fleet:trailers:view|create|edit|delete` |
| **Validation** | Type enum; unique unit# |
| **Errors** | Same as trucks |
| **Audit** | Mutations |
| **Rate-limit** | Standard |
| **Idempotency** | Create optional |
| **Pagination** | Cursor |
| **Search/filter** | `q`, `filter[status]` |

---

## Loads

| Field | Detail |
|-------|--------|
| **Resource** | Load / shipment |
| **Endpoints** | `GET|POST /loads` · `GET|PATCH|DELETE /loads/:id` · `POST /loads/:id/assign` · `POST /loads/batch` |
| **Methods** | CRUD + assign + batch |
| **Purpose** | Core ops (wraps `lib/services/loads`) |
| **Request** | CreateLoadInput / assign `{ driver_id?, truck_id?, trailer_id? }` |
| **Response** | Load summary/detail DTO |
| **Permission** | `loads:view|create|edit|delete|assign|export` |
| **Validation** | Stops, dates, status transitions |
| **Errors** | `conflict` on illegal status; `unprocessable` |
| **Audit** | Assign, cancel, rate changes |
| **Rate-limit** | Standard; batch stricter |
| **Idempotency** | **Required** on batch; recommended on create/assign |
| **Pagination** | Cursor |
| **Search/filter** | `q`, `filter[status]`, date ranges, `sort` |

---

## Stops

| Field | Detail |
|-------|--------|
| **Resource** | Load stops |
| **Endpoints** | `GET|POST /loads/:loadId/stops` · `PATCH|DELETE /loads/:loadId/stops/:stopId` |
| **Methods** | CRUD nested |
| **Purpose** | Pickup/delivery sequence |
| **Request** | Address, window, appointment type, contact |
| **Response** | Stop DTO ordered by sequence |
| **Permission** | `loads:view` / `loads:edit` |
| **Validation** | Sequence unique; geo optional |
| **Errors** | `not_found` if load missing |
| **Audit** | Edits affecting ETA |
| **Rate-limit** | Standard |
| **Idempotency** | Optional |
| **Pagination** | Rarely needed (small) |
| **Search/filter** | N/A |

---

## Dispatch

| Field | Detail |
|-------|--------|
| **Resource** | Dispatch board / views |
| **Endpoints** | `GET /dispatch/board` · `GET /dispatch/issues` |
| **Methods** | GET |
| **Purpose** | Read models for board (not second write API) |
| **Request** | Filters: status, dispatcher, date |
| **Response** | Board columns / issue list |
| **Permission** | `loads:view` (+ future `dispatch:view`) |
| **Validation** | Filter whitelist |
| **Errors** | `validation_error` |
| **Audit** | N/A |
| **Rate-limit** | Cache short TTL |
| **Idempotency** | N/A |
| **Pagination** | Cursor / windowed |
| **Search/filter** | Board filters |

---

## Customers

| Field | Detail |
|-------|--------|
| **Resource** | Shipper/customer directory |
| **Endpoints** | `GET|POST /customers` · `GET|PATCH|DELETE /customers/:id` |
| **Methods** | CRUD |
| **Purpose** | Customer master |
| **Request** | Name, contacts, billing profile refs |
| **Response** | Customer DTO |
| **Permission** | `customers:view|create|edit|delete` |
| **Validation** | Required name; email format |
| **Errors** | `conflict` |
| **Audit** | Mutations |
| **Rate-limit** | Standard |
| **Idempotency** | Optional |
| **Pagination** | Cursor |
| **Search/filter** | `q` |

---

## Brokers

| Field | Detail |
|-------|--------|
| **Resource** | Broker directory |
| **Endpoints** | `GET|POST /brokers` · `GET|PATCH|DELETE /brokers/:id` |
| **Methods** | CRUD |
| **Purpose** | Broker master (`lib/brokers`) |
| **Request** | MC/DOT, contacts, credit notes (non-authoritative) |
| **Response** | Broker DTO |
| **Permission** | `brokers:view|create|edit|delete` |
| **Validation** | MC format soft-check |
| **Errors** | Standard |
| **Audit** | Mutations |
| **Rate-limit** | Standard |
| **Idempotency** | Optional |
| **Pagination** | Cursor |
| **Search/filter** | `q` |

---

## Documents

| Field | Detail |
|-------|--------|
| **Resource** | Document metadata + files |
| **Endpoints** | `GET|POST /documents` · `GET|PATCH|DELETE /documents/:id` · `POST /documents/:id/download-url` · packet helpers under `/documents/packets/:loadId` |
| **Methods** | CRUD + signed URL |
| **Purpose** | Docs hub (`lib/services/documents`) |
| **Request** | Multipart upload; type; entity links |
| **Response** | Document DTO; short-lived download URL |
| **Permission** | `documents:view|upload|download|delete|manage` (+ category perms) |
| **Validation** | MIME/size; type enum |
| **Errors** | `payload_too_large`, `forbidden` |
| **Audit** | Upload/delete/download sensitive |
| **Rate-limit** | Upload quota per company |
| **Idempotency** | Upload key recommended |
| **Pagination** | Cursor |
| **Search/filter** | `q`, `filter[type]`, `filter[load_id]` |

---

## OCR

| Field | Detail |
|-------|--------|
| **Resource** | Extraction jobs + review |
| **Endpoints** | `POST /ocr/jobs` · `GET /ocr/jobs/:id` · `GET /ocr/jobs/:id/result` · `POST /ocr/jobs/:id/apply` |
| **Methods** | POST/GET |
| **Purpose** | Extract draft data — **human apply** |
| **Request** | `{ document_id }` · apply: confirmed fields |
| **Response** | Job status; draft extraction; apply result |
| **Permission** | `documents:ocr:run` / `documents:ocr:apply` |
| **Validation** | Document in-tenant |
| **Errors** | `human_approval_required` if apply without confirm; `dependency_failed` |
| **Audit** | **Required** on apply |
| **Rate-limit** | Queue fairness |
| **Idempotency** | **Required** enqueue + apply |
| **Pagination** | Job list cursor |
| **Search/filter** | `filter[status]` |

---

## Fuel

| Field | Detail |
|-------|--------|
| **Resource** | Fuel purchases / cards |
| **Endpoints** | `GET|POST /fuel/transactions` · `GET|PATCH /fuel/transactions/:id` · `GET /fuel/summary` |
| **Methods** | GET/POST/PATCH |
| **Purpose** | Fuel ops + IFTA inputs |
| **Request** | Gallons, state, truck_id, receipt doc |
| **Response** | Transaction DTO / summary |
| **Permission** | `fuel:view|create|edit` |
| **Validation** | Positive quantities; state code |
| **Errors** | Standard |
| **Audit** | Adjustments |
| **Rate-limit** | Standard |
| **Idempotency** | Create recommended (card feeds) |
| **Pagination** | Cursor |
| **Search/filter** | date, `filter[truck_id]`, state |

---

## Maintenance

| Field | Detail |
|-------|--------|
| **Resource** | Work orders / DVIR linkage |
| **Endpoints** | `GET|POST /maintenance/work-orders` · `GET|PATCH /maintenance/work-orders/:id` · `POST /…/complete` |
| **Methods** | CRUD + complete |
| **Purpose** | Maintenance board API |
| **Request** | Asset, priority, vendor, costs |
| **Response** | Work order DTO |
| **Permission** | `maintenance:view|create|edit|complete` |
| **Validation** | Asset in-tenant |
| **Errors** | Standard |
| **Audit** | Complete / cost edits |
| **Rate-limit** | Standard |
| **Idempotency** | Complete **required** |
| **Pagination** | Cursor |
| **Search/filter** | `filter[status]`, asset |

---

## Payroll

| Field | Detail |
|-------|--------|
| **Resource** | Payroll runs / lines |
| **Endpoints** | `GET|POST /payroll/runs` · `GET /payroll/runs/:id` · `POST /payroll/runs/:id/submit` · `POST /…/approve` |
| **Methods** | GET/POST |
| **Purpose** | Draft → human approve → submit |
| **Request** | Period; line adjustments |
| **Response** | Run DTO; never silent finalize |
| **Permission** | `payroll:view|prepare|approve|submit` |
| **Validation** | Period bounds; totals |
| **Errors** | `human_approval_required`, `forbidden` |
| **Audit** | **Required** approve/submit |
| **Rate-limit** | Strict on submit |
| **Idempotency** | **Required** submit/approve |
| **Pagination** | Cursor |
| **Search/filter** | period, status |

---

## Settlements

| Field | Detail |
|-------|--------|
| **Resource** | Owner/driver settlements |
| **Endpoints** | `GET|POST /settlements` · `GET /settlements/:id` · `POST /settlements/:id/finalize` |
| **Methods** | GET/POST |
| **Purpose** | Settlement statements |
| **Request** | Period, payee, lines |
| **Response** | Settlement DTO |
| **Permission** | `settlements:view|prepare|finalize` |
| **Validation** | Payee in-tenant |
| **Errors** | `human_approval_required` |
| **Audit** | **Required** finalize |
| **Rate-limit** | Strict finalize |
| **Idempotency** | **Required** finalize |
| **Pagination** | Cursor |
| **Search/filter** | period, payee, status |

---

## Invoices

| Field | Detail |
|-------|--------|
| **Resource** | Customer/broker invoices |
| **Endpoints** | `GET|POST /invoices` · `GET|PATCH /invoices/:id` · `POST /invoices/:id/issue` · `POST /…/void` |
| **Methods** | GET/POST/PATCH |
| **Purpose** | AR invoices |
| **Request** | Line items, load refs, amounts (cents) |
| **Response** | Invoice DTO |
| **Permission** | `invoices:view|create|edit|issue|void` |
| **Validation** | Money integers; status transitions |
| **Errors** | `conflict` on re-issue |
| **Audit** | Issue/void |
| **Rate-limit** | Standard |
| **Idempotency** | **Required** issue/void |
| **Pagination** | Cursor |
| **Search/filter** | `q`, status, customer, dates |

---

## Payments

| Field | Detail |
|-------|--------|
| **Resource** | Payment intents / captures |
| **Endpoints** | `GET|POST /payments` · `GET /payments/:id` · `POST /payments/:id/capture` · `POST /…/refund` |
| **Methods** | GET/POST |
| **Purpose** | Money movement records |
| **Request** | Amount, method, invoice_id |
| **Response** | Payment DTO |
| **Permission** | `payments:view|create|capture|refund` |
| **Validation** | Amount > 0; currency |
| **Errors** | `dependency_failed`, `idempotency_conflict` |
| **Audit** | **Required** all |
| **Rate-limit** | Strict |
| **Idempotency** | **Required** all creates/captures/refunds |
| **Pagination** | Cursor |
| **Search/filter** | status, invoice, dates |

---

## Expenses

| Field | Detail |
|-------|--------|
| **Resource** | Expenses / reimbursements |
| **Endpoints** | `GET|POST /expenses` · `GET|PATCH /expenses/:id` · `POST /expenses/:id/approve` |
| **Methods** | GET/POST/PATCH |
| **Purpose** | Driver/ops expenses |
| **Request** | Category, amount, receipt doc |
| **Response** | Expense DTO |
| **Permission** | `expenses:view|create|edit|approve` |
| **Validation** | Amount; category enum |
| **Errors** | `human_approval_required` for payout |
| **Audit** | Approve |
| **Rate-limit** | Standard |
| **Idempotency** | Approve **required** |
| **Pagination** | Cursor |
| **Search/filter** | status, driver, dates |

---

## IFTA

| Field | Detail |
|-------|--------|
| **Resource** | IFTA periods / filings (assist) |
| **Endpoints** | `GET /ifta/periods` · `GET /ifta/periods/:id` · `POST /ifta/periods/:id/prepare` · `POST /…/mark-filed` |
| **Methods** | GET/POST |
| **Purpose** | Tax prep — **humans file/certify** |
| **Request** | Prepare options; mark-filed evidence |
| **Response** | Period summary, jurisdiction lines |
| **Permission** | `ifta:view|prepare|manage` |
| **Validation** | Quarter/year |
| **Errors** | Never claim government acceptance via AI |
| **Audit** | mark-filed |
| **Rate-limit** | Prepare via job |
| **Idempotency** | Prepare/mark-filed recommended |
| **Pagination** | Offset OK |
| **Search/filter** | year, quarter |

---

## Reports

| Field | Detail |
|-------|--------|
| **Resource** | Report definitions / runs |
| **Endpoints** | `GET /reports` · `POST /reports/:id/run` · `GET /reports/runs/:runId` |
| **Methods** | GET/POST |
| **Purpose** | Async report generation |
| **Request** | Parameters whitelist |
| **Response** | Run job + download when ready |
| **Permission** | `reports:view|run` (+ per-report) |
| **Validation** | Param schema per report |
| **Errors** | `forbidden` hidden reports |
| **Audit** | Export-like runs |
| **Rate-limit** | Per company concurrency |
| **Idempotency** | Run key recommended |
| **Pagination** | Runs cursor |
| **Search/filter** | report id, dates |

---

## Notifications

| Field | Detail |
|-------|--------|
| **Resource** | In-app notifications |
| **Endpoints** | `GET /notifications` · `POST /notifications/:id/read` · `POST /notifications/read-all` |
| **Methods** | GET/POST |
| **Purpose** | User notification feed |
| **Request** | — |
| **Response** | Notification DTO |
| **Permission** | Authenticated (own feed) |
| **Validation** | Id ownership |
| **Errors** | `not_found` |
| **Audit** | N/A |
| **Rate-limit** | Standard |
| **Idempotency** | read-all optional |
| **Pagination** | Cursor |
| **Search/filter** | `filter[unread]=true` |

---

## Messages

| Field | Detail |
|-------|--------|
| **Resource** | Threads / messages (comms) |
| **Endpoints** | `GET|POST /messages/threads` · `GET|POST /messages/threads/:id/messages` |
| **Methods** | GET/POST |
| **Purpose** | Ops messaging (`lib/communications`) |
| **Request** | Body, attachments refs, participants |
| **Response** | Thread/message DTO |
| **Permission** | `messages:view|send` |
| **Validation** | Body length; participant membership |
| **Errors** | `forbidden` |
| **Audit** | External sends |
| **Rate-limit** | Send capped |
| **Idempotency** | Send recommended |
| **Pagination** | Cursor |
| **Search/filter** | `q`, participant |

---

## Integrations

| Field | Detail |
|-------|--------|
| **Resource** | Connectors (ELD, etc.) |
| **Endpoints** | `GET /integrations` · `GET|POST /integrations/:id/connect` · `POST /…/disconnect` · `GET /…/health` · `POST /…/sync` |
| **Methods** | GET/POST |
| **Purpose** | Integration bus |
| **Request** | OAuth codes / config (server-stored secrets) |
| **Response** | Status, health, last sync |
| **Permission** | `integrations:view|manage|sync` |
| **Validation** | Provider whitelist |
| **Errors** | `dependency_failed` |
| **Audit** | Connect/disconnect |
| **Rate-limit** | Sync fair-queue |
| **Idempotency** | Sync key recommended |
| **Pagination** | Offset OK |
| **Search/filter** | provider, status |

---

## Migration

| Field | Detail |
|-------|--------|
| **Resource** | Migration Center projects |
| **Endpoints** | `GET|POST /migration/projects` · `POST /…/map` · `POST /…/preview` · `POST /…/commit` |
| **Methods** | GET/POST |
| **Purpose** | Import legacy data — **human commit** (Constitution) |
| **Request** | Mappings; commit confirmation token |
| **Response** | Project, preview report, commit job |
| **Permission** | `migration:view|prepare|commit` |
| **Validation** | Mapping schema |
| **Errors** | `human_approval_required` without confirm |
| **Audit** | **Required** commit |
| **Rate-limit** | Heavy; queue |
| **Idempotency** | **Required** commit chunks |
| **Pagination** | Projects offset |
| **Search/filter** | status |

---

## Imports

| Field | Detail |
|-------|--------|
| **Resource** | Generic file imports |
| **Endpoints** | `POST /imports` · `GET /imports/:id` · `POST /imports/:id/confirm` |
| **Methods** | POST/GET |
| **Purpose** | CSV/XLS import jobs |
| **Request** | Multipart + type |
| **Response** | Import job + errors report |
| **Permission** | `imports:run` (+ type-specific) |
| **Validation** | File type/size |
| **Errors** | `validation_error` row errors in details |
| **Audit** | Confirm |
| **Rate-limit** | Queue fairness |
| **Idempotency** | **Required** |
| **Pagination** | List cursor |
| **Search/filter** | type, status |

---

## Exports

| Field | Detail |
|-------|--------|
| **Resource** | Async exports |
| **Endpoints** | `POST /exports` · `GET /exports/:id` · `GET /exports/:id/download` |
| **Methods** | POST/GET |
| **Purpose** | Bulk export without huge sync responses |
| **Request** | Resource, filters, format |
| **Response** | Job; signed download |
| **Permission** | `*:export` matching resource |
| **Validation** | Whitelist resources/fields |
| **Errors** | `forbidden` |
| **Audit** | Export created |
| **Rate-limit** | Per company |
| **Idempotency** | Recommended |
| **Pagination** | N/A |
| **Search/filter** | Via export body filters |

---

## Audit

| Field | Detail |
|-------|--------|
| **Resource** | Audit log entries |
| **Endpoints** | `GET /audit` · `GET /audit/:id` |
| **Methods** | GET |
| **Purpose** | Security/compliance trail |
| **Request** | — |
| **Response** | Audit entry (redact secrets) |
| **Permission** | `audit:view` |
| **Validation** | Date range limits |
| **Errors** | `forbidden` |
| **Audit** | N/A (meta) |
| **Rate-limit** | Stricter |
| **Idempotency** | N/A |
| **Pagination** | Cursor **required** |
| **Search/filter** | actor, action, resource, dates |

---

## Alph

| Field | Detail |
|-------|--------|
| **Resource** | AI assist proposals |
| **Endpoints** | See [12-alph.md](./12-alph.md) |
| **Methods** | GET/POST |
| **Purpose** | Assist; confirm critical via human |
| **Request** | NL text / resource context |
| **Response** | Suggestions, proposals, history |
| **Permission** | **Same as underlying action** + Alph feature flag |
| **Validation** | Length limits; no `skip_confirmation` |
| **Errors** | `human_approval_required`, `forbidden` |
| **Audit** | **Required** proposals + confirms |
| **Rate-limit** | Per user burst |
| **Idempotency** | Confirm **required** |
| **Pagination** | History cursor |
| **Search/filter** | History filters |

---

## Settings

| Field | Detail |
|-------|--------|
| **Resource** | Company settings sections |
| **Endpoints** | `GET|PATCH /settings/:section` |
| **Methods** | GET/PATCH |
| **Purpose** | Config (`lib/settings`) |
| **Request** | Section-specific whitelist |
| **Response** | Settings DTO |
| **Permission** | `settings:view|manage` (section-scoped) |
| **Validation** | Per section schema |
| **Errors** | `validation_error` |
| **Audit** | Security-related sections |
| **Rate-limit** | Standard |
| **Idempotency** | Optional |
| **Pagination** | N/A |
| **Search/filter** | N/A |

---

## Billing

| Field | Detail |
|-------|--------|
| **Resource** | SaaS subscription (Transpo billing) |
| **Endpoints** | `GET /billing/subscription` · `POST /billing/checkout` · `POST /billing/portal` · `GET /billing/invoices` |
| **Methods** | GET/POST |
| **Purpose** | Plan & platform invoices (not freight AR) |
| **Request** | Plan id; success URLs |
| **Response** | Subscription status; portal URL |
| **Permission** | `billing:view|manage` (Owner-heavy) |
| **Validation** | Plan whitelist |
| **Errors** | `dependency_failed` (processor) |
| **Audit** | Plan changes |
| **Rate-limit** | Strict |
| **Idempotency** | **Required** checkout |
| **Pagination** | Invoices cursor |
| **Search/filter** | N/A |

---

## Cross-cutting: Health / Jobs / Webhooks

Documented in [02-structure.md](./02-structure.md), [08-jobs.md](./08-jobs.md), [09-webhooks.md](./09-webhooks.md). Health is unauthenticated liveness only.

---

## Related

- Domain module narrative: [`../13-module-catalog.md`](../13-module-catalog.md)
- Migration of handlers: [14-migration-plan.md](./14-migration-plan.md)
