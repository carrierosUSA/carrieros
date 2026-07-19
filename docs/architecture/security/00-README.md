# Transpo.ai Enterprise Security Architecture

**Status:** Assessment + incremental hardening (July 2026)
**Codebase:** `carrieros-app/`
**Governance:** [`/constitution`](../../../constitution/INDEX.md) — Master Constitution Version 1.0 is highest authority
**Parents:** [`../00-README.md`](../00-README.md) · [`../15-security-compliance.md`](../15-security-compliance.md) · [`../iam/00-README.md`](../iam/00-README.md) · [`../api/00-README.md`](../api/00-README.md)

---

## Purpose

Document the **current security posture**, honest findings, and a layered remediation roadmap for customer/company/driver/financial/docs/AI/API/storage/auth/integrations — without redesigning the product or removing functionality.

This pack is the **authoritative security assessment** for `carrieros-app`. Thin principles remain in [`../15-security-compliance.md`](../15-security-compliance.md). IAM and API design packs remain authoritative for AuthN/AuthZ and `/api/v1` contracts.

---

## Honest summary (current state)

| Layer | Today | Target |
|-------|--------|--------|
| AuthN | **Stub session** — `getCurrentSession()` always returns authenticated owner | Supabase Auth + HttpOnly cookies ([`../iam/02-authentication.md`](../iam/02-authentication.md)) |
| AuthZ | In-memory RBAC catalog + checks; not enforced on all Server Actions | Permission on every mutation + RLS |
| Tenancy | Soft filters via `tenantId` / `companyId` in stores | `company_id` + RLS on all business tables |
| API | `/api/v1/health` + `lib/api` foundation | Versioned protected resources |
| Secrets | No Supabase/Stripe wired; `.env*` gitignored; hygiene helpers added | Secret manager; zero `NEXT_PUBLIC_*` secrets |
| Headers | **Baseline enforced** + CSP Report-Only | Enforce CSP after validation |
| Rate limit | In-memory limiter (Alph + ready for API) | Redis/Upstash multi-instance |
| Alph | Permission gate + critical assist annotations; no elevated execution | Same + confirm endpoints ([`../api/12-alph.md`](../api/12-alph.md)) |
| Audit | In-memory permission + AI audit stores | Durable `audit_events` / `ai_audit_entries` |
| Uploads | UI stubs; no real object storage pipeline | Signed uploads, virus scan, private ACLs |
| Dependencies | Next 16 / React 19; see audit note in [05](./05-headers-rate-limit-deps.md) | CI `npm audit` gate |

**Verdict:** The app is a **demo/alpha product surface** with strong *design* for security (IAM, RLS, AI Safety) and **partial runtime controls**. It is **more secure after this pass** (headers, secret hygiene, Alph RBAC gate, rate-limit stub, request IDs) but **not enterprise-production ready** until real AuthN, RLS, and durable audit land.

---

## Reading order

| # | Doc | Contents |
|---|-----|----------|
| 1 | [01-threats-findings.md](./01-threats-findings.md) | Honest vulnerabilities / gaps |
| 2 | [02-auth-sessions.md](./02-auth-sessions.md) | AuthN & sessions |
| 3 | [03-authorization-tenancy.md](./03-authorization-tenancy.md) | RBAC, tenancy, portal |
| 4 | [04-api-files-secrets.md](./04-api-files-secrets.md) | API, uploads, env secrets |
| 5 | [05-headers-rate-limit-deps.md](./05-headers-rate-limit-deps.md) | Headers, rate limits, npm audit |
| 6 | [06-audit-encryption-compliance.md](./06-audit-encryption-compliance.md) | Audit, encryption, compliance |
| 7 | [07-alph-security.md](./07-alph-security.md) | Alph / AI security |
| 8 | [08-remediation-roadmap.md](./08-remediation-roadmap.md) | Phased fixes |

---

## Code foundation (this pass)

| Path | Role |
|------|------|
| `carrieros-app/lib/security/` | Headers, secret hygiene, security audit helpers |
| `carrieros-app/proxy.ts` | Next.js 16 Proxy — request ID + security headers |
| `carrieros-app/next.config.ts` | Baseline headers + CSP Report-Only |
| `carrieros-app/lib/api/` | Request ID, AuthZ context pattern, rate limit, errors |
| `carrieros-app/lib/alph/security.ts` | Alph permission gate + critical assist annotations |
| `carrieros-app/lib/ai-safety/` | Confirmation taxonomy, automation levels, AI audit |
| `carrieros-app/lib/permissions/` | RBAC catalog, `can()`, permission audit |

---

## Constitution alignment

1. **AI assists; humans decide** — critical Alph intents annotated; `runAiSuggestedAction` blocks silent critical execution.
2. **Never trust the client** — API auth context rejects mismatched `company_id` claims.
3. **No service-role in browser** — `getServerSecret` refuses `NEXT_PUBLIC_*`; hygiene check on `/api/v1/health`.
4. **Alph same permissions as user** — `gateAlphIntent` uses `lib/permissions`.
5. **Conflict → stop** — security must not invent parallel approval gates that weaken `/constitution`.

---

## Non-goals (this pack)

- Redesigning UI or removing modules
- Applying SQL/RLS migrations without design approval
- Enforcing a strict CSP that breaks Leaflet/localhost
- Claiming production-grade AuthN while session remains stubbed
