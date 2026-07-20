import "server-only";

import {
  getSupabaseAuthenticatedUserClient,
  getSupabaseServerClient,
} from "@/lib/supabase/server";
import type { DocumentIntakeRepository, DocumentUpload, PersistedDocument } from "@/lib/alph/document-intake/types";

function safeName(name: string) { return name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 160); }
function fail(error: { message: string } | null, context: string) { if (error) throw new Error(`${context}: ${error.message}`); }

export class SupabaseDocumentIntakeRepository implements DocumentIntakeRepository {
  private readonly db = getSupabaseServerClient();
  private readonly bucket = process.env.ALPH_DOCUMENT_BUCKET ?? "company-documents";

  async saveUpload(input: DocumentUpload): Promise<PersistedDocument> {
    const existing = await this.db.from("documents").select("id,current_version_id").eq("company_id", input.companyId).eq("checksum_sha256", input.checksumSha256).maybeSingle();
    fail(existing.error, "Duplicate lookup failed");
    if (existing.data) return { id: String(existing.data.id), versionId: String(existing.data.current_version_id ?? ""), storagePath: "", duplicate: true };
    const documentId = crypto.randomUUID(); const versionId = crypto.randomUUID();
    const path = `${input.companyId}/${input.userId}/${documentId}/1-${safeName(input.fileName)}`;
    const uploaded = await this.db.storage.from(this.bucket).upload(path, input.bytes, { contentType: input.mimeType, upsert: false });
    fail(uploaded.error, "Private document upload failed");
    const document = await this.db.from("documents").insert({ id: documentId, company_id: input.companyId, created_by: input.userId, title: input.fileName, filename: input.fileName, mime_type: input.mimeType, size_bytes: input.bytes.byteLength, checksum_sha256: input.checksumSha256, current_version_id: null }).select("id").single();
    if (document.error) { await this.db.storage.from(this.bucket).remove([path]); fail(document.error, "Document metadata insert failed"); }
    const version = await this.db.from("document_versions").insert({ id: versionId, company_id: input.companyId, document_id: documentId, version_number: 1, storage_bucket: this.bucket, storage_path: path, filename: input.fileName, mime_type: input.mimeType, size_bytes: input.bytes.byteLength, checksum_sha256: input.checksumSha256, created_by: input.userId }).select("id").single();
    fail(version.error, "Document version insert failed");
    const linked = await this.db.from("documents").update({ current_version_id: versionId }).eq("id", documentId).eq("company_id", input.companyId);
    fail(linked.error, "Current version update failed");
    return { id: documentId, versionId, storagePath: path, duplicate: false };
  }

  async saveExtraction(input: Parameters<DocumentIntakeRepository["saveExtraction"]>[0]) {
    const row = await this.db.from("document_ocr_results").insert({ company_id: input.companyId, document_id: input.documentId, document_version_id: input.versionId, provider: input.extraction.provider, model_id: input.extraction.modelId, prompt_version: input.extraction.promptVersion, status: input.extraction.overallConfidence < .85 ? "needs_review" : "completed", classified_type: input.extraction.category === "miscellaneous" ? "unknown" : input.extraction.category, overall_confidence: input.extraction.overallConfidence, raw_text: input.extraction.rawText, fields: input.extraction.fields, completed_at: new Date().toISOString() }).select("id").single();
    fail(row.error, "OCR result insert failed");
    if (!row.data) throw new Error("OCR result insert returned no row.");
    if (input.extraction.fields.length) { const fields = await this.db.from("document_ocr_fields").insert(input.extraction.fields.map((field) => ({ company_id: input.companyId, ocr_result_id: row.data.id, field_key: field.key, label: field.label, value_text: field.value, confidence: field.confidence }))); fail(fields.error, "OCR fields insert failed"); }
    return String(row.data.id);
  }

  async createProposedAction(input: Parameters<DocumentIntakeRepository["createProposedAction"]>[0]) { const row = await this.db.from("document_proposed_actions").insert({ company_id: input.companyId, document_id: input.documentId, ocr_result_id: input.ocrResultId, action_kind: input.actionKind, summary: input.summary, payload: input.payload, confidence: input.confidence, requires_approval: true, created_by: input.userId }).select("id").single(); fail(row.error, "Proposed action insert failed"); if (!row.data) throw new Error("Proposed action insert returned no row."); return String(row.data.id); }
  async recordApproval(input: Parameters<DocumentIntakeRepository["recordApproval"]>[0]) {
    const userDb = getSupabaseAuthenticatedUserClient(input.accessToken);
    const row = await userDb.from("document_approvals").insert({
      company_id: input.companyId,
      proposed_action_id: input.proposedActionId,
      decision: input.decision,
      decided_by: input.userId,
      decision_note: input.note,
    }).select("id").single();
    fail(row.error, "Document approval insert failed");
    if (!row.data) throw new Error("Document approval insert returned no row.");
    return String(row.data.id);
  }
  async appendAudit(input: Parameters<DocumentIntakeRepository["appendAudit"]>[0]) { const row = await this.db.from("document_audit_history").insert({ company_id: input.companyId, document_id: input.documentId, actor_user_id: input.userId, event_type: input.eventType, detail: input.detail, request_id: input.requestId }); fail(row.error, "Document audit insert failed"); }
}
