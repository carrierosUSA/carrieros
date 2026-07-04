type DashboardPanelProps = {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function DashboardPanel({
  title,
  eyebrow,
  action,
  children,
  className = "",
}: DashboardPanelProps) {
  return (
    <section
      className={`h-full rounded-[16px] border border-[#DDE2EA] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_36px_rgba(37,99,235,0.1)] ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-[#111827]">
            {title}
          </h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
