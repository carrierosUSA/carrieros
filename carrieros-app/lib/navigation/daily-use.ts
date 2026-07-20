import type { CarrierOSRole } from "@/lib/auth/session";
import type { WorkspaceId } from "@/lib/navigation/workspace-panels";

export type NavLink = {
  name: string;
  href: string;
  /** Prefer exact pathname match (query handled separately). */
  exactPath?: boolean;
};

export type PrimaryNavItem = {
  name: string;
  href: string;
  icon: string;
  roles: CarrierOSRole[];
};

const OPS: CarrierOSRole[] = [
  "super_admin",
  "owner",
  "dispatcher",
  "fleet_manager",
  "maintenance",
  "mechanic",
  "safety",
  "accounting",
  "accountant",
  "read_only",
];

/** Primary sidebar — daily operations first. Order is intentional. */
export const PRIMARY_NAV: PrimaryNavItem[] = [
  {
    name: "Home",
    href: "/dashboard",
    icon: "home",
    roles: OPS,
  },
  {
    name: "Dispatch",
    href: "/loads",
    icon: "dispatch",
    roles: ["super_admin", "owner", "dispatcher", "read_only", "safety"],
  },
  {
    name: "Fleet",
    href: "/fleet",
    icon: "fleet",
    roles: [
      "super_admin",
      "owner",
      "dispatcher",
      "fleet_manager",
      "maintenance",
      "mechanic",
      "read_only",
    ],
  },
  {
    name: "Money",
    href: "/finance",
    icon: "finance",
    roles: [
      "super_admin",
      "owner",
      "dispatcher",
      "accounting",
      "accountant",
      "read_only",
    ],
  },
  {
    name: "Documents",
    href: "/documents",
    icon: "documents",
    roles: [
      "super_admin",
      "owner",
      "dispatcher",
      "safety",
      "accounting",
      "accountant",
      "read_only",
    ],
  },
  {
    name: "Alph",
    href: "/",
    icon: "alph",
    roles: OPS,
  },
  {
    name: "More",
    href: "/more",
    icon: "more",
    roles: OPS,
  },
];

export type MoreNavLink = NavLink & {
  description?: string;
  roles?: CarrierOSRole[];
};

export type MoreNavGroup = {
  id: string;
  name: string;
  links: MoreNavLink[];
};

/** Secondary destinations under More — all existing routes preserved. */
export const MORE_NAV_GROUPS: MoreNavGroup[] = [
  {
    id: "operations",
    name: "Operations",
    links: [
      {
        name: "Drivers",
        href: "/drivers",
        description: "Roster, documents, and availability.",
        roles: ["super_admin", "owner", "dispatcher", "safety", "read_only"],
      },
      {
        name: "Customers",
        href: "/customers",
        description: "Brokers, shippers, and credit.",
        roles: [
          "super_admin",
          "owner",
          "dispatcher",
          "accounting",
          "accountant",
          "read_only",
        ],
      },
      {
        name: "Reports",
        href: "/analytics",
        description: "Revenue, loads, fleet, and compliance.",
        roles: [
          "super_admin",
          "owner",
          "accounting",
          "accountant",
          "safety",
          "dispatcher",
          "read_only",
        ],
      },
    ],
  },
  {
    id: "platform",
    name: "Platform",
    links: [
      {
        name: "Integrations",
        href: "/integrations",
        description: "ELD, fuel, accounting, and partner connections.",
        roles: ["super_admin", "owner"],
      },
      {
        name: "Automation",
        href: "/workflows",
        description: "Workflows and recipes — you approve critical steps.",
        roles: ["super_admin", "owner"],
      },
      {
        name: "Advanced",
        href: "/advanced",
        description: "Automation, integrations, and platform tools.",
        roles: ["super_admin", "owner"],
      },
    ],
  },
  {
    id: "administration",
    name: "Administration",
    links: [
      {
        name: "Company",
        href: "/settings",
        exactPath: true,
        description: "Company profile and billing basics.",
        roles: ["super_admin", "owner"],
      },
      {
        name: "Users and permissions",
        href: "/settings/permissions",
        description: "People, roles, and access.",
        roles: ["super_admin", "owner"],
      },
      {
        name: "Settings",
        href: "/settings",
        description: "Notifications, security, and support.",
        roles: ["super_admin", "owner"],
      },
    ],
  },
];

