import type {
  InvoiceDraft,
  InvoicePacket,
  LoadDocumentRecord,
  LoadDocumentType,
} from "@/lib/types";
import type {
  CaptureLoadDocumentInput,
  PreparePacketInput,
} from "@/lib/services/documents/document-inputs";

export type DocumentPacketChecklistItem = {
  type: LoadDocumentType;
  label: string;
  required: boolean;
  sequence: number;
  status: "missing" | "captured" | "scanned" | "approved";
  document?: LoadDocumentRecord;
};

export type DocumentPacketSummary = {
  loadId: string;
  checklist: DocumentPacketChecklistItem[];
  documents: LoadDocumentRecord[];
  invoiceDraft?: InvoiceDraft;
  packet?: InvoicePacket;
  missingRequired: DocumentPacketChecklistItem[];
  readyToSend: boolean;
  nextMissing?: DocumentPacketChecklistItem;
};

export interface DocumentService {
  getPacketSummary(
    tenantId: string,
    loadId: string,
  ): Promise<DocumentPacketSummary>;
  captureLoadDocument(
    tenantId: string,
    input: CaptureLoadDocumentInput,
  ): Promise<LoadDocumentRecord>;
  generateInvoiceDraft(
    tenantId: string,
    loadId: string,
  ): Promise<InvoiceDraft>;
  preparePacket(
    tenantId: string,
    input: PreparePacketInput,
  ): Promise<InvoicePacket>;
  listLoadDocuments(
    tenantId: string,
    loadId: string,
  ): Promise<LoadDocumentRecord[]>;
}

export type { CaptureLoadDocumentInput, PreparePacketInput };
