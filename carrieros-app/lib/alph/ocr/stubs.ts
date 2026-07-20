/**
 * Real OCR vendor stubs — return not_configured when secrets are missing.
 * Never fabricate vendor extraction results.
 */

import { isAlphOcrProviderConfigured } from "@/lib/alph/providers/env";
import type {
  AlphOcrExtractInput,
  AlphOcrExtractResult,
  AlphOcrProvider,
} from "@/lib/alph/ocr/types";
import { demoAlphOcrProvider } from "@/lib/alph/ocr/demo";

function notConfiguredResult(
  providerId: AlphOcrProvider["id"],
  input: AlphOcrExtractInput,
  message: string,
): AlphOcrExtractResult {
  return {
    providerId,
    isDemoExtraction: false,
    status: "not_configured",
    statusMessage: message,
    fileName: input.fileName,
    category: input.categoryHint ?? "miscellaneous",
    extractedAt: new Date().toISOString(),
    ocrText: "",
    fields: [],
    overallConfidence: 0,
    suggestedLinks: {},
    suggestedTags: [],
    issues: [
      {
        code: "unreadable",
        message,
      },
    ],
    originalFileName: input.fileName,
  };
}

export const veryfiAlphOcrProvider: AlphOcrProvider = {
  id: "veryfi",
  displayName: "Veryfi",
  getStatus() {
    return isAlphOcrProviderConfigured("veryfi")
      ? "ready"
      : "not_configured";
  },
  statusMessage() {
    return isAlphOcrProviderConfigured("veryfi")
      ? "Veryfi configured"
      : "Veryfi not configured. Set VERYFI_CLIENT_ID and VERYFI_CLIENT_SECRET.";
  },
  async extract(input) {
    if (!isAlphOcrProviderConfigured("veryfi")) {
      return notConfiguredResult(
        "veryfi",
        input,
        "Veryfi OCR is not configured. No live extraction was performed.",
      );
    }
    // Live SDK wiring is Phase B — refuse to fake results even with keys present
    // until the adapter is implemented.
    return notConfiguredResult(
      "veryfi",
      input,
      "Veryfi adapter not implemented yet (Phase B). Keys detected but extraction refused rather than faked.",
    );
  },
};

export const azureFormRecognizerOcrProvider: AlphOcrProvider = {
  id: "azure_form_recognizer",
  displayName: "Azure Form Recognizer",
  getStatus() {
    return isAlphOcrProviderConfigured("azure_form_recognizer")
      ? "ready"
      : "not_configured";
  },
  statusMessage() {
    return isAlphOcrProviderConfigured("azure_form_recognizer")
      ? "Azure Form Recognizer configured"
      : "Azure Form Recognizer not configured. Set AZURE_FORM_RECOGNIZER_KEY + ENDPOINT.";
  },
  async extract(input) {
    if (!isAlphOcrProviderConfigured("azure_form_recognizer")) {
      return notConfiguredResult(
        "azure_form_recognizer",
        input,
        "Azure Form Recognizer is not configured. No live extraction was performed.",
      );
    }
    return notConfiguredResult(
      "azure_form_recognizer",
      input,
      "Azure Form Recognizer adapter not implemented yet (Phase B). Keys detected but extraction refused rather than faked.",
    );
  },
};

/** Fallback helper: when vendor not configured, optionally use labeled demo. */
export async function extractWithFallback(
  preferred: AlphOcrProvider,
  input: AlphOcrExtractInput,
  allowDemo: boolean,
): Promise<AlphOcrExtractResult> {
  const result = await preferred.extract(input);
  if (result.status === "not_configured" && allowDemo) {
    const demo = await demoAlphOcrProvider.extract(input);
    return {
      ...demo,
      statusMessage: `${result.statusMessage} Falling back to labeled demo extraction.`,
    };
  }
  return result;
}
