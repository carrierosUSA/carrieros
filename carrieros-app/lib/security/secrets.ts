/**
 * Server-side secret hygiene helpers.
 *
 * HARD RULES:
 * - Never put service-role / DB / payment secrets in NEXT_PUBLIC_* env vars.
 * - Never import this module from Client Components for the purpose of reading secrets.
 * - getServerSecret refuses NEXT_PUBLIC_* names.
 *
 * @see docs/architecture/security/04-api-files-secrets.md
 */

/** Env var names that must never be exposed via NEXT_PUBLIC_*. */
export const SERVER_ONLY_SECRET_NAMES = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
  "DATABASE_URL",
  "DIRECT_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "AWS_SECRET_ACCESS_KEY",
  "S3_SECRET_ACCESS_KEY",
  "SMTP_PASSWORD",
  "WEBHOOK_SIGNING_SECRET",
  "CRON_SECRET",
] as const;

export type ServerOnlySecretName = (typeof SERVER_ONLY_SECRET_NAMES)[number];

/**
 * Read a server-only secret. Throws if the name is a NEXT_PUBLIC_* key.
 * Returns undefined when unset (callers decide whether that is fatal).
 */
export function getServerSecret(name: string): string | undefined {
  if (name.startsWith("NEXT_PUBLIC_")) {
    throw new Error(
      `Refusing to treat ${name} as a server secret. Use a non-public env var.`,
    );
  }
  const value = process.env[name];
  if (value === undefined || value === "") return undefined;
  return value;
}

/**
 * Dev/ops hygiene check: warn (do not throw) if a secret appears to be
 * mirrored under NEXT_PUBLIC_*. Safe to call from health / server boot.
 */
export function warnIfPublicSecretLeak(
  log: (message: string) => void = console.error,
): string[] {
  const leaks: string[] = [];
  for (const name of SERVER_ONLY_SECRET_NAMES) {
    const publicName = `NEXT_PUBLIC_${name}`;
    if (process.env[publicName]) {
      leaks.push(publicName);
      log(
        `[security] FATAL HYGIENE: ${publicName} is set. Remove it — secrets must never ship to the browser.`,
      );
    }
  }
  return leaks;
}

/** True when any known secret is incorrectly exposed as NEXT_PUBLIC_*. */
export function hasPublicSecretLeak(): boolean {
  return warnIfPublicSecretLeak(() => {}).length > 0;
}
