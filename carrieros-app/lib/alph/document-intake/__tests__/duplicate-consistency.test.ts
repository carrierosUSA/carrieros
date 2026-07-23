import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyDocumentIntakeState,
  isDocumentConfirmationFinal,
  type DocumentIntakeConsistencyState,
} from "@/lib/alph/document-intake/consistency";

const complete: DocumentIntakeConsistencyState = {
  currentVersionValid: true,
  storageObjectExists: true,
  ocrStatus: "completed",
  proposedActionStatus: "approved",
  requiresApproval: true,
  approvalDecision: "approved",
  allFieldsVerified: true,
  proposalAuditExists: true,
  confirmationAuditExists: true,
  documentStatus: "ready",
};

test("only a fully gated intake is complete", () => {
  assert.equal(isDocumentConfirmationFinal(complete), true);
  assert.equal(classifyDocumentIntakeState(complete), "duplicate_completed");
  assert.equal(
    isDocumentConfirmationFinal({ ...complete, confirmationAuditExists: false }),
    false,
  );
});

test("missing version or storage always resumes intake", () => {
  assert.equal(
    classifyDocumentIntakeState({ ...complete, currentVersionValid: false }),
    "resume_intake",
  );
  assert.equal(
    classifyDocumentIntakeState({ ...complete, storageObjectExists: false }),
    "resume_intake",
  );
});

test("partial approval is recoverable and not complete", () => {
  const partial = {
    ...complete,
    confirmationAuditExists: false,
    documentStatus: "needs_review",
  };
  assert.equal(isDocumentConfirmationFinal(partial), false);
  assert.equal(classifyDocumentIntakeState(partial), "retry_confirmation");
});
