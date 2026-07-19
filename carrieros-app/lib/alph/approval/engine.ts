import { appendAlphAudit } from "@/lib/alph/audit/store";
import type {
  AlphApprovalPreview,
  AlphApprovalRequest,
  CreateApprovalInput,
} from "@/lib/alph/approval/types";
import {
  isCriticalAiAction,
  requiresHumanConfirmation,
} from "@/lib/ai-safety/confirmation";
import { can } from "@/lib/permissions/check";

const approvals = new Map<string, AlphApprovalRequest>();

function newId(): string {
  return `alph_ap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function isExpired(row: AlphApprovalRequest, now = Date.now()): boolean {
  return new Date(row.expiresAt).getTime() <= now;
}

export function toAlphApprovalPreview(
  row: AlphApprovalRequest,
): AlphApprovalPreview {
  return {
    proposalId: row.id,
    proposedAction: row.proposedAction,
    recordsAffected: row.recordsAffected,
    financialImpact: row.financialImpact,
    operationalImpact: row.operationalImpact,
    permissionRequired: row.permissionRequired,
    actionKind: row.actionKind,
    expiresAt: row.expiresAt,
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    requiresHumanConfirmation: true,
  };
}

/**
 * Create an approval request — does NOT execute the action.
 * Critical / confirmation-gated kinds always require this path.
 */
export function createAlphApprovalRequest(
  input: CreateApprovalInput,
): AlphApprovalRequest {
  const hours = input.expiresInHours ?? 24;
  const now = new Date();
  const row: AlphApprovalRequest = {
    id: newId(),
    companyId: input.companyId,
    tenantId: input.tenantId,
    userId: input.userId,
    conversationId: input.conversationId,
    requestId: input.requestId,
    status: "pending",
    actionKind: input.actionKind,
    proposedAction: input.proposedAction,
    recordsAffected: input.recordsAffected,
    financialImpact: input.financialImpact,
    operationalImpact: input.operationalImpact,
    permissionRequired: input.permissionRequired,
    preview: input.preview ?? {},
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString(),
    executed: false,
  };
  approvals.set(row.id, row);

  appendAlphAudit({
    requestId: input.requestId,
    companyId: input.companyId,
    tenantId: input.tenantId,
    userId: input.userId,
    event: "approval_created",
    details: row.proposedAction,
    meta: { proposalId: row.id, actionKind: row.actionKind },
  });

  return row;
}

export function getAlphApprovalRequest(filters: {
  id: string;
  companyId: string;
  tenantId: string;
  userId?: string;
}): AlphApprovalRequest | null {
  const row = approvals.get(filters.id);
  if (!row) return null;
  if (row.companyId !== filters.companyId || row.tenantId !== filters.tenantId) {
    return null;
  }
  if (filters.userId && row.userId !== filters.userId) return null;
  if (row.status === "pending" && isExpired(row)) {
    row.status = "expired";
    approvals.set(row.id, row);
  }
  return row;
}

export type DecideApprovalResult =
  | {
      ok: true;
      approval: AlphApprovalRequest;
      preview: AlphApprovalPreview;
      /** Execution is NEVER performed here — caller must run after confirm. */
      mayExecute: boolean;
    }
  | { ok: false; reason: string };

/**
 * Human decision on an approval.
 * Approving does not silently execute — returns mayExecute for the caller
 * to run a verified domain mutation, then markExecutionResult.
 */
export function decideAlphApproval(input: {
  id: string;
  companyId: string;
  tenantId: string;
  userId: string;
  role: string;
  decision: "approve" | "reject" | "cancel";
  note?: string;
}): DecideApprovalResult {
  const row = getAlphApprovalRequest({
    id: input.id,
    companyId: input.companyId,
    tenantId: input.tenantId,
    userId: input.userId,
  });

  if (!row) {
    return { ok: false, reason: "Approval request not found." };
  }
  if (row.status !== "pending") {
    return { ok: false, reason: `Approval is already ${row.status}.` };
  }
  if (isExpired(row)) {
    row.status = "expired";
    approvals.set(row.id, row);
    appendAlphAudit({
      requestId: row.requestId,
      companyId: row.companyId,
      tenantId: row.tenantId,
      userId: input.userId,
      event: "approval_expired",
      meta: { proposalId: row.id },
    });
    return { ok: false, reason: "This approval request has expired." };
  }

  if (!can({ userId: input.userId, role: input.role }, row.permissionRequired)) {
    return {
      ok: false,
      reason: "You no longer have permission for this action.",
    };
  }

  const now = new Date().toISOString();
  if (input.decision === "approve") {
    // Critical kinds always require confirmation — already on this path.
    if (
      !requiresHumanConfirmation(row.actionKind) &&
      !isCriticalAiAction(row.actionKind)
    ) {
      // Still fine — approval flow used explicitly.
    }
    row.status = "approved";
    row.decidedAt = now;
    row.decisionNote = input.note;
    approvals.set(row.id, row);
    appendAlphAudit({
      requestId: row.requestId,
      companyId: row.companyId,
      tenantId: row.tenantId,
      userId: input.userId,
      event: "approval_approved",
      meta: { proposalId: row.id },
    });
    return {
      ok: true,
      approval: row,
      preview: toAlphApprovalPreview(row),
      mayExecute: true,
    };
  }

  row.status = input.decision === "cancel" ? "cancelled" : "rejected";
  row.decidedAt = now;
  row.decisionNote = input.note;
  approvals.set(row.id, row);
  appendAlphAudit({
    requestId: row.requestId,
    companyId: row.companyId,
    tenantId: row.tenantId,
    userId: input.userId,
    event: "approval_rejected",
    details: input.decision,
    meta: { proposalId: row.id },
  });
  return {
    ok: true,
    approval: row,
    preview: toAlphApprovalPreview(row),
    mayExecute: false,
  };
}

/**
 * Mark that a previously approved action was executed (or failed).
 * Never call this without a prior approve decision.
 */
export function markAlphApprovalExecution(input: {
  id: string;
  companyId: string;
  tenantId: string;
  userId: string;
  success: boolean;
  result: string;
}): AlphApprovalRequest | null {
  const row = getAlphApprovalRequest({
    id: input.id,
    companyId: input.companyId,
    tenantId: input.tenantId,
    userId: input.userId,
  });
  if (!row || row.status !== "approved") return null;
  row.executed = input.success;
  row.executionResult = input.result;
  approvals.set(row.id, row);
  appendAlphAudit({
    requestId: row.requestId,
    companyId: row.companyId,
    tenantId: row.tenantId,
    userId: input.userId,
    event: "execution_result",
    details: input.result,
    meta: { proposalId: row.id, success: input.success },
  });
  return row;
}

/**
 * Hard rule: critical actions cannot execute without an approved proposal.
 */
export function canExecuteCriticalAlphAction(proposalId: string | undefined | null): boolean {
  if (!proposalId) return false;
  const row = approvals.get(proposalId);
  if (!row) return false;
  if (row.status !== "approved") return false;
  if (isExpired(row)) return false;
  if (row.executed) return false;
  return true;
}

export function listPendingAlphApprovals(filters: {
  companyId: string;
  tenantId: string;
  userId: string;
  limit?: number;
}): AlphApprovalRequest[] {
  const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
  return Array.from(approvals.values())
    .filter(
      (a) =>
        a.companyId === filters.companyId &&
        a.tenantId === filters.tenantId &&
        a.userId === filters.userId &&
        a.status === "pending" &&
        !isExpired(a),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function clearAlphApprovalsForTests(): void {
  approvals.clear();
}
