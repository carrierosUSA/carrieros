import type {
  CarrierDocument,
  DocumentCategory,
  DocumentExtractedField,
  DocumentExtractedFieldKey,
} from "@/lib/types/documents";
import type { PickupNumber, PickupNumberInput } from "@/lib/types/pickup-number";

export const INTAKE_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export type IntakeMimeType = (typeof INTAKE_MIME_TYPES)[number];

export type DocumentUpload = {
  companyId: string; userId: string; fileName: string; mimeType: IntakeMimeType;
  bytes: Uint8Array; checksumSha256: string;
};

export type DocumentExtraction = {
  category: Extract<DocumentCategory, "rate_confirmation" | "bol" | "pod" | "lumper_receipt" | "fuel_receipt" | "invoice" | "miscellaneous">;
  rawText: string; fields: DocumentExtractedField[]; pickupNumbers: PickupNumberInput[]; overallConfidence: number;
  provider: string; modelId: string; promptVersion: string;
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

export type DocumentExtractionRetrySource = {
  documentId: string;
  versionId: string;
  upload: DocumentUpload;
};

export type DocumentReviewCorrection = {
  key: DocumentExtractedFieldKey;
  value: string;
};

export type DocumentPickupNumberReview = Pick<
  PickupNumberInput,
  "id" | "value" | "label" | "pickupStopId" | "pickupStopLabel" | "displayOrder"
>;

export type PersistedDocumentReview = {
  document: CarrierDocument;
  ocrResultId?: string;
  proposedActionId?: string;
  overallConfidence: number;
  pickupNumbers: PickupNumber[];
  approvalStatus?: "approved" | "rejected";
};

export interface DocumentIntakeRepository {
  saveUpload(input: DocumentUpload, accessToken: string): Promise<PersistedDocument>;
  loadExtractionRetrySource(input: {
    documentId: string;
    companyId: string;
    userId: string;
    accessToken: string;
  }): Promise<DocumentExtractionRetrySource>;
  saveExtraction(input: { documentId: string; versionId: string; companyId: string; userId: string; extraction: DocumentExtraction }): Promise<string>;
  createProposedAction(input: { documentId: string; ocrResultId: string; companyId: string; userId: string; actionKind: string; summary: string; payload: Record<string, unknown>; confidence: number }): Promise<string>;
  finalizeExtractionProposal(input: {
    documentId: string;
    versionId: string;
    ocrResultId: string;
    proposedActionId: string;
    companyId: string;
    userId: string;
    classifiedType: Exclude<DocumentExtraction["category"], "miscellaneous"> | "unknown";
    pickupNumberCount: number;
  }): Promise<void>;
  recordApproval(input: { proposedActionId: string; companyId: string; userId: string; accessToken: string; decision: "approved" | "rejected"; note?: string }): Promise<string>;
  appendAudit(input: { documentId: string; proposedActionId?: string; companyId: string; userId: string; eventType: string; detail: string; requestId?: string }): Promise<void>;
  markExtractionFailed(input: { documentId: string; versionId: string; companyId: string; userId: string }): Promise<void>;
  listDocuments(input: { companyId: string; accessToken: string }): Promise<PersistedDocumentReview[]>;
  getDocument(input: { documentId: string; companyId: string; accessToken: string }): Promise<PersistedDocumentReview | null>;
  confirmReview(input: {
    documentId: string;
    ocrResultId: string;
    proposedActionId: string;
    companyId: string;
    userId: string;
    accessToken: string;
    corrections: DocumentReviewCorrection[];
    pickupNumbers: DocumentPickupNumberReview[];
  }): Promise<PersistedDocumentReview>;
}
