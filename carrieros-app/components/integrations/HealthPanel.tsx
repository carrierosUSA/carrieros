import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type { IntegrationHealthSummary } from "@/lib/integrations/types";

type HealthPanelProps = {
  summary: IntegrationHealthSummary;
};

const chips = [
  {
    key: "connected" as const,
    label: "Connected",
    colors: CARRIEROS_COLORS.success,
  },
  {
    key: "error" as const,
    label: "Needs attention",
    colors: CARRIEROS_COLORS.critical,
  },
  {
    key: "pending" as const,
    label: "Pending",
    colors: CARRIEROS_COLORS.warning,
  },
  {
    key: "disconnected" as const,
    label: "Disconnected",
    colors: CARRIEROS_COLORS.disabled,
  },
];

export default function HealthPanel({ summary }: HealthPanelProps) {
  return (
    <section className="rounded-[16px] bg-[#F8FAFC] p-5 ring-1 ring-[#EAEAEA]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">
            Health overview
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Live status across enabled partners — last sync, latency, and
            success rate.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-[12px] font-medium text-slate-400">Enabled</p>
            <p className="text-[22px] font-bold tracking-tight text-slate-900">
              {summary.enabled}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-slate-400">
              Avg success
            </p>
            <p className="text-[22px] font-bold tracking-tight text-slate-900">
              {summary.avgSuccessRate != null
                ? `${summary.avgSuccessRate}%`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-slate-400">
              Avg latency
            </p>
            <p className="text-[22px] font-bold tracking-tight text-slate-900">
              {summary.avgLatencyMs != null
                ? `${summary.avgLatencyMs}ms`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.key}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1 ${chip.colors.bg} ${chip.colors.text} ${chip.colors.border}`}
          >
            <span className="tabular-nums">{summary[chip.key]}</span>
            {chip.label}
          </span>
        ))}
      </div>
    </section>
  );
}
