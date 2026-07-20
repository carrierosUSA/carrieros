import { anthropicAlphProvider } from "@/lib/alph/providers/anthropic";
import { mockAlphProvider } from "@/lib/alph/providers/mock";
import { openaiAlphProvider } from "@/lib/alph/providers/openai";
import {
  resolveAlphProviderConfig,
  resolveAlphProviderSetup,
} from "@/lib/alph/providers/env";
import type {
  AlphModelProvider,
  AlphProviderConfig,
  AlphProviderId,
} from "@/lib/alph/providers/types";

const providers: Partial<Record<AlphProviderId, AlphModelProvider>> = {
  mock: mockAlphProvider,
  openai: openaiAlphProvider,
  anthropic: anthropicAlphProvider,
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
  config?: AlphProviderConfig,
): AlphModelProvider {
  const resolved = config ?? resolveAlphProviderConfig();
  const setup = resolveAlphProviderSetup();
  // Prefer env-resolved active provider; never silently claim a live vendor.
  const primaryId = config?.primary ?? setup.active;
  const primary = providers[primaryId];
  if (primary && (primaryId === "mock" || setup.configured || primaryId === setup.active)) {
    return primary;
  }
  if (resolved.fallback) {
    const fallback = providers[resolved.fallback];
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
export {
  resolveAlphProviderConfig,
  resolveAlphProviderSetup,
  resolveAlphOcrSetup,
  type AlphProviderSetupState,
  type AlphOcrSetupState,
} from "@/lib/alph/providers/env";
export { openaiAlphProvider } from "@/lib/alph/providers/openai";
export { anthropicAlphProvider } from "@/lib/alph/providers/anthropic";
