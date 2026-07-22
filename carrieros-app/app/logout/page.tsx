import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import { getSupabaseCookieClient } from "@/lib/supabase/ssr";

export default async function LogoutPage() {
  const supabase = await getSupabaseCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-12">
      <section className="w-full rounded-[20px] bg-white p-6 ring-1 ring-[#E2E8F0] sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
          Sign out?
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-[#64748B]">
          This ends the authenticated Transpo.ai session on this device.
        </p>
        <form action={logoutAction} className="mt-6">
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-[12px] bg-[#DC2626] px-4 text-[14px] font-semibold text-white"
          >
            Sign out
          </button>
        </form>
        <Link href="/documents" className="mt-5 inline-flex text-[13px] font-semibold text-[#2563EB]">
          Cancel
        </Link>
      </section>
    </main>
  );
}
