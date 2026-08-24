"use server";

import { redirect } from "next/navigation";
import { deriveVerifiedSupabaseIdentity } from "@/lib/auth/supabase-claims";
import { safeAppReturnPath } from "@/lib/auth/app-routes";
import { getSupabaseCookieClient } from "@/lib/supabase/ssr";

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const next = safeAppReturnPath(formData.get("next"));
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length > 320 ||
    password.length > 1024
  ) {
    redirect("/login?error=invalid_credentials");
  }

  let supabase: Awaited<ReturnType<typeof getSupabaseCookieClient>>;
  try {
    supabase = await getSupabaseCookieClient();
  } catch {
    redirect("/login?error=configuration");
  }

  let signInFailed = false;
  try {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    signInFailed = Boolean(error);
  } catch {
    redirect("/login?error=service_unavailable");
  }
  if (signInFailed) redirect("/login?error=invalid_credentials");

  let userResult: Awaited<ReturnType<typeof supabase.auth.getUser>>;
  try {
    userResult = await supabase.auth.getUser();
  } catch {
    redirect("/login?error=service_unavailable");
  }
  const { data: { user }, error: userError } = userResult;
  if (userError || !user) redirect("/login?error=invalid_session");

  const identityResult = deriveVerifiedSupabaseIdentity(user);
  if (!identityResult.ok) {
    if (
      identityResult.reason === "missing_company" ||
      identityResult.reason === "invalid_company"
    ) {
      redirect("/auth/missing-company");
    }
    redirect("/auth/unauthorized");
  }

  redirect(next);
}

export async function logoutAction() {
  const supabase = await getSupabaseCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.auth.signOut();
  redirect("/login?status=signed_out");
}
