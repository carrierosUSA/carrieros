import assert from "node:assert/strict";
import test from "node:test";
import {
  SANITIZED_COMPANY_ID,
  SANITIZED_PDF_BYTES,
  SANITIZED_USER_ID,
} from "@/lib/alph/document-intake/__fixtures__/sanitized-document-intake";
import { validateDocumentBytes } from "@/lib/alph/document-intake/validation";

const context = {
  companyId: SANITIZED_COMPANY_ID,
  userId: SANITIZED_USER_ID,
};

test("valid PDF bytes are accepted and checksummed", () => {
  const upload = validateDocumentBytes(
    {
      bytes: SANITIZED_PDF_BYTES,
      fileName: "sanitized.pdf",
      mimeType: "application/pdf",
    },
    context,
  );
  assert.equal(upload.mimeType, "application/pdf");
  assert.match(upload.checksumSha256, /^[a-f0-9]{64}$/);
});

test("MIME and file signature mismatches are rejected", () => {
  assert.throws(
    () =>
      validateDocumentBytes(
        {
          bytes: SANITIZED_PDF_BYTES,
          fileName: "sanitized.png",
          mimeType: "image/png",
        },
        context,
      ),
    /file content does not match/i,
  );
});

test("unsupported and empty files are rejected", () => {
  assert.throws(
    () =>
      validateDocumentBytes(
        {
          bytes: new Uint8Array(),
          fileName: "empty.txt",
          mimeType: "text/plain",
        },
        context,
      ),
    /Unsupported file/,
  );
});
