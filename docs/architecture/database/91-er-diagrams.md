# 91 — ER Diagrams

**Status:** Documentation only — diagrams describe the target model; no tables applied.
Keep diagrams readable; details live in catalog files `10`–`70`.

---

## Identity & tenancy

```mermaid
erDiagram
  companies ||--o{ company_memberships : has
  users ||--o{ company_memberships : joins
  company_memberships ||--o{ membership_roles : has
  roles ||--o{ membership_roles : granted
  roles ||--o{ role_permissions : has
  permissions ||--o{ role_permissions : grants
  companies ||--o{ roles : "custom roles"
  companies ||--o{ company_invites : invites

  companies {
    uuid id PK
    text name
    text status
  }
  users {
    uuid id PK
    text email
  }
  company_memberships {
    uuid id PK
    uuid company_id FK
    uuid user_id FK
  }
  roles {
    uuid id PK
    uuid company_id FK
    text code
  }
  permissions {
    text id PK
    text code
  }
```

---

## Fleet

```mermaid
erDiagram
  companies ||--o{ drivers : owns
  companies ||--o{ trucks : owns
  companies ||--o{ trailers : owns
  drivers ||--o{ driver_licenses : has
  drivers ||--o{ driver_medical_certificates : has
  drivers ||--o{ driver_safety_events : has
  drivers ||--o{ asset_assignments : assigned
  trucks ||--o{ asset_assignments : assigned
  trailers ||--o{ asset_assignments : assigned
  trucks ||--o{ fuel_records : burns
  trucks ||--o{ maintenance_orders : serviced
  trailers ||--o{ maintenance_orders : serviced
  trucks ||--o{ pm_items : tracks
  trailers ||--o{ pm_items : tracks
  trucks ||--o{ asset_compliance_records : compliance
  trailers ||--o{ asset_compliance_records : compliance

  drivers {
    uuid id PK
    uuid company_id FK
    text status
  }
  trucks {
    uuid id PK
    uuid company_id FK
    text unit_number
  }
  trailers {
    uuid id PK
    uuid company_id FK
    text unit_number
  }
  asset_assignments {
    uuid id PK
    uuid driver_id FK
    uuid truck_id FK
    uuid trailer_id FK
  }
```

---

## Operations

```mermaid
erDiagram
  companies ||--o{ parties : directory
  companies ||--o{ loads : owns
  parties ||--o{ party_contacts : has
  parties ||--o{ party_locations : has
  parties ||--o{ loads : "customer/broker"
  loads ||--o{ load_stops : has
  loads ||--o{ dispatch_assignments : dispatched
  drivers ||--o{ dispatch_assignments : drives
  trucks ||--o{ dispatch_assignments : hauls
  loads ||--o{ load_status_history : history

  parties {
    uuid id PK
    uuid company_id FK
    text type
    text name
  }
  loads {
    uuid id PK
    uuid company_id FK
    uuid customer_party_id FK
    uuid broker_party_id FK
    text status
    text reference
  }
  load_stops {
    uuid id PK
    uuid load_id FK
    int sequence
    text stop_type
  }
  dispatch_assignments {
    uuid id PK
    uuid load_id FK
    uuid driver_id FK
    uuid truck_id FK
    text status
  }
```

---

## Finance

```mermaid
erDiagram
  companies ||--o{ invoices : issues
  loads ||--o{ invoices : billed
  parties ||--o{ invoices : "bill to"
  invoices ||--o{ invoice_line_items : lines
  companies ||--o{ payments : receives
  payments ||--o{ payment_allocations : applies
  invoices ||--o{ payment_allocations : allocated
  companies ||--o{ settlements : pays
  drivers ||--o{ settlements : earns
  settlements ||--o{ settlement_lines : lines
  companies ||--o{ expenses : records
  companies ||--o{ company_subscriptions : subscribes
  subscription_plans ||--o{ company_subscriptions : plan
  company_subscriptions ||--o{ billing_invoices : saas

  invoices {
    uuid id PK
    uuid company_id FK
    uuid load_id FK
    text status
    numeric total
  }
  payments {
    uuid id PK
    uuid company_id FK
    numeric amount
  }
  settlements {
    uuid id PK
    uuid company_id FK
    uuid driver_id FK
    text status
  }
```

---

## Documents & AI

```mermaid
erDiagram
  companies ||--o{ documents : owns
  documents ||--o{ document_versions : versions
  documents ||--o{ document_ocr_results : ocr
  document_ocr_results ||--o{ document_ocr_fields : fields
  documents ||--o{ document_tags : tagged
  documents ||--o{ document_links : links
  companies ||--o{ ai_recommendations : receives
  documents ||--o{ ai_recommendations : "may target"

  documents {
    uuid id PK
    uuid company_id FK
    text document_type
    text status
  }
  document_versions {
    uuid id PK
    uuid document_id FK
    int version_number
    text storage_key
  }
  document_ocr_results {
    uuid id PK
    uuid document_id FK
    text status
  }
  document_links {
    uuid id PK
    uuid document_id FK
    text entity_type
    uuid entity_id
  }
  ai_recommendations {
    uuid id PK
    uuid company_id FK
    text confidence
    text approval_state
  }
```

---

## Cross-cutting (activity, comments, audit)

```mermaid
erDiagram
  companies ||--o{ activity_events : timeline
  companies ||--o{ comments : notes
  companies ||--o{ attachments : files
  companies ||--o{ audit_logs : audits
  companies ||--o{ notifications : alerts
  message_threads ||--o{ messages : contains
  companies ||--o{ message_threads : owns

  activity_events {
    uuid id PK
    uuid company_id FK
    text entity_type
    uuid entity_id
    timestamptz occurred_at
  }
  comments {
    uuid id PK
    uuid company_id FK
    text entity_type
    uuid entity_id
  }
  audit_logs {
    uuid id PK
    uuid company_id FK
    text action
    text entity_type
    uuid entity_id
  }
```

---

## Platform & migration

```mermaid
erDiagram
  companies ||--o{ company_settings : configures
  companies ||--o{ integrations : connects
  integration_providers ||--o{ integrations : type
  integrations ||--o{ integration_sync_runs : runs
  companies ||--o{ integration_outbox : emits
  companies ||--o{ migration_jobs : migrates
  migration_jobs ||--o{ migration_history : history
  companies ||--o{ import_batches : imports
  import_batches ||--o{ import_rows : rows
  companies ||--o{ export_jobs : exports
  companies ||--o{ reports : defines
  reports ||--o{ report_runs : runs

  migration_jobs {
    uuid id PK
    uuid company_id FK
    text status
  }
  import_batches {
    uuid id PK
    uuid company_id FK
    text entity_type
    text status
  }
```

---

## Ownership direction reminder

```text
companies
  └── (all tenant tables via company_id)

loads ──► load_stops, dispatch_assignments
invoices ──► load_id (owner of load↔invoice link)
documents ──► versions, ocr, tags, links ──► (entity_type, entity_id)
asset_assignments ──► drivers, trucks, trailers  (no circular required FKs)
```

Return to [README.md](./README.md).
