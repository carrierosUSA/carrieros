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
- Preserve visible wording, dates, times, units, and currency.
- Use lower field confidence for handwriting, small print, conflicting labels, or uncertain associations.
- Classification must be unknown when the document type is not clear.

Rate Confirmation guidance:
- Common titles include Carrier Rate Confirmation, Rate Confirmation, Load Tender, Load Confirmation, and Dispatch Sheet.
- The broker may be labeled broker, customer, logistics company, or arranged by. Do not use the carrier name unless explicitly identified as the broker.
- Use loadNumber for the primary load, confirmation, RC, trip, order, or reference number identifying the shipment.
- Use rate only for an explicitly stated total agreed rate or carrier pay. Do not add line items.
- Keep facility, city/state, address, appointment date, and appointment time in separate canonical fields.
- Inspect every page. For multi-stop documents, use the first origin and final destination; preserve other explicit stop constraints in instructions.
- Copy only concise operational instructions explicitly visible in the document.

Return only the permitted canonical field keys.`;

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
          required: ["category", "raw_text", "overall_confidence", "fields"],
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
              maxItems: 100,
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
  const payload = JSON.parse(outputText(body)) as DocumentExtractionModelPayload;
  return normalizeDocumentExtractionPayload(payload, model);
}
