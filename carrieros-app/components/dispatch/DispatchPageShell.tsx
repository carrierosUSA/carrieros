import Link from "next/link";

type DispatchPageShellProps = {
  action?: React.ReactNode;
  meta?: React.ReactNode;
  variant?: "board" | "detail";
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export default function DispatchPageShell({
  action,
  meta,
  variant = "board",
  title = "Dispatch",
  subtitle = "Every load. One calm screen.",
  eyebrow = "Operations Center",
  children,
}: DispatchPageShellProps) {
  const isBoard = variant === "board";

  return (
    <div
      className={
        isBoard
          ? "flex h-[calc(100vh-88px)] min-h-[640px] w-full flex-col text-[#111827]"
          : "w-full text-[#111827]"
      }
    >
      <header className="mb-3 flex shrink-0 items-center justify-between gap-4 border-b border-[#E5E7EB] pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isBoard ? (
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
            ) : null}
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {eyebrow}
            </p>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-[22px] font-semibold leading-none tracking-[-0.03em] text-slate-950">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-[13px] text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          {meta ? (
            <div className="mt-1.5 text-[12px] text-slate-500">{meta}</div>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className={isBoard ? "min-h-0 flex-1" : ""}>{children}</div>
    </div>
  );
}

export function DispatchNewLoadButton() {
  return (
    <Link
      href="/loads/new"
      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-[13px] font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-600"
    >
      <span className="text-base leading-none">+</span>
      New Load
    </Link>
  );
}
