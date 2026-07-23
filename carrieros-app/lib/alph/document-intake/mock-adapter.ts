import type { DocumentExtraction, DocumentExtractionAdapter, DocumentUpload } from "@/lib/alph/document-intake/types";

/** Content-driven test adapter. It never claims OCR and is not enabled in production. */
export class MockDocumentExtractionAdapter implements DocumentExtractionAdapter {
  readonly id = "mock";
  async extract(input: DocumentUpload): Promise<DocumentExtraction> {
    if (process.env.NODE_ENV === "production") throw new Error("Mock document extraction is disabled in production.");
    const text = new TextDecoder().decode(input.bytes).slice(0, 20_000);
    const lower = text.toLowerCase();
    const category = lower.includes("rate confirmation") ? "rate_confirmation" : lower.includes("proof of delivery") ? "pod" : lower.includes("bill of lading") ? "bol" : lower.includes("lumper") ? "lumper_receipt" : lower.includes("fuel") ? "fuel_receipt" : lower.includes("invoice") ? "invoice" : "miscellaneous";
    return { category, rawText: text, fields: [], overallConfidence: category === "miscellaneous" ? 0.2 : 0.8, provider: "mock", modelId: "content-fixture", promptVersion: "mock-v1" };
  }
}
