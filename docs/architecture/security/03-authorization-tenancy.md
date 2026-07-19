# 03 — Authorization & Tenancy

**Parent:** [00-README.md](./00-README.md)
**Canonical design:** [`../iam/03-multi-tenancy.md`](../iam/03-multi-tenancy.md) · [`../iam/05-permissions.md`](../iam/05-permissions.md) · [`../api/05-authorization.md`](../api/05-authorization.md)

---

## Current RBAC

| Piece | Path | Notes |
|-------|------|-------|
| Permission catalog | `lib/permissions/permissions-catalog.ts` | page / button / document permissions |
| Role matrices | `lib/permissions/store.ts` | In-memory; customizable in Settings UI |
| Check API | `lib/permissions/check.ts` → `can()`, `canCurrentUser()` | Used by UI + API helpers |
| Document ACL overlay | `lib/documents/document-permissions.ts` | Role → document actions |
| Portal ACL | `lib/portal/permissions.ts` | Portal-scoped capability strings |
| API helper | `lib/api/auth-context.ts` | Rejects mismatched claimed `company_id` |

---

## Tenancy model (today vs target)

| Concern | Today | Target |
|---------|-------|--------|
| Company scope | Active company from `lib/data/tenant` | Membership-verified `company_id` |
| Cross-tenant | Soft filter on seed rows | RLS + service-layer assert |
| Platform admin | `super_admin` role in catalog | Break-glass + audit (IAM) |
| Drivers | Same tenant seed data | ABAC on assignment later |

Database RLS design: [`../database/81-security-rls.md`](../database/81-security-rls.md) (**not applied**).

---

## Hard rules (runtime + design)

1. **Never trust client `company_id`** as source of truth — `resolveApiAuthContext` already enforces equality with session company.
2. **UI disable ≠ AuthZ** — every mutation must re-check `can()` / `requireApiPermission`.
3. **Alph uses the same permissions** — see [07-alph-security.md](./07-alph-security.md).
4. **Feature flags must not bypass AuthZ** or AI critical confirmation ([`../15-security-compliance.md`](../15-security-compliance.md)).

---

## Gaps (honest)

- Many Server Actions still lack an explicit `can()` call at the top.
- In-memory stores cannot prove isolation under concurrent multi-tenant load.
- Read-only / driver / broker roles are modeled but rarely exercised because session is Owner.

---

## This pass

- Alph intent → permission map in `lib/alph/security.ts`.
- API auth context pattern documented and retained.
- No removal of roles, permissions, or Settings surfaces.
