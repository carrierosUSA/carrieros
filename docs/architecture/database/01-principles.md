# 01 — Design Principles

**Status:** Documentation only — no tables applied.
**Authority:** Master Constitution → Trust & Safety → Foundation → Engineering Constitution.

---

## 1. Permanent foundation, not a rush

This schema is intended to last. Prefer a correct, expandable model over shipping tables that force rewrite. **SQL migrations are not generated until design approval.**

Tradeoff order (Foundation): safer → trustworthy → simpler → maintainable → reliable → performant → faster only if the above remain intact.

---

## 2. Normalization & single source of truth

| Rule | Practice |
|------|----------|
| No duplicate business facts | Driver name lives on `drivers`; finance views join, not copy (denormalized display caches optional and rebuildable) |
| One entity, one home table | Loads in `loads`; not duplicated in dispatch JSON as source of truth |
| Lookup over magic strings | Statuses may be constrained `text` + CHECK or small lookup tables; document allowed values in catalog |
| Prefer columns over opaque JSON | JSONB allowed for extensible metadata (`metadata jsonb`) — never for money, FKs, or approval state |
| Expandable without rewrite | New document types = enum/lookup row, not new tables |

**Avoid:** parallel “shadow” tables that re-store the same invoice amount, load rate, or approval flag.

---

## 3. Ownership directions (no circular FK mess)

Declare a clear **owner → dependent** direction. If A and B both need each other, pick a primary owner and use a nullable FK or join table.

| Owner | Dependents |
|-------|------------|
| `companies` | Nearly all business tables via `company_id` |
| `loads` | `load_stops`, `dispatch_assignments` |
| `drivers` / `trucks` / `trailers` | Sub-records (licenses, fuel, maintenance) |
| `documents` | versions, OCR, tags; **links** to entities via `document_links` (not reverse FK forests) |
| `invoices` | line items, payment applications |

**Circular patterns to avoid:**

- `loads.invoice_id` **and** `invoices.load_id` both required — prefer `invoices.load_id` as owner; load may have a nullable `current_invoice_id` cache without FK cycle, or derive via query.
- Mutual required FKs between driver ↔ truck — use `asset_assignments` with effective dates.

---

## 4. Standard columns on business tables

Unless noted as platform/global:

| Column | Type (conceptual) | Notes |
|--------|-------------------|-------|
| `id` | `uuid` PK | Stable public ID for APIs |
| `company_id` | `uuid` FK → `companies` | Tenant isolation |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Maintained by trigger or app |
| `created_by` | `uuid` FK → `users` nullable | System jobs may be null |
| `updated_by` | `uuid` FK → `users` nullable | |
| `deleted_at` | `timestamptz` nullable | Soft delete |
| `deleted_by` | `uuid` nullable | Optional but recommended |

**Hard deletes** only for ephemeral/cache rows (e.g. expired outbox after archive) or GDPR erasure workflows with audit trail.

---

## 5. Soft delete strategy

1. Set `deleted_at` (and `deleted_by`); exclude from default queries.
2. Unique constraints that must survive soft delete use partial unique indexes: `WHERE deleted_at IS NULL`.
3. Cascading soft-delete is **application-orchestrated**, not DB CASCADE delete of children, to preserve audit.
4. Restore clears `deleted_at` / `deleted_by` and writes an audit event.

---

## 6. Identifiers & naming

| Convention | Example |
|------------|---------|
| Tables | `snake_case` plural: `load_stops` |
| Columns | `snake_case` |
| PK | `id` |
| FK | `<table_singular>_id` → `company_id`, `load_id` |
| Enums | constrained text or Postgres enum; prefer text + CHECK for easier evolution |
| Booleans | `is_` / `has_` prefix when clarity needs it |
| Timestamps | `*_at` |
| Money | `numeric(14,2)` (or integer cents — pick one platform-wide; prefer `numeric` with currency code) |
| Currencies | ISO `currency_code` default `USD` |

**IDs:** UUID v7 preferred (time-sortable) when available; UUID v4 acceptable. Never expose sequential integers as public API IDs for tenant data.

---

## 7. Multi-tenant & RLS

- Application always scopes by `company_id`.
- Supabase RLS policies enforce the same boundary (see [81-security-rls.md](./81-security-rls.md)).
- Indexes almost always lead with `company_id` for tenant queries.

---

## 8. Audit & AI honesty

- Structural changes to money, assignments, compliance, and documents emit `audit_logs`.
- AI outputs go to `ai_recommendations` (or OCR tables) with **confidence** and **approval_state**.
- Approval columns never default to `approved` by the AI path.
- Uncertainty is stored, not hidden (Constitution: never guess/fabricate).

---

## 9. Indexes & constraints

- Index FKs used in joins and list filters.
- Composite indexes match real query patterns: `(company_id, status, pickup_date)`.
- Prefer DB constraints (FK, CHECK, UNIQUE partial) over app-only validation for integrity.
- Full validation rules (email format, phone) may stay in app; DB enforces invariants that prevent corruption.

---

## 10. What not to overengineer

| Avoid until measured | Prefer instead |
|----------------------|----------------|
| Sharding | Single Postgres + partitioning at T3/T4 |
| Event sourcing for everything | Audit log + outbox for integration events |
| Separate DB per domain | One database, clear schemas/namespaces optional |
| Microservice DBs | Modular monolith schema |
| Wide denormalized “board” tables as source of truth | Views or materialized views later |

---

## Next

→ [02-cross-cutting.md](./02-cross-cutting.md)
