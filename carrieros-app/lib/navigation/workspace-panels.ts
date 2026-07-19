/**
 * Soft panels for workspace tabs that do not yet have a dedicated surface.
 * Keep the user inside the workspace; deep-link to working features (no 404).
 */

export type SoftPanelDef = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export type WorkspaceId =
  | "home"
  | "dispatch"
  | "drivers"
  | "fleet"
  | "documents"
  | "finance"
  | "customers"
  | "reports"
  | "alph"
  | "advanced"
  | "settings";

const DISPATCH_PANELS: SoftPanelDef[] = [
  {
    id: "drivers",
    title: "Drivers",
    subtitle: "See who is available without leaving Dispatch.",
    description:
      "Open the driver directory to check status and assign from the board. You stay in the Dispatch workspace.",
    primaryHref: "/drivers/directory",
    primaryLabel: "Open driver directory",
    secondaryHref: "/loads?tab=assigned",
    secondaryLabel: "Upcoming loads",
  },
  {
    id: "trucks",
    title: "Trucks",
    subtitle: "Equipment available for today’s freight.",
    description:
      "Review unit status, then return to the board to assign. Truck detail stays one click away.",
    primaryHref: "/fleet/trucks",
    primaryLabel: "Open trucks",
    secondaryHref: "/loads",
    secondaryLabel: "Back to board",
  },
  {
    id: "trailers",
    title: "Trailers",
    subtitle: "Match trailers to active and upcoming loads.",
    description:
      "Check trailer readiness, then assign from the load board.",
    primaryHref: "/fleet/trailers",
    primaryLabel: "Open trailers",
    secondaryHref: "/loads",
    secondaryLabel: "Back to board",
  },
  {
    id: "messages",
    title: "Messages",
    subtitle: "Dispatch messages and check-ins.",
    description:
      "Open Communications for broker and driver threads tied to loads. Alph can draft replies — you approve.",
    primaryHref: "/communications",
    primaryLabel: "Open messages",
    secondaryHref: "/loads?tab=in_transit",
    secondaryLabel: "Active loads",
  },
  {
    id: "timeline",
    title: "Timeline",
    subtitle: "What happened on today’s freight.",
    description:
      "Load timelines live on each load. Start from Active or Completed, then open Timeline on the load.",
    primaryHref: "/loads?tab=in_transit",
    primaryLabel: "Active loads",
    secondaryHref: "/loads?tab=delivered",
    secondaryLabel: "Completed",
  },
  {
    id: "documents",
    title: "Documents",
    subtitle: "Rate cons, PODs, and packets for Dispatch.",
    description:
      "Jump to Document Center filtered for freight docs, or open a load’s packet from the board.",
    primaryHref: "/documents?category=rate_confirmation",
    primaryLabel: "Rate confirmations",
    secondaryHref: "/documents/health",
    secondaryLabel: "Document health",
  },
  {
    id: "notes",
    title: "Notes",
    subtitle: "Dispatcher notes on loads.",
    description:
      "Notes are kept on each load. Open a load from the board to add or review notes — humans stay in control.",
    primaryHref: "/loads",
    primaryLabel: "Open board",
    secondaryHref: "/loads?tab=in_transit",
    secondaryLabel: "Active loads",
  },
  {
    id: "broker-comms",
    title: "Broker communication",
    subtitle: "Talk to brokers from Dispatch.",
    description:
      "Broker threads and rate discussions live in Communications. Open a load for load-specific context.",
    primaryHref: "/communications",
    primaryLabel: "Open broker threads",
    secondaryHref: "/brokers",
    secondaryLabel: "Broker directory",
  },
  {
    id: "driver-comms",
    title: "Driver communication",
    subtitle: "Check-ins and driver messages.",
    description:
      "Driver check-ins and messages are in Communications. Start from Active loads when you need load context.",
    primaryHref: "/communications",
    primaryLabel: "Open driver messages",
    secondaryHref: "/loads/check-in",
    secondaryLabel: "Check-in hub",
  },
  {
    id: "alph",
    title: "Alph suggestions",
    subtitle: "Alph assists — you decide.",
    description:
      "Ask Alph about coverage, late loads, or detention. Suggestions never auto-execute; you approve every action.",
    primaryHref: "/?workspace=dispatch",
    primaryLabel: "Ask Alph",
    secondaryHref: "/loads?tab=in_transit",
    secondaryLabel: "Active loads",
  },
];

