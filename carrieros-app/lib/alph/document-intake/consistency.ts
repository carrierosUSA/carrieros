export type DocumentIntakeConsistencyState = {
  currentVersionValid: boolean;
  storageObjectExists: boolean;
  ocrStatus?: string;
  proposedActionStatus?: string;
  requiresApproval: boolean;
  approvalDecision?: string;
  allFieldsVerified: boolean;
  proposalAuditExists: boolean;
  confirmationAuditExists: boolean;
  documentStatus?: string;
};

export type DocumentIntakeDisposition =
  | "duplicate_reviewable"
  | "duplicate_completed"
  | "resume_intake"
  | "retry_confirmation";

export function isDocumentConfirmationFinal(
  state: DocumentIntakeConsistencyState,
): boolean {
  return (
    state.currentVersionValid &&
    state.storageObjectExists &&
    state.ocrStatus === "completed" &&
    state.proposedActionStatus === "approved" &&
    state.requiresApproval &&
    state.approvalDecision === "approved" &&
    state.allFieldsVerified &&
    state.proposalAuditExists &&
    state.confirmationAuditExists &&
    state.documentStatus === "ready"
  );
}

export function classifyDocumentIntakeState(
  state: DocumentIntakeConsistencyState,
): DocumentIntakeDisposition {
  if (isDocumentConfirmationFinal(state)) return "duplicate_completed";

  if (!state.currentVersionValid || !state.storageObjectExists) {
    return "resume_intake";
  }

  if (
    state.proposedActionStatus === "approved" ||
    state.approvalDecision === "approved"
  ) {
    return "retry_confirmation";
  }

  if (
    (state.ocrStatus === "completed" || state.ocrStatus === "needs_review") &&
    state.proposedActionStatus === "pending" &&
    state.requiresApproval &&
    state.proposalAuditExists
  ) {
    return "duplicate_reviewable";
  }

  return "resume_intake";
}

export function documentConfirmationRequestId(
  proposedActionId: string,
): string {
  return `document-confirmation:${proposedActionId}`;
}
