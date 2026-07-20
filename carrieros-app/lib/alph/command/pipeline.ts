/**
 * Shared command pipeline foundation for chat + voice + document inbox.
 * Never executes critical side effects without approval.
 */

import { appendAlphAudit } from "@/lib/alph/audit/store";
import { createAlphApprovalRequest } from "@/lib/alph/approval";
import {
  actionAllowedAtAutopilotMode,
  confidenceRequiresReview,
  getAlphAutopilotSettings,
  ruleRequiresApproval,
} from "@/lib/alph/autopilot";
import type {
  AlphCommandPreview,
  AlphCommandResult,
  AlphCommandSource,
  AlphUnderstoodCommand,
} from "@/lib/alph/command/types";
import { parseAlphMode, type AlphMode } from "@/lib/alph/modes";
import {
  alphIntentToActionKind,
  type AiActionKind,
} from "@/lib/ai-safety/confirmation";
import { can } from "@/lib/permissions/check";
import type { PermissionId } from "@/lib/permissions/types";
import { getCurrentSession } from "@/lib/auth/session";
import { getActiveTenantId } from "@/lib/data/tenant";

function newRequestId(): string {
  return `alph_cmd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function understandAlphCommand(input: {
  raw: string;
  source?: AlphCommandSource;
  mode?: AlphMode | string;
  actionKind?: AiActionKind;
  confidence?: number;
  entities?: AlphUnderstoodCommand["entities"];
  intentSummary?: string;
}): AlphUnderstoodCommand {
  const settings = getAlphAutopilotSettings();
  const mode = parseAlphMode(input.mode);
  const raw = input.raw.trim();
  const actionKind =
    input.actionKind ??
    alphIntentToActionKind(
      /\b(create|assign|send|pay|delete|invoice|dispatch)\b/i.test(raw)
        ? "act"
        : "ask",
    );

  return {
    requestId: newRequestId(),
    source: input.source ?? "chat",
    raw,
    mode,
    autopilotMode: settings.mode,
    intentSummary: input.intentSummary ?? raw.slice(0, 160),
    actionKind,
    confidence: input.confidence ?? 0.8,
    entities: input.entities ?? {},
  };
}

export function buildAlphCommandPreview(input: {
  understood: AlphUnderstoodCommand;
  title: string;
  summary: string;
  proposedAction: string;
  recordsAffected?: AlphCommandPreview["recordsAffected"];
  financialImpact?: string;
  operationalImpact?: string;
  permissionRequired: PermissionId;
  preview?: Record<string, unknown>;
  issues?: string[];
}): AlphCommandPreview {
  const settings = getAlphAutopilotSettings();
  const eligibility = actionAllowedAtAutopilotMode(
    input.understood.actionKind,
    input.understood.autopilotMode,
  );
  const needsApproval =
    ruleRequiresApproval(input.understood.actionKind, settings) ||
    confidenceRequiresReview(input.understood.confidence, settings) ||
    !eligibility.allowed ||
    input.understood.mode === "act";

  const issues = [...(input.issues ?? [])];
  if (confidenceRequiresReview(input.understood.confidence, settings)) {
    issues.push(
      `Confidence ${(input.understood.confidence * 100).toFixed(0)}% is below company threshold (${(settings.minConfidenceToAct * 100).toFixed(0)}%).`,
    );
  }
  if (!eligibility.allowed) {
    issues.push(eligibility.reason);
  }

  return {
    requestId: input.understood.requestId,
    title: input.title,
    summary: input.summary,
    proposedAction: input.proposedAction,
    recordsAffected: input.recordsAffected ?? [],
    financialImpact: input.financialImpact,
    operationalImpact: input.operationalImpact,
    permissionRequired: input.permissionRequired,
    actionKind: input.understood.actionKind,
    requiresApproval: needsApproval,
    issues,
    preview: input.preview ?? {},
  };
}

/**
 * Move preview → approval request (or blocked / result for non-write previews).
 * Does not execute domain mutations.
 */
export function requestAlphCommandApproval(input: {
  preview: AlphCommandPreview;
  conversationId?: string;
}): AlphCommandResult {
  const session = getCurrentSession();
  const tenantId = getActiveTenantId();

  if (
    !can(
      {
        userId: session.userId,
        role: session.role,
      },
      input.preview.permissionRequired,
    )
  ) {
    const audit = appendAlphAudit({
      requestId: input.preview.requestId,
      companyId: session.companyId,
      tenantId,
      userId: session.userId,
      event: "tool_denied",
      details: input.preview.proposedAction,
      meta: { permission: input.preview.permissionRequired },
    });
    return {
      requestId: input.preview.requestId,
      phase: "blocked",
      ok: false,
      title: "Permission denied",
      body: `You need ${input.preview.permissionRequired} to continue.`,
      auditId: audit.id,
    };
  }

  if (!input.preview.requiresApproval) {
    const audit = appendAlphAudit({
      requestId: input.preview.requestId,
      companyId: session.companyId,
      tenantId,
      userId: session.userId,
      event: "draft_created",
      details: input.preview.proposedAction,
      meta: { title: input.preview.title },
    });
    return {
      requestId: input.preview.requestId,
      phase: "result",
      ok: true,
      title: input.preview.title,
      body: "Draft ready — no write executed.",
      auditId: audit.id,
    };
  }

  const approval = createAlphApprovalRequest({
    companyId: session.companyId,
    tenantId,
    userId: session.userId,
    conversationId: input.conversationId,
    requestId: input.preview.requestId,
    actionKind: input.preview.actionKind,
    proposedAction: input.preview.proposedAction,
    recordsAffected: input.preview.recordsAffected,
    financialImpact: input.preview.financialImpact,
    operationalImpact: input.preview.operationalImpact,
    permissionRequired: input.preview.permissionRequired,
    preview: {
      ...input.preview.preview,
      summary: input.preview.summary,
      issues: input.preview.issues,
    },
  });

  return {
    requestId: input.preview.requestId,
    phase: "approve",
    ok: true,
    title: "Approval required",
    body: input.preview.summary,
    approvalId: approval.id,
  };
}
