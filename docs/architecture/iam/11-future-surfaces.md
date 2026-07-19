# 11 — Future Surfaces (Identity)

**Status:** Documentation only — not yet implemented
**Parent:** [00-README.md](./00-README.md)
**Architecture:** [`../11-future-surfaces.md`](../11-future-surfaces.md)

---

## Strategy: shared IdP, separated authorization planes

**Recommendation:** one **Supabase Auth** (or same IdP family) for humans; **separate memberships, roles, and clients** per surface. Do not run a second password database per app.

| Surface | Identity | Authorization plane |
|---------|----------|---------------------|
| Ops web (CarrierOS) | Shared user | Company membership + office roles |
| Driver App | Shared user (linked `driver_id`) | Driver role + assignment scope |
| Partner / Customer / Vendor portals | Shared or invite-only user | Portal membership + narrow perms |
| Marketplace / Exchange | Shared user | Exchange-specific perms / seller org |
| Public APIs | API keys / OAuth clients | Scoped permissions |
| Mobile / desktop | Same AuthN; refresh + device binding | Same planes as web counterparts |
| Platform admin | Shared IdP + hard MFA/SSO | Platform role plane (not company Owner) |

---

## Driver App

- Membership with `driver_id` set; built-in **Driver** role.
- Permissions: assigned loads, upload POD, DVIR, own payroll view, own docs — not company settings.
- Future ABAC: `resource.assigned_driver_id == actor.driver_id`.
- Device-bound sessions; easier revoke on phone loss.
- Optional phone OTP later; still maps to same `users` row.

---

## Partner / Customer / Vendor portals

- Invite-based; roles like legacy `broker` / `shipper` / `customer`.
- Data visible only via **explicit shares** or counterparty links — still `company_id` of the carrier tenant owning the data, with portal ACL rows (design in portal module docs when written).
- MFA recommended when invoices/PODs exposed.

---

## Marketplace / Exchange

- Seller/buyer orgs may be companies or specialized orgs.
- Prefer reusing `companies` + memberships; add exchange permissions (`exchange:*`).
- Never let marketplace roles imply ops Owner.

---

## Public APIs & developers

- See [10-api-security.md](./10-api-security.md).
- Developer portal users are company members with `api_keys:manage`.
- Scopes ⊂ permission catalog; document in `/platform/developers` when built.

---

## Mobile / desktop

- Same AuthN protocols (OAuth + session/refresh).
- Secure storage for refresh tokens (OS keychain); no tokens in logs.
- Biometric unlock is **local** convenience — not a replacement for server MFA policy.

---

## Identity separation vs shared IdP

| Approach | When |
|----------|------|
| **Shared IdP + separate memberships** | Default — one person, many surfaces |
| Separate IdP per surface | Avoid — operational cost, duplicate accounts |
| Separate auth users for bots/services | Yes — service principals / API keys |

Account linking across Google/Apple/Microsoft stays at IdP layer; app `identities` table records links ([12-data-model.md](./12-data-model.md)).

---

## Related

- [02-authentication.md](./02-authentication.md) · [03-multi-tenancy.md](./03-multi-tenancy.md) · [04-roles.md](./04-roles.md)
