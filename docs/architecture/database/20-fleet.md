# 20 — Fleet (Drivers, Trucks, Trailers)

**Status:** Documentation only — no tables applied.
Maps from: `lib/types/driver.ts`, `lib/types/fleet.ts`, fleet/driver stores.

Standard columns on all tables unless noted:
`id`, `company_id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `deleted_by`.

---

## drivers

| Aspect | Definition |
|--------|------------|
| **Purpose** | Driver as fleet person / workforce entity (not auth user) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` → `companies`; optional `user_id` → `users` |
| **Relationships** | 1 → licenses, medical, payroll lines, performance, safety, time-off; M ↔ trucks via assignments; ← loads |
| **Indexes** | `(company_id, status)`; unique `(company_id, employee_number)` where not null & active; `(company_id, email)` |
| **Constraints** | `status` in (`onboarding`,`active`,`inactive`,`terminated`); `operational_status` in (`available`,`on_load`,`off_duty`,`onboarding`) |
| **Validation** | phone/email format in app; hire_date ≤ today |
| **Soft delete** | yes |
| **Audit / tenancy** | full standard |

**Key columns:** `full_name`, `email`, `phone`, `photo_url`, `home_terminal`, `hire_date`, `termination_date`, `pay_type`, `pay_rate`, `currency_code`, `license_class` (denorm cache OK), `hours_remaining` (cache from ELD).

**Documents:** via unified `documents` + `document_links` (`entity_type=driver`), not a siloed driver_documents source of truth. Optional thin `driver_compliance_items` for due dates.

---

## driver_licenses

| Aspect | Definition |
|--------|------------|
| **Purpose** | CDL / license history |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` → `companies`; `driver_id` → `drivers` |
| **Relationships** | N licenses per driver (history); optional link `document_id` → `documents` |
| **Indexes** | `(company_id, driver_id)`; `(company_id, expires_at)` |
| **Constraints** | `status` in (`valid`,`expiring`,`expired`,`superseded`) |
| **Validation** | `expires_at` required; state code 2-letter |
| **Soft delete** | yes |
| **Audit / tenancy** | full standard |

**Key columns:** `class`, `number` (consider encryption/token for PII), `state`, `endorsements`, `restrictions`, `issued_at`, `expires_at`, `is_current`.

---

## driver_medical_certificates

| Aspect | Definition |
|--------|------------|
| **Purpose** | Medical card / physical |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `driver_id` → `drivers`; optional `document_id` |
| **Relationships** | N per driver over time |
| **Indexes** | `(company_id, driver_id)`; `(company_id, expires_at)` |
| **Constraints** | `status` in (`valid`,`expiring`,`expired`,`superseded`) |
| **Validation** | `expires_at` required |
| **Soft delete** | yes |
| **Audit / tenancy** | full standard |

**Key columns:** `card_number`, `examiner_name`, `expires_at`, `is_current`.

---

## driver_payroll_periods / driver_pay_lines

Prefer settlements in finance ([40-finance.md](./40-finance.md)). Lightweight:

### driver_pay_profiles

| Aspect | Definition |
|--------|------------|
| **Purpose** | Current pay configuration for a driver |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `driver_id` → `drivers` unique current |
| **Indexes** | unique `(driver_id)` where `deleted_at is null` and `is_current` |
| **Constraints** | `pay_type` in (`per_mile`,`hourly`,`percentage`,`salary`,`flat`) |
| **Soft delete / audit / tenancy** | full standard |

### driver_performance_snapshots

| Aspect | Definition |
|--------|------------|
| **Purpose** | Periodic performance metrics (rebuildable) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `driver_id` |
| **Indexes** | `(company_id, driver_id, period_start)` |
| **Constraints** | `period_start` < `period_end` |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `label`, `value_text`, `value_numeric`, `trend`, `period_start`, `period_end`.

---

## driver_safety_events

| Aspect | Definition |
|--------|------------|
| **Purpose** | Safety incidents / coaching events |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `driver_id`; optional `load_id`, `truck_id` |
| **Indexes** | `(company_id, driver_id, occurred_at)`; `(company_id, severity, status)` |
| **Constraints** | `severity` in (`low`,`medium`,`high`); `status` in (`open`,`resolved`) |
| **Soft delete / audit / tenancy** | full standard |

---

## driver_time_off

| Aspect | Definition |
|--------|------------|
| **Purpose** | Time-off requests |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `driver_id`; `reviewed_by` → `users` |
| **Indexes** | `(company_id, driver_id, starts_at)` |
| **Constraints** | `status` in (`pending`,`approved`,`denied`,`cancelled`); `starts_at` ≤ `ends_at` |
| **Validation** | Approval is human — AI may only recommend |
| **Soft delete / audit / tenancy** | full standard |

---

## trucks

| Aspect | Definition |
|--------|------------|
| **Purpose** | Power unit asset |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` → `companies` |
| **Relationships** | fuel, maintenance, PM, insurance/registration via documents + sub-tables; assignments |
| **Indexes** | unique `(company_id, unit_number)` where active; unique `(company_id, vin)` where active; `(company_id, status)` |
| **Constraints** | `status` in (`available`,`assigned`,`in_shop`,`out_of_service`,`sold`) |
| **Validation** | VIN length/charset in app |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `unit_number`, `make`, `model`, `year`, `vin`, `license_plate`, `license_state`, `mileage`, `engine_hours`, `mpg`, `idle_hours`, `telematics_provider`, `photo_url`.

