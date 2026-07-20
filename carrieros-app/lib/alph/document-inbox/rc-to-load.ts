/**
 * RC → extract → validate → load draft → approve → create load (existing LoadService).
 */

import { appendAlphAudit } from "@/lib/alph/audit/store";
import {
  createAlphApprovalRequest,
  decideAlphApproval,
  markAlphApprovalExecution,
} from "@/lib/alph/approval";
import { confidenceRequiresReview, getAlphAutopilotSettings } from "@/lib/alph/autopilot";
import { fieldMoney, fieldValue } from "@/lib/alph/ocr/demo";
import type { AlphOcrExtractResult } from "@/lib/alph/ocr/types";
import type { DocumentInboxItem } from "@/lib/alph/document-inbox/types";
import {
  getDocumentInboxItem,
  upsertDocumentInboxItem,
} from "@/lib/alph/document-inbox/store";
import { getLoadService } from "@/lib/services/loads";
import type { CreateLoadInput } from "@/lib/services/loads/load-inputs";
import { parseCityStateFromAddress } from "@/lib/forms/rate-con-extraction";

function parseCityState(value: string | undefined): {
  city: string;
  state: string;
} {
  if (!value) return { city: "", state: "" };
  if (value.includes(",")) {
    const parts = value.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      return {
        city: parts[0] ?? "",
        state: (parts[1] ?? "").split(/\s+/)[0] ?? "",
      };
    }
  }
  return parseCityStateFromAddress(value);
}

export function buildLoadDraftFromRcExtraction(
  extraction: AlphOcrExtractResult,
  matched: {
    brokerId?: string;
    driverId?: string;
    truckId?: string;
  },
): { draft: CreateLoadInput; issues: string[] } {
  const issues: string[] = [];
  const fields = extraction.fields;

  const pickupRaw =
    fieldValue(fields, "pickupAddress") ?? fieldValue(fields, "pickup") ?? "";
  const deliveryRaw =
    fieldValue(fields, "deliveryAddress") ??
    fieldValue(fields, "delivery") ??
    "";
  const origin = parseCityState(pickupRaw);
  const destination = parseCityState(deliveryRaw);

  const rate = fieldMoney(fields, "rate");
  const miles = Number(fieldValue(fields, "miles") ?? "0");
  const pickupDate = fieldValue(fields, "pickupDate") ?? fieldValue(fields, "date");
  const deliveryDate = fieldValue(fields, "deliveryDate");
  const weight = Number(fieldValue(fields, "weight") ?? "");

  if (!origin.city || !origin.state) {
    issues.push("Pickup city/state missing or low confidence.");
  }
  if (!destination.city || !destination.state) {
    issues.push("Delivery city/state missing or low confidence.");
  }
  if (!rate || rate <= 0) issues.push("Rate missing or invalid.");
  if (!pickupDate) issues.push("Pickup date missing.");
  if (!deliveryDate) issues.push("Delivery date missing.");
  if (confidenceRequiresReview(extraction.overallConfidence)) {
    issues.push(
      `Extraction confidence ${(extraction.overallConfidence * 100).toFixed(0)}% needs review.`,
    );
  }
  for (const issue of extraction.issues) {
    issues.push(issue.message);
  }

  const draft: CreateLoadInput = {
    customerId: "customer-gulf-foods",
    brokerId: matched.brokerId,
    driverId: matched.driverId,
    truckId: matched.truckId,
    origin: {
      city: origin.city || "Houston",
      state: origin.state || "TX",
      address: pickupRaw || undefined,
      company: "Gulf Foods DC",
    },
    destination: {
      city: destination.city || "Chicago",
      state: destination.state || "IL",
      address: deliveryRaw || undefined,
      company: "Midwest Grocers",
    },
    pickupDate: pickupDate || "2026-07-18",
    deliveryDate: deliveryDate || "2026-07-20",
    rate: rate ?? 0,
    miles: Number.isFinite(miles) && miles > 0 ? miles : 0,
    equipmentType: fieldValue(fields, "equipmentType"),
    temperature: fieldValue(fields, "temperature"),
    brokerLoadId: fieldValue(fields, "brokerLoadId"),
    commodity: fieldValue(fields, "commodity"),
    weight: Number.isFinite(weight) && weight > 0 ? weight : undefined,
    notes: `Created from RC via Alph Document Inbox · ${extraction.isDemoExtraction ? "DEMO extraction" : "OCR"} · ${extraction.originalFileName}`,
  };

  return { draft, issues };
}

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