/** Soft panels that keep the user inside Dispatch (`/loads/view/*`). */
export const DISPATCH_WORKSPACE_LINKS: NavLink[] = [
  { name: "Board", href: "/loads", exactPath: true },
  { name: "Active", href: "/loads?tab=in_transit" },
  { name: "Upcoming", href: "/loads?tab=assigned" },
  { name: "Completed", href: "/loads?tab=delivered" },
  { name: "Drivers", href: "/loads/view/drivers" },
  { name: "Trucks", href: "/loads/view/trucks" },
  { name: "Trailers", href: "/loads/view/trailers" },
  { name: "Tracking", href: "/loads/tracking" },
  { name: "Messages", href: "/loads/view/messages" },
  { name: "Detention", href: "/loads/detention" },
  { name: "Timeline", href: "/loads/view/timeline" },
  { name: "Documents", href: "/loads/view/documents" },
  { name: "Notes", href: "/loads/view/notes" },
  { name: "Broker Communication", href: "/loads/view/broker-comms" },
  { name: "Driver Communication", href: "/loads/view/driver-comms" },
  { name: "Alph Suggestions", href: "/loads/view/alph" },
];

export const DISPATCH_PRIMARY_COUNT = 8;

export const DRIVERS_WORKSPACE_LINKS: NavLink[] = [
  { name: "Drivers", href: "/drivers", exactPath: true },
  { name: "Documents", href: "/drivers/view/documents" },
  { name: "Licenses", href: "/drivers/view/licenses" },
  { name: "Medical Cards", href: "/drivers/view/medical" },
  { name: "Payroll", href: "/drivers/view/payroll" },
  { name: "Settlements", href: "/drivers/view/settlements" },
  { name: "Performance", href: "/drivers/view/performance" },
  { name: "Training", href: "/drivers/view/training" },
  { name: "Violations", href: "/drivers/view/violations" },
  { name: "Messages", href: "/drivers/view/messages" },
  { name: "History", href: "/drivers/view/history" },
  { name: "Timeline", href: "/drivers/view/timeline" },
  { name: "AI Insights", href: "/drivers/view/ai-insights" },
];

export const FLEET_WORKSPACE_PRIMARY: NavLink[] = [
  { name: "Trucks", href: "/fleet/trucks" },
  { name: "Trailers", href: "/fleet/trailers" },
  { name: "Fuel", href: "/fleet/fuel" },
  { name: "Maintenance", href: "/fleet/maintenance" },
  { name: "Repairs", href: "/fleet/maintenance?tab=repairs" },
  { name: "Tires", href: "/fleet/maintenance?tab=tires" },
];

export const FLEET_WORKSPACE_MORE: NavLink[] = [
  { name: "Inspections", href: "/fleet/view/inspections" },
  { name: "Breakdowns", href: "/fleet/view/breakdowns" },
  { name: "Registration", href: "/fleet/view/registration" },
  { name: "Insurance", href: "/fleet/view/insurance" },
  { name: "Permits", href: "/fleet/view/permits" },
  { name: "Service History", href: "/fleet/maintenance?tab=history" },
  { name: "Fleet Health", href: "/fleet/view/fleet-health" },
  { name: "AI Maintenance", href: "/fleet/view/ai-maintenance" },
];

