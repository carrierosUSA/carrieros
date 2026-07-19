# 00 — Domain Analysis

**Purpose:** Ground the permanent data model in the complete trucking operating domain before any SQL is written.
**Status:** Documentation only — no tables applied.

---

## 1. Business reality

A carrier operates assets (trucks, trailers), people (drivers, office staff), and freight (loads) under regulatory, contractual, and financial constraints. Transpo.ai is the operating system for that work — not a classic TMS clone, and never the operator of the customer’s business ([Master Constitution](../../../constitution/00-master-constitution.md)).

### Primary actors

| Actor | Job | Data sensitivity |
|-------|-----|------------------|
| Owner / Ops manager | Fleet health, profit, risk | High |
| Dispatcher | Assign loads, track execution | High operational |
| Driver | Execute trip, capture docs, HOS-aware | PII + location |
| Accountant / back office | Invoice, settle, pay, IFTA | Financial PII |
| Safety / compliance | Licenses, medical, inspections | Regulated PII |
| Maintenance | PM, repairs, downtime | Operational |
| Broker / shipper (portal) | Limited load/doc visibility | Cross-org |
| Platform admin | Support, billing, health | Meta-tenant |

### Core operating loop

```text
Win freight → Document rate → Dispatch asset+driver → Execute stops
  → Capture POD/BOL/lumper → Invoice → Collect → Settle driver/owner
  → Maintain compliance & equipment → Report & improve
```

Alph (AI) assists at each step with OCR, summaries, recommendations, and drafts. **Humans approve** anything that commits money, safety, compliance, employment, or legal outcomes.

---

## 2. Bounded contexts

Prefer clear ownership directions. Avoid circular foreign keys between contexts; use IDs + optional join tables when two contexts both need a link.

| Context | Owns | Collaborates with |
|---------|------|-------------------|
| **Identity & Tenancy** | `companies`, users, memberships, roles, permissions | All (via `company_id`) |
| **Fleet** | Drivers, trucks, trailers, assignments, maintenance, fuel, asset docs metadata | Operations, Documents, Finance |
| **Operations** | Loads, stops, dispatch assignments, customers, brokers (CRM parties) | Fleet, Documents, Finance, Comms |
| **Finance** | Invoices, payments, settlements, expenses, subscriptions, billing | Operations, Fleet, Documents |
| **Documents & AI** | Unified documents, versions, OCR, AI recommendations, search fields | All entity owners |
| **Communications & Audit** | Notifications, messages, activity, comments, audit logs | All |
| **Platform** | Settings, integrations, migration jobs, imports/exports, reports | All |

Directory “companies” in today’s CRM (`DirectoryCompany`) are **parties within a tenant**, not tenants themselves. Naming in schema:

- `companies` = **tenant root** (carrier organization)
- `parties` (or `directory_companies`) = brokers, shippers, vendors, etc. scoped by `company_id`

---

## 3. Tenancy model

| Concept | Definition |
|---------|------------|
| Tenant | One carrier organization = one row in `companies` |
| Isolation key | `company_id` on every business table |
| Current code | `tenantId` on `TenantEntity` → evolves to `company_id` |
| Auth | Supabase Auth user ↔ `users` / `company_memberships` |
| Enforcement | RLS + server-side checks; never client-only |

**Multi-company users (future):** A person may belong to multiple companies via `company_memberships`. Session selects active `company_id`. RLS uses JWT claim / session setting for active company.

**Platform-level tables** (subscriptions catalog, global permission definitions, migration connector registry) may omit `company_id` when they are not customer data. Customer configuration and usage always retain `company_id`.

---

## 4. Entity map (conceptual)

```text
companies
  ├── company_memberships → users
  ├── roles / role_permissions → permissions
  ├── drivers ── licenses, medical, payroll lines, performance, safety events
  ├── trucks ── registration, insurance, fuel, maintenance, PM items
  ├── trailers ── registration, maintenance, PM
  ├── parties (customers, brokers, vendors…)
  ├── loads ── stops, dispatch_assignments
  ├── invoices / payments / settlements / expenses
  ├── documents ── versions, ocr_results, tags, links
  ├── ai_recommendations
  ├── notifications / messages
  ├── activity_events / comments / attachments / audit_logs
  ├── settings / integrations
  └── migration_jobs / import_batches / export_jobs / reports
```

Polymorphic “sidecar” tables attach to **any** business object without exploding per-entity tables.

---

## 5. Scale assumptions

Aligned with [`../00-README.md`](../00-README.md) tiers:

| Tier | Fleet | Loads / year (order) | Design posture |
|------|-------|----------------------|----------------|
| T0 | 1–10 | thousands | Single Postgres, simple indexes |
| T1 | 10–100 | tens of thousands | Same + background jobs |
| T2 | 100–1,000 | hundreds of thousands | Hot indexes, optional replicas |
| T3 | 1,000–10,000 | millions | Partition candidates: loads, activity, audit, GPS |
| T4 | 10,000–100,000+ | tens of millions | Partition + archive; sharding only if measured |

**Assumptions for this design:**

- Peak: **100,000+ trucks**, **millions of loads**, **millions of documents**, high volume of AI/OCR rows.
- Write-heavy: tracking pings, activity, audit, notifications (candidates for partition/TTL).
- Read-heavy: dispatch boards, document search, finance aging.
- Documents and media live in **object storage**; Postgres stores metadata + search/OCR extracts.

**Do not** introduce sharding, multi-region write complexity, or microservice DBs in Phase 1.

---

## 6. Non-functional requirements

| Concern | Requirement |
|---------|-------------|
| Consistency | Strong for money, assignments, approvals; eventual OK for analytics projections |
| Soft delete | Business tables support restore + audit |
| Auditability | Who changed what, when; AI recommendations immutable after decision |
| Security | RLS by company; PII minimized; least privilege roles |
| Maintainability | Normalized, expandable enums via lookup or constrained text; avoid god JSON blobs as source of truth |
| API readiness | Stable UUIDs; `company_id` everywhere; outbox for future webhooks |

---

## 7. Explicit non-goals (schema)

- Rebuilding the app around a new ORM tomorrow
- Embedding binary files in Postgres
- AI auto-approval columns that bypass human gates
- Duplicate document tables per entity type
- Premature fact tables / warehouse schemas inside OLTP (reports may export or later use a warehouse)

---

## 8. Current codebase signal (light)

Observed today under `carrieros-app/lib/`:

- Tenancy: `TenantEntity.tenantId`, demo `DEMO_TENANT_ID`
- Domains: loads, drivers, fleet, finance stores, documents, permissions, AI safety, migration, notifications
- Many **in-memory / seed stores** — not Postgres yet
- Document model already trending polymorphic (`CarrierDocument` + links, versions, OCR fields)

See [90-migration-from-current.md](./90-migration-from-current.md) for the evolution path.

---

## Next

→ [01-principles.md](./01-principles.md)
