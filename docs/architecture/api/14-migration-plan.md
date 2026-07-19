# 14 — Incremental Migration Plan

**Status:** Execution plan
**Constraint:** Do **not** break pages, remove routes, or duplicate conflicting endpoints.

---

## Strategy

```text
Stabilize shared foundation
  → Wrap existing services behind /api/v1 (read-first)
  → Point Server Actions at the same validators/services
  → Add writes with idempotency where money/side effects exist
  → Retire ad-hoc patterns only after dual-path verified
```

**Never** big-bang rewrite of `app/**` or `lib/**`.

---

## Phase 0 — Done in this pass

| Deliverable | Location |
|-------------|----------|
| API architecture docs | `docs/architecture/api/*` |
| Error + request ID + pagination helpers | `carrieros-app/lib/api/` |
| Auth context stub (session + membership assert docs) | `lib/api/auth-context.ts` |
| Idempotency + rate-limit interfaces | `lib/api/idempotency.ts`, `rate-limit.ts` |
| `GET /api/v1/health` | `app/api/v1/health/route.ts` |
| Cross-links | `docs/architecture/00-README.md`, `constitution/INDEX.md` |

---

## Phase 1 — Read APIs (low risk)

1. Pick 1–2 hot read resources already backed by services (e.g. `GET /api/v1/loads`, `GET /api/v1/drivers`).
2. Handler: requestId → authContext → `requirePermission` → service.list → envelope.
3. **Do not** remove RSC loaders or pages; HTTP is additive (Driver App / future clients).
4. Verify tenancy: forged `company_id` cannot read other tenants (once real auth lands).

Exit criteria: cursor pagination + error envelope green; UI unchanged.

---

## Phase 2 — Write parity with Server Actions

1. For each action in `app/*/actions.ts`, ensure JSON validator shares input types with form parser.
2. Add `POST/PATCH` `/api/v1/...` calling the **same** `lib/services/*` method.
3. Keep Server Actions as thin adapters (parse FormData → service).
4. Add Idempotency-Key on create/assign where double-submit hurts.

Exit criteria: one mutation path proven from both UI action and HTTP without divergent logic.

---

## Phase 3 — AuthZ hardening

1. Replace coarse `requireRole([...])` with `requirePermission(ctx, code)` incrementally.
2. Maintain compatibility map from `page.*` / `button.*` → `resource:action` ([../iam/05-permissions.md](../iam/05-permissions.md)).
3. Wire Supabase session + membership verification (IAM roadmap) — replace demo session.
4. Ensure RLS policies match API filters ([../database/81-security-rls.md](../database/81-security-rls.md)).

Exit criteria: no mutation trusts client `company_id`; Alph uses same permission checks.

---

## Phase 4 — Jobs, webhooks, money

1. Job table + worker for OCR / import / export / notifications.
2. Inbound webhook routes with signature verify + inbox.
3. Payments, payroll submit, settlements finalize, migration commit with idempotency + human gates.
4. Outbound webhooks + delivery logs.

Exit criteria: critical money/migration paths audited and idempotent.

---

## Phase 5 — Public / partner API (optional)

1. API keys hashed at rest; scopes ⊂ permission catalog.
2. OpenAPI from schemas; `/platform/developers`.
3. Separate rate-limit tier; sandbox tenant.

Only when product demands it — not required for internal BFF success.

---

## What not to do

| Anti-pattern | Why |
|--------------|-----|
| New `/api/loads` without `v1` | Breaks versioning strategy |
| Parallel “Alph admin” API | Constitution violation |
| Copy-paste business logic into handlers | Drift from Server Actions |
| Delete Server Actions before HTTP clients exist | Breaks UI |
| Put service-role key in `NEXT_PUBLIC_*` | Credential leak |
| Migrate all modules in one PR | Unreviewable / high risk |

---

## Suggested first resource adapters (after foundation)

| Order | Endpoint | Reuse |
|-------|----------|-------|
| 1 | `GET /api/v1/health` | Done |
| 2 | `GET /api/v1/loads` | `getLoadService().list…` |
| 3 | `GET /api/v1/drivers` | `DriverService.listDrivers` |
| 4 | `POST /api/v1/loads/:id/assign` | Existing assign service + idempotency |

Each adapter PR should be small, tested with `tsc`, and leave pages green.

---

## Verification checklist (every API PR)

- [ ] No UI route removed
- [ ] No duplicate conflicting path
- [ ] AuthZ + tenancy documented/tested
- [ ] Errors use standard envelope
- [ ] Secrets absent from client bundles
- [ ] Constitution gates intact for critical actions

---

## Related

- Inventory: [01-inventory.md](./01-inventory.md)
- IAM roadmap: [`../iam/13-implementation-roadmap.md`](../iam/13-implementation-roadmap.md)
- Backend layering: [`../03-backend.md`](../03-backend.md)
