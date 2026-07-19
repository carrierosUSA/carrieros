# 30 — Operations (Loads, Stops, Dispatch, Customers, Brokers)

**Status:** Documentation only — no tables applied.
Maps from: `lib/types/load.ts`, `lib/types/broker.ts`, `lib/types/company.ts` (directory), customers/brokers data.

Standard columns: `id`, `company_id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `deleted_by`.

---

## parties

| Aspect | Definition |
|--------|------------|
| **Purpose** | CRM directory within a tenant — brokers, shippers, receivers, vendors, etc. |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` → `companies` |
| **Relationships** | contacts, locations; referenced by loads, expenses, maintenance vendors |
| **Indexes** | `(company_id, type, status)`; `(company_id, name)`; `(company_id, mc_number)` |
| **Constraints** | `type` matches directory types (`broker`,`shipper`,`receiver`,`fuel_vendor`, …); `status` in (`active`,`inactive`) |
| **Validation** | — |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `name`, `type`, `status`, `mc_number`, `dot_number`, `scac`, `phone`, `email`, `website`, `payment_terms`, `payment_risk`, `notes`.

**Why not separate customers/brokers tables?** Shared shape; specialize with `type` + optional extension tables if needed. Current `DirectoryCompany` / brokers / customers consolidate here.

**Naming:** Avoid calling these `companies` — that name is reserved for the tenant root.

---

## party_contacts

| Aspect | Definition |
|--------|------------|
| **Purpose** | Contacts at a party |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `party_id` → `parties` |
| **Indexes** | `(company_id, party_id)` |
| **Constraints** | `role` in (`dispatcher`,`shipping`,`receiving`,`accounting`,`claims`,`safety`,`manager`,`other`) |
| **Soft delete / audit / tenancy** | full standard |

---

## party_locations

| Aspect | Definition |
|--------|------------|
| **Purpose** | Ship-from / ship-to / HQ locations |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `party_id` → `parties` |
| **Indexes** | `(company_id, party_id)`; `(company_id, state, city)` |
| **Constraints** | `kind` in (`headquarters`,`pickup`,`delivery`,`warehouse`,`other`) |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `name`, `street`, `city`, `state`, `postal_code`, `country`, `lat`, `lng`, `hours`, `notes`.

---

## loads

| Aspect | Definition |
|--------|------------|
| **Purpose** | Freight movement — central operations aggregate |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `customer_party_id` → `parties`; `broker_party_id` → `parties` nullable; optional current `driver_id`, `truck_id`, `trailer_id` (caches — assignments authoritative) |
| **Relationships** | 1 → many `load_stops`; dispatch_assignments; documents via links; invoice via finance |
| **Indexes** | `(company_id, status, pickup_at)`; `(company_id, reference)` unique where active; `(company_id, driver_id, status)`; `(company_id, broker_party_id)`; `(company_id, delivery_at)` |
| **Constraints** | `status` in (`pending`,`dispatched`,`picked_up`,`in_transit`,`delivered`,`invoiced`,`cancelled`); `rate` ≥ 0; `miles` ≥ 0 |
| **Validation** | reference unique per company; status transitions enforced in domain service |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `reference`, `load_number`, `broker_load_id`, `po_number`, `status`, `equipment_type`, `commodity`, `weight`, `pieces`, `temperature`, `rate`, `currency_code`, `miles`, `pickup_at`, `delivery_at`, `payment_terms`, `notes`, `compliance_status`, `tracking_token`, `tracking_enabled`.

**Ownership vs invoice:** `invoices.load_id` is the FK owner. Optional `loads.current_invoice_id` is a **non-FK cache** or soft reference updated by app to avoid circular FKs.

**Scale:** Partition candidate at T3+ by `created_at` or `pickup_at` — see [80-performance-scale.md](./80-performance-scale.md).

---

## load_stops

| Aspect | Definition |
|--------|------------|
| **Purpose** | Ordered pickup/delivery/other stops (replaces only origin/destination embeds) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `load_id` → `loads`; optional `party_id`, `party_location_id` |
| **Relationships** | belongs to load |
| **Indexes** | unique `(load_id, sequence)` where active; `(company_id, load_id)` |
| **Constraints** | `stop_type` in (`pickup`,`delivery`,`relay`,`other`); `appointment_type` in (`apt`,`fcfs`,`none`); `sequence` ≥ 1 |
| **Validation** | at least one pickup and one delivery per active load (domain) |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `sequence`, `stop_type`, `name`, `street`, `city`, `state`, `postal_code`, `scheduled_at`, `arrived_at`, `departed_at`, `contact_name`, `phone`, `email`, `notes`.

---

## dispatch_assignments

| Aspect | Definition |
|--------|------------|
| **Purpose** | Explicit dispatch decision binding load to driver/truck/trailer |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `load_id` → `loads`; `driver_id`, `truck_id`, `trailer_id` |
| **Relationships** | may create/update `asset_assignments`; AI suggestion links to `ai_recommendations` |
| **Indexes** | `(company_id, load_id, status)`; `(company_id, driver_id, status)` |
| **Constraints** | `status` in (`proposed`,`confirmed`,`active`,`completed`,`cancelled`) |
| **Validation** | `confirmed` / `active` require human approval path when originating from AI |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `assigned_at`, `confirmed_at`, `confirmed_by`, `source` (`manual`,`ai_assisted`), `ai_recommendation_id` nullable.

---

## load_status_history

| Aspect | Definition |
|--------|------------|
| **Purpose** | Append-only status transitions for loads |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `load_id` |
| **Indexes** | `(company_id, load_id, occurred_at)` |
| **Constraints** | `to_status` required |
| **Soft delete** | generally immutable; soft delete rare |
| **Audit / tenancy** | `created_at`, `created_by`, `company_id`; `updated_*` optional |

Also mirrored into `activity_events` for UX if desired.

---

## customers / brokers (views or aliases)

No separate physical tables required if `parties` covers them.

| Logical | Filter |
|---------|--------|
| Customers | `parties.type in ('shipper','receiver', …)` used as bill-to / freight customer |
| Brokers | `parties.type = 'broker'` |

Optional SQL views `v_customers`, `v_brokers` for clarity — documentation only until migrations approved.

---

## tracking_positions (optional high-churn)

| Aspect | Definition |
|--------|------------|
| **Purpose** | GPS/telemetry points for loads/drivers/trucks |
| **Primary key** | `id` uuid **or** bigserial within partition |
| **Foreign keys** | `company_id`; optional `load_id`, `driver_id`, `truck_id` |
| **Indexes** | `(company_id, truck_id, recorded_at DESC)`; `(company_id, load_id, recorded_at DESC)` |
| **Constraints** | lat/lng ranges |
| **Soft delete** | TTL / partition drop preferred over soft delete |
| **Audit columns** | `recorded_at`, `created_at`; skip `updated_by` |
| **Tenancy** | `company_id` required |

**Scale:** First partition/TTL candidate. Not required for Phase 1 MVP schema approval, but designed in.

→ [40-finance.md](./40-finance.md)