export function prepareRcLoadDraft(item: DocumentInboxItem): DocumentInboxItem {
  if (!item.extraction || item.extraction.category !== "rate_confirmation") {
    item.status = "failed";
    pushAudit(
      item,
      item.uploadedByUserId,
      "extracted",
      "Not a rate confirmation — cannot build load draft.",
    );
    return upsertDocumentInboxItem(item);
  }

  const { draft, issues } = buildLoadDraftFromRcExtraction(item.extraction, {
    brokerId: item.matchedBrokerId,
    driverId: item.matchedDriverId,
    truckId: item.matchedTruckId,
  });

  item.loadDraft = draft;
  item.issues = [
    ...item.issues,
    ...issues.map((message) => ({
      code: "missing_fields" as const,
      message,
    })),
  ];
  item.status = issues.length > 0 ? "needs_review" : "draft_ready";
  pushAudit(
    item,
    item.uploadedByUserId,
    "draft_created",
    `Load draft prepared · rate $${draft.rate} · ${draft.origin.city} → ${draft.destination.city}`,
  );
  return upsertDocumentInboxItem(item);
}

export function requestRcLoadApproval(input: {
  item: DocumentInboxItem;
  userId: string;
}): { item: DocumentInboxItem; approvalId: string } {
  const item = input.item;
  if (!item.loadDraft) {
    throw new Error("Load draft missing — run prepare first.");
  }

  const approval = createAlphApprovalRequest({
    companyId: item.companyId,
    tenantId: item.tenantId,
    userId: input.userId,
    requestId: `inbox_${item.id}`,
    actionKind: "change_critical_record",
    proposedAction: `Create load from rate confirmation ${item.fileName}`,
    recordsAffected: [
      { type: "document_inbox", id: item.id, label: item.fileName },
      ...(item.matchedBrokerId
        ? [{ type: "broker", id: item.matchedBrokerId }]
        : []),
    ],
    financialImpact: `Proposed rate $${item.loadDraft.rate.toLocaleString()}`,
    operationalImpact: `${item.loadDraft.origin.city}, ${item.loadDraft.origin.state} → ${item.loadDraft.destination.city}, ${item.loadDraft.destination.state}`,
    permissionRequired: "button.loads.create",
    preview: {
      workflow: "rc_to_load",
      inboxItemId: item.id,
      loadDraft: item.loadDraft,
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
    `Approval ${approval.id} created — humans decide.`,
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

export async function approveRcLoadAndCreate(input: {
  itemId: string;
  tenantId: string;
  companyId: string;
  userId: string;
  role: string;
  decisionNote?: string;
}): Promise<{ item: DocumentInboxItem; loadId?: string; error?: string }> {
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
        workflow: "rc_to_load",
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
  if (!item.approvalId || !item.loadDraft) {
    return { item, error: "Missing approval or load draft." };
  }

  // Explicit human approve after reviewing confidence/issues is always allowed.
  void getAlphAutopilotSettings();

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
    const load = await getLoadService().createLoad(
      input.tenantId,
      item.loadDraft,
    );
    markAlphApprovalExecution({
      id: item.approvalId,
      companyId: input.companyId,
      tenantId: input.tenantId,
      userId: input.userId,
      success: true,
      result: `Load ${load.reference} created`,
    });

    item.resultLoadId = load.id;
    item.status = "completed";
    pushAudit(
      item,
      input.userId,
      "executed",
      `Load ${load.reference} created via existing LoadService.`,
    );

    appendAlphAudit({
      requestId: `inbox_${item.id}`,
      companyId: input.companyId,
      tenantId: input.tenantId,
      userId: input.userId,
      event: "execution_result",
      details: `Load ${load.id} created from RC`,
      meta: { loadId: load.id, inboxItemId: item.id },
    });

    upsertDocumentInboxItem(item);
    return { item, loadId: load.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create load failed.";
    item.status = "failed";
    pushAudit(item, input.userId, "executed", message);
    upsertDocumentInboxItem(item);
    return { item, error: message };
  }
}

export function rejectRcLoad(input: {
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
    input.note ?? "User rejected RC → load proposal.",
  );
  return upsertDocumentInboxItem(item);
}
