/**
 * AI Document Inbox foundation:
 * upload → classify → OCR → extract → match → draft workflows.
 */

import { appendAlphAudit } from "@/lib/alph/audit/store";
import { getAlphAutopilotSettings } from "@/lib/alph/autopilot";
import { runAlphOcrExtract } from "@/lib/alph/ocr";
import { matchExtractedEntities } from "@/lib/alph/document-inbox/match";
import {
  preparePodInvoiceDraft,
  requestPodInvoiceApproval,
} from "@/lib/alph/document-inbox/pod-to-invoice";
import {
  prepareRcLoadDraft,
  requestRcLoadApproval,
} from "@/lib/alph/document-inbox/rc-to-load";
import {
  findDuplicateInboxItem,
  getDocumentInboxItem,
  listDocumentInboxItems,
  upsertDocumentInboxItem,
} from "@/lib/alph/document-inbox/store";
import type {
  DocumentInboxItem,
  DocumentInboxWorkflow,
  UploadDocumentInboxInput,
} from "@/lib/alph/document-inbox/types";
import type { DocumentCategory } from "@/lib/types/documents";

function newId(): string {
  return `inbox_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function fingerprint(input: UploadDocumentInboxInput): string {
  if (input.contentFingerprint) return input.contentFingerprint;
  return [
    input.fileName.trim().toLowerCase(),
    input.byteLength ?? 0,
    input.mimeType ?? "",
  ].join("::");
}

function resolveWorkflow(
  category: DocumentCategory,
  hint?: DocumentInboxWorkflow,
): DocumentInboxWorkflow {
  if (hint && hint !== "generic") return hint;
  if (category === "rate_confirmation") return "rc_to_load";
  if (category === "pod") return "pod_to_invoice";
  return "classify_only";
}

function pushAudit(
  item: DocumentInboxItem,
  event: DocumentInboxItem["audit"][number]["event"],
  detail: string,
) {
  item.audit.unshift({
    id: `inbox_aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    actorUserId: item.uploadedByUserId,
    event,
    detail,
  });
  item.updatedAt = new Date().toISOString();
}

