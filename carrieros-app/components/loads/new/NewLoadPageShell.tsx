import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

type NewLoadPageShellProps = {
  children: React.ReactNode;
};

export default function NewLoadPageShell({ children }: NewLoadPageShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-[#F5F7FA]">
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6">
        <FadeIn>
          <Link
            href="/loads"
            className="text-[13px] font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
          >
            ← Back to Dispatch
          </Link>

          <header className="mt-3 mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Operations
            </p>
            <h1 className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-slate-950">
              New Load
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Create a complete load in under 60 seconds — smart auto-fill and Alph rate con
              extraction included.
            </p>
          </header>

          {children}
        </FadeIn>
      </div>
    </div>
  );
}
