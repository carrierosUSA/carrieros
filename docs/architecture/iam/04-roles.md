# 04 — Roles

**Status:** Documentation only — not yet implemented
**Parent:** [00-README.md](./00-README.md)
**Companion:** [05-permissions.md](./05-permissions.md) · DB [`../database/10-identity-tenancy.md`](../database/10-identity-tenancy.md)

---

## Model

- **Built-in roles:** system-defined, immutable codes, seeded permissions (companies assign them; they do not edit the system definition — see [06-custom-roles.md](./06-custom-roles.md)).
- **Custom roles:** unlimited per company; composed from the permission catalog.
- A membership may hold **one or more** roles; effective permissions = **union**.
- Phase 1 has no separate deny-ACE list; absence of a grant means deny.

Evolve from today’s `BuiltInRoleId` in `lib/permissions/types.ts` and session `CarrierOSRole` in `lib/auth/session.ts`.

---

## Built-in roles — purpose matrix

| Role code | Purpose | Typical users | Notable powers |
|-----------|---------|---------------|----------------|
| **Owner** | Full company control including billing and ownership | Founder / principal | Transfer ownership, billing, delete company |
| **Administrator** | Day-to-day admin: users, settings, integrations | Office manager | Invite users, manage non-owner roles |
| **Dispatcher** | Load board, assign drivers, ops documents | Dispatch desk | Assign loads, send rate con |
| **Safety Manager** | Compliance, CDL/medical, incidents, DVIR oversight | Safety dept | Approve compliance items |
| **Fleet Manager** | Trucks/trailers, utilization, unit assignment | Fleet ops | Asset CRUD, assign units |
| **Maintenance Manager** | Shop work, PM schedules, maintenance docs | Shop lead | Schedule / close maintenance |
| **Accounting** | Invoices, AR/AP, settlements, IFTA support | Back office | Create invoices, record payments |
| **Payroll** | Driver pay runs and settlements | Payroll clerk | Prepare payroll (approve often Owner/Admin) |
| **Recruiter** | Driver recruiting pipeline, limited HR docs | Recruiting | Create driver candidates |
| **Customer Service** | Broker/customer communications, tracking | CS desk | Share docs, status updates |
| **Operations** | Broad ops without finance or admin | Ops lead | Loads + fleet + drivers |
| **Read Only** | View non-sensitive pages and docs | Auditor / observer | No mutations |
| **Custom Role** | Company-defined bundle | Any | Per assigned permissions |
| **Driver** (future) | Self + assigned loads | Drivers | Upload POD, DVIR, own expenses |

### Legacy / portal mapping

| Legacy or portal id | Maps to |
|---------------------|---------|
| `accountant`, `mechanic`, `fleet_manager` (session aliases) | Accounting, Maintenance Manager, Fleet Manager |
| `broker`, `shipper`, `customer` | Portal principals with narrow permissions ([11-future-surfaces.md](./11-future-surfaces.md)) |
| `super_admin` | **Platform** plane only — not a company role |

---

## Default permission sets (summary)

Legend: **F** = full typical grant · **L** = limited / scoped · **V** = view-oriented · **—** = none
Exact codes: [05-permissions.md](./05-permissions.md).

| Area | Owner | Admin | Dispatcher | Safety | Fleet | Maint | Accounting | Payroll | Recruiter | CS | Operations | Read Only | Driver |
|------|:-----:|:-----:|:----------:|:------:|:-----:|:-----:|:----------:|:-------:|:---------:|:--:|:----------:|:---------:|:------:|
| `loads.*` | F | F | F | L | L | — | L | — | — | L | F | V | assigned |
| `drivers.*` | F | F | F | F | L | — | — | L | F | L | F | V | self |
| `fleet.*` | F | F | L | L | F | F | — | — | — | — | F | V | — |
| `maintenance.*` | F | F | — | L | L | F | — | — | — | — | L | V | own DVIR |
| `documents.*` (ops) | F | F | F | F | L | L | F | L | L | L | F | download† | upload POD |
| `documents.*` (PII/safety) | F | L | — | F | — | — | — | L | L | — | — | — | self |
| `compliance.*` | F | F | L | F | — | — | — | — | — | — | L | V | — |
| `finance.*` / `accounting.*` | F | L | — | — | — | — | F | L | — | — | — | V‡ | — |
| `payroll.*` | F | L | — | — | — | — | L | F | — | — | — | — | self view |
| `reports.*` | F | F | L | L | L | L | F | F | L | L | F | V | — |
| `import.*` / migration | F | F | — | — | — | — | L | — | — | — | — | — | — |
| `users.*` / `roles.*` | F | F | — | — | — | — | — | — | — | — | — | — | — |
| `settings.*` | F | F | — | — | — | — | — | — | — | — | — | — | — |
| `billing.*` | F | — | — | — | — | — | — | — | — | — | — | — | — |
| `integrations.*` | F | F | — | — | — | — | — | — | — | — | — | — | — |
| `communications.*` | F | F | F | L | — | — | L | — | F | F | F | — | — |

† Non-sensitive documents only.
‡ Non-sensitive financial summaries only when explicitly granted.
Driver = future Driver Role on Driver App memberships.

Seed lists in product code (when implemented) must match this contract.

---

## Ownership transfer

| Rule | Detail |
|------|--------|
| Who can initiate | Current **Owner** only (step-up MFA) |
| Target | Existing **active** membership in the same company |
| Effect | Target becomes Owner; initiator becomes Administrator (or chosen built-in/custom role) |
| Invariant | Active company always has at least one Owner |
| Audit | `ownership.transferred` with both user ids |
| Billing notices | Follow company Owner |
| Impersonation | **Blocked** during transfer |

Transfer away from the last Owner is forbidden until another Owner is designated.

---

## Platform vs company roles

| Plane | Examples | Tenancy |
|-------|----------|---------|
| Company | Owner, Dispatcher, … | Scoped by membership |
| Platform | `platform_admin`, support break-glass | Cross-tenant only via audited tools |

Never assign platform roles through the company custom-role UI.

---

## Related

- [05-permissions.md](./05-permissions.md) · [06-custom-roles.md](./06-custom-roles.md) · [07-team-management.md](./07-team-management.md)
