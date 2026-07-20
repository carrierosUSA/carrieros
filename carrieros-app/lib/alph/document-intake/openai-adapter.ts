import "server-only";

import { getServerSecret } from "@/lib/security/secrets";
import type { DocumentExtraction, DocumentExtractionAdapter, DocumentUpload } from "@/lib/alph/document-intake/types";
import type { DocumentCategory, DocumentExtractedField, DocumentExtractedFieldKey } from "@/lib/types/documents";

const PROMPT_VERSION = "document-intake-v1";
const CATEGORIES = ["rate_confirmation", "bol", "pod", "lumper_receipt", "fuel_receipt", "invoice", "unknown"] as const;
const FIELD_KEYS = new Set<DocumentExtractedFieldKey>(["loadNumber","broker","brokerLoadId","driver","truck","trailer","pickup","pickupAddress","pickupDate","delivery","deliveryAddress","deliveryDate","rate","miles","equipmentType","commodity","weight","pieces","receiver","invoiceNumber","poNumber","bolNumber","temperature","detention","lumper","date","time"]);

type ModelPayload = { category: (typeof CATEGORIES)[number]; raw_text: string; overall_confidence: number; fields: Array<{ key: string; label: string; value: string; confidence: number }> };

function outputText(body: Record<string, unknown>): string {
  if (typeof body.output_text === "string") return body.output_text;
  const output = Array.isArray(body.output) ? body.output : [];
  for (const item of output) if (item && typeof item === "object" && Array.isArray((item as { content?: unknown[] }).content)) for (const part of (item as { content: unknown[] }).content) if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") return (part as { text: string }).text;
  throw new Error("OpenAI returned no structured document extraction.");
}

function normalize(payload: ModelPayload, modelId: string): DocumentExtraction {
  const fields: DocumentExtractedField[] = payload.fields.filter((f) => FIELD_KEYS.has(f.key as DocumentExtractedFieldKey)).map((f) => ({ key: f.key as DocumentExtractedFieldKey, label: f.label, value: f.value, confidence: Math.min(1, Math.max(0, f.confidence)) }));
  const category: DocumentCategory = payload.category === "unknown" ? "miscellaneous" : payload.category;
  return { category: category as DocumentExtraction["category"], rawText: payload.raw_text, fields, overallConfidence: Math.min(1, Math.max(0, payload.overall_confidence)), provider: "openai", modelId, promptVersion: PROMPT_VERSION };
}

export class OpenAiDocumentExtractionAdapter implements DocumentExtractionAdapter {
  readonly id = "openai";
  async extract(input: DocumentUpload): Promise<DocumentExtraction> {
    const apiKey = getServerSecret("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OpenAI document extraction is not configured.");
    const model = process.env.ALPH_DOCUMENT_MODEL ?? "gpt-5.4";
    const dataUrl = `data:${input.mimeType};base64,${Buffer.from(input.bytes).toString("base64")}`;
    const filePart = input.mimeType === "application/pdf"
      ? { type: "input_file", filename: input.fileName, file_data: dataUrl }
      : { type: "input_image", image_url: dataUrl, detail: "high" };
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, input: [{ role: "user", content: [{ type: "input_text", text: "Classify this trucking document and extract only visible operational fields. Never infer missing values. Confidence must reflect legibility. Return unknown when uncertain." }, filePart] }], text: { format: { type: "json_schema", name: "document_extraction", strict: true, schema: { type: "object", additionalProperties: false, required: ["category","raw_text","overall_confidence","fields"], properties: { category: { type: "string", enum: [...CATEGORIES] }, raw_text: { type: "string" }, overall_confidence: { type: "number", minimum: 0, maximum: 1 }, fields: { type: "array", items: { type: "object", additionalProperties: false, required: ["key","label","value","confidence"], properties: { key: { type: "string" }, label: { type: "string" }, value: { type: "string" }, confidence: { type: "number", minimum: 0, maximum: 1 } } } } } } } } }) });
    const body = await response.json() as Record<string, unknown>;
    if (!response.ok) throw new Error(`OpenAI extraction failed (${response.status}).`);
    return normalize(JSON.parse(outputText(body)) as ModelPayload, model);
  }
}
