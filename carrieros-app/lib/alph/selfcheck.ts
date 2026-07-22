import { readFileSync } from "node:fs";
import {
  canExecuteCriticalAlphAction,
  clearAlphApprovalsForTests,
  createAlphApprovalRequest,
  decideAlphApproval,
  getAlphApprovalRequest,
  listPendingAlphApprovals,
  markAlphApprovalExecution,
  toAlphApprovalPreview,
} from "@/lib/alph/approval";
import {
  appendAlphAudit,
  clearAlphAuditForTests,
  listAlphAudit,
} from "@/lib/alph/audit";
import { buildAlphContext } from "@/lib/alph/context";
import {
  archiveAlphConversation,
  clearAlphConversationsForTests,
  getAlphConversation,
  listAlphConversations,
} from "@/lib/alph/conversation";
import { ALPH_IDENTITY } from "@/lib/alph/identity";
import { ensureAlphToolsRegistered, executeAlphTool, listAlphTools } from "@/lib/alph/tools";
import { clearAlphToolRegistryForTests } from "@/lib/alph/tools/registry";
import { runAlphTurn } from "@/lib/alph/orchestrator";
import {
  approvePodInvoiceAndPrepare,
  clearDocumentInboxForTests,
  requestInboxApproval,
  uploadToDocumentInbox,
} from "@/lib/alph/document-inbox";
import {
  invoiceDraftStore,
  loadDocumentStore,
  packetStore,
} from "@/lib/data/document-store";
import { getLoadService } from "@/lib/services/loads";
import { MockDocumentExtractionAdapter } from "@/lib/alph/document-intake/mock-adapter";
import { validateDocumentFile } from "@/lib/alph/document-intake/validation";
import {
  classifyDocumentIntakeState,
  documentConfirmationRequestId,
  isDocumentConfirmationFinal,
  type DocumentIntakeConsistencyState,
} from "@/lib/alph/document-intake/consistency";
import {
  DOCUMENT_EXTRACTION_PROMPT_VERSION,
  normalizeDocumentExtractionPayload,
  RATE_CONFIRMATION_FIELD_KEYS,
} from "@/lib/alph/document-intake/extraction-contract";
import {
  SANITIZED_RATE_CONFIRMATION_EXPECTED_KEYS,
  SANITIZED_RATE_CONFIRMATION_MODEL_PAYLOAD,
  SANITIZED_RATE_CONFIRMATION_PICKUP_NUMBER_VALUES,
  SANITIZED_SPARSE_RATE_CONFIRMATION_PAYLOAD,
} from "@/lib/alph/document-intake/__fixtures__/rate-confirmation";
import {
  normalizePickupNumbers,
  orderedPickupNumbers,
} from "@/lib/loads/pickup-numbers";
import {
  canApproveDocument,
  deriveVerifiedSupabaseIdentity,
  hasSameCompanyAccess,
} from "@/lib/auth/supabase-claims";

export type AlphSelfCheckResult = {
  ok: boolean;
  checks: Array<{ name: string; pass: boolean; detail?: string }>;
};

/**
 * Foundation verification — permission, isolation, tools, approval, audit, one Alph.
 * Safe to run on localhost; uses in-memory stores.
 */
