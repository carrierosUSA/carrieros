import type { SetupProgress, SetupStep, SetupStepId } from "@/lib/support/types";

const STEP_DEFS: Omit<SetupStep, "status" | "skipped">[] = [
  {
    id: "company_profile",
    title: "Company profile",
    description: "Legal name and branding for invoices and packets.",
    whyNeeded: "Carriers, brokers, and accountants need your correct company name on every document.",
    whereToFind: "Your articles of organization or W-9.",
    example: "Alpha Freight LLC",
    critical: true,
    href: "/settings?section=company",
  },
  {
    id: "mc_dot",
    title: "MC and DOT numbers",
    description: "Federal authority identifiers for compliance and ELD.",
    whyNeeded: "Required for IFTA, insurance filings, and ELD verification.",
    whereToFind: "FMCSA registration letter or SAFER search.",
    example: "MC-482910 · DOT-3398771",
    critical: true,
    href: "/settings?section=company",
  },
  {
    id: "address_contacts",
    title: "Address and contacts",
    description: "HQ address plus dispatch and accounting phones.",
    whyNeeded: "Used for rate cons, claims, and after-hours contact.",
    whereToFind: "Office lease or Google Business listing.",
    example: "1200 Commerce St, Dallas, TX",
    critical: true,
    href: "/settings?section=company",
  },
  {
    id: "trucks",
    title: "Trucks",
    description: "Add your power units with VIN and plate.",
    whyNeeded: "Dispatch, IFTA, and maintenance need an accurate truck list.",
    whereToFind: "Titles, registration cards, or your previous TMS export.",
    example: "Unit 102 · 2022 Freightliner Cascadia",
    critical: true,
    href: "/fleet/trucks",
  },
  {
    id: "trailers",
    title: "Trailers",
    description: "Dry vans, reefers, and flatbeds in your fleet.",
    whyNeeded: "Load assignment and reefer alerts depend on trailer records.",
    whereToFind: "Trailer titles or yard inventory list.",
    example: "TRL-2204 · 53' Reefer",
    critical: false,
    href: "/fleet/trailers",
  },
  {
    id: "drivers",
    title: "Drivers",
    description: "Hire roster with CDL and medical dates.",
    whyNeeded: "You cannot assign loads safely without driver profiles.",
    whereToFind: "Driver files or previous payroll roster.",
    example: "Onkar Singh · CDL Class A",
    critical: true,
    href: "/drivers",
  },
  {
    id: "insurance",
    title: "Insurance",
    description: "Liability, cargo, and physical damage certificates.",
    whyNeeded: "Brokers require current COIs before tendering freight.",
    whereToFind: "Your insurance agent portal.",
    example: "Auto liability expires Dec 2026",
    critical: true,
    href: "/compliance?tab=claims",
  },
  {
    id: "factoring",
    title: "Factoring",
    description: "Factor company and advance terms if you use one.",
    whyNeeded: "Invoices route correctly when factoring is configured.",
    whereToFind: "Factoring agreement or weekly remittance.",
    example: "Apex Factoring · 95% advance",
    critical: false,
    href: "/finance?tab=factoring",
  },
  {
    id: "bank_details",
    title: "Bank details",
    description: "Settlement account for payouts (encrypted).",
    whyNeeded: "Needed for settlements and subscription billing.",
    whereToFind: "Bank portal or voided check.",
    example: "Chase · ****4821",
    critical: true,
    href: "/settings?section=billing",
  },
  {
    id: "accountant_access",
    title: "Accountant access",
    description: "Invite your bookkeeper to IFTA and finance.",
    whyNeeded: "Accountants can download reports without calling dispatch.",
    whereToFind: "Your CPA or bookkeeping firm email.",
    example: "accountant@carrieros.com",
    critical: false,
    href: "/settings?section=users",
  },
  {
    id: "eld_connection",
    title: "ELD connection",
    description: "Connect Motive, Samsara, Geotab, or request another ELD.",
    whyNeeded: "Live GPS, HOS, and IFTA miles import from your ELD.",
    whereToFind: "ELD admin portal or Integration Center.",
    example: "Samsara connected",
    critical: true,
    href: "/integrations/eld",
  },
  {
    id: "fuel_card",
    title: "Fuel card connection",
    description: "Import fuel purchases for IFTA and expenses.",
    whyNeeded: "Reduces missing fuel receipts and tax errors.",
    whereToFind: "Comdata / EFS / WEX admin.",
    example: "WEX fleet card",
    critical: false,
    href: "/integrations",
  },
  {
    id: "email_setup",
    title: "Email setup",
    description: "Outbound address for invoices and rate cons.",
    whyNeeded: "Brokers and drivers receive documents from this mailbox.",
    whereToFind: "Google Workspace or Microsoft 365 admin.",
    example: "dispatch@alphafreight.com",
    critical: false,
    href: "/settings?section=email-templates",
  },
  {
    id: "notification_prefs",
    title: "Notification preferences",
    description: "Choose in-app, email, SMS, and push channels.",
    whyNeeded: "Critical delays and POD requests reach the right people.",
    whereToFind: "Settings → Notifications or Notification Center.",
    example: "Critical → SMS + push",
    critical: false,
    href: "/settings?section=notifications",
  },
  {
    id: "ifta_settings",
    title: "IFTA settings",
    description: "Base jurisdiction and filing quarter.",
    whyNeeded: "One-click IFTA reports need your base state.",
    whereToFind: "State IFTA account or prior return.",
    example: "Base jurisdiction: TX",
    critical: false,
    href: "/ifta",
  },
  {
    id: "payroll_settings",
    title: "Payroll settings",
    description: "CPM, percentage, or salary defaults.",
    whyNeeded: "Settlements calculate correctly for each driver.",
    whereToFind: "Driver contracts or prior payroll export.",
    example: "Company drivers · $0.62 / mile",
    critical: false,
    href: "/finance?tab=payroll",
  },
  {
    id: "safety_documents",
    title: "Safety documents",
    description: "Policies, drug testing, and annual reviews.",
    whyNeeded: "DOT audits expect current safety files on hand.",
    whereToFind: "Safety binder or previous SMS platform.",
    example: "Drug & alcohol policy uploaded",
    critical: true,
    href: "/compliance",
  },
  {
    id: "user_roles",
    title: "User roles and permissions",
    description: "Invite dispatch, safety, and accounting with the right access.",
    whyNeeded: "Prevents accidental edits and keeps sensitive data locked.",
    whereToFind: "Settings → Permissions.",
    example: "Dispatcher · Accounting · Read Only",
    critical: true,
    href: "/settings/permissions",
  },
];

