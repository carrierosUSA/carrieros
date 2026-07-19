# 60 — Communications, Activity, Comments & Audit

**Status:** Documentation only — no tables applied.
Maps from: `lib/types/notifications.ts`, `lib/communications/*`, permissions audit types, embedded timelines.

Standard columns on tenant tables unless noted.

---

## notifications

| Aspect | Definition |
|--------|------------|
| **Purpose** | In-app notification to a user within a company |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `recipient_user_id` → `users`; polymorphic `entity_type`/`entity_id` optional |
| **Indexes** | `(company_id, recipient_user_id, created_at DESC)`; `(company_id, recipient_user_id)` where `read_at is null` |
| **Constraints** | `channel` in (`in_app`,`email`,`sms`,`push`) for multi-channel rows or separate deliveries table |
| **Validation** | — |
| **Soft delete** | yes (user dismiss) |
| **Audit / tenancy** | full standard |

**Key columns:** `title`, `body`, `severity`, `read_at`, `clicked_at`, `action_url`.

---

## notification_deliveries (optional)

| Aspect | Definition |
|--------|------------|
| **Purpose** | Per-channel delivery attempts |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `notification_id` |
| **Indexes** | `(company_id, status, next_attempt_at)` |
| **Constraints** | `status` in (`pending`,`sent`,`failed`,`skipped`) |
| **Soft delete / audit / tenancy** | standard; high volume → partition |

---

## message_threads

| Aspect | Definition |
|--------|------------|
| **Purpose** | Conversation thread (driver↔dispatch, broker, internal) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; optional polymorphic subject (`load`, `driver`, …) |
| **Indexes** | `(company_id, updated_at DESC)`; `(company_id, entity_type, entity_id)` |
| **Constraints** | `thread_type` in (`internal`,`driver`,`broker`,`support`) |
| **Soft delete / audit / tenancy** | full standard |

---

## messages

| Aspect | Definition |
|--------|------------|
| **Purpose** | Message within a thread |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `thread_id` → `message_threads`; `sender_user_id` → `users` nullable (system) |
| **Indexes** | `(company_id, thread_id, created_at)` |
| **Constraints** | `body` not empty unless attachment-only |
| **Soft delete** | yes |
| **Audit / tenancy** | full standard |

**Attachments:** `attachments` rows with `entity_type='message'`.

---

## activity_events

| Aspect | Definition |
|--------|------------|
| **Purpose** | Unified activity timeline for any business object |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `actor_user_id` → `users` nullable |
| **Relationships** | polymorphic `entity_type` + `entity_id` |
| **Indexes** | `(company_id, entity_type, entity_id, occurred_at DESC)`; `(company_id, occurred_at DESC)` |
| **Constraints** | `event_type`, `label` required |
| **Soft delete** | yes |
| **Audit columns** | prefer `occurred_at` + `created_at`; `updated_*` optional |
| **Tenancy** | `company_id` required |

**Key columns:** `event_type`, `label`, `detail`, `payload`, `actor_display`, `occurred_at`.

**Scale:** Partition by month/quarter at T3+ ([80-performance-scale.md](./80-performance-scale.md)).

Replaces embedded `timeline[]` on Load, Driver, Truck, Document, DirectoryCompany.

---

## comments

| Aspect | Definition |
|--------|------------|
| **Purpose** | User comments on any business object |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `parent_comment_id` → `comments` nullable; `author` via `created_by` |
| **Indexes** | `(company_id, entity_type, entity_id, created_at)` |
| **Constraints** | `body` not empty |
| **Soft delete / audit / tenancy** | full standard |

---

## attachments

| Aspect | Definition |
|--------|------------|
| **Purpose** | Lightweight files on comments/messages/tasks (not full document lifecycle) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; polymorphic target; optional `promoted_document_id` → `documents` |
| **Indexes** | `(company_id, entity_type, entity_id)` |
| **Constraints** | `storage_key` not null |
| **Soft delete / audit / tenancy** | full standard |

---

## audit_logs

| Aspect | Definition |
|--------|------------|
| **Purpose** | Security/compliance audit trail — insert-oriented |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` nullable for platform actions; `actor_user_id` |
| **Indexes** | `(company_id, created_at DESC)`; `(company_id, entity_type, entity_id)`; `(actor_user_id, created_at)` |
| **Constraints** | `action` required |
| **Validation** | no updates to row content in normal operation |
| **Soft delete** | legal redaction only |
| **Audit columns** | `created_at`, `created_by` (= actor); typically no `updated_at` mutations |
| **Tenancy** | `company_id` when tenant-scoped |

**Key columns:** `action`, `entity_type`, `entity_id`, `resource`, `before_state`, `after_state`, `ip`, `user_agent`, `correlation_id`, `actor_role`.

Aligns with `AuditEntry` in `lib/permissions/types.ts` and document audit actions.

---

## Relationship to document-specific audit

Document UX may still show a filtered audit/activity stream. Prefer writing to **central** `audit_logs` / `activity_events` rather than a second permanent `document_audit` table. A view can project document-only rows.

→ [70-platform.md](./70-platform.md)
