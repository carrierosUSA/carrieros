import { MockDocumentExtractionAdapter } from "@/lib/alph/document-intake/mock-adapter";
import { OpenAiDocumentExtractionAdapter } from "@/lib/alph/document-intake/openai-adapter";
import type { DocumentExtractionAdapter } from "@/lib/alph/document-intake/types";

export function getDocumentExtractionAdapter(): DocumentExtractionAdapter {
  if (
    process.env.ALPH_OCR_PROVIDER === "mock" &&
    process.env.NODE_ENV !== "production"
  ) {
    return new MockDocumentExtractionAdapter();
  }
  return new OpenAiDocumentExtractionAdapter();
}

export {
  RecoverableDocumentIntakeError,
  SupabaseDocumentIntakeRepository,
} from "@/lib/alph/document-intake/supabase-repository";
export {
  getDocumentMaxBytes,
  validateDocumentBytes,
  validateDocumentFile,
} from "@/lib/alph/document-intake/validation";
export type {
  DocumentExtraction,
  DocumentExtractionAdapter,
  DocumentIntakeRepository,
  DocumentReviewCorrection,
  DocumentUpload,
  ExtractionRetrySource,
  PersistedDocument,
  PersistedDocumentReview,
} from "@/lib/alph/document-intake/types";
