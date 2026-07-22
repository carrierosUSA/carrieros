"use server";

import { revalidatePath } from "next/cache";
import {
  getDocumentExtractionAdapter,
  RecoverableDocumentIntakeError,
  SupabaseDocumentIntakeRepository,
  validateDocumentFile,
  type DocumentReviewCorrection,
  type DocumentPickupNumberReview,
  type DocumentExtraction,
  type PersistedDocumentReview,
} from "@/lib/alph/document-intake";
import { canApproveDocument } from "@/lib/auth/supabase-claims";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import { can } from "@/lib/permissions/check";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type DocumentCenterUploadResult =
  | {
      ok: true;
      record: PersistedDocumentReview;
      duplicate: boolean;
      message: string;
    }
  | {
      ok: false;
      error: string;
      stored: boolean;
      record?: PersistedDocumentReview;
    };

export type DocumentCenterConfirmResult =
  | { ok: true; record: PersistedDocumentReview }
  | { ok: false; error: string };

export type DocumentCenterRetryResult =
  | { ok: true; record: PersistedDocumentReview; message: string }
  | { ok: false; error: string };

function safeUploadError(error: unknown): string {
  if (error instanceof RecoverableDocumentIntakeError) return error.message;
  const message = error instanceof Error ? error.message : "";
  if (message.startsWith("Unsupported file.")) return message;
  if (message.startsWith("File must be between")) return message;
  return "The document could not be stored securely. Please try again.";
}

function extractionClassifiedType(
  extraction: DocumentExtraction,
): Exclude<DocumentExtraction["category"], "miscellaneous"> | "unknown" {
  return extraction.category === "miscellaneous"
    ? "unknown"
    : extraction.category;
}

async function persistExtractionReview(input: {
  repository: SupabaseDocumentIntakeRepository;
  documentId: string;
  versionId: string;
  companyId: string;
  userId: string;
  extraction: DocumentExtraction;
  retry: boolean;
}): Promise<void> {
  const ocrResultId = await input.repository.saveExtraction({
    documentId: input.documentId,
    versionId: input.versionId,
    companyId: input.companyId,
    userId: input.userId,
    extraction: input.extraction,
  });
  const proposedActionId = await input.repository.createProposedAction({
    documentId: input.documentId,
    ocrResultId,
    companyId: input.companyId,
    userId: input.userId,
    actionKind: "confirm_document_review",
    summary: "Confirm reviewed document extraction",
    payload: {
      document_id: input.documentId,
      ocr_result_id: ocrResultId,
      category: extractionClassifiedType(input.extraction),
      scope: "document_metadata_only",
      extraction_prompt_version: input.extraction.promptVersion,
      extraction_retry: input.retry,
      pickup_number_count: input.extraction.pickupNumbers.length,
    },
    confidence: input.extraction.overallConfidence,
  });
  await input.repository.appendAudit({
    documentId: input.documentId,
    proposedActionId,
    companyId: input.companyId,
    userId: input.userId,
    eventType: "document_ocr_review_proposed",
    detail: input.retry
      ? "A replacement AI extraction was saved as a read-only proposal awaiting authenticated human approval."
      : "AI extraction saved as a read-only proposal awaiting authenticated human approval.",
  });
  await input.repository.finalizeExtractionProposal({
    documentId: input.documentId,
    versionId: input.versionId,
    ocrResultId,
    proposedActionId,
    companyId: input.companyId,
    userId: input.userId,
    classifiedType: extractionClassifiedType(input.extraction),
    pickupNumberCount: input.extraction.pickupNumbers.length,
  });
}

