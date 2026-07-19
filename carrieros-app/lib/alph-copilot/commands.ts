import {
  alphIntentToActionKind,
  appendAiAudit,
  getAiActionLabel,
} from "@/lib/ai-safety";
import type {
  CopilotCommandDef,
  CopilotCommandResult,
  CopilotRole,
} from "@/lib/alph-copilot/types";

function commandToActionKind(cmd: CopilotCommandDef) {
  return alphIntentToActionKind(cmd.id);
}

export const COPILOT_COMMANDS: CopilotCommandDef[] = [
  {
    id: "handle_payroll",
    phrase: "Handle payroll.",
    label: "Handle payroll",
    description: "Prepare driver settlements for review.",
    roles: ["accounting", "owner"],
    href: "/payroll",
    risk: "confirm",
    demoResult:
      "Prepared payroll for 12 drivers — $48,620 total. Review settlements before releasing.",
    keywords: ["payroll", "handle payroll", "run payroll", "settlements"],
  },
  {
    id: "create_invoices",
    phrase: "Create invoices.",
    label: "Create invoices",
    description: "Draft invoices from delivered loads with POD.",
    roles: ["accounting", "owner"],
    href: "/finance",
    risk: "confirm",
    demoResult:
      "Drafted 4 invoices totaling $31,240. Missing docs blocked 2 loads.",
    keywords: ["create invoices", "invoice", "invoices", "bill"],
  },
  {
    id: "assign_best_driver",
    phrase: "Assign best driver.",
    label: "Assign best driver",
    description: "Match open loads to the best available driver/truck.",
    roles: ["dispatcher", "owner"],
    href: "/loads",
    risk: "confirm",
    demoResult:
      "Suggested Maria Lopez + Unit 105 for LD-24022 (score 94). Confirm to assign.",
    keywords: ["assign best", "best driver", "assign driver", "match driver"],
  },
  {
    id: "find_reload",
    phrase: "Find reload.",
    label: "Find reload",
    description: "Backhaul options near empty or soon-empty trucks.",
    roles: ["dispatcher", "owner", "driver"],
    href: "/loads",
    risk: "safe",
    demoResult:
      "Found 3 reloads within 80 miles of Unit 104 — best pays $2.90/mi to Atlanta.",
    keywords: ["reload", "backhaul", "find reload", "return load"],
  },
  {
    id: "schedule_maintenance",
    phrase: "Schedule maintenance.",
    label: "Schedule maintenance",
    description: "Book the next PM or repair window.",
    roles: ["maintenance", "owner", "dispatcher"],
    href: "/fleet/maintenance",
    risk: "confirm",
    demoResult:
      "Reserved Tuesday 9am bay for Unit 108 PM. Parts check: oil + filters in stock.",
    keywords: ["schedule maintenance", "book service", "pm", "maintenance"],
  },
  {
    id: "prepare_ifta",
    phrase: "Prepare IFTA.",
    label: "Prepare IFTA",
    description: "Build the quarterly fuel tax package.",
    roles: ["accounting", "owner"],
    href: "/ifta",
    risk: "safe",
    demoResult:
      "IFTA Q2 package ready — 48,120 miles, 7,840 gallons. Open IFTA to file.",
    keywords: ["ifta", "prepare ifta", "fuel tax"],
  },
  {
    id: "show_todays_profit",
    phrase: "Show today's profit.",
    label: "Show today's profit",
    description: "Net margin snapshot for today.",
    roles: ["owner", "accounting"],
    href: "/dashboard",
    risk: "safe",
    demoResult:
      "Today's profit: $4,820 (18.4% margin). Fuel up $310 vs yesterday.",
    keywords: ["today's profit", "profit", "show profit", "net margin"],
  },
  {
    id: "find_truck_wash",
    phrase: "Find nearest truck wash.",
    label: "Find nearest truck wash",
    description: "Wash options near the current route.",
    roles: ["driver"],
    href: "/driver/services",
    risk: "safe",
    demoResult:
      "Closest wash: Blue Beacon Dallas — 6.4 mi, open until 10pm, ~$65 tractor.",
    keywords: ["truck wash", "nearest wash", "wash"],
  },
  {
    id: "find_fuel_discount",
    phrase: "Show fuel discounts nearby.",
    label: "Fuel discounts nearby",
    description: "Cheapest fuel along the route.",
    roles: ["driver", "owner"],
    href: "/driver/services",
    risk: "safe",
    demoResult: "Love's I-35 is $0.18/gal below average — 12 miles ahead.",
    keywords: ["fuel discount", "fuel", "cheap fuel", "gas"],
  },
  {
    id: "show_expiring_docs",
    phrase: "Show expiring medical cards.",
    label: "Show expiring docs",
    description: "CDL, medical, and insurance windows.",
    roles: ["safety", "owner", "driver"],
    href: "/compliance",
    risk: "safe",
    demoResult: "2 medical cards and 1 CDL expire within 21 days.",
    keywords: ["expiring", "medical", "cdl", "expiry"],
  },
  {
    id: "show_pm_due",
    phrase: "Show PM due.",
    label: "Show PM due",
    description: "Units approaching or past service.",
    roles: ["maintenance", "owner"],
    href: "/fleet/maintenance",
    risk: "safe",
    demoResult: "3 units need PM — Unit 108 is overdue by 180 miles.",
    keywords: ["pm due", "maintenance due", "service due"],
  },
  {
    id: "morning_brief",
    phrase: "Morning briefing.",
    label: "Morning briefing",
    description: "Priorities, risks, and opportunities.",
    roles: ["owner", "dispatcher", "accounting", "safety", "maintenance"],
    href: "/alph/copilot/owner",
    risk: "safe",
    demoResult:
      "3 priorities, 2 cash risks, 1 high-pay opportunity. Open Owner Alph for the full brief.",
    keywords: ["morning briefing", "briefing", "brief", "priorities"],
  },
  {
    id: "remind_pod",
    phrase: "Remind me about POD.",
    label: "POD reminder",
    description: "Prompt for proof of delivery capture.",
    roles: ["driver", "accounting"],
    href: "/driver/documents",
    risk: "safe",
    demoResult: "POD reminder set for load LD-24019 — capture when you deliver.",
    keywords: ["pod", "proof of delivery", "remind pod"],
  },
  {
    id: "show_delayed_loads",
    phrase: "Show delayed loads.",
    label: "Show delayed loads",
    description: "Loads behind ETA.",
    roles: ["dispatcher", "owner"],
    href: "/loads",
    risk: "safe",
    demoResult: "2 loads delayed — LD-24012 (47 min) and LD-24008 (22 min).",
    keywords: ["delayed", "delay", "late loads", "eta"],
  },
  {
    id: "reduce_empty_miles",
    phrase: "Reduce empty miles.",
    label: "Reduce empty miles",
    description: "Opportunities to cut deadhead.",
    roles: ["dispatcher", "owner"],
    href: "/loads",
    risk: "safe",
    demoResult:
      "Cutting Unit 104's deadhead by 110 mi via a Dallas pickup — saves ~$165.",
    keywords: ["empty miles", "deadhead", "reduce empty"],
  },
  {
    id: "open_copilot",
    phrase: "Open Alph Copilot.",
    label: "Open Alph Copilot™",
    description: "Role-specific AI employee home.",
    roles: "all",
    href: "/alph/copilot",
    risk: "safe",
    demoResult: "Opening Alph Copilot™ — your role-specific AI employee.",
    keywords: ["copilot", "alph copilot", "open copilot"],
  },
];