export async function runAlphFoundationSelfCheck(): Promise<AlphSelfCheckResult> {
  clearAlphAuditForTests();
  clearAlphApprovalsForTests();
  clearAlphConversationsForTests();
  clearAlphToolRegistryForTests();
  clearDocumentInboxForTests();
  ensureAlphToolsRegistered();

  const checks: AlphSelfCheckResult["checks"] = [];

  checks.push({
    name: "one_alph_only",
    pass: ALPH_IDENTITY.oneAlphOnly === true && ALPH_IDENTITY.id === "alph",
  });

  const tools = listAlphTools();
  checks.push({
    name: "tools_registered",
    pass: tools.length >= 20,
    detail: `${tools.length} tools`,
  });

  const readOnlyWrites = tools.filter((t) => t.risk === "read");
  checks.push({
    name: "read_tools_present",
    pass: readOnlyWrites.length >= 15,
    detail: `${readOnlyWrites.length} read tools`,
  });

  const ctx = buildAlphContext({ workspaceId: "dispatch", pathname: "/loads" });
  checks.push({
    name: "context_builder",
    pass:
      ctx.tenantId.length > 0 &&
      ctx.companyId.length > 0 &&
      ctx.workspace === "dispatch" &&
      ctx.permissions.length > 0,
    detail: `workspace=${ctx.workspace}`,
  });

  const search = await executeAlphTool(
    "search_loads",
    { limit: 3 },
    { context: ctx, mode: "search", requestId: ctx.requestId },
  );
  checks.push({
    name: "read_tool_search_loads",
    pass: search.ok === true,
    detail: search.ok ? `items ok` : search.message,
  });

  const turn = await runAlphTurn({
    prompt: "Show today's loads",
    mode: "search",
    context: { workspaceId: "dispatch", pathname: "/loads" },
  });
  checks.push({
    name: "conversation_persistence",
    pass: Boolean(turn.conversationId),
    detail: turn.conversationId,
  });

  const listed = listAlphConversations({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
  });
  checks.push({
    name: "conversation_list_isolated",
    pass: listed.some((c) => c.id === turn.conversationId),
  });

  // Cross-tenant isolation: foreign company must not see conversation
  const foreign = getAlphConversation({
    id: turn.conversationId,
    companyId: "other-company",
    tenantId: "other-tenant",
    userId: ctx.userId,
  });
  checks.push({
    name: "tenant_isolation_conversation",
    pass: foreign === null,
  });

  const approval = createAlphApprovalRequest({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    requestId: ctx.requestId,
    actionKind: "change_critical_record",
    proposedAction: "Assign driver (test — not executed)",
    recordsAffected: [{ type: "load", id: "load-test" }],
    permissionRequired: "button.loads.assign",
  });
  checks.push({
    name: "approval_created_not_executed",
    pass: approval.executed === false && approval.status === "pending",
  });

  checks.push({
    name: "critical_cannot_execute_silently",
    pass: canExecuteCriticalAlphAction(undefined) === false,
  });

  const rejected = decideAlphApproval({
    id: approval.id,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    role: ctx.role,
    decision: "reject",
  });
  checks.push({
    name: "approval_reject_blocks_execution",
    pass: rejected.ok === true && rejected.mayExecute === false,
  });

  const approval2 = createAlphApprovalRequest({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    requestId: `${ctx.requestId}-2`,
    actionKind: "payroll_approve",
    proposedAction: "Approve payroll (test)",
    recordsAffected: [],
    permissionRequired: "button.payroll.approve",
  });
  const approved = decideAlphApproval({
    id: approval2.id,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    role: ctx.role,
    decision: "approve",
  });
  checks.push({
    name: "approval_approve_requires_explicit_execution",
    pass:
      approved.ok === true &&
      approved.mayExecute === true &&
      approved.approval.executed === false,
  });

  // ACT mode required for create_approval_request tool
  const actDenied = await executeAlphTool(
    "create_approval_request",
    {
      actionKind: "contact_customer",
      proposedAction: "Send email",
      permissionRequired: "page.loads.view",
      recordsAffected: [],
    },
    { context: ctx, mode: "ask", requestId: ctx.requestId },
  );
  checks.push({
    name: "act_mode_required_for_approval_tool",
    pass: actDenied.ok === false && actDenied.code === "forbidden_write",
  });

  appendAlphAudit({
    requestId: ctx.requestId,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    event: "prompt",
    prompt: "selfcheck",
  });
  const audit = listAlphAudit({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    limit: 20,
  });
  checks.push({
    name: "audit_logging",
    pass: audit.length > 0,
    detail: `${audit.length} entries`,
  });

  const foreignAudit = listAlphAudit({
    companyId: "other-company",
    tenantId: "other-tenant",
    limit: 20,
  });
  checks.push({
    name: "audit_tenant_isolation",
    pass: foreignAudit.length === 0,
  });

  // Preview shape
  const preview = toAlphApprovalPreview(approval2);
  checks.push({
    name: "approval_preview_shape",
    pass:
      preview.requiresHumanConfirmation === true &&
      Boolean(preview.confirmLabel) &&
      Boolean(preview.cancelLabel) &&
      Boolean(preview.proposedAction),
  });

  archiveAlphConversation({
    id: turn.conversationId,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
  });
  const afterArchive = getAlphConversation({
    id: turn.conversationId,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
  });
  checks.push({
    name: "conversation_archive",
    pass: afterArchive?.status === "archived",
  });

  const pending = listPendingAlphApprovals({
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
  });
  checks.push({
    name: "pending_approvals_list",
    pass: Array.isArray(pending),
  });

  // Mark execution only after approve — still tracked
  markAlphApprovalExecution({
    id: approval2.id,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    success: true,
    result: "selfcheck simulated execution",
  });
  const executed = getAlphApprovalRequest({
    id: approval2.id,
    companyId: ctx.companyId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
  });
  checks.push({
    name: "execution_marked_after_approve",
    pass: executed?.executed === true,
  });

  const podLoadId = "load-24003";
  const podLoadBefore = await getLoadService().getLoad(ctx.tenantId, podLoadId);
  const podStatusBefore = podLoadBefore?.status;
  const podDocumentsBefore = loadDocumentStore.length;
  const podInvoicesBefore = invoiceDraftStore.length;
  const podPacketsBefore = packetStore.length;

  const podProposal = await uploadToDocumentInbox({
    tenantId: ctx.tenantId,
    companyId: ctx.companyId,
    userId: ctx.userId,
    fileName: "LD-24003-pod-selfcheck.pdf",
    mimeType: "application/pdf",
    byteLength: 1024,
    contentFingerprint: `alph-selfcheck-pod-${ctx.requestId}`,
  });
  const podLoadAfterUpload = await getLoadService().getLoad(
    ctx.tenantId,
    podLoadId,
  );
  checks.push({
    name: "pod_upload_is_read_only_proposal",
    pass:
      podProposal.status === "draft_ready" &&
      podProposal.invoiceDraftId === undefined &&
      podLoadAfterUpload?.status === podStatusBefore &&
      loadDocumentStore.length === podDocumentsBefore &&
      invoiceDraftStore.length === podInvoicesBefore &&
      packetStore.length === podPacketsBefore,
  });

  const podApproval = requestInboxApproval({
    itemId: podProposal.id,
    tenantId: ctx.tenantId,
    companyId: ctx.companyId,
    userId: ctx.userId,
  });
  const podLoadAfterRequest = await getLoadService().getLoad(
    ctx.tenantId,
    podLoadId,
  );
  checks.push({
    name: "pod_approval_request_is_read_only",
    pass:
      Boolean(podApproval.approvalId) &&
      podLoadAfterRequest?.status === podStatusBefore &&
      loadDocumentStore.length === podDocumentsBefore &&
      invoiceDraftStore.length === podInvoicesBefore &&
      packetStore.length === podPacketsBefore,
  });

  const podExecution = await approvePodInvoiceAndPrepare({
    itemId: podProposal.id,
    tenantId: ctx.tenantId,
    companyId: ctx.companyId,
    userId: ctx.userId,
    role: ctx.role,
  });
  const podLoadAfterApproval = await getLoadService().getLoad(
    ctx.tenantId,
    podLoadId,
  );
  checks.push({
    name: "pod_records_change_only_after_explicit_approval",
    pass:
      !podExecution.error &&
      podExecution.item.status === "completed" &&
      Boolean(podExecution.invoiceId) &&
      podLoadAfterApproval?.status === "invoiced" &&
      loadDocumentStore.length === podDocumentsBefore + 1 &&
      invoiceDraftStore.length === podInvoicesBefore + 1 &&
      packetStore.length >= podPacketsBefore,
    detail: podExecution.error ?? `status=${podLoadAfterApproval?.status}`,
  });

  const mockExtraction = await new MockDocumentExtractionAdapter().extract({
    companyId: ctx.companyId,
    userId: ctx.userId,
    fileName: "opaque-upload.pdf",
    mimeType: "application/pdf",
    bytes: new TextEncoder().encode("RATE CONFIRMATION\nLoad Number: LD-TEST"),
    checksumSha256: "selfcheck",
  });
  checks.push({
    name: "document_mock_uses_content_not_filename",
    pass:
      mockExtraction.category === "rate_confirmation" &&
      mockExtraction.provider === "mock",
  });

  let unsupportedRejected = false;
  try {
    await validateDocumentFile(
      new File(["unsafe"], "unsafe.svg", { type: "image/svg+xml" }),
      { companyId: ctx.companyId, userId: ctx.userId },
    );
  } catch {
    unsupportedRejected = true;
  }
  checks.push({
    name: "document_upload_rejects_unsupported_mime",
    pass: unsupportedRejected,
  });

  let mismatchedContentRejected = false;
  try {
    await validateDocumentFile(
      new File(["not-a-pdf"], "spoofed.pdf", { type: "application/pdf" }),
      { companyId: ctx.companyId, userId: ctx.userId },
    );
  } catch {
    mismatchedContentRejected = true;
  }
  checks.push({
    name: "document_upload_rejects_mismatched_file_signature",
    pass: mismatchedContentRejected,
  });

  const reviewableConsistencyState: DocumentIntakeConsistencyState = {
    currentVersionValid: true,
    storageObjectExists: true,
    ocrStatus: "needs_review",
    proposedActionStatus: "pending",
    requiresApproval: true,
    approvalDecision: undefined,
    allFieldsVerified: false,
    proposalAuditExists: true,
    confirmationAuditExists: false,
    documentStatus: "needs_review",
  };
  checks.push({
    name: "document_incomplete_checksum_match_is_not_duplicate",
    pass:
      classifyDocumentIntakeState({
        ...reviewableConsistencyState,
        currentVersionValid: false,
        storageObjectExists: false,
        ocrStatus: "failed",
        proposedActionStatus: undefined,
        proposalAuditExists: false,
        documentStatus: "failed",
      }) === "resume_intake",
  });
  const missingComponentStates: DocumentIntakeConsistencyState[] = [
    { ...reviewableConsistencyState, currentVersionValid: false },
    { ...reviewableConsistencyState, storageObjectExists: false },
    {
      ...reviewableConsistencyState,
      ocrStatus: undefined,
      proposedActionStatus: undefined,
      proposalAuditExists: false,
    },
    {
      ...reviewableConsistencyState,
      proposedActionStatus: undefined,
      proposalAuditExists: false,
    },
  ];
  checks.push({
    name: "document_duplicate_requires_version_storage_ocr_and_proposal",
    pass: missingComponentStates.every(
      (state) => classifyDocumentIntakeState(state) === "resume_intake",
    ),
  });
  checks.push({
    name: "document_proposal_failure_is_recoverable",
    pass:
      classifyDocumentIntakeState({
        ...reviewableConsistencyState,
        ocrStatus: "completed",
        proposedActionStatus: undefined,
        proposalAuditExists: false,
      }) === "resume_intake",
  });
  const interruptedConfirmationState: DocumentIntakeConsistencyState = {
    ...reviewableConsistencyState,
    ocrStatus: "completed",
    proposedActionStatus: "approved",
    approvalDecision: "approved",
    allFieldsVerified: true,
    confirmationAuditExists: false,
  };
  checks.push({
    name: "document_confirmation_failure_is_not_exposed_as_complete",
    pass:
      !isDocumentConfirmationFinal(interruptedConfirmationState) &&
      classifyDocumentIntakeState(interruptedConfirmationState) ===
        "retry_confirmation",
  });
  const completedConfirmationState: DocumentIntakeConsistencyState = {
    ...interruptedConfirmationState,
    confirmationAuditExists: true,
    documentStatus: "ready",
  };
  checks.push({
    name: "document_confirmation_completed_retry_is_idempotent",
    pass:
      isDocumentConfirmationFinal(completedConfirmationState) &&
      classifyDocumentIntakeState(completedConfirmationState) ===
        "duplicate_completed" &&
      documentConfirmationRequestId("proposal-id") ===
        documentConfirmationRequestId("proposal-id"),
  });

  const sanitizedRateConfirmation = normalizeDocumentExtractionPayload(
    SANITIZED_RATE_CONFIRMATION_MODEL_PAYLOAD,
    "sanitized-fixture-model",
  );
  const normalizedRateConfirmationKeys = new Set(
    sanitizedRateConfirmation.fields.map((field) => field.key),
  );
  checks.push({
    name: "rate_confirmation_sanitized_fixture_maps_required_fields",
    pass:
      sanitizedRateConfirmation.category === "rate_confirmation" &&
      SANITIZED_RATE_CONFIRMATION_EXPECTED_KEYS.every((key) =>
        normalizedRateConfirmationKeys.has(key),
      ) &&
      RATE_CONFIRMATION_FIELD_KEYS.every((key) =>
        normalizedRateConfirmationKeys.has(key),
      ) &&
      normalizedRateConfirmationKeys.size ===
        SANITIZED_RATE_CONFIRMATION_EXPECTED_KEYS.length,
    detail: `${normalizedRateConfirmationKeys.size} canonical fields`,
  });
  const normalizedRate = sanitizedRateConfirmation.fields.find(
    (field) => field.key === "rate",
  );
  const normalizedInstructions = sanitizedRateConfirmation.fields.find(
    (field) => field.key === "instructions",
  );
  checks.push({
    name: "rate_confirmation_aliases_confidence_and_deduplication",
    pass:
      normalizedRate?.value === "USD 2,450.00" &&
      normalizedRate.confidence === 0.97 &&
      normalizedInstructions?.confidence === 0.72,
  });
  const sanitizedSparseRateConfirmation = normalizeDocumentExtractionPayload(
    SANITIZED_SPARSE_RATE_CONFIRMATION_PAYLOAD,
    "sanitized-fixture-model",
  );
  checks.push({
    name: "rate_confirmation_normalizer_never_invents_missing_values",
    pass:
      sanitizedSparseRateConfirmation.fields.length === 1 &&
      sanitizedSparseRateConfirmation.fields[0]?.key === "broker" &&
      !sanitizedSparseRateConfirmation.fields.some(
        (field) => field.key === "rate",
      ),
  });

  const normalizedPickupNumbers = sanitizedRateConfirmation.pickupNumbers;
  checks.push({
    name: "rate_confirmation_extracts_five_plus_pickup_numbers_in_order",
    pass:
      normalizedPickupNumbers.length ===
        SANITIZED_RATE_CONFIRMATION_PICKUP_NUMBER_VALUES.length &&
      SANITIZED_RATE_CONFIRMATION_PICKUP_NUMBER_VALUES.every(
        (value, index) => normalizedPickupNumbers[index]?.value === value,
      ),
    detail: `${normalizedPickupNumbers.length} ordered pickup numbers`,
  });
  checks.push({
    name: "pickup_number_exact_duplicates_are_removed_safely",
    pass:
      new Set(
        normalizedPickupNumbers.map(
          (entry) =>
            `${entry.value}|${entry.label}|${entry.pickupStopLabel ?? ""}`,
        ),
      ).size === normalizedPickupNumbers.length,
  });
  checks.push({
    name: "pickup_number_same_value_different_context_is_preserved",
    pass:
      normalizePickupNumbers([
        { value: "SHARED-REF", label: "PO Number", displayOrder: 0 },
        { value: "SHARED-REF", label: "Release Number", displayOrder: 1 },
      ]).length === 2,
  });
  checks.push({
    name: "pickup_number_stop_association_is_not_guessed",
    pass:
      normalizedPickupNumbers[0]?.pickupStopLabel ===
        "Pickup 1 · Austin, TX" &&
      normalizedPickupNumbers[0]?.requiresStopAssociationReview === false &&
      normalizedPickupNumbers[2]?.pickupStopLabel === undefined &&
      normalizedPickupNumbers[2]?.requiresStopAssociationReview === true,
  });
  const manuallyReviewedPickupNumbers = normalizePickupNumbers([
    { value: "PU-ONE", label: "Pickup #", displayOrder: 0 },
    { value: "PU-TWO-EDITED", label: "PO Number", displayOrder: 1 },
    { value: "", displayOrder: 2 },
  ]);
  checks.push({
    name: "pickup_numbers_are_optional_and_manually_repeatable",
    pass:
      manuallyReviewedPickupNumbers.length === 2 &&
      manuallyReviewedPickupNumbers[1]?.value === "PU-TWO-EDITED" &&
      normalizePickupNumbers([]).length === 0,
  });
  checks.push({
    name: "pickup_numbers_preserve_explicit_display_order",
    pass:
      orderedPickupNumbers(
        normalizedPickupNumbers.map((entry, index) => ({
          ...entry,
          id: `pickup-${index}`,
        })),
      ).every((entry, index) => entry.displayOrder === index),
  });

  const migrationSql = readFileSync(
    "supabase/migrations/20260720090000_document_intake_foundation.sql",
    "utf8",
  );
  const permissionMigrationSql = readFileSync(
    "supabase/migrations/20260720210000_document_intake_role_grants.sql",
    "utf8",
  );
  const pickupNumberMigrationSql = readFileSync(
    "supabase/migrations/20260721100000_document_pickup_numbers.sql",
    "utf8",
  );
  const pickupNumberRollbackSql = readFileSync(
    "supabase/rollback/20260721100000_document_pickup_numbers_rollback.sql",
    "utf8",
  );
  const rollbackSql = readFileSync(
    "supabase/rollback/20260720090000_document_intake_foundation_rollback.sql",
    "utf8",
  );
  const gitignore = readFileSync(".gitignore", "utf8");
  const documentRepositorySource = readFileSync(
    "lib/alph/document-intake/supabase-repository.ts",
    "utf8",
  );
  const documentExtractionContractSource = readFileSync(
    "lib/alph/document-intake/extraction-contract.ts",
    "utf8",
  );
  const openAiDocumentAdapterSource = readFileSync(
    "lib/alph/document-intake/openai-adapter.ts",
    "utf8",
  );
  const openAiDocumentRequestSource = readFileSync(
    "lib/alph/document-intake/openai-request.ts",
    "utf8",
  );
  const supabaseServerSource = readFileSync("lib/supabase/server.ts", "utf8");
  const supabaseAuthServerSource = readFileSync(
    "lib/auth/supabase-server.ts",
    "utf8",
  );
  const proxySource = readFileSync("proxy.ts", "utf8");
  const documentActionsSource = readFileSync(
    "app/actions/document-inbox.ts",
    "utf8",
  );
  const documentCenterActionsSource = readFileSync(
    "app/actions/document-center.ts",
    "utf8",
  );
  const documentCenterPageSource = readFileSync(
    "app/documents/page.tsx",
    "utf8",
  );
  const documentCenterClientSource = readFileSync(
    "components/documents/center/DocumentCenterClient.tsx",
    "utf8",
  );
  const documentReviewSource = readFileSync(
    "components/documents/center/DocumentAlphOcrReview.tsx",
    "utf8",
  );
  const documentDetailSource = readFileSync(
    "components/documents/center/DocumentDetailShell.tsx",
    "utf8",
  );
  const driverTripDetailSource = readFileSync(
    "components/driver-app/TripDetail.tsx",
    "utf8",
  );
  const driverMobileDetailSource = readFileSync(
    "components/driver-mobile/LoadDetailView.tsx",
    "utf8",
  );
  const driverPickupNumbersSource = readFileSync(
    "components/driver-mobile/PickupNumbersPanel.tsx",
    "utf8",
  );
  const dispatchAssignmentSource = readFileSync(
    "components/dispatch/load-detail/ReassignDriverFlow.tsx",
    "utf8",
  );
  const documentLayoutSource = readFileSync("app/documents/layout.tsx", "utf8");
  const permissionSql = permissionMigrationSql.replace(/\s+/g, " ").toLowerCase();
  const pickupSql = pickupNumberMigrationSql.replace(/\s+/g, " ").toLowerCase();
  const approvalMethodSource =
    documentRepositorySource.split("async recordApproval")[1]?.split("async appendAudit")[0] ?? "";
  const documentSaveUploadSource =
    documentRepositorySource.split("async saveUpload")[1]?.split("async saveExtraction")[0] ?? "";
  const authenticatedClientSource =
    supabaseServerSource.split("export function getSupabaseAuthenticatedUserClient")[1] ?? "";
  const documentListMethodSource =
    documentRepositorySource.split("async listDocuments")[1]?.split("async getDocument")[0] ?? "";
  const documentConfirmMethodSource =
    documentRepositorySource.split("async confirmReview")[1] ?? "";
  const dismissMethodSource =
    documentCenterClientSource.split("function dismissOcr")[1]?.split("const statusChips")[0] ?? "";
  const retryActionSource =
    documentCenterActionsSource
      .split("export async function retryDocumentCenterExtractionAction")[1]
      ?.split("export async function confirmDocumentCenterReviewAction")[0] ??
    "";
  const uploadActionSource =
    documentCenterActionsSource
      .split("export async function uploadDocumentCenterAction")[1]
      ?.split("export async function retryDocumentCenterExtractionAction")[0] ??
    "";
  const confirmCenterActionSource =
    documentCenterActionsSource.split(
      "export async function confirmDocumentCenterReviewAction",
    )[1] ?? "";
  const retrySourceMethod =
    documentRepositorySource
      .split("async loadExtractionRetrySource")[1]
      ?.split("async saveExtraction")[0] ?? "";
  const finalizeExtractionMethod =
    documentRepositorySource
      .split("async finalizeExtractionProposal")[1]
      ?.split("async recordApproval")[0] ?? "";

  const companyA = "11111111-1111-4111-8111-111111111111";
  const companyB = "22222222-2222-4222-8222-222222222222";
  const unauthenticatedIdentity = deriveVerifiedSupabaseIdentity(null);
  const ownerIdentity = deriveVerifiedSupabaseIdentity({
    id: "auth-user-owner",
    app_metadata: { company_id: companyA, business_role: "owner" },
  });
  const dispatcherIdentity = deriveVerifiedSupabaseIdentity({
    id: "auth-user-dispatcher",
    app_metadata: { company_id: companyA, business_role: "dispatcher" },
  });

  checks.push({
    name: "supabase_auth_denies_unauthenticated",
    pass:
      !unauthenticatedIdentity.ok &&
      unauthenticatedIdentity.reason === "unauthenticated",
  });
  checks.push({
    name: "supabase_auth_allows_same_company",
    pass:
      ownerIdentity.ok &&
      hasSameCompanyAccess(ownerIdentity.identity, companyA),
  });
  checks.push({
    name: "supabase_auth_denies_cross_company",
    pass:
      ownerIdentity.ok &&
      !hasSameCompanyAccess(ownerIdentity.identity, companyB),
  });
  checks.push({
    name: "supabase_auth_restricts_document_approval",
    pass:
      ownerIdentity.ok &&
      dispatcherIdentity.ok &&
      canApproveDocument(ownerIdentity.identity) &&
      !canApproveDocument(dispatcherIdentity.identity),
  });

  checks.push({
    name: "document_rls_uses_verified_app_metadata_claims",
    pass:
      migrationSql.includes("auth.jwt() -> 'app_metadata' ->> 'company_id'") &&
      migrationSql.includes(
        "auth.jwt() -> 'app_metadata' ->> 'business_role'",
      ) &&
      !migrationSql.includes("auth.jwt() ->> 'company_id'") &&
      !migrationSql.includes("auth.jwt() ->> 'role'"),
  });
  checks.push({
    name: "document_approval_roles_are_restricted",
    pass:
      migrationSql.includes("('owner','accounting','super_admin')") &&
      !migrationSql.includes("'dispatcher'"),
  });
  checks.push({
    name: "document_approval_is_company_bound",
    pass:
      migrationSql.includes("document_approvals_action_company_fk") &&
      migrationSql.includes("action.id = document_approvals.proposed_action_id") &&
      migrationSql.includes("action.company_id = document_approvals.company_id"),
  });
  checks.push({
    name: "document_relations_use_company_aware_foreign_keys",
    pass:
      migrationSql.includes("document_versions_document_company_fk") &&
      migrationSql.includes("document_ocr_document_company_fk") &&
      migrationSql.includes("document_ocr_version_company_fk") &&
      migrationSql.includes("document_ocr_fields_result_company_fk") &&
      migrationSql.includes("document_actions_document_company_fk") &&
      migrationSql.includes("document_audit_document_company_fk"),
  });
  checks.push({
    name: "pickup_number_migration_is_normalized_and_tenant_scoped",
    pass:
      pickupSql.includes("create table public.document_pickup_numbers") &&
      pickupSql.includes("document_pickup_numbers_ocr_document_company_fk") &&
      pickupSql.includes("foreign key (company_id, document_id, ocr_result_id)") &&
      pickupSql.includes("enable row level security") &&
      pickupSql.includes("company_id = public.current_company_id()") &&
      pickupSql.includes(
        "grant select on table public.document_pickup_numbers to authenticated",
      ) &&
      pickupSql.includes(
        "grant select, insert, update on table public.document_pickup_numbers to service_role",
      ) &&
      !pickupSql.includes("grant insert on table public.document_pickup_numbers to authenticated") &&
      !pickupSql.includes("grant delete"),
  });
  checks.push({
    name: "pickup_number_migration_uses_ordered_rows_not_json_or_fixed_columns",
    pass:
      pickupSql.includes("display_order integer") &&
      pickupSql.includes("pickup_stop_id text") &&
      pickupSql.includes("pickup_stop_reference text") &&
      pickupSql.includes("document_pickup_numbers_exact_active_dedupe_idx") &&
      !pickupSql.includes("pickup_number_1") &&
      !pickupSql.includes("jsonb"),
  });
  checks.push({
    name: "document_table_grants_are_least_privilege",
    pass:
      permissionSql.includes(
        "revoke all privileges on table public.documents, public.document_versions, public.document_ocr_results, public.document_ocr_fields, public.document_proposed_actions, public.document_approvals, public.document_audit_history from anon, authenticated, service_role;",
      ) &&
      permissionSql.includes(
        "grant insert on table public.document_approvals to authenticated;",
      ) &&
      !/grant [^;]* to anon;/.test(permissionSql) &&
      !/grant [^;]*document_approvals[^;]* to service_role;/.test(
        permissionSql.replace(/grant select[^;]+to service_role;/, ""),
      ) &&
      !/grant [^;]*(delete|truncate|references|trigger)[^;]*;/.test(
        permissionSql,
      ) &&
      !permissionSql.includes("disable row level security") &&
      !permissionSql.includes("drop policy"),
  });
  checks.push({
    name: "document_approval_uses_authenticated_user_client",
    pass:
      approvalMethodSource.includes(
        "getSupabaseAuthenticatedUserClient(input.accessToken)",
      ) &&
      /userDb\s*\.\s*from\("document_approvals"\)/.test(
        approvalMethodSource,
      ) &&
      !approvalMethodSource.includes('this.db.from("document_approvals")') &&
      authenticatedClientSource.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") &&
      !authenticatedClientSource.includes("SUPABASE_SERVICE_ROLE_KEY"),
  });
  checks.push({
    name: "document_approval_requires_persisted_review_snapshot",
    pass:
      approvalMethodSource.includes("reviewedCorrectionSnapshot") &&
      approvalMethodSource.includes("pickupNumberReviewSnapshot") &&
      approvalMethodSource.includes(
        "Reviewed fields and pickup numbers must be persisted before approval is recorded.",
      ),
  });
  checks.push({
    name: "document_routes_validate_supabase_user",
    pass:
      supabaseAuthServerSource.includes("await supabase.auth.getUser()") &&
      proxySource.includes("await supabase.auth.getUser()") &&
      documentLayoutSource.includes("await requireDocumentAuth()") &&
      documentActionsSource.includes("await requireDocumentAuth()"),
  });
  checks.push({
    name: "document_approval_uses_verified_claim_context",
    pass:
      documentActionsSource.includes("accessToken: auth.accessToken") &&
      documentActionsSource.includes("companyId: auth.companyId") &&
      documentActionsSource.includes("userId: auth.userId") &&
      !documentActionsSource.includes("input.accessToken") &&
      !documentActionsSource.includes("input.companyId") &&
      !documentActionsSource.includes("input.userId") &&
      !documentActionsSource.includes("input.businessRole"),
  });
  checks.push({
    name: "document_center_upload_is_server_persisted",
    pass:
      documentCenterActionsSource.includes("await requireDocumentAuth()") &&
      documentCenterActionsSource.includes("validateDocumentFile(file") &&
      documentCenterActionsSource.includes("repository.saveUpload(") &&
      documentCenterActionsSource.includes(
        "getDocumentExtractionAdapter().extract(upload)",
      ) &&
      documentCenterActionsSource.includes("repository.saveExtraction(") &&
      documentCenterActionsSource.includes("repository.createProposedAction(") &&
      documentCenterActionsSource.includes("repository.appendAudit("),
  });
  checks.push({
    name: "openai_rate_confirmation_schema_is_canonical_and_multipage",
    pass:
      openAiDocumentRequestSource.includes(
        "enum: [...DOCUMENT_EXTRACTION_FIELD_KEYS]",
      ) &&
      openAiDocumentRequestSource.includes('detail: "high"') &&
      openAiDocumentRequestSource.includes("Read every page") &&
      openAiDocumentRequestSource.includes("multi-stop or multi-page") &&
      openAiDocumentRequestSource.includes("store: false") &&
      openAiDocumentAdapterSource.includes(
        "createOpenAiDocumentExtractionRequest(input, model)",
      ) &&
      documentExtractionContractSource.includes(
        `DOCUMENT_EXTRACTION_PROMPT_VERSION = "${DOCUMENT_EXTRACTION_PROMPT_VERSION}"`,
      ),
  });
  checks.push({
    name: "rate_confirmation_fields_persist_and_render_generically",
    pass:
      RATE_CONFIRMATION_FIELD_KEYS.every((key) =>
        documentExtractionContractSource.includes(`"${key}"`),
      ) &&
      documentRepositorySource.includes("field_key: field.key") &&
      documentListMethodSource.includes("field_key,label,value_text,confidence") &&
      documentReviewSource.includes(
        "record.document.extractedFields.map((field)",
      ) &&
      documentReviewSource.includes("Needs human verification"),
  });
  checks.push({
    name: "rate_confirmation_pickup_numbers_use_strict_openai_collection",
    pass:
      openAiDocumentRequestSource.includes('"pickup_numbers"') &&
      openAiDocumentRequestSource.includes("Pickup Number, Pickup #") &&
      openAiDocumentRequestSource.includes("PU Number, PU#") &&
      openAiDocumentRequestSource.includes("Release Number") &&
      openAiDocumentRequestSource.includes("Order Number") &&
      openAiDocumentRequestSource.includes(
        'pickup_stop_reference: { type: ["string", "null"] }',
      ) &&
      openAiDocumentRequestSource.includes("Never split, combine, calculate, or invent identifiers") &&
      documentExtractionContractSource.includes("normalizePickupNumbers"),
  });
  checks.push({
    name: "pickup_numbers_persist_review_and_retry_without_duplicates",
    pass:
      documentRepositorySource.includes('from("document_pickup_numbers")') &&
      documentRepositorySource.includes("pickupNumberFingerprint") &&
      documentRepositorySource.includes("reviewed_pickup_numbers") &&
      documentRepositorySource.includes("is_removed: true") &&
      documentRepositorySource.includes(
        "A confirmation retry must use the originally approved pickup numbers.",
      ) &&
      documentReviewSource.includes("+ Add pickup number") &&
      documentReviewSource.includes("removePickupNumber") &&
      documentReviewSource.includes("This optional section does not block confirmation"),
  });
  checks.push({
    name: "pickup_numbers_are_prominent_in_driver_and_assignment_views",
    pass:
      driverPickupNumbersSource.includes("PICKUP NUMBER") &&
      driverPickupNumbersSource.includes("if (!entries.length) return null") &&
      driverTripDetailSource.includes("PickupNumbersPanel") &&
      driverMobileDetailSource.includes("PickupNumbersPanel") &&
      dispatchAssignmentSource.includes("Driver dispatch summary") &&
      dispatchAssignmentSource.includes("PICKUP NUMBER:"),
  });
  checks.push({
    name: "pickup_number_workflow_has_no_financial_write_path",
    pass:
      !/from\("(loads|invoices|payments|payroll|financial_records|accounting)"\)/.test(
        `${documentRepositorySource}\n${documentCenterActionsSource}`,
      ) &&
      !pickupNumberMigrationSql.includes("invoices") &&
      !pickupNumberMigrationSql.includes("payments") &&
      !pickupNumberMigrationSql.includes("payroll"),
  });
  checks.push({
    name: "document_extraction_retry_is_authenticated_and_rls_bound",
    pass:
      retryActionSource.includes("await requireDocumentAuth()") &&
      retryActionSource.includes("auth.companyId") &&
      retryActionSource.includes("auth.userId") &&
      retryActionSource.includes("auth.accessToken") &&
      retryActionSource.includes("loadExtractionRetrySource") &&
      retrySourceMethod.includes(
        "getSupabaseAuthenticatedUserClient(input.accessToken)",
      ) &&
      retrySourceMethod.includes(".download(storagePath)") &&
      retrySourceMethod.includes("validateDocumentBytes") &&
      retrySourceMethod.includes("upload.checksumSha256 !== checksum") &&
      !retryActionSource.includes("FormData") &&
      !retryActionSource.includes("saveUpload"),
  });
  checks.push({
    name: "document_extraction_retry_activates_complete_proposal_only",
    pass:
      retryActionSource.includes("persistExtractionReview") &&
      finalizeExtractionMethod.includes("document_ocr_review_activated") &&
      finalizeExtractionMethod.includes('status: "superseded"') &&
      documentRepositorySource.includes("hasReviewProposalAudit") &&
      documentRepositorySource.includes("extraction_prompt_version") &&
      documentReviewSource.includes("Retry extraction") &&
      documentReviewSource.includes("!hasFields || !hasReviewIds"),
  });
  checks.push({
    name: "document_extraction_retry_has_no_operational_writes",
    pass:
      !/from\("(loads|invoices|payments|payroll|financial_records)"\)/.test(
        `${retryActionSource}\n${retrySourceMethod}\n${finalizeExtractionMethod}`,
      ) &&
      !retryActionSource.includes('status: "executed"') &&
      !finalizeExtractionMethod.includes('status: "executed"'),
  });
  checks.push({
    name: "document_center_list_uses_authenticated_rls",
    pass:
      documentCenterPageSource.includes("requireDocumentAuth()") &&
      documentCenterPageSource.includes(".listDocuments({") &&
      documentListMethodSource.includes(
        "getSupabaseAuthenticatedUserClient(input.accessToken)",
      ) &&
      /userDb\s*\.\s*from\("documents"\)/.test(
        documentListMethodSource,
      ) &&
      !documentListMethodSource.includes("getSupabaseServerClient"),
  });
  checks.push({
    name: "document_center_dismiss_preserves_persistence",
    pass:
      dismissMethodSource.includes('setOcrStatus("idle")') &&
      dismissMethodSource.includes("setReviewRecord(null)") &&
      !dismissMethodSource.includes("setRecords") &&
      !dismissMethodSource.includes("delete") &&
      !dismissMethodSource.includes("remove"),
  });
  checks.push({
    name: "document_center_duplicate_reconciles_incomplete_intake",
    pass:
      documentSaveUploadSource.includes("inspectExistingIntake") &&
      documentSaveUploadSource.includes("reconcileExistingUpload") &&
      documentSaveUploadSource.includes('disposition === "duplicate_reviewable"') &&
      documentSaveUploadSource.includes('disposition === "duplicate_completed"') &&
      documentRepositorySource.includes("storageObjectExists") &&
      documentRepositorySource.includes("RecoverableDocumentIntakeError"),
  });
  checks.push({
    name: "document_center_confirmation_is_document_only",
    pass:
      documentConfirmMethodSource.includes('from("document_ocr_fields")') &&
      documentConfirmMethodSource.includes('from("document_approvals")') &&
      documentConfirmMethodSource.includes('from("documents")') &&
      documentConfirmMethodSource.includes(
        'from("document_proposed_actions")',
      ) &&
      !/from\("(loads|invoices|payments|payroll|financial_records)"\)/.test(
        documentConfirmMethodSource,
      ) &&
      !documentConfirmMethodSource.includes('status: "executed"'),
  });
  checks.push({
    name: "document_center_confirmation_has_final_state_gate",
    pass:
      documentConfirmMethodSource.includes("isDocumentConfirmationFinal") &&
      documentConfirmMethodSource.includes("requireUpdatedRow") &&
      documentConfirmMethodSource.includes(
        'eventType: "document_review_confirmation_prepared"',
      ) &&
      documentConfirmMethodSource.includes(
        "documentConfirmationRequestId",
      ) &&
      documentConfirmMethodSource.indexOf(
        '.update({ status: "ready", updated_at: verifiedAt })',
      ) >
        documentConfirmMethodSource.indexOf(
          'eventType: "document_review_confirmation_prepared"',
        ),
  });
  checks.push({
    name: "document_center_confirmation_retry_binds_corrections",
    pass:
      documentConfirmMethodSource.includes("existingCorrectionSnapshot") &&
      documentConfirmMethodSource.includes("reviewed_corrections") &&
      documentConfirmMethodSource.includes("correctionMapsMatch") &&
      documentConfirmMethodSource.includes(
        "A confirmation retry must use the originally approved corrections.",
      ),
  });
  checks.push({
    name: "document_detail_actions_are_truthful_and_read_only",
    pass:
      documentDetailSource.includes("unavailableActions") &&
      documentDetailSource.includes("document.previewUrl") &&
      !documentDetailSource.includes("setDocument") &&
      !documentDetailSource.includes("appendAudit") &&
      !documentDetailSource.includes("Alpha Owner") &&
      !documentDetailSource.includes("Mock download") &&
      !documentDetailSource.includes("mock Alph pipeline") &&
      !documentDetailSource.includes("Document renamed") &&
      !documentDetailSource.includes("Moved to trash"),
  });
  checks.push({
    name: "document_center_has_no_demo_identity",
    pass:
      !documentCenterClientSource.includes("DEMO_TENANT_ID") &&
      !documentCenterClientSource.includes("Alpha Owner") &&
      !documentCenterClientSource.includes('storageProvider: "local"') &&
      !documentDetailSource.includes("Alpha Owner") &&
      !`${uploadActionSource}\n${retryActionSource}\n${confirmCenterActionSource}`.includes(
        "input.companyId",
      ) &&
      !`${uploadActionSource}\n${retryActionSource}\n${confirmCenterActionSource}`.includes(
        "input.userId",
      ) &&
      !`${uploadActionSource}\n${retryActionSource}\n${confirmCenterActionSource}`.includes(
        "input.businessRole",
      ),
  });
  checks.push({
    name: "document_rollback_refuses_data_or_file_loss",
    pass:
      rollbackSql.includes("Rollback refused: public.documents contains records.") &&
      rollbackSql.includes("Rollback refused: company-documents contains stored files.") &&
      pickupNumberRollbackSql.includes(
        "Rollback refused: public.document_pickup_numbers contains records.",
      ) &&
      gitignore.includes("/supabase/.temp/"),
  });

  const ok = checks.every((c) => c.pass);
  return { ok, checks };
}
