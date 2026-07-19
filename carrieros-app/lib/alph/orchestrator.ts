import { appendAlphAudit } from "@/lib/alph/audit/store";
import { buildAlphContext } from "@/lib/alph/context/builder";
import type { AlphBuiltContext, AlphContextInput } from "@/lib/alph/context/types";
import {
  appendAlphMessage,
  createAlphConversation,
  getAlphConversation,
  getAlphConversationContextWindow,
} from "@/lib/alph/conversation/store";
import { ALPH_IDENTITY } from "@/lib/alph/identity";
import {
  modeAllowsApprovalRequests,
  parseAlphMode,
  type AlphMode,
} from "@/lib/alph/modes";
import { resolveAlphProvider } from "@/lib/alph/providers";
import {
  createAlphStreamController,
  streamTextChunks,
  type AlphStreamController,
  type AlphStreamEvent,
} from "@/lib/alph/streaming";
import { ensureAlphToolsRegistered, executeAlphTool } from "@/lib/alph/tools";
import type { AlphToolId } from "@/lib/alph/tools/types";

export type AlphTurnInput = {
  prompt: string;
  mode?: AlphMode | string;
  conversationId?: string;
  context?: AlphContextInput;
  /** Optional explicit tools to run (SEARCH / ANALYZE). */
  tools?: Array<{ id: AlphToolId; input?: unknown }>;
  /** Soft cancel support for streaming. */
  controller?: AlphStreamController;
};

export type AlphTurnResult = {
  requestId: string;
  conversationId: string;
  mode: AlphMode;
  assistantId: typeof ALPH_IDENTITY.id;
  context: AlphBuiltContext;
  text: string;
  model: string;
  toolResults: Array<{
    toolId: AlphToolId;
    ok: boolean;
    summary: string;
    citations: Array<{ type: string; id: string; label?: string }>;
  }>;
  approvalProposalId?: string;
  factsVsRecommendations: {
    facts: string[];
    recommendations: string[];
  };
};

function inferMode(prompt: string, explicit?: AlphMode | string): AlphMode {
  if (explicit) return parseAlphMode(String(explicit));
  const p = prompt.toLowerCase();
  if (/\b(approve|confirm|dispatch|assign|send|pay|delete|archive)\b/.test(p)) {
    return "act";
  }
  if (/\b(draft|write|compose|prepare)\b/.test(p)) return "draft";
  if (/\b(compare|analyze|trend|why|profit)\b/.test(p)) return "analyze";
  if (/\b(find|search|list|show|where)\b/.test(p)) return "search";
  if (/\b(recommend|suggest|should)\b/.test(p)) return "recommend";
  return "ask";
}

function defaultToolsForMode(
  mode: AlphMode,
  workspace: string,
): Array<{ id: AlphToolId; input?: unknown }> {
  if (mode === "ask") return [];
  if (mode === "act") return [];
  if (mode === "draft") {
    if (workspace === "finance") {
      return [{ id: "generate_invoice_draft", input: {} }];
    }
    return [{ id: "generate_message_draft", input: {} }];
  }
  switch (workspace) {
    case "dispatch":
      return [{ id: "search_loads", input: { limit: 8 } }];
    case "drivers":
      return [{ id: "search_drivers", input: { limit: 8 } }];
    case "fleet":
      return [{ id: "search_trucks", input: { limit: 8 } }];
    case "finance":
      return [{ id: "search_invoices", input: { limit: 8 } }];
    case "documents":
      return [{ id: "search_documents", input: { limit: 8 } }];
    default:
      return mode === "search" || mode === "analyze"
        ? [{ id: "search_loads", input: { limit: 5 } }]
        : [];
  }
}

/**
 * Run one Alph turn (non-streaming).
 * Permissions + tenant isolation enforced inside tools / context.
 */
