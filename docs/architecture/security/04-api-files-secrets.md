# 04 — API, Files & Secrets

**Parent:** [00-README.md](./00-README.md)
**Canonical API design:** [`../api/00-README.md`](../api/00-README.md) · [`../iam/10-api-security.md`](../iam/10-api-security.md)

---

## HTTP API surface (today)

| Route | Auth | Notes |
|-------|------|-------|
| `GET /api/v1/health` | None (liveness) | Returns `security.public_secret_leak`; **503** if leak detected |

Foundation modules:

- `lib/api/request-id.ts` — correlation IDs
- `lib/api/auth-context.ts` — session + membership pattern
- `lib/api/rate-limit.ts` — memory limiter
- `lib/api/errors.ts` / `response.ts` — error envelope

Most product logic remains Server Actions + client stores (compatible; migrate incrementally).

---

## Secrets & environment

### Rules

| Rule | Enforcement |
|------|-------------|
| Never put secrets in `NEXT_PUBLIC_*` | `lib/security/secrets.ts` + health check |
| Never commit `.env*` | `.gitignore` includes `.env*` |
| Service-role keys server-only | No Supabase client yet; helpers ready |
| Refuse `getServerSecret("NEXT_PUBLIC_…")` | Throws |

### Known demo credentials (not production secrets)

| Surface | Credential | Risk |
|---------|------------|------|
| Portal seed | `demo1234` in client seed | Public demo password — strip for prod |
| IFTA accountant | same | Public demo password — strip for prod |

These are **intentional demo fixtures**, not leaked production keys. They must never be reused for real tenants.

### Inventory (this assessment)

- Grep found **no** `NEXT_PUBLIC_*` usage in app TS/TSX.
- Grep found **no** `SUPABASE_SERVICE_ROLE` / service-role client imports.
- `process.env` usage limited to `NEXT_DIST_DIR` / `NODE_ENV` patterns in config.

---

## File uploads & storage

| Surface | Today | Target |
|---------|-------|--------|
| Documents | In-memory / seed; OCR stubs | Private bucket, signed upload URLs, MIME allowlist, size caps |
| Broker upload modal | Explicit stub — files not stored | Portal AuthZ + virus scan |
| ELD request form | Stub upload metadata | Provider-scoped storage |
| Migration import | Parsers + local staging design | Job queue + audited commit |

**Do not** stream untrusted files through the browser to a service-role path.

---

## Request correlation

- Proxy sets `X-Request-Id` on matched requests.
- `/api/v1` helpers resolve/propagate the same header.
- Security audit helper can attach request IDs (`lib/security/audit.ts`).