const DRIVERS_PANELS: SoftPanelDef[] = [
  {
    id: "documents",
    title: "Driver documents",
    subtitle: "CDL, medical, and hiring packets.",
    description:
      "Open Compliance for expiring docs, or Document Center for driver files. Open a driver for their full packet.",
    primaryHref: "/compliance",
    primaryLabel: "Open compliance",
    secondaryHref: "/documents?category=driver_document",
    secondaryLabel: "Driver files",
  },
  {
    id: "licenses",
    title: "Licenses",
    subtitle: "CDL status and renewals.",
    description:
      "License detail lives on each driver. Use Compliance for fleet-wide expirations.",
    primaryHref: "/compliance",
    primaryLabel: "Expiring licenses",
    secondaryHref: "/drivers",
    secondaryLabel: "Driver roster",
  },
  {
    id: "medical",
    title: "Medical cards",
    subtitle: "DOT medical card tracking.",
    description:
      "Medical card status is on each driver profile. Compliance highlights what expires soon.",
    primaryHref: "/compliance",
    primaryLabel: "Medical expirations",
    secondaryHref: "/drivers",
    secondaryLabel: "Driver roster",
  },
  {
    id: "payroll",
    title: "Payroll",
    subtitle: "Driver pay without leaving Drivers.",
    description:
      "Open Driver Pay to review settlements. You approve every payout — Alph only assists.",
    primaryHref: "/payroll",
    primaryLabel: "Open driver pay",
    secondaryHref: "/finance?tab=payroll",
    secondaryLabel: "Finance payroll",
  },
  {
    id: "settlements",
    title: "Settlements",
    subtitle: "Owner-operator and driver settlements.",
    description:
      "Settlements are managed in Finance. Open Settlements there, then return to Drivers for the roster.",
    primaryHref: "/finance?tab=settlements",
    primaryLabel: "Open settlements",
    secondaryHref: "/payroll",
    secondaryLabel: "Driver pay",
  },
  {
    id: "performance",
    title: "Performance",
    subtitle: "On-time, utilization, and safety signals.",
    description:
      "Open a driver from the roster for performance detail. Reports has fleet-wide driver metrics.",
    primaryHref: "/drivers",
    primaryLabel: "Open roster",
    secondaryHref: "/analytics",
    secondaryLabel: "Driver reports",
  },
  {
    id: "training",
    title: "Training",
    subtitle: "Training records and assignments.",
    description:
      "Training records are kept on the driver profile. Hiring can start a new driver packet when needed.",
    primaryHref: "/drivers",
    primaryLabel: "Open roster",
    secondaryHref: "/drivers/hiring/new",
    secondaryLabel: "New hire",
  },
  {
    id: "violations",
    title: "Violations",
    subtitle: "Safety events and CSA-related items.",
    description:
      "Safety and violation history lives on each driver’s Safety tab. Compliance shows fleet risk.",
    primaryHref: "/compliance",
    primaryLabel: "Open compliance",
    secondaryHref: "/drivers",
    secondaryLabel: "Driver roster",
  },
  {
    id: "messages",
    title: "Messages",
    subtitle: "Driver communications.",
    description:
      "Message drivers from Communications. Open a driver profile for contact details.",
    primaryHref: "/communications",
    primaryLabel: "Open messages",
    secondaryHref: "/drivers/directory",
    secondaryLabel: "Directory",
  },
  {
    id: "history",
    title: "History",
    subtitle: "Load and assignment history.",
    description:
      "Open a driver for timeline and past assignments. Dispatch Completed shows recent freight.",
    primaryHref: "/drivers",
    primaryLabel: "Open roster",
    secondaryHref: "/loads?tab=delivered",
    secondaryLabel: "Completed loads",
  },
  {
    id: "timeline",
    title: "Timeline",
    subtitle: "Chronology for a driver.",
    description:
      "Each driver has a Timeline view. Pick a driver from the roster to open it.",
    primaryHref: "/drivers",
    primaryLabel: "Open roster",
    secondaryHref: "/drivers/directory",
    secondaryLabel: "Directory",
  },
  {
    id: "ai-insights",
    title: "AI insights",
    subtitle: "Alph assists with people decisions — you approve.",
    description:
      "Ask Alph about coverage, retention, or who to call next. Insights never hire, fire, or assign without you.",
    primaryHref: "/?workspace=drivers",
    primaryLabel: "Ask Alph",
    secondaryHref: "/drivers",
    secondaryLabel: "Driver roster",
  },
];

