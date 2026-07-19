# 90 — Evolution from Current Codebase

**Status:** Documentation only — no SQL migrations generated or applied.
**Goal:** Evolve in-memory / module stores into this Postgres schema without a big-bang rewrite.

---

## 1. Current state (light inventory)

| Area | Today | Target |
|------|-------|--------|
| Tenancy | `TenantEntity.tenantId`, `DEMO_TENANT_ID` | `companies.id` as `company_id` |
| Persistence | Seed arrays / in-memory stores under `lib/data/*`, domain stores | PostgreSQL (Supabase) |
| ORM | None (no Prisma schema found) | Prefer Supabase client + SQL migrations **after approval**; ORM optional |
| Loads | `lib/types/load.ts` + seed loads | `loads` + `load_stops` |
| Drivers / fleet | `lib/types/driver.ts`, `fleet.ts` + stores | `drivers`, `trucks`, `trailers`, assignments |
| Documents | `CarrierDocument` with embedded versions/OCR/audit | Normalized `documents*` tables |
| Finance | `finance-store` derived views | `invoices`, `payments`, `settlements`, `expenses` |
| Permissions | `lib/permissions` in-memory | `permissions`, `roles`, memberships |
| AI safety | `lib/ai-safety` policy in code | Persist recommendations + settings; keep policy engine in code |
| Timelines | Embedded arrays on entities | `activity_events` |
| Migration Center | `lib/migration/*` connectors/parsers | `migration_jobs`, `import_batches`, … |

---

## 2. Naming bridge

| Current | Enterprise schema |
|---------|-------------------|
| `tenantId` | `company_id` |
| `Company` (tenant) | `companies` |
| `DirectoryCompany` | `parties` |
| `customerId` / `brokerId` | `customer_party_id` / `broker_party_id` |
| `CarrierDocument` | `documents` |
| `documentIds[]` on load | `document_links` |
| `timeline[]` | `activity_events` |
| `novaSummary` | `ai_insight_snapshots` or column cache |
| Finance “revenue records” | Query over loads/invoices — not a duplicate source table |

Keep TypeScript domain types as the **application model**; map to DB via repositories. Avoid leaking SQL shapes into every UI component.

---

## 3. Phased adoption

### Phase A — Design approval (current)

- Complete review of `docs/architecture/database/*`
- **No SQL applied**
- Freeze key decisions: tenancy key name, document model, AI approval states

### Phase B — Foundation DDL (after explicit approval)

1. `companies`, `users`, `company_memberships`, RBAC tables
2. RLS helpers + baseline policies
3. Soft-delete + `updated_at` triggers

### Phase C — Core ops

1. `parties`, `loads`, `load_stops`, `dispatch_assignments`
2. `drivers`, `trucks`, `trailers`, `asset_assignments`
3. Repository adapters behind existing service interfaces (`lib/services/*`)

### Phase D — Documents & AI

1. `documents`, versions, OCR, links, tags
2. `ai_recommendations`
3. Cut over from `carrier-document-store`

### Phase E — Finance & platform

1. Invoices, payments, settlements, expenses
2. Integrations, outbox, migration/import/export tables
3. Notifications, messages, activity, audit

### Phase F — Scale hardening

1. Measure
2. Partition/archive per [80-performance-scale.md](./80-performance-scale.md)
3. External search if needed

---

## 4. Compatibility strategy

| Technique | Use |
|-----------|-----|
| Anti-corruption layer | `lib/services/*` keep method signatures; swap mock → Postgres |
| Dual-read (short) | Only if cutover risk demands; time-boxed |
| Seed → fixtures | Convert demo seeds to SQL seeds for staging |
| Feature flags | Per-company “postgres_loads” style flags during rollout |

**Do not** rewrite the entire Next.js app to “fit” the database. The database absorbs the domain; UI evolves gradually.

---

## 5. Data migration notes (future)

When moving demo/real imports:

1. Create `companies` row; map old `tenantId` → `company_id`
2. Import parties before loads
3. Import assets/drivers before assignments
4. Loads → stops → documents → finance
5. Rebuild activity from legacy timeline arrays once
6. Record everything in `migration_jobs` / `import_batches`

AI must not auto-approve imported financial/compliance states — set `pending` / `needs_review` where uncertain.

---

## 6. Gap summary

| Gap | Severity | Notes |
|-----|----------|-------|
| No real Postgres schema | High | Expected; this design closes it |
| `tenantId` vs `company_id` | Medium | Mechanical rename at boundary |
| Embedded arrays as source of truth | Medium | Normalize timelines/docs/versions |
| Duplicate finance projections | Low | Replace with queries |
| Polymorphic docs already conceptual | Low | Aligns well with target |
| Circular load↔invoice ids | Low | Resolve ownership as designed |
| Tracking volume | Future | Partition/TTL table reserved |

---

## 7. Explicit non-actions (now)

- No SQL migration files created in this design pass
- No Supabase project tables applied
- No git commit required for documentation

**SQL migrations not yet generated — design approval first.**

→ [91-er-diagrams.md](./91-er-diagrams.md)
