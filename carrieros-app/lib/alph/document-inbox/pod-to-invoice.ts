/**
 * POD → match load → validate delivery → mark docs complete →
 * prepare invoice → approval → invoice ready via existing DocumentService.
 */

import { appendAlphAudit } from "@/lib/alph/audit/store";
import {
  createAlphApprovalRequest,
  decideAlphApproval,
  markAlphApprovalExecution,
} from "@/lib/alph/approval";
import type { DocumentInboxItem } from "@/lib/alph/document-inbox/types";
import {
  getDocumentInboxItem,
  upsertDocumentInboxItem,
} from "@/lib/alph/document-inbox/store";
import { getDocumentService } from "@/lib/services/documents";
import { getLoadService } from "@/lib/services/loads";

function pushAudit(
  item: DocumentInboxItem,
  actorUserId: string,
  event: DocumentInboxItem["audit"][number]["event"],
  detail: string,
) {
  item.audit.unshift({
    id: `inbox_aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    actorUserId,
    event,
    detail,
  });
  item.updatedAt = new Date().toISOString();
}

export async function preparePodInvoiceDraft(
  item: DocumentInboxItem,
): Promise<DocumentInboxItem> {
  if (!item.extraction || item.extraction.category !== "pod") {
    item.status = "failed";
    pushAudit(
      item,
      item.uploadedByUserId,
      "extracted",
      "Not a POD — cannot prepare invoice.",
    );
    return upsertDocumentInboxItem(item);
  }

  if (!item.matchedLoadId) {
    item.status = "needs_review";
    item.issues = [
      ...item.issues,
      {
        code: "ambiguous_match",
        message: "Match a load before preparing the invoice.",
      },
    ];
    pushAudit(
      item,
      item.uploadedByUserId,
      "matched",
      "POD missing load match.",
    );
    return upsertDocumentInboxItem(item);
  }

  const load = await getLoadService().getLoad(
    item.tenantId,
    item.matchedLoadId,
  );
  if (!load) {
    item.status = "needs_review";
    item.issues.push({
      code: "ambiguous_match",
      message: "Matched load not found for this tenant.",
    });
    return upsertDocumentInboxItem(item);
  }

  const docs = getDocumentService();
  await docs.captureLoadDocument(item.tenantId, {
    loadId: load.id,
    type: "final_pod",
    fileName: item.originalFileName,
  });

  // Mark delivered if still in transit / picked up (human will approve invoice separately).
  if (
    load.status === "in_transit" ||
    load.status === "picked_up" ||
    load.status === "dispatched"
  ) {
    await getLoadService().updateLoad(item.tenantId, load.id, {
      status: "delivered",
    });
  }

  const invoiceDraft = await docs.generateInvoiceDraft(item.tenantId, load.id);
  item.invoiceDraftId = invoiceDraft.id;
  item.status = "draft_ready";
  pushAudit(
    item,
    item.uploadedByUserId,
    "draft_created",
    `POD captured · invoice draft ${invoiceDraft.invoiceNumber} · $${invoiceDraft.amount}`,
  );

  return upsertDocumentInboxItem(item);
}

export function requestPodInvoiceApproval(input: {
  item: DocumentInboxItem;
  userId: string;
}): { item: DocumentInboxItem; approvalId: string } {
  const item = input.item;
  if (!item.invoiceDraftId || !item.matchedLoadId) {
    throw new Error("Invoice draft or load match missing.");
  }

  const approval = createAlphApprovalRequest({
    companyId: item.companyId,
    tenantId: item.tenantId,
    userId: input.userId,
    requestId: `inbox_${item.id}`,
    actionKind: "invoice_approve",
    proposedAction: `Approve invoice from POD ${item.fileName} for load ${item.matchedLoadId}`,
    recordsAffected: [
      { type: "document_inbox", id: item.id, label: item.fileName },
      { type: "load", id: item.matchedLoadId },
      { type: "invoice_draft", id: item.invoiceDraftId },
    ],
    financialImpact: "Invoice marked ready / packet prepared for send",
    operationalImpact: "Documents marked complete for billing",
    permissionRequired: "button.finance.create",
    preview: {
      workflow: "pod_to_invoice",
      inboxItemId: item.id,
      loadId: item.matchedLoadId,
      invoiceDraftId: item.invoiceDraftId,
      isDemoExtraction: item.extraction?.isDemoExtraction ?? true,
      confidence: item.overallConfidence,
      issues: item.issues.map((i) => i.message),
    },
  });

  item.approvalId = approval.id;
  item.status = "awaiting_approval";
  pushAudit(
    item,
    input.userId,
    "approval_requested",
    `Invoice approval ${approval.id} — Alph will not send without you.`,
  );

  appendAlphAudit({
    requestId: `inbox_${item.id}`,
    companyId: item.companyId,
    tenantId: item.tenantId,
    userId: input.userId,
    event: "approval_created",
    details: approval.proposedAction,
    meta: { inboxItemId: item.id, approvalId: approval.id },
  });

  upsertDocumentInboxItem(item);
  return { item, approvalId: approval.id };
}

export async function approvePodInvoiceAndPrepare(input: {
  itemId: string;
  tenantId: string;
  companyId: string;
  userId: string;
  role: string;
  decisionNote?: string;
  /** When true, also prepare sendable packet (still no external send without provider). */
  preparePacket?: boolean;
}): Promise<{ item: DocumentInboxItem; invoiceId?: string; error?: string }> {
  const item = getDocumentInboxItem({
    id: input.itemId,
    tenantId: input.tenantId,
    companyId: input.companyId,
  });
  if (!item) {
    return {
      item: {
        id: input.itemId,
        tenantId: input.tenantId,
        companyId: input.companyId,
        uploadedByUserId: input.userId,
        status: "failed",
        workflow: "pod_to_invoice",
        fileName: "",
        originalFileName: "",
        contentFingerprint: "",
        issues: [],
        overallConfidence: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        audit: [],
      },
      error: "Inbox item not found.",
    };
  }
  if (!item.approvalId || !item.matchedLoadId || !item.invoiceDraftId) {
    return { item, error: "Missing approval, load, or invoice draft." };
  }

  const decided = decideAlphApproval({
    id: item.approvalId,
    companyId: input.companyId,
    tenantId: input.tenantId,
    userId: input.userId,
    role: input.role,
    decision: "approve",
    note: input.decisionNote,
  });

  if (!decided.ok || !decided.mayExecute) {
    return {
      item,
      error: decided.ok ? "Approval cannot execute yet." : decided.reason,
    };
  }

  try {
    const docs = getDocumentService();
    // Ensure draft is ready status via existing service.
    const invoice = await docs.generateInvoiceDraft(
      input.tenantId,
      item.matchedLoadId,
    );

    if (input.preparePacket !== false) {
      try {
        await docs.preparePacket(input.tenantId, {
          loadId: item.matchedLoadId,
          destination: "broker",
        });
      } catch {
        // Packet may still miss BOL etc. — invoice draft remains ready.
        pushAudit(
          item,
          input.userId,
          "executed",
          "Invoice ready; packet not complete (missing required docs).",
        );
      }
    }

    markAlphApprovalExecution({
      id: item.approvalId,
      companyId: input.companyId,
      tenantId: input.tenantId,
      userId: input.userId,
      success: true,
      result: `Invoice ${invoice.invoiceNumber} ready`,
    });

    item.resultInvoiceId = invoice.id;
    item.status = "completed";
    pushAudit(
      item,
      input.userId,
      "executed",
      `Invoice ${invoice.invoiceNumber} ready via DocumentService (not auto-sent).`,
    );

    appendAlphAudit({
      requestId: `inbox_${item.id}`,
      companyId: input.companyId,
      tenantId: input.tenantId,
      userId: input.userId,
      event: "execution_result",
      details: `Invoice ${invoice.id} ready from POD`,
      meta: {
        invoiceId: invoice.id,
        loadId: item.matchedLoadId,
        inboxItemId: item.id,
      },
    });

    upsertDocumentInboxItem(item);
    return { item, invoiceId: invoice.id };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invoice prepare failed.";
    item.status = "failed";
    pushAudit(item, input.userId, "executed", message);
    upsertDocumentInboxItem(item);
    return { item, error: message };
  }
}

export function rejectPodInvoice(input: {
  itemId: string;
  tenantId: string;
  companyId: string;
  userId: string;
  role: string;
  note?: string;
}): DocumentInboxItem | null {
  const item = getDocumentInboxItem({
    id: input.itemId,
    tenantId: input.tenantId,
    companyId: input.companyId,
  });
  if (!item?.approvalId) return item;

  decideAlphApproval({
    id: item.approvalId,
    companyId: input.companyId,
    tenantId: input.tenantId,
    userId: input.userId,
    role: input.role,
    decision: "reject",
    note: input.note,
  });

  item.status = "rejected";
  pushAudit(
    item,
    input.userId,
    "rejected",
    input.note ?? "User rejected POD → invoice proposal.",
  );
  return upsertDocumentInboxItem(item);
}
