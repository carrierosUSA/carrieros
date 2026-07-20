/**
 * Typed OCR provider interface for Alph Document Inbox.
 * Real vendors must implement this; demo extraction is explicitly labeled.
 */

import type {
  DocumentCategory,
  DocumentEntityLinks,
  DocumentExtractedField,
} from "@/lib/types/documents";

export type AlphOcrProviderId = "demo" | "veryfi" | "azure_form_recognizer";

export type AlphOcrProviderStatus =
  | "ready"
  | "not_configured"
  | "error"
  | "demo";

export type AlphOcrExtractInput = {
  tenantId: string;
  companyId: string;
  fileName: string;
  /** MIME type when known (image/pdf). */
  mimeType?: string;
  /** Optional byte size for duplicate fingerprinting. */
  byteLength?: number;
  categoryHint?: DocumentCategory;
  /** Content hash / fingerprint when available. */
  contentFingerprint?: string;
};

export type AlphOcrIssueCode =
  | "low_confidence"
  | "missing_pages"
  | "unreadable"
  | "duplicate"
  | "missing_fields"
  | "ambiguous_match";

export type AlphOcrIssue = {
  code: AlphOcrIssueCode;
  message: string;
  fieldKey?: string;
};

export type AlphOcrExtractResult = {
  providerId: AlphOcrProviderId;
  /** True only for deterministic seed/demo parsers — never claim live LLM/OCR. */
  isDemoExtraction: boolean;
  status: AlphOcrProviderStatus;
  statusMessage: string;
  fileName: string;
  category: DocumentCategory;
  extractedAt: string;
  ocrText: string;
  fields: DocumentExtractedField[];
  overallConfidence: number;
  suggestedLinks: DocumentEntityLinks;
  suggestedTags: string[];
  loadNumber?: string;
  invoiceNumber?: string;
  poNumber?: string;
  bolNumber?: string;
  issues: AlphOcrIssue[];
  /** Preserve original filename / storage key reference. */
  originalFileName: string;
};

export interface AlphOcrProvider {
  id: AlphOcrProviderId;
  displayName: string;
  getStatus(): AlphOcrProviderStatus;
  statusMessage(): string;
  extract(input: AlphOcrExtractInput): Promise<AlphOcrExtractResult>;
}
