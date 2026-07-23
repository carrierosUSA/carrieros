"use server";

import { revalidatePath } from "next/cache";
import {
  getDocumentExtractionAdapter,
  RecoverableDocumentIntakeError,
  SupabaseDocumentIntakeRepository,
  validateDocumentFile,
  type DocumentExtraction,
  type DocumentReviewCorrection,
  type PersistedDocumentReview,
} from "@/lib/alph/document-intake";
import { canUploadDocuments } from "@/lib/auth/document-permissions";
import { canApproveDocument } from "@/lib/auth/supabase-claims";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";

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

function classifiedType(
  extraction: DocumentExtraction,
): Exclude<DocumentExtraction["category"], "miscellaneous"> | "unknown" {
  return extraction.category === "miscellaneous"
    ? "unknown"
    : extraction.category;
}

async function persistExtractionProposal(input: {
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
      category: classifiedType(input.extraction),
      scope: "document_metadata_only",
      extraction_prompt_version: input.extraction.promptVersion,
      extraction_retry: input.retry,
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
      : "AI extraction was saved as a read-only proposal awaiting authenticated human approval.",
    requestId: `document-proposal:${proposedActionId}`,
  });
  await input.repository.finalizeExtractionProposal({
    documentId: input.documentId,
    versionId: input.versionId,
    ocrResultId,
    proposedActionId,
    companyId: input.companyId,
    classifiedType: classifiedType(input.extraction),
  });
}

export async function uploadDocumentCenterAction(
  formData: FormData,
): Promise<DocumentCenterUploadResult> {
  const auth = await requireDocumentAuth();
  if (!canUploadDocuments(auth.businessRole)) {
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
    try {
      const record = await repository.getDocument({
        documentId: persisted.id,
        companyId: auth.companyId,
        accessToken: auth.accessToken,
      });
      if (!record?.ocrResultId || !record.proposedActionId) {
        throw new RecoverableDocumentIntakeError(
          "The existing intake is incomplete and must be resumed.",
          true,
        );
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
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof RecoverableDocumentIntakeError
            ? error.message
            : "The existing document could not be reopened safely.",
        stored: true,
      };
    }
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
      requestId: `document-upload:${persisted.versionId}`,
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
      // The original remains private even if failure metadata is unavailable.
    }
    return {
      ok: false,
      error:
        "The original was stored securely, but AI extraction did not complete. No business records changed.",
      stored: true,
    };
  }

  try {
    await persistExtractionProposal({
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
    if (!record?.ocrResultId || !record.proposedActionId) {
      throw new RecoverableDocumentIntakeError(
        "The persisted review proposal could not be reloaded.",
        true,
      );
    }
    revalidatePath("/documents");
    return {
      ok: true,
      record,
      duplicate: false,
      message: "Document stored and extracted. Human review is required.",
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof RecoverableDocumentIntakeError
          ? error.message
          : "The original is stored, but its review proposal is incomplete. Retry safely.",
      stored: true,
    };
  }
}

export async function retryDocumentCenterExtractionAction(input: {
  documentId: string;
}): Promise<DocumentCenterRetryResult> {
  const auth = await requireDocumentAuth();
  if (!canUploadDocuments(auth.businessRole)) {
    return {
      ok: false,
      error: "Your authenticated role cannot retry document extraction.",
    };
  }
  if (!UUID_PATTERN.test(input.documentId)) {
    return { ok: false, error: "The extraction retry request is invalid." };
  }
  const repository = new SupabaseDocumentIntakeRepository();
  try {
    const source = await repository.loadExtractionRetrySource({
      documentId: input.documentId,
      companyId: auth.companyId,
      userId: auth.userId,
      accessToken: auth.accessToken,
    });
    const extraction = await getDocumentExtractionAdapter().extract(source.upload);
    await persistExtractionProposal({
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
        "The replacement extraction could not be reloaded.",
        true,
      );
    }
    revalidatePath("/documents");
    return {
      ok: true,
      record,
      message:
        "Extraction retried from the stored original. Review the replacement proposal.",
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof RecoverableDocumentIntakeError
          ? error.message
          : "AI extraction retry did not complete. The existing review remains unchanged.",
    };
  }
}

export async function confirmDocumentCenterReviewAction(input: {
  documentId: string;
  ocrResultId: string;
  proposedActionId: string;
  corrections: DocumentReviewCorrection[];
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
    !Array.isArray(input.corrections)
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
    });
    revalidatePath("/documents");
    return { ok: true, record };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof RecoverableDocumentIntakeError
          ? error.message
          : "Confirmation remains pending. Retry safely; no business records changed.",
    };
  }
}
