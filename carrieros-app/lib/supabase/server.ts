import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerSecret } from "@/lib/security/secrets";
import type { Database } from "@/lib/supabase/database.types";

export function getSupabaseServerClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = getServerSecret("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) throw new Error("Supabase server configuration is missing.");
  return createClient<Database>(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getSupabaseAuthenticatedUserClient(
  accessToken: string,
): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = accessToken.trim();
  if (!url || !anonKey || !token) {
    throw new Error("Authenticated Supabase user configuration is missing.");
  }
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}
