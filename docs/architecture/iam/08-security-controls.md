# 08 — Security Controls

**Status:** Documentation only — not yet implemented
**Parent:** [00-README.md](./00-README.md)
**Threats:** [01-threat-model.md](./01-threat-model.md)

---

## Password encryption / hashing

| Requirement | Detail |
|-------------|--------|
| Algorithm | **Argon2id** (preferred; Supabase Auth default) or **bcrypt** (cost ≥ 12) if custom |
| Storage | Hash only — never plaintext, never reversible encryption |
| Transit | TLS only |
| Reset / change | Re-hash; revoke sessions; audit |
| Logging | Never log passwords, TOTP secrets, recovery codes, or raw tokens |

---

## Rate limits and brute-force lockout

| Surface | Guidance |
|---------|----------|
| Login | Per IP + per email; progressive delay |
| Magic link / reset | Stricter per email |
| MFA verify | Tight per session |
| Invite accept | Per token + IP |
| API (authenticated) | Per user + per company ([../06-apis.md](../06-apis.md)) |

**Lockout:** after N failures (e.g. 10 / 15 min), temporary lock; always return generic errors to client; alert user on repeated failures. Unlock via time, verified email, or Owner/Admin (audited).

---

## Session expiration

| Timer | Ops web (example) | Notes |
|-------|-------------------|-------|
| Idle | 8–12 hours | Sliding on activity |
| Absolute | 7–30 days (“remember me”) | Shorter without remember |
| MFA step-up | Per sensitive action or short TTL | Does not extend forever |
| Impersonation | ≤ 1 hour | Hard stop |

On password change, role privilege increase, or suspend: **revoke**.

Cookie flags: `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict` where compatible).

---

## Device tracking

Store `devices` / session metadata:

- `device_id`, user agent family, OS hint, last IP (truncated/coarse for privacy), `last_seen_at`, `trusted_at`, `revoked_at`

User self-service: list devices, revoke. Admin: revoke member sessions (`users:suspend` path).

---

## Notifications and alerts

| Event | Notify |
|-------|--------|
| Successful login from new device | Email (and in-app) |
| Password changed / reset | Email |
| MFA enabled/disabled | Email |
| Failed login threshold | Email to account |
| Role granted with sensitive perms | Email to actor + Owners (optional) |
| Ownership transfer | Email both parties |
| Suspicious activity (geo/velocity anomalies — later) | Email + security review queue |

Never include secrets in notifications.

---

## Suspicious activity (phased)

Phase 1: new device, failed-login bursts, concurrent geo-impossible logins (best-effort).
Later: risk scores, forced step-up, temporary hold.

---

## Secrets and keys

| Secret | Handling |
|--------|----------|
| Invite / reset tokens | High entropy; store **hash** only |
| API keys (future) | Hash at rest; show once |
| Webhook secrets | Encrypted at rest; rotate |
| TOTP seeds | Encrypted at rest; never log |

---

## Constitution-aligned controls

- Step-up MFA on payroll approve, billing, role grants, migration commit, ownership transfer.
- AI cannot disable MFA or grant itself `roles:manage`.
- Sensitive document permissions (`documents:ssn_secured:*`) extra-audited ([09-audit-logs.md](./09-audit-logs.md)).

---

## Related

- [02-authentication.md](./02-authentication.md) · [09-audit-logs.md](./09-audit-logs.md) · [10-api-security.md](./10-api-security.md)