/** Demo completion map — critical gaps left intentional for onboarding UX. */
const DEMO_STATUS: Record<SetupStepId, SetupStep["status"]> = {
  company_profile: "completed",
  mc_dot: "completed",
  address_contacts: "completed",
  trucks: "completed",
  trailers: "recommended",
  drivers: "completed",
  insurance: "needs_review",
  factoring: "recommended",
  bank_details: "missing",
  accountant_access: "recommended",
  eld_connection: "completed",
  fuel_card: "missing",
  email_setup: "completed",
  notification_prefs: "completed",
  ifta_settings: "recommended",
  payroll_settings: "missing",
  safety_documents: "needs_review",
  user_roles: "completed",
};

export function buildSetupProgress(
  overrides?: Partial<Record<SetupStepId, SetupStep["status"]>>,
): SetupProgress {
  const steps: SetupStep[] = STEP_DEFS.map((def) => ({
    ...def,
    status: overrides?.[def.id] ?? DEMO_STATUS[def.id],
  }));

  const completed = steps.filter((s) => s.status === "completed").length;
  const requiredMissing = steps.filter(
    (s) => s.critical && s.status !== "completed",
  ).length;
  const percent = Math.round((completed / steps.length) * 100);

  return {
    percent,
    completed,
    total: steps.length,
    requiredMissing,
    steps,
  };
}

export function setupStatusLabel(status: SetupStep["status"]): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "required":
      return "Required";
    case "recommended":
      return "Recommended";
    case "missing":
      return "Missing";
    case "needs_review":
      return "Needs Review";
  }
}
