import {
  canExecuteCriticalAlphAction,
  clearAlphApprovalsForTests,
  createAlphApprovalRequest,
  decideAlphApproval,
  getAlphApprovalRequest,
  listPendingAlphApprovals,
  markAlphApprovalExecution,
  toAlphApprovalPreview,
} from "@/lib/alph/approval";
import {
  appendAlphAudit,
  clearAlphAuditForTests,
  listAlphAudit,
} from "@/lib/alph/audit";
import { buildAlphContext } from "@/lib/alph/context";
import {
  archiveAlphConversation,
  clearAlphConversationsForTests,
  getAlphConversation,
  listAlphConversations,
} from "@/lib/alph/conversation";
import { ALPH_IDENTITY } from "@/lib/alph/identity";
import { ensureAlphToolsRegistered, executeAlphTool, listAlphTools } from "@/lib/alph/tools";
import { clearAlphToolRegistryForTests } from "@/lib/alph/tools/registry";
import { runAlphTurn } from "@/lib/alph/orchestrator";
import {
  approvePodInvoiceAndPrepare,
  clearDocumentInboxForTests,
  requestInboxApproval,
  uploadToDocumentInbox,
} from "@/lib/alph/document-inbox";
import {
  invoiceDraftStore,
  loadDocumentStore,
  packetStore,
} from "@/lib/data/document-store";
import { getLoadService } from "@/lib/services/loads";

export type AlphSelfCheckResult = {
  ok: boolean;
  checks: Array<{ name: string; pass: boolean; detail?: string }>;
};

/**
 * Foundation verification — permission, isolation, tools, approval, audit, one Alph.
 * Safe to run on localhost; uses in-memory stores.
 */
