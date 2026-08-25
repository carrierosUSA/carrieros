import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#F5F7FB] p-5"><section className="w-full max-w-lg rounded-[24px] border bg-white p-8 text-center"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#2563EB]">404 · Not found</p><h1 className="mt-3 text-2xl font-semibold text-[#0F172A]">This Transpo.ai screen does not exist.</h1><p className="mt-3 text-sm text-[#64748B]">No record was created, changed, dispatched, or deleted.</p><Link href="/" className="mt-6 inline-flex rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white">Return to Command Center</Link></section></main>;
}
