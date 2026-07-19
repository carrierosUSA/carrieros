# 06 — Custom Roles

**Status:** Documentation only — not yet implemented
**Parent:** [00-README.md](./00-README.md)
**Permissions:** [05-permissions.md](./05-permissions.md) · **Roles:** [04-roles.md](./04-roles.md)

---

## Goals

- Unlimited **custom roles per company** (practical UX pagination; no hard product cap required in Phase 1).
- Compose from the global permission catalog.
- Keep **system (built-in) roles immutable** in definition.
- Simple mental model: name + description + permission checklist.

---

## Rules

| Rule | Detail |
|------|--------|
| Scope | Custom role rows require `company_id` |
| Built-ins | `company_id IS NULL`, `built_in = true`; cannot delete or edit seed permissions via company UI |
| Naming | Unique `(company_id, name)` among active custom roles |
| Assignment | Via `membership_roles` like built-ins |
| Billing / ownership | Custom roles **cannot** include `billing:manage` or ownership-transfer powers unless product explicitly allows (default: **Owner-only** permissions excluded from custom role picker) |
| Platform permissions | Never available in company custom-role UI |

---

## Permission assignment UI (concepts)

Not implementation — UX concepts only:

1. **List** custom roles + built-in (built-in marked “System”).
2. **Create / edit** custom role: name, description, grouped permission checkboxes by module (`loads`, `drivers`, `payroll`, …).
3. **Sensitive group** (payroll approve, SSN docs, billing): visual warning; may require step-up MFA to save.
4. **Members** tab: who holds this role.
5. **Duplicate** role as starting point.
6. **Delete** custom role: blocked if still assigned (or force-remove assignments with confirm).

Progressive disclosure: show module groups collapsed; search permissions by code/label.

---

## Validation

| Check | Behavior |
|-------|----------|
| Unknown permission code | Reject save |
| Owner-only permissions in custom role | Reject or strip (prefer reject with message) |
| Empty permission set | Allowed for “placeholder” roles? **No** — require ≥ 1 permission |
| **Privilege escalation (optional)** | Inviter/editor cannot grant permissions they do not hold |
| Concurrent edit | Last-write-wins with `updated_at`; audit both |

### Optional: cannot grant what inviter lacks

**Recommendation:** enable for `roles:manage` editors who are not Owner.

```text
assert subset(newRole.permissions, editor.effectivePermissions)
   OR editor.has(Owner) OR editor.has(roles:manage_unrestricted)  # Owner/Admin policy
```

Administrator may hold `roles:manage` but still cannot grant `billing:manage` if Owner-only exclusion applies.

---

## System role immutability

| Operation | Built-in | Custom |
|-----------|----------|--------|
| Rename | No (display name localized, code fixed) | Yes |
| Change permissions | No in company UI (platform seed only) | Yes |
| Delete | No | Yes (with guards) |
| Assign to members | Yes | Yes |

Demo overrides in today’s `builtInOverrides` (`lib/permissions/store.ts`) are **not** the production model. Production: built-in seeds change only via platform migration/versioned seed.

---

## Data shape (summary)

See [12-data-model.md](./12-data-model.md):

- `roles` (`built_in`, `company_id`, `code`/`name`)
- `role_permissions`
- Audit: `role.created`, `role.updated`, `role.deleted`, `role.permissions_changed`

---

## Related

- [07-team-management.md](./07-team-management.md) · [09-audit-logs.md](./09-audit-logs.md)
