# 20 — Recommended Index Catalog

**Status:** Documentation only — indexes not applied.
**Extends:** [80-performance-scale.md](../80-performance-scale.md)
**Rule:** Lead with `company_id`; prefer partial indexes `WHERE deleted_at IS NULL`; match real list/board queries.

---

## 1. Indexing rules (apply order)

1. PK / unique constraints first
2. All FKs used in joins
3. Tenant list/board composites (`company_id`, filter, sort)
4. Partial uniques for soft-delete uniqueness
5. GIN only for proven search (`search_vector`, jsonb containment)
6. Revisit with `pg_stat_user_indexes` after traffic — drop unused later (never drop in Phase B speculation)

---

## 2. Identity & tenancy

| Table | Index | Purpose |
|-------|-------|---------|
| `companies` | `(status)` where `deleted_at is null` | Admin lists |
| `companies` | unique `(dot_number)` where not null & active | Dedup carriers |
| `users` | unique `(email)` where `deleted_at is null` | Login identity |
| `users` | `(auth_user_id)` | Auth bridge |
| `company_memberships` | unique `(company_id, user_id)` where active | One membership |
| `company_memberships` | `(company_id, status)` | Member directory |
| `company_memberships` | `(user_id)` where `status = 'active'` | User’s companies |
| `roles` | `(company_id, code)` unique where active | Role lookup |
| `role_permissions` | unique `(role_id, permission_id)` | M2M |
| `membership_roles` | `(membership_id)`; `(company_id, role_id)` | AuthZ join |
| `company_invites` | `(company_id, status, expires_at)` | Invite inbox |
| `permissions` | unique `(code)` | Global catalog |

---

## 3. Fleet

| Table | Index | Purpose |
|-------|-------|---------|
| `drivers` | `(company_id, status)` | Directory |
| `drivers` | unique `(company_id, employee_number)` where not null & active | HR id |
| `drivers` | `(company_id, operational_status)` | Dispatch availability |
| `drivers` | `(company_id, email)` where not null | Lookup |
| `driver_licenses` | `(company_id, expires_at)` | Compliance board |
| `driver_licenses` | `(company_id, driver_id)` where `is_current` | Current CDL |
| `driver_medical_certificates` | `(company_id, expires_at)` | Medical board |
| `trucks` | unique `(company_id, unit_number)` where active | Asset id |
| `trucks` | `(company_id, status)` | Fleet list |
| `trailers` | unique `(company_id, unit_number)` where active | Asset id |
| `trailers` | `(company_id, status)` | Trailer list |
| `asset_assignments` | `(company_id, driver_id, effective_to)` | Who has what |
| `asset_assignments` | `(company_id, truck_id, effective_to)` | Truck crew |
| `fuel_records` | `(company_id, truck_id, fueled_at)` | IFTA / cost |
| `fuel_records` | `(company_id, fueled_at)` | Period rollups |
| `maintenance_orders` | `(company_id, status, due_at)` | Shop board |
| `maintenance_orders` | `(company_id, truck_id, status)` | Unit history |
| `pm_items` | `(company_id, due_at)` where open | PM due |
| `asset_compliance_records` | `(company_id, expires_at)` | Insurance/reg expiry |
| `driver_safety_events` | `(company_id, driver_id, occurred_at DESC)` | Safety file |
| `driver_time_off` | `(company_id, driver_id, start_at, end_at)` | Conflict checks |

---

## 4. Operations

| Table | Index | Purpose |
|-------|-------|---------|
| `parties` | `(company_id, type, status)` | CRM filters |
| `parties` | `(company_id, name)` | Search/sort |
| `parties` | `(company_id, mc_number)` where not null | Broker lookup |
| `party_contacts` | `(company_id, party_id)` | Contact list |
| `party_locations` | `(company_id, party_id)`; `(company_id, state, city)` | Location pickers |
| `loads` | `(company_id, status, pickup_at)` | **Dispatch board** |
| `loads` | unique `(company_id, reference)` where active | Idempotency |
| `loads` | `(company_id, driver_id, status)` | Driver’s loads |
| `loads` | `(company_id, broker_party_id, pickup_at)` | Broker history |
| `loads` | `(company_id, delivery_at)` | Delivery window |
| `loads` | `(company_id, customer_party_id, status)` | Customer ops |
| `load_stops` | unique `(load_id, sequence)` where active | Ordered stops |
| `load_stops` | `(company_id, load_id)` | Load detail |
| `dispatch_assignments` | `(company_id, load_id, status)` | Assignment state |
| `dispatch_assignments` | `(company_id, driver_id, status)` | Driver board |
| `load_status_history` | `(company_id, load_id, occurred_at)` | History |
| `tracking_positions` | `(company_id, truck_id, recorded_at DESC)` | Live map |
| `tracking_positions` | `(company_id, load_id, recorded_at DESC)` | Load track |

