import { readFileSync } from "node:fs";
import {
  RATE_CONFIRMATION_FIELD_KEYS,
} from "@/lib/alph/document-intake/extraction-contract";
import { SANITIZED_RATE_CONFIRMATION_PICKUP_NUMBER_VALUES } from "@/lib/alph/document-intake/__fixtures__/rate-confirmation";
import {
  createOpenAiDocumentExtractionRequest,
  parseOpenAiDocumentExtractionResponse,
} from "@/lib/alph/document-intake/openai-request";
import { validateDocumentBytes } from "@/lib/alph/document-intake/validation";

async function main() {
  process.loadEnvFile(".env.local");
  const apiKey = process.env.OPENAI_API_KEY;
  const fixturePath = process.argv[2];
  if (!apiKey || !fixturePath) {
    throw new Error("Sanitized extraction check configuration is missing.");
  }

  const bytes = new Uint8Array(readFileSync(fixturePath));
  const upload = validateDocumentBytes(
    {
      bytes,
      fileName: "sanitized-rate-confirmation.pdf",
      mimeType: "application/pdf",
    },
    {
      companyId: "11111111-1111-4111-8111-111111111111",
      userId: "22222222-2222-4222-8222-222222222222",
    },
  );
  const model = process.env.ALPH_DOCUMENT_MODEL ?? "gpt-5.4";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      createOpenAiDocumentExtractionRequest(upload, model),
    ),
  });
  if (!response.ok) {
    throw new Error(`OpenAI sanitized extraction check failed (${response.status}).`);
  }
  const extraction = parseOpenAiDocumentExtractionResponse(
    (await response.json()) as Record<string, unknown>,
    model,
  );
  const extractedKeys = new Set(
    extraction.fields.map((field) => field.key),
  );
  const missingKeys = RATE_CONFIRMATION_FIELD_KEYS.filter(
    (key) => !extractedKeys.has(key),
  );
  const invalidConfidence = extraction.fields.some(
    (field) => field.confidence < 0 || field.confidence > 1,
  );
  const pickupNumberValues = extraction.pickupNumbers.map(
    (entry) => entry.value,
  );
  const pickupNumbersPass =
    SANITIZED_RATE_CONFIRMATION_PICKUP_NUMBER_VALUES.every((value) =>
      pickupNumberValues.includes(value),
    ) && new Set(pickupNumberValues).size === pickupNumberValues.length;
  const pass =
    extraction.category === "rate_confirmation" &&
    missingKeys.length === 0 &&
    !invalidConfidence &&
    pickupNumbersPass;

  console.log(pass ? "PASS sanitized OpenAI RC extraction" : "FAIL sanitized OpenAI RC extraction");
  console.log(
    `canonical_fields=${extractedKeys.size} required_fields=${RATE_CONFIRMATION_FIELD_KEYS.length - missingKeys.length}/${RATE_CONFIRMATION_FIELD_KEYS.length}`,
  );
  if (missingKeys.length) console.log(`missing_keys=${missingKeys.join(",")}`);
  console.log(
    `pickup_numbers=${pickupNumberValues.length} required_pickup_numbers=${SANITIZED_RATE_CONFIRMATION_PICKUP_NUMBER_VALUES.length}`,
  );
  process.exit(pass ? 0 : 1);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown safe error";
  console.error(`FAIL sanitized OpenAI RC extraction: ${message}`);
  process.exit(1);
});