const FLEET_PANELS: SoftPanelDef[] = [
  {
    id: "inspections",
    title: "Inspections",
    subtitle: "DVIR and inspection readiness.",
    description:
      "Inspection follow-ups are tracked with Maintenance work orders. Open Maintenance to schedule and close items.",
    primaryHref: "/fleet/maintenance?tab=work_orders",
    primaryLabel: "Work orders",
    secondaryHref: "/compliance",
    secondaryLabel: "Compliance",
  },
  {
    id: "breakdowns",
    title: "Breakdowns",
    subtitle: "Roadside and urgent shop events.",
    description:
      "Treat breakdowns as high-priority repairs and work orders in Maintenance.",
    primaryHref: "/fleet/maintenance?tab=repairs",
    primaryLabel: "Open repairs",
    secondaryHref: "/fleet/maintenance?tab=work_orders",
    secondaryLabel: "Work orders",
  },
  {
    id: "registration",
    title: "Registration",
    subtitle: "Unit registration and renewals.",
    description:
      "Registration docs live in Document Center and on each unit. Compliance flags expirations.",
    primaryHref: "/documents?category=truck_document",
    primaryLabel: "Truck documents",
    secondaryHref: "/compliance",
    secondaryLabel: "Expirations",
  },
  {
    id: "insurance",
    title: "Insurance",
    subtitle: "Fleet insurance certificates.",
    description:
      "Insurance files are in Documents. Compliance surfaces coverage risk.",
    primaryHref: "/documents?category=insurance",
    primaryLabel: "Insurance docs",
    secondaryHref: "/compliance",
    secondaryLabel: "Compliance",
  },
  {
    id: "permits",
    title: "Permits",
    subtitle: "Operating permits and stickers.",
    description:
      "Permit files are in Documents. Compliance lists what expires soon.",
    primaryHref: "/documents?category=permit",
    primaryLabel: "Permit docs",
    secondaryHref: "/compliance",
    secondaryLabel: "Expirations",
  },
  {
    id: "fleet-health",
    title: "Fleet health",
    subtitle: "Readiness at a glance.",
    description:
      "Fleet Health is summarized on the Fleet dashboard and Maintenance. Ask Alph for a readiness brief.",
    primaryHref: "/fleet",
    primaryLabel: "Fleet dashboard",
    secondaryHref: "/fleet/maintenance",
    secondaryLabel: "Maintenance",
  },
  {
    id: "ai-maintenance",
    title: "AI maintenance",
    subtitle: "Alph suggests — shop decides.",
    description:
      "Ask Alph what is due, overdue, or risky. Work orders and repairs still require human approval.",
    primaryHref: "/?workspace=fleet",
    primaryLabel: "Ask Alph",
    secondaryHref: "/fleet/maintenance",
    secondaryLabel: "Maintenance",
  },
];

