import "server-only";

import { redirect } from "next/navigation";
import {
  deriveVerifiedSupabaseIdentity,
  type VerifiedSupabaseIdentity,
} from "@/lib/auth/supabase-claims";
import { getSupabaseCookieClient } from "@/lib/supabase/ssr";

export type VerifiedSupabaseAuth = VerifiedSupabaseIdentity & {
  accessToken: string;
};

export type SupabaseAuthResult =
  | { ok: true; auth: VerifiedSupabaseAuth }
  | {
      ok: false;
      reason:
        | "unauthenticated"
        | "missing_company"
        | "invalid_company"
        | "missing_role"
        | "unauthorized_role"
        | "missing_session";
    };

export async function resolveVerifiedSupabaseAuth(): Promise<SupabaseAuthResult> {
  const supabase = await getSupabaseCookieClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false, reason: "unauthenticated" };

  const identityResult = deriveVerifiedSupabaseIdentity(user);
  if (!identityResult.ok) return identityResult;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token || session.user.id !== user.id) {
    return { ok: false, reason: "missing_session" };
  }

  return {
    ok: true,
    auth: { ...identityResult.identity, accessToken: session.access_token },
  };
}

export function authFailurePath(result: Exclude<SupabaseAuthResult, { ok: true }>) {
  if (result.reason === "missing_company" || result.reason === "invalid_company") {
    return "/auth/missing-company";
  }
  if (result.reason === "missing_role" || result.reason === "unauthorized_role") {
    return "/auth/unauthorized";
  }
  return "/login";
}

export async function requireDocumentAuth(): Promise<VerifiedSupabaseAuth> {
  const result = await resolveVerifiedSupabaseAuth();
  if (!result.ok) redirect(authFailurePath(result));
  return result.auth;
}
