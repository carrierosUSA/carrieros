import type { AlphMode } from "@/lib/alph/modes";
import type { AlphToolId } from "@/lib/alph/tools/types";
import type { AlphWorkspaceFocus } from "@/lib/alph/identity";

export type AlphAuditEvent =
  | "prompt"
  | "context_built"
  | "tool_requested"
  | "tool_executed"
  | "tool_failed"
  | "tool_denied"
  | "tool_validation_failed"
  | "tool_rate_limited"
  | "draft_created"
  | "recommendation"
  | "approval_created"
  | "approval_approved"
  | "approval_rejected"
  | "approval_expired"
  | "execution_result"
  | "stream_started"
  | "stream_cancelled"
  | "error";

export type AlphAuditEntry = {
  id: string;
  at: string;
  requestId: string;
  companyId: string;
  tenantId: string;
  userId: string;
  workspace?: AlphWorkspaceFocus;
  event: AlphAuditEvent;
  mode?: AlphMode;
  toolId?: AlphToolId;
  /** Masked / truncated user prompt */
  prompt?: string;
  recordsAccessed?: string[];
  model?: string;
  details?: string;
  /** Never store secrets here. */
  meta?: Record<string, string | number | boolean | null>;
};

export type AlphAuditAppendInput = Omit<AlphAuditEntry, "id" | "at"> & {
  id?: string;
  at?: string;
};
