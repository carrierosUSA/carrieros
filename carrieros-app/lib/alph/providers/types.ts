/**
 * Model provider abstraction — business logic must not lock to one vendor.
 */

export type AlphProviderId = "mock" | "openai" | "anthropic" | "azure_openai";

export type AlphProviderMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AlphProviderRequest = {
  requestId: string;
  messages: AlphProviderMessage[];
  /** Soft token budget hint. */
  maxTokens?: number;
};

export type AlphProviderChunk = {
  type: "token" | "done" | "error";
  text?: string;
  error?: string;
  model?: string;
};

export interface AlphModelProvider {
  id: AlphProviderId;
  displayName: string;
  /**
   * Stream a completion. Providers never execute tools or approvals —
   * orchestration owns that.
   */
  stream(request: AlphProviderRequest): AsyncGenerator<AlphProviderChunk>;
  /** Non-streaming helper. */
  complete(request: AlphProviderRequest): Promise<{ text: string; model: string }>;
}

export type AlphProviderConfig = {
  primary: AlphProviderId;
  fallback?: AlphProviderId;
};
