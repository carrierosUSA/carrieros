import assert from "node:assert/strict";
import test from "node:test";
import {
  SANITIZED_COMPANY_ID,
  SANITIZED_OTHER_COMPANY_ID,
  SANITIZED_USER_ID,
} from "@/lib/alph/document-intake/__fixtures__/sanitized-document-intake";
import {
  canApproveDocument,
  deriveVerifiedSupabaseIdentity,
  hasSameCompanyAccess,
} from "@/lib/auth/supabase-claims";
import { canUploadDocuments } from "@/lib/auth/document-permissions";

test("unauthenticated users are denied", () => {
  assert.deepEqual(deriveVerifiedSupabaseIdentity(null), {
    ok: false,
    reason: "unauthenticated",
  });
});

test("identity comes only from verified app metadata", () => {
  const result = deriveVerifiedSupabaseIdentity({
    id: SANITIZED_USER_ID,
    app_metadata: {
      company_id: SANITIZED_COMPANY_ID,
      business_role: "owner",
    },
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.identity.companyId, SANITIZED_COMPANY_ID);
  assert.equal(result.identity.userId, SANITIZED_USER_ID);
  assert.equal(hasSameCompanyAccess(result.identity, SANITIZED_COMPANY_ID), true);
  assert.equal(
    hasSameCompanyAccess(result.identity, SANITIZED_OTHER_COMPANY_ID),
    false,
  );
  assert.equal(canApproveDocument(result.identity), true);
});

test("approval and upload permissions are explicit", () => {
  assert.equal(canApproveDocument({
    userId: SANITIZED_USER_ID,
    companyId: SANITIZED_COMPANY_ID,
    businessRole: "dispatcher",
  }), false);
  assert.equal(canUploadDocuments("dispatcher"), true);
  assert.equal(canUploadDocuments("read_only"), false);
});