const FINANCE_PANELS: SoftPanelDef[] = [
  {
    id: "fuel-costs",
    title: "Fuel costs",
    subtitle: "Fuel spend and IFTA-ready miles.",
    description:
      "Review fuel in Fleet Fuel and IFTA. Expense detail also appears under Finance Expenses.",
    primaryHref: "/fleet/fuel",
    primaryLabel: "Fuel log",
    secondaryHref: "/ifta",
    secondaryLabel: "IFTA",
  },
  {
    id: "maintenance-costs",
    title: "Maintenance costs",
    subtitle: "Shop spend and repairs.",
    description:
      "Maintenance cost detail lives with Maintenance reports and Finance expenses.",
    primaryHref: "/fleet/maintenance",
    primaryLabel: "Maintenance",
    secondaryHref: "/finance?tab=expenses",
    secondaryLabel: "Expenses",
  },
  {
    id: "truck-profit",
    title: "Truck profit",
    subtitle: "Unit-level contribution.",
    description:
      "Start from Finance Reports and Fleet utilization. Deeper truck P&L can open from unit detail.",
    primaryHref: "/finance?tab=reports",
    primaryLabel: "Finance reports",
    secondaryHref: "/fleet/trucks",
    secondaryLabel: "Trucks",
  },
  {
    id: "customer-profit",
    title: "Customer profit",
    subtitle: "Profit by shipper and account.",
    description:
      "Use Finance Reports and the Customers workspace for account history. Alph can summarize — you decide.",
    primaryHref: "/finance?tab=reports",
    primaryLabel: "Finance reports",
    secondaryHref: "/customers",
    secondaryLabel: "Customers",
  },
  {
    id: "broker-profit",
    title: "Broker profit",
    subtitle: "Margin by broker.",
    description:
      "Broker payments and lane history are in Finance and Brokers. Open reports for margin views.",
    primaryHref: "/finance?tab=broker_payments",
    primaryLabel: "Broker payments",
    secondaryHref: "/brokers",
    secondaryLabel: "Brokers",
  },
  {
    id: "exports",
    title: "Exports",
    subtitle: "Export ledgers and filings.",
    description:
      "Export from Finance Reports, IFTA, and Settings backup when you need a file out.",
    primaryHref: "/finance?tab=reports",
    primaryLabel: "Finance reports",
    secondaryHref: "/ifta",
    secondaryLabel: "IFTA export",
  },
];

const CUSTOMERS_PANELS: SoftPanelDef[] = [
  {
    id: "shippers",
    title: "Shippers",
    subtitle: "Shipper accounts and contacts.",
    description:
      "Shippers are in the Companies directory. Filter or open a company for lanes and contacts.",
    primaryHref: "/companies",
    primaryLabel: "Open companies",
    secondaryHref: "/customers",
    secondaryLabel: "Customers hub",
  },
  {
    id: "customers",
    title: "Customers",
    subtitle: "Paying accounts and partners.",
    description:
      "Customer accounts are managed as Companies and Brokers. Start from the hub cards above.",
    primaryHref: "/companies",
    primaryLabel: "Companies",
    secondaryHref: "/brokers",
    secondaryLabel: "Brokers",
  },
  {
    id: "receivers",
    title: "Receivers",
    subtitle: "Consignees and delivery contacts.",
    description:
      "Receiver contacts are stored with Companies and on each load. Open Companies to manage them.",
    primaryHref: "/companies",
    primaryLabel: "Open companies",
    secondaryHref: "/loads",
    secondaryLabel: "Dispatch board",
  },
  {
    id: "contacts",
    title: "Contacts",
    subtitle: "People at brokers and shippers.",
    description:
      "Contacts live on broker and company profiles. Open either directory to update them.",
    primaryHref: "/brokers",
    primaryLabel: "Brokers",
    secondaryHref: "/companies",
    secondaryLabel: "Companies",
  },
  {
    id: "credit",
    title: "Credit",
    subtitle: "Credit limits and risk.",
    description:
      "Broker credit and payment terms are on each broker profile.",
    primaryHref: "/brokers",
    primaryLabel: "Open brokers",
    secondaryHref: "/finance?tab=broker_payments",
    secondaryLabel: "Broker payments",
  },
  {
    id: "history",
    title: "History",
    subtitle: "Lane and load history by account.",
    description:
      "Open a broker or company for history. Completed loads show recent freight.",
    primaryHref: "/brokers",
    primaryLabel: "Brokers",
    secondaryHref: "/loads?tab=delivered",
    secondaryLabel: "Completed loads",
  },
  {
    id: "notes",
    title: "Notes",
    subtitle: "Account notes and reminders.",
    description:
      "Notes are kept on broker and company profiles. Open an account to add or review them.",
    primaryHref: "/brokers",
    primaryLabel: "Brokers",
    secondaryHref: "/companies",
    secondaryLabel: "Companies",
  },
];

