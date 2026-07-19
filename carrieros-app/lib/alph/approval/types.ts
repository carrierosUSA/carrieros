import type { AiActionKind } from "@/lib/ai-safety/confirmation";
import type { PermissionId } from "@/lib/permissions/types";

export type AlphApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "cancelled";

export type AlphApprovalRequest = {
  id: string;
  companyId: string;
  tenantId: string;
  userId: string;
  conversationId?: string;
  requestId: string;
  status: AlphApprovalStatus;
  actionKind: AiActionKind;
  proposedAction: string;
  recordsAffected: Array<{ type: string; id: string; label?: string }>;
  financialImpact?: string;
  operationalImpact?: string;
  permissionRequired: PermissionId;
  preview: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
  decidedAt?: string;
  decisionNote?: string;
  /** Never true without explicit human approval + verified run. */
  executed: boolean;
  executionResult?: string;
};

export type CreateApprovalInput = {
  companyId: string;
  tenantId: string;
  userId: string;
  conversationId?: string;
  requestId: string;
  actionKind: AiActionKind;
  proposedAction: string;
  recordsAffected: Array<{ type: string; id: string; label?: string }>;
  financialImpact?: string;
  operationalImpact?: string;
  permissionRequired: PermissionId;
  preview?: Record<string, unknown>;
  expiresInHours?: number;
};

/** UI-facing approval preview — required for critical ACT. */
export type AlphApprovalPreview = {
  proposalId: string;
  proposedAction: string;
  recordsAffected: AlphApprovalRequest["recordsAffected"];
  financialImpact?: string;
  operationalImpact?: string;
  permissionRequired: PermissionId;
  actionKind: AiActionKind;
  expiresAt: string;
  confirmLabel: string;
  cancelLabel: string;
  requiresHumanConfirmation: true;
};
