export default function Loading() {
  return <main className="grid min-h-screen place-items-center bg-[#F5F7FB] p-5" aria-live="polite" aria-busy="true"><section className="w-full max-w-lg rounded-[24px] border bg-white p-8 text-center"><div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-[#2563EB]"/><p className="mt-4 text-sm font-semibold text-[#0F172A]">Loading verified workspace…</p><p className="mt-2 text-xs text-[#64748B]">No action is performed while this screen loads.</p></section></main>;
}