export const DOCUMENTS_WORKSPACE_LINKS: NavLink[] = [
  { name: "Rate Confirmations", href: "/documents?category=rate_confirmation" },
  { name: "POD", href: "/documents?category=pod" },
  { name: "Invoices", href: "/documents?category=invoice" },
  { name: "Fuel Receipts", href: "/documents?category=fuel_receipt" },
  { name: "Lumper", href: "/documents?category=lumper_receipt" },
  { name: "Repairs", href: "/documents?category=repair" },
  { name: "Insurance", href: "/documents?category=insurance" },
  { name: "Registration", href: "/documents?category=truck_document" },
  { name: "Permits", href: "/documents?category=permit" },
  { name: "OCR Queue", href: "/documents?status=pending_review" },
  { name: "Bulk Upload", href: "/documents?focus=upload" },
  { name: "Search", href: "/documents?focus=search" },
  { name: "Review Queue", href: "/documents/requests" },
];

export const FINANCE_WORKSPACE_LINKS: NavLink[] = [
  { name: "Overview", href: "/finance", exactPath: true },
  { name: "Invoices", href: "/finance?tab=invoices" },
  { name: "Payments", href: "/finance?tab=broker_payments" },
  { name: "Expenses", href: "/finance?tab=expenses" },
  { name: "Payroll", href: "/finance?tab=payroll" },
  { name: "Settlements", href: "/finance?tab=settlements" },
  { name: "Fuel Costs", href: "/finance/view/fuel-costs" },
  { name: "Maintenance Costs", href: "/finance/view/maintenance-costs" },
  { name: "IFTA", href: "/ifta" },
  { name: "Truck Profit", href: "/finance/view/truck-profit" },
  { name: "Customer Profit", href: "/finance/view/customer-profit" },
  { name: "Broker Profit", href: "/finance/view/broker-profit" },
  { name: "Exports", href: "/finance/view/exports" },
];

export const CUSTOMERS_WORKSPACE_LINKS: NavLink[] = [
  { name: "Brokers", href: "/brokers" },
  { name: "Shippers", href: "/customers/view/shippers" },
  { name: "Customers", href: "/customers/view/customers" },
  { name: "Receivers", href: "/customers/view/receivers" },
  { name: "Contacts", href: "/customers/view/contacts" },
  { name: "Credit", href: "/customers/view/credit" },
  { name: "History", href: "/customers/view/history" },
  { name: "Notes", href: "/customers/view/notes" },
  { name: "Communication", href: "/communications" },
];

export const REPORTS_WORKSPACE_LINKS: NavLink[] = [
  { name: "Revenue", href: "/analytics/view/revenue" },
  { name: "Loads", href: "/analytics/view/loads" },
  { name: "Drivers", href: "/analytics/view/drivers" },
  { name: "Fleet", href: "/analytics/view/fleet" },
  { name: "Fuel", href: "/analytics/view/fuel" },
  { name: "Maintenance", href: "/analytics/view/maintenance" },
  { name: "Payroll", href: "/analytics/view/payroll" },
  { name: "Compliance", href: "/compliance" },
  { name: "Profit", href: "/analytics/view/profit" },
  { name: "Custom Reports", href: "/analytics/view/custom" },
];

export const SETTINGS_WORKSPACE_PRIMARY: NavLink[] = [
  { name: "Company", href: "/settings", exactPath: true },
  { name: "Users", href: "/settings?section=users" },
  { name: "Roles", href: "/settings/permissions" },
  { name: "Notifications", href: "/settings?section=notifications" },
  { name: "Billing", href: "/settings?section=billing" },
  { name: "Security", href: "/settings?section=security" },
  { name: "Support", href: "/support" },
];

/** Everyday Settings extras — platform-power tools live under Advanced. */
export const SETTINGS_WORKSPACE_MORE: NavLink[] = [
  { name: "Advanced", href: "/advanced" },
  { name: "Backup", href: "/settings?section=backup" },
  { name: "API keys", href: "/settings?section=api-keys" },
  { name: "Setup", href: "/setup" },
];

