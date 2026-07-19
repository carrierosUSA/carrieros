import { mockAlphProvider } from "@/lib/alph/providers/mock";
import type {
  AlphModelProvider,
  AlphProviderConfig,
  AlphProviderId,
} from "@/lib/alph/providers/types";

const providers: Partial<Record<AlphProviderId, AlphModelProvider>> = {
  mock: mockAlphProvider,
};

export function registerAlphProvider(provider: AlphModelProvider): void {
  providers[provider.id] = provider;
}

export function getAlphProvider(id: AlphProviderId): AlphModelProvider {
  const provider = providers[id];
  if (!provider) {
    // Fallback strategy — never fail closed on missing vendor; use mock.
    return mockAlphProvider;
  }
  return provider;
}

export function resolveAlphProvider(
  config: AlphProviderConfig = { primary: "mock", fallback: "mock" },
): AlphModelProvider {
  const primary = providers[config.primary];
  if (primary) return primary;
  if (config.fallback) {
    const fallback = providers[config.fallback];
    if (fallback) return fallback;
  }
  return mockAlphProvider;
}

export type {
  AlphModelProvider,
  AlphProviderChunk,
  AlphProviderConfig,
  AlphProviderId,
  AlphProviderMessage,
  AlphProviderRequest,
} from "@/lib/alph/providers/types";
export { mockAlphProvider } from "@/lib/alph/providers/mock";
