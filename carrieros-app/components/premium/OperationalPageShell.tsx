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
    <div className="w-full rounded-[16px] bg-white p-4 text-[#111827] sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1560px] space-y-4">
        <header className="flex flex-col gap-4 rounded-[16px] border border-[#DDE2EA] bg-[#F5F7FA] px-5 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
              {eyebrow}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
              {title}
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
        {children}
      </div>
    </div>
  );
}