---

## 5. Finance

| Table | Index | Purpose |
|-------|-------|---------|
| `invoices` | unique `(company_id, invoice_number)` where active | Numbering |
| `invoices` | `(company_id, status, due_at)` | **AR aging** |
| `invoices` | `(company_id, load_id)` | Load ↔ invoice |
| `invoices` | `(company_id, bill_to_party_id, status)` | Customer AR |
| `invoice_line_items` | `(company_id, invoice_id, sequence)` | Lines |
| `payments` | `(company_id, received_at)`; `(company_id, status)` | Cash list |
| `payment_allocations` | `(company_id, invoice_id)`; `(company_id, payment_id)` | Apply |
| `settlements` | `(company_id, status, period_end)` | Payroll board |
| `settlements` | `(company_id, driver_id, period_end)` | Driver settle |
| `settlement_lines` | `(company_id, settlement_id)` | Lines |
| `expenses` | `(company_id, status, incurred_at)`; `(company_id, truck_id, incurred_at)` | Cost |
| `company_subscriptions` | `(company_id, status)` | SaaS state |

---

## 6. Documents & AI

| Table | Index | Purpose |
|-------|-------|---------|
| `documents` | `(company_id, document_type, status)` | Library |
| `documents` | `(company_id, uploaded_at DESC)` | Recent |
| `documents` | `(company_id, expires_at)` where not null | Expiring docs |
| `documents` | GIN `(search_vector)` | Full text |
| `document_versions` | unique `(document_id, version_number)` | History |
| `document_ocr_results` | `(company_id, document_id)`; `(company_id, status)` | OCR queue |
| `document_ocr_fields` | `(company_id, ocr_result_id)`; `(company_id, field_key)` | Field filter |
| `document_tags` | unique `(document_id, tag)` where active; `(company_id, tag)` | Tags |
| `document_links` | `(company_id, entity_type, entity_id)` | **Reverse lookup** |
| `document_links` | `(company_id, document_id)` | Forward |
| `ai_recommendations` | `(company_id, approval_state, created_at DESC)` | Approval inbox |
| `ai_recommendations` | `(company_id, entity_type, entity_id, created_at DESC)` | Entity AI |
| `ai_insight_snapshots` | `(company_id, entity_type, entity_id)` | Cache |

---

## 7. Comms & audit

| Table | Index | Purpose |
|-------|-------|---------|
| `notifications` | `(company_id, recipient_user_id, created_at DESC)` | Inbox |
| `notifications` | partial unread `(company_id, recipient_user_id)` where `read_at is null` | Badge |
| `notification_deliveries` | `(company_id, status, next_attempt_at)` | Worker |
| `message_threads` | `(company_id, updated_at DESC)` | Thread list |
| `message_threads` | `(company_id, entity_type, entity_id)` | Subject |
| `messages` | `(company_id, thread_id, created_at)` | Thread body |
| `activity_events` | `(company_id, entity_type, entity_id, occurred_at DESC)` | Timelines |
| `activity_events` | `(company_id, occurred_at DESC)` | Company feed |
| `comments` | `(company_id, entity_type, entity_id, created_at)` | Comments |
| `attachments` | `(company_id, entity_type, entity_id)` | Files |
| `audit_logs` | `(company_id, created_at DESC)` | Compliance export |
| `audit_logs` | `(company_id, entity_type, entity_id, created_at DESC)` | Entity audit |

---

## 8. Platform

| Table | Index | Purpose |
|-------|-------|---------|
| `company_settings` | unique `(company_id, key)` where active | Settings |
| `user_preferences` | unique `(company_id, user_id, key)` | Prefs |
| `integrations` | unique `(company_id, provider_code, name)` where active | Connectors |
| `integrations` | `(company_id, status)` | Health |
| `integration_sync_runs` | `(company_id, integration_id, started_at DESC)` | History |
| `integration_outbox` | partial `(status, next_attempt_at)` where `status = 'pending'` | **Workers** |
| `migration_jobs` | `(company_id, status, created_at DESC)` | Migration Center |
| `import_batches` | `(company_id, job_id, status)` | Import |
| `import_rows` | `(company_id, batch_id, row_number)` | Remediation |
| `export_jobs` | `(company_id, status, created_at DESC)` | Exports |
| `reports` / `report_runs` | `(company_id, …)` per catalog | Reporting |

---

## 9. Covering / INCLUDE (optional later)

At T2+, for hot boards only, consider `INCLUDE (reference, rate, driver_id)` on `loads (company_id, status, pickup_at)` after measuring heap fetches. Do not add covering indexes on day one for every table.

---

## 10. SQL stub

Additive index DDL draft: [sql/02_indexes_additive.sql](./sql/02_indexes_additive.sql) — **NOT APPLIED**.
