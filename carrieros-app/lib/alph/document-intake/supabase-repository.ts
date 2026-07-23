import "server-only";

import {
  classifyDocumentIntakeState,
  documentConfirmationRequestId,
  isDocumentConfirmationFinal,
  type DocumentIntakeConsistencyState,
} from "@/lib/alph/document-intake/consistency";
import { getDocumentExtractionFieldLabel } from "@/lib/alph/document-intake/extraction-contract";
import type {
  DocumentIntakeRepository,
  DocumentReviewCorrection,
  DocumentUpload,
  ExtractionRetrySource,
  IntakeMimeType,
  PersistedDocument,
  PersistedDocumentReview,
} from "@/lib/alph/document-intake/types";
import {
  getSupabaseAuthenticatedUserClient,
  getSupabaseServerClient,
} from "@/lib/supabase/server";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_EXTRACTED_FIELD_KEYS,
  type DocumentCategory,
  type DocumentExtractedField,
  type DocumentExtractedFieldKey,
} from "@/lib/types/documents";

type DbRow = Record<string, unknown>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FIELD_KEYS = new Set<string>(DOCUMENT_EXTRACTED_FIELD_KEYS);

export class RecoverableDocumentIntakeError extends Error {
  readonly originalStored: boolean;

  constructor(message: string, originalStored = false) {
    super(message);
    this.name = "RecoverableDocumentIntakeError";
    this.originalStored = originalStored;
  }
}

function safeName(name: string): string {
  const normalized = name
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
  return normalized || "document";
}

function row(value: unknown): DbRow | null {
  return value && typeof value === "object" ? (value as DbRow) : null;
}

function rows(value: unknown): DbRow[] {
  return Array.isArray(value) ? value.flatMap((entry) => (row(entry) ? [entry as DbRow] : [])) : [];
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : Number(value) || 0;
}

function fail(error: { message: string } | null, context: string): void {
  if (error) throw new RecoverableDocumentIntakeError(context);
}

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function categoryValue(value: unknown): DocumentCategory {
  const candidate = textValue(value);
  if (candidate === "unknown") return "miscellaneous";
  return (DOCUMENT_CATEGORIES as readonly string[]).includes(candidate)
    ? (candidate as DocumentCategory)
    : "miscellaneous";
}

function mimeValue(value: unknown): IntakeMimeType {
  const candidate = textValue(value);
  if (
    candidate === "application/pdf" ||
    candidate === "image/jpeg" ||
    candidate === "image/png"
  ) {
    return candidate;
  }
  throw new RecoverableDocumentIntakeError(
    "The persisted document type is not supported for review.",
    true,
  );
}

function normalizeCorrections(
  corrections: DocumentReviewCorrection[],
): DocumentReviewCorrection[] {
  if (!Array.isArray(corrections) || corrections.length > 50) {
    throw new RecoverableDocumentIntakeError(
      "The reviewed document fields are invalid.",
      true,
    );
  }
  const normalized: DocumentReviewCorrection[] = [];
  const seen = new Set<string>();
  for (const correction of corrections) {
    if (
      !correction ||
      typeof correction.fieldKey !== "string" ||
      !FIELD_KEYS.has(correction.fieldKey) ||
      typeof correction.value !== "string" ||
      seen.has(correction.fieldKey)
    ) {
      throw new RecoverableDocumentIntakeError(
        "The reviewed document fields are invalid.",
        true,
      );
    }
    seen.add(correction.fieldKey);
    normalized.push({
      fieldKey: correction.fieldKey,
      value: correction.value.trim().slice(0, 4_000),
    });
  }
  return normalized.sort((left, right) =>
    left.fieldKey.localeCompare(right.fieldKey),
  );
}

function correctionSnapshot(payload: unknown): DocumentReviewCorrection[] | null {
  const payloadRow = row(payload);
  if (!payloadRow || !Array.isArray(payloadRow.reviewed_fields)) return null;
  try {
    return normalizeCorrections(
      payloadRow.reviewed_fields.flatMap((entry) => {
        const item = row(entry);
        if (!item) return [];
        return [
          {
            fieldKey: textValue(item.field_key) as DocumentExtractedFieldKey,
            value: textValue(item.value),
          },
        ];
      }),
    );
  } catch {
    return null;
  }
}

