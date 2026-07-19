# 12 — Target Folder Structure

## Purpose

Professional target layout mapped to today’s `carrieros-app` paths. Evolve in place; avoid big-bang moves.

---

## Target (Phase 1 modular monolith)

```
carrieros-app/
├── app/                          # Next.js App Router (Pages / layouts)
│   ├── (ops)/                    # optional route group — dashboard, loads, fleet…
│   ├── driver/                   # Driver App
│   ├── portal/                   # Broker/customer portal
│   ├── platform/                 # Governance, migration, developers
│   ├── exchange/                 # Marketplace
│   ├── api/v1/                   # HTTP BFF / webhooks / public API
│   └── actions/                  # shared server actions (existing)
├── components/
│   ├── ui/                       # Shared UI primitives
│   ├── layouts/                  # AppShell, sidebars
│   └── <domain>/                 # Domain composites
├── hooks/                        # Shared React hooks
├── lib/
│   ├── db/                       # DB client, RLS helpers (target)
│   ├── auth/                     # AuthN session
│   ├── permissions/              # AuthZ
│   ├── ai-safety/                # Constitution runtime gates
│   ├── alph/ · alph-copilot/
│   ├── <domain>/                 # Domain types, policies, pure logic
│   ├── services/<domain>/        # Application use cases
│   ├── integrations/ · eld/
│   ├── migration/
│   ├── notifications/ · communications/
│   ├── design-system/
│   ├── types/                    # Shared cross-domain types (sparingly)
│   └── utils/                    # Pure utilities (dates, money, ids)
├── workers/                      # optional same-repo job entrypoints (target)
├── db/migrations/                # Schema migrations (target)
└── public/
```

Repo root (already):

```
/constitution/                    # Highest authority (policy)
/docs/architecture/               # This enterprise architecture
```

---

## Mapping: concept → current paths

| Concept | Target | Current (as of docs) |
|---------|--------|----------------------|
| Pages | `app/**` | Same — flat domains (`app/loads`, `app/fleet`, …) |
| Components | `components/ui`, `components/<domain>` | `components/*.tsx` + domain folders |
| Services / use cases | `lib/services/<domain>` | Partial (`loads`, `fleet`, `drivers`, `documents`, `tracking`) |
| Domain logic | `lib/<domain>` | Extensive domain folders |
| Hooks | `hooks/` | Present |
| Utilities | `lib/utils` | Scattered helpers — consolidate gradually |
| Types | `lib/<domain>/types.ts`, `lib/types` | Both patterns exist |
| Database | `lib/db` + `db/migrations` | Seed stores `lib/*/store.ts`, `lib/data/*` |
| AI | `lib/alph`, `lib/ai-safety` | Same |
| OCR / documents | `lib/documents`, services/documents | Same + driver-app OCR helper |
| Auth | `lib/auth`, `lib/permissions` | Same |
| Settings | `lib/settings`, `app/settings` | Same |
| Shared libraries | `lib/design-system`, `lib/forms`, `lib/keyboard` | Same |
| Workers | `workers/` | Not yet — jobs can start in Route Handlers |
| Platform | `lib/platform`, `app/platform` | Same |
| Migration | `lib/migration`, `app/platform/migration` | Same |

---

## Rules for placement

1. **UI never owns business rules** — call services.
2. **Domain folders must not import React/Next.**
3. **Stores are transitional** — replace with repositories behind the same façade.
4. **One domain write path** — avoid duplicate mutate helpers in `app/actions` and `lib`.
5. **Cross-domain orchestration** lives in application services, not in components.
6. **Do not overengineer** monorepo packages until Phase 2 extraction needs publishable boundaries.

---

## Suggested incremental moves (only when touching code)

1. New use cases → `lib/services/<domain>/`
2. New UI primitives → `components/ui/`
3. Introduce `lib/db` with first real Postgres module (prefer Documents or Drivers)
4. Add `app/api/v1` for webhooks before public API
5. Optional `(ops)` route group when layouts stabilize

No mass rename required to “comply” with this doc.
