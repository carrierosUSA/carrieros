import "server-only";

import {
  createOpenAiDocumentExtractionRequest,
  parseOpenAiDocumentExtractionResponse,
} from "@/lib/alph/document-intake/openai-request";
import type {
  DocumentExtraction,
  DocumentExtractionAdapter,
  DocumentUpload,
} from "@/lib/alph/document-intake/types";
import { getServerSecret } from "@/lib/security/secrets";

export class OpenAiDocumentExtractionAdapter
  implements DocumentExtractionAdapter
{
  readonly id = "openai";

  async extract(input: DocumentUpload): Promise<DocumentExtraction> {
    const apiKey = getServerSecret("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OpenAI document extraction is not configured.");
    }

    const model = process.env.ALPH_DOCUMENT_MODEL ?? "gpt-5.4";
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        createOpenAiDocumentExtractionRequest(input, model),
      ),
    });
    const body = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      throw new Error(`OpenAI extraction failed (${response.status}).`);
    }
    return parseOpenAiDocumentExtractionResponse(body, model);
  }
}
