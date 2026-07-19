# 01 — System Overview

## Purpose

Define system context, bounded contexts, tenancy, and primary request flows for Transpo.ai. Target design evolves the current Next.js monolith.

**Governance:** [Master Constitution v1.0](../../constitution/00-master-constitution.md) — AI assists; humans decide.

---

## C4 — Context

```mermaid
C4Context
  title Transpo.ai — System Context

  Person(owner, "Carrier Owner / Ops", "Runs the fleet")
  Person(dispatcher, "Dispatcher", "Assigns loads")
  Person(driver, "Driver", "Executes trips")
  Person(accountant, "Accountant", "Payroll / IFTA / AR")
  Person(broker, "Broker / Customer", "Optional portal access")
  Person(admin, "Platform Admin", "Transpo ops")

  System(transpo, "Transpo.ai", "Trucking operating platform + Alph assistant")

  System_Ext(eld, "ELD / Telematics", "Hours, location")
  System_Ext(email, "Email / SMS", "Transactional messaging")
  System_Ext(storage, "Object Storage", "Documents, OCR artifacts")
  System_Ext(payments, "Payments / Factoring", "Optional billing rails")
  System_Ext(tms, "Legacy TMS / Spreadsheets", "Migration sources")

  Rel(owner, transpo, "Manages operations")
  Rel(dispatcher, transpo, "Dispatch & docs")
  Rel(driver, transpo, "Driver App")
  Rel(accountant, transpo, "Finance / compliance")
  Rel(broker, transpo, "Limited portal")
  Rel(admin, transpo, "Support / health")

  Rel(transpo, eld, "Sync trips / HOS")
  Rel(transpo, email, "Send notifications")
  Rel(transpo, storage, "Store files")
  Rel(transpo, payments, "Invoices / settlements")
  Rel(transpo, tms, "Import via Migration Center")
```

---

## C4 — Containers (Phase 1)

```mermaid
C4Container
  title Transpo.ai — Containers (Phase 1 Modular Monolith)

  Person(user, "Authenticated User")

  Container_Boundary(app, "carrieros-app") {
    Container(web, "Next.js App Router", "React / RSC", "UI portals + BFF")
    Container(api, "Route Handlers / Server Actions", "TypeScript", "Application API")
    Container(domain, "Domain Modules", "lib/*", "DDD services & policies")
    Container(workers, "Job Runners", "in-process / managed", "OCR, import, email")
  }

  ContainerDb(db, "Postgres", "Primary OLTP")
  ContainerDb(files, "Object Storage", "Documents / blobs")
  ContainerDb(cache, "Cache (optional)", "Redis / CDN edge")

  Rel(user, web, "HTTPS")
  Rel(web, api, "Internal")
  Rel(api, domain, "Use cases")
  Rel(domain, db, "SQL")
  Rel(domain, files, "Signed URLs")
  Rel(workers, domain, "Process jobs")
  Rel(api, cache, "Hot reads")
```

**Do not overengineer:** Phase 1 is one deployable. Workers may share the same process until OCR/import volume warrants a separate worker fleet.

---

## Bounded contexts

| Context | Owns | Current `lib/` anchors |
|---------|------|------------------------|
| Identity & Access | Users, roles, sessions, permissions | `auth`, `permissions` |
| Organization | Companies, multi-entity, settings | `companies`, `settings` |
| Fleet | Trucks, trailers, maintenance | `fleet` |
| People Ops | Drivers, hiring, workforce | `drivers`, `workforce` |
| Dispatch | Loads, assignments, tracking | `dispatch`, `services/loads`, `tracking` |
| Commercial | Brokers, customers, rate cons | `brokers`, portal |
| Documents | Files, OCR, packets | `documents`, `services/documents` |
| Finance | AR/AP, payroll, fuel, IFTA | `finance`, `ifta` |
| Trust Network | Wallet, identity, reputation | `wallet`, `network` |
| Exchange | Marketplace listings/orders | `exchange` |
| Platform | App store, governance surfaces | `platform`, `constitution` helpers |
| AI Safety | Confirmations, automation, audit | `ai-safety`, `alph`, `alph-copilot` |
| Integration | ELD connectors, webhooks | `integrations`, `eld` |
| Migration | Import jobs, mapping, health | `migration` |
| Comms | Notifications, email/SMS | `notifications`, `communications` |

