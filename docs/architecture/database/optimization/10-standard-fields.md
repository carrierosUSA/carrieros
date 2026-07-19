# 10 — Standard Fields Plan

**Status:** Documentation only — not applied.
**Extends:** [01-principles.md](../01-principles.md) §4 · [02-cross-cutting.md](../02-cross-cutting.md) §11

---

## 1. Canonical set

| Column | Type | Required on tenant business tables? | Notes |
|--------|------|-------------------------------------|-------|
| `id` | `uuid` PK | **Yes** | Prefer UUIDv7 when available |
| `company_id` | `uuid` FK → `companies` | **Yes** (except tenant root / global catalogs) | Isolation key |
| `created_at` | `timestamptz` | **Yes** | Default `now()` |
| `updated_at` | `timestamptz` | **Yes** on mutable tables | Trigger preferred |
| `created_by` | `uuid` → `users` | Recommended | Null for system jobs |
| `updated_by` | `uuid` → `users` | Recommended | |
| `status` | constrained `text` | When entity has lifecycle | CHECK or lookup; never free-form in money paths |
| `archived_at` | `timestamptz` | Optional | Distinct from soft delete: hidden from default UI, retained |
| `deleted_at` | `timestamptz` | **Yes** on business tables | Soft delete |
| `deleted_by` | `uuid` | Recommended | |
| `version` | `integer` or `bigint` | Optimistic concurrency tables | Increment on update; start at 1 |
| `notes` | `text` | Optional | Human notes; not structured facts |
| `metadata` | `jsonb` | Optional | Extensibility only — never money, FKs, approval_state |

---

## 2. When to add which fields

| Field | Add when | Skip when |
|-------|----------|-----------|
| `status` | Entity has operational lifecycle (loads, invoices, drivers, documents, integrations) | Pure join tables (`role_permissions`, `payment_allocations`) — use parent status |
| `archived_at` | Long-lived records users “close” without deleting (parties, documents, reports) | High-churn ephemeral rows (GPS, outbox after publish) |
| `version` | Concurrent edits matter (loads, invoices, settlements, company_settings) | Append-only (`audit_logs`, `load_status_history`, `document_versions`) |
| `notes` | Ops users regularly annotate | Machine-only tables |
| `metadata` | Forward-compatible product fields without migration churn | Core money, compliance dates, approval — use columns |

---

## 3. Table class matrix

| Class | Examples | Standard fields |
|-------|----------|-----------------|
| **Tenant mutable** | `loads`, `drivers`, `trucks`, `parties`, `invoices`, `documents` | Full set + `status`; `version` on high-contention; `metadata`/`notes` optional |
| **Tenant child** | `load_stops`, `invoice_line_items`, `settlement_lines` | `id`, `company_id`, audit timestamps/authors, `deleted_at`; `status` only if independent |
| **Append-only** | `audit_logs`, `activity_events`, `load_status_history` | `id`, `company_id`, `created_at`, `created_by`; no `updated_*` required; soft delete rare |
| **Global catalog** | `permissions`, `integration_providers`, `subscription_plans` | No `company_id`; `is_active` instead of soft delete often enough |
| **Tenant root** | `companies` | No `company_id`; full audit + `status` |
| **Ephemeral / worker** | `integration_outbox`, `tracking_positions`, `import_rows` | `company_id` + timestamps; hard-delete after retention OK with audit of job |

---

## 4. Soft delete vs archive vs status

```text
status          → business lifecycle (draft / active / paid / cancelled)
archived_at     → removed from default lists; still queryable for history
deleted_at      → soft delete; excluded from default queries; restoreable
hard DELETE     → GDPR erasure / ephemeral cleanup only — always audited
```

Partial unique indexes always use `WHERE deleted_at IS NULL` (and often `archived_at IS NULL` if archive must free a unique key).

---

## 5. Illustrative skeleton (NOT APPLIED)

```sql
-- NOT APPLIED — documentation only / future apply after design approval
-- Additive template for a tenant business table

CREATE TABLE example_entity (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  status       text NOT NULL DEFAULT 'active',
  notes        text,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  version      integer NOT NULL DEFAULT 1,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid REFERENCES users(id),
  updated_by   uuid REFERENCES users(id),
  archived_at  timestamptz,
  deleted_at   timestamptz,
  deleted_by   uuid REFERENCES users(id),
  CONSTRAINT example_entity_status_chk
    CHECK (status IN ('active', 'inactive', 'archived'))
);

CREATE INDEX example_entity_company_active_idx
  ON example_entity (company_id, status)
  WHERE deleted_at IS NULL;
```

Align CHECK values with the table catalogs (10–70). Do not invent parallel status vocabularies in app vs DB.

---

## 6. Frontend compatibility

TypeScript models today use camelCase (`tenantId`, `createdAt`). Repositories map:

| DB | App |
|----|-----|
| `company_id` | `tenantId` / `companyId` at boundary |
| `*_at` | ISO strings or Date |
| `metadata` | typed optional bags; unknown keys ignored |
| `version` | send `If-Match` / body version for conflict → 409 |

UI does not need every standard column visible; progressive disclosure for notes/metadata.
