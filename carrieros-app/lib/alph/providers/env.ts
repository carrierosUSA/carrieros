/**
 * Env-gated Alph model + OCR provider resolution.
 * Never pretends a live LLM/OCR vendor is active without credentials.
 */

import { getServerSecret } from "@/lib/security/secrets";
import type { AlphProviderConfig, AlphProviderId } from "@/lib/alph/providers/types";
import type { AlphOcrProviderId } from "@/lib/alph/ocr/types";

export type AlphProviderSetupState = {
  requested: AlphProviderId;
  active: AlphProviderId;
  configured: boolean;
  message: string;
};

export type AlphOcrSetupState = {
  requested: AlphOcrProviderId;
  active: AlphOcrProviderId;
  configured: boolean;
  isDemo: boolean;
  message: string;
};

function envProviderId(): AlphProviderId {
  const raw = (process.env.ALPH_PRIMARY_PROVIDER ?? "mock")
    .trim()
    .toLowerCase();
  if (
    raw === "openai" ||
    raw === "anthropic" ||
    raw === "azure_openai" ||
    raw === "mock"
  ) {
    return raw;
  }
  return "mock";
}

function envOcrProviderId(): AlphOcrProviderId {
  const raw = (process.env.ALPH_OCR_PROVIDER ?? "demo").trim().toLowerCase();
  if (raw === "veryfi" || raw === "azure_form_recognizer" || raw === "demo") {
    return raw;
  }
  return "demo";
}

export function isAlphModelProviderConfigured(id: AlphProviderId): boolean {
  switch (id) {
    case "mock":
      return true;
    case "openai":
      return Boolean(getServerSecret("OPENAI_API_KEY"));
    case "anthropic":
      return Boolean(getServerSecret("ANTHROPIC_API_KEY"));
    case "azure_openai":
      return Boolean(
        getServerSecret("AZURE_OPENAI_API_KEY") &&
          process.env.AZURE_OPENAI_ENDPOINT,
      );
    default:
      return false;
  }
}

export function isAlphOcrProviderConfigured(id: AlphOcrProviderId): boolean {
  switch (id) {
    case "demo":
      return true;
    case "veryfi":
      return Boolean(
        getServerSecret("VERYFI_CLIENT_ID") &&
          getServerSecret("VERYFI_CLIENT_SECRET"),
      );
    case "azure_form_recognizer":
      return Boolean(
        getServerSecret("AZURE_FORM_RECOGNIZER_KEY") &&
          process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
      );
    default:
      return false;
  }
}

/**
 * Resolve which model provider may run.
 * Unconfigured vendor → mock with clear setup message (never fake OpenAI output).
 */
export function resolveAlphProviderSetup(): AlphProviderSetupState {
  const requested = envProviderId();
  if (requested === "mock") {
    return {
      requested,
      active: "mock",
      configured: true,
      message:
        "Using deterministic mock Alph language provider (demo). Set ALPH_PRIMARY_PROVIDER + API keys for live models.",
    };
  }
  if (isAlphModelProviderConfigured(requested)) {
    return {
      requested,
      active: requested,
      configured: true,
      message: `Live Alph model provider: ${requested}`,
    };
  }
  return {
    requested,
    active: "mock",
    configured: false,
    message: `${requested} is not configured (missing server secrets). Alph will not pretend live LLM results — using labeled mock provider.`,
  };
}

export function resolveAlphProviderConfig(): AlphProviderConfig {
  const setup = resolveAlphProviderSetup();
  return { primary: setup.active, fallback: "mock" };
}

export function resolveAlphOcrSetup(): AlphOcrSetupState {
  const requested = envOcrProviderId();
  if (requested === "demo") {
    return {
      requested,
      active: "demo",
      configured: true,
      isDemo: true,
      message:
        "Demo OCR: deterministic seed parsers from filename/content heuristics. Not live OCR.",
    };
  }
  if (isAlphOcrProviderConfigured(requested)) {
    return {
      requested,
      active: requested,
      configured: true,
      isDemo: false,
      message: `Live OCR provider: ${requested}`,
    };
  }
  return {
    requested,
    active: "demo",
    configured: false,
    isDemo: true,
    message: `${requested} is not configured. Showing labeled demo extraction — not live OCR.`,
  };
}

/** Extend secrets hygiene list for OCR / Azure. */
export const ALPH_OPTIONAL_SECRET_NAMES = [
  "AZURE_OPENAI_API_KEY",
  "VERYFI_CLIENT_ID",
  "VERYFI_CLIENT_SECRET",
  "AZURE_FORM_RECOGNIZER_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "SENDGRID_API_KEY",
] as const;
