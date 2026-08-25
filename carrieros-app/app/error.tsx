"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#F5F7FB] p-5"><section role="alert" className="w-full max-w-lg rounded-[24px] border border-[#FECACA] bg-white p-8 text-center shadow-sm"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#B91C1C]">Workspace unavailable</p><h1 className="mt-3 text-2xl font-semibold text-[#0F172A]">Transpo.ai could not load this screen.</h1><p className="mt-3 text-sm leading-6 text-[#64748B]">No operational action was completed. Check your connection and try the authenticated request again.</p><button type="button" onClick={reset} className="mt-6 rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white">Try again</button></section></main>;
}
