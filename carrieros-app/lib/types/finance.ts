import type { TenantEntity } from "@/lib/types/base";

export interface Invoice extends TenantEntity {
  id: string;
  reference: string;
  status: string;
  amount: number;
  dueDate: string;
  loadId?: string;
}

export type LoadDocumentType =
  | "rate_confirmation"
  | "bol"
  | "final_pod"
  | "lumper_receipt"
  | "invoice"
  | "void_check";

export type LoadDocumentStatus = "missing" | "captured" | "scanned" | "approved";

export interface Document extends TenantEntity {
  id: string;
  type: string;
  status: string;
  expiresAt?: string;
  entityId: string;
  entityType: "load" | "driver" | "truck" | "company";
  loadId?: string;
}

export interface LoadDocumentRecord extends TenantEntity {
  id: string;
  loadId: string;
  type: LoadDocumentType;
  label: string;
  status: LoadDocumentStatus;
  fileName?: string;
  capturedAt?: string;
  scannedAt?: string;
  previewUrl?: string;
  sequence: number;
  required: boolean;
}

export interface InvoiceDraft extends TenantEntity {
  id: string;
  loadId: string;
  invoiceNumber: string;
  amount: number;
  status: "draft" | "ready";
  billTo: string;
  generatedAt: string;
}

export interface InvoicePacket extends TenantEntity {
  id: string;
  loadId: string;
  documentIds: string[];
  invoiceDraftId?: string;
  status: "missing_documents" | "ready_to_send";
  generatedPdfName?: string;
  readyMessage: string;
  updatedAt: string;
}

export const LOAD_DOCUMENT_SEQUENCE: Array<{
  type: LoadDocumentType;
  label: string;
  required: boolean;
}> = [
  { type: "rate_confirmation", label: "Rate Confirmation", required: true },
  { type: "bol", label: "BOL", required: true },
  { type: "final_pod", label: "Final POD", required: true },
  { type: "lumper_receipt", label: "Lumper Receipt", required: false },
  { type: "invoice", label: "Invoice", required: true },
  { type: "void_check", label: "Void Check", required: false },
];

export const LOAD_DOCUMENT_LABELS: Record<LoadDocumentType, string> = {
  rate_confirmation: "Rate Confirmation",
  bol: "BOL",
  final_pod: "Final POD",
  lumper_receipt: "Lumper Receipt",
  invoice: "Invoice",
  void_check: "Void Check",
};
