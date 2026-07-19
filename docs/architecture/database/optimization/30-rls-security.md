# 30 — RLS & Security Optimization

**Status:** Documentation only — policies not applied.
**Extends:** [81-security-rls.md](../81-security-rls.md)
**Governance:** Master Constitution · Trust & Safety · Engineering Constitution (least privilege, auditability)

---

## 1. Goals

1. Cross-tenant isolation is impossible to bypass from `authenticated` / `anon` clients
2. RLS expressions stay **index-friendly** (equality on `company_id`)
3. RBAC gates **actions**; RLS gates **rows** — both required
4. AI / workers never auto-approve critical outcomes; service role stays server-only

---

## 2. Helper functions (create once in Phase B)

```sql
-- NOT APPLIED — documentation only / future apply

-- Resolve active company from JWT claim or session GUC
CREATE OR REPLACE FUNCTION auth_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    coalesce(
      auth.jwt() ->> 'company_id',
      current_setting('app.company_id', true)
    ),
    ''
  )::uuid;
$$;

-- True if current user has active membership in that company
CREATE OR REPLACE FUNCTION auth_has_company(p_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM company_memberships m
    JOIN users u ON u.id = m.user_id
    WHERE m.company_id = p_company_id
      AND m.status = 'active'
      AND m.deleted_at IS NULL
      AND u.auth_user_id = (SELECT auth.uid())
      AND u.deleted_at IS NULL
  );
$$;
```

**Performance:** Always wrap in `(select auth_company_id())` / `(select auth.uid())` inside policies so Postgres can initplan once per statement.

---

## 3. Policy matrix (tenant tables)

| Policy name pattern | Command | USING | WITH CHECK |
|---------------------|---------|-------|------------|
| `{table}_select` | SELECT | `company_id = (select auth_company_id())` (+ optional soft-delete rule) | — |
| `{table}_insert` | INSERT | — | same company + membership |
| `{table}_update` | UPDATE | same | same; **forbid** `company_id` change |
| `{table}_delete` | DELETE | same (prefer soft-delete via UPDATE) | — |

### Soft-delete visibility

| Role product rule | Policy tweak |
|-------------------|--------------|
| Default office | `deleted_at IS NULL` in USING |
| Restore-capable roles | Separate policy or RPC allowing `deleted_at IS NOT NULL` with permission check |
| Audit export | Service role / security definer RPC; never broaden client SELECT |

### Global catalogs

`permissions`, `integration_providers`, `subscription_plans`: RLS enabled; `SELECT` for `authenticated`; writes service role only.

### `users`

Users see self; company admins see members via membership join policy or RPC — avoid exposing all users platform-wide.

---

## 4. Illustrative tenant policy (NOT APPLIED)

```sql
-- NOT APPLIED — documentation only / future apply
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads FORCE ROW LEVEL SECURITY;

CREATE POLICY loads_select ON loads
  FOR SELECT TO authenticated
  USING (
    company_id = (SELECT auth_company_id())
    AND deleted_at IS NULL
    AND (SELECT auth_has_company(company_id))
  );

CREATE POLICY loads_insert ON loads
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id = (SELECT auth_company_id())
    AND (SELECT auth_has_company(company_id))
  );

CREATE POLICY loads_update ON loads
  FOR UPDATE TO authenticated
  USING (
    company_id = (SELECT auth_company_id())
    AND (SELECT auth_has_company(company_id))
  )
  WITH CHECK (
    company_id = (SELECT auth_company_id())
  );
```

Repeat pattern for every tenant table in catalogs 10–70. Prefer a codegen/migration helper over hand-copying fifty times — still **additive** only.

---

## 5. Security improvements over baseline doc

| Improvement | Why |
|-------------|-----|
| Explicit `FORCE ROW LEVEL SECURITY` | Table owners cannot accidentally bypass |
| `auth_has_company` membership check | JWT claim alone is insufficient if stolen/stale |
| Separate SELECT vs write policies | Least privilege; easier testing |
| Forbid `company_id` mutation in WITH CHECK | Prevents tenant hopping |
| Driver-scoped policies (Phase C+) | Drivers only see assigned loads / own PII via `company_memberships.driver_id` |
| Redaction guidance for `audit_logs` before/after | Secrets / SSN never in clear JSON |
| Service role only on server workers | Browser never holds service key |

---

## 6. Document storage security

| Control | Practice |
|---------|----------|
| Bytes | Object storage (Supabase Storage / S3); DB holds `storage_key` only |
| Access | Signed URLs; short TTL |
| Bucket RLS | Path prefix includes `company_id` |
| Encryption | Provider SSE; `is_encrypted` flag for app-level extras |
| OCR text | Tenant-scoped rows; same RLS as `documents` |

---

## 7. AI security (Constitution)

- `ai_recommendations.approval_state` defaults `pending`
- Workers/service role **must not** set `approved` for critical `action_kind` / `recommendation_type`
- Prompt construction must never mix tenant contexts
- Confidence stored honestly (`needs_verification` when uncertain)

---

## 8. Policy test checklist (when applying)

- [ ] User A cannot read/write company B rows (all tenant tables)
- [ ] Soft-deleted rows hidden by default
- [ ] `company_id` cannot be updated to another tenant
- [ ] Driver role cannot list unrelated drivers’ license numbers
- [ ] Service role paths unit-tested for forced `company_id`
- [ ] `EXPLAIN` on board queries shows index use under RLS
- [ ] Export / migration apply paths emit `audit_logs`

SQL stub: [sql/03_rls_helpers_and_policies.sql](./sql/03_rls_helpers_and_policies.sql) — **NOT APPLIED**.
