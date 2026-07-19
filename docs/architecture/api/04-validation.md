# 04 — Validation Strategy

**Status:** Target design
**Today:** Hand-rolled FormData parsers in `lib/services/*/form-parsing.ts`
**Package:** No Zod in `carrieros-app/package.json` yet

---

## Goals

1. One validation story for **Server Actions** and **`/api/v1`** JSON bodies.
2. Fail closed with field-level errors ([06-errors.md](./06-errors.md)).
3. Keep domain services free of HTTP/FormData concerns.

---

## Recommended approach (phased)

### Phase 1 (now) — shared TypeScript validators

- Keep existing form parsers for UI forms.
- Add **JSON/object validators** next to inputs (e.g. `lib/services/loads/load-inputs.ts` + `validateCreateLoad(input)`).
- Foundation: `lib/api` can throw `ApiError` with `validation_error` + `details.fields`.
- No new dependency required for the health/foundation pass.

### Phase 2 — optional Zod (preferred when added)

When validation volume grows, add `zod` as a **server-only** dependency:

| Layer | Role |
|-------|------|
| Zod schemas | Edge validation for JSON + (optional) FormData via adapters |
| Inferred types | Align with `CreateXInput` / `UpdateXInput` |
| OpenAPI (later) | Generate docs from schemas for public API |

Do **not** put Zod in client bundles unless a specific client form needs it; prefer server validation.

### Alternative

If the team rejects Zod, stay on typed guard functions — but centralize them (no copy-paste per handler).

---

## Where validation runs

```text
Request
  → parse JSON / FormData
  → schema.validate (edge)
  → AuthZ
  → service (re-check invariants / business rules)
```

Business invariants (e.g. “cannot assign inactive driver”) stay in the **service**, not only the schema.

---

## Patterns

### Shared input types

```ts
// Conceptual — align with existing load-inputs
export type CreateLoadInput = { … };
export function assertCreateLoadInput(value: unknown): CreateLoadInput;
```

### Mapping FormData → same input

Existing `parseCreateLoadInput(formData)` should eventually call the same asserts as JSON:

```text
FormData → plain object → assertCreateLoadInput
JSON body → assertCreateLoadInput
```

### Enums & IDs

- Validate enums against const arrays (`LOAD_STATUSES`, etc.).
- IDs: non-empty string format checks only at edge; existence + tenancy in service.

---

## Error shape for validation

```json
{
  "error": {
    "code": "validation_error",
    "message": "Check the highlighted fields and try again.",
    "request_id": "req_…",
    "details": {
      "fields": [
        { "path": "origin.city", "message": "City is required." }
      ]
    }
  }
}
```

- `message` = user-safe
- Technical detail only in server logs (include `request_id`)

---

## Security-sensitive fields

Never validate-and-accept from client:

| Field | Rule |
|-------|------|
| `company_id` / `tenant_id` | From auth context |
| `user_id` (actor) | From session |
| Permission / role elevation | Dedicated endpoints + step-up |
| Prices below floor / payment capture | Service + idempotency + human gates where required |

---

## Related

- Contracts: [03-contracts.md](./03-contracts.md)
- Inventory parsers: [01-inventory.md](./01-inventory.md)
- IAM: never trust client AuthZ ([05-authorization.md](./05-authorization.md))
