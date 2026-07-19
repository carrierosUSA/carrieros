# 15 — Security & Compliance

## Purpose

Security, privacy, audit, and data-ownership posture for the enterprise architecture — aligned with `/constitution`.

**Canonical assessment & roadmap:** [`security/00-README.md`](./security/00-README.md) — **wins on conflict** for current findings and incremental hardening.
**Canonical:** [Master Constitution v1.0](../../constitution/00-master-constitution.md), [Trust & Safety Charter](../../constitution/01-trust-safety-charter.md), [AI Safety & Legal Policy](../../constitution/04-ai-safety-legal-policy.md).

---

## Principles

1. Humans remain responsible; AI never silently operates the business.
2. Least privilege AuthZ on every mutation.
3. Tenant isolation by default.
4. Customers own their operational data.
5. Prefer simple, auditable controls over exotic crypto schemes.
6. Security changes do not weaken AI confirmation gates.

---

## Encryption

| Layer | Control |
|-------|---------|
| In transit | TLS 1.2+ everywhere |
| At rest (DB) | Provider-managed encryption |
| At rest (files) | Bucket encryption; private ACLs |
| Secrets | Secret manager / env — never in git |
| Fields | Encrypt highly sensitive tokens (integration secrets, MFA seeds); tokenize payments via provider |
| Backups | Encrypted; access audited |

---

## Audit & accountability

- `audit_events` for security-sensitive ops (roles, payments, migration commit, exports).
- `ai_audit_entries` for suggestions, confidence, human approval/rejection (`lib/ai-safety/audit`).
- Platform break-glass access: time-boxed, reason-coded, reviewed.
- Logs without secrets/PII bodies where possible; redact.

---

## Data ownership & privacy

| Topic | Rule |
|-------|------|
| Ownership | Tenant company owns operational data; Transpo is processor/steward |
| Portability | Export via reports/Migration-style export jobs |
| Deletion | Soft delete + retention; hard delete via legal workflow |
| Public Network | Explicit publish/share only |
| Subprocessors | Document OCR, email, ELD — DPA as product matures |
| Driver PII | Minimize in Exchange/Network; field-level AuthZ in ops |

---

## Application security

- Input validation at edges
- CSRF protection for cookie sessions
- Signed webhooks; idempotent ingest
- SSRF-safe outbound fetches (connectors)
- Dependency scanning in CI
- Feature flags never bypass AuthZ or AI critical confirmations

---

## AI-specific security

Aligned with Constitution AI MAY / MUST NEVER:

- Treat model output as untrusted until validated
- Isolation of retrieval context per tenant
- No training on customer data without explicit product/legal policy
- Uncertainty → verification, never fabrication
- Automation levels cannot escalate privileges

Product surfaces: `/platform/ai-policy`, `/settings/ai-policy`, `/legal/ai-policy`.

---

## Compliance posture (product)

Architecture supports — not replaces — customer regulatory duties:

- Document retention for inspections
- IFTA calculation **prep** with human filing
- Safety/DVIR records
- Audit trails for settlements and payroll approvals

Transpo.ai does not certify compliance outcomes (Trust & Safety Charter).

---

## Incident readiness

- Runbooks for credential leak, webhook replay, tenant data exposure
- Ability to revoke sessions, rotate API keys, disable connectors
- Queue pause per tenant for abusive OCR/import storms

---

## Mapping to engineering standard

Master Constitution engineering standard: simple, reusable, modular, secure, scalable, maintainable, testable, documented, low support, low debt. Security design here prefers **boring, layered controls** over novel parallel systems.
