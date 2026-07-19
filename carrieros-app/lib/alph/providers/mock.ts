import type {
  AlphModelProvider,
  AlphProviderChunk,
  AlphProviderRequest,
} from "@/lib/alph/providers/types";

/**
 * Deterministic mock provider for localhost / tests.
 * Does not call external networks.
 */
export const mockAlphProvider: AlphModelProvider = {
  id: "mock",
  displayName: "Alph Mock Provider",

  async *stream(request: AlphProviderRequest): AsyncGenerator<AlphProviderChunk> {
    const lastUser = [...request.messages]
      .reverse()
      .find((m) => m.role === "user");
    const text = buildMockReply(lastUser?.content ?? "");
    const parts = text.split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;
      yield { type: "token", text: part, model: "mock-alph-v1" };
    }
    yield { type: "done", model: "mock-alph-v1" };
  },

  async complete(request: AlphProviderRequest) {
    const lastUser = [...request.messages]
      .reverse()
      .find((m) => m.role === "user");
    return {
      text: buildMockReply(lastUser?.content ?? ""),
      model: "mock-alph-v1",
    };
  },
};

function buildMockReply(prompt: string): string {
  const q = prompt.trim() || "your question";
  return [
    `Here is what I found regarding “${q.slice(0, 120)}”.`,
    "",
    "Fact: I used only your authorized company data and permissions.",
    "Recommendation: Review the cited records before taking action.",
    "",
    "Alph assists — you decide. I will not finalize critical actions without your confirmation.",
  ].join("\n");
}
