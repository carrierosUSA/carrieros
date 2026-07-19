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
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              {eyebrow}
            </p>
            <h1 className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-[#111827] sm:text-[24px]">
              {title}
            </h1>
            <p className="mt-1 text-[14px] text-[#6B7280]">{subtitle}</p>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
        {children}
      </div>
    </div>
  );
}