export type AdvancedCategoryId =
  | "automation"
  | "marketplace"
  | "integrations"
  | "migration"
  | "developer"
  | "security"
  | "administration"
  | "future";

export type AdvancedLink = NavLink & {
  description: string;
};

export type AdvancedCategory = {
  id: AdvancedCategoryId;
  name: string;
  description: string;
  links: AdvancedLink[];
};

/**
 * Advanced findability chips — jump to categories or key destinations.
 * Covers Exchange, Partner Center, App Store, API/SDK, Trust, Governance,
 * Audit, AI Policies, Feature Flags, System Management without bloating
 * secondary nav into 20 top-level tabs.
 */
export const ADVANCED_FINDABILITY_CHIPS: NavLink[] = [
  { name: "Automation", href: "/advanced/view/automation" },
  { name: "Marketplace", href: "/advanced/view/marketplace" },
  { name: "Exchange", href: "/exchange" },
  { name: "Integrations", href: "/advanced/view/integrations" },
  { name: "Migration Center", href: "/advanced/view/migration" },
  { name: "Developer", href: "/advanced/view/developer" },
  { name: "API", href: "/platform/developers" },
  { name: "SDK", href: "/advanced/view/sdk" },
  { name: "Security", href: "/advanced/view/security" },
  { name: "Trust Center", href: "/advanced/view/trust-center" },
  { name: "Audit Logs", href: "/settings?section=audit-logs" },
  { name: "Administration", href: "/advanced/view/administration" },
  { name: "Governance", href: "/platform/governance" },
  { name: "AI Policies", href: "/platform/ai-policy" },
  { name: "Feature Flags", href: "/advanced/view/feature-flags" },
  { name: "System Management", href: "/advanced/view/system-settings" },
  { name: "Partner Center", href: "/platform/partners" },
  { name: "App Store", href: "/platform/apps" },
  { name: "Future Products", href: "/advanced/view/future" },
];

