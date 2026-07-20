/**
 * OpenAI Alph provider stub — env-gated.
 * Never returns fabricated model completions when the key is missing.
 */

import { getServerSecret } from "@/lib/security/secrets";
import type {
  AlphModelProvider,
  AlphProviderChunk,
  AlphProviderRequest,
} from "@/lib/alph/providers/types";

function configured(): boolean {
  return Boolean(getServerSecret("OPENAI_API_KEY"));
}

export const openaiAlphProvider: AlphModelProvider = {
  id: "openai",
  displayName: "OpenAI",
  async *stream(request: AlphProviderRequest): AsyncGenerator<AlphProviderChunk> {
    if (!configured()) {
      yield {
        type: "error",
        error:
          "OpenAI is not configured. Set OPENAI_API_KEY. Alph will not fake live LLM results.",
      };
      return;
    }
    yield {
      type: "error",
      error:
        "OpenAI adapter not implemented yet (Phase B). Key detected but completion refused rather than faked.",
      model: "gpt-not-wired",
    };
    void request;
  },
  async complete(request) {
    if (!configured()) {
      return {
        text: "OpenAI is not configured. Set OPENAI_API_KEY. No live completion was generated.",
        model: "unconfigured",
      };
    }
    void request;
    return {
      text: "OpenAI adapter not implemented yet (Phase B). Key present but completion refused rather than faked.",
      model: "gpt-not-wired",
    };
  },
};
