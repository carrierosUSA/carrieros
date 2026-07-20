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
