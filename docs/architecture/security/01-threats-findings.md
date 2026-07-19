# 01 — Threats & Findings (honest)

**Parent:** [00-README.md](./00-README.md)
**Related:** [`../iam/01-threat-model.md`](../iam/01-threat-model.md)

---

## Severity legend

| Level | Meaning |
|-------|---------|
| **P0** | Would be critical in production with real customer data / money |
| **P1** | High — required before any real tenants |
| **P2** | Medium — harden before scale |
| **P3** | Low / hygiene — incremental |

---

## Findings (as of this assessment)

### P0 — Stub authentication (expected for alpha)

| ID | Finding | Evidence | Status |
|----|---------|----------|--------|
| T-01 | Ops session is hardcoded authenticated **owner** | `lib/auth/session.ts` → `isAuthenticated: true`, `role: "owner"` | Documented; IAM roadmap |
| T-02 | No real login, logout, MFA, or session revocation for ops app | No Supabase Auth client; no middleware auth gate | Design in `iam/` |
| T-03 | Portal & IFTA accountant “login” use **client localStorage** + demo passwords | `lib/portal/session.ts`, `lib/ifta/accountant-auth.ts`, password `demo1234` | Demo-only; must not ship to production as-is |

**Impact if treated as production:** full privilege as Owner for anyone who can open the app; portal credentials are public demo secrets.

### P1 — Authorization & tenancy gaps

| ID | Finding | Evidence | Status |
|----|---------|----------|--------|
| T-04 | RBAC exists but is **not consistently enforced** on every Server Action / mutation | `lib/permissions/check.ts` used selectively; many actions trust UI | Partial; Alph now gated |
| T-05 | No Postgres RLS applied | [`../database/81-security-rls.md`](../database/81-security-rls.md) is design-only | Blocked on DB design approval |
| T-06 | Tenant isolation is in-memory store filtering | `lib/data/*` seed stores | Soft isolation only |
| T-07 | Client-supplied company context historically risky | Mitigated in `lib/api/auth-context.ts` for `/api/v1` pattern | Extend to all mutations |

### P1 — AI / Alph

| ID | Finding | Evidence | Status |
|----|---------|----------|--------|
| T-08 | Alph executor historically ran without permission checks | `lib/alph/executor.ts` | **Fixed this pass:** `lib/alph/security.ts` + gate in `runAlphCommand` |
| T-09 | Critical intents were navigate-only (good) but UI did not always state confirmation requirement | Assist-only navigation | **Improved:** critical assist annotation on results |
| T-10 | `runAiSuggestedAction` correctly blocks silent critical execution when no confirm UI | `lib/ai-safety/run-suggested-action.ts` | Keep; wire all mutation paths |

### P2 — API, files, headers, rate limits

| ID | Finding | Evidence | Status |
|----|---------|----------|--------|
| T-11 | Almost no HTTP API surface; most logic via Server Actions / client stores | Only `app/api/v1/health` | Foundation ready |
| T-12 | No security headers previously | `next.config.ts` had none; no middleware/proxy | **Fixed:** headers + `proxy.ts` |
| T-13 | Rate limit was no-op | `NoopRateLimiter` | **Improved:** `MemoryRateLimiter` + Alph action limit |
| T-14 | File uploads are stubs; no signed URL / content-type allowlist / malware scan | Broker upload stub, ELD stub, document store in memory | Roadmap |
| T-15 | No CSRF strategy for cookie sessions (N/A until real cookies) | — | Required with Supabase Auth |

### P2 — Secrets & integrations

| ID | Finding | Evidence | Status |
|----|---------|----------|--------|
| T-16 | No `NEXT_PUBLIC_*` secrets found in repo; no `.env` committed | Grep + `.gitignore` `.env*` | Good baseline |
| T-17 | No Supabase service-role client in codebase yet | No `createClient` / service role imports | Hygiene helpers added for when wired |
| T-18 | Integration secrets design exists; runtime vault not built | `lib/integrations/*` stubs | Roadmap |

### P3 — Dependencies & ops

| ID | Finding | Evidence | Status |
|----|---------|----------|--------|
| T-19 | Dependency tree is small (Next/React/Leaflet) | `package.json` | Re-run `npm audit` in CI |
| T-20 | No durable security event store | In-memory audit | Roadmap |
| T-21 | Demo passwords embedded in client bundles for portal/IFTA | Seed modules | Acceptable for demo; strip before prod |

---

## What is *not* a vulnerability (context)

- Hardcoded Owner session in a **local demo** product is an intentional stub, not a forgotten production key — **unless** the same build is exposed to the internet with real data.
- Absence of Supabase is not a secret leak; it is incomplete AuthN.
- CSP Report-Only does not “fail open” in a worse way than having no CSP; enforcement comes after measuring breakage.

---

## Residual risk statement

After this pass the app is **harder to clickjack, sniff MIME, or abuse Alph without RBAC**, and **secret-leak env misconfiguration is detectable**. It remains **unsafe for real PII/money** until T-01–T-07 and durable audit/RLS are closed.
