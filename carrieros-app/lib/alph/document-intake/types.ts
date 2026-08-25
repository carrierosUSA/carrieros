import type {
  DocumentCategory,
  DocumentExtractedField,
  DocumentExtractedFieldKey,
} from "@/lib/types/documents";

export const INTAKE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export type IntakeMimeType = (typeof INTAKE_MIME_TYPES)[number];

export type DocumentUpload = {
  companyId: string;
  userId: string;
  fileName: string;
  mimeType: IntakeMimeType;
  bytes: Uint8Array;
  checksumSha256: string;
};

export type DocumentExtraction = {
  category: Extract<
    DocumentCategory,
    | "rate_confirmation"
    | "bol"
    | "pod"
    | "lumper_receipt"
    | "fuel_receipt"
    | "invoice"
    | "miscellaneous"
  >;
  rawText: string;
  fields: DocumentExtractedField[];
  overallConfidence: number;
  provider: string;
  modelId: string;
  promptVersion: string;
};

export interface DocumentExtractionAdapter {
  readonly id: string;
  extract(input: DocumentUpload): Promise<DocumentExtraction>;
}

export type PersistedDocument = {
  id: string;
  versionId: string;
  storagePath: string;
  duplicate: boolean;
  reconciled: boolean;
};

export type DocumentReviewCorrection = {
  fieldKey: DocumentExtractedFieldKey;
  value: string;
};

export type PersistedDocumentReview = {
  id: string;
  versionId: string;
  ocrResultId?: string;
  proposedActionId?: string;
  filename: string;
  mimeType: IntakeMimeType;
  sizeBytes: number;
  category: DocumentCategory;
  status: "processing" | "needs_review" | "ready" | "failed" | "archived";
  approvalStatus: "pending" | "approved" | "rejected";
  fields: DocumentExtractedField[];
  operationalLoadId?: string;
  createdAt: string;
};

export type ExtractionRetrySource = {
  documentId: string;
  versionId: string;
  upload: DocumentUpload;
};

export interface DocumentIntakeRepository {
  saveUpload(input: DocumentUpload, accessToken: string): Promise<PersistedDocument>;
  saveExtraction(input: {
    documentId: string;
    versionId: string;
    companyId: string;
    userId: string;
    extraction: DocumentExtraction;
  }): Promise<string>;
  createProposedAction(input: {
    documentId: string;
    ocrResultId: string;
    companyId: string;
    userId: string;
    actionKind: string;
    summary: string;
    payload: Record<string, unknown>;
    confidence: number;
  }): Promise<string>;
  recordApproval(input: {
    proposedActionId: string;
    companyId: string;
    userId: string;
    accessToken: string;
    decision: "approved" | "rejected";
    note?: string;
  }): Promise<string>;
  appendAudit(input: {
    documentId: string;
    proposedActionId?: string;
    companyId: string;
    userId: string;
    eventType: string;
    detail: string;
    requestId?: string;
  }): Promise<void>;
}
