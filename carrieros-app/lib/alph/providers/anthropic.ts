/**
 * Anthropic Alph provider stub — env-gated.
 * Never returns fabricated model completions when the key is missing.
 */

import { getServerSecret } from "@/lib/security/secrets";
import type {
  AlphModelProvider,
  AlphProviderChunk,
  AlphProviderRequest,
} from "@/lib/alph/providers/types";

function configured(): boolean {
  return Boolean(getServerSecret("ANTHROPIC_API_KEY"));
}

export const anthropicAlphProvider: AlphModelProvider = {
  id: "anthropic",
  displayName: "Anthropic",
  async *stream(request: AlphProviderRequest): AsyncGenerator<AlphProviderChunk> {
    if (!configured()) {
      yield {
        type: "error",
        error:
          "Anthropic is not configured. Set ANTHROPIC_API_KEY. Alph will not fake live LLM results.",
      };
      return;
    }
    yield {
      type: "error",
      error:
        "Anthropic adapter not implemented yet (Phase B). Key detected but completion refused rather than faked.",
      model: "claude-not-wired",
    };
    void request;
  },
  async complete(request) {
    if (!configured()) {
      return {
        text: "Anthropic is not configured. Set ANTHROPIC_API_KEY. No live completion was generated.",
        model: "unconfigured",
      };
    }
    void request;
    return {
      text: "Anthropic adapter not implemented yet (Phase B). Key present but completion refused rather than faked.",
      model: "claude-not-wired",
    };
  },
};
