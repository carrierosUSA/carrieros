# 06 — Audit, Encryption & Compliance

**Parent:** [00-README.md](./00-README.md)
**Related:** [`../15-security-compliance.md`](../15-security-compliance.md) · [`../iam/09-audit-logs.md`](../iam/09-audit-logs.md) · [`../database/60-comms-audit.md`](../database/60-comms-audit.md)

---

## Audit (today)

| Stream | Store | Used for |
|--------|-------|----------|
| Permission / security actions | `lib/permissions` audit + `lib/security/audit.ts` | Role changes, Alph deny, rate limit |
| AI suggestions / approvals | `lib/ai-safety/audit.ts` | Alph / automation confirmations |
| Document actions | Document board / types (demo) | Upload/share metadata in UI |

**Gap:** All are **in-memory / local** — lost on process restart; not suitable for compliance evidence.

### Target

- `audit_events` for security-sensitive ops (roles, payments, exports, migration commit).
- `ai_audit_entries` for suggestion → human decision.
- Redact secrets/PII bodies from logs.
- Platform break-glass: time-boxed, reason-coded, reviewed.

---

## Encryption

| Layer | Today | Target |
|-------|-------|--------|
| Transit | HTTPS in deployed envs; localhost HTTP ok for dev | TLS 1.2+ everywhere public |
| DB at rest | N/A (no Postgres wired) | Provider-managed encryption |
| Files at rest | N/A (stubs) | Bucket encryption + private ACL |
| Field-level | Not implemented | Integration secrets, MFA seeds |
| Backups | N/A | Encrypted + access audited |

---

## Compliance posture (product)

Aligned with Trust & Safety Charter:

- Transpo.ai **does not certify** compliance outcomes.
- IFTA / safety / inspections: prepare + record; humans file/decide.
- Customer owns operational data; portability via export/migration jobs.
- Soft delete + retention; hard delete via legal workflow.

Architecture supports records for inspections, DVIR, settlements — it does not replace the carrier’s regulatory duties.

---

## This pass

- `logSecurityEvent()` for Alph deny / rate-limit events.
- Health endpoint exposes **boolean** secret-hygiene status only (no secret values).
- No change to business compliance workflows or tables.