**Current assignment:** do not require `driver_id` on truck; use `asset_assignments`.

---

## trailers

| Aspect | Definition |
|--------|------------|
| **Purpose** | Trailer asset |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` |
| **Relationships** | maintenance, PM, documents via links |
| **Indexes** | unique `(company_id, unit_number)` where active; `(company_id, status)` |
| **Constraints** | `trailer_type` in (`dry_van`,`reefer`,`flatbed`,`step_deck`,`tank`,`lowboy`,`other`); `status` in (`available`,`loaded`,`empty`,`in_yard`,`in_shop`,`out_of_service`) |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `unit_number`, `make`, `model`, `year`, `vin`, `license_plate`, `length_ft`, `capacity`.

---

## asset_assignments

| Aspect | Definition |
|--------|------------|
| **Purpose** | Time-bounded driver ↔ truck ↔ trailer pairing (breaks circular FKs) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `driver_id` → `drivers`; `truck_id` → `trucks`; `trailer_id` → `trailers` (nullable) |
| **Relationships** | optional `load_id` when assignment is load-specific |
| **Indexes** | `(company_id, driver_id, starts_at)`; `(company_id, truck_id, starts_at)`; partial unique current truck/driver |
| **Constraints** | `starts_at` ≤ `ends_at` or `ends_at` null; `assignment_type` in (`standing`,`load`,`temporary`) |
| **Validation** | no overlapping current assignments for same truck (app + exclusion constraint later) |
| **Soft delete / audit / tenancy** | full standard |

---

## fuel_records

| Aspect | Definition |
|--------|------------|
| **Purpose** | Fuel purchases / IFTA inputs |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `truck_id` → `trucks`; optional `driver_id`, `load_id`, `document_id`, `expense_id` |
| **Indexes** | `(company_id, truck_id, fueled_at)`; `(company_id, fueled_at)` |
| **Constraints** | `gallons` > 0; `amount` ≥ 0; `fuel_type` constrained |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `fueled_at`, `gallons`, `price_per_gallon`, `amount`, `currency_code`, `jurisdiction_state`, `vendor_name`, `odometer`.

---

## maintenance_orders

| Aspect | Definition |
|--------|------------|
| **Purpose** | Maintenance / repair work orders |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `truck_id` and/or `trailer_id`; optional `vendor_party_id` → `parties` |
| **Indexes** | `(company_id, status, scheduled_at)`; `(company_id, truck_id)` |
| **Constraints** | `status` in (`scheduled`,`in_progress`,`completed`,`cancelled`); exactly one of truck/trailer preferred (CHECK) |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `title`, `description`, `priority`, `cost`, `completed_at`, `odometer_at_service`.

---

## pm_schedules / pm_items

### pm_items

| Aspect | Definition |
|--------|------------|
| **Purpose** | Preventive maintenance due tracking |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `truck_id` or `trailer_id` |
| **Indexes** | `(company_id, status)`; `(company_id, due_date)`; `(company_id, due_mileage)` |
| **Constraints** | `status` in (`ok`,`due_soon`,`overdue`,`scheduled`) |
| **Soft delete / audit / tenancy** | full standard |

---

## truck_insurance_policies / asset_registrations

Prefer unified documents for files; keep structured compliance rows:

### asset_compliance_records

| Aspect | Definition |
|--------|------------|
| **Purpose** | Registration, insurance, inspection due dates for truck/trailer |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `truck_id` or `trailer_id`; optional `document_id` |
| **Indexes** | `(company_id, record_type, expires_at)` |
| **Constraints** | `record_type` in (`registration`,`insurance`,`annual_inspection`,`permit`,`other`) |
| **Soft delete / audit / tenancy** | full standard |

---

## Document note for fleet

Do **not** create permanent siloed `truck_documents` / `trailer_documents` as source of truth. Current TS types migrate to `documents` + `document_links` + optional `asset_compliance_records` for expiry dashboards.

→ [30-operations.md](./30-operations.md)
