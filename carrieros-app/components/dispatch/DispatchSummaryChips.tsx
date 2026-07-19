import type { DispatchSummaryStats } from "@/lib/dispatch/load-board";

type DispatchSummaryChipsProps = {
  stats: DispatchSummaryStats;
};

/** Compact secondary strip — primary stats live in DispatchOperationsHeader. */
export default function DispatchSummaryChips({ stats }: DispatchSummaryChipsProps) {
  const alerts = [
    stats.late > 0 ? `${stats.late} late` : null,
    stats.unassigned > 0 ? `${stats.unassigned} unassigned` : null,
    stats.missingPod > 0 ? `${stats.missingPod} missing POD` : null,
  ].filter(Boolean);

  if (alerts.length === 0) {
    return (
      <div className="flex shrink-0 items-center gap-2 bg-[#ECFDF3] px-4 py-2 text-[13px] font-medium text-[#16A34A] lg:px-5">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
        All loads on track — no critical alerts
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 bg-[#FFF7ED] px-4 py-2 lg:px-5">
      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#EA580C]">
        Attention
      </span>
      {alerts.map((alert) => (
        <span
          key={alert}
          className="inline-flex h-7 items-center rounded-[8px] bg-white px-2.5 text-[13px] font-semibold text-[#EA580C]"
        >
          {alert}
        </span>
      ))}
    </div>
  );
}