export async function uploadDocumentCenterAction(
  formData: FormData,
): Promise<DocumentCenterUploadResult> {
  const auth = await requireDocumentAuth();
  if (
    !can(
      { userId: auth.userId, role: auth.businessRole },
      "button.documents.upload",
    )
  ) {
    return {
      ok: false,
      error: "Your authenticated role cannot upload documents.",
      stored: false,
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return {
      ok: false,
      error: "Choose one PDF, JPG, or PNG file.",
      stored: false,
    };
  }

  let upload;
  try {
    upload = await validateDocumentFile(file, {
      companyId: auth.companyId,
      userId: auth.userId,
    });
  } catch (error) {
    return { ok: false, error: safeUploadError(error), stored: false };
  }

  const repository = new SupabaseDocumentIntakeRepository();
  let persisted;
  try {
    persisted = await repository.saveUpload(upload, auth.accessToken);
  } catch (error) {
    return {
      ok: false,
      error: safeUploadError(error),
      stored:
        error instanceof RecoverableDocumentIntakeError
          ? error.originalStored
          : false,
    };
  }

  if (persisted.duplicate) {
    let record: PersistedDocumentReview | null = null;
    try {
      record = await repository.getDocument({
        documentId: persisted.id,
        companyId: auth.companyId,
        accessToken: auth.accessToken,
      });
    } catch {
      // A duplicate is not reported as successful unless it reloads safely.
    }
    if (!record) {
      return {
        ok: false,
        error: "The duplicate document exists but could not be reloaded.",
        stored: true,
      };
    }
    revalidatePath("/documents");
    return {
      ok: true,
      record,
      duplicate: true,
      message:
        record.approvalStatus === "approved"
          ? "This document was already stored and its review is complete."
          : "This document was already stored. The existing review was opened.",
    };
  }

  try {
    await repository.appendAudit({
      documentId: persisted.id,
      companyId: auth.companyId,
      userId: auth.userId,
      eventType: persisted.reconciled
        ? "document_upload_reconciled"
        : "document_uploaded",
      detail: persisted.reconciled
        ? "Incomplete intake resumed using the existing company document record."
        : "Original document stored privately for authenticated review.",
    });
  } catch {
    return {
      ok: false,
      error:
        "The original is stored, but intake history is incomplete. Retry the same file to resume.",
      stored: true,
    };
  }

  let extraction;
  try {
    extraction = await getDocumentExtractionAdapter().extract(upload);
  } catch {
    try {
      await repository.markExtractionFailed({
        documentId: persisted.id,
        versionId: persisted.versionId,
        companyId: auth.companyId,
        userId: auth.userId,
      });
      await repository.appendAudit({
        documentId: persisted.id,
        companyId: auth.companyId,
        userId: auth.userId,
        eventType: "document_ocr_failed",
        detail:
          "Document extraction failed safely; the original remains stored without operational changes.",
      });
    } catch {
      // The original remains private even if failure metadata cannot be saved.
    }
    let record: PersistedDocumentReview | null = null;
    try {
      record = await repository.getDocument({
        documentId: persisted.id,
        companyId: auth.companyId,
        accessToken: auth.accessToken,
      });
    } catch {
      // Return a content-free error without masking the stored original.
    }
    revalidatePath("/documents");
    return {
      ok: false,
      error:
        "The original was stored securely, but AI extraction did not complete. No business records changed.",
      stored: true,
      record: record ?? undefined,
    };
  }

  try {
    await persistExtractionReview({
      repository,
      documentId: persisted.id,
      versionId: persisted.versionId,
      companyId: auth.companyId,
      userId: auth.userId,
      extraction,
      retry: false,
    });

    const record = await repository.getDocument({
      documentId: persisted.id,
      companyId: auth.companyId,
      accessToken: auth.accessToken,
    });
    if (!record) {
      throw new Error("Stored review could not be reloaded.");
    }
    revalidatePath("/documents");
    return {
      ok: true,
      record,
      duplicate: false,
      message: "Document stored and extracted. Review is required before approval.",
    };
  } catch {
    let record: PersistedDocumentReview | null = null;
    try {
      record = await repository.getDocument({
        documentId: persisted.id,
        companyId: auth.companyId,
        accessToken: auth.accessToken,
      });
    } catch {
      // Do not expose persistence details or document content.
    }
    revalidatePath("/documents");
    return {
      ok: false,
      error:
        "The original is stored, but its review proposal is incomplete. Retry the same file to resume. No business records changed.",
      stored: true,
      record: record ?? undefined,
    };
  }
}

export async function retryDocumentCenterExtractionAction(input: {
  documentId: string;
}): Promise<DocumentCenterRetryResult> {
  const auth = await requireDocumentAuth();
  if (
    !can(
      { userId: auth.userId, role: auth.businessRole },
      "button.documents.upload",
    )
  ) {
    return {
      ok: false,
      error: "Your authenticated role cannot retry document extraction.",
    };
  }
  if (!UUID_PATTERN.test(input.documentId)) {
    return { ok: false, error: "The extraction retry request is invalid." };
  }

  const repository = new SupabaseDocumentIntakeRepository();
  let source;
  try {
    source = await repository.loadExtractionRetrySource({
      documentId: input.documentId,
      companyId: auth.companyId,
      userId: auth.userId,
      accessToken: auth.accessToken,
    });
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof RecoverableDocumentIntakeError
          ? error.message
          : "The stored original could not be verified for safe extraction retry.",
    };
  }

  let extraction;
  try {
    extraction = await getDocumentExtractionAdapter().extract(source.upload);
  } catch {
    try {
      await repository.appendAudit({
        documentId: source.documentId,
        companyId: auth.companyId,
        userId: auth.userId,
        eventType: "document_ocr_retry_failed",
        detail:
          "Extraction retry failed safely; the prior review and private original remain unchanged.",
      });
    } catch {
      // Preserve a content-free response even if retry auditing is unavailable.
    }
    return {
      ok: false,
      error:
        "AI extraction retry did not complete. The prior review remains unchanged and no business records changed.",
    };
  }

  try {
    await persistExtractionReview({
      repository,
      documentId: source.documentId,
      versionId: source.versionId,
      companyId: auth.companyId,
      userId: auth.userId,
      extraction,
      retry: true,
    });
    const record = await repository.getDocument({
      documentId: source.documentId,
      companyId: auth.companyId,
      accessToken: auth.accessToken,
    });
    if (!record?.ocrResultId || !record.proposedActionId) {
      throw new RecoverableDocumentIntakeError(
        "The replacement extraction could not be reloaded as a reviewable proposal.",
      );
    }
    revalidatePath("/documents");
    revalidatePath(`/documents/${source.documentId}`);
    return {
      ok: true,
      record,
      message:
        "Extraction retried from the stored original. Review and approve the replacement proposal.",
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof RecoverableDocumentIntakeError
          ? error.message
          : "The replacement extraction is incomplete. Retry safely; the prior review remains available and no business records changed.",
    };
  }
}

