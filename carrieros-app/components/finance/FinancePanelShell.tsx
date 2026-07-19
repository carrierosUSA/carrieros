type FinancePanelShellProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export default function FinancePanelShell({
  title,
  subtitle,
  action,
  children,
}: FinancePanelShellProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-[#111827]">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-[14px] text-[#6B7280]">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

type FinanceEmptyProps = {
  title: string;
  description: string;
};

export function FinanceEmpty({ title, description }: FinanceEmptyProps) {
  return (
    <div className="rounded-[16px] bg-[#F8F9FB] px-6 py-8 text-center">
      <p className="text-[15px] font-semibold text-[#111827]">{title}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280]">{description}</p>
    </div>
  );
}

type MetricBarProps = {
  label: string;
  valueLabel: string;
  percent: number;
  tone?: "info" | "success" | "warning" | "critical";
};

export function MetricBar({
  label,
  valueLabel,
  percent,
  tone = "info",
}: MetricBarProps) {
  const colors = {
    info: "bg-[#2563EB]",
    success: "bg-[#16A34A]",
    warning: "bg-[#EA580C]",
    critical: "bg-[#DC2626]",
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-600">{label}</p>
        <p className="text-[14px] font-bold tabular-nums text-slate-950">
          {valueLabel}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#EEF2F6]">
        <div
          className={`h-full rounded-full ${colors[tone]} transition-all`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
