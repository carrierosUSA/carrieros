import type { TenantEntity } from "@/lib/types/base";

export const DOCUMENT_CATEGORIES = [
  "rate_confirmation",
  "pod",
  "bol",
  "invoice",
  "lumper_receipt",
  "fuel_receipt",
  "scale_ticket",
  "repair",
  "maintenance",
  "driver_document",
  "truck_document",
  "trailer_document",
  "insurance",
  "permit",
  "contract",
  "payroll",
  "tax",
  "miscellaneous",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  rate_confirmation: "Rate Confirmations",
  pod: "PODs",
  bol: "BOLs",
  invoice: "Invoices",
  lumper_receipt: "Lumper Receipts",
  fuel_receipt: "Fuel Receipts",
  scale_ticket: "Scale Tickets",
  repair: "Repairs",
  maintenance: "Maintenance",
  driver_document: "Driver Documents",
  truck_document: "Truck Documents",
  trailer_document: "Trailer Documents",
  insurance: "Insurance",
  permit: "Permits",
  contract: "Contracts",
  payroll: "Payroll",
  tax: "Tax Documents",
  miscellaneous: "Miscellaneous",
};

export type CarrierDocumentStatus =
  | "pending_review"
  | "linked"
  | "missing"
  | "expiring"
  | "deleted";

export type DocumentStorageProvider = "local" | "s3" | "gcs" | "azure";

export type DocumentExtractedFieldKey =
  | "loadNumber"
  | "broker"
  | "driver"
  | "truck"
  | "trailer"
  | "pickup"
  | "delivery"
  | "rate"
  | "invoiceNumber"
  | "poNumber"
  | "bolNumber"
  | "temperature"
  | "detention"
  | "lumper"
  | "date"
  | "time";

export type DocumentExtractedField = {
  key: DocumentExtractedFieldKey;
  label: string;
  value: string;
  confidence: number;
};

export type DocumentEntityLinks = {
  loadId?: string;
  driverId?: string;
  truckId?: string;
  trailerId?: string;
  brokerId?: string;
  companyId?: string;
};

export type DocumentVersion = {
  id: string;
  version: number;
  filename: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  note?: string;
};

export type DocumentAuditAction =
  | "uploaded"
  | "viewed"
  | "downloaded"
  | "renamed"
  | "moved"
  | "linked"
  | "unlinked"
  | "ocr_applied"
  | "shared"
  | "soft_deleted"
  | "restored"
  | "version_created";

export type DocumentAuditEntry = {
  id: string;
  action: DocumentAuditAction;
  actorName: string;
  actorRole: string;
  occurredAt: string;
  detail?: string;
};

export type DocumentTimelineEvent = {
  id: string;
  documentId: string;
  type:
    | "uploaded"
    | "ocr_reviewed"
    | "linked"
    | "renamed"
    | "shared"
    | "downloaded"
    | "versioned"
    | "deleted"
    | "restored";
  label: string;
  occurredAt: string;
  actorName?: string;
  relatedEntityType?: keyof DocumentEntityLinks;
  relatedEntityId?: string;
};

export interface CarrierDocument extends TenantEntity {
  id: string;
  category: DocumentCategory;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  status: CarrierDocumentStatus;
  ocrText?: string;
  extractedFields: DocumentExtractedField[];
  tags: string[];
  links: DocumentEntityLinks;
  versions: DocumentVersion[];
  auditLog: DocumentAuditEntry[];
  timeline: DocumentTimelineEvent[];
  expiresAt?: string;
  previewUrl?: string;
  storageProvider: DocumentStorageProvider;
  encrypted: boolean;
  loadNumber?: string;
  invoiceNumber?: string;
  poNumber?: string;
  bolNumber?: string;
  notes?: string;
}
