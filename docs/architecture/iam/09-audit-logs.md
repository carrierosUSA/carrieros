# 09 — Audit Logs (IAM)

**Status:** Documentation only — not yet implemented
**Parent:** [00-README.md](./00-README.md)
**Database:** [`../database/60-comms-audit.md`](../database/60-comms-audit.md) · [`../database/02-cross-cutting.md`](../database/02-cross-cutting.md)

---

## Purpose

Provide an accountable trail for authentication, authorization changes, and sensitive access — aligned with Engineering Constitution (auditability) and Master Constitution (humans remain responsible).

IAM events may live in:

1. **`auth_events`** — high-volume auth lifecycle (login, logout, MFA, lockout).
2. **`audit_logs`** — privileged / configuration / sensitive data access (shared platform audit).

Do not invent a third parallel AI gate log; AI recommendations already have their own approval state.

---

## Events to record

| Category | Examples |
|----------|----------|
| AuthN | `login.success`, `login.failure`, `logout`, `session.revoked`, `mfa.challenged`, `mfa.success`, `mfa.failed` |
| Credentials | `password.changed`, `password.reset_requested`, `email.verified`, `identity.linked`, `identity.unlinked` |
| Membership | `invite.created`, `invite.accepted`, `invite.revoked`, `membership.suspended`, `membership.reactivated`, `membership.removed` |
| Roles / permissions | `role.assigned`, `role.unassigned`, `role.created`, `role.updated`, `role.deleted`, `role.permissions_changed` |
| Ownership | `ownership.transferred` |
| Settings | `settings.updated` (security-relevant), `sso.config_changed` (later) |
| Sensitive access | `documents.ssn_secured.view`, `payroll.approve`, `billing.manage`, `migration.commit`, `users.impersonate.start/end` |
| Account | `user.created`, `user.disabled` |

---

## Schema cross-reference (summary)

Full column designs: database docs. IAM minimum fields:

| Field | Purpose |
|-------|---------|
| `id` | UUID |
| `company_id` | Tenant (null only for pure platform/auth-global where justified) |
| `actor_user_id` | Who |
| `actor_membership_id` | Optional |
| `event_type` | Stable string |
| `resource_type` / `resource_id` | Optional target |
| `ip` / `user_agent` | Request metadata (privacy-aware) |
| `payload` | JSON details (no secrets) |
| `occurred_at` | Timestamp |
| `correlation_id` | Request id |

Indexes: `(company_id, occurred_at DESC)`, `(actor_user_id, occurred_at DESC)`, `(event_type, occurred_at DESC)`.

Today’s demo `AuditEntry` in `lib/permissions/types.ts` evolves into these tables — not an in-memory array.

---

## Retention

| Class | Retention guidance |
|-------|--------------------|
| Auth failures / successes | ≥ 1 year (or legal minimum) |
| Role / ownership / billing | ≥ 7 years or customer contract |
| Sensitive document access | ≥ 1–7 years by policy |
| Operational noise | Aggregate / archive after 90 days if needed |

Archival to cold storage is acceptable; **integrity** matters (append-only or tamper-evident at T3+).

---

## Access to audit logs

| Who | Access |
|-----|--------|
| Owner / Administrator | Company audit views (`settings` / security) |
| Platform admin | Break-glass + platform plane |
| Read Only | Not by default |
| AI | May summarize with permission; cannot erase |

Deleting audit rows via product UI is **forbidden**; legal hold / export only through controlled process.

---

## Related

- [08-security-controls.md](./08-security-controls.md) · [12-data-model.md](./12-data-model.md) · [05-permissions.md](./05-permissions.md)