/** Advanced workspace — platform-power tools grouped by category. */
export const ADVANCED_CATEGORIES: AdvancedCategory[] = [
  {
    id: "automation",
    name: "Automation",
    description: "Workflow Builder, recipes, schedules, and event triggers.",
    links: [
      {
        name: "Workflow Builder",
        href: "/workflows",
        description: "Build and run operational workflows.",
      },
      {
        name: "Automation Recipes",
        href: "/platform/automation",
        description: "Ready-made automation recipes.",
      },
      {
        name: "AI Automation",
        href: "/advanced/view/ai-automation",
        description: "AI-assisted automation — you approve every action.",
      },
      {
        name: "Scheduled Tasks",
        href: "/advanced/view/scheduled-tasks",
        description: "Recurring jobs and schedules.",
      },
      {
        name: "Event Triggers",
        href: "/advanced/view/event-triggers",
        description: "React to load, document, and fleet events.",
      },
    ],
  },
  {
    id: "marketplace",
    name: "Marketplace & Exchange",
    description:
      "Marketplace, Transpo Exchange™, Partner Center, capacity, and Network.",
    links: [
      {
        name: "Marketplace",
        href: "/marketplace",
        description: "Browse offers and partner listings.",
      },
      {
        name: "Exchange",
        href: "/exchange",
        description: "Transpo Exchange™ for equipment and freight.",
      },
      {
        name: "Partner Center",
        href: "/platform/partners",
        description: "Verified partners, programs, and partner tools.",
      },
      {
        name: "Capacity Exchange",
        href: "/advanced/view/capacity-exchange",
        description: "Find and offer capacity.",
      },
      {
        name: "Partner Marketplace",
        href: "/advanced/view/partner-marketplace",
        description: "Verified partners and services.",
      },
      {
        name: "Services Marketplace",
        href: "/advanced/view/services-marketplace",
        description: "Business and roadside services.",
      },
      {
        name: "Network",
        href: "/network",
        description: "Verified Network directory and trust.",
      },
    ],
  },
  {
    id: "integrations",
    name: "Integrations",
    description: "ELD, fuel, accounting, payroll, GPS, APIs, and webhooks.",
    links: [
      {
        name: "Integration Center",
        href: "/integrations",
        description: "Connect and monitor partner integrations.",
      },
      {
        name: "ELD",
        href: "/integrations/eld",
        description: "ELD connections and requests.",
      },
      {
        name: "Fuel Cards",
        href: "/advanced/view/fuel-cards",
        description: "Fuel card providers and sync.",
      },
      {
        name: "Accounting",
        href: "/advanced/view/accounting-integration",
        description: "Accounting system connections.",
      },
      {
        name: "Payroll",
        href: "/advanced/view/payroll-integration",
        description: "Payroll integrations and settlements.",
      },
      {
        name: "GPS",
        href: "/advanced/view/gps",
        description: "GPS and telematics providers.",
      },
      {
        name: "API Connections",
        href: "/advanced/view/api-connections",
        description: "API connections and health.",
      },
      {
        name: "Webhooks",
        href: "/advanced/view/integration-webhooks",
        description: "Inbound and outbound webhooks.",
      },
    ],
  },
  {
    id: "migration",
    name: "Migration Center",
    description: "AI Migration Center — import, export, bulk, and historical moves.",
    links: [
      {
        name: "AI Migration Center",
        href: "/platform/migration",
        description: "Safe imports with human review.",
      },
      {
        name: "Import",
        href: "/advanced/view/import",
        description: "Import CSV and partner data.",
      },
      {
        name: "Export",
        href: "/advanced/view/export",
        description: "Export ledgers and backups.",
      },
      {
        name: "Bulk",
        href: "/advanced/view/bulk",
        description: "Bulk upload and mass updates.",
      },
      {
        name: "Historical",
        href: "/advanced/view/historical",
        description: "Historical data migration.",
      },
    ],
  },
  {
    id: "developer",
    name: "Developer · API · SDK",
    description: "Developer Portal, API, SDK, webhooks, and sandbox.",
    links: [
      {
        name: "Developer Portal",
        href: "/platform/developers",
        description: "APIs, docs, and developer tools.",
      },
      {
        name: "API",
        href: "/platform/developers",
        description: "API reference and connection guides.",
      },
      {
        name: "API Keys",
        href: "/settings?section=api-keys",
        description: "Manage API keys in Settings.",
      },
      {
        name: "SDK",
        href: "/advanced/view/sdk",
        description: "SDK access and samples.",
      },
      {
        name: "Webhooks",
        href: "/advanced/view/developer-webhooks",
        description: "Webhook endpoints and delivery.",
      },
      {
        name: "Sandbox",
        href: "/advanced/view/sandbox",
        description: "Safe sandbox for testing.",
      },
    ],
  },
  {
    id: "security",
    name: "Security & Trust",
    description: "Security Center, Audit Logs, Trust Center, MFA, and Wallet.",
    links: [
      {
        name: "Security Center",
        href: "/platform/security",
        description: "Platform security posture.",
      },
      {
        name: "Audit Logs",
        href: "/settings?section=audit-logs",
        description: "Company audit history.",
      },
      {
        name: "Trust Center",
        href: "/advanced/view/trust-center",
        description: "Wallet, network, and charter trust surfaces.",
      },
      {
        name: "Access Logs",
        href: "/advanced/view/access-logs",
        description: "Sign-in and access activity.",
      },
      {
        name: "MFA",
        href: "/advanced/view/mfa",
        description: "Multi-factor authentication settings.",
      },
      {
        name: "Data Protection",
        href: "/advanced/view/data-protection",
        description: "Data protection and privacy controls.",
      },
      {
        name: "Wallet",
        href: "/wallet",
        description: "Digital Professional Wallet.",
      },
      {
        name: "Network Trust",
        href: "/network/trust",
        description: "Verified Network trust center.",
      },
    ],
  },
  {
    id: "administration",
    name: "Administration & Governance",
    description:
      "Governance, AI Policies, Feature Flags, System Management, and Admin.",
    links: [
      {
        name: "Governance",
        href: "/platform/governance",
        description: "Master Constitution and product governance.",
      },
      {
        name: "Constitution",
        href: "/platform/constitution",
        description: "Engineering Constitution hub.",
      },
      {
        name: "AI Policies",
        href: "/platform/ai-policy",
        description: "AI safety and legal policy.",
      },
      {
        name: "Trust Charter",
        href: "/platform/trust-charter",
        description: "Trust & Safety Charter.",
      },
      {
        name: "Feature Flags",
        href: "/advanced/view/feature-flags",
        description: "Feature flags and rollouts.",
      },
      {
        name: "System Management",
        href: "/advanced/view/system-settings",
        description: "Admin and system configuration.",
      },
      {
        name: "Admin",
        href: "/admin",
        description: "Admin console.",
      },
      {
        name: "Platform",
        href: "/platform",
        description: "Transpo Platform™ hub.",
      },
      {
        name: "Foundation",
        href: "/platform/foundation",
        description: "Architecture and foundation principles.",
      },
      {
        name: "Workforce",
        href: "/workforce",
        description: "Hiring and workforce command center.",
      },
    ],
  },
  {
    id: "future",
    name: "Future Products & App Store",
    description: "App Store, extensions, plugins, AI agents, and upcoming products.",
    links: [
      {
        name: "App Store",
        href: "/platform/apps",
        description: "Transpo App Store™.",
      },
      {
        name: "Extensions",
        href: "/advanced/view/extensions",
        description: "Extensions that deepen the OS.",
      },
      {
        name: "Plugins",
        href: "/advanced/view/plugins",
        description: "Partner plugins and add-ons.",
      },
      {
        name: "AI Agents",
        href: "/alph/copilot",
        description: "Alph Copilot™ role agents — you decide.",
      },
      {
        name: "Future Products",
        href: "/advanced/view/future-products",
        description: "Upcoming Transpo products.",
      },
    ],
  },
];

