# Daily-use information architecture

**Goal:** Transpo.ai is an operating system. Each department is a **workspace**. Complete jobs inside one workspace. Primary sidebar shows daily operations; platform-power tools live in **Advanced**.

**Constraints:** No routes deleted. No features removed. Navigation / labels / placement only. One Alph; Copilot role pages are Advanced (AI Agents), not everyday chrome.

---

## Primary sidebar (11)

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
| 10 | Advanced | `/advanced` | Platform-power tools hub |
| 11 | Settings | `/settings` | Company / user prefs |

Do not add more top-level items. Platform, Network, Wallet, Exchange, Partner Center, App Store, Workforce, and similar enterprise surfaces are **not** primary — they live under Advanced categories (findability chips + section cards).

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

### Advanced (`/advanced`)

One workspace with **findability chips** + **8 category sections** (secondary tabs use the same categories; overflow in More). Deep-links preserve every destination — no deleted routes.

| Category (secondary) | Covers | Key destinations |
|----------------------|--------|------------------|
| Automation | Workflows & recipes | `/workflows`, `/platform/automation`, soft panels |
| Marketplace & Exchange | Marketplace, Exchange, Partner Center, Network | `/marketplace`, `/exchange`, `/platform/partners`, `/network` |
| Integrations | ELD & partner sync | `/integrations`, `/integrations/eld`, soft panels |
| Migration Center | AI Migration | `/platform/migration`, import/export/bulk soft panels |
| Developer · API · SDK | Portal, API, SDK | `/platform/developers`, API keys, SDK/webhooks/sandbox soft panels |
| Security & Trust | Security, Audit, Trust Center | `/platform/security`, audit logs, `/advanced/view/trust-center`, `/network/trust`, `/wallet` |
| Administration & Governance | Governance, AI Policies, flags, system | `/platform/governance`, constitution, AI policy, feature flags, system management, `/admin` |
| Future Products & App Store | App Store, agents, roadmap | `/platform/apps`, extensions/plugins soft panels, `/alph/copilot` |

**Findability chips** (hub top): Automation · Marketplace · Exchange · Integrations · Migration Center · Developer · API · SDK · Security · Trust Center · Audit Logs · Administration · Governance · AI Policies · Feature Flags · System Management · Partner Center · App Store · Future Products.

Soft panels: `/advanced/view/[panel]` — calm panels that still link real destinations. Category ids (`automation`, `marketplace`, …) render category card grids.

### Settings (`/settings`)

Primary workspace tabs: Company · Users · Roles · Notifications · Billing · Security · Support

More (secondary): Advanced (cross-link) · Backup · API keys · Setup

Settings still hosts company prefs (API keys, backup, security, audit log viewer, light automation/integrations summaries). Full platform-power tools open from **Advanced**. Cross-link Settings ↔ Advanced where helpful.

---

## Alph

- Single everyday entry: **Alph** → `/` (floating orb + sidebar)
- Workspace context: `data-workspace` on shell + `/?workspace=<id>`
- Copilot role pages (`/alph/copilot/*`) remain under Advanced → Future Products & App Store → AI Agents
- Alph assists; humans decide

---

## Soft panels

`/…/view/[panel]` calm panels deep-link to working features (no 404). Dedicated product pages can replace panels later without changing IA labels.

---

## Relocated features (primary → Advanced)

| Feature | Was (conceptually) | Now |
|---------|--------------------|-----|
| Marketplace | Top-level / Settings dump | Advanced → Marketplace & Exchange |
| Exchange | Top-level | Advanced → Marketplace & Exchange (+ chip) |
| Partner Center | Buried / Platform only | Advanced → Marketplace & Exchange card + chip |
| Network / Wallet / Workforce | Top-level candidates | Advanced categories (Security/Admin/Marketplace) |
| Workflow Builder / Automation | Settings platform | Advanced → Automation |
| Integrations (full) | Settings / top-level | Advanced → Integrations |
| AI Migration Center | Platform | Advanced → Migration Center |
| Developer Portal / API / SDK | Platform | Advanced → Developer · API · SDK |
| App Store | Platform | Advanced → Future Products & App Store |
| Trust Center / Governance / Constitution / AI Policies | Platform / Settings | Advanced → Security & Trust / Administration |
| Audit Logs / Feature Flags / System Management | Admin / Settings | Advanced chips + Administration / Security |
| Alph Copilot role agents | Alph chrome | Advanced → Future → AI Agents |
