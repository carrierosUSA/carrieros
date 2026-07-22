import "server-only";

import {
  getSupabaseAuthenticatedUserClient,
  getSupabaseServerClient,
} from "@/lib/supabase/server";
import {
  classifyDocumentIntakeState,
  documentConfirmationRequestId,
  isDocumentConfirmationFinal,
  type DocumentIntakeConsistencyState,
  type DocumentIntakeDisposition,
} from "@/lib/alph/document-intake/consistency";
import { DOCUMENT_EXTRACTION_PROMPT_VERSION } from "@/lib/alph/document-intake/extraction-contract";
import {
  getDocumentMaxBytes,
  validateDocumentBytes,
} from "@/lib/alph/document-intake/validation";
import {
  DOCUMENT_CATEGORIES,
  type CarrierDocument,
  type CarrierDocumentStatus,
  type DocumentAuditAction,
  type DocumentCategory,
  type DocumentExtractedField,
  type DocumentExtractedFieldKey,
  type DocumentTimelineEvent,
} from "@/lib/types/documents";
import type {
  DocumentIntakeRepository,
  DocumentExtractionRetrySource,
  DocumentUpload,
  PersistedDocument,
  PersistedDocumentReview,
} from "@/lib/alph/document-intake/types";
import {
  normalizePickupNumbers,
  pickupNumberFingerprint,
} from "@/lib/loads/pickup-numbers";
import type {
  PickupNumber,
  PickupNumberInput,
} from "@/lib/types/pickup-number";

type DbRow = Record<string, unknown>;
type AuthenticatedUserDb = ReturnType<
  typeof getSupabaseAuthenticatedUserClient
>;

type ExistingIntakeInspection = {
  disposition: DocumentIntakeDisposition;
  versions: DbRow[];
  currentVersion?: DbRow;
};

export class RecoverableDocumentIntakeError extends Error {
  readonly originalStored: boolean;

  constructor(message: string, originalStored = true) {
    super(message);
    this.name = "RecoverableDocumentIntakeError";
    this.originalStored = originalStored;
  }
}

function safeName(name: string): string {
  return name
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(0, 160);
}

function fail(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}

function requireUpdatedRow(
  data: unknown,
  error: { message: string } | null,
  context: string,
): DbRow {
  fail(error, context);
  if (!data || typeof data !== "object") {
    throw new Error(`${context}: no company-scoped row was updated.`);
  }
  return data as DbRow;
}

function rows(value: unknown): DbRow[] {
  return Array.isArray(value) ? (value as DbRow[]) : [];
}

function textValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : Number(value) || fallback;
}

function documentCategory(value: unknown): DocumentCategory {
  const category = value === "unknown" ? "miscellaneous" : value;
  return typeof category === "string" &&
    (DOCUMENT_CATEGORIES as readonly string[]).includes(category)
    ? (category as DocumentCategory)
    : "miscellaneous";
}

function documentStatus(
  value: unknown,
  confirmationFinal: boolean,
): CarrierDocumentStatus {
  if (value === "ready" && confirmationFinal) return "linked";
  if (value === "archived") return "deleted";
  return "pending_review";
}

function auditAction(eventType: string): DocumentAuditAction {
  if (eventType.includes("upload")) return "uploaded";
  if (eventType === "document_review_confirmation_prepared") {
    return "ocr_applied";
  }
  if (eventType.includes("review") || eventType.includes("confirm")) {
    return "linked";
  }
  return "ocr_applied";
}

function timelineType(eventType: string): DocumentTimelineEvent["type"] {
  if (eventType.includes("upload")) return "uploaded";
  if (eventType === "document_review_confirmation_prepared") {
    return "ocr_reviewed";
  }
  if (eventType.includes("review") || eventType.includes("confirm")) {
    return "linked";
  }
  return "ocr_reviewed";
}

function fieldValue(
  fields: DocumentExtractedField[],
  key: DocumentExtractedFieldKey,
): string | undefined {
  return fields.find((field) => field.key === key)?.value || undefined;
}

function reviewedCorrectionSnapshot(
  payload: unknown,
): Map<string, string> | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  const snapshot = (payload as DbRow).reviewed_corrections;
  if (!Array.isArray(snapshot)) return null;
  const corrections = new Map<string, string>();
  for (const item of snapshot) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const key = textValue((item as DbRow).key);
    const value = textValue((item as DbRow).value);
    if (!key || corrections.has(key)) return null;
    corrections.set(key, value);
  }
  return corrections;
}

function correctionMapsMatch(
  left: Map<string, string> | null,
  right: Map<string, string>,
): boolean {
  return (
    left !== null &&
    left.size === right.size &&
    [...right].every(([key, value]) => left.get(key) === value)
  );
}

function pickupNumberFromRow(row: DbRow): PickupNumber {
  return {
    id: textValue(row.id),
    value: textValue(row.value_text),
    label: textValue(row.label) || undefined,
    pickupStopId: textValue(row.pickup_stop_id) || undefined,
    pickupStopLabel: textValue(row.pickup_stop_reference) || undefined,
    displayOrder: numberValue(row.display_order),
    confidence: numberValue(row.confidence),
    stopAssociationConfidence: numberValue(row.stop_association_confidence),
    requiresHumanVerification: row.requires_human_verification === true,
    requiresStopAssociationReview: row.requires_stop_review === true,
    source: row.source === "manual" ? "manual" : "ocr",
  };
}

function pickupNumberReviewSnapshot(payload: unknown): PickupNumberInput[] | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  const snapshot = (payload as DbRow).reviewed_pickup_numbers;
  if (!Array.isArray(snapshot)) return null;
  const requested: PickupNumberInput[] = [];
  for (const item of snapshot) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const row = item as DbRow;
    if (typeof row.value !== "string") return null;
    requested.push({
      value: row.value,
      label: textValue(row.label) || undefined,
      pickupStopId: textValue(row.pickup_stop_id) || undefined,
      pickupStopLabel: textValue(row.pickup_stop_reference) || undefined,
      displayOrder: numberValue(row.display_order, requested.length),
    });
  }
  try {
    const normalized = normalizePickupNumbers(requested);
    return normalized.length === requested.length ? normalized : null;
  } catch {
    return null;
  }
}

function pickupNumberSnapshotForFinalGate(
  payload: unknown,
): PickupNumberInput[] | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  const row = payload as DbRow;
  if (!("pickup_number_count" in row)) {
    // Proposals created before the repeatable collection existed contain no
    // pickup-number rows and retain their already-completed state.
    return [];
  }
  return pickupNumberReviewSnapshot(payload);
}

function pickupNumberCollectionsMatch(
  left: PickupNumberInput[] | null,
  right: PickupNumberInput[],
): boolean {
  if (!left || left.length !== right.length) return false;
  return left.every((entry, index) => {
    const other = right[index];
    return (
      other !== undefined &&
      entry.displayOrder === other.displayOrder &&
      pickupNumberFingerprint(entry) === pickupNumberFingerprint(other)
    );
  });
}

function hasReviewProposalAudit(
  action: DbRow,
  auditRows: DbRow[],
  documentId: string,
): boolean {
  const actionId = textValue(action.id);
  const proposalAuditExists = auditRows.some(
    (audit) =>
      textValue(audit.document_id) === documentId &&
      textValue(audit.proposed_action_id) === actionId &&
      textValue(audit.event_type) === "document_ocr_review_proposed",
  );
  const payload =
    action.payload &&
    typeof action.payload === "object" &&
    !Array.isArray(action.payload)
      ? (action.payload as DbRow)
      : {};
  const requiresActivation =
    textValue(payload.extraction_prompt_version) ===
    DOCUMENT_EXTRACTION_PROMPT_VERSION;
  return (
    proposalAuditExists &&
    (!requiresActivation ||
      auditRows.some(
        (audit) =>
          textValue(audit.document_id) === documentId &&
          textValue(audit.proposed_action_id) === actionId &&
          textValue(audit.event_type) === "document_ocr_review_activated",
      ))
  );
}

