"use server";

import { runAlphCommand } from "@/lib/alph/executor";
import type { AlphParsedCommand, AlphResult } from "@/lib/alph/types";
import {
  decideAlphApproval,
  getAlphApprovalRequest,
  listPendingAlphApprovals,
  toAlphApprovalPreview,
  type AlphApprovalPreview,
} from "@/lib/alph/approval";
import { buildAlphContext, type AlphContextInput } from "@/lib/alph/context";
import {
  archiveAlphConversation,
  listAlphConversations,
  type AlphConversation,
} from "@/lib/alph/conversation";
import { runAlphTurn, type AlphTurnResult } from "@/lib/alph/orchestrator";
import { runAlphFoundationSelfCheck } from "@/lib/alph/selfcheck";
import { ensureAlphToolsRegistered, executeAlphTool } from "@/lib/alph/tools";
import type { AlphToolId } from "@/lib/alph/tools/types";
import {
  defaultRateLimiter,
  SENSITIVE_RATE_LIMITS,
} from "@/lib/api/rate-limit";
import { getCurrentSession } from "@/lib/auth/session";
import { getActiveTenantId } from "@/lib/data/tenant";
import { logSecurityEvent } from "@/lib/security/audit";
import type { AlphMode } from "@/lib/alph/modes";

export type AlphCommandResponse = {
  parsed: AlphParsedCommand;
  result: AlphResult;
};

export async function runAlphCommandAction(
  query: string,
): Promise<AlphCommandResponse> {
  const session = getCurrentSession();
  const limit = SENSITIVE_RATE_LIMITS.alphCommand;
  const rl = await defaultRateLimiter.check(
    { subject: `user:${session.userId}`, bucket: "alph:command" },
    limit.limit,
    limit.windowSeconds,
  );

  if (!rl.allowed) {
    logSecurityEvent({
      kind: "api.rate_limited",
      resource: "alph",
      details: `Alph command rate limit exceeded for ${session.userId}`,
    });
    const parsed: AlphParsedCommand = {
      raw: query,
      intent: "unknown",
      entities: {},
      confidence: 0,
    };
    return {
      parsed,
      result: {
        type: "clarify",
        title: "Slow down",
        body: "Too many Alph requests. Wait a moment and try again.",
        confidence: 0,
        intent: "unknown",
      },
    };
  }

  const tenantId = getActiveTenantId();
  return runAlphCommand(query, tenantId);
}

export type AlphTurnActionInput = {
  prompt: string;
  mode?: AlphMode | string;
  conversationId?: string;
  context?: AlphContextInput;
  tools?: Array<{ id: AlphToolId; input?: unknown }>;
};

export async function runAlphTurnAction(
  input: AlphTurnActionInput,
): Promise<AlphTurnResult | { error: string }> {
  const session = getCurrentSession();
  const limit = SENSITIVE_RATE_LIMITS.alphCommand;
  const rl = await defaultRateLimiter.check(
    { subject: `user:${session.userId}`, bucket: "alph:turn" },
    limit.limit,
    limit.windowSeconds,
  );
  if (!rl.allowed) {
    return { error: "Too many Alph requests. Wait a moment and try again." };
  }

  ensureAlphToolsRegistered();
  return runAlphTurn(input);
}

export async function executeAlphToolAction(input: {
  toolId: AlphToolId;
  toolInput?: unknown;
  mode?: AlphMode | string;
  context?: AlphContextInput;
}): Promise<unknown> {
  ensureAlphToolsRegistered();
  const context = buildAlphContext(input.context ?? {});
  return executeAlphTool(input.toolId, input.toolInput ?? {}, {
    context,
    mode: (input.mode as AlphMode) ?? "search",
    requestId: context.requestId,
  });
}

export async function listAlphConversationsAction(): Promise<
  AlphConversation[]
> {
  const session = getCurrentSession();
  return listAlphConversations({
    companyId: session.companyId,
    tenantId: session.tenantId,
    userId: session.userId,
  });
}

export async function archiveAlphConversationAction(
  conversationId: string,
): Promise<{ ok: boolean }> {
  const session = getCurrentSession();
  const row = archiveAlphConversation({
    id: conversationId,
    companyId: session.companyId,
    tenantId: session.tenantId,
    userId: session.userId,
  });
  return { ok: Boolean(row) };
}

export async function listPendingAlphApprovalsAction(): Promise<
  AlphApprovalPreview[]
> {
  const session = getCurrentSession();
  return listPendingAlphApprovals({
    companyId: session.companyId,
    tenantId: session.tenantId,
    userId: session.userId,
  }).map(toAlphApprovalPreview);
}

export async function decideAlphApprovalAction(input: {
  proposalId: string;
  decision: "approve" | "reject" | "cancel";
  note?: string;
}): Promise<{ ok: boolean; reason?: string; mayExecute?: boolean }> {
  const session = getCurrentSession();
  const result = decideAlphApproval({
    id: input.proposalId,
    companyId: session.companyId,
    tenantId: session.tenantId,
    userId: session.userId,
    role: session.role,
    decision: input.decision,
    note: input.note,
  });
  if (!result.ok) return { ok: false, reason: result.reason };
  return { ok: true, mayExecute: result.mayExecute };
}

export async function getAlphApprovalPreviewAction(
  proposalId: string,
): Promise<AlphApprovalPreview | null> {
  const session = getCurrentSession();
  const row = getAlphApprovalRequest({
    id: proposalId,
    companyId: session.companyId,
    tenantId: session.tenantId,
    userId: session.userId,
  });
  return row ? toAlphApprovalPreview(row) : null;
}

export async function runAlphSelfCheckAction(): Promise<{
  ok: boolean;
  checks: Array<{ name: string; pass: boolean; detail?: string }>;
}> {
  return runAlphFoundationSelfCheck();
}
