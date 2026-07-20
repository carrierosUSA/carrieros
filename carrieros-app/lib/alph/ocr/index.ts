import { demoAlphOcrProvider } from "@/lib/alph/ocr/demo";
import {
  azureFormRecognizerOcrProvider,
  extractWithFallback,
  veryfiAlphOcrProvider,
} from "@/lib/alph/ocr/stubs";
import type {
  AlphOcrExtractInput,
  AlphOcrExtractResult,
  AlphOcrProvider,
  AlphOcrProviderId,
} from "@/lib/alph/ocr/types";
import { resolveAlphOcrSetup } from "@/lib/alph/providers/env";

const providers: Record<AlphOcrProviderId, AlphOcrProvider> = {
  demo: demoAlphOcrProvider,
  veryfi: veryfiAlphOcrProvider,
  azure_form_recognizer: azureFormRecognizerOcrProvider,
};

export function getAlphOcrProvider(id: AlphOcrProviderId): AlphOcrProvider {
  return providers[id] ?? demoAlphOcrProvider;
}

export function resolveAlphOcrProvider(): AlphOcrProvider {
  const setup = resolveAlphOcrSetup();
  return getAlphOcrProvider(setup.active);
}

export async function runAlphOcrExtract(
  input: AlphOcrExtractInput,
  options?: { allowDemoFallback?: boolean },
): Promise<AlphOcrExtractResult> {
  const setup = resolveAlphOcrSetup();
  const preferred = getAlphOcrProvider(setup.requested);
  const allowDemo = options?.allowDemoFallback ?? true;
  if (setup.requested === "demo" || setup.active === "demo") {
    return demoAlphOcrProvider.extract(input);
  }
  return extractWithFallback(preferred, input, allowDemo);
}

export type {
  AlphOcrExtractInput,
  AlphOcrExtractResult,
  AlphOcrIssue,
  AlphOcrIssueCode,
  AlphOcrProvider,
  AlphOcrProviderId,
  AlphOcrProviderStatus,
} from "@/lib/alph/ocr/types";
export { demoAlphOcrProvider } from "@/lib/alph/ocr/demo";
export { fieldMoney, fieldValue } from "@/lib/alph/ocr/demo";
export {
  azureFormRecognizerOcrProvider,
  veryfiAlphOcrProvider,
} from "@/lib/alph/ocr/stubs";
export { resolveAlphOcrSetup } from "@/lib/alph/providers/env";
