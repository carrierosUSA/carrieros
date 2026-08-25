import "server-only";

import { hasPublicSecretLeak } from "@/lib/security/secrets";
import { evaluateCoreConfiguration } from "@/lib/system/config-validation";

export type ReadinessCheck = {
  label: string;
  configured: boolean;
  detail: string;
};

export function getSystemReadiness(): {
  checks: ReadinessCheck[];
  readyForControlledTesting: boolean;
  publicSecretLeak: boolean;
} {
  const configuration = evaluateCoreConfiguration(process.env);
  const checks: ReadinessCheck[] = [
    {
      label: "Supabase project URL",
      configured: configuration.supabaseUrl,
      detail: "Required for authenticated development access.",
    },
    {
      label: "Supabase anonymous key",
      configured: configuration.supabaseAnonKey,
      detail: "Public client credential; database RLS remains authoritative.",
    },
    {
      label: "Supabase service role",
      configured: configuration.supabaseServiceRole,
      detail: "Server-only credential used by controlled document storage workflows.",
    },
    {
      label: "OpenAI document extraction",
      configured: configuration.openAiKey,
      detail: "Server-only credential for document extraction and assistive AI.",
    },
    {
      label: "Private document bucket",
      configured: configuration.documentBucket,
      detail: "Required destination for company-isolated document intake.",
    },
  ];
  const publicSecretLeak = hasPublicSecretLeak();
  return {
    checks,
    readyForControlledTesting: checks.every((check) => check.configured) && !publicSecretLeak,
    publicSecretLeak,
  };
}