function correctionsMatch(
  left: DocumentReviewCorrection[] | null,
  right: DocumentReviewCorrection[],
): boolean {
  return Boolean(left) && JSON.stringify(left) === JSON.stringify(right);
}

function fieldFromRow(value: DbRow): DocumentExtractedField | null {
  const key = textValue(value.field_key);
  if (!FIELD_KEYS.has(key)) return null;
  const confidence = Math.min(1, Math.max(0, numberValue(value.confidence)));
  return {
    key: key as DocumentExtractedFieldKey,
    label: textValue(value.label) || getDocumentExtractionFieldLabel(key as DocumentExtractedFieldKey),
    value: textValue(value.value_text),
    confidence,
    needsHumanVerification: value.is_verified !== true || confidence < 0.85,
  };
}

export class SupabaseDocumentIntakeRepository
  implements DocumentIntakeRepository
{
  private readonly db = getSupabaseServerClient();
  private readonly bucket =
    process.env.ALPH_DOCUMENT_BUCKET ?? "company-documents";

  private async storageObjectExists(path: string): Promise<boolean> {
    const separator = path.lastIndexOf("/");
    if (separator <= 0) return false;
    const folder = path.slice(0, separator);
    const filename = path.slice(separator + 1);
    const result = await this.db.storage
      .from(this.bucket)
      .list(folder, { limit: 100, search: filename });
    fail(result.error, "Private document storage could not be verified");
    return Boolean(result.data?.some((entry) => entry.name === filename));
  }

  private async uploadIfMissing(
    path: string,
    input: DocumentUpload,
  ): Promise<void> {
    if (await this.storageObjectExists(path)) return;
    const uploaded = await this.db.storage.from(this.bucket).upload(path, input.bytes, {
      contentType: input.mimeType,
      upsert: false,
    });
    if (uploaded.error && !(await this.storageObjectExists(path))) {
      throw new RecoverableDocumentIntakeError(
        "The private document could not be stored. Retry safely.",
      );
    }
  }

  private async ensureExistingVersion(
    document: DbRow,
    input: DocumentUpload,
  ): Promise<{ versionId: string; storagePath: string }> {
    const documentId = textValue(document.id);
    const currentVersionId = textValue(document.current_version_id);
    let version: DbRow | null = null;

    if (currentVersionId) {
      const result = await this.db
        .from("document_versions")
        .select("id,storage_bucket,storage_path")
        .eq("company_id", input.companyId)
        .eq("document_id", documentId)
        .eq("id", currentVersionId)
        .maybeSingle();
      fail(result.error, "Existing document version lookup failed");
      version = row(result.data);
    }

    if (!version) {
      const result = await this.db
        .from("document_versions")
        .select("id,storage_bucket,storage_path")
        .eq("company_id", input.companyId)
        .eq("document_id", documentId)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      fail(result.error, "Existing document version lookup failed");
      version = row(result.data);
    }

    let versionId = textValue(version?.id);
    let storagePath = textValue(version?.storage_path);
    if (!versionId || !storagePath) {
      versionId = crypto.randomUUID();
      storagePath = `${input.companyId}/${input.userId}/${documentId}/1-${safeName(input.fileName)}`;
      await this.uploadIfMissing(storagePath, input);
      const inserted = await this.db
        .from("document_versions")
        .insert({
          id: versionId,
          company_id: input.companyId,
          document_id: documentId,
          version_number: 1,
          storage_bucket: this.bucket,
          storage_path: storagePath,
          filename: input.fileName,
          mime_type: input.mimeType,
          size_bytes: input.bytes.byteLength,
          checksum_sha256: input.checksumSha256,
          created_by: input.userId,
        })
        .select("id")
        .single();
      fail(inserted.error, "Document version reconciliation failed");
    } else {
      await this.uploadIfMissing(storagePath, input);
    }

    const linked = await this.db
      .from("documents")
      .update({ current_version_id: versionId, status: "processing" })
      .eq("id", documentId)
      .eq("company_id", input.companyId)
      .select("id")
      .single();
    fail(linked.error, "Current document version reconciliation failed");
    return { versionId, storagePath };
  }

  private async duplicateState(input: {
    documentId: string;
    versionId: string;
    storagePath: string;
    companyId: string;
  }): Promise<DocumentIntakeConsistencyState> {
    const [documentResult, ocrResult, proposalResult, approvalResult, auditResult] =
      await Promise.all([
        this.db
          .from("documents")
          .select("status,current_version_id")
          .eq("company_id", input.companyId)
          .eq("id", input.documentId)
          .maybeSingle(),
        this.db
          .from("document_ocr_results")
          .select("id,status")
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId)
          .eq("document_version_id", input.versionId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        this.db
          .from("document_proposed_actions")
          .select("id,status,requires_approval,ocr_result_id")
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        this.db
          .from("document_approvals")
          .select("decision,proposed_action_id")
          .eq("company_id", input.companyId)
          .order("decided_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        this.db
          .from("document_audit_history")
          .select("event_type")
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId),
      ]);
    fail(documentResult.error, "Existing document state lookup failed");
    fail(ocrResult.error, "Existing OCR state lookup failed");
    fail(proposalResult.error, "Existing proposal state lookup failed");
    fail(approvalResult.error, "Existing approval state lookup failed");
    fail(auditResult.error, "Existing audit state lookup failed");

    const document = row(documentResult.data);
    const ocr = row(ocrResult.data);
    const proposal = row(proposalResult.data);
    const approval = row(approvalResult.data);
    const audits = rows(auditResult.data);
    const storageExists = await this.storageObjectExists(input.storagePath);
    let allFieldsVerified = false;
    if (ocr && textValue(ocr.id)) {
      const fields = await this.db
        .from("document_ocr_fields")
        .select("is_verified")
        .eq("company_id", input.companyId)
        .eq("ocr_result_id", textValue(ocr.id));
      fail(fields.error, "Existing OCR field state lookup failed");
      allFieldsVerified = rows(fields.data).every((field) => field.is_verified === true);
    }

    return {
      currentVersionValid:
        textValue(document?.current_version_id) === input.versionId,
      storageObjectExists: storageExists,
      ocrStatus: textValue(ocr?.status) || undefined,
      proposedActionStatus: textValue(proposal?.status) || undefined,
      requiresApproval: proposal?.requires_approval === true,
      approvalDecision:
        textValue(approval?.proposed_action_id) === textValue(proposal?.id)
          ? textValue(approval?.decision) || undefined
          : undefined,
      allFieldsVerified,
      proposalAuditExists: audits.some(
        (audit) => audit.event_type === "document_ocr_review_proposed",
      ),
      confirmationAuditExists: audits.some(
        (audit) => audit.event_type === "document_review_confirmed",
      ),
      documentStatus: textValue(document?.status) || undefined,
    };
  }

  async saveUpload(
    input: DocumentUpload,
    accessToken: string,
  ): Promise<PersistedDocument> {
    void accessToken;
    const existingResult = await this.db
      .from("documents")
      .select("id,current_version_id,status")
      .eq("company_id", input.companyId)
      .eq("checksum_sha256", input.checksumSha256)
      .maybeSingle();
    fail(existingResult.error, "Duplicate document lookup failed");
    const existing = row(existingResult.data);
    if (existing) {
      const documentId = textValue(existing.id);
      const version = await this.ensureExistingVersion(existing, input);
      const state = await this.duplicateState({
        documentId,
        versionId: version.versionId,
        storagePath: version.storagePath,
        companyId: input.companyId,
      });
      const disposition = classifyDocumentIntakeState(state);
      return {
        id: documentId,
        versionId: version.versionId,
        storagePath: version.storagePath,
        duplicate:
          disposition === "duplicate_reviewable" ||
          disposition === "duplicate_completed" ||
          disposition === "retry_confirmation",
        reconciled:
          disposition === "resume_intake",
      };
    }

    const documentId = crypto.randomUUID();
    const versionId = crypto.randomUUID();
    const storagePath = `${input.companyId}/${input.userId}/${documentId}/1-${safeName(input.fileName)}`;
    await this.uploadIfMissing(storagePath, input);

    const document = await this.db
      .from("documents")
      .insert({
        id: documentId,
        company_id: input.companyId,
        created_by: input.userId,
        title: input.fileName,
        filename: input.fileName,
        mime_type: input.mimeType,
        size_bytes: input.bytes.byteLength,
        checksum_sha256: input.checksumSha256,
        current_version_id: null,
        status: "processing",
      })
      .select("id")
      .single();
    if (document.error) {
      const raced = await this.db
        .from("documents")
        .select("id,current_version_id,status")
        .eq("company_id", input.companyId)
        .eq("checksum_sha256", input.checksumSha256)
        .maybeSingle();
      if (row(raced.data)) {
        await this.db.storage.from(this.bucket).remove([storagePath]);
        const reconciled = await this.ensureExistingVersion(row(raced.data)!, input);
        return {
          id: textValue(row(raced.data)!.id),
          versionId: reconciled.versionId,
          storagePath: reconciled.storagePath,
          duplicate: false,
          reconciled: true,
        };
      }
      await this.db.storage.from(this.bucket).remove([storagePath]);
      throw new RecoverableDocumentIntakeError(
        "Document metadata could not be stored. Retry safely.",
      );
    }

    const version = await this.db
      .from("document_versions")
      .insert({
        id: versionId,
        company_id: input.companyId,
        document_id: documentId,
        version_number: 1,
        storage_bucket: this.bucket,
        storage_path: storagePath,
        filename: input.fileName,
        mime_type: input.mimeType,
        size_bytes: input.bytes.byteLength,
        checksum_sha256: input.checksumSha256,
        created_by: input.userId,
      })
      .select("id")
      .single();
    if (version.error) {
      await this.db
        .from("documents")
        .update({ status: "failed" })
        .eq("company_id", input.companyId)
        .eq("id", documentId);
      throw new RecoverableDocumentIntakeError(
        "The original is stored, but its version record is incomplete. Retry the same file.",
        true,
      );
    }

    const linked = await this.db
      .from("documents")
      .update({ current_version_id: versionId })
      .eq("company_id", input.companyId)
      .eq("id", documentId)
      .select("id")
      .single();
    if (linked.error) {
      throw new RecoverableDocumentIntakeError(
        "The original is stored, but intake linking is incomplete. Retry the same file.",
        true,
      );
    }

    return {
      id: documentId,
      versionId,
      storagePath,
      duplicate: false,
      reconciled: false,
    };
  }

  async saveExtraction(
    input: Parameters<DocumentIntakeRepository["saveExtraction"]>[0],
  ): Promise<string> {
    const result = await this.db
      .from("document_ocr_results")
      .insert({
        company_id: input.companyId,
        document_id: input.documentId,
        document_version_id: input.versionId,
        provider: input.extraction.provider,
        model_id: input.extraction.modelId,
        prompt_version: input.extraction.promptVersion,
        status:
          input.extraction.overallConfidence < 0.85
            ? "needs_review"
            : "completed",
        classified_type:
          input.extraction.category === "miscellaneous"
            ? "unknown"
            : input.extraction.category,
        overall_confidence: input.extraction.overallConfidence,
        raw_text: input.extraction.rawText,
        fields: input.extraction.fields,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    fail(result.error, "OCR result insert failed");
    const ocrResultId = textValue(row(result.data)?.id);
    if (!ocrResultId) {
      throw new RecoverableDocumentIntakeError(
        "OCR result insert returned no record.",
        true,
      );
    }

    if (input.extraction.fields.length) {
      const fields = await this.db
        .from("document_ocr_fields")
        .insert(
          input.extraction.fields.map((field) => ({
            company_id: input.companyId,
            ocr_result_id: ocrResultId,
            field_key: field.key,
            label: field.label,
            value_text: field.value,
            confidence: field.confidence,
          })),
        )
        .select("id");
      if (fields.error || rows(fields.data).length !== input.extraction.fields.length) {
        await this.db
          .from("document_ocr_results")
          .update({ status: "failed", error_code: "field_persistence_failed" })
          .eq("company_id", input.companyId)
          .eq("id", ocrResultId);
        throw new RecoverableDocumentIntakeError(
          "Extracted fields did not persist completely. Retry extraction.",
          true,
        );
      }
    }
    return ocrResultId;
  }

  async createProposedAction(
    input: Parameters<DocumentIntakeRepository["createProposedAction"]>[0],
  ): Promise<string> {
    const existing = await this.db
      .from("document_proposed_actions")
      .select("id")
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("ocr_result_id", input.ocrResultId)
      .eq("action_kind", input.actionKind)
      .in("status", ["pending", "approved"])
      .maybeSingle();
    fail(existing.error, "Existing proposed action lookup failed");
    const existingId = textValue(row(existing.data)?.id);
    if (existingId) return existingId;

    const result = await this.db
      .from("document_proposed_actions")
      .insert({
        company_id: input.companyId,
        document_id: input.documentId,
        ocr_result_id: input.ocrResultId,
        action_kind: input.actionKind,
        summary: input.summary,
        payload: input.payload,
        confidence: input.confidence,
        requires_approval: true,
        created_by: input.userId,
      })
      .select("id")
      .single();
    fail(result.error, "Proposed action insert failed");
    const id = textValue(row(result.data)?.id);
    if (!id) {
      throw new RecoverableDocumentIntakeError(
        "Proposed action insert returned no record.",
        true,
      );
    }
    return id;
  }

  async recordApproval(
    input: Parameters<DocumentIntakeRepository["recordApproval"]>[0],
  ): Promise<string> {
    const userDb = getSupabaseAuthenticatedUserClient(input.accessToken);
    const existing = await userDb
      .from("document_approvals")
      .select("id,company_id,decision,decided_by")
      .eq("company_id", input.companyId)
      .eq("proposed_action_id", input.proposedActionId)
      .maybeSingle();
    fail(existing.error, "Existing document approval lookup failed");
    const existingRow = row(existing.data);
    if (existingRow) {
      if (
        textValue(existingRow.decision) !== input.decision ||
        textValue(existingRow.decided_by) !== input.userId
      ) {
        throw new RecoverableDocumentIntakeError(
          "This proposal already has a different human decision.",
          true,
        );
      }
      return textValue(existingRow.id);
    }

    const result = await userDb
      .from("document_approvals")
      .insert({
        company_id: input.companyId,
        proposed_action_id: input.proposedActionId,
        decision: input.decision,
        decided_by: input.userId,
        decision_note: input.note,
      })
      .select("id")
      .single();
    fail(result.error, "Document approval insert failed");
    const id = textValue(row(result.data)?.id);
    if (!id) {
      throw new RecoverableDocumentIntakeError(
        "Document approval insert returned no record.",
        true,
      );
    }
    return id;
  }

  async appendAudit(
    input: Parameters<DocumentIntakeRepository["appendAudit"]>[0],
  ): Promise<void> {
    if (input.requestId) {
      const existing = await this.db
        .from("document_audit_history")
        .select("id")
        .eq("company_id", input.companyId)
        .eq("document_id", input.documentId)
        .eq("request_id", input.requestId)
        .maybeSingle();
      fail(existing.error, "Existing document audit lookup failed");
      if (row(existing.data)) return;
    }
    const result = await this.db.from("document_audit_history").insert({
      company_id: input.companyId,
      document_id: input.documentId,
      proposed_action_id: input.proposedActionId,
      actor_user_id: input.userId,
      event_type: input.eventType,
      detail: input.detail,
      request_id: input.requestId,
    });
    fail(result.error, "Document audit insert failed");
  }

  async finalizeExtractionProposal(input: {
    documentId: string;
    versionId: string;
    ocrResultId: string;
    proposedActionId: string;
    companyId: string;
    classifiedType: Exclude<DocumentCategory, "miscellaneous"> | "unknown";
  }): Promise<void> {
    const [ocr, proposal] = await Promise.all([
      this.db
        .from("document_ocr_results")
        .select("id")
        .eq("company_id", input.companyId)
        .eq("document_id", input.documentId)
        .eq("document_version_id", input.versionId)
        .eq("id", input.ocrResultId)
        .maybeSingle(),
      this.db
        .from("document_proposed_actions")
        .select("id,requires_approval")
        .eq("company_id", input.companyId)
        .eq("document_id", input.documentId)
        .eq("ocr_result_id", input.ocrResultId)
        .eq("id", input.proposedActionId)
        .maybeSingle(),
    ]);
    fail(ocr.error, "Extraction finalization OCR lookup failed");
    fail(proposal.error, "Extraction finalization proposal lookup failed");
    if (!row(ocr.data) || row(proposal.data)?.requires_approval !== true) {
      throw new RecoverableDocumentIntakeError(
        "The extraction proposal is incomplete. Retry safely.",
        true,
      );
    }
    const updated = await this.db
      .from("documents")
      .update({
        status: "needs_review",
        document_type: input.classifiedType,
        current_version_id: input.versionId,
      })
      .eq("company_id", input.companyId)
      .eq("id", input.documentId)
      .select("id")
      .single();
    fail(updated.error, "Extraction finalization document update failed");
  }

  async markExtractionFailed(input: {
    documentId: string;
    versionId: string;
    companyId: string;
  }): Promise<void> {
    const updated = await this.db
      .from("documents")
      .update({ status: "failed", current_version_id: input.versionId })
      .eq("company_id", input.companyId)
      .eq("id", input.documentId)
      .select("id")
      .single();
    fail(updated.error, "Document extraction failure state update failed");
  }

  async loadExtractionRetrySource(input: {
    documentId: string;
    companyId: string;
    userId: string;
    accessToken: string;
  }): Promise<ExtractionRetrySource> {
    if (!isUuid(input.documentId)) {
      throw new RecoverableDocumentIntakeError(
        "The extraction retry request is invalid.",
      );
    }
    const userDb = getSupabaseAuthenticatedUserClient(input.accessToken);
    const documentResult = await userDb
      .from("documents")
      .select("id,current_version_id,filename,mime_type,checksum_sha256")
      .eq("company_id", input.companyId)
      .eq("id", input.documentId)
      .maybeSingle();
    fail(documentResult.error, "Stored document lookup failed");
    const document = row(documentResult.data);
    const versionId = textValue(document?.current_version_id);
    if (!document || !versionId) {
      throw new RecoverableDocumentIntakeError(
        "The stored original has no valid current version.",
        true,
      );
    }
    const versionResult = await userDb
      .from("document_versions")
      .select("id,storage_bucket,storage_path,filename,mime_type,checksum_sha256")
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("id", versionId)
      .maybeSingle();
    fail(versionResult.error, "Stored document version lookup failed");
    const version = row(versionResult.data);
    const storagePath = textValue(version?.storage_path);
    if (!version || !storagePath || !(await this.storageObjectExists(storagePath))) {
      throw new RecoverableDocumentIntakeError(
        "The private stored original is unavailable for extraction retry.",
        true,
      );
    }
    const downloaded = await this.db.storage.from(this.bucket).download(storagePath);
    fail(downloaded.error, "Private stored original download failed");
    if (!downloaded.data) {
      throw new RecoverableDocumentIntakeError(
        "The private stored original is unavailable for extraction retry.",
        true,
      );
    }
    const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
    return {
      documentId: input.documentId,
      versionId,
      upload: {
        companyId: input.companyId,
        userId: input.userId,
        fileName: textValue(version.filename) || textValue(document.filename),
        mimeType: mimeValue(version.mime_type ?? document.mime_type),
        bytes,
        checksumSha256:
          textValue(version.checksum_sha256) ||
          textValue(document.checksum_sha256),
      },
    };
  }

  async getDocument(input: {
    documentId: string;
    companyId: string;
    accessToken: string;
  }): Promise<PersistedDocumentReview | null> {
    const userDb = getSupabaseAuthenticatedUserClient(input.accessToken);
    const documentResult = await userDb
      .from("documents")
      .select(
        "id,current_version_id,filename,mime_type,size_bytes,document_type,status,created_at",
      )
      .eq("company_id", input.companyId)
      .eq("id", input.documentId)
      .maybeSingle();
    fail(documentResult.error, "Document review lookup failed");
    const document = row(documentResult.data);
    if (!document) return null;
    const versionId = textValue(document.current_version_id);
    if (!versionId) return null;

    const versionResult = await userDb
      .from("document_versions")
      .select("id,storage_path")
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("id", versionId)
      .maybeSingle();
    fail(versionResult.error, "Document version review lookup failed");
    const version = row(versionResult.data);
    if (!version) return null;

    const ocrResult = await userDb
      .from("document_ocr_results")
      .select("id,status")
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("document_version_id", versionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    fail(ocrResult.error, "Document OCR review lookup failed");
    const ocr = row(ocrResult.data);
    const ocrResultId = textValue(ocr?.id);

    const fieldsResult = ocrResultId
      ? await userDb
          .from("document_ocr_fields")
          .select("field_key,label,value_text,confidence,is_verified")
          .eq("company_id", input.companyId)
          .eq("ocr_result_id", ocrResultId)
      : { data: [], error: null };
    fail(fieldsResult.error, "Document OCR fields review lookup failed");
    const fieldRows = rows(fieldsResult.data);
    const fields = fieldRows.flatMap((entry) => {
      const mapped = fieldFromRow(entry);
      return mapped ? [mapped] : [];
    });

    const proposalResult = ocrResultId
      ? await userDb
          .from("document_proposed_actions")
          .select("id,status,requires_approval")
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId)
          .eq("ocr_result_id", ocrResultId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null, error: null };
    fail(proposalResult.error, "Document proposal review lookup failed");
    const proposal = row(proposalResult.data);
    const proposedActionId = textValue(proposal?.id);

    const approvalResult = proposedActionId
      ? await userDb
          .from("document_approvals")
          .select("decision")
          .eq("company_id", input.companyId)
          .eq("proposed_action_id", proposedActionId)
          .maybeSingle()
      : { data: null, error: null };
    fail(approvalResult.error, "Document approval review lookup failed");
    const approval = row(approvalResult.data);
    const auditResult = await userDb
      .from("document_audit_history")
      .select("event_type")
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId);
    fail(auditResult.error, "Document audit review lookup failed");
    const audits = rows(auditResult.data);
    const state: DocumentIntakeConsistencyState = {
      currentVersionValid: true,
      storageObjectExists: await this.storageObjectExists(
        textValue(version.storage_path),
      ),
      ocrStatus: textValue(ocr?.status) || undefined,
      proposedActionStatus: textValue(proposal?.status) || undefined,
      requiresApproval: proposal?.requires_approval === true,
      approvalDecision: textValue(approval?.decision) || undefined,
      allFieldsVerified: fieldRows.every((entry) => entry.is_verified === true),
      proposalAuditExists: audits.some(
        (entry) => entry.event_type === "document_ocr_review_proposed",
      ),
      confirmationAuditExists: audits.some(
        (entry) => entry.event_type === "document_review_confirmed",
      ),
      documentStatus: textValue(document.status),
    };
    const final = isDocumentConfirmationFinal(state);
    const decision = textValue(approval?.decision);

    return {
      id: input.documentId,
      versionId,
      ocrResultId: ocrResultId || undefined,
      proposedActionId: proposedActionId || undefined,
      filename: textValue(document.filename),
      mimeType: mimeValue(document.mime_type),
      sizeBytes: numberValue(document.size_bytes),
      category: categoryValue(document.document_type),
      status: final
        ? "ready"
        : (textValue(document.status) as PersistedDocumentReview["status"]),
      approvalStatus: final
        ? "approved"
        : decision === "rejected"
          ? "rejected"
          : "pending",
      fields,
      createdAt: textValue(document.created_at),
    };
  }

  async confirmReview(input: {
    documentId: string;
    ocrResultId: string;
    proposedActionId: string;
    companyId: string;
    userId: string;
    accessToken: string;
    corrections: DocumentReviewCorrection[];
  }): Promise<PersistedDocumentReview> {
    const corrections = normalizeCorrections(input.corrections);
    const userDb = getSupabaseAuthenticatedUserClient(input.accessToken);
    const [documentResult, ocrResult, proposalResult, fieldsResult] =
      await Promise.all([
        userDb
          .from("documents")
          .select("id,current_version_id,status")
          .eq("company_id", input.companyId)
          .eq("id", input.documentId)
          .maybeSingle(),
        userDb
          .from("document_ocr_results")
          .select("id,status,document_version_id")
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId)
          .eq("id", input.ocrResultId)
          .maybeSingle(),
        userDb
          .from("document_proposed_actions")
          .select("id,status,requires_approval,payload,ocr_result_id")
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId)
          .eq("id", input.proposedActionId)
          .maybeSingle(),
        userDb
          .from("document_ocr_fields")
          .select("id,field_key,value_text,is_verified")
          .eq("company_id", input.companyId)
          .eq("ocr_result_id", input.ocrResultId),
      ]);
    fail(documentResult.error, "Confirmation document lookup failed");
    fail(ocrResult.error, "Confirmation OCR lookup failed");
    fail(proposalResult.error, "Confirmation proposal lookup failed");
    fail(fieldsResult.error, "Confirmation field lookup failed");
    const document = row(documentResult.data);
    const ocr = row(ocrResult.data);
    const proposal = row(proposalResult.data);
    const fieldRows = rows(fieldsResult.data);
    if (
      !document ||
      !ocr ||
      !proposal ||
      textValue(proposal.ocr_result_id) !== input.ocrResultId ||
      proposal.requires_approval !== true ||
      textValue(document.current_version_id) !== textValue(ocr.document_version_id)
    ) {
      throw new RecoverableDocumentIntakeError(
        "The document review no longer matches its persisted proposal.",
        true,
      );
    }

    const fieldKeys = new Set(fieldRows.map((entry) => textValue(entry.field_key)));
    if (corrections.some((entry) => !fieldKeys.has(entry.fieldKey))) {
      throw new RecoverableDocumentIntakeError(
        "A reviewed field is not part of the persisted extraction.",
        true,
      );
    }
    const existingSnapshot = correctionSnapshot(proposal.payload);
    if (existingSnapshot && !correctionsMatch(existingSnapshot, corrections)) {
      throw new RecoverableDocumentIntakeError(
        "A confirmation retry must use the originally approved field values.",
        true,
      );
    }

    const correctionByKey = new Map(
      corrections.map((entry) => [entry.fieldKey, entry.value]),
    );
    for (const field of fieldRows) {
      const fieldKey = textValue(field.field_key) as DocumentExtractedFieldKey;
      const updated = await this.db
        .from("document_ocr_fields")
        .update({
          value_text: correctionByKey.get(fieldKey) ?? textValue(field.value_text),
          is_verified: true,
          verified_by: input.userId,
          verified_at: new Date().toISOString(),
        })
        .eq("company_id", input.companyId)
        .eq("ocr_result_id", input.ocrResultId)
        .eq("id", textValue(field.id))
        .select("id")
        .single();
      fail(updated.error, "Reviewed field persistence failed");
    }

    const payload = row(proposal.payload) ?? {};
    const prepared = await this.db
      .from("document_proposed_actions")
      .update({
        payload: {
          ...payload,
          reviewed_fields: corrections.map((entry) => ({
            field_key: entry.fieldKey,
            value: entry.value,
          })),
          confirmation_state: "prepared",
        },
      })
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("id", input.proposedActionId)
      .select("id")
      .single();
    fail(prepared.error, "Reviewed proposal persistence failed");

    await this.appendAudit({
      documentId: input.documentId,
      proposedActionId: input.proposedActionId,
      companyId: input.companyId,
      userId: input.userId,
      eventType: "document_review_prepared",
      detail:
        "Authenticated human corrections were persisted before the approval decision.",
      requestId: `${documentConfirmationRequestId(input.proposedActionId)}:prepared`,
    });

    await this.recordApproval({
      proposedActionId: input.proposedActionId,
      companyId: input.companyId,
      userId: input.userId,
      accessToken: input.accessToken,
      decision: "approved",
    });

    const ocrUpdated = await this.db
      .from("document_ocr_results")
      .update({ status: "completed" })
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("id", input.ocrResultId)
      .select("id")
      .single();
    fail(ocrUpdated.error, "Confirmed OCR state update failed");

    const proposalUpdated = await this.db
      .from("document_proposed_actions")
      .update({ status: "approved" })
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("id", input.proposedActionId)
      .select("id")
      .single();
    fail(proposalUpdated.error, "Confirmed proposal state update failed");

    await this.appendAudit({
      documentId: input.documentId,
      proposedActionId: input.proposedActionId,
      companyId: input.companyId,
      userId: input.userId,
      eventType: "document_review_confirmed",
      detail:
        "Authenticated human approved the document-only proposal. No operational or financial record was changed.",
      requestId: documentConfirmationRequestId(input.proposedActionId),
    });

    const documentUpdated = await this.db
      .from("documents")
      .update({ status: "ready" })
      .eq("company_id", input.companyId)
      .eq("id", input.documentId)
      .select("id")
      .single();
    fail(documentUpdated.error, "Confirmed document state update failed");

    const review = await this.getDocument({
      documentId: input.documentId,
      companyId: input.companyId,
      accessToken: input.accessToken,
    });
    if (!review || review.approvalStatus !== "approved" || review.status !== "ready") {
      throw new RecoverableDocumentIntakeError(
        "Confirmation remains recoverable and is not complete. Retry safely.",
        true,
      );
    }
    return review;
  }
}
