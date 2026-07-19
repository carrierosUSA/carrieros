# Daily-use information architecture

**Goal:** Transpo.ai is an operating system. Each department is a **workspace**. Complete jobs inside one workspace. Primary sidebar shows daily operations; advanced surfaces stay under Settings.

**Constraints:** No routes deleted. No features removed. Navigation / labels / placement only. One Alph; Copilot role pages are advanced (Settings), not everyday chrome.

---

## Primary sidebar (10)

| # | Label | Route | Notes |
|---|--------|--------|--------|
| 1 | Home | `/dashboard` | Business health — today’s ops |
| 2 | Dispatch | `/loads` | Load board workspace |
| 3 | Drivers | `/drivers` | People / roster workspace |
| 4 | Fleet | `/fleet` | Trucks, trailers, maintenance |
| 5 | Documents | `/documents` | Document Center |
| 6 | Finance | `/finance` | Accounting & cash |
| 7 | Customers | `/customers` | Brokers / shippers / partners |
| 8 | Reports | `/analytics` | Report entry |
| 9 | Alph | `/` | Single AI entry (`?workspace=` context) |
| 10 | Settings | `/settings` | Company + advanced hub |

---

## Home (`/dashboard`)

Surfaces (no secondary tabs): Business Health, Today’s Revenue, Today’s Loads, Running Trucks, Drivers Working, Alerts, Tasks, Notifications, Upcoming Expirations, Quick Actions, Ask Alph.

Deeper charts and non-daily KPIs live in Reports.

---

## Workspace secondary tabs

### Dispatch (`/loads`)

| Tab | Target |
|-----|--------|
| Board | `/loads` |
| Active | `/loads?tab=in_transit` |
| Upcoming | `/loads?tab=assigned` |
| Completed | `/loads?tab=delivered` |
| Drivers | `/loads/view/drivers` (soft panel — stays in Dispatch) |
| Trucks | `/loads/view/trucks` |
| Trailers | `/loads/view/trailers` |
| Tracking | `/loads/tracking` |
| Messages | `/loads/view/messages` |
| Detention | `/loads/detention` |
| Timeline | `/loads/view/timeline` |
| Documents | `/loads/view/documents` |
| Notes | `/loads/view/notes` |
| Broker Communication | `/loads/view/broker-comms` |
| Driver Communication | `/loads/view/driver-comms` |
| Alph Suggestions | `/loads/view/alph` |

Preserved routes (not primary tabs): `/loads/planner`, `/loads/check-in`, load detail tracking.

### Drivers (`/drivers`)

| Tab | Target |
|-----|--------|
| Drivers | `/drivers` |
| Documents | `/drivers/view/documents` |
| Licenses | `/drivers/view/licenses` |
| Medical Cards | `/drivers/view/medical` |
| Payroll | `/drivers/view/payroll` → deep-links `/payroll` |
| Settlements | `/drivers/view/settlements` |
| Performance | `/drivers/view/performance` |
| Training | `/drivers/view/training` |
| Violations | `/drivers/view/violations` |
| Messages | `/drivers/view/messages` |
| History | `/drivers/view/history` |
| Timeline | `/drivers/view/timeline` |
| AI Insights | `/drivers/view/ai-insights` |

### Fleet (`/fleet`)

| Tab | Target |
|-----|--------|
| Trucks | `/fleet/trucks` |
| Trailers | `/fleet/trailers` |
| Fuel | `/fleet/fuel` |
| Maintenance | `/fleet/maintenance` |
| Repairs | `/fleet/maintenance?tab=repairs` |
| Tires | `/fleet/maintenance?tab=tires` |
| Inspections | `/fleet/view/inspections` |
| Breakdowns | `/fleet/view/breakdowns` |
| Registration | `/fleet/view/registration` |
| Insurance | `/fleet/view/insurance` |
| Permits | `/fleet/view/permits` |
| Service History | `/fleet/maintenance?tab=history` |
| Fleet Health | `/fleet/view/fleet-health` |
| AI Maintenance | `/fleet/view/ai-maintenance` |

### Documents (`/documents`)

Category / focus filters on Document Center (no leave):

Rate Confirmations · POD · Invoices · Fuel Receipts · Lumper · Repairs · Insurance · Registration · Permits · OCR Queue · Bulk Upload · Search · Review Queue (`/documents/requests`)

### Finance (`/finance`)

| Tab | Target |
|-----|--------|
| Overview | `/finance` |
| Invoices | `/finance?tab=invoices` |
| Payments | `/finance?tab=broker_payments` |
| Expenses | `/finance?tab=expenses` |
| Payroll | `/finance?tab=payroll` |
| Settlements | `/finance?tab=settlements` |
| Fuel Costs | `/finance/view/fuel-costs` |
| Maintenance Costs | `/finance/view/maintenance-costs` |
| IFTA | `/ifta` |
| Truck / Customer / Broker Profit | `/finance/view/*` soft panels |
| Exports | `/finance/view/exports` |

### Customers (`/customers`)

Brokers · Shippers · Customers · Receivers · Contacts · Credit · History · Notes · Communication — soft panels under `/customers/view/*` or existing `/brokers`, `/companies`, `/communications`.

### Reports (`/analytics`)

Revenue · Loads · Drivers · Fleet · Fuel · Maintenance · Payroll · Compliance · Profit · Custom Reports — soft panels under `/analytics/view/*` or `/compliance`.

### Settings (`/settings`)

Primary: Company · Users · Billing · Integrations · Security · Automation · Support

Advanced (More / hub chips): Marketplace · Exchange · Developer · API · Migration · Trust · Constitution · Governance · Audit · Admin · (+ ELD, Network, Wallet, Workforce, Alph Copilot, Platform, Setup, …)

---

## Alph

- Single everyday entry: **Alph** → `/` (floating orb + sidebar)
- Workspace context: `data-workspace` on shell + `/?workspace=<id>`
- Copilot role pages (`/alph/copilot/*`) remain under Settings More only
- Alph assists; humans decide

---

## Soft panels

`/…/view/[panel]` calm panels deep-link to working features (no 404). Dedicated product pages can replace panels later without changing IA labels.
