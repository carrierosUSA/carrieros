# 70 — Platform (Settings, Integrations, Migration, Imports, Exports, Reports)

**Status:** Documentation only — no tables applied.
Maps from: `lib/settings/*`, `lib/integrations/*`, `lib/migration/*`, admin/feature flags, workflows.

Supports Master Constitution **Migration Center** product requirements with auditable import/export history — without implementing migration SQL yet.

---

## company_settings

| Aspect | Definition |
|--------|------------|
| **Purpose** | Key/value or typed settings per company |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` → `companies` |
| **Indexes** | unique `(company_id, key)` where active |
| **Constraints** | `key` not null; `value` jsonb |
| **Validation** | schema per key in app (`lib/settings`) |
| **Soft delete / audit / tenancy** | full standard |

**Examples:** automation level, invoice templates, notification prefs, AI policy toggles (never weakening Constitution hard stops).

---

## user_preferences

| Aspect | Definition |
|--------|------------|
| **Purpose** | Per-user UI/notification preferences (scoped by company when relevant) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `user_id` |
| **Indexes** | unique `(company_id, user_id, key)` |
| **Soft delete / audit / tenancy** | full standard |

---

## integrations

| Aspect | Definition |
|--------|------------|
| **Purpose** | Connected integration instances for a company (ELD, accounting, email, …) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `provider_code` → `integration_providers.code` |
| **Indexes** | unique `(company_id, provider_code, name)` where active; `(company_id, status)` |
| **Constraints** | `status` in (`disconnected`,`connecting`,`connected`,`error`,`disabled`) |
| **Validation** | secrets **never** in plaintext columns — use vault/secret refs |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `provider_code`, `status`, `config` jsonb (non-secret), `secret_ref`, `last_sync_at`, `last_error`.

---

## integration_providers

| Aspect | Definition |
|--------|------------|
| **Purpose** | Global catalog of integration types |
| **Primary key** | `code` text |
| **Foreign keys** | none |
| **Tenancy** | **No** `company_id` |
| **Soft delete** | `is_active` flag |

---

## integration_sync_runs

| Aspect | Definition |
|--------|------------|
| **Purpose** | History of sync jobs |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `integration_id` |
| **Indexes** | `(company_id, integration_id, started_at DESC)` |
| **Constraints** | `status` in (`running`,`succeeded`,`failed`,`cancelled`) |
| **Soft delete / audit / tenancy** | standard; retain for support |

---

## integration_outbox

| Aspect | Definition |
|--------|------------|
| **Purpose** | Reliable outbound domain events for webhooks/APIs |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` |
| **Indexes** | `(status, next_attempt_at)` partial where pending; `(company_id, created_at)` |
| **Constraints** | `status` in (`pending`,`published`,`failed`,`dead`) |
| **Soft delete** | archive/hard-delete after retention |
| **Audit columns** | `created_at`, `updated_at`; `created_by` optional |
| **Tenancy** | `company_id` required |

See [02-cross-cutting.md](./02-cross-cutting.md).

---

## migration_connectors

| Aspect | Definition |
|--------|------------|
| **Purpose** | Global registry of Migration Center source connectors |
| **Primary key** | `code` text |
| **Tenancy** | global |
| **Maps from** | `lib/migration/connectors.ts` |

---

## migration_jobs

| Aspect | Definition |
|--------|------------|
| **Purpose** | A company’s migration project/run |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `connector_code` |
| **Indexes** | `(company_id, status, created_at DESC)` |
| **Constraints** | `status` in (`draft`,`mapping`,`validating`,`importing`,`completed`,`failed`,`cancelled`) |
| **Validation** | destructive apply steps require human confirmation (Constitution) |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `name`, `source_label`, `stats` jsonb, `started_at`, `completed_at`, `error_summary`.

---

## migration_history

| Aspect | Definition |
|--------|------------|
| **Purpose** | Append-only milestones / decisions within a migration job |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `migration_job_id` |
| **Indexes** | `(company_id, migration_job_id, occurred_at)` |
| **Soft delete** | immutable preferred |
| **Audit / tenancy** | `created_at`, `created_by`, `company_id` |

---

## import_batches

| Aspect | Definition |
|--------|------------|
| **Purpose** | File/API import batch (drivers, loads, chart of accounts, …) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; optional `migration_job_id` |
| **Indexes** | `(company_id, status, created_at DESC)` |
| **Constraints** | `status` in (`uploaded`,`validating`,`ready`,`importing`,`completed`,`failed`); `entity_type` required |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `filename`, `storage_key`, `row_count`, `success_count`, `error_count`, `schema_version`.

---

## import_rows

| Aspect | Definition |
|--------|------------|
| **Purpose** | Per-row import result for remediation |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `import_batch_id` |
| **Indexes** | `(company_id, import_batch_id, status)`; `(import_batch_id, row_number)` |
| **Constraints** | `status` in (`pending`,`imported`,`skipped`,`error`) |
| **Soft delete** | batch-level retention |
| **Audit / tenancy** | `created_at`, `company_id`; high volume |

**Key columns:** `row_number`, `raw` jsonb, `normalized` jsonb, `error_message`, `target_entity_id`.

---

## export_jobs

| Aspect | Definition |
|--------|------------|
| **Purpose** | Async exports (IFTA, finance, compliance packets) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `requested_by` → `users` |
| **Indexes** | `(company_id, status, created_at DESC)` |
| **Constraints** | `status` in (`queued`,`running`,`completed`,`failed`); `export_type` required |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `params` jsonb, `storage_key`, `completed_at`, `error_message`, `expires_at`.

---

## reports

| Aspect | Definition |
|--------|------------|
| **Purpose** | Saved report definitions (not result warehouses) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `created_by` |
| **Indexes** | `(company_id, report_type)` |
| **Constraints** | `report_type` constrained; `definition` jsonb |
| **Soft delete / audit / tenancy** | full standard |

---

## report_runs

| Aspect | Definition |
|--------|------------|
| **Purpose** | Materialized run of a report (file or snapshot) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `report_id` nullable (ad-hoc) |
| **Indexes** | `(company_id, created_at DESC)` |
| **Constraints** | `status` in (`running`,`completed`,`failed`) |
| **Soft delete / audit / tenancy** | full standard; TTL on artifacts |

---

## feature_flags (optional)

| Aspect | Definition |
|--------|------------|
| **Purpose** | Platform or per-company feature toggles |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` nullable (null = global default) |
| **Indexes** | unique `(company_id, flag_key)` |
| **Soft delete / audit / tenancy** | standard when company-scoped |

---

## schema_migration_meta (application)

When SQL migrations are eventually approved, use standard Supabase/Postgres migration history (`supabase_migrations.schema_migrations` or equivalent). **Do not invent a parallel migration system.** Document product migration (TMS import) in `migration_*` tables above — distinct from DDL migrations.

→ [80-performance-scale.md](./80-performance-scale.md)