export function listCopilotCommands(role?: CopilotRole): CopilotCommandDef[] {
  if (!role) return COPILOT_COMMANDS;
  return COPILOT_COMMANDS.filter(
    (cmd) => cmd.roles === "all" || cmd.roles.includes(role),
  );
}

export function getCopilotCommand(id: string): CopilotCommandDef | undefined {
  return COPILOT_COMMANDS.find((cmd) => cmd.id === id);
}

export function matchCopilotCommand(
  raw: string,
  role?: CopilotRole,
): CopilotCommandDef | undefined {
  const lower = raw.trim().toLowerCase().replace(/[.!?]+$/, "");
  if (!lower) return undefined;

  const pool = listCopilotCommands(role);
  let best: { cmd: CopilotCommandDef; score: number } | undefined;

  for (const cmd of pool) {
    let score = 0;
    const phrase = cmd.phrase.toLowerCase().replace(/[.!?]+$/, "");
    if (lower === phrase || lower === cmd.label.toLowerCase()) {
      score = 1;
    } else if (lower.includes(phrase) || phrase.includes(lower)) {
      score = 0.92;
    } else {
      for (const kw of cmd.keywords) {
        if (lower.includes(kw)) {
          score = Math.max(score, 0.7 + Math.min(kw.length, 20) / 100);
        }
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { cmd, score };
    }
  }

  return best && best.score >= 0.7 ? best.cmd : undefined;
}

export function runCopilotCommand(
  rawOrId: string,
  options?: {
    role?: CopilotRole;
    confirmed?: boolean;
    byId?: boolean;
    /** When the AI Safety gate already wrote the audit trail. */
    skipAudit?: boolean;
  },
): CopilotCommandResult | { needsConfirm: true; command: CopilotCommandDef } {
  const cmd = options?.byId
    ? getCopilotCommand(rawOrId)
    : matchCopilotCommand(rawOrId, options?.role) ??
      getCopilotCommand(rawOrId);

  if (!cmd) {
    return {
      commandId: "unknown",
      phrase: rawOrId,
      title: "Command not recognized",
      body: 'Try "Assign best driver.", "Handle payroll.", or "Show today\'s profit."',
      requiresConfirm: false,
      ranAt: new Date().toISOString(),
    };
  }

  if (cmd.risk === "confirm" && !options?.confirmed) {
    if (!options?.skipAudit) {
      appendAiAudit({
        actionKind: commandToActionKind(cmd),
        aiAction: `Alph Copilot™ · ${getAiActionLabel(commandToActionKind(cmd))}`,
        suggestion: cmd.label,
        approval: "pending",
        reason: cmd.description,
        confidence: "review_recommended",
        dataUsed: ["Alph Copilot™ command catalog", cmd.phrase],
        source: "alph-copilot",
      });
    }
    return { needsConfirm: true, command: cmd };
  }

  const result: CopilotCommandResult = {
    commandId: cmd.id,
    phrase: cmd.phrase,
    title: cmd.label,
    body: cmd.demoResult,
    href: cmd.href,
    requiresConfirm: cmd.risk === "confirm",
    confirmed: options?.confirmed ?? cmd.risk === "safe",
    ranAt: new Date().toISOString(),
  };

  if (!options?.skipAudit) {
    appendAiAudit({
      actionKind: commandToActionKind(cmd),
      aiAction: `Alph Copilot™ · ${cmd.label}`,
      suggestion: cmd.phrase,
      approval: cmd.risk === "confirm" ? "approved" : "not_required",
      reason: cmd.description,
      confidence: cmd.risk === "confirm" ? "review_recommended" : "high",
      dataUsed: ["Alph Copilot™ command catalog", cmd.phrase],
      source: "alph-copilot",
    });
  }

  return result;
}