const REPORTS_PANELS: SoftPanelDef[] = [
  {
    id: "revenue",
    title: "Revenue",
    subtitle: "Revenue and cash reports.",
    description:
      "Finance Overview and Reports cover revenue. Home shows today’s revenue at a glance.",
    primaryHref: "/finance?tab=reports",
    primaryLabel: "Finance reports",
    secondaryHref: "/finance",
    secondaryLabel: "Finance overview",
  },
  {
    id: "loads",
    title: "Loads",
    subtitle: "Volume and on-time freight.",
    description:
      "Use Dispatch for live freight and Finance Reports for load economics.",
    primaryHref: "/loads",
    primaryLabel: "Dispatch board",
    secondaryHref: "/finance?tab=reports",
    secondaryLabel: "Finance reports",
  },
  {
    id: "drivers",
    title: "Drivers",
    subtitle: "People and utilization reports.",
    description:
      "Open the Drivers workspace for roster metrics, or Finance for payroll totals.",
    primaryHref: "/drivers",
    primaryLabel: "Drivers",
    secondaryHref: "/finance?tab=payroll",
    secondaryLabel: "Payroll",
  },
  {
    id: "fleet",
    title: "Fleet",
    subtitle: "Utilization and unit readiness.",
    description:
      "Fleet dashboard and Maintenance reports cover equipment performance.",
    primaryHref: "/fleet",
    primaryLabel: "Fleet dashboard",
    secondaryHref: "/fleet/maintenance",
    secondaryLabel: "Maintenance",
  },
  {
    id: "fuel",
    title: "Fuel",
    subtitle: "Fuel spend and MPG.",
    description:
      "Fuel log and IFTA are the working fuel reports today.",
    primaryHref: "/fleet/fuel",
    primaryLabel: "Fuel log",
    secondaryHref: "/ifta",
    secondaryLabel: "IFTA",
  },
  {
    id: "maintenance",
    title: "Maintenance",
    subtitle: "Shop cost and PM compliance.",
    description:
      "Maintenance module reports summarize shop work and service history.",
    primaryHref: "/fleet/maintenance",
    primaryLabel: "Maintenance",
    secondaryHref: "/finance?tab=expenses",
    secondaryLabel: "Expenses",
  },
  {
    id: "payroll",
    title: "Payroll",
    subtitle: "Driver pay reports.",
    description:
      "Payroll settlements and Finance payroll tabs are the source of truth.",
    primaryHref: "/payroll",
    primaryLabel: "Driver pay",
    secondaryHref: "/finance?tab=payroll",
    secondaryLabel: "Finance payroll",
  },
  {
    id: "profit",
    title: "Profit",
    subtitle: "Margin and contribution.",
    description:
      "Finance Reports and the Executive Home summarize profit. Ask Alph for a plain-language brief.",
    primaryHref: "/finance?tab=reports",
    primaryLabel: "Finance reports",
    secondaryHref: "/dashboard",
    secondaryLabel: "Home",
  },
  {
    id: "custom",
    title: "Custom reports",
    subtitle: "Build what you need.",
    description:
      "Start from Finance Reports or ask Alph to outline a custom view — exports stay under your control.",
    primaryHref: "/finance?tab=reports",
    primaryLabel: "Finance reports",
    secondaryHref: "/?workspace=reports",
    secondaryLabel: "Ask Alph",
  },
];