export class SupabaseDocumentIntakeRepository
  implements DocumentIntakeRepository
{
  private serverDb: ReturnType<typeof getSupabaseServerClient> | undefined;
  private readonly bucket =
    process.env.ALPH_DOCUMENT_BUCKET ?? "company-documents";

  private get db() {
    this.serverDb ??= getSupabaseServerClient();
    return this.serverDb;
  }

  private async storageObjectExists(
    userDb: AuthenticatedUserDb,
    bucket: string,
    path: string,
  ): Promise<boolean> {
    const separator = path.lastIndexOf("/");
    if (separator <= 0 || separator === path.length - 1) return false;
    const folder = path.slice(0, separator);
    const filename = path.slice(separator + 1);
    const result = await userDb.storage.from(bucket).list(folder, {
      limit: 100,
      search: filename,
    });
    fail(result.error, "Private document verification failed");
    return (result.data ?? []).some((entry) => entry.name === filename);
  }

  private async inspectExistingIntake(
    documentRow: DbRow,
    userDb: AuthenticatedUserDb,
  ): Promise<ExistingIntakeInspection> {
    const documentId = textValue(documentRow.id);
    const companyId = textValue(documentRow.company_id);
    const currentVersionId = textValue(documentRow.current_version_id);
    const versionsResult = await this.db
      .from("document_versions")
      .select(
        "id,version_number,storage_bucket,storage_path,mime_type,size_bytes,checksum_sha256",
      )
      .eq("company_id", companyId)
      .eq("document_id", documentId)
      .order("version_number", { ascending: false });
    fail(versionsResult.error, "Existing document versions could not be verified");
    const versions = rows(versionsResult.data);
    const currentVersion = versions.find(
      (version) => textValue(version.id) === currentVersionId,
    );
    const storageExists = currentVersion
      ? await this.storageObjectExists(
          userDb,
          textValue(currentVersion.storage_bucket, this.bucket),
          textValue(currentVersion.storage_path),
        )
      : false;

    const ocrResult = currentVersion
      ? await this.db
          .from("document_ocr_results")
          .select("id,status,document_version_id")
          .eq("company_id", companyId)
          .eq("document_id", documentId)
          .eq("document_version_id", textValue(currentVersion.id))
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null, error: null };
    fail(ocrResult.error, "Existing OCR result could not be verified");
    const ocrRow = ocrResult.data as DbRow | null;
    const actionsResult = await this.db
      .from("document_proposed_actions")
      .select("id,ocr_result_id,status,requires_approval,payload")
      .eq("company_id", companyId)
      .eq("document_id", documentId)
      .order("created_at", { ascending: false });
    fail(actionsResult.error, "Existing review proposal could not be verified");
    const actionRows = rows(actionsResult.data);
    const linkedAction = actionRows.find(
      (action) => textValue(action.ocr_result_id) === textValue(ocrRow?.id),
    );
    const approvedAction = actionRows.find(
      (action) => textValue(action.status) === "approved",
    );
    const approvalAction = approvedAction ?? linkedAction;

    const [fieldsResult, pickupNumbersResult, approvalResult, auditResult] =
      await Promise.all([
      ocrRow
        ? this.db
            .from("document_ocr_fields")
            .select("id,field_key,value_text,is_verified,verified_by")
            .eq("company_id", companyId)
            .eq("ocr_result_id", textValue(ocrRow.id))
        : Promise.resolve({ data: [], error: null }),
      ocrRow
        ? this.db
            .from("document_pickup_numbers")
            .select(
              "id,value_text,label,pickup_stop_id,pickup_stop_reference,display_order,is_verified,verified_by",
            )
            .eq("company_id", companyId)
            .eq("document_id", documentId)
            .eq("ocr_result_id", textValue(ocrRow.id))
            .eq("is_removed", false)
            .order("display_order", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      approvalAction
        ? this.db
            .from("document_approvals")
            .select("id,decision,decided_by")
            .eq("company_id", companyId)
            .eq("proposed_action_id", textValue(approvalAction.id))
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      linkedAction
        ? this.db
            .from("document_audit_history")
            .select("id,event_type,document_id,proposed_action_id")
            .eq("company_id", companyId)
            .eq("document_id", documentId)
            .eq("proposed_action_id", textValue(linkedAction.id))
            .in("event_type", [
              "document_ocr_review_proposed",
              "document_ocr_review_activated",
              "document_review_confirmation_prepared",
              "document_review_confirmed",
            ])
        : Promise.resolve({ data: [], error: null }),
      ]);
    fail(fieldsResult.error, "Existing OCR fields could not be verified");
    fail(
      pickupNumbersResult.error,
      "Existing OCR pickup numbers could not be verified",
    );
    fail(approvalResult.error, "Existing approval could not be verified");
    fail(auditResult.error, "Existing confirmation audit could not be verified");

    const fieldRows = rows(fieldsResult.data);
    const pickupNumberRows = rows(pickupNumbersResult.data);
    const intakeAuditRows = rows(auditResult.data);
    const persistedFieldValues = new Map(
      fieldRows.map((field) => [
        textValue(field.field_key),
        textValue(field.value_text),
      ]),
    );
    const correctionSnapshot = reviewedCorrectionSnapshot(
      linkedAction?.payload,
    );
    const pickupNumberSnapshot = pickupNumberSnapshotForFinalGate(
      linkedAction?.payload,
    );
    const linkedPayload =
      linkedAction?.payload &&
      typeof linkedAction.payload === "object" &&
      !Array.isArray(linkedAction.payload)
        ? (linkedAction.payload as DbRow)
        : {};
    const pickupCollectionComplete =
      !("pickup_number_count" in linkedPayload) ||
      numberValue(linkedPayload.pickup_number_count, -1) ===
        pickupNumberRows.length;
    const state: DocumentIntakeConsistencyState = {
      currentVersionValid: Boolean(currentVersion),
      storageObjectExists: storageExists,
      ocrStatus: textValue(ocrRow?.status) || undefined,
      proposedActionStatus:
        textValue(linkedAction?.status ?? approvedAction?.status) || undefined,
      requiresApproval:
        linkedAction?.requires_approval === true ||
        approvedAction?.requires_approval === true,
      approvalDecision:
        textValue((approvalResult.data as DbRow | null)?.decision) || undefined,
      allFieldsVerified: fieldRows.every(
        (field) =>
          field.is_verified === true &&
          textValue(field.verified_by) ===
            textValue((approvalResult.data as DbRow | null)?.decided_by),
      ) &&
        correctionMapsMatch(correctionSnapshot, persistedFieldValues) &&
        pickupNumberRows.every(
          (entry) =>
            entry.is_verified === true &&
            textValue(entry.verified_by) ===
              textValue((approvalResult.data as DbRow | null)?.decided_by),
        ) &&
        pickupNumberCollectionsMatch(
          pickupNumberSnapshot,
          pickupNumberRows.map(pickupNumberFromRow),
        ),
      proposalAuditExists: Boolean(
        pickupCollectionComplete &&
          linkedAction &&
          hasReviewProposalAudit(linkedAction, intakeAuditRows, documentId),
      ),
      confirmationAuditExists: intakeAuditRows.some((audit) =>
        [
          "document_review_confirmation_prepared",
          "document_review_confirmed",
        ].includes(textValue(audit.event_type)),
      ),
      documentStatus: textValue(documentRow.status) || undefined,
    };
    return {
      disposition: classifyDocumentIntakeState(state),
      versions,
      currentVersion,
    };
  }

  private async reconcileExistingUpload(
    input: DocumentUpload,
    documentRow: DbRow,
    versions: DbRow[],
    userDb: AuthenticatedUserDb,
  ): Promise<PersistedDocument> {
    const documentId = textValue(documentRow.id);
    let usableVersion: DbRow | undefined;
    for (const version of versions) {
      const exists = await this.storageObjectExists(
        userDb,
        textValue(version.storage_bucket, this.bucket),
        textValue(version.storage_path),
      );
      if (exists) {
        usableVersion = version;
        break;
      }
    }

    if (!usableVersion) {
      const nextVersion =
        versions.reduce(
          (maximum, version) =>
            Math.max(maximum, numberValue(version.version_number)),
          0,
        ) + 1;
      const versionId = crypto.randomUUID();
      const path = `${input.companyId}/${input.userId}/${documentId}/${nextVersion}-${safeName(input.fileName)}`;
      const uploaded = await userDb.storage
        .from(this.bucket)
        .upload(path, input.bytes, {
          contentType: input.mimeType,
          upsert: false,
        });
      if (uploaded.error) {
        throw new RecoverableDocumentIntakeError(
          "This matching intake is incomplete and could not be resumed. Retry the upload.",
          false,
        );
      }

      const version = await this.db
        .from("document_versions")
        .insert({
          id: versionId,
          company_id: input.companyId,
          document_id: documentId,
          version_number: nextVersion,
          storage_bucket: this.bucket,
          storage_path: path,
          filename: input.fileName,
          mime_type: input.mimeType,
          size_bytes: input.bytes.byteLength,
          checksum_sha256: input.checksumSha256,
          created_by: input.userId,
        })
        .select("id,version_number,storage_bucket,storage_path")
        .single();
      if (version.error || !version.data) {
        await userDb.storage.from(this.bucket).remove([path]);
        throw new RecoverableDocumentIntakeError(
          "This matching intake is incomplete and could not be resumed. Retry the upload.",
          false,
        );
      }
      usableVersion = version.data as DbRow;
    }

    const linked = await this.db
      .from("documents")
      .update({
        current_version_id: textValue(usableVersion.id),
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)
      .eq("company_id", input.companyId)
      .select("id")
      .maybeSingle();
    requireUpdatedRow(linked.data, linked.error, "Existing intake reconciliation failed");

    return {
      id: documentId,
      versionId: textValue(usableVersion.id),
      storagePath: textValue(usableVersion.storage_path),
      duplicate: false,
      reconciled: true,
    };
  }

  async saveUpload(
    input: DocumentUpload,
    accessToken: string,
  ): Promise<PersistedDocument> {
    const userDb = getSupabaseAuthenticatedUserClient(accessToken);
    const existing = await this.db
      .from("documents")
      .select("id,company_id,status,current_version_id")
      .eq("company_id", input.companyId)
      .eq("checksum_sha256", input.checksumSha256)
      .maybeSingle();
    fail(existing.error, "Duplicate lookup failed");
    if (existing.data) {
      const row = existing.data as DbRow;
      let inspection: ExistingIntakeInspection;
      try {
        inspection = await this.inspectExistingIntake(row, userDb);
      } catch {
        throw new RecoverableDocumentIntakeError(
          "This matching document could not be verified safely. Retry the upload.",
          false,
        );
      }
      if (inspection.disposition === "retry_confirmation") {
        throw new RecoverableDocumentIntakeError(
          "This document has an incomplete confirmation. Open its pending review and retry Confirm & Link.",
          false,
        );
      }
      if (
        inspection.disposition === "duplicate_reviewable" ||
        inspection.disposition === "duplicate_completed"
      ) {
        if (inspection.disposition === "duplicate_reviewable") {
          const normalized = await this.db
            .from("documents")
            .update({
              status: "needs_review",
              updated_at: new Date().toISOString(),
            })
            .eq("company_id", input.companyId)
            .eq("id", textValue(row.id))
            .select("id")
            .maybeSingle();
          requireUpdatedRow(
            normalized.data,
            normalized.error,
            "Existing review state could not be restored",
          );
        }
        return {
          id: textValue(row.id),
          versionId: textValue(inspection.currentVersion?.id),
          storagePath: textValue(inspection.currentVersion?.storage_path),
          duplicate: true,
          reconciled: false,
        };
      }
      try {
        return await this.reconcileExistingUpload(
          input,
          row,
          inspection.versions,
          userDb,
        );
      } catch (error) {
        if (error instanceof RecoverableDocumentIntakeError) throw error;
        throw new RecoverableDocumentIntakeError(
          "This matching intake is incomplete and could not be resumed safely. Retry the upload.",
        );
      }
    }

    const documentId = crypto.randomUUID();
    const versionId = crypto.randomUUID();
    const path = `${input.companyId}/${input.userId}/${documentId}/1-${safeName(input.fileName)}`;
    const uploaded = await userDb.storage
      .from(this.bucket)
      .upload(path, input.bytes, {
        contentType: input.mimeType,
        upsert: false,
      });
    fail(uploaded.error, "Private document upload failed");

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
        storage_provider: "supabase",
      })
      .select("id")
      .single();
    if (document.error) {
      await userDb.storage.from(this.bucket).remove([path]);
      throw new RecoverableDocumentIntakeError(
        "The secure intake could not be created. Retry the upload.",
        false,
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
        storage_path: path,
        filename: input.fileName,
        mime_type: input.mimeType,
        size_bytes: input.bytes.byteLength,
        checksum_sha256: input.checksumSha256,
        created_by: input.userId,
      })
      .select("id")
      .single();
    if (version.error) {
      await userDb.storage.from(this.bucket).remove([path]);
      await this.db
        .from("documents")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", documentId)
        .eq("company_id", input.companyId);
      throw new RecoverableDocumentIntakeError(
        "The original could not be linked to its document version. Retry the upload to resume.",
        false,
      );
    }

    const linked = await this.db
      .from("documents")
      .update({
        current_version_id: versionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)
      .eq("company_id", input.companyId)
      .select("id")
      .maybeSingle();
    if (linked.error || !linked.data) {
      await this.db
        .from("documents")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", documentId)
        .eq("company_id", input.companyId);
      throw new RecoverableDocumentIntakeError(
        "The original was stored, but intake linking is incomplete. Retry the upload to resume.",
      );
    }

    return {
      id: documentId,
      versionId,
      storagePath: path,
      duplicate: false,
      reconciled: false,
    };
  }

  async loadExtractionRetrySource(
    input: Parameters<
      DocumentIntakeRepository["loadExtractionRetrySource"]
    >[0],
  ): Promise<DocumentExtractionRetrySource> {
    const userDb = getSupabaseAuthenticatedUserClient(input.accessToken);
    const documentResult = await userDb
      .from("documents")
      .select(
        "id,company_id,filename,mime_type,size_bytes,checksum_sha256,status,current_version_id",
      )
      .eq("company_id", input.companyId)
      .eq("id", input.documentId)
      .maybeSingle();
    fail(documentResult.error, "Retry document lookup failed");
    if (!documentResult.data) {
      throw new RecoverableDocumentIntakeError(
        "The stored document is not available to this authenticated company.",
      );
    }
    const documentRow = documentResult.data as DbRow;
    if (["ready", "archived"].includes(textValue(documentRow.status))) {
      throw new RecoverableDocumentIntakeError(
        "A completed or archived document cannot be re-extracted.",
      );
    }

    const actionResult = await userDb
      .from("document_proposed_actions")
      .select("id,status")
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId);
    fail(actionResult.error, "Retry approval-state lookup failed");
    const actionRows = rows(actionResult.data);
    if (
      actionRows.some((action) =>
        ["approved", "executed"].includes(textValue(action.status)),
      )
    ) {
      throw new RecoverableDocumentIntakeError(
        "An approved document review cannot be replaced by extraction retry.",
      );
    }
    const actionIds = actionRows.map((action) => textValue(action.id));
    if (actionIds.length) {
      const approvalResult = await userDb
        .from("document_approvals")
        .select("id,decision")
        .eq("company_id", input.companyId)
        .in("proposed_action_id", actionIds);
      fail(approvalResult.error, "Retry approval decision lookup failed");
      if (
        rows(approvalResult.data).some(
          (approval) => textValue(approval.decision) === "approved",
        )
      ) {
        throw new RecoverableDocumentIntakeError(
          "An approved document review cannot be replaced by extraction retry.",
        );
      }
    }

    const versionId = textValue(documentRow.current_version_id);
    if (!versionId) {
      throw new RecoverableDocumentIntakeError(
        "The stored document has no current version to re-extract.",
      );
    }
    const versionResult = await userDb
      .from("document_versions")
      .select(
        "id,document_id,storage_bucket,storage_path,filename,mime_type,size_bytes,checksum_sha256",
      )
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("id", versionId)
      .maybeSingle();
    fail(versionResult.error, "Retry document-version lookup failed");
    if (!versionResult.data) {
      throw new RecoverableDocumentIntakeError(
        "The current document version is missing and cannot be re-extracted.",
      );
    }
    const versionRow = versionResult.data as DbRow;
    const bucket = textValue(versionRow.storage_bucket);
    const storagePath = textValue(versionRow.storage_path);
    const mimeType = textValue(versionRow.mime_type);
    const sizeBytes = numberValue(versionRow.size_bytes);
    const checksum = textValue(versionRow.checksum_sha256);
    if (
      bucket !== this.bucket ||
      !storagePath.startsWith(`${input.companyId}/`) ||
      sizeBytes <= 0 ||
      sizeBytes > getDocumentMaxBytes() ||
      mimeType !== textValue(documentRow.mime_type) ||
      sizeBytes !== numberValue(documentRow.size_bytes) ||
      !checksum ||
      checksum !== textValue(documentRow.checksum_sha256)
    ) {
      throw new RecoverableDocumentIntakeError(
        "The stored document metadata could not be verified for safe extraction retry.",
      );
    }

    const download = await userDb.storage
      .from(bucket)
      .download(storagePath);
    fail(download.error, "Private document retry download failed");
    if (!download.data) {
      throw new RecoverableDocumentIntakeError(
        "The private document object is unavailable for extraction retry.",
      );
    }
    const bytes = new Uint8Array(await download.data.arrayBuffer());
    const upload = validateDocumentBytes(
      {
        bytes,
        fileName: textValue(versionRow.filename, textValue(documentRow.filename)),
        mimeType,
      },
      { companyId: input.companyId, userId: input.userId },
    );
    if (
      upload.checksumSha256 !== checksum ||
      upload.bytes.byteLength !== sizeBytes
    ) {
      throw new RecoverableDocumentIntakeError(
        "The private document object failed integrity verification.",
      );
    }

    return { documentId: input.documentId, versionId, upload };
  }

  async saveExtraction(
    input: Parameters<DocumentIntakeRepository["saveExtraction"]>[0],
  ): Promise<string> {
    const classifiedType =
      input.extraction.category === "miscellaneous"
        ? "unknown"
        : input.extraction.category;
    const row = await this.db
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
        classified_type: classifiedType,
        overall_confidence: input.extraction.overallConfidence,
        raw_text: input.extraction.rawText,
        fields: input.extraction.fields,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    fail(row.error, "OCR result insert failed");
    if (!row.data) throw new Error("OCR result insert returned no row.");
    const ocrResultId = textValue((row.data as DbRow).id);

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
      fail(fields.error, "OCR fields insert failed");
      if (rows(fields.data).length !== input.extraction.fields.length) {
        throw new Error("OCR fields insert did not persist every field.");
      }
    }
    if (input.extraction.pickupNumbers.length) {
      const pickupNumbers = await this.db
        .from("document_pickup_numbers")
        .insert(
          input.extraction.pickupNumbers.map((entry, index) => ({
            company_id: input.companyId,
            document_id: input.documentId,
            ocr_result_id: ocrResultId,
            value_text: entry.value,
            label: entry.label,
            pickup_stop_id: undefined,
            pickup_stop_reference: entry.pickupStopLabel,
            display_order: index,
            confidence: entry.confidence ?? 0,
            stop_association_confidence:
              entry.stopAssociationConfidence ?? 0,
            requires_human_verification:
              entry.requiresHumanVerification ?? true,
            requires_stop_review:
              entry.requiresStopAssociationReview ?? true,
            source: "ocr",
            created_by: input.userId,
          })),
        )
        .select("id");
      fail(pickupNumbers.error, "OCR pickup numbers insert failed");
      if (
        rows(pickupNumbers.data).length !== input.extraction.pickupNumbers.length
      ) {
        throw new Error(
          "OCR pickup numbers insert did not persist every ordered identifier.",
        );
      }
    }
    return ocrResultId;
  }

  async markExtractionFailed(
    input: Parameters<DocumentIntakeRepository["markExtractionFailed"]>[0],
  ): Promise<void> {
    const failedResult = await this.db.from("document_ocr_results").insert({
      company_id: input.companyId,
      document_id: input.documentId,
      document_version_id: input.versionId,
      provider: "openai",
      model_id: process.env.ALPH_DOCUMENT_MODEL ?? "gpt-5.4",
      prompt_version: DOCUMENT_EXTRACTION_PROMPT_VERSION,
      status: "failed",
      classified_type: "unknown",
      overall_confidence: 0,
      raw_text: "",
      fields: [],
      error_code: "extraction_failed",
      error_message: "Document extraction did not complete.",
      completed_at: new Date().toISOString(),
    });
    fail(failedResult.error, "OCR failure record insert failed");

    const document = await this.db
      .from("documents")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", input.documentId)
      .eq("company_id", input.companyId);
    fail(document.error, "Document failure status update failed");
  }

  async createProposedAction(
    input: Parameters<DocumentIntakeRepository["createProposedAction"]>[0],
  ): Promise<string> {
    const row = await this.db
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
        status: "pending",
        created_by: input.userId,
      })
      .select("id")
      .single();
    fail(row.error, "Proposed action insert failed");
    if (!row.data) throw new Error("Proposed action insert returned no row.");
    return textValue((row.data as DbRow).id);
  }

  async finalizeExtractionProposal(
    input: Parameters<
      DocumentIntakeRepository["finalizeExtractionProposal"]
    >[0],
  ): Promise<void> {
    const [
      documentResult,
      ocrResult,
      proposalResult,
      auditResult,
      pickupNumbersResult,
    ] =
      await Promise.all([
        this.db
          .from("documents")
          .select("id,current_version_id")
          .eq("company_id", input.companyId)
          .eq("id", input.documentId)
          .maybeSingle(),
        this.db
          .from("document_ocr_results")
          .select("id,document_id,document_version_id")
          .eq("company_id", input.companyId)
          .eq("id", input.ocrResultId)
          .maybeSingle(),
        this.db
          .from("document_proposed_actions")
          .select("id,document_id,ocr_result_id,status,requires_approval")
          .eq("company_id", input.companyId)
          .eq("id", input.proposedActionId)
          .maybeSingle(),
        this.db
          .from("document_audit_history")
          .select("id")
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId)
          .eq("proposed_action_id", input.proposedActionId)
          .eq("event_type", "document_ocr_review_proposed")
          .limit(1)
          .maybeSingle(),
        this.db
          .from("document_pickup_numbers")
          .select("id", { count: "exact" })
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId)
          .eq("ocr_result_id", input.ocrResultId)
          .eq("is_removed", false),
      ]);
    fail(documentResult.error, "Extraction finalization document lookup failed");
    fail(ocrResult.error, "Extraction finalization OCR lookup failed");
    fail(proposalResult.error, "Extraction finalization proposal lookup failed");
    fail(auditResult.error, "Extraction finalization audit lookup failed");
    fail(
      pickupNumbersResult.error,
      "Extraction finalization pickup-number lookup failed",
    );
    if (
      !documentResult.data ||
      !ocrResult.data ||
      !proposalResult.data ||
      !auditResult.data ||
      textValue(documentResult.data.current_version_id) !== input.versionId ||
      textValue(ocrResult.data.document_id) !== input.documentId ||
      textValue(ocrResult.data.document_version_id) !== input.versionId ||
      textValue(proposalResult.data.document_id) !== input.documentId ||
      textValue(proposalResult.data.ocr_result_id) !== input.ocrResultId ||
      textValue(proposalResult.data.status) !== "pending" ||
      proposalResult.data.requires_approval !== true ||
      pickupNumbersResult.count !== input.pickupNumberCount
    ) {
      throw new RecoverableDocumentIntakeError(
        "The extracted review could not pass its persistence consistency gate.",
      );
    }

    const documentUpdate = await this.db
      .from("documents")
      .update({
        document_type: input.classifiedType,
        status: "needs_review",
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", input.companyId)
      .eq("id", input.documentId)
      .eq("current_version_id", input.versionId)
      .select("id")
      .maybeSingle();
    requireUpdatedRow(
      documentUpdate.data,
      documentUpdate.error,
      "Extraction finalization document update failed",
    );

    const olderPendingResult = await this.db
      .from("document_proposed_actions")
      .select("id")
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("status", "pending")
      .neq("id", input.proposedActionId);
    fail(olderPendingResult.error, "Older extraction proposals could not be verified");
    const olderPendingIds = rows(olderPendingResult.data).map((row) =>
      textValue(row.id),
    );
    const superseded = await this.db
      .from("document_proposed_actions")
      .update({ status: "superseded", updated_at: new Date().toISOString() })
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("status", "pending")
      .neq("id", input.proposedActionId)
      .select("id");
    fail(superseded.error, "Older extraction proposals could not be superseded");
    if (rows(superseded.data).length !== olderPendingIds.length) {
      throw new RecoverableDocumentIntakeError(
        "Older extraction proposals were not superseded consistently.",
      );
    }

    let activationError: unknown;
    try {
      await this.appendAudit({
        documentId: input.documentId,
        proposedActionId: input.proposedActionId,
        companyId: input.companyId,
        userId: input.userId,
        eventType: "document_ocr_review_activated",
        detail:
          "The persisted extraction passed its consistency gate and is available for authenticated human review.",
      });
    } catch (error) {
      activationError = error;
    }
    const activationResult = await this.db
      .from("document_audit_history")
      .select("id")
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("proposed_action_id", input.proposedActionId)
      .eq("event_type", "document_ocr_review_activated")
      .limit(1)
      .maybeSingle();
    fail(activationResult.error, "Extraction activation audit could not be verified");
    if (!activationResult.data) {
      if (olderPendingIds.length) {
        const restored = await this.db
          .from("document_proposed_actions")
          .update({ status: "pending", updated_at: new Date().toISOString() })
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId)
          .eq("status", "superseded")
          .in("id", olderPendingIds)
          .select("id");
        fail(restored.error, "Prior extraction proposals could not be restored");
        if (rows(restored.data).length !== olderPendingIds.length) {
          throw new RecoverableDocumentIntakeError(
            "The extraction retry stopped before activation and prior review restoration is incomplete.",
          );
        }
      }
      throw (
        activationError ??
        new RecoverableDocumentIntakeError(
          "The extraction retry stopped before its final activation audit.",
        )
      );
    }
  }

  async recordApproval(
    input: Parameters<DocumentIntakeRepository["recordApproval"]>[0],
  ): Promise<string> {
    const userDb = getSupabaseAuthenticatedUserClient(input.accessToken);
    const proposal = await userDb
      .from("document_proposed_actions")
      .select("id,status,requires_approval,payload")
      .eq("company_id", input.companyId)
      .eq("id", input.proposedActionId)
      .maybeSingle();
    fail(proposal.error, "Document proposal approval lookup failed");
    if (!proposal.data || proposal.data.requires_approval !== true) {
      throw new Error("The review proposal is not approvable.");
    }
    if (
      (input.decision === "approved" &&
        proposal.data.status !== "pending" &&
        proposal.data.status !== "approved") ||
      (input.decision === "rejected" && proposal.data.status !== "pending")
    ) {
      throw new Error("The review proposal is not in an approvable state.");
    }
    if (
      input.decision === "approved" &&
      (!reviewedCorrectionSnapshot(proposal.data.payload) ||
        !pickupNumberReviewSnapshot(proposal.data.payload) ||
        textValue((proposal.data.payload as DbRow | null)?.reviewed_by) !==
          input.userId)
    ) {
      throw new Error(
        "Reviewed fields and pickup numbers must be persisted before approval is recorded.",
      );
    }
    const row = await userDb
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
    fail(row.error, "Document approval insert failed");
    if (!row.data) throw new Error("Document approval insert returned no row.");
    return textValue((row.data as DbRow).id);
  }

  async appendAudit(
    input: Parameters<DocumentIntakeRepository["appendAudit"]>[0],
  ): Promise<void> {
    const row = await this.db.from("document_audit_history").insert({
      company_id: input.companyId,
      document_id: input.documentId,
      proposed_action_id: input.proposedActionId,
      actor_user_id: input.userId,
      event_type: input.eventType,
      detail: input.detail,
      request_id: input.requestId,
    });
    fail(row.error, "Document audit insert failed");
  }

  async listDocuments(
    input: Parameters<DocumentIntakeRepository["listDocuments"]>[0],
  ): Promise<PersistedDocumentReview[]> {
    const userDb = getSupabaseAuthenticatedUserClient(input.accessToken);
    const documentResult = await userDb
      .from("documents")
      .select(
        "id,company_id,created_by,filename,mime_type,size_bytes,document_type,status,current_version_id,storage_provider,created_at",
      )
      .eq("company_id", input.companyId)
      .order("created_at", { ascending: false });
    fail(documentResult.error, "Document list failed");
    const documentRows = rows(documentResult.data);
    if (!documentRows.length) return [];

    const documentIds = documentRows.map((row) => textValue(row.id));
    const [versionsResult, ocrResult, actionsResult, auditsResult] =
      await Promise.all([
        userDb
          .from("document_versions")
          .select(
            "id,document_id,version_number,storage_bucket,storage_path,filename,size_bytes,created_at,created_by",
          )
          .eq("company_id", input.companyId)
          .in("document_id", documentIds)
          .order("version_number", { ascending: false }),
        userDb
          .from("document_ocr_results")
          .select(
            "id,document_id,document_version_id,status,classified_type,overall_confidence,provider,created_at",
          )
          .eq("company_id", input.companyId)
          .in("document_id", documentIds)
          .order("created_at", { ascending: false }),
        userDb
          .from("document_proposed_actions")
          .select(
            "id,document_id,ocr_result_id,status,requires_approval,payload,created_at",
          )
          .eq("company_id", input.companyId)
          .in("document_id", documentIds)
          .order("created_at", { ascending: false }),
        userDb
          .from("document_audit_history")
          .select(
            "id,document_id,proposed_action_id,event_type,detail,request_id,created_at",
          )
          .eq("company_id", input.companyId)
          .in("document_id", documentIds)
          .order("created_at", { ascending: false }),
      ]);
    fail(versionsResult.error, "Document version list failed");
    fail(ocrResult.error, "OCR result list failed");
    fail(actionsResult.error, "Proposed action list failed");
    fail(auditsResult.error, "Document audit list failed");

    const versionRows = rows(versionsResult.data);
    const ocrRows = rows(ocrResult.data);
    const actionRows = rows(actionsResult.data);
    const auditRows = rows(auditsResult.data);
    const ocrIds = ocrRows.map((row) => textValue(row.id));
    const actionIds = actionRows.map((row) => textValue(row.id));
    const [fieldsResult, pickupNumbersResult, approvalsResult] = await Promise.all([
      ocrIds.length
        ? userDb
            .from("document_ocr_fields")
            .select(
              "id,ocr_result_id,field_key,label,value_text,confidence,is_verified,verified_by",
            )
            .eq("company_id", input.companyId)
            .in("ocr_result_id", ocrIds)
            .order("field_key", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      ocrIds.length
        ? userDb
            .from("document_pickup_numbers")
            .select(
              "id,ocr_result_id,value_text,label,pickup_stop_id,pickup_stop_reference,display_order,confidence,stop_association_confidence,requires_human_verification,requires_stop_review,source,is_removed,is_verified,verified_by",
            )
            .eq("company_id", input.companyId)
            .in("ocr_result_id", ocrIds)
            .order("display_order", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      actionIds.length
        ? userDb
            .from("document_approvals")
            .select("id,proposed_action_id,decision,decided_by,decided_at")
            .eq("company_id", input.companyId)
            .in("proposed_action_id", actionIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
    fail(fieldsResult.error, "OCR field list failed");
    fail(pickupNumbersResult.error, "OCR pickup-number list failed");
    fail(approvalsResult.error, "Document approval list failed");
    const fieldRows = rows(fieldsResult.data);
    const pickupNumberRows = rows(pickupNumbersResult.data);
    const approvalRows = rows(approvalsResult.data);

    return Promise.all(
      documentRows.map(async (documentRow) => {
        const documentId = textValue(documentRow.id);
        const currentVersionId = textValue(documentRow.current_version_id);
        const documentVersions = versionRows.filter(
          (row) => textValue(row.document_id) === documentId,
        );
        const currentVersion =
          documentVersions.find(
            (row) => textValue(row.id) === currentVersionId,
          );
        const currentOcrRows = ocrRows.filter(
          (row) =>
            textValue(row.document_id) === documentId &&
            textValue(row.document_version_id) === currentVersionId,
        );
        const latestOcr =
          currentOcrRows.find((ocr) => {
            const action = actionRows.find(
              (candidate) =>
                textValue(candidate.document_id) === documentId &&
                textValue(candidate.ocr_result_id) === textValue(ocr.id) &&
                ["pending", "approved"].includes(
                  textValue(candidate.status),
                ) &&
                candidate.requires_approval === true,
            );
            return Boolean(
              action && hasReviewProposalAudit(action, auditRows, documentId),
            );
          }) ?? currentOcrRows[0];
        const latestOcrId = textValue(latestOcr?.id);
        const candidateAction = actionRows.find(
          (row) =>
            textValue(row.document_id) === documentId &&
            textValue(row.ocr_result_id) === latestOcrId &&
            ["pending", "approved"].includes(textValue(row.status)) &&
            row.requires_approval === true,
        );
        const latestAction =
          candidateAction &&
          hasReviewProposalAudit(candidateAction, auditRows, documentId)
            ? candidateAction
            : undefined;
        const latestActionId = textValue(latestAction?.id);
        const currentFieldRows = fieldRows.filter(
          (row) => textValue(row.ocr_result_id) === latestOcrId,
        );
        const allCurrentPickupNumberRows = pickupNumberRows.filter(
          (row) => textValue(row.ocr_result_id) === latestOcrId,
        );
        const currentPickupNumberRows = allCurrentPickupNumberRows.filter(
          (row) => row.is_removed !== true,
        );
        const pickupNumbers = currentPickupNumberRows.map(pickupNumberFromRow);
        const extractedFields: DocumentExtractedField[] = currentFieldRows
          .map((row) => ({
            key: textValue(row.field_key) as DocumentExtractedFieldKey,
            label: textValue(row.label),
            value: textValue(row.value_text),
            confidence: numberValue(row.confidence),
          }));
        const category = documentCategory(
          latestOcr?.classified_type ?? documentRow.document_type,
        );
        const storageExists = currentVersion
          ? await this.storageObjectExists(
              userDb,
              textValue(currentVersion.storage_bucket, this.bucket),
              textValue(currentVersion.storage_path),
            )
          : false;
        const signed = currentVersion && storageExists
          ? await userDb.storage
              .from(textValue(currentVersion.storage_bucket, this.bucket))
              .createSignedUrl(textValue(currentVersion.storage_path), 15 * 60)
          : { data: null, error: null };
        const documentAudits = auditRows.filter(
          (row) => textValue(row.document_id) === documentId,
        );
        const approval = approvalRows.find(
          (row) => textValue(row.proposed_action_id) === latestActionId,
        );
        const decision = textValue(approval?.decision);
        const confirmationAuditExists = documentAudits.some(
          (audit) =>
            textValue(audit.proposed_action_id) === latestActionId &&
            (textValue(audit.event_type) ===
              "document_review_confirmation_prepared" ||
              textValue(audit.event_type) === "document_review_confirmed"),
        );
        const proposalAuditExists = documentAudits.some(
          (audit) =>
            textValue(audit.proposed_action_id) === latestActionId &&
            textValue(audit.event_type) === "document_ocr_review_proposed",
        );
        const persistedFieldValues = new Map(
          currentFieldRows.map((field) => [
            textValue(field.field_key),
            textValue(field.value_text),
          ]),
        );
        const correctionSnapshot = reviewedCorrectionSnapshot(
          latestAction?.payload,
        );
        const pickupNumberSnapshot = pickupNumberSnapshotForFinalGate(
          latestAction?.payload,
        );
        const persistedPickupNumberValues = pickupNumbers.map((entry) => ({
          value: entry.value,
          label: entry.label,
          pickupStopId: entry.pickupStopId,
          pickupStopLabel: entry.pickupStopLabel,
          displayOrder: entry.displayOrder,
        }));
        const confirmationFinal = isDocumentConfirmationFinal({
          currentVersionValid: Boolean(currentVersion),
          storageObjectExists: storageExists,
          ocrStatus: textValue(latestOcr?.status) || undefined,
          proposedActionStatus: textValue(latestAction?.status) || undefined,
          requiresApproval: latestAction?.requires_approval === true,
          approvalDecision: decision || undefined,
          allFieldsVerified: currentFieldRows.every(
            (field) =>
              field.is_verified === true &&
              textValue(field.verified_by) === textValue(approval?.decided_by),
          ) &&
            correctionMapsMatch(correctionSnapshot, persistedFieldValues) &&
            currentPickupNumberRows.every(
              (entry) =>
                entry.is_verified === true &&
                textValue(entry.verified_by) ===
                  textValue(approval?.decided_by),
            ) &&
            pickupNumberCollectionsMatch(
              pickupNumberSnapshot,
              persistedPickupNumberValues,
            ),
          proposalAuditExists,
          confirmationAuditExists,
          documentStatus: textValue(documentRow.status) || undefined,
        });
        const reviewPickupNumbers =
          !confirmationFinal &&
          decision === "approved" &&
          pickupNumberSnapshot
            ? pickupNumberSnapshot.map((entry, index) => {
                const matching = allCurrentPickupNumberRows.find(
                  (row) =>
                    pickupNumberFingerprint(pickupNumberFromRow(row)) ===
                    pickupNumberFingerprint(entry),
                );
                return {
                  id: textValue(matching?.id, `recovery-${index}`),
                  value: entry.value,
                  label: entry.label,
                  pickupStopId: entry.pickupStopId,
                  pickupStopLabel: entry.pickupStopLabel,
                  displayOrder: index,
                  confidence: numberValue(matching?.confidence),
                  stopAssociationConfidence: numberValue(
                    matching?.stop_association_confidence,
                  ),
                  requiresHumanVerification: true,
                  requiresStopAssociationReview:
                    !entry.pickupStopId && !entry.pickupStopLabel,
                  source: matching?.source === "ocr" ? "ocr" : "manual",
                } satisfies PickupNumber;
              })
            : pickupNumbers;
        const document: CarrierDocument = {
          tenantId: input.companyId,
          id: documentId,
          category,
          filename: textValue(documentRow.filename),
          mimeType: textValue(documentRow.mime_type),
          sizeBytes: numberValue(documentRow.size_bytes),
          uploadedAt: textValue(documentRow.created_at),
          uploadedBy: "Authenticated user",
          status: documentStatus(documentRow.status, confirmationFinal),
          extractedFields,
          pickupNumbers: reviewPickupNumbers,
          tags: [category.replace(/_/g, "-"), "alph-ocr"],
          links: {},
          versions: documentVersions.map((version) => ({
            id: textValue(version.id),
            version: numberValue(version.version_number, 1),
            filename: textValue(version.filename),
            sizeBytes: numberValue(version.size_bytes),
            uploadedAt: textValue(version.created_at),
            uploadedBy: "Authenticated user",
          })),
          auditLog: documentAudits.map((audit) => {
            const eventType = textValue(audit.event_type);
            const aiEvent = eventType.includes("ocr");
            return {
              id: textValue(audit.id),
              action: auditAction(eventType),
              actorName: aiEvent ? "Alph AI" : "Authenticated user",
              actorRole: aiEvent ? "system" : "user",
              occurredAt: textValue(audit.created_at),
              detail: textValue(audit.detail),
            };
          }),
          timeline: documentAudits.map((audit) => {
            const eventType = textValue(audit.event_type);
            return {
              id: `timeline-${textValue(audit.id)}`,
              documentId,
              type: timelineType(eventType),
              label: textValue(audit.detail, "Document activity recorded"),
              occurredAt: textValue(audit.created_at),
              actorName: eventType.includes("ocr")
                ? "Alph AI"
                : "Authenticated user",
            };
          }),
          previewUrl: signed.data?.signedUrl,
          storageProvider: "supabase",
          encrypted: true,
          loadNumber: fieldValue(extractedFields, "loadNumber"),
          invoiceNumber: fieldValue(extractedFields, "invoiceNumber"),
          poNumber: fieldValue(extractedFields, "poNumber"),
          bolNumber: fieldValue(extractedFields, "bolNumber"),
        };
        return {
          document,
          ocrResultId: latestOcrId || undefined,
          proposedActionId: latestActionId || undefined,
          overallConfidence: numberValue(latestOcr?.overall_confidence),
          pickupNumbers: reviewPickupNumbers,
          approvalStatus:
            confirmationFinal && decision === "approved"
              ? "approved"
              : decision === "rejected"
                ? "rejected"
                : undefined,
        } satisfies PersistedDocumentReview;
      }),
    );
  }

  async getDocument(
    input: Parameters<DocumentIntakeRepository["getDocument"]>[0],
  ): Promise<PersistedDocumentReview | null> {
    const records = await this.listDocuments(input);
    return (
      records.find((record) => record.document.id === input.documentId) ?? null
    );
  }

  async confirmReview(
    input: Parameters<DocumentIntakeRepository["confirmReview"]>[0],
  ): Promise<PersistedDocumentReview> {
    const userDb = getSupabaseAuthenticatedUserClient(input.accessToken);
    const [
      documentResult,
      ocrResult,
      actionResult,
      fieldsResult,
      pickupNumbersResult,
    ] =
      await Promise.all([
        userDb
          .from("documents")
          .select("id,current_version_id,document_type,status")
          .eq("company_id", input.companyId)
          .eq("id", input.documentId)
          .maybeSingle(),
        userDb
          .from("document_ocr_results")
          .select(
            "id,document_id,document_version_id,classified_type,status",
          )
          .eq("company_id", input.companyId)
          .eq("id", input.ocrResultId)
          .maybeSingle(),
        userDb
          .from("document_proposed_actions")
          .select("id,document_id,ocr_result_id,status,requires_approval,payload")
          .eq("company_id", input.companyId)
          .eq("id", input.proposedActionId)
          .maybeSingle(),
        userDb
          .from("document_ocr_fields")
          .select(
            "id,field_key,label,value_text,confidence,is_verified,verified_by",
          )
          .eq("company_id", input.companyId)
          .eq("ocr_result_id", input.ocrResultId),
        userDb
          .from("document_pickup_numbers")
          .select(
            "id,value_text,label,pickup_stop_id,pickup_stop_reference,display_order,confidence,stop_association_confidence,requires_human_verification,requires_stop_review,source,is_removed,is_verified,verified_by",
          )
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId)
          .eq("ocr_result_id", input.ocrResultId)
          .order("display_order", { ascending: true }),
      ]);
    fail(documentResult.error, "Document review lookup failed");
    fail(ocrResult.error, "OCR review lookup failed");
    fail(actionResult.error, "Proposed review lookup failed");
    fail(fieldsResult.error, "OCR review fields lookup failed");
    fail(pickupNumbersResult.error, "OCR review pickup-number lookup failed");
    if (!documentResult.data || !ocrResult.data || !actionResult.data) {
      throw new Error("Document review was not found for this company.");
    }

    const documentRow = documentResult.data as DbRow;
    const ocrRow = ocrResult.data as DbRow;
    const actionRow = actionResult.data as DbRow;
    const currentVersionId = textValue(documentRow.current_version_id);
    if (
      textValue(ocrRow.document_id) !== input.documentId ||
      textValue(ocrRow.document_version_id) !== currentVersionId ||
      textValue(actionRow.document_id) !== input.documentId ||
      textValue(actionRow.ocr_result_id) !== input.ocrResultId ||
      actionRow.requires_approval !== true
    ) {
      throw new Error("Document review relationships are invalid.");
    }

    const versionResult = await userDb
      .from("document_versions")
      .select("id,storage_bucket,storage_path")
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("id", currentVersionId)
      .maybeSingle();
    fail(versionResult.error, "Document version lookup failed");
    if (!versionResult.data) {
      throw new Error("The current document version is missing.");
    }
    const versionRow = versionResult.data as DbRow;
    const storageExists = await this.storageObjectExists(
      userDb,
      textValue(versionRow.storage_bucket, this.bucket),
      textValue(versionRow.storage_path),
    );
    if (!storageExists) {
      throw new Error("The current private document object is missing.");
    }

    const storedFields = rows(fieldsResult.data);
    const correctionByKey = new Map<DocumentExtractedFieldKey, string>();
    for (const correction of input.corrections) {
      const value = correction.value.trim();
      if (value.length > 4_000 || correctionByKey.has(correction.key)) {
        throw new Error("Reviewed fields are invalid.");
      }
      correctionByKey.set(correction.key, value);
    }
    const storedKeys = new Set(
      storedFields.map(
        (field) => textValue(field.field_key) as DocumentExtractedFieldKey,
      ),
    );
    if (
      storedKeys.size !== correctionByKey.size ||
      [...correctionByKey.keys()].some((key) => !storedKeys.has(key))
    ) {
      throw new Error("Reviewed fields do not match the persisted extraction.");
    }
    const storedPickupNumberRows = rows(pickupNumbersResult.data);
    const activeStoredPickupNumberRows = storedPickupNumberRows.filter(
      (row) => row.is_removed !== true,
    );
    const requestedNonemptyPickupNumbers = input.pickupNumbers.filter(
      (entry) => entry.value.trim().length > 0,
    );
    const requestedPickupNumbers = normalizePickupNumbers(input.pickupNumbers);
    if (
      requestedPickupNumbers.length !== requestedNonemptyPickupNumbers.length
    ) {
      throw new Error(
        "Remove the exact duplicate pickup number before confirming.",
      );
    }

    const confirmationRequestId = documentConfirmationRequestId(
      input.proposedActionId,
    );
    const [existingApproval, existingProposalAudit, existingAudit] =
      await Promise.all([
        userDb
          .from("document_approvals")
          .select("id,decision,decided_by")
          .eq("company_id", input.companyId)
          .eq("proposed_action_id", input.proposedActionId)
          .maybeSingle(),
        userDb
          .from("document_audit_history")
          .select("id")
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId)
          .eq("proposed_action_id", input.proposedActionId)
          .eq("event_type", "document_ocr_review_proposed")
          .limit(1)
          .maybeSingle(),
        userDb
          .from("document_audit_history")
          .select("id,event_type,request_id")
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId)
          .eq("proposed_action_id", input.proposedActionId)
          .in("event_type", [
            "document_review_confirmation_prepared",
            "document_review_confirmed",
          ])
          .limit(1)
          .maybeSingle(),
      ]);
    fail(existingApproval.error, "Document approval lookup failed");
    fail(existingProposalAudit.error, "Document proposal audit lookup failed");
    fail(existingAudit.error, "Document confirmation audit lookup failed");
    if (!existingProposalAudit.data) {
      throw new Error("The persisted review proposal audit is incomplete.");
    }

    const approvalRow = existingApproval.data as DbRow | null;
    const existingCorrectionSnapshot = reviewedCorrectionSnapshot(
      actionRow.payload,
    );
    const existingPickupNumberSnapshot = pickupNumberReviewSnapshot(
      actionRow.payload,
    );
    const correctionValuesMatch = storedFields.every((field) => {
      const key = textValue(field.field_key) as DocumentExtractedFieldKey;
      return textValue(field.value_text) === (correctionByKey.get(key) ?? "");
    });
    const storedPickupNumberValues = activeStoredPickupNumberRows
      .map(pickupNumberFromRow)
      .map((entry) => ({
        value: entry.value,
        label: entry.label,
        pickupStopId: entry.pickupStopId,
        pickupStopLabel: entry.pickupStopLabel,
        displayOrder: entry.displayOrder,
      }));
    const pickupNumberValuesMatch = pickupNumberCollectionsMatch(
      storedPickupNumberValues,
      requestedPickupNumbers,
    );
    const initialFinalState: DocumentIntakeConsistencyState = {
      currentVersionValid: true,
      storageObjectExists: true,
      ocrStatus: textValue(ocrRow.status) || undefined,
      proposedActionStatus: textValue(actionRow.status) || undefined,
      requiresApproval: actionRow.requires_approval === true,
      approvalDecision: textValue(approvalRow?.decision) || undefined,
      allFieldsVerified:
        correctionValuesMatch &&
        storedFields.every(
          (field) =>
            field.is_verified === true &&
            textValue(field.verified_by) === textValue(approvalRow?.decided_by),
        ) &&
        correctionMapsMatch(existingCorrectionSnapshot, correctionByKey) &&
        pickupNumberValuesMatch &&
        activeStoredPickupNumberRows.every(
          (entry) =>
            entry.is_verified === true &&
            textValue(entry.verified_by) === textValue(approvalRow?.decided_by),
        ) &&
        pickupNumberCollectionsMatch(
          existingPickupNumberSnapshot,
          requestedPickupNumbers,
        ),
      proposalAuditExists: true,
      confirmationAuditExists: Boolean(existingAudit.data),
      documentStatus: textValue(documentRow.status) || undefined,
    };
    if (isDocumentConfirmationFinal(initialFinalState)) {
      if (!correctionValuesMatch || !pickupNumberValuesMatch) {
        throw new Error("This completed review cannot be changed by retrying.");
      }
      const completedRecord = await this.getDocument({
        documentId: input.documentId,
        companyId: input.companyId,
        accessToken: input.accessToken,
      });
      if (!completedRecord) {
        throw new Error("Completed document could not be reloaded.");
      }
      return completedRecord;
    }

    if (textValue(documentRow.status) === "ready") {
      const closedGate = await this.db
        .from("documents")
        .update({
          status: "needs_review",
          updated_at: new Date().toISOString(),
        })
        .eq("company_id", input.companyId)
        .eq("id", input.documentId)
        .select("id")
        .maybeSingle();
      requireUpdatedRow(
        closedGate.data,
        closedGate.error,
        "Document confirmation gate could not be closed",
      );
    }

    if (
      textValue(actionRow.status) !== "pending" &&
      textValue(actionRow.status) !== "approved"
    ) {
      throw new Error("This review proposal is not confirmable.");
    }

    if (existingApproval.data) {
      if (
        approvalRow?.decision !== "approved" ||
        textValue(approvalRow.decided_by) !== input.userId
      ) {
        throw new Error("Document review already has a different decision.");
      }
    }

    if (
      existingCorrectionSnapshot &&
      !correctionMapsMatch(existingCorrectionSnapshot, correctionByKey)
    ) {
      throw new Error(
        "A confirmation retry must use the originally approved corrections.",
      );
    }
    if (
      existingPickupNumberSnapshot &&
      !pickupNumberCollectionsMatch(
        existingPickupNumberSnapshot,
        requestedPickupNumbers,
      )
    ) {
      throw new Error(
        "A confirmation retry must use the originally approved pickup numbers.",
      );
    }
    if (!existingCorrectionSnapshot || !existingPickupNumberSnapshot) {
      const safelyRecoverableApprovedSnapshot =
        !existingApproval.data ||
        (correctionValuesMatch &&
          storedFields.every(
            (field) =>
              field.is_verified === true &&
              textValue(field.verified_by) === input.userId,
          ) &&
          pickupNumberValuesMatch &&
          activeStoredPickupNumberRows.every(
            (entry) =>
              entry.is_verified === true &&
              textValue(entry.verified_by) === input.userId,
          ));
      if (!safelyRecoverableApprovedSnapshot) {
        throw new RecoverableDocumentIntakeError(
          "This older partial confirmation cannot be retried safely because its approved correction snapshot is missing.",
        );
      }
      const currentPayload =
        actionRow.payload &&
        typeof actionRow.payload === "object" &&
        !Array.isArray(actionRow.payload)
          ? (actionRow.payload as DbRow)
          : {};
      const requestedSnapshot = [...correctionByKey]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => ({ key, value }));
      const requestedPickupNumberSnapshot = requestedPickupNumbers.map(
        (entry) => ({
          value: entry.value,
          label: entry.label ?? null,
          pickup_stop_id: entry.pickupStopId ?? null,
          pickup_stop_reference: entry.pickupStopLabel ?? null,
          display_order: entry.displayOrder,
        }),
      );
      const snapshotUpdate = await this.db
        .from("document_proposed_actions")
        .update({
          payload: {
            ...currentPayload,
            reviewed_corrections: requestedSnapshot,
            reviewed_pickup_numbers: requestedPickupNumberSnapshot,
            reviewed_by: input.userId,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("company_id", input.companyId)
        .eq("id", input.proposedActionId)
        .eq("document_id", input.documentId)
        .in("status", ["pending", "approved"])
        .select("id,payload")
        .maybeSingle();
      const snapshotRow = requireUpdatedRow(
        snapshotUpdate.data,
        snapshotUpdate.error,
        "Reviewed correction snapshot update failed",
      );
      if (
        !correctionMapsMatch(
          reviewedCorrectionSnapshot(snapshotRow.payload),
          correctionByKey,
        ) ||
        !pickupNumberCollectionsMatch(
          pickupNumberReviewSnapshot(snapshotRow.payload),
          requestedPickupNumbers,
        )
      ) {
        throw new Error("Reviewed review snapshot was not persisted.");
      }
    }

    if (!existingApproval.data) {
      await this.recordApproval({
        proposedActionId: input.proposedActionId,
        companyId: input.companyId,
        userId: input.userId,
        accessToken: input.accessToken,
        decision: "approved",
        note: "Authenticated human confirmed document extraction.",
      });
    }

    const verifiedAt = new Date().toISOString();
    const reviewedFields: DocumentExtractedField[] = storedFields.map((field) => {
      const key = textValue(field.field_key) as DocumentExtractedFieldKey;
      return {
        key,
        label: textValue(field.label),
        value: correctionByKey.get(key) ?? "",
        confidence: numberValue(field.confidence),
      };
    });
    const fieldUpdates = await Promise.all(
      storedFields.map((field) =>
        this.db
          .from("document_ocr_fields")
          .update({
            value_text:
              correctionByKey.get(
                textValue(field.field_key) as DocumentExtractedFieldKey,
              ) ?? "",
            is_verified: true,
            verified_by: input.userId,
            verified_at: verifiedAt,
          })
          .eq("company_id", input.companyId)
          .eq("id", textValue(field.id))
          .eq("ocr_result_id", input.ocrResultId)
          .select("id")
          .maybeSingle(),
      ),
    );
    fieldUpdates.forEach((result) => {
      requireUpdatedRow(
        result.data,
        result.error,
        "Reviewed field update failed",
      );
    });

    const verifiedFields = await this.db
      .from("document_ocr_fields")
      .select("id,field_key,value_text,is_verified,verified_by")
      .eq("company_id", input.companyId)
      .eq("ocr_result_id", input.ocrResultId);
    fail(verifiedFields.error, "Reviewed field verification failed");
    const verifiedFieldRows = rows(verifiedFields.data);
    const correctionsPersisted =
      verifiedFieldRows.length === storedFields.length &&
      verifiedFieldRows.every((field) => {
        const key = textValue(field.field_key) as DocumentExtractedFieldKey;
        return (
          field.is_verified === true &&
          textValue(field.verified_by) === input.userId &&
          textValue(field.value_text) === (correctionByKey.get(key) ?? "")
        );
      });
    if (!correctionsPersisted) {
      throw new Error("Reviewed corrections did not persist completely.");
    }

    const temporarilyRemoved = await this.db
      .from("document_pickup_numbers")
      .update({ is_removed: true, updated_at: verifiedAt })
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("ocr_result_id", input.ocrResultId)
      .eq("is_removed", false)
      .select("id");
    fail(
      temporarilyRemoved.error,
      "Pickup-number reconciliation could not close its review gate",
    );
    if (
      rows(temporarilyRemoved.data).length !== activeStoredPickupNumberRows.length
    ) {
      throw new RecoverableDocumentIntakeError(
        "Pickup-number reconciliation is incomplete. Retry Confirm & Link with the same reviewed values.",
      );
    }

    const usedPickupNumberIds = new Set<string>();
    for (const entry of requestedPickupNumbers) {
      const requestedId = entry.id?.trim();
      let existingRow = requestedId
        ? storedPickupNumberRows.find(
            (row) =>
              textValue(row.id) === requestedId &&
              !usedPickupNumberIds.has(requestedId),
          )
        : undefined;
      if (!existingRow) {
        existingRow = storedPickupNumberRows.find((row) => {
          const rowId = textValue(row.id);
          return (
            !usedPickupNumberIds.has(rowId) &&
            pickupNumberFingerprint(pickupNumberFromRow(row)) ===
              pickupNumberFingerprint(entry)
          );
        });
      }

      const sharedValues = {
        value_text: entry.value,
        label: entry.label ?? null,
        pickup_stop_id: entry.pickupStopId ?? null,
        pickup_stop_reference: entry.pickupStopLabel ?? null,
        display_order: entry.displayOrder,
        requires_human_verification: false,
        requires_stop_review: !entry.pickupStopId && !entry.pickupStopLabel,
        is_removed: false,
        is_verified: true,
        verified_by: input.userId,
        verified_at: verifiedAt,
        updated_at: verifiedAt,
      };

      if (existingRow) {
        const existingId = textValue(existingRow.id);
        const pickupUpdate = await this.db
          .from("document_pickup_numbers")
          .update(sharedValues)
          .eq("company_id", input.companyId)
          .eq("document_id", input.documentId)
          .eq("ocr_result_id", input.ocrResultId)
          .eq("id", existingId)
          .select("id")
          .maybeSingle();
        requireUpdatedRow(
          pickupUpdate.data,
          pickupUpdate.error,
          "Reviewed pickup-number update failed",
        );
        usedPickupNumberIds.add(existingId);
      } else {
        const pickupInsert = await this.db
          .from("document_pickup_numbers")
          .insert({
            company_id: input.companyId,
            document_id: input.documentId,
            ocr_result_id: input.ocrResultId,
            ...sharedValues,
            confidence: 0,
            stop_association_confidence: 0,
            source: "manual",
            created_by: input.userId,
          })
          .select("id")
          .single();
        fail(pickupInsert.error, "Reviewed pickup-number insert failed");
        if (!pickupInsert.data) {
          throw new Error("Reviewed pickup-number insert returned no row.");
        }
        usedPickupNumberIds.add(textValue((pickupInsert.data as DbRow).id));
      }
    }

    const verifiedPickupNumbers = await this.db
      .from("document_pickup_numbers")
      .select(
        "id,value_text,label,pickup_stop_id,pickup_stop_reference,display_order,is_verified,verified_by",
      )
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("ocr_result_id", input.ocrResultId)
      .eq("is_removed", false)
      .order("display_order", { ascending: true });
    fail(
      verifiedPickupNumbers.error,
      "Reviewed pickup-number verification failed",
    );
    const verifiedPickupNumberRows = rows(verifiedPickupNumbers.data);
    const pickupNumbersPersisted =
      verifiedPickupNumberRows.length === requestedPickupNumbers.length &&
      verifiedPickupNumberRows.every(
        (entry) =>
          entry.is_verified === true &&
          textValue(entry.verified_by) === input.userId,
      ) &&
      pickupNumberCollectionsMatch(
        verifiedPickupNumberRows.map(pickupNumberFromRow),
        requestedPickupNumbers,
      );
    if (!pickupNumbersPersisted) {
      throw new RecoverableDocumentIntakeError(
        "Reviewed pickup numbers did not persist completely. Retry Confirm & Link with the same reviewed values.",
      );
    }

    const ocrUpdate = await this.db
      .from("document_ocr_results")
      .update({ status: "completed", fields: reviewedFields })
      .eq("company_id", input.companyId)
      .eq("id", input.ocrResultId)
      .eq("document_id", input.documentId)
      .select("id,status")
      .maybeSingle();
    requireUpdatedRow(ocrUpdate.data, ocrUpdate.error, "OCR review update failed");

    const actionUpdate = await this.db
      .from("document_proposed_actions")
      .update({ status: "approved", updated_at: verifiedAt })
      .eq("company_id", input.companyId)
      .eq("id", input.proposedActionId)
      .eq("document_id", input.documentId)
      .in("status", ["pending", "approved"])
      .select("id,status")
      .maybeSingle();
    requireUpdatedRow(
      actionUpdate.data,
      actionUpdate.error,
      "Proposed review status update failed",
    );

    if (!existingAudit.data) {
      await this.appendAudit({
        documentId: input.documentId,
        proposedActionId: input.proposedActionId,
        companyId: input.companyId,
        userId: input.userId,
        eventType: "document_review_confirmation_prepared",
        detail:
          "Authenticated human approval and reviewed corrections were prepared; the document remains pending until the final readiness gate succeeds.",
        requestId: confirmationRequestId,
      });
    }
    const auditVerification = await this.db
      .from("document_audit_history")
      .select("id")
      .eq("company_id", input.companyId)
      .eq("document_id", input.documentId)
      .eq("proposed_action_id", input.proposedActionId)
      .in("event_type", [
        "document_review_confirmation_prepared",
        "document_review_confirmed",
      ])
      .limit(1)
      .maybeSingle();
    fail(auditVerification.error, "Document confirmation audit verification failed");
    if (!auditVerification.data) {
      throw new Error("Document confirmation audit was not persisted.");
    }

    const documentUpdate = await this.db
      .from("documents")
      .update({ status: "ready", updated_at: verifiedAt })
      .eq("company_id", input.companyId)
      .eq("id", input.documentId)
      .select("id,status")
      .maybeSingle();
    requireUpdatedRow(
      documentUpdate.data,
      documentUpdate.error,
      "Reviewed document final readiness gate failed",
    );

    const record = await this.getDocument({
      documentId: input.documentId,
      companyId: input.companyId,
      accessToken: input.accessToken,
    });
    if (!record) throw new Error("Confirmed document could not be reloaded.");
    return record;
  }
}
