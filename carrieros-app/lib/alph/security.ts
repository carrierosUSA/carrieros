/**
 * Alph must not bypass RBAC or Constitution confirmation gates.
 * Maps intents → permission checks; critical kinds stay assist-only.
 *
 * @see docs/architecture/security/07-alph-security.md
 * @see docs/architecture/api/12-alph.md
 */

import {
  alphIntentToActionKind,
  isCriticalAiAction,
  requiresHumanConfirmation,
} from "@/lib/ai-safety/confirmation";
import { getCurrentSession } from "@/lib/auth/session";
import { can, permissionDeniedReason } from "@/lib/permissions/check";
import type { PermissionId } from "@/lib/permissions/types";
import type { AlphIntentId, AlphParsedCommand, AlphResult } from "@/lib/alph/types";
import { logSecurityEvent } from "@/lib/security/audit";

/** Minimum page/button permission required to run an Alph intent. */
const INTENT_PERMISSIONS: Partial<Record<AlphIntentId, PermissionId>> = {
  show_loads: "page.loads.view",
  open_dispatch: "page.loads.view",
  open_load: "page.loads.view",
  create_load: "button.loads.create",
  assign_driver: "button.loads.assign",
  assign_best_driver: "button.loads.assign",
  find_reload: "page.loads.view",
  find_drivers: "page.drivers.view",
  open_driver: "page.drivers.view",
  driver_performance: "page.drivers.view",
  show_fleet: "page.fleet.view",
  open_truck: "page.fleet.view",
  replay_truck: "page.fleet.view",
  show_maintenance: "page.fleet.view",
  show_maintenance_due: "page.fleet.view",
  schedule_maintenance: "button.fleet.manage",
  show_finance: "page.finance.view",
  find_unpaid_invoices: "page.finance.view",
  create_invoice: "button.finance.create",
  pay_invoice: "button.finance.approve",
  show_cash_flow: "page.finance.view",
  who_owes_money: "page.finance.view",
  why_profit_down: "page.finance.view",
  show_todays_profit: "page.finance.view",
  top_profit_truck: "page.finance.view",
  generate_payroll: "button.payroll.create",
  handle_payroll: "button.payroll.create",
  show_documents: "page.documents.view",
  loads_missing_pod: "page.documents.view",
  upload_pod: "button.documents.upload",
  show_compliance: "page.compliance.view",
  show_expiring: "page.compliance.view",
  generate_ifta: "page.compliance.view",
  show_brokers: "page.brokers.view",
  open_broker: "page.brokers.view",
  best_broker: "page.brokers.view",
  show_analytics: "page.analytics.view",
  open_settings: "page.settings.view",
  open_security: "button.settings.manage",
  open_automation: "button.settings.manage",
  start_import: "button.settings.manage",
  open_migration: "button.settings.manage",
};

export type AlphGateResult =
  | { allowed: true; permission?: PermissionId }
  | { allowed: false; permission: PermissionId; reason: string };

export function permissionForAlphIntent(
  intent: AlphIntentId,
): PermissionId | null {
  return INTENT_PERMISSIONS[intent] ?? null;
}

/**
 * Alph runs with the acting user's permissions — never elevated.
 * Intents without a mapping are allowed (navigation / help) but still
 * cannot execute critical side effects (executor is assist-only today).
 */
export function gateAlphIntent(intent: AlphIntentId): AlphGateResult {
  const permission = permissionForAlphIntent(intent);
  if (!permission) {
    return { allowed: true };
  }

  const session = getCurrentSession();
  if (can(session, permission)) {
    return { allowed: true, permission };
  }

  const reason =
    permissionDeniedReason(session, permission) ??
    "You don't have permission for this Alph action.";

  return { allowed: false, permission, reason };
}

export function alphPermissionDeniedResult(
  parsed: AlphParsedCommand,
  reason: string,
): AlphResult {
  logSecurityEvent({
    kind: "alph.denied",
    resource: "alph",
    resourceId: parsed.intent,
    details: reason,
  });

  return {
    type: "clarify",
    title: "Permission required",
    body: `${reason} Alph uses your permissions and cannot bypass them.`,
    confidence: parsed.confidence,
    intent: parsed.intent,
    actions: [
      { label: "Permissions", href: "/settings/permissions", primary: true },
      { label: "AI Safety Policy", href: "/settings/ai-policy" },
    ],
  };
}

/**
 * Annotate critical / confirmation-gated intents so UI copy stays honest:
 * Alph assists; humans decide. Does not change navigation behavior.
 */
export function annotateAlphCriticalAssist(result: AlphResult): AlphResult {
  const kind = alphIntentToActionKind(result.intent);
  const critical = isCriticalAiAction(kind);
  const needsConfirm = requiresHumanConfirmation(kind);
  if (!critical && !needsConfirm) return result;

  const note =
    " Alph will not execute this without your confirmation — critical actions always need a human decision.";
  if (result.body?.includes("will not execute")) return result;
  return {
    ...result,
    body: result.body ? `${result.body}${note}` : note.trim(),
    data: {
      ...result.data,
      requiresHumanConfirmation: true,
      critical,
      actionKind: kind,
    },
  };
}
