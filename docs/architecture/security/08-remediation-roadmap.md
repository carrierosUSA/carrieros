# 08 — Remediation Roadmap

**Parent:** [00-README.md](./00-README.md)
**Aligns with:** [`../iam/13-implementation-roadmap.md`](../iam/13-implementation-roadmap.md) · [`../api/00-README.md`](../api/00-README.md)

---

## Principle

Incremental hardening only. Prefer safer → trustworthy → simpler → maintainable. Do not rebuild the app. Constitution overrides feature shortcuts.

---

## Phase A — Done / in progress (this pass)

| Item | Status |
|------|--------|
| Baseline security headers + CSP Report-Only | Done |
| Next.js 16 `proxy.ts` request ID + headers | Done |
| Secret hygiene helpers + health leak flag | Done |
| Memory rate limiter + Alph throttle | Done |
| Alph RBAC gate + critical assist annotations | Done |
| Security architecture documentation pack | Done |
| `npm audit` documented for CI | Documented |

---

## Phase B — Before first real tenant (P0/P1)

1. **Supabase Auth** for ops + portal (replace localStorage demo auth).
2. **Membership verification** on every mutation (`company_memberships`).
3. **Enforce `can()`** at Server Action / service boundaries for money, docs, roles.
4. **Apply RLS** after database design approval ([`../database/81-security-rls.md`](../database/81-security-rls.md)).
5. **Durable audit_events** + retain AI audit.
6. **CSRF / cookie** posture with real sessions.
7. Strip demo passwords from production builds.
8. Wire Redis/Upstash rate limits for multi-instance.

---

## Phase C — Before money / filings at scale (P1/P2)

1. Signed upload URLs, MIME allowlist, size caps, malware scan.
2. Webhook HMAC + idempotency for integrations.
3. Field encryption for integration secrets / MFA seeds.
4. Enforce CSP (nonces) after Report-Only validation.
5. `/api/v1/alph/actions` confirm/cancel endpoints.
6. Step-up MFA for sensitive permissions.
7. Dependency scanning gate in CI (`npm audit --audit-level=high`).

---

## Phase D — Enterprise ops (P2/P3)

1. Device tracking / session revoke UI.
2. Break-glass platform access with review.
3. SSRF-safe outbound connector fetches.
4. Subprocessor / DPA documentation.
5. Security runbooks (credential leak, tenant exposure, OCR storm).
6. Penetration test before large fleet rollout.

---

## Explicit non-actions

- Do not remove APIs, tables, or modules “for security theater.”
- Do not auto-execute critical AI actions to “save clicks.”
- Do not put service-role keys in the frontend for convenience.
- Do not enforce a strict CSP that breaks localhost without a measured rollout.
