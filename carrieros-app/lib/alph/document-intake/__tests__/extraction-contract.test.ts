import assert from "node:assert/strict";
import test from "node:test";
import {
  SANITIZED_PDF_BYTES,
  SANITIZED_RATE_CONFIRMATION_PAYLOAD,
} from "@/lib/alph/document-intake/__fixtures__/sanitized-document-intake";
import {
  DOCUMENT_EXTRACTION_PROMPT_VERSION,
  normalizeDocumentExtractionPayload,
} from "@/lib/alph/document-intake/extraction-contract";
import { createOpenAiDocumentExtractionRequest } from "@/lib/alph/document-intake/openai-request";

test("sanitized rate confirmation fields normalize to canonical keys", () => {
  const result = normalizeDocumentExtractionPayload(
    SANITIZED_RATE_CONFIRMATION_PAYLOAD,
    "test-model",
  );
  assert.equal(result.category, "rate_confirmation");
  assert.equal(result.promptVersion, DOCUMENT_EXTRACTION_PROMPT_VERSION);
  assert.deepEqual(
    result.fields.slice(0, 3).map((field) => field.key),
    ["loadNumber", "broker", "rate"],
  );
  assert.equal(
    result.fields.find((field) => field.key === "commodity")
      ?.needsHumanVerification,
    true,
  );
});

test("missing and unknown fields are never invented", () => {
  const result = normalizeDocumentExtractionPayload(
    {
      category: "unknown",
      overall_confidence: 0.2,
      fields: [
        { key: "not_a_field", value: "fabricated", confidence: 1 },
        { key: "broker", value: "", confidence: 1 },
      ],
    },
    "test-model",
  );
  assert.equal(result.category, "miscellaneous");
  assert.deepEqual(result.fields, []);
});

test("OpenAI request is private and uses strict structured output", () => {
  const request = createOpenAiDocumentExtractionRequest(
    {
      companyId: "11111111-1111-4111-8111-111111111111",
      userId: "33333333-3333-4333-8333-333333333333",
      fileName: "sanitized.pdf",
      mimeType: "application/pdf",
      bytes: SANITIZED_PDF_BYTES,
      checksumSha256: "test-checksum",
    },
    "test-model",
  );
  assert.equal(request.store, false);
  const format = (request.text as { format: { strict: boolean } }).format;
  assert.equal(format.strict, true);
});