export async function uploadToDocumentInbox(
  input: UploadDocumentInboxInput,
): Promise<DocumentInboxItem> {
  const settings = getAlphAutopilotSettings();
  const fp = fingerprint(input);
  const now = new Date().toISOString();

  const duplicate = findDuplicateInboxItem({
    tenantId: input.tenantId,
    companyId: input.companyId,
    contentFingerprint: fp,
  });

  const item: DocumentInboxItem = {
    id: newId(),
    tenantId: input.tenantId,
    companyId: input.companyId,
    uploadedByUserId: input.userId,
    status: "uploaded",
    workflow: input.workflowHint ?? "generic",
    fileName: input.fileName,
    originalFileName: input.fileName,
    mimeType: input.mimeType,
    byteLength: input.byteLength,
    contentFingerprint: fp,
    category: input.categoryHint,
    issues: [],
    overallConfidence: 0,
    duplicateOfId: duplicate?.id,
    createdAt: now,
    updatedAt: now,
    audit: [],
  };

  pushAudit(item, "uploaded", `Preserved original: ${input.fileName}`);
  if (duplicate) {
    item.issues.push({
      code: "duplicate",
      message: `Duplicate of inbox item ${duplicate.id} (${duplicate.fileName}).`,
    });
    item.status = "needs_review";
    pushAudit(
      item,
      "duplicate_detected",
      `Fingerprint matches ${duplicate.id}`,
    );
    upsertDocumentInboxItem(item);
    appendAlphAudit({
      requestId: item.id,
      companyId: input.companyId,
      tenantId: input.tenantId,
      userId: input.userId,
      event: "tool_failed",
      details: "Duplicate document upload",
      meta: { duplicateOfId: duplicate.id },
    });
    return item;
  }

  item.status = "classifying";
  upsertDocumentInboxItem(item);

  const extraction = await runAlphOcrExtract(
    {
      tenantId: input.tenantId,
      companyId: input.companyId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      byteLength: input.byteLength,
      categoryHint: input.categoryHint,
      contentFingerprint: fp,
    },
    { allowDemoFallback: settings.allowDemoExtraction },
  );

  if (extraction.status === "not_configured" && !extraction.fields.length) {
    item.status = "failed";
    item.issues = extraction.issues;
    pushAudit(item, "extracted", extraction.statusMessage);
    upsertDocumentInboxItem(item);
    return item;
  }

  item.extraction = extraction;
  item.category = extraction.category;
  item.overallConfidence = extraction.overallConfidence;
  item.issues = [...extraction.issues];
  item.workflow = resolveWorkflow(extraction.category, input.workflowHint);
  item.status = "extracted";
  pushAudit(
    item,
    "classified",
    `Category ${extraction.category}${extraction.isDemoExtraction ? " · DEMO extraction" : ""}`,
  );
  pushAudit(
    item,
    "extracted",
    `${extraction.fields.length} fields · confidence ${(extraction.overallConfidence * 100).toFixed(0)}% · ${extraction.statusMessage}`,
  );

  const match = await matchExtractedEntities(input.tenantId, extraction);
  item.matchedLoadId = match.loadId;
  item.matchedDriverId = match.driverId;
  item.matchedTruckId = match.truckId;
  item.matchedBrokerId = match.brokerId;
  for (const msg of match.issues) {
    item.issues.push({ code: "ambiguous_match", message: msg });
  }
  pushAudit(
    item,
    "matched",
    [
      match.loadId ? `load=${match.loadId}` : null,
      match.brokerId ? `broker=${match.brokerId}` : null,
      match.driverId ? `driver=${match.driverId}` : null,
      match.truckId ? `truck=${match.truckId}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "No entity matches",
  );

  upsertDocumentInboxItem(item);

  if (item.workflow === "rc_to_load") {
    prepareRcLoadDraft(item);
  } else if (item.workflow === "pod_to_invoice") {
    await preparePodInvoiceDraft(item);
  } else if (item.issues.length > 0) {
    item.status = "needs_review";
    upsertDocumentInboxItem(item);
  }

  appendAlphAudit({
    requestId: item.id,
    companyId: input.companyId,
    tenantId: input.tenantId,
    userId: input.userId,
    event: "tool_executed",
    details: `Document inbox processed ${item.fileName}`,
    meta: {
      workflow: item.workflow,
      category: item.category,
      isDemo: extraction.isDemoExtraction,
      confidence: item.overallConfidence,
    },
  });

  return getDocumentInboxItem({
    id: item.id,
    tenantId: input.tenantId,
    companyId: input.companyId,
  })!;
}

export function requestMissingInfo(input: {
  itemId: string;
  tenantId: string;
  companyId: string;
  userId: string;
  message: string;
}): DocumentInboxItem | null {
  const item = getDocumentInboxItem({
    id: input.itemId,
    tenantId: input.tenantId,
    companyId: input.companyId,
  });
  if (!item) return null;
  item.missingInfoRequest = input.message;
  item.status = "needs_review";
  pushAudit(item, "missing_info_requested", input.message);
  return upsertDocumentInboxItem(item);
}

export function requestInboxApproval(input: {
  itemId: string;
  tenantId: string;
  companyId: string;
  userId: string;
}): { item: DocumentInboxItem | null; approvalId?: string; error?: string } {
  const item = getDocumentInboxItem({
    id: input.itemId,
    tenantId: input.tenantId,
    companyId: input.companyId,
  });
  if (!item) return { item: null, error: "Not found" };

  try {
    if (item.workflow === "rc_to_load") {
      if (!item.loadDraft) prepareRcLoadDraft(item);
      const result = requestRcLoadApproval({ item, userId: input.userId });
      return { item: result.item, approvalId: result.approvalId };
    }
    if (item.workflow === "pod_to_invoice") {
      const result = requestPodInvoiceApproval({
        item,
        userId: input.userId,
      });
      return { item: result.item, approvalId: result.approvalId };
    }
    return { item, error: "No approval workflow for this document type." };
  } catch (err) {
    return {
      item,
      error: err instanceof Error ? err.message : "Approval request failed.",
    };
  }
}

export function listInbox(filters: {
  tenantId: string;
  companyId: string;
  limit?: number;
}): DocumentInboxItem[] {
  return listDocumentInboxItems(filters);
}