export const ADVANCED_WORKSPACE_LINKS: NavLink[] = [
  { name: "Overview", href: "/advanced", exactPath: true },
  ...ADVANCED_CATEGORIES.map((category) => ({
    name: category.name,
    href: `/advanced/view/${category.id}`,
  })),
];

export function getAdvancedCategory(
  id: string,
): AdvancedCategory | undefined {
  return ADVANCED_CATEGORIES.find((category) => category.id === id);
}

const LOAD_OPS_PREFIXES = [
  "/loads/planner",
  "/loads/tracking",
  "/loads/check-in",
  "/loads/detention",
  "/loads/view",
];

const VIEW_PREFIXES = [
  "/loads/view",
  "/drivers/view",
  "/fleet/view",
  "/finance/view",
  "/customers/view",
  "/analytics/view",
  "/advanced/view",
];

function parseHref(href: string): { path: string; params: URLSearchParams } {
  const [path, query = ""] = href.split("?");
  return { path, params: new URLSearchParams(query) };
}

function isLoadOpsPath(pathname: string): boolean {
  return LOAD_OPS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isViewPath(pathname: string): boolean {
  return VIEW_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Resolve primary workspace from pathname for Alph context. */
export function getWorkspaceIdFromPathname(pathname: string): WorkspaceId {
  if (pathname === "/" || pathname.startsWith("/alph")) return "alph";
  if (pathname.startsWith("/dashboard")) return "home";
  if (pathname.startsWith("/loads")) return "dispatch";
  if (pathname.startsWith("/drivers") || pathname.startsWith("/payroll")) {
    return "drivers";
  }
  if (pathname.startsWith("/fleet")) return "fleet";
  if (pathname.startsWith("/documents")) return "documents";
  if (
    pathname.startsWith("/finance") ||
    pathname.startsWith("/ifta")
  ) {
    return "finance";
  }
  if (
    pathname.startsWith("/customers") ||
    pathname.startsWith("/brokers") ||
    pathname.startsWith("/companies") ||
    pathname.startsWith("/communications")
  ) {
    return "customers";
  }
  if (pathname.startsWith("/analytics") || pathname.startsWith("/compliance")) {
    return "reports";
  }
  if (pathname.startsWith("/more")) return "home";
  if (
    pathname.startsWith("/advanced") ||
    pathname.startsWith("/integrations") ||
    pathname.startsWith("/platform") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/workflows") ||
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/exchange") ||
    pathname.startsWith("/network") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/workforce") ||
    pathname.startsWith("/alph/copilot")
  ) {
    return "advanced";
  }
  if (
    pathname.startsWith("/settings") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/setup")
  ) {
    return "settings";
  }
  return "home";
}

export function isNavLinkActive(
  pathname: string,
  search: string,
  link: NavLink,
): boolean {
  const { path, params: linkParams } = parseHref(link.href);
  const searchParams = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );

  // Soft view panels
  if (isViewPath(path)) {
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  // Documents category / focus filters
  if (path === "/documents" && link.href.includes("?")) {
    if (pathname !== "/documents") return false;
    for (const [key, value] of linkParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  }
  if (path === "/documents" && (link.exactPath || link.href === "/documents")) {
    if (pathname !== "/documents") return false;
    return !searchParams.get("category") && !searchParams.get("status") && !searchParams.get("focus");
  }

  // Dispatch board tabs
  if (path === "/loads" && (link.href === "/loads" || link.href.startsWith("/loads?"))) {
    if (isLoadOpsPath(pathname) || pathname !== "/loads") return false;
    const tab = searchParams.get("tab");
    const linkTab = linkParams.get("tab");
    if (linkTab) return tab === linkTab;
    return !tab || tab === "all";
  }

  // Dispatch ops pages
  if (path.startsWith("/loads/") && isLoadOpsPath(path)) {
    if (!(pathname === path || pathname.startsWith(`${path}/`))) return false;
    if (path === "/loads/tracking") {
      const wantsEta = linkParams.get("focus") === "eta";
      const hasEta = searchParams.get("focus") === "eta";
      return wantsEta ? hasEta : !hasEta;
    }
    return true;
  }

  // Fleet maintenance tabs
  if (path === "/fleet/maintenance") {
    if (pathname !== "/fleet/maintenance") return false;
    const tab = searchParams.get("tab");
    const linkTab = linkParams.get("tab");
    if (linkTab) return tab === linkTab;
    return !tab || tab === "work_orders";
  }

  // Finance tabs
  if (path === "/finance") {
    if (pathname !== "/finance") return false;
    const tab = searchParams.get("tab");
    const linkTab = linkParams.get("tab");
    if (linkTab) return tab === linkTab;
    return !tab || tab === "overview";
  }

  // Settings sections
  if (path === "/settings" || path.startsWith("/settings/")) {
    if (link.href.startsWith("/settings/permissions")) {
      return pathname.startsWith("/settings/permissions");
    }
    if (pathname.startsWith("/settings/permissions")) return false;
    if (!pathname.startsWith("/settings")) return false;
    const section = searchParams.get("section");
    const linkSection = linkParams.get("section");
    if (linkSection) return pathname === "/settings" && section === linkSection;
    if (link.exactPath || link.href === "/settings") {
      return pathname === "/settings" && !section;
    }
  }

  if (link.exactPath) {
    return pathname === path;
  }

  if (pathname === path) {
    for (const [key, value] of linkParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  }

  return pathname.startsWith(`${path}/`);
}
