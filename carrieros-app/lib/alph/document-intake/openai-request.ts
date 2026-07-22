import {
  DOCUMENT_EXTRACTION_CATEGORIES,
  DOCUMENT_EXTRACTION_FIELD_KEYS,
  normalizeDocumentExtractionPayload,
  type DocumentExtractionModelPayload,
} from "@/lib/alph/document-intake/extraction-contract";
import type {
  DocumentExtraction,
  DocumentUpload,
} from "@/lib/alph/document-intake/types";

export const OPENAI_DOCUMENT_EXTRACTION_INSTRUCTIONS = `You extract trucking documents for a human review workflow.

Safety rules:
- Read every page and use only information visibly present in the document.
- Never infer, calculate, complete, or guess a missing value.
- Omit a field when the value is absent, illegible, ambiguous, or only implied.
- Preserve visible wording, dates, times, units, and currency. Do not silently reformat them.
- Confidence is field-specific: use a lower score for handwriting, small print, conflicting labels, or uncertain associations.
- Classification must be unknown when the document type is not clear.

Rate Confirmation guidance:
- Common titles include Carrier Rate Confirmation, Rate Confirmation, Load Tender, Load Confirmation, and Dispatch Sheet.
- The broker may be labeled broker, customer, logistics company, or arranged by. Do not use the carrier name as broker unless the document explicitly identifies it that way.
- Use loadNumber for the primary load, confirmation, RC, trip, order, or reference number that identifies this shipment. Use brokerLoadId only when a distinct broker load ID is also shown.
- Use rate only for the explicitly stated total agreed rate or total carrier pay. Do not add line items or infer a total.
- Use pickup and delivery for the facility/company names. Keep city/state, street address, appointment date, and appointment time in their separate canonical fields.
- For multi-stop or multi-page documents, inspect all pages. Use the first pickup as origin and the final delivery as destination; preserve additional stops or constraints in instructions when explicitly shown.
- Return every identifier that the driver may need at pickup in pickup_numbers, in document order. Common labels include Pickup Number, Pickup #, PU Number, PU#, PO Number, PO#, Confirmation Number, Release Number, Reference Number, and Order Number.
- A generic confirmation/load number belongs in loadNumber. Include it in pickup_numbers only when the document explicitly presents it as an identifier the driver must use at pickup; never duplicate or re-label it speculatively.
- Preserve the visible identifier and its visible label. Never split, combine, calculate, or invent identifiers.
- Set pickup_stop_reference only when the document explicitly ties the identifier to a particular pickup facility, location, or numbered stop. Otherwise return null and set stop_association_confidence to 0 so a human can associate it.
- Different pickup identifiers must be separate pickup_numbers entries. Exact repeats for the same label and stop must appear only once.
- Important instructions may include appointment requirements, tracking/check-call rules, temperature, seal, detention, lumper, accessorial, or paperwork instructions. Copy only concise operational instructions that are explicitly visible.

Return only these canonical field keys when present:
loadNumber, broker, brokerLoadId, driver, truck, trailer, pickup, pickupCityState, pickupAddress, pickupDate, pickupTime, delivery, deliveryCityState, deliveryAddress, deliveryDate, deliveryTime, rate, miles, equipmentType, commodity, weight, pieces, receiver, invoiceNumber, poNumber, bolNumber, temperature, detention, lumper, instructions, date, time.`;

export function createOpenAiDocumentExtractionRequest(
  input: DocumentUpload,
  model: string,
): Record<string, unknown> {
  const dataUrl = `data:${input.mimeType};base64,${Buffer.from(input.bytes).toString("base64")}`;
  const filePart =
    input.mimeType === "application/pdf"
      ? {
          type: "input_file",
          filename: input.fileName,
          file_data: dataUrl,
          detail: "high",
        }
      : { type: "input_image", image_url: dataUrl, detail: "high" };

  return {
    model,
    store: false,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: OPENAI_DOCUMENT_EXTRACTION_INSTRUCTIONS },
          filePart,
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "document_extraction",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: [
            "category",
            "raw_text",
            "overall_confidence",
            "fields",
            "pickup_numbers",
          ],
          properties: {
            category: {
              type: "string",
              enum: [...DOCUMENT_EXTRACTION_CATEGORIES],
            },
            raw_text: { type: "string" },
            overall_confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
            },
            fields: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["key", "value", "confidence"],
                properties: {
                  key: {
                    type: "string",
                    enum: [...DOCUMENT_EXTRACTION_FIELD_KEYS],
                  },
                  value: { type: "string" },
                  confidence: {
                    type: "number",
                    minimum: 0,
                    maximum: 1,
                  },
                },
              },
            },
            pickup_numbers: {
              type: "array",
              maxItems: 100,
              items: {
                type: "object",
                additionalProperties: false,
                required: [
                  "value",
                  "label",
                  "pickup_stop_reference",
                  "confidence",
                  "stop_association_confidence",
                  "display_order",
                ],
                properties: {
                  value: { type: "string" },
                  label: { type: ["string", "null"] },
                  pickup_stop_reference: { type: ["string", "null"] },
                  confidence: { type: "number", minimum: 0, maximum: 1 },
                  stop_association_confidence: {
                    type: "number",
                    minimum: 0,
                    maximum: 1,
                  },
                  display_order: { type: "integer", minimum: 0 },
                },
              },
            },
          },
        },
      },
    },
  };
}

function outputText(body: Record<string, unknown>): string {
  if (typeof body.output_text === "string") return body.output_text;
  const output = Array.isArray(body.output) ? body.output : [];
  for (const item of output) {
    if (
      !item ||
      typeof item !== "object" ||
      !Array.isArray((item as { content?: unknown[] }).content)
    ) {
      continue;
    }
    for (const part of (item as { content: unknown[] }).content) {
      if (
        part &&
        typeof part === "object" &&
        typeof (part as { text?: unknown }).text === "string"
      ) {
        return (part as { text: string }).text;
      }
      if (
        part &&
        typeof part === "object" &&
        typeof (part as { refusal?: unknown }).refusal === "string"
      ) {
        throw new Error("OpenAI declined document extraction.");
      }
    }
  }
  throw new Error("OpenAI returned no structured document extraction.");
}

export function parseOpenAiDocumentExtractionResponse(
  body: Record<string, unknown>,
  model: string,
): DocumentExtraction {
  const payload = JSON.parse(
    outputText(body),
  ) as DocumentExtractionModelPayload;
  return normalizeDocumentExtractionPayload(payload, model);
}
