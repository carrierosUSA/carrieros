"use server";

import { redirect } from "next/navigation";
import { deriveVerifiedSupabaseIdentity } from "@/lib/auth/supabase-claims";
import { getSupabaseCookieClient } from "@/lib/supabase/ssr";

function safeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return "/documents";
  }

  try {
    const base = new URL("https://transpo.local");
    const destination = new URL(value, base);
    const isDocumentPath =
      destination.pathname === "/documents" ||
      destination.pathname.startsWith("/documents/");
    if (destination.origin !== base.origin || !isDocumentPath) {
      return "/documents";
    }
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/documents";
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const next = safeNextPath(formData.get("next"));
  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/login?error=invalid_credentials");
  }

  const supabase = await getSupabaseCookieClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=invalid_credentials");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
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
