# 40 — Finance (Invoices, Settlements, Payments, Expenses, Billing)

**Status:** Documentation only — no tables applied.
Maps from: `lib/types/finance.ts`, `lib/data/finance-store.ts`, wallet/billing surfaces.

Standard columns: `id`, `company_id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `deleted_by`.

**Constitution:** AI may prepare invoices/settlements/payroll calculations; **humans approve**. Store drafts and recommendations with approval state — never silent auto-approval of money movement.

---

## invoices

| Aspect | Definition |
|--------|------------|
| **Purpose** | Accounts receivable invoice |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `load_id` → `loads` nullable; `bill_to_party_id` → `parties`; optional `broker_party_id` |
| **Relationships** | 1 → `invoice_line_items`; ← `payment_allocations` |
| **Indexes** | unique `(company_id, invoice_number)` where active; `(company_id, status, due_at)`; `(company_id, load_id)` |
| **Constraints** | `status` in (`draft`,`ready`,`sent`,`partial`,`paid`,`void`,`overdue`); `total` ≥ 0 |
| **Validation** | draft→sent requires human or explicit permission; AI sets draft only |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `invoice_number`, `status`, `subtotal`, `tax`, `total`, `currency_code`, `issued_at`, `due_at`, `paid_at`, `notes`, `ai_recommendation_id` nullable.

---

## invoice_line_items

| Aspect | Definition |
|--------|------------|
| **Purpose** | Invoice lines |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `invoice_id` → `invoices` |
| **Indexes** | `(company_id, invoice_id, sequence)` |
| **Constraints** | `quantity` > 0; `amount` = quantity * unit_price (app or generated column) |
| **Soft delete / audit / tenancy** | full standard |

---

## payments

| Aspect | Definition |
|--------|------------|
| **Purpose** | Money received (AR) or recorded inbound payment |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `payer_party_id` → `parties` nullable |
| **Relationships** | → `payment_allocations` |
| **Indexes** | `(company_id, received_at)`; `(company_id, status)` |
| **Constraints** | `status` in (`pending`,`cleared`,`failed`,`void`); `amount` > 0 |
| **Validation** | posting/clearing is human-approved for critical flows |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `method`, `reference`, `amount`, `currency_code`, `received_at`, `external_id`.

---

## payment_allocations

| Aspect | Definition |
|--------|------------|
| **Purpose** | Apply payment to invoice(s) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `payment_id` → `payments`, `invoice_id` → `invoices` |
| **Indexes** | `(company_id, invoice_id)`; `(company_id, payment_id)` |
| **Constraints** | `amount` > 0; sum allocations ≤ payment amount (domain) |
| **Soft delete / audit / tenancy** | full standard |

---

## settlements

| Aspect | Definition |
|--------|------------|
| **Purpose** | Driver / owner-operator settlement for a period or load set |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `driver_id` → `drivers` nullable; optional `owner_user_id` |
| **Relationships** | 1 → `settlement_lines`; optional link loads |
| **Indexes** | `(company_id, status, period_end)`; `(company_id, driver_id)` |
| **Constraints** | `status` in (`draft`,`pending_approval`,`approved`,`paid`,`void`); `period_start` ≤ `period_end` |
| **Validation** | `approved` / `paid` require human `approved_by`; AI may only create `draft` |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `settlement_number`, `gross`, `deductions`, `net`, `currency_code`, `approved_by`, `approved_at`, `paid_at`.

---

## settlement_lines

| Aspect | Definition |
|--------|------------|
| **Purpose** | Settlement line items (miles, detention, advances, deductions) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `settlement_id`; optional `load_id` |
| **Indexes** | `(company_id, settlement_id)` |
| **Constraints** | `line_type` constrained text |
| **Soft delete / audit / tenancy** | full standard |

---

## expenses

| Aspect | Definition |
|--------|------------|
| **Purpose** | Operating expenses (fuel, lumper, tolls, repairs, …) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; optional `load_id`, `truck_id`, `driver_id`, `party_id`, `document_id` |
| **Indexes** | `(company_id, incurred_at)`; `(company_id, category, status)` |
| **Constraints** | `status` in (`draft`,`submitted`,`approved`,`rejected`,`reimbursed`); `amount` ≥ 0 |
| **Validation** | approval human for reimbursement |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `category`, `description`, `amount`, `currency_code`, `incurred_at`, `approved_by`, `approved_at`.

---

## factoring_accounts (optional)

| Aspect | Definition |
|--------|------------|
| **Purpose** | Factoring relationship configuration |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `factor_party_id` → `parties` |
| **Indexes** | `(company_id)` |
| **Constraints** | `status` in (`active`,`inactive`) |
| **Soft delete / audit / tenancy** | full standard |

---

## subscription_plans (platform)

| Aspect | Definition |
|--------|------------|
| **Purpose** | Global Transpo.ai plan catalog |
| **Primary key** | `id` uuid |
| **Foreign keys** | none |
| **Indexes** | unique `code` |
| **Constraints** | `is_active` boolean |
| **Soft delete** | `is_active = false` preferred |
| **Audit columns** | `created_at`, `updated_at` |
| **Tenancy** | **No** `company_id` |

---

## company_subscriptions

| Aspect | Definition |
|--------|------------|
| **Purpose** | Company’s subscription to a plan |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id` → `companies`; `plan_id` → `subscription_plans` |
| **Indexes** | `(company_id, status)`; unique current subscription partial |
| **Constraints** | `status` in (`trialing`,`active`,`past_due`,`cancelled`) |
| **Soft delete / audit / tenancy** | full standard |

**Key columns:** `started_at`, `current_period_end`, `cancel_at`, `external_customer_id`, `external_subscription_id`.

---

## billing_invoices (platform SaaS billing)

| Aspect | Definition |
|--------|------------|
| **Purpose** | Bills Transpo.ai sends to the carrier (distinct from freight `invoices`) |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`; `subscription_id` → `company_subscriptions` |
| **Indexes** | `(company_id, status, due_at)` |
| **Constraints** | `status` in (`draft`,`open`,`paid`,`void`) |
| **Soft delete / audit / tenancy** | full standard |

**Naming:** Keep freight AR as `invoices`; SaaS as `billing_invoices` to avoid confusion.

---

## billing_payments

| Aspect | Definition |
|--------|------------|
| **Purpose** | Payments against SaaS billing invoices |
| **Primary key** | `id` uuid |
| **Foreign keys** | `company_id`, `billing_invoice_id` |
| **Indexes** | `(company_id, billing_invoice_id)` |
| **Constraints** | `amount` > 0 |
| **Soft delete / audit / tenancy** | full standard |

---

## Money integrity notes

- Store currency explicitly; do not silently coerce.
- Prefer allocating payments rather than overwriting invoice totals.
- Denormalized “revenue board” rows in today’s finance-store become **queries/views**, not duplicate tables.

→ [50-documents-ai.md](./50-documents-ai.md)
