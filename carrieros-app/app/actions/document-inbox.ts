"use server";

import {
  approvePodInvoiceAndPrepare,
  approveRcLoadAndCreate,
  listInbox,
  rejectPodInvoice,
  rejectRcLoad,
  requestInboxApproval,
  requestMissingInfo,
  uploadToDocumentInbox,
  type DocumentInboxItem,
} from "@/lib/alph/document-inbox";
import { SupabaseDocumentIntakeRepository } from "@/lib/alph/document-intake";
import { resolveAlphOcrSetup, resolveAlphProviderSetup } from "@/lib/alph/providers/env";
import {
  canApproveDocument,
} from "@/lib/auth/supabase-claims";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import { can } from "@/lib/permissions/check";
import type { DocumentCategory } from "@/lib/types/documents";
import type { DocumentInboxWorkflow } from "@/lib/alph/document-inbox/types";

async function sessionContext() {
  const auth = await requireDocumentAuth();
  return {
    auth,
    tenantId: auth.companyId,
    companyId: auth.companyId,
    userId: auth.userId,
    role: auth.businessRole,
  };
}

export async function getDocumentInboxSetupAction(): Promise<{
  ocr: ReturnType<typeof resolveAlphOcrSetup>;
  model: ReturnType<typeof resolveAlphProviderSetup>;
}> {
  await sessionContext();
  return {
    ocr: resolveAlphOcrSetup(),
    model: resolveAlphProviderSetup(),
  };
}

export async function listDocumentInboxAction(): Promise<DocumentInboxItem[]> {
  const { tenantId, companyId } = await sessionContext();
  return listInbox({ tenantId, companyId, limit: 80 });
}

export async function uploadDocumentInboxAction(input: {
  fileName: string;
  mimeType?: string;
  byteLength?: number;
  contentFingerprint?: string;
  categoryHint?: DocumentCategory;
  workflowHint?: DocumentInboxWorkflow;
}): Promise<DocumentInboxItem | { error: string }> {
  const { auth, tenantId, companyId, userId } = await sessionContext();
  if (
    !can(
      { userId: auth.userId, role: auth.businessRole },
      "button.documents.upload",
    )
  ) {
    return { error: "You need document upload permission." };
  }

  return uploadToDocumentInbox({
    tenantId,
    companyId,
    userId,
    fileName: input.fileName,
    mimeType: input.mimeType,
    byteLength: input.byteLength,
    contentFingerprint: input.contentFingerprint,
    categoryHint: input.categoryHint,
    workflowHint: input.workflowHint,
  });
}

export async function requestDocumentInboxApprovalAction(itemId: string) {
  const { tenantId, companyId, userId } = await sessionContext();
  return requestInboxApproval({ itemId, tenantId, companyId, userId });
}

export async function approveDocumentInboxAction(input: {
  itemId: string;
  note?: string;
}): Promise<{ ok: boolean; item?: DocumentInboxItem; error?: string; loadId?: string; invoiceId?: string }> {
  const { tenantId, companyId, userId, role } = await sessionContext();
  const items = listInbox({ tenantId, companyId });
  const item = items.find((i) => i.id === input.itemId);
  if (!item) return { ok: false, error: "Inbox item not found." };

  if (item.workflow === "rc_to_load") {
    const result = await approveRcLoadAndCreate({
      itemId: input.itemId,
      tenantId,
      companyId,
      userId,
      role,
      decisionNote: input.note,
    });
    return {
      ok: !result.error,
      item: result.item,
      error: result.error,
      loadId: result.loadId,
    };
  }

  if (item.workflow === "pod_to_invoice") {
    const result = await approvePodInvoiceAndPrepare({
      itemId: input.itemId,
      tenantId,
      companyId,
      userId,
      role,
      decisionNote: input.note,
    });
    return {
      ok: !result.error,
      item: result.item,
      error: result.error,
      invoiceId: result.invoiceId,
    };
  }

  return { ok: false, error: "No approve workflow for this item." };
}

export async function rejectDocumentInboxAction(input: {
  itemId: string;
  note?: string;
}): Promise<{ ok: boolean; item?: DocumentInboxItem | null; error?: string }> {
  const { tenantId, companyId, userId, role } = await sessionContext();
  const items = listInbox({ tenantId, companyId });
  const item = items.find((i) => i.id === input.itemId);
  if (!item) return { ok: false, error: "Inbox item not found." };

  if (item.workflow === "rc_to_load") {
    return {
      ok: true,
      item: rejectRcLoad({
        itemId: input.itemId,
        tenantId,
        companyId,
        userId,
        role,
        note: input.note,
      }),
    };
  }
  if (item.workflow === "pod_to_invoice") {
    return {
      ok: true,
      item: rejectPodInvoice({
        itemId: input.itemId,
        tenantId,
        companyId,
        userId,
        role,
        note: input.note,
      }),
    };
  }
  return { ok: false, error: "Nothing to reject." };
}

export async function requestDocumentInboxMissingInfoAction(input: {
  itemId: string;
  message: string;
}) {
  const { tenantId, companyId, userId } = await sessionContext();
  return requestMissingInfo({
    itemId: input.itemId,
    tenantId,
    companyId,
    userId,
    message: input.message,
  });
}

export async function recordPersistedDocumentApprovalAction(input: {
  proposedActionId: string;
  decision: "approved" | "rejected";
  note?: string;
}): Promise<{ ok: true; approvalId: string } | { ok: false; error: string }> {
  const { auth } = await sessionContext();
  if (!canApproveDocument(auth)) {
    return { ok: false, error: "Your role cannot approve document actions." };
  }

  const repository = new SupabaseDocumentIntakeRepository();
  const approvalId = await repository.recordApproval({
    proposedActionId: input.proposedActionId,
    companyId: auth.companyId,
    userId: auth.userId,
    accessToken: auth.accessToken,
    decision: input.decision,
    note: input.note,
  });
  return { ok: true, approvalId };
}
