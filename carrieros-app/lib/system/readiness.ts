import "server-only";

import { hasPublicSecretLeak } from "@/lib/security/secrets";

export type ReadinessCheck = {
  label: string;
  configured: boolean;
  detail: string;
};

function configured(name: string): boolean {
  const value = process.env[name]?.trim();
  return Boolean(value && !value.includes("YOUR_") && !value.includes("YOUR_PROJECT"));
}

export function getSystemReadiness(): {
  checks: ReadinessCheck[];
  readyForControlledTesting: boolean;
  publicSecretLeak: boolean;
} {
  const checks: ReadinessCheck[] = [
    {
      label: "Supabase project URL",
      configured: configured("NEXT_PUBLIC_SUPABASE_URL"),
      detail: "Required for authenticated development access.",
    },
    {
      label: "Supabase anonymous key",
      configured: configured("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      detail: "Public client credential; database RLS remains authoritative.",
    },
    {
      label: "Supabase service role",
      configured: configured("SUPABASE_SERVICE_ROLE_KEY"),
      detail: "Server-only credential used by controlled document storage workflows.",
    },
    {
      label: "OpenAI document extraction",
      configured: configured("OPENAI_API_KEY"),
      detail: "Server-only credential for document extraction and assistive AI.",
    },
    {
      label: "Private document bucket",
      configured: configured("ALPH_DOCUMENT_BUCKET"),
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
