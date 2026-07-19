# 81 — Security & Row Level Security (RLS)

**Status:** Documentation only — policies not applied.
**Authority:** Master Constitution, Trust & Safety Charter, Engineering Constitution (security, least privilege, auditability).

---

## 1. Threat model (tenant data)

| Threat | Mitigation |
|--------|------------|
| Cross-tenant read/write | `company_id` + RLS on all business tables |
| Privilege escalation | RBAC permissions; approve actions explicit |
| AI overreach | Recommendations pending by default; no auto-approve critical |
| Secret leakage | Integration secrets in vault; never in `config` jsonb |
| PII exfiltration | Least privilege, audit exports, field-level care |
| Broken client filters | Server/RLS enforce; clients never sole gate |

---

## 2. RLS strategy (Supabase)

**Enable RLS** on every tenant table before exposing the table to `authenticated` or `anon` roles.

### Session context

| Claim / setting | Meaning |
|-----------------|---------|
| `auth.uid()` | Supabase user → `users.auth_user_id` |
| `company_id` claim or `set_config('app.company_id', …)` | Active tenant |

Membership check: user must have an **active** `company_memberships` row for that `company_id`.

### Conceptual policy (not applied)

```sql
-- NOT APPLIED — documentation only
-- Example pattern for tenant tables
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;

CREATE POLICY loads_tenant_isolation ON loads
  FOR ALL
  TO authenticated
  USING (
    company_id = (SELECT auth_company_id())
    AND deleted_at IS NULL  -- optional; or allow soft-deleted for roles that can restore
  )
  WITH CHECK (
    company_id = (SELECT auth_company_id())
  );
```

**Service role:** used only by trusted server workers (OCR, migration, webhooks) — bypasses RLS; must still set `company_id` correctly in application code.

---

## 3. Least privilege

| Surface | DB access pattern |
|---------|-------------------|
| Browser / Driver App | Authenticated role + RLS; narrow columns via views/RPCs when needed |
| Next.js server actions | User-scoped client or service role with explicit company checks |
| Background workers | Service role; job payload includes `company_id` |
| Platform admin | Separate break-glass role; audited; not normal customer path |

RBAC (`permissions` / `roles`) gates **which actions** UI/API allow; RLS gates **which rows** exist in the result set. Both are required.

---

## 4. PII inventory (high level)

| Data | Tables (examples) | Notes |
|------|-------------------|-------|
| Identity | `users`, memberships | Email, phone |
| Driver compliance | `driver_licenses`, medical | Highly sensitive — minimize access; consider column encryption/token vault for license numbers / SSN if stored |
| Location | `tracking_positions`, driver location | Retention limits |
| Financial | invoices, settlements, banking refs | Audit all exports |
| Documents | storage objects + OCR text | Bucket policies + signed URLs |

**Rules:**

- Do not store full SSN unless legally required; prefer last-4 + external vault.
- Audit log `before_state`/`after_state` should **redact** secrets and raw SSN.
- Exports (`export_jobs`) are permissioned and audited.

---

## 5. Encryption assumptions

| Layer | Assumption |
|-------|------------|
| At rest | Supabase/Postgres disk encryption + object storage SSE |
| In transit | TLS only |
| Application-level | Optional for ultra-sensitive columns (`is_encrypted` docs already modeled) |
| Backups | Encrypted; retention per policy |

This doc does not prescribe a KMS vendor — choose at implementation time; keep `secret_ref` indirection in `integrations`.

---

## 6. Soft delete & security

- Soft-deleted rows remain under RLS (same `company_id`).
- Restore is a privileged action → `audit_logs`.
- Hard erase (GDPR-style) is a controlled workflow: rewrite/anonymize + audit, not casual `DELETE`.

---

## 7. AI data security

- OCR text and recommendations are tenant-scoped (`company_id`).
- Model prompts must not include another tenant’s data.
- Approval state changes only by authorized human users; workers never set `approved` for critical `action_kind`s.

---

## 8. Policy testing checklist (when implementing)

- [ ] User A cannot `SELECT`/`UPDATE` company B rows
- [ ] Soft-deleted visibility matches product rules
- [ ] Driver role cannot read unrelated drivers’ PII
- [ ] Service role paths unit-tested for company injection
- [ ] Export and migration apply paths audited
- [ ] Illustrative policies reviewed for initplan performance

→ [90-migration-from-current.md](./90-migration-from-current.md)
