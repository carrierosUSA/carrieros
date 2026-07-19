# 02 — Cross-Cutting Patterns

**Status:** Documentation only — no tables applied.
Illustrative DDL snippets are **NOT APPLIED — documentation only**.

---

## 1. Company isolation

Every customer business table includes:

```sql
-- NOT APPLIED — documentation only
company_id uuid NOT NULL REFERENCES companies(id)
```

**Rules:**

1. Inserts always set `company_id` from the authenticated membership context.
2. Updates/deletes never change `company_id`.
3. Cross-tenant joins are forbidden in app queries.
4. RLS: `company_id = auth_company_id()` (see [81-security-rls.md](./81-security-rls.md)).

**Exception:** Global catalog tables (permission definitions, connector types, plan catalog) have no `company_id`. Tenant usage/config tables that reference them do.

---

## 2. RBAC join model

```text
users ← company_memberships → companies
              ↓
         membership_roles → roles → role_permissions → permissions
```

| Table | Role |
|-------|------|
| `permissions` | Stable ids (`page.loads.view`, `document.rate_con.download`) — global catalog |
| `roles` | Built-in + custom; **custom roles are company-scoped** |
| `role_permissions` | Many-to-many |
| `company_memberships` | User belongs to company |
| `membership_roles` | Roles for that membership |

Aligns with current `lib/permissions` (`PermissionId`, `BuiltInRoleId`) without inventing a parallel gate system.

**Least privilege:** Driver App memberships get narrow permissions; office roles broader; approve actions are explicit permissions.

---

## 3. Polymorphic entity reference

Shared pattern for activity, comments, attachments, audit, AI:

| Column | Meaning |
|--------|---------|
| `entity_type` | Stable string: `load`, `driver`, `truck`, `trailer`, `document`, `invoice`, `party`, … |
| `entity_id` | UUID of that row |

**Why not Postgres table inheritance / hundreds of FKs:** expandable to future entities (marketplace listing, wallet transfer) without schema explosion.

**Integrity:** Application validates `(entity_type, entity_id)` exists within `company_id`. Optional deferred check via triggers later — not required for Phase 1.

**Index:** `(company_id, entity_type, entity_id, created_at DESC)`.

---

## 4. Activity timeline

**Table:** `activity_events`

Purpose: unified “what happened” feed on any business object (replaces embedded `timeline[]` arrays in TypeScript stores).

| Field group | Columns |
|-------------|---------|
| Identity | `id`, `company_id` |
| Target | `entity_type`, `entity_id` |
| Content | `event_type`, `label`, `detail`, `payload jsonb` |
| Actor | `actor_user_id`, `actor_display` (snapshot) |
| Time | `occurred_at`, audit columns, `deleted_at` |

High volume at T3+ → partition by `occurred_at` ([80-performance-scale.md](./80-performance-scale.md)).

---

## 5. Comments

**Table:** `comments`

| Columns | Notes |
|---------|-------|
| `entity_type`, `entity_id` | Target object |
| `body` | Text |
| `parent_comment_id` | Optional threads |
| Soft delete + authors | Standard audit columns |

---

## 6. Attachments vs documents

| Concept | Use |
|---------|-----|
| **Documents** | First-class business records (rate con, POD, insurance) with OCR, versions, search — see [50-documents-ai.md](./50-documents-ai.md) |
| **Attachments** | Lightweight files on comments/messages/tasks without full document lifecycle |

`attachments` uses the same polymorphic target pattern + object storage key. Promote to `documents` when the file becomes operationally significant.

---

## 7. Audit logs

**Table:** `audit_logs`

Immutable insert-only (no update; soft delete only for rare legal redaction with platform process).

| Columns | Notes |
|---------|-------|
| `actor_user_id`, `actor_role` | Who |
| `action` | `create`, `update`, `delete`, `approve`, `export`, … |
| `entity_type`, `entity_id` | What |
| `before_state`, `after_state` | JSONB diffs (PII-aware) |
| `ip`, `user_agent` | Optional |
| `correlation_id` | Request / workflow id |

Distinct from `activity_events`: audit is security/compliance; activity is product timeline UX. They may mirror for important events.

---

## 8. AI recommendations (Constitution-critical)

**Table:** `ai_recommendations`

| Column | Purpose |
|--------|---------|
| `entity_type`, `entity_id` | Subject |
| `recommendation_type` | e.g. `dispatch_suggest`, `invoice_draft`, `payroll_suggest` |
| `summary`, `payload` | What Alph proposes |
| `confidence` | `high` \| `medium` \| `needs_verification` |
| `confidence_score` | Optional 0–1 |
| `approval_state` | `pending` \| `approved` \| `rejected` \| `superseded` \| `expired` |
| `approved_by`, `approved_at` | Human only |
| `rejection_reason` | Optional |
| `model_id`, `prompt_version` | Traceability |
| `automation_level_at_creation` | Snapshot of company setting |

**Invariants:**

- Inserts default `approval_state = pending`.
- Critical action kinds (money, payroll, compliance, safety, legal, employment) **never** auto-flip to `approved`.
- Executing an approved recommendation is a separate audited action; the recommendation row records the decision only.

Aligns with `lib/ai-safety/` automation levels and Master Constitution AI MUST NEVER list.

---

## 9. Unified documents (+ OCR + versions)

```text
documents
  ├── document_versions          (file bytes in object storage)
  ├── document_ocr_results       (raw + structured extract)
  ├── document_tags
  ├── document_links             (polymorphic / typed FKs to load, driver, …)
  └── (activity / audit / AI via entity_type = 'document')
```

Supports: Rate Con, POD, BOL, Invoices, Fuel, Lumper, Insurance, Permits, Registration, Repair, Inspection, Photos, Videos, future types — via `document_type` (+ category), not separate tables.

Search: `search_vector` tsvector and/or external search index later; keep key extracted fields as columns for filters.

Detail: [50-documents-ai.md](./50-documents-ai.md).

---

## 10. Outbox / domain events (future APIs)

**Table:** `integration_outbox` (or `domain_outbox`)

| Columns | Notes |
|---------|-------|
| `company_id` | Tenant |
| `event_type` | e.g. `load.status_changed` |
| `aggregate_type`, `aggregate_id` | Source |
| `payload jsonb` | Contract versioned |
| `status` | `pending` \| `published` \| `failed` |
| `attempts`, `next_attempt_at` | Retry |
| `created_at` | |

**Pattern:** Same transaction as business write → insert outbox row → worker publishes to webhooks/API consumers. Enables Driver App, Marketplace, partner APIs without dual-write chaos.

Do not build a full event bus in Phase 1; the table is the seam.

---

## 11. Illustrative convention snippet

```sql
-- NOT APPLIED — documentation only
-- Standard business table skeleton
CREATE TABLE example_business (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  -- domain columns ...
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES users(id),
  updated_by    uuid REFERENCES users(id),
  deleted_at    timestamptz,
  deleted_by    uuid REFERENCES users(id)
);

CREATE INDEX example_business_company_id_idx
  ON example_business (company_id)
  WHERE deleted_at IS NULL;
```

---

## Next

→ Table catalog: [10-identity-tenancy.md](./10-identity-tenancy.md)