Cross-cutting: Audit Logs, Analytics, Billing (platform SaaS), Admin/Support.

---

## Tenancy model

**Primary key:** `company_id` (tenant) on every business row.

| Pattern | Use |
|---------|-----|
| Single-tenant company | Default carrier account |
| Multi-entity company group | Parent org + child companies (shared billing optional) |
| Platform tenant | Transpo admin / app store — separate privilege plane |
| External principals | Brokers/customers via portal memberships; drivers via driver accounts linked to company |

Rules:

- All queries **must** filter by tenant (enforced in repository layer).
- Cross-tenant data only via explicit share grants (Wallet / Network) or public tokens (e.g. track links).
- Soft isolation first; physical DB-per-tenant only if compliance contract requires it (rare).

---

## Primary request flows

### A. Interactive ops (SSR / RSC)

```
Browser → Next.js (App Router) → Server Component / Server Action
  → Application use-case (lib/services or domain)
  → Repository (tenant-scoped)
  → Postgres / object storage
  → Render or redirect
```

### B. Alph suggestion → human approval

```
User / Copilot → Alph parser/intent
  → ai-safety confidence + confirmation taxonomy
  → Draft / suggestion (never silent critical mutate)
  → Human confirm
  → Domain command + audit append
```

See [07-ai-ocr-documents.md](./07-ai-ocr-documents.md) and Master Constitution AI MAY / MUST NEVER.

### C. Document OCR

```
Upload → Object storage → Queue job
  → OCR extract → confidence score
  → Needs verification | High confidence draft
  → Human approve bind to load/driver/entity
  → Audit
```

### D. Migration import

```
Source file/API → Migration Center mapping preview
  → Human confirm mapping
  → Chunked import jobs
  → Validation report + health score
  → Commit under tenant
```

### E. External webhook / ELD sync

```
Provider → Signed webhook endpoint
  → Idempotent ingest
  → Domain update + outbox event
  → Notify interested UIs
```

---

## Module dependency (readable)

```mermaid
flowchart TB
  subgraph portals [Portals]
    Ops[Ops Web]
    Driver[Driver App]
    Portal[Broker/Customer Portal]
    Platform[Platform / Governance]
  end

  subgraph core [Core Domains]
    IAM[Identity]
    Org[Organization]
    Fleet[Fleet]
    Drivers[Drivers]
    Loads[Loads/Dispatch]
    Docs[Documents]
    Fin[Finance]
  end

  subgraph trust [Trust Surfaces]
    Wallet[Wallet]
    Network[Network]
    Ex[Exchange]
  end

  subgraph platform_svc [Platform Services]
    Alph[Alph + AI Safety]
    Int[Integrations]
    Mig[Migration]
    Notif[Notifications]
    Audit[Audit]
  end

  Ops --> Loads
  Ops --> Fleet
  Ops --> Drivers
  Ops --> Docs
  Ops --> Fin
  Driver --> Loads
  Driver --> Docs
  Portal --> Loads
  Platform --> Alph

  Loads --> Fleet
  Loads --> Drivers
  Loads --> Docs
  Fin --> Loads
  Alph --> Loads
  Alph --> Docs
  Int --> Loads
  Mig --> Org
  Mig --> Fleet
  Mig --> Drivers
  Mig --> Loads
  Wallet --> Org
  Network --> Wallet
  Ex --> Org
  Notif --> IAM
  Audit --> Alph
```

Dependency rule: **outer portals depend inward**; domains must not import UI. Alph depends on domain commands through gated adapters — never bypass AuthZ.

---

## Environments

| Env | Purpose |
|-----|---------|
| Local | Dev monolith + local Postgres/storage mocks |
| Staging | Full stack, synthetic tenants |
| Production | Multi-AZ DB, WAF, secrets manager |

Feature flags (`lib/admin/feature-flags` today) gate risky surfaces; never gate Constitution safety checks.

---

## Success criteria for the overview

- New features name their bounded context and tenant scope before coding.
- Cross-context writes go through explicit application services, not ad-hoc UI stores.
- Scale growth adds capacity (replicas, queues), not new product silos.
