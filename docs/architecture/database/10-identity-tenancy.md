# 10 — Identity & Tenancy

**Tables:** companies, users, company_memberships, permissions, roles, role_permissions, membership_roles, company_invites
**Status:** Documentation only — no tables applied.
**IAM design (AuthN/AuthZ, sessions, roadmap):** [`../../iam/00-README.md`](../../iam/00-README.md) · data model extension [`../../iam/12-data-model.md`](../../iam/12-data-model.md)

**IAM product design (AuthN/AuthZ, sessions, roadmap):** [`../iam/00-README.md`](../iam/00-README.md) · data-model extension (identities, sessions, devices, auth_events): [`../iam/12-data-model.md`](../iam/12-data-model.md).

All business tables below include the standard column set unless noted:
`id`, `company_id` (where applicable), `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `deleted_by`.

---

## companies

| Aspect | Definition |
|--------|------------|
| **Purpose** | Tenant root — the carrier organization using Transpo.ai |
| **Primary key** | `id` uuid |
| **Foreign keys** | none (root) |
| **Relationships** | 1 → many memberships, drivers, trucks, loads, documents, … |
| **Indexes** | unique `(dot_number)` where not null & active; unique `(mc_number)` where not null & active; `(status)` |
| **Constraints** | `name` not null; `status` in (`active`,`suspended`,`churned`,`trial`) |
| **Validation** | DOT/MC format validated in app; timezone IANA |
| **Soft delete** | `deleted_at`; retain for legal/billing history |
| **Audit columns** | `created_by`, `updated_by`, `created_at`, `updated_at` |
| **Tenancy** | This table **is** the tenant; no `company_id` on itself |

**Key columns:** `name`, `legal_name`, `dot_number`, `mc_number`, `scac`, `home_base`, `timezone`, `status`, `logo_url`, `settings_version`.

Maps from: `lib/types/base.ts` `Company` + `lib/data/tenant.ts`.

---

## users

| Aspect | Definition |
|--------|------------|
| **Purpose** | Person identity (auth subject); may belong to multiple companies |
| **Primary key** | `id` uuid |
| **Foreign keys** | optional `auth_user_id` → Supabase Auth (`auth.users`) — logical, not always FK across schemas |
| **Relationships** | many ↔ companies via `company_memberships` |
| **Indexes** | unique `email` where `deleted_at is null`; `(auth_user_id)` |
| **Constraints** | `email` not null; `status` in (`active`,`disabled`) |
| **Validation** | email normalized lowercase |
| **Soft delete** | yes — anonymize PII on hard erase workflow separately |
| **Audit columns** | standard (no `company_id`) |
| **Tenancy** | Global person record; access via memberships |

**Key columns:** `email`, `full_name`, `phone`, `avatar_url`, `status`, `last_login_at`, `mfa_enabled`.

---

## company_memberships

| Aspect | Definition |
|--------|------------|
| **Purpose** | User’s membership in a company (tenant binding) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` → `companies`; `user_id` → `users` |
| **Relationships** | 1 membership → many `membership_roles` |
| **Indexes** | unique `(company_id, user_id)` where `deleted_at is null`; `(user_id)` |
| **Constraints** | `status` in (`invited`,`active`,`suspended`) |
| **Validation** | at least one active owner membership per company (app invariant) |
| **Soft delete** | yes — ends access |
| **Audit columns** | standard + `company_id` |
| **Tenancy** | `company_id` required |

**Key columns:** `title`, `is_primary_contact`, `driver_id` (nullable — if membership is a driver portal user linked to `drivers`).

---

## permissions

| Aspect | Definition |
|--------|------------|
| **Purpose** | Global permission catalog (stable IDs) |
| **Primary key** | `id` text (e.g. `page.loads.view`) **or** uuid with unique `code` |
| **Foreign keys** | none |
| **Relationships** | many ↔ roles via `role_permissions` |
| **Indexes** | unique `code`; `(resource, action)` |
| **Constraints** | `resource_type` in (`page`,`button`,`document`,`api`) |
| **Validation** | codes match product permission registry |
| **Soft delete** | prefer `is_active` flag; soft delete rare |
| **Audit columns** | `created_at`, `updated_at` (platform-maintained; `created_by` optional) |
| **Tenancy** | **No** `company_id` — global |

Aligns with `lib/permissions/types.ts`.

---

## roles

| Aspect | Definition |
|--------|------------|
| **Purpose** | Named role; built-in templates or company-custom |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` → `companies` **nullable** (null = built-in system role template) |
| **Relationships** | → `role_permissions`; ← `membership_roles` |
| **Indexes** | unique `(company_id, name)` where custom; unique `(code)` for built-ins where `company_id is null` |
| **Constraints** | `built_in` boolean; custom roles require `company_id` |
| **Validation** | cannot delete built-in rows; company may override via assignment sets |
| **Soft delete** | yes for custom roles |
| **Audit columns** | standard; `company_id` null for system |
| **Tenancy** | custom roles scoped |

**Built-in codes (seed):** `owner`, `dispatcher`, `accounting`, `safety`, `maintenance`, `driver`, `read_only`, … (mirror current `BuiltInRoleId`).

---

## role_permissions

| Aspect | Definition |
|--------|------------|
| **Purpose** | Role ↔ permission grant |
| **Primary key** | `id` uuid **or** composite `(role_id, permission_id)` |
| **Foreign keys** | `role_id` → `roles`; `permission_id` → `permissions` |
| **Relationships** | M:N |
| **Indexes** | unique `(role_id, permission_id)`; `(permission_id)` |
| **Constraints** | none beyond FKs |
| **Validation** | — |
| **Soft delete** | hard delete of join rows OK; or soft if audit requires |
| **Audit columns** | `created_at`, `created_by`; `company_id` denormalized optional for RLS simplicity |
| **Tenancy** | inherit via role’s `company_id` |

---

## membership_roles

| Aspect | Definition |
|--------|------------|
| **Purpose** | Assign roles to a company membership |
| **Primary key** | `id` uuid |
| **Foreign keys** | `membership_id` → `company_memberships`; `role_id` → `roles` |
| **Relationships** | M:N membership ↔ role |
| **Indexes** | unique `(membership_id, role_id)` where active; `(role_id)` |
| **Constraints** | role’s `company_id` must be null (built-in) or equal membership’s company |
| **Validation** | enforced in app + optional trigger |
| **Soft delete** | yes |
| **Audit columns** | standard + `company_id` |
| **Tenancy** | `company_id` required |

---

## company_invites

| Aspect | Definition |
|--------|------------|
| **Purpose** | Pending email invites into a company |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` → `companies`; `invited_by` → `users` |
| **Relationships** | becomes `company_memberships` on accept |
| **Indexes** | `(company_id, email)` where pending; `(token_hash)` unique |
| **Constraints** | `status` in (`pending`,`accepted`,`revoked`,`expired`) |
| **Validation** | expiry `expires_at` |
| **Soft delete** | yes |
| **Audit columns** | standard + `company_id` |
| **Tenancy** | `company_id` required |

---

## Ownership notes

- `users` do not hang off `companies` with a required FK — memberships break the circle.
- Prefer assigning driver portal access via `company_memberships.driver_id` rather than embedding auth on `drivers`.

→ [20-fleet.md](./20-fleet.md)
