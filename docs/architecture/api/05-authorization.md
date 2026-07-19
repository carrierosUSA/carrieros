# 05 — Authorization (API)

**Status:** Target design aligned with IAM
**Canonical IAM:** [`../iam/00-README.md`](../iam/00-README.md) · [`../iam/10-api-security.md`](../iam/10-api-security.md)
**Canonical tenancy:** [`../iam/03-multi-tenancy.md`](../iam/03-multi-tenancy.md) · RLS [`../database/81-security-rls.md`](../database/81-security-rls.md)

---

## Hard rules

1. **Never trust the client** for permissions, role, or `company_id`.
2. **Never expose service-role credentials** to the browser or mobile app.
3. Every Route Handler / Server Action / worker **re-validates** AuthN + membership + permission (+ resource rules).
4. Alph and automations inherit the **acting user’s** permissions — no elevation ([12-alph.md](./12-alph.md)).
5. UI hiding is convenience only.

---

## Layers

| Layer | Enforcement |
|-------|-------------|
| **AuthN** | Supabase Auth session/JWT (target); today demo `getCurrentSession()` |
| **Membership** | Active `company_membership` for session company |
| **RBAC** | Permission codes via roles (`lib/permissions` → IAM `resource:action`) |
| **ABAC (later)** | Resource assignment (driver sees own loads) |
| **RLS** | Postgres policies: `company_id = auth_company_id()` |
| **Audit** | Sensitive mutations append audit events |

---

## Request context (target)

```ts
type ApiAuthContext = {
  requestId: string;
  userId: string;
  companyId: string;       // verified membership
  membershipId: string;
  roles: string[];
  permissions: string[];   // effective
  isAuthenticated: true;
};
```

Resolution order (matches IAM):

1. Authenticate session/JWT
2. Resolve user
3. Resolve active membership / `company_id` (**verify**, ignore forged header/body)
4. Attach context
5. Rate limit
6. Handler → `requirePermission(ctx, code)`
7. Domain service uses `ctx.companyId` for all queries

Foundation stub: `carrieros-app/lib/api/auth-context.ts` wraps existing session and **documents** the membership assert until Supabase is wired.

---

## Permission model

### Today

- Catalog: `page.*`, `button.*`, `document.*` in `lib/permissions/permissions-catalog.ts`
- Check: `can(subject, permissionId)` / `canCurrentUser`

### Target

- Namespaced `resource:action` per [`../iam/05-permissions.md`](../iam/05-permissions.md)
- Compatibility map during migration — **do not fork** a second AuthZ system

API handlers should call a single helper:

```text
requirePermission(ctx, "loads:assign")
```

Owner-only invariants (billing ownership transfer) may check role **in addition** to permissions.

---

## Company isolation checklist

| Check | Required |
|-------|----------|
| Inserts set `company_id` from context | Yes |
| Updates never change `company_id` | Yes |
| Reads filter by `company_id` | Yes |
| `X-Company-Id` / body `company_id` alone | **Insufficient** |
| Cross-tenant IDOR returns | `404` (not `403` that leaks existence) when possible |
| Service-role jobs | Re-check tenant from job payload; no browser access |

---

## Step-up & critical actions

| Class | Examples | Extra gate |
|-------|----------|------------|
| Sensitive admin | Role changes, API keys | MFA step-up |
| Constitution-critical | Payroll submit, migration commit, payment capture, OCR approve-as-truth | Human confirmation (`lib/ai-safety`) |
| Alph suggested | Any critical mutation | Same permissions + confirmation — never auto-approve |

---

## Endpoint protection matrix

| Client | AuthN | AuthZ |
|--------|-------|-------|
| Ops web | Session cookie | RBAC permission |
| Driver App | Session / bearer + device | Narrow driver permissions + ABAC later |
| Portal | Session | Portal-scoped |
| Public API (future) | OAuth2 / API keys | Scoped subset |
| Webhooks inbound | HMAC + timestamp | Provider → company map |
| Health | None or network-restricted | No tenant data |

---

## Alignment with RLS

API AuthZ and RLS are **defense in depth**:

- API: fail fast with clear errors / audit
- RLS: last line if a query forgets `company_id`

Using the **user-scoped** Supabase client in request path; service role only in locked-down workers with explicit tenant in job payload.

---

## Related

- Errors for 401/403/404: [06-errors.md](./06-errors.md)
- Alph: [12-alph.md](./12-alph.md)
- IAM API security: [`../iam/10-api-security.md`](../iam/10-api-security.md)