export async function runAlphTurn(input: AlphTurnInput): Promise<AlphTurnResult> {
  ensureAlphToolsRegistered();
  const mode = inferMode(input.prompt, input.mode);
  const context = buildAlphContext(input.context ?? {});
  const requestId = context.requestId;

  appendAlphAudit({
    requestId,
    companyId: context.companyId,
    tenantId: context.tenantId,
    userId: context.userId,
    workspace: context.workspace,
    event: "prompt",
    mode,
    prompt: input.prompt,
  });

  appendAlphAudit({
    requestId,
    companyId: context.companyId,
    tenantId: context.tenantId,
    userId: context.userId,
    workspace: context.workspace,
    event: "context_built",
    mode,
    details: `workspace=${context.workspace}; chips=${context.chips.length}`,
  });

  let conversationId = input.conversationId;
  if (conversationId) {
    const existing = getAlphConversation({
      id: conversationId,
      companyId: context.companyId,
      tenantId: context.tenantId,
      userId: context.userId,
    });
    if (!existing) {
      conversationId = undefined;
    }
  }
  if (!conversationId) {
    const conv = createAlphConversation({
      companyId: context.companyId,
      tenantId: context.tenantId,
      userId: context.userId,
      workspace: context.workspace,
    });
    conversationId = conv.id;
  }

  appendAlphMessage({
    conversationId,
    companyId: context.companyId,
    tenantId: context.tenantId,
    userId: context.userId,
    role: "user",
    content: input.prompt,
    mode,
  });

  const window = getAlphConversationContextWindow({
    conversationId,
    companyId: context.companyId,
    tenantId: context.tenantId,
    userId: context.userId,
    recentLimit: 8,
  });

  const toolCalls =
    input.tools && input.tools.length > 0
      ? input.tools
      : defaultToolsForMode(mode, context.workspace);

  const toolResults: AlphTurnResult["toolResults"] = [];
  let approvalProposalId: string | undefined;

  for (const call of toolCalls.slice(0, 5)) {
    if (call.id === "create_approval_request" && !modeAllowsApprovalRequests(mode)) {
      continue;
    }
    const result = await executeAlphTool(call.id, call.input ?? {}, {
      context,
      mode,
      requestId,
    });
    if (result.ok) {
      const data = result.data as { approval?: { proposalId?: string } };
      if (data?.approval?.proposalId) {
        approvalProposalId = data.approval.proposalId;
      }
      toolResults.push({
        toolId: call.id,
        ok: true,
        summary: summarizeToolData(call.id, result.data),
        citations: result.citations,
      });
    } else {
      toolResults.push({
        toolId: call.id,
        ok: false,
        summary: result.message,
        citations: [],
      });
    }
  }

  const provider = resolveAlphProvider({ primary: "mock", fallback: "mock" });
  const system = [
    `You are ${ALPH_IDENTITY.name}, the single AI assistant for Transpo.ai.`,
    ALPH_IDENTITY.tagline,
    `Company: ${context.companyName}. Workspace: ${context.workspace}.`,
    `User role: ${context.role}. Domains: ${context.workspaceKnowledge.domains.join(", ")}.`,
    "Separate facts from recommendations. Never invent records. Never claim an action succeeded unless verified.",
    "Avoid legal, tax, medical, or compliance certainty.",
    window?.summary ? `Conversation summary: ${window.summary}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const toolSummary =
    toolResults.length === 0
      ? "No tools ran."
      : toolResults
          .map(
            (t) =>
              `${t.toolId}: ${t.ok ? t.summary : `ERROR ${t.summary}`}`,
          )
          .join("\n");

  const completion = await provider.complete({
    requestId,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Prompt: ${input.prompt}\n\nTool results:\n${toolSummary}`,
      },
    ],
  });

  const facts = toolResults
    .filter((t) => t.ok)
    .map((t) => t.summary)
    .slice(0, 6);
  const recommendations =
    mode === "recommend" || mode === "act"
      ? [
          "Treat suggestions as recommendations — confirm before critical actions.",
        ]
      : [];

  const text = [
    completion.text,
    facts.length
      ? `\n\nRecords used:\n${facts.map((f) => `• ${f}`).join("\n")}`
      : "",
    approvalProposalId
      ? `\n\nApproval preview ready (${approvalProposalId}). Confirm or cancel — Alph has not executed anything.`
      : "",
  ]
    .filter(Boolean)
    .join("");

  appendAlphMessage({
    conversationId,
    companyId: context.companyId,
    tenantId: context.tenantId,
    userId: context.userId,
    role: "assistant",
    content: text,
    mode,
    toolIds: toolResults.map((t) => t.toolId),
    citations: toolResults.flatMap((t) => t.citations).slice(0, 20),
  });

  return {
    requestId,
    conversationId,
    mode,
    assistantId: ALPH_IDENTITY.id,
    context,
    text,
    model: completion.model,
    toolResults,
    approvalProposalId,
    factsVsRecommendations: { facts, recommendations },
  };
}

function summarizeToolData(toolId: AlphToolId, data: unknown): string {
  const d = data as {
    items?: unknown[];
    total?: number;
    id?: string;
    reference?: string;
    name?: string;
    unitNumber?: string;
    filename?: string;
    invoiceNumber?: string;
    title?: string;
    draftOnly?: boolean;
    approval?: { proposalId?: string; proposedAction?: string };
    note?: string;
  };
  if (d.approval?.proposalId) {
    return `Approval prepared: ${d.approval.proposedAction ?? d.approval.proposalId}`;
  }
  if (d.draftOnly && d.title) return `Draft: ${d.title}`;
  if (Array.isArray(d.items)) {
    return `${toolId}: ${d.items.length} of ${d.total ?? d.items.length} results`;
  }
  if (d.reference) return `Load ${d.reference}`;
  if (d.unitNumber) return `Unit ${d.unitNumber}`;
  if (d.filename) return d.filename;
  if (d.invoiceNumber) return `Invoice ${d.invoiceNumber}`;
  if (d.name) return d.name;
  if (d.id) return `${toolId}:${d.id}`;
  return toolId;
}

/**
 * Streaming turn — yields progress + tokens. Cancel via controller.
 */
export async function* streamAlphTurn(
  input: AlphTurnInput,
): AsyncGenerator<AlphStreamEvent> {
  const ctrl = input.controller ?? createAlphStreamController();
  yield { type: "status", message: "Building context…" };
  if (ctrl.cancelled) {
    yield { type: "cancelled" };
    return;
  }

  const result = await runAlphTurn({ ...input, controller: ctrl });
  if (ctrl.cancelled) {
    yield { type: "cancelled" };
    appendAlphAudit({
      requestId: result.requestId,
      companyId: result.context.companyId,
      tenantId: result.context.tenantId,
      userId: result.context.userId,
      event: "stream_cancelled",
    });
    return;
  }

  for (const t of result.toolResults) {
    yield {
      type: "tool_progress",
      toolId: t.toolId,
      message: t.ok ? t.summary : t.summary,
    };
    if (t.citations.length) {
      yield { type: "citation", citations: t.citations };
    }
  }

  if (result.approvalProposalId) {
    yield {
      type: "approval_preview",
      proposalId: result.approvalProposalId,
    };
  }

  yield* streamTextChunks(result.text, ctrl);
  if (ctrl.cancelled) {
    yield { type: "cancelled" };
    return;
  }
  yield {
    type: "done",
    model: result.model,
    requestId: result.requestId,
  };
}