const ADVANCED_PANELS: SoftPanelDef[] = [
  {
    id: "ai-automation",
    title: "AI Automation",
    subtitle: "Alph assists with automation — you approve.",
    description:
      "Open the AI Automation Center for recipes and triggers. Workflows never auto-execute critical actions without you.",
    primaryHref: "/platform/automation",
    primaryLabel: "Open AI Automation",
    secondaryHref: "/workflows",
    secondaryLabel: "Workflow Builder",
  },
  {
    id: "scheduled-tasks",
    title: "Scheduled Tasks",
    subtitle: "Recurring jobs and schedules.",
    description:
      "Schedules are managed with Workflows and Automation recipes. Start from either hub — humans stay in control.",
    primaryHref: "/workflows",
    primaryLabel: "Open Workflows",
    secondaryHref: "/platform/automation",
    secondaryLabel: "Automation Center",
  },
  {
    id: "event-triggers",
    title: "Event Triggers",
    subtitle: "React to operational events.",
    description:
      "Event triggers live in the AI Automation Center. Pair them with Workflow Builder when you need a custom path.",
    primaryHref: "/platform/automation",
    primaryLabel: "Open triggers",
    secondaryHref: "/workflows",
    secondaryLabel: "Workflow Builder",
  },
  {
    id: "capacity-exchange",
    title: "Capacity Exchange",
    subtitle: "Find and offer capacity.",
    description:
      "Capacity and freight matching live on Transpo Exchange™. Open Freight or Fleet boards from Exchange.",
    primaryHref: "/exchange/freight",
    primaryLabel: "Open freight exchange",
    secondaryHref: "/exchange",
    secondaryLabel: "Exchange hub",
  },
  {
    id: "partner-marketplace",
    title: "Partner Marketplace",
    subtitle: "Verified partners and services.",
    description:
      "Browse Marketplace listings and Platform Partner Center for verified partners.",
    primaryHref: "/marketplace",
    primaryLabel: "Open Marketplace",
    secondaryHref: "/platform/partners",
    secondaryLabel: "Partner Center",
  },
  {
    id: "services-marketplace",
    title: "Services Marketplace",
    subtitle: "Business and roadside services.",
    description:
      "Services and business offerings are on Exchange. Open Services or Business Services from there.",
    primaryHref: "/exchange/services",
    primaryLabel: "Open services",
    secondaryHref: "/exchange/business-services",
    secondaryLabel: "Business services",
  },
  {
    id: "fuel-cards",
    title: "Fuel Cards",
    subtitle: "Fuel card providers and sync.",
    description:
      "Fuel card connections are managed in Integration Center. Fleet Fuel remains the day-to-day log.",
    primaryHref: "/integrations",
    primaryLabel: "Open Integrations",
    secondaryHref: "/fleet/fuel",
    secondaryLabel: "Fuel log",
  },
  {
    id: "accounting-integration",
    title: "Accounting",
    subtitle: "Accounting system connections.",
    description:
      "Connect accounting partners from Integration Center. Day-to-day ledgers stay in Finance.",
    primaryHref: "/integrations",
    primaryLabel: "Open Integrations",
    secondaryHref: "/finance",
    secondaryLabel: "Finance",
  },
  {
    id: "payroll-integration",
    title: "Payroll",
    subtitle: "Payroll integrations and settlements.",
    description:
      "Payroll partners connect through Integration Center. Settlements and driver pay stay in Finance and Drivers.",
    primaryHref: "/integrations",
    primaryLabel: "Open Integrations",
    secondaryHref: "/payroll",
    secondaryLabel: "Driver pay",
  },
  {
    id: "gps",
    title: "GPS",
    subtitle: "GPS and telematics providers.",
    description:
      "GPS and map partners are enabled in Integration Center. Live tracking stays in Dispatch.",
    primaryHref: "/integrations",
    primaryLabel: "Open Integrations",
    secondaryHref: "/loads/tracking",
    secondaryLabel: "Tracking",
  },
  {
    id: "api-connections",
    title: "API Connections",
    subtitle: "API connections and health.",
    description:
      "Review API and partner connections in Integration Center or the Developer Portal.",
    primaryHref: "/integrations",
    primaryLabel: "Integration Center",
    secondaryHref: "/platform/developers",
    secondaryLabel: "Developer Portal",
  },
  {
    id: "integration-webhooks",
    title: "Webhooks",
    subtitle: "Inbound and outbound webhooks.",
    description:
      "Webhook configuration lives in the Developer Portal. Integration Center shows partner sync health.",
    primaryHref: "/platform/developers",
    primaryLabel: "Developer Portal",
    secondaryHref: "/integrations",
    secondaryLabel: "Integrations",
  },
  {
    id: "import",
    title: "Import",
    subtitle: "Import CSV and partner data.",
    description:
      "Start a safe import from the AI Migration Center. Critical imports require human review.",
    primaryHref: "/platform/migration/new",
    primaryLabel: "Start import",
    secondaryHref: "/platform/migration",
    secondaryLabel: "Migration Center",
  },
  {
    id: "export",
    title: "Export",
    subtitle: "Export ledgers and backups.",
    description:
      "Export from Migration Center or Settings backup when you need a file out.",
    primaryHref: "/platform/migration",
    primaryLabel: "Migration Center",
    secondaryHref: "/settings?section=backup",
    secondaryLabel: "Settings backup",
  },
  {
    id: "bulk",
    title: "Bulk",
    subtitle: "Bulk upload and mass updates.",
    description:
      "Bulk imports run through the AI Migration Center. Document bulk upload remains in Documents.",
    primaryHref: "/platform/migration",
    primaryLabel: "Migration Center",
    secondaryHref: "/documents?focus=upload",
    secondaryLabel: "Document bulk upload",
  },
  {
    id: "historical",
    title: "Historical",
    subtitle: "Historical data migration.",
    description:
      "Historical moves are handled in the AI Migration Center with review gates — Alph assists, you approve.",
    primaryHref: "/platform/migration",
    primaryLabel: "Migration Center",
    secondaryHref: "/platform/migration/new",
    secondaryLabel: "Start migration",
  },
  {
    id: "sdk",
    title: "SDK",
    subtitle: "SDK access and samples.",
    description:
      "SDK and developer resources are in the Developer Portal.",
    primaryHref: "/platform/developers",
    primaryLabel: "Developer Portal",
    secondaryHref: "/settings?section=api-keys",
    secondaryLabel: "API keys",
  },
  {
    id: "developer-webhooks",
    title: "Webhooks",
    subtitle: "Webhook endpoints and delivery.",
    description:
      "Configure and monitor webhooks from the Developer Portal.",
    primaryHref: "/platform/developers",
    primaryLabel: "Developer Portal",
    secondaryHref: "/platform/security",
    secondaryLabel: "Security Center",
  },
  {
    id: "sandbox",
    title: "Sandbox",
    subtitle: "Safe sandbox for testing.",
    description:
      "Sandbox and test credentials are available from the Developer Portal.",
    primaryHref: "/platform/developers",
    primaryLabel: "Developer Portal",
    secondaryHref: "/platform",
    secondaryLabel: "Platform hub",
  },
  {
    id: "access-logs",
    title: "Access Logs",
    subtitle: "Sign-in and access activity.",
    description:
      "Access and audit activity are in Settings Audit Logs and the Security Center.",
    primaryHref: "/settings?section=audit-logs",
    primaryLabel: "Audit logs",
    secondaryHref: "/platform/security",
    secondaryLabel: "Security Center",
  },
  {
    id: "mfa",
    title: "MFA",
    subtitle: "Multi-factor authentication.",
    description:
      "MFA and security preferences live in Settings Security. Platform Security Center covers fleet-wide posture.",
    primaryHref: "/settings?section=security",
    primaryLabel: "Settings Security",
    secondaryHref: "/platform/security",
    secondaryLabel: "Security Center",
  },
  {
    id: "trust-center",
    title: "Trust Center",
    subtitle: "Wallet, network, and charter trust.",
    description:
      "Open Trust Charter for governance, Network Trust for verified relationships, or Wallet Trust for professional trust.",
    primaryHref: "/platform/trust-charter",
    primaryLabel: "Trust Charter",
    secondaryHref: "/network/trust",
    secondaryLabel: "Network Trust",
  },
  {
    id: "data-protection",
    title: "Data Protection",
    subtitle: "Data protection and privacy controls.",
    description:
      "Data protection controls are in Platform Security and Settings Security. You remain responsible for access decisions.",
    primaryHref: "/platform/security",
    primaryLabel: "Security Center",
    secondaryHref: "/settings?section=security",
    secondaryLabel: "Settings Security",
  },
  {
    id: "feature-flags",
    title: "Feature Flags",
    subtitle: "Feature flags and rollouts.",
    description:
      "Feature flags and admin rollouts are managed in the Admin console.",
    primaryHref: "/admin",
    primaryLabel: "Open Admin",
    secondaryHref: "/platform",
    secondaryLabel: "Platform hub",
  },
  {
    id: "system-settings",
    title: "System Management",
    subtitle: "Admin and system configuration.",
    description:
      "System management lives in Admin. Everyday company prefs stay in Settings.",
    primaryHref: "/admin",
    primaryLabel: "Open Admin",
    secondaryHref: "/settings",
    secondaryLabel: "Company Settings",
  },
  {
    id: "extensions",
    title: "Extensions",
    subtitle: "Extensions that deepen the OS.",
    description:
      "Browse installable apps and extensions in the Transpo App Store™. Coming panels still link real destinations.",
    primaryHref: "/platform/apps",
    primaryLabel: "App Store",
    secondaryHref: "/platform/ecosystem",
    secondaryLabel: "Ecosystem",
  },
  {
    id: "plugins",
    title: "Plugins",
    subtitle: "Partner plugins and add-ons.",
    description:
      "Partner plugins are listed in the App Store and Partner Center.",
    primaryHref: "/platform/apps",
    primaryLabel: "App Store",
    secondaryHref: "/platform/partners",
    secondaryLabel: "Partner Center",
  },
  {
    id: "future-products",
    title: "Future Products",
    subtitle: "Upcoming Transpo products.",
    description:
      "Explore Platform, Ecosystem, and App Store for what’s shipping next. Alph Copilot agents are available today under AI Agents.",
    primaryHref: "/platform",
    primaryLabel: "Platform hub",
    secondaryHref: "/alph/copilot",
    secondaryLabel: "AI Agents",
  },
];

const BY_WORKSPACE: Record<string, SoftPanelDef[]> = {
  dispatch: DISPATCH_PANELS,
  drivers: DRIVERS_PANELS,
  fleet: FLEET_PANELS,
  finance: FINANCE_PANELS,
  customers: CUSTOMERS_PANELS,
  reports: REPORTS_PANELS,
  advanced: ADVANCED_PANELS,
};

export function getWorkspaceSoftPanel(
  workspace: string,
  panelId: string,
): SoftPanelDef | null {
  const list = BY_WORKSPACE[workspace];
  if (!list) return null;
  return list.find((p) => p.id === panelId) ?? null;
}

export function listWorkspaceSoftPanels(workspace: string): SoftPanelDef[] {
  return BY_WORKSPACE[workspace] ?? [];
}
