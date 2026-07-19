import type { CarrierOSRole } from "@/lib/auth/session";
import type {
  CopilotRole,
  CopilotRoleDefinition,
} from "@/lib/alph-copilot/types";

export const COPILOT_ROLES: CopilotRole[] = [
  "driver",
  "dispatcher",
  "safety",
  "maintenance",
  "accounting",
  "owner",
];

export const COPILOT_ROLE_DEFS: Record<CopilotRole, CopilotRoleDefinition> = {
  driver: {
    id: "driver",
    name: "Alph · Driver",
    title: "Your trip co-pilot",
    tagline:
      "Pickup, delivery, fuel, breaks, weather, parking, POD, and inspections — before you need them.",
    href: "/alph/copilot/driver",
    capabilities: [
      "Pickup & delivery reminders",
      "Fuel & break timing",
      "Weather & parking nearby",
      "Documents & POD prompts",
      "Inspection & DVIR nudges",
      "Medical / CDL expiry watch",
      "Truck maintenance alerts",
    ],
    suggestedActions: [
      {
        id: "d-open-driver-app",
        label: "Open Driver App",
        href: "/driver",
        description: "Trips, docs, and messages on the road",
      },
      {
        id: "d-upload-pod",
        label: "Upload POD",
        href: "/driver/documents",
        description: "Capture proof of delivery now",
      },
      {
        id: "d-find-fuel",
        label: "Find fuel discount",
        commandId: "find_fuel_discount",
        description: "Nearest stop with a better price",
      },
      {
        id: "d-truck-wash",
        label: "Nearest truck wash",
        commandId: "find_truck_wash",
        description: "Wash options along your route",
      },
    ],
    commandChips: [
      "Find nearest truck wash.",
      "Remind me about POD.",
      "Show fuel discounts nearby.",
      "Check my medical expiry.",
    ],
  },
  dispatcher: {
    id: "dispatcher",
    name: "Alph · Dispatch",
    title: "Assign, monitor, recover",
    tagline:
      "Best driver/truck fits, delay detection, ETA, detention, reloads, and empty miles — one command away.",
    href: "/alph/copilot/dispatcher",
    capabilities: [
      "Suggest best driver & truck",
      "Detect delays & ETA drift",
      "Detention monitoring",
      "Reload / backhaul suggestions",
      "Empty mile reduction",
      "Delivery prediction",
      "Hours-of-service watch",
    ],
    suggestedActions: [
      {
        id: "dp-assign-best",
        label: "Assign best driver",
        commandId: "assign_best_driver",
        description: "Match open loads to available capacity",
      },
      {
        id: "dp-find-reload",
        label: "Find reload",
        commandId: "find_reload",
        description: "Backhaul options near empty trucks",
      },
      {
        id: "dp-open-loads",
        label: "Open Dispatch",
        href: "/loads",
        description: "Full load board",
      },
      {
        id: "dp-monitor-eta",
        label: "Monitor ETAs",
        href: "/loads",
        description: "Loads at risk of late delivery",
      },
    ],
    commandChips: [
      "Assign best driver.",
      "Find reload.",
      "Show delayed loads.",
      "Reduce empty miles.",
    ],
  },
  safety: {
    id: "safety",
    name: "Alph · Safety",
    title: "Risk before it becomes a violation",
    tagline:
      "Speeding, hard braking, hours, inspections, medical/license expiry, and risk scores — calm and clear.",
    href: "/alph/copilot/safety",
    capabilities: [
      "Speeding & hard-braking events",
      "Seatbelt & hours alerts",
      "Inspection readiness",
      "Violation tracking",
      "Medical / license expiry",
      "Accident follow-up",
      "Driver risk scores",
    ],
    suggestedActions: [
      {
        id: "s-compliance",
        label: "Open Compliance",
        href: "/compliance",
        description: "DOT, medical, and insurance status",
      },
      {
        id: "s-expiring",
        label: "Show expiring docs",
        commandId: "show_expiring_docs",
        description: "CDL, medical, and insurance windows",
      },
      {
        id: "s-risk",
        label: "Review risk scores",
        href: "/compliance",
        description: "Drivers needing coaching",
      },
      {
        id: "s-events",
        label: "Today's safety events",
        href: "/compliance",
        description: "Speeding, braking, hours",
      },
    ],
    commandChips: [
      "Show expiring medical cards.",
      "Who has high risk score?",
      "Open compliance.",
      "List inspection due.",
    ],
  },
  maintenance: {
    id: "maintenance",
    name: "Alph · Fleet",
    title: "Keep the fleet moving",
    tagline:
      "PM due, open issues, shop status, and parts from Exchange — before a truck goes down.",
    href: "/alph/copilot/maintenance",
    capabilities: [
      "PM due scheduling",
      "Open repair issues",
      "Shop status tracking",
      "Parts sourcing (Exchange)",
      "Idle & fuel waste signals",
      "Breakdown triage",
    ],
    suggestedActions: [
      {
        id: "m-schedule",
        label: "Schedule maintenance",
        commandId: "schedule_maintenance",
        description: "Book the next PM window",
      },
      {
        id: "m-open",
        label: "Open Maintenance",
        href: "/fleet/maintenance",
        description: "Work orders and PM board",
      },
      {
        id: "m-parts",
        label: "Find parts",
        href: "/exchange/parts",
        description: "Exchange parts & services",
      },
      {
        id: "m-pm-due",
        label: "Show PM due",
        commandId: "show_pm_due",
        description: "Units approaching service",
      },
    ],
    commandChips: [
      "Schedule maintenance.",
      "Show PM due.",
      "Find OEM parts.",
      "Which trucks are in shop?",
    ],
  },
  accounting: {
    id: "accounting",
    name: "Alph · Finance",
    title: "Cash in, paperwork out",
    tagline:
      "POD → invoice, fuel match, expenses, payroll, factoring, and missing docs — without the spreadsheet chase.",
    href: "/alph/copilot/accounting",
    capabilities: [
      "Read POD & draft invoices",
      "Match fuel receipts",
      "Reconcile expenses",
      "Prepare payroll",
      "Flag missing documents",
      "Customer payments & factoring",
      "Financial reports",
    ],
    suggestedActions: [
      {
        id: "a-payroll",
        label: "Handle payroll",
        commandId: "handle_payroll",
        description: "Prepare settlements for review",
      },
      {
        id: "a-invoices",
        label: "Create invoices",
        commandId: "create_invoices",
        description: "Draft from delivered loads with POD",
      },
      {
        id: "a-ifta",
        label: "Prepare IFTA",
        commandId: "prepare_ifta",
        description: "Quarterly fuel tax package",
      },
      {
        id: "a-finance",
        label: "Open Finance",
        href: "/finance",
        description: "Cash flow and receivables",
      },
    ],
    commandChips: [
      "Handle payroll.",
      "Create invoices.",
      "Prepare IFTA.",
      "Show overdue payments.",
    ],
  },
  owner: {
    id: "owner",
    name: "Alph · Owner",
    title: "Morning brief for the business",
    tagline:
      "Revenue, profit, cash, fleet health, fuel, drivers, customers, and the top problems — before coffee cools.",
    href: "/alph/copilot/owner",
    capabilities: [
      "Morning executive brief",
      "Revenue & profit snapshot",
      "Cash flow watch",
      "Fleet & fuel health",
      "Driver performance",
      "Customer health",
      "Top problems + AI recommendations",
    ],
    suggestedActions: [
      {
        id: "o-profit",
        label: "Today's profit",
        commandId: "show_todays_profit",
        description: "Net margin for the day",
      },
      {
        id: "o-dashboard",
        label: "Executive dashboard",
        href: "/dashboard",
        description: "Full command board",
      },
      {
        id: "o-command",
        label: "Command Center",
        href: "/platform/command",
        description: "Business health live",
      },
      {
        id: "o-brief",
        label: "Morning briefing",
        commandId: "morning_brief",
        description: "Priorities, risks, opportunities",
      },
    ],
    commandChips: [
      "Show today's profit.",
      "Morning briefing.",
      "Why is profit down?",
      "Show fleet health.",
    ],
  },
};

export function getCopilotRoleDef(role: CopilotRole): CopilotRoleDefinition {
  return COPILOT_ROLE_DEFS[role];
}

export function listCopilotRoles(): CopilotRoleDefinition[] {
  return COPILOT_ROLES.map((id) => COPILOT_ROLE_DEFS[id]);
}

/** Map CarrierOS session role → Copilot role for default selection. */
export function sessionRoleToCopilotRole(
  sessionRole: CarrierOSRole,
): CopilotRole {
  switch (sessionRole) {
    case "driver":
      return "driver";
    case "dispatcher":
      return "dispatcher";
    case "safety":
      return "safety";
    case "maintenance":
    case "mechanic":
    case "fleet_manager":
      return "maintenance";
    case "accounting":
    case "accountant":
      return "accounting";
    case "owner":
    case "super_admin":
    default:
      return "owner";
  }
}

export function isCopilotRole(value: string): value is CopilotRole {
  return (COPILOT_ROLES as string[]).includes(value);
}
