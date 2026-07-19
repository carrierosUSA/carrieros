# Transpo.ai Enterprise Database

**Status:** Design documentation only — **SQL migrations not yet generated — design approval first**
**Engine:** PostgreSQL (Supabase)
**Governance:** [`/constitution`](../../../constitution/INDEX.md) — Master Constitution Version 1.0
**Parent architecture:** [`../00-README.md`](../00-README.md) · summary pointer [`../04-database.md`](../04-database.md)
**IAM companion (AuthN/AuthZ design):** [`../iam/00-README.md`](../iam/00-README.md) — identity tables here; sessions, roles product rules, audit events, and API enforcement there

---

## Critical notice

| Item | Status |
|------|--------|
| Schema design (this folder) | **In review** |
| SQL migration files | **Not generated** |
| Tables applied to any database | **None** |
| Illustrative DDL in docs | Labeled **NOT APPLIED — documentation only** |

Do not create or apply migrations until this design is explicitly approved. Prefer a stable, normalized foundation over rushed tables.

---

## Reading order

| # | Document | Contents |
|---|----------|----------|
| A | [00-domain-analysis.md](./00-domain-analysis.md) | Trucking domain, bounded contexts, tenancy, scale assumptions |
| B | [01-principles.md](./01-principles.md) | Normalization, soft delete, audit, RLS, naming |
| C | [02-cross-cutting.md](./02-cross-cutting.md) | Company isolation, RBAC, activity/comments/attachments/audit/AI, documents, outbox |
| D | Table catalog | See below |
| E | [91-er-diagrams.md](./91-er-diagrams.md) | Mermaid ER diagrams by domain |
| F | [80-performance-scale.md](./80-performance-scale.md) | Indexes, partitioning tiers, archival, RLS performance |
| G | [81-security-rls.md](./81-security-rls.md) | RLS concepts, least privilege, PII |
| H | [90-migration-from-current.md](./90-migration-from-current.md) | Evolution from in-memory/`lib` stores |
| I | [optimization/](./optimization/README.md) | **Optimization pack** — assessment, indexes, RLS, standard fields, backup/DR, future-apply SQL stubs (**NOT APPLIED**) |

### Table catalog (D)

| File | Area |
|------|------|
| [10-identity-tenancy.md](./10-identity-tenancy.md) | Companies, users, roles, permissions ([IAM pack](../iam/00-README.md)) |
| [20-fleet.md](./20-fleet.md) | Drivers, trucks, trailers + sub-entities |
| [30-operations.md](./30-operations.md) | Loads, stops, dispatch, customers, brokers |
| [40-finance.md](./40-finance.md) | Invoices, settlements, payments, expenses, billing, subscriptions |
| [50-documents-ai.md](./50-documents-ai.md) | Documents, OCR, AI recommendations, search |
| [60-comms-audit.md](./60-comms-audit.md) | Notifications, messages, audit, activity, comments |
| [70-platform.md](./70-platform.md) | Settings, integrations, migration, imports, exports, reports |

---

## Key design decisions (summary)

1. **Tenancy** — Every business row carries `company_id` (maps from today’s `tenantId`). Supabase RLS enforces isolation; application code never trusts client-supplied tenant alone.
2. **Documents** — One polymorphic `documents` model + versions, OCR, tags, links — not per-entity document silos.
3. **Cross-cutting** — Unified `activity_events`, `comments`, `attachments`, `audit_logs`, `ai_recommendations` via `(entity_type, entity_id)`.
4. **AI** — Recommendations store confidence + approval state. AI never auto-approves critical actions (Constitution).
5. **Scale** — Normalized schema first; partition/archive only at measured T3/T4 (see [80-performance-scale.md](./80-performance-scale.md)).

---

## Constitution alignment

- AI MAY: OCR, extract, summarize, recommend, prepare drafts.
- AI MUST NEVER: approve payroll, payments, dispatch, compliance, financial, legal, or safety decisions.
- Humans remain responsible; approval state is first-class data.
- Migration Center requirements live in Master Constitution; schema supports import/export/audit of migrations ([70-platform.md](./70-platform.md)).

---

## File tree

```text
docs/architecture/database/
├── README.md                 ← you are here
├── 00-domain-analysis.md
├── 01-principles.md
├── 02-cross-cutting.md
├── 10-identity-tenancy.md
├── 20-fleet.md
├── 30-operations.md
├── 40-finance.md
├── 50-documents-ai.md
├── 60-comms-audit.md
├── 70-platform.md
├── 80-performance-scale.md
├── 81-security-rls.md
├── 90-migration-from-current.md
├── 91-er-diagrams.md
└── optimization/             ← assessment + recommended indexes/RLS/SQL stubs (NOT APPLIED)
```

Related (outside this folder):

```text
docs/architecture/04-database.md       ← short pointer / superseding summary
docs/architecture/00-README.md         ← enterprise architecture index
docs/architecture/iam/00-README.md     ← Enterprise IAM (AuthN/AuthZ) — docs only
docs/architecture/iam/12-data-model.md ← IAM tables cross-ref (users, sessions, roles, …)
constitution/INDEX.md                  ← governance precedence
```
