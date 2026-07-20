import type { AlphOcrExtractResult, AlphOcrIssue } from "@/lib/alph/ocr/types";
import type { DocumentCategory } from "@/lib/types/documents";
import type { CreateLoadInput } from "@/lib/services/loads/load-inputs";

export type DocumentInboxItemStatus =
  | "uploaded"
  | "classifying"
  | "extracted"
  | "needs_review"
  | "draft_ready"
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "completed"
  | "failed";

export type DocumentInboxWorkflow =
  | "classify_only"
  | "rc_to_load"
  | "pod_to_invoice"
  | "generic";

export type DocumentInboxAuditEvent = {
  id: string;
  at: string;
  actorUserId: string;
  event:
    | "uploaded"
    | "classified"
    | "extracted"
    | "matched"
    | "draft_created"
    | "approval_requested"
    | "approved"
    | "rejected"
    | "executed"
    | "duplicate_detected"
    | "missing_info_requested";
  detail: string;
};

export type DocumentInboxItem = {
  id: string;
  tenantId: string;
  companyId: string;
  uploadedByUserId: string;
  status: DocumentInboxItemStatus;
  workflow: DocumentInboxWorkflow;
  fileName: string;
  originalFileName: string;
  mimeType?: string;
  byteLength?: number;
  contentFingerprint: string;
  category?: DocumentCategory;
  extraction?: AlphOcrExtractResult;
  issues: AlphOcrIssue[];
  overallConfidence: number;
  matchedLoadId?: string;
  matchedDriverId?: string;
  matchedTruckId?: string;
  matchedBrokerId?: string;
  /** Proposed create-load input when workflow is rc_to_load. */
  loadDraft?: CreateLoadInput;
  /** Invoice draft id when prepared. */
  invoiceDraftId?: string;
  approvalId?: string;
  resultLoadId?: string;
  resultInvoiceId?: string;
  duplicateOfId?: string;
  missingInfoRequest?: string;
  createdAt: string;
  updatedAt: string;
  audit: DocumentInboxAuditEvent[];
};

export type UploadDocumentInboxInput = {
  tenantId: string;
  companyId: string;
  userId: string;
  fileName: string;
  mimeType?: string;
  byteLength?: number;
  /** Optional precomputed fingerprint; otherwise derived from name+size. */
  contentFingerprint?: string;
  categoryHint?: DocumentCategory;
  workflowHint?: DocumentInboxWorkflow;
};
