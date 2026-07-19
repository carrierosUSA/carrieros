/**
 * Workspace focuses for Alph — ONE assistant, context changes by workspace.
 * Routes under /alph/copilot/* remain available as focus entry points (not separate AIs).
 */
import type { AlphAgent } from "@/lib/alph/types";

export const ALPH_AGENTS: AlphAgent[] = [
  {
    id: "dispatch",
    name: "Alph · Dispatch",
    description:
      "Same Alph — focused on loads, drivers, ETAs, detention, and exceptions.",
    status: "ready",
    statusLabel: "Open focus",
  },
  {
    id: "finance",
    name: "Alph · Finance",
    description:
      "Same Alph — focused on invoices, cash, settlements, and payroll drafts.",
    status: "ready",
    statusLabel: "Open focus",
  },
  {
    id: "safety",
    name: "Alph · Safety",
    description:
      "Same Alph — focused on CDL, medical, and compliance expirations.",
    status: "ready",
    statusLabel: "Open focus",
  },
  {
    id: "maintenance",
    name: "Alph · Fleet",
    description:
      "Same Alph — focused on PM due, work orders, and trucks in the shop.",
    status: "ready",
    statusLabel: "Open focus",
  },
];

const AGENT_COPILOT_HREF: Record<AlphAgent["id"], string> = {
  dispatch: "/alph/copilot/dispatcher",
  finance: "/alph/copilot/accounting",
  safety: "/alph/copilot/safety",
  maintenance: "/alph/copilot/maintenance",
};

export function listAlphAgents(): AlphAgent[] {
  return ALPH_AGENTS;
}

export function getAlphAgent(id: AlphAgent["id"]): AlphAgent | undefined {
  return ALPH_AGENTS.find((agent) => agent.id === id);
}

export function getAlphAgentCopilotHref(id: AlphAgent["id"]): string {
  return AGENT_COPILOT_HREF[id] ?? "/alph/copilot";
}
