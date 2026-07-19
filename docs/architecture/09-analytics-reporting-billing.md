# 09 — Analytics, Reporting & Billing

## Purpose

Operational analytics, customer-facing reports, and SaaS billing — separated from OLTP hot paths.

**Current anchors:** `app/analytics`, `lib/executive/*`, finance exports, `lib/admin` health.

---

## Analytics

| Layer | Role |
|-------|------|
| **Operational metrics** | Dashboard cards: active loads, available drivers, revenue MTD |
| **Executive trends** | Time series, utilization (`lib/executive`) |
| **Product analytics** | Feature usage (privacy-aware, tenant aggregated) |
| **AI analytics** | Suggestion acceptance, verification rates (trust metrics) |

### Architecture

Phase 1:

- Aggregate queries with proper indexes
- Cached dashboard DTOs (TTL minutes)
- Heavy exports as async jobs (CSV/PDF)

Phase 2:

- Read replica for report queries
- Materialized views / rollup tables (`analytics_daily_fleet`, etc.)
- Optional warehouse only at T3+ if customers demand warehouse sync

**Do not overengineer:** no real-time streaming analytics platform until a measured need exists.

Constitution: analytics must not auto-approve financial or compliance outcomes — reports are informational / drafts.

---

## Reporting

| Report type | Generation |
|-------------|------------|
| Load / settlement packets | On demand + document pipeline |
| Payroll drafts | Prepared by AI/services; human approve |
| IFTA | `lib/ifta` calculations + accountant flow |
| Migration health | Migration Center report |
| Compliance expiry | Scheduled scan → notifications |

Exports go through AuthZ and audit. Watermark sensitive PDFs when shared externally.

---

## Billing (SaaS)

Platform billing is **orthogonal** to carrier freight invoices.

| Concept | Notes |
|---------|-------|
| Subscription | Plan per company (or org group) |
| Entitlements | Feature flags + seat/truck meters |
| Usage meters | Trucks, OCR pages, SMS, API calls |
| Invoices | Platform invoices to customer |
| Dunning | Access soft-limit; never delete tenant data on non-pay without policy |

Meter events: append-only `usage_events` aggregated nightly.
Driver App / Exchange may have separate SKUs later — keep billing module independent ([13](./13-module-catalog.md)).

**Do not overengineer:** start with Stripe (or similar) Checkout + Customer Portal; avoid custom tax engines early (use provider).

---

## Data boundaries

- Carrier **freight accounting** (`lib/finance`) ≠ **Transpo subscription billing**.
- Clear naming: `finance_*` vs `billing_*` / `subscriptions`.
- Wallet/Network trust scores are not payment rails unless explicitly productized later.
