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
      className={`rounded-[1.75rem] border border-slate-200/75 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.055)] ${className}`}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">
            {title}
          </h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
