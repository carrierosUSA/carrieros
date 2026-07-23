import type { DocumentExtractionModelPayload } from "@/lib/alph/document-intake/extraction-contract";

export const SANITIZED_COMPANY_ID = "11111111-1111-4111-8111-111111111111";
export const SANITIZED_OTHER_COMPANY_ID =
  "22222222-2222-4222-8222-222222222222";
export const SANITIZED_USER_ID = "33333333-3333-4333-8333-333333333333";

export const SANITIZED_RATE_CONFIRMATION_PAYLOAD = {
  category: "rate_confirmation",
  raw_text: "SANITIZED TEST DOCUMENT — NOT A REAL LOAD",
  overall_confidence: 0.91,
  fields: [
    { key: "brokercompany", value: "EXAMPLE LOGISTICS LLC", confidence: 0.98 },
    { key: "confirmationnumber", value: "TEST-RC-1001", confidence: 0.96 },
    { key: "totalrate", value: "$1,250.00", confidence: 0.94 },
    { key: "pickupcompany", value: "EXAMPLE ORIGIN", confidence: 0.88 },
    { key: "pickupcitystate", value: "Austin, TX", confidence: 0.86 },
    { key: "deliverycompany", value: "EXAMPLE DESTINATION", confidence: 0.87 },
    { key: "deliverycitystate", value: "Dallas, TX", confidence: 0.86 },
    { key: "freightdescription", value: "SANITIZED GOODS", confidence: 0.7 },
  ],
} satisfies DocumentExtractionModelPayload;

export const SANITIZED_PDF_BYTES = new TextEncoder().encode(
  "%PDF-1.7\nSANITIZED TEST DOCUMENT — NOT A REAL LOAD\n%%EOF",
);
