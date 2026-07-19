import type {
  IntegrationAuthMode,
  IntegrationProviderId,
  IntegrationStatus,
} from "./types";

/**
 * Provider adapter stubs — connect/disconnect/testConnection.
 * No live network calls; demo-safe for the Integration Center UI.
 */

export type ConnectInput = {
  providerId: IntegrationProviderId;
  mode: IntegrationAuthMode;
  /** Raw demo key from the modal — never persisted unmasked. */
  apiKey?: string;
  accountLabel?: string;
};

export type ConnectResult = {
  ok: boolean;
  status: IntegrationStatus;
  message: string;
  apiKeyMasked?: string;
  accountLabel?: string;
};

export type TestConnectionResult = {
  ok: boolean;
  latencyMs: number;
  message: string;
};

function maskApiKey(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length <= 4) return "••••";
  return `${trimmed.slice(0, 3)}••••••••${trimmed.slice(-4)}`;
}

function simulateLatency(): number {
  return 80 + Math.floor(Math.random() * 220);
}

export async function connectIntegration(
  input: ConnectInput,
): Promise<ConnectResult> {
  await delay(420);

  if (input.mode === "api_key") {
    const key = input.apiKey?.trim() ?? "";
    if (key.length < 8) {
      return {
        ok: false,
        status: "error",
        message: "Enter a valid API key (at least 8 characters) to connect.",
      };
    }
    return {
      ok: true,
      status: "connected",
      message: "Connected successfully.",
      apiKeyMasked: maskApiKey(key),
      accountLabel: input.accountLabel?.trim() || undefined,
    };
  }

  // OAuth stub — simulate authorize redirect success.
  return {
    ok: true,
    status: "connected",
    message: "OAuth authorization completed (demo).",
    accountLabel:
      input.accountLabel?.trim() || `${input.providerId} demo account`,
  };
}

export async function disconnectIntegration(
  providerId: IntegrationProviderId,
): Promise<{ ok: true; message: string }> {
  void providerId;
  await delay(280);
  return { ok: true, message: "Disconnected." };
}

export async function testConnection(
  providerId: IntegrationProviderId,
): Promise<TestConnectionResult> {
  void providerId;
  await delay(360);
  const latencyMs = simulateLatency();
  const ok = latencyMs < 280;
  return {
    ok,
    latencyMs,
    message: ok
      ? `Connection healthy · ${latencyMs}ms`
      : `Slow response · ${latencyMs}ms — check provider status`,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}