export async function runAlphFoundationSelfCheck(): Promise<AlphSelfCheckResult> {
  clearAlphAuditForTests();
  clearAlphApprovalsForTests();
  clearAlphConversationsForTests();
  clearAlphToolRegistryForTests();
  clearDocumentInboxForTests();
  ensureAlphToolsRegistered();

  const checks: AlphSelfCheckResult["checks"] = [];

  checks.push({
    name: "one_alph_only",
    pass: ALPH_IDENTITY.oneAlphOnly === true && ALPH_IDENTITY.id === "alph",
  });

  const tools = listAlphTools();
  checks.push({
    name: "tools_registered",
    pass: tools.length >= 20,
    detail: `${tools.length} tools`,
  });

  const readOnlyWrites = tools.filter((t) => t.risk === "read");
  checks.push({
    name: "read_tools_present",
    pass: readOnlyWrites.length >= 15,
    detail: `${readOnlyWrites.length} read tools`,
  });

  const ctx = buildAlphContext({ workspaceId: "dispatch", pathname: "/loads" });
  checks.push({
    name: "context_builder",
    pass:
      ctx.tenantId.length > 0 &&
      ctx.companyId.length > 0 &&
      ctx.workspace === "dispatch" &&
      ctx.permissions.length > 0,
    detail: `workspace=${ctx.workspace}`,
  });

  const search = await executeAlphTool(
    "search_loads",
    { limit: 3 },
    { context: ctx, mode: "search", requestId: ctx.requestId },
  );
  checks.push({
    name: "read_tool_search_loads",
    pass: search.ok === true,
    detail: search.ok ? `items ok` : search.message,
  });

  const turn = await runAlphTurn({
    prompt: "Show today's loads",
    mode: "search",
    context: { workspaceId: "dispatch", pathname: "/loads" },
  });
  checks.push({
    name: "conversation_persistence",
    pass: Boolean(turn.conversationId),
    detail: turn.conversationId,
  });

  const listed = listAlphConversations({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
  });
  checks.push({
    name: "conversation_list_isolated",
    pass: listed.some((c) => c.id === turn.conversationId),
  });

  // Cross-tenant isolation: foreign company must not see conversation
  const foreign = getAlphConversation({
    id: turn.conversationId,
    companyId: "other-company",
    tenantId: "other-tenant",
    userId: ctx.userId,
  });
  checks.push({
    name: "tenant_isolation_conversation",
    pass: foreign === null,
  });

  const approval = createAlphApprovalRequest({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    requestId: ctx.requestId,
    actionKind: "change_critical_record",
    proposedAction: "Assign driver (test — not executed)",
    recordsAffected: [{ type: "load", id: "load-test" }],
    permissionRequired: "button.loads.assign",
  });
  checks.push({
    name: "approval_created_not_executed",
    pass: approval.executed === false && approval.status === "pending",
  });

  checks.push({
    name: "critical_cannot_execute_silently",
    pass: canExecuteCriticalAlphAction(undefined) === false,
  });

  const rejected = decideAlphApproval({
    id: approval.id,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    role: ctx.role,
    decision: "reject",
  });
  checks.push({
    name: "approval_reject_blocks_execution",
    pass: rejected.ok === true && rejected.mayExecute === false,
  });

  const approval2 = createAlphApprovalRequest({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    requestId: `${ctx.requestId}-2`,
    actionKind: "payroll_approve",
    proposedAction: "Approve payroll (test)",
    recordsAffected: [],
    permissionRequired: "button.payroll.approve",
  });
  const approved = decideAlphApproval({
    id: approval2.id,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    role: ctx.role,
    decision: "approve",
  });
  checks.push({
    name: "approval_approve_requires_explicit_execution",
    pass:
      approved.ok === true &&
      approved.mayExecute === true &&
      approved.approval.executed === false,
  });

  // ACT mode required for create_approval_request tool
  const actDenied = await executeAlphTool(
    "create_approval_request",
    {
      actionKind: "contact_customer",
      proposedAction: "Send email",
      permissionRequired: "page.loads.view",
      recordsAffected: [],
    },
    { context: ctx, mode: "ask", requestId: ctx.requestId },
  );
  checks.push({
    name: "act_mode_required_for_approval_tool",
    pass: actDenied.ok === false && actDenied.code === "forbidden_write",
  });

  appendAlphAudit({
    requestId: ctx.requestId,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    event: "prompt",
    prompt: "selfcheck",
  });
  const audit = listAlphAudit({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    limit: 20,
  });
  checks.push({
    name: "audit_logging",
    pass: audit.length > 0,
    detail: `${audit.length} entries`,
  });

  const foreignAudit = listAlphAudit({
    companyId: "other-company",
    tenantId: "other-tenant",
    limit: 20,
  });
  checks.push({
    name: "audit_tenant_isolation",
    pass: foreignAudit.length === 0,
  });

  // Preview shape
  const preview = toAlphApprovalPreview(approval2);
  checks.push({
    name: "approval_preview_shape",
    pass:
      preview.requiresHumanConfirmation === true &&
      Boolean(preview.confirmLabel) &&
      Boolean(preview.cancelLabel) &&
      Boolean(preview.proposedAction),
  });

  archiveAlphConversation({
    id: turn.conversationId,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
  });
  const afterArchive = getAlphConversation({
    id: turn.conversationId,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
  });
  checks.push({
    name: "conversation_archive",
    pass: afterArchive?.status === "archived",
  });

  const pending = listPendingAlphApprovals({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
  });
  checks.push({
    name: "pending_approvals_list",
    pass: Array.isArray(pending),
  });

  // Mark execution only after approve — still tracked
  markAlphApprovalExecution({
    id: approval2.id,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    success: true,
    result: "selfcheck simulated execution",
  });
  const executed = getAlphApprovalRequest({
    id: approval2.id,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
  });
  checks.push({
    name: "execution_marked_after_approve",
    pass: executed?.executed === true,
  });

  const podLoadId = "load-24003";
  const podLoadBefore = await getLoadService().getLoad(ctx.tenantId, podLoadId);
  const podStatusBefore = podLoadBefore?.status;
  const podDocumentsBefore = loadDocumentStore.length;
  const podInvoicesBefore = invoiceDraftStore.length;
  const podPacketsBefore = packetStore.length;

  const podProposal = await uploadToDocumentInbox({
    tenantId: ctx.tenantId,
    companyId: ctx.companyId,
    userId: ctx.userId,
    fileName: "LD-24003-pod-selfcheck.pdf",
    mimeType: "application/pdf",
    byteLength: 1024,
    contentFingerprint: `alph-selfcheck-pod-${ctx.requestId}`,
  });
  const podLoadAfterUpload = await getLoadService().getLoad(
    ctx.tenantId,
    podLoadId,
  );
  checks.push({
    name: "pod_upload_is_read_only_proposal",
    pass:
      podProposal.status === "draft_ready" &&
      podProposal.invoiceDraftId === undefined &&
      podLoadAfterUpload?.status === podStatusBefore &&
      loadDocumentStore.length === podDocumentsBefore &&
      invoiceDraftStore.length === podInvoicesBefore &&
      packetStore.length === podPacketsBefore,
  });

  const podApproval = requestInboxApproval({
    itemId: podProposal.id,
    tenantId: ctx.tenantId,
    companyId: ctx.companyId,
    userId: ctx.userId,
  });
  const podLoadAfterRequest = await getLoadService().getLoad(
    ctx.tenantId,
    podLoadId,
  );
  checks.push({
    name: "pod_approval_request_is_read_only",
    pass:
      Boolean(podApproval.approvalId) &&
      podLoadAfterRequest?.status === podStatusBefore &&
      loadDocumentStore.length === podDocumentsBefore &&
      invoiceDraftStore.length === podInvoicesBefore &&
      packetStore.length === podPacketsBefore,
  });

  const podExecution = await approvePodInvoiceAndPrepare({
    itemId: podProposal.id,
    tenantId: ctx.tenantId,
    companyId: ctx.companyId,
    userId: ctx.userId,
    role: ctx.role,
  });
  const podLoadAfterApproval = await getLoadService().getLoad(
    ctx.tenantId,
    podLoadId,
  );
  checks.push({
    name: "pod_records_change_only_after_explicit_approval",
    pass:
      !podExecution.error &&
      podExecution.item.status === "completed" &&
      Boolean(podExecution.invoiceId) &&
      podLoadAfterApproval?.status === "invoiced" &&
      loadDocumentStore.length === podDocumentsBefore + 1 &&
      invoiceDraftStore.length === podInvoicesBefore + 1 &&
      packetStore.length >= podPacketsBefore,
    detail: podExecution.error ?? `status=${podLoadAfterApproval?.status}`,
  });

  const ok = checks.every((c) => c.pass);
  return { ok, checks };
}