export async function confirmDocumentCenterReviewAction(input: {
  documentId: string;
  ocrResultId: string;
  proposedActionId: string;
  corrections: DocumentReviewCorrection[];
  pickupNumbers: DocumentPickupNumberReview[];
}): Promise<DocumentCenterConfirmResult> {
  const auth = await requireDocumentAuth();
  if (!canApproveDocument(auth)) {
    return {
      ok: false,
      error: "Your authenticated role cannot approve document reviews.",
    };
  }
  if (
    !UUID_PATTERN.test(input.documentId) ||
    !UUID_PATTERN.test(input.ocrResultId) ||
    !UUID_PATTERN.test(input.proposedActionId) ||
    !Array.isArray(input.corrections) ||
    input.corrections.length > 50 ||
    !Array.isArray(input.pickupNumbers) ||
    input.pickupNumbers.length > 100 ||
    input.pickupNumbers.some(
      (entry) =>
        !entry ||
        typeof entry !== "object" ||
        typeof entry.value !== "string" ||
        typeof entry.displayOrder !== "number",
    )
  ) {
    return { ok: false, error: "The document review request is invalid." };
  }

  try {
    const repository = new SupabaseDocumentIntakeRepository();
    const record = await repository.confirmReview({
      documentId: input.documentId,
      ocrResultId: input.ocrResultId,
      proposedActionId: input.proposedActionId,
      companyId: auth.companyId,
      userId: auth.userId,
      accessToken: auth.accessToken,
      corrections: input.corrections,
      pickupNumbers: input.pickupNumbers,
    });
    revalidatePath("/documents");
    revalidatePath(`/documents/${input.documentId}`);
    return { ok: true, record };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof RecoverableDocumentIntakeError
          ? error.message
          : "Confirmation is incomplete and remains pending. Retry Confirm & Link; no operational or financial records changed.",
    };
  }
}
