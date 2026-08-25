import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { requireDocumentAuth } from "@/lib/auth/supabase-server";
import { getSystemReadiness } from "@/lib/system/readiness";

export const dynamic = "force-dynamic";

export default async function SystemReadinessPage() {
  const auth = await requireDocumentAuth();
  if (!new Set(["super_admin", "owner"]).has(auth.businessRole)) redirect("/auth/unauthorized");
  const readiness = getSystemReadiness();
  const configuredCount = readiness.checks.filter((check) => check.configured).length;

  return <main className="min-h-screen bg-[#F5F7FB] text-[#0B1220]">
    <Sidebar />
    <section className="min-h-screen px-4 pb-8 pt-20 lg:ml-72 lg:px-8 lg:py-7 xl:px-10">
      <div className="mx-auto max-w-[1100px]">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#2563EB]">Owner control</p>
          <h1 className="mt-2 text-[34px] font-semibold">System readiness</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">A value-free configuration check for controlled development testing. Credentials, tokens, URLs, and secret values are never displayed.</p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-[.75fr_1.25fr]">
          <div className={`rounded-[22px] p-6 text-white ${readiness.readyForControlledTesting ? "bg-[#065F46]" : "bg-[#0F172A]"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#93C5FD]">Development gate</p>
            <h2 className="mt-3 text-2xl font-semibold">{readiness.readyForControlledTesting ? "Configuration ready" : "Setup required"}</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">{configuredCount} of {readiness.checks.length} required configuration groups detected.</p>
            <div className="mt-6 rounded-xl bg-white/10 p-4 text-xs leading-5">This page does not connect to production, apply migrations, create users, send messages, or change operational data.</div>
          </div>

          <div className="rounded-[22px] border border-[#DDE5F0] bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-base font-semibold">Configuration checks</h2><p className="mt-1 text-xs text-[#64748B]">Presence only—values stay server-side.</p></div>
              <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-[10px] font-semibold text-[#1D4ED8]">Owner only</span>
            </div>
            <div className="mt-4 divide-y divide-[#E2E8F0]">
              {readiness.checks.map((check) => <div key={check.label} className="flex items-start justify-between gap-4 py-4">
                <div><p className="text-sm font-semibold">{check.label}</p><p className="mt-1 text-xs leading-5 text-[#64748B]">{check.detail}</p></div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${check.configured ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#FFF7ED] text-[#9A3412]"}`}>{check.configured ? "configured" : "missing"}</span>
              </div>)}
            </div>
          </div>
        </section>

        <section className={`mt-4 rounded-[22px] border p-5 ${readiness.publicSecretLeak ? "border-[#FCA5A5] bg-[#FEF2F2]" : "border-[#A7F3D0] bg-[#ECFDF5]"}`}>
          <p className={`text-sm font-semibold ${readiness.publicSecretLeak ? "text-[#B91C1C]" : "text-[#047857]"}`}>{readiness.publicSecretLeak ? "Blocked: public secret naming detected" : "Secret exposure check passed"}</p>
          <p className="mt-1 text-xs leading-5 text-[#475569]">{readiness.publicSecretLeak ? "Remove server credentials from NEXT_PUBLIC_* variables before any testing." : "No known server-only credential is mirrored under a NEXT_PUBLIC_* environment variable."}</p>
        </section>
      </div>
    </section>
  </main>;
}
