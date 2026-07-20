/**
 * Shared Alph command/action architecture:
 * understand → preview → approve → result
 */

import type { AiActionKind } from "@/lib/ai-safety/confirmation";
import type { AutopilotMode } from "@/lib/alph/autopilot/modes";
import type { AlphMode } from "@/lib/alph/modes";
import type { PermissionId } from "@/lib/permissions/types";

export type AlphCommandPhase =
  | "understand"
  | "preview"
  | "approve"
  | "result"
  | "rejected"
  | "blocked";

export type AlphCommandSource = "chat" | "voice" | "document_inbox" | "system";

export type AlphUnderstoodCommand = {
  requestId: string;
  source: AlphCommandSource;
  raw: string;
  mode: AlphMode;
  autopilotMode: AutopilotMode;
  intentSummary: string;
  actionKind: AiActionKind;
  confidence: number;
  entities: Record<string, string | number | boolean | null>;
};

export type AlphCommandPreview = {
  requestId: string;
  title: string;
  summary: string;
  proposedAction: string;
  recordsAffected: Array<{ type: string; id: string; label?: string }>;
  financialImpact?: string;
  operationalImpact?: string;
  permissionRequired: PermissionId;
  actionKind: AiActionKind;
  requiresApproval: boolean;
  issues: string[];
  preview: Record<string, unknown>;
};

export type AlphCommandResult = {
  requestId: string;
  phase: AlphCommandPhase;
  ok: boolean;
  title: string;
  body: string;
  approvalId?: string;
  resultRef?: { type: string; id: string; href?: string };
  auditId?: string;
};
