type OperationalPageShellProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export default function OperationalPageShell({
  title,
  subtitle,
  eyebrow = "Operations",
  action,
  children,
}: OperationalPageShellProps) {
  return (
    <div className="min-h-screen rounded-[2rem] bg-[#f6f8fb] p-5 text-slate-950 shadow-2xl shadow-black/20 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white px-6 py-5 shadow-[0_16px_55px_rgba(15,23,42,0.07)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
        {children}
      </div>
    </div>
  );
}
