# 50 — Documents, OCR & AI Recommendations

**Status:** Documentation only — no tables applied.
Maps from: `lib/types/documents.ts`, `lib/data/carrier-document-store.ts`, `lib/documents/*`, `lib/ai-safety/*`.

Standard columns on tenant tables: `id`, `company_id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `deleted_by`.

---

## Design intent

One **polymorphic document model** for Rate Con, POD, BOL, Invoices, Fuel, Lumper, Insurance, Permits, Registration, Repair, Inspection, Photos, Videos, and future types — with OCR, AI summary, tags, version history, audit, and search.

Do not maintain permanent per-entity document silos as source of truth.

---

## documents

| Aspect | Definition |
|--------|------------|
| **Purpose** | First-class document metadata record |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` → `companies`; `current_version_id` soft ref to `document_versions` (avoid circular FK: update version first, then set current) |
| **Relationships** | versions, OCR, tags, links; activity/audit/AI via `entity_type='document'` |
| **Indexes** | `(company_id, document_type, status)`; `(company_id, uploaded_at DESC)`; GIN on `tags` if array; GIN `search_vector`; `(company_id, expires_at)` |
| **Constraints** | `status` in (`pending_review`,`linked`,`missing`,`expiring`,`archived`,`deleted`); `document_type` from controlled list |
| **Validation** | mime/size limits in app; encrypted flag must match storage policy |
| **Soft delete / audit / tenancy** | full standard (`status=deleted` may pair with `deleted_at`) |

**Key columns:**

| Column | Notes |
|--------|-------|
| `document_type` | `rate_confirmation`, `pod`, `bol`, `invoice`, `fuel_receipt`, `lumper_receipt`, `insurance`, `permit`, `registration`, `repair`, `inspection`, `photo`, `video`, `contract`, `payroll`, `tax`, `scale_ticket`, `miscellaneous`, … |
| `category` | Optional grouping aligned with current `DOCUMENT_CATEGORIES` |
| `title`, `filename`, `mime_type`, `size_bytes` | Display + current file meta (mirrored from current version) |
| `status` | Workflow |
| `ai_summary` | Alph summary text — not an approval |
| `ocr_status` | `none`,`pending`,`completed`,`failed`,`needs_review` |
| `expires_at` | Compliance docs |
| `storage_provider` | `s3`,`gcs`,`azure`,`supabase`, … |
| `is_encrypted` | boolean |
| `search_vector` | tsvector |
| `metadata` | jsonb extensible |

**Illustrative type check (not applied):**

```sql
-- NOT APPLIED — documentation only
document_type text NOT NULL
-- CHECK (document_type IN (...)) or lookup table document_types
```

---

## document_versions

| Aspect | Definition |
|--------|------------|
| **Purpose** | Immutable version history of file bytes (object storage) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `document_id` → `documents` |
| **Relationships** | N versions per document; OCR may bind to a version |
| **Indexes** | unique `(document_id, version_number)`; `(company_id, document_id)` |
| **Constraints** | `version_number` ≥ 1; `storage_key` not null |
| **Validation** | versions append-only; replace = new version |
| **Soft delete** | rare; prefer document-level soft delete |
| **Audit columns** | `created_at`, `created_by`, `company_id`; `updated_*` usually unused |

**Key columns:** `version_number`, `filename`, `mime_type`, `size_bytes`, `storage_key`, `checksum`, `note`.

---

## document_ocr_results

| Aspect | Definition |
|--------|------------|
| **Purpose** | OCR raw text + structured field extraction for a version |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `document_id`, `document_version_id` |
| **Relationships** | fields in `document_ocr_fields` or jsonb `fields` |
| **Indexes** | `(company_id, document_id)`; `(company_id, status)` |
| **Constraints** | `status` in (`pending`,`completed`,`failed`,`needs_review`) |
| **Validation** | low confidence → `needs_review`; never auto-link critical money fields without human |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `raw_text`, `engine`, `model_id`, `overall_confidence`, `status`, `completed_at`, `error_message`.

---

## document_ocr_fields

| Aspect | Definition |
|--------|------------|
| **Purpose** | Normalized extracted fields with per-field confidence |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `ocr_result_id` → `document_ocr_results` |
| **Indexes** | `(company_id, ocr_result_id)`; `(company_id, field_key)` |
| **Constraints** | `confidence` between 0 and 1 |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `field_key`, `label`, `value_text`, `confidence`, `is_verified`, `verified_by`, `verified_at`.

Aligns with `DocumentExtractedField` in current types.

---

## document_tags

| Aspect | Definition |
|--------|------------|
| **Purpose** | Tags for filtering/search |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `document_id` |
| **Indexes** | unique `(document_id, tag)` where active; `(company_id, tag)` |
| **Constraints** | `tag` length limited |
| **Soft delete / audit / tenancy** | full standard |

---

## document_links

| Aspect | Definition |
|--------|------------|
| **Purpose** | Link document to one or more business entities |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `document_id`; polymorphic `entity_type` + `entity_id` |
| **Relationships** | replaces ad-hoc `links: { loadId, driverId, … }` |
| **Indexes** | `(company_id, entity_type, entity_id)`; unique `(document_id, entity_type, entity_id)` where active |
| **Constraints** | `entity_type` in allowed set; `link_role` optional (`primary`,`supporting`) |
| **Soft delete / audit / tenancy** | full standard |

---

## document_types (optional lookup)

| Aspect | Definition |
|--------|------------|
| **Purpose** | Expandable catalog of document types |
| **Primary key** | `code` text |
| **Foreign keys** | none (global) or `company_id` for custom types |
| **Tenancy** | global rows + optional company custom |

---

## ai_recommendations

(See also [02-cross-cutting.md](./02-cross-cutting.md).)

| Aspect | Definition |
|--------|------------|
| **Purpose** | Alph recommendations attached to any business object |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; optional `document_id`; polymorphic entity |
| **Indexes** | `(company_id, approval_state, created_at DESC)`; `(company_id, entity_type, entity_id)` |
| **Constraints** | `confidence` in (`high`,`medium`,`needs_verification`); `approval_state` in (`pending`,`approved`,`rejected`,`superseded`,`expired`) |
| **Validation** | default `pending`; critical kinds never auto-approved |
| **Soft delete / audit / tenancy** | full standard; decisions immutable once approved/rejected (new row to supersede) |

**Key columns:** `recommendation_type`, `summary`, `payload`, `confidence`, `confidence_score`, `approval_state`, `approved_by`, `approved_at`, `rejection_reason`, `model_id`, `prompt_version`, `action_kind` (aligns with `AiActionKind`).

---

## ai_insight_snapshots (optional)

| Aspect | Definition |
|--------|------------|
| **Purpose** | Cached Alph summaries on entities (`novaSummary` today) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; polymorphic entity |
| **Indexes** | unique `(company_id, entity_type, entity_id, insight_kind)` where current |
| **Constraints** | clearly marked non-authoritative |
| **Soft delete / audit / tenancy** | full standard |

Insights are **not** approvals.

---

## Search fields strategy

| Layer | Approach |
|-------|----------|
| OLTP filters | `document_type`, `status`, `expires_at`, linked entity indexes |
| Full text | `search_vector` on title, filename, OCR text, tags |
| Future T3+ | External search (OpenSearch/Typesense) fed from outbox — Postgres remains source of truth for metadata |

→ [60-comms-audit.md](./60-comms-audit.md)
