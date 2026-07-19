import NewLoadPermissionButton from "@/components/dispatch/NewLoadPermissionButton";
import type { DispatchSummaryStats } from "@/lib/dispatch/load-board";

type DispatchOperationsHeaderProps = {
  totalCount: number;
  stats: DispatchSummaryStats;
  visibleCount: number;
  filteredCount: number;
};

const statItems: {
  key: keyof DispatchSummaryStats;
  label: string;
  tone: "info" | "success" | "warning" | "critical" | "muted";
}[] = [
  { key: "active", label: "Active", tone: "info" },
  { key: "pickupToday", label: "Pickups Today", tone: "info" },
  { key: "deliveryToday", label: "Deliveries Today", tone: "success" },
  { key: "late", label: "Late", tone: "critical" },
  { key: "unassigned", label: "Unassigned", tone: "warning" },
  { key: "missingPod", label: "Missing POD", tone: "warning" },
];

const toneValue: Record<(typeof statItems)[number]["tone"], string> = {
  info: "text-[#2563EB]",
  success: "text-[#16A34A]",
  warning: "text-[#EA580C]",
  critical: "text-[#DC2626]",
  muted: "text-[#111827]",
};

export function DispatchOperationsHeader({
  totalCount,
  stats,
  visibleCount,
  filteredCount,
}: DispatchOperationsHeaderProps) {
  return (
    <div className="shrink-0 bg-white">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-end sm:justify-between lg:px-5">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
            Operations
          </p>
          <h1 className="mt-1 text-[22px] font-bold tracking-[-0.03em] text-[#111827]">
            Dispatch
          </h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            {stats.active} active · {totalCount} total · showing {visibleCount} of{" "}
            {filteredCount}
          </p>
        </div>
        <NewLoadPermissionButton />
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-4 lg:px-5">
        {statItems.map((item) => (
          <div
            key={item.key}
            className="flex min-w-[112px] shrink-0 flex-col justify-between rounded-[12px] bg-[#F8F9FB] px-3 py-2.5"
          >
            <p className="text-[12px] font-medium text-[#6B7280]">{item.label}</p>
            <p
              className={`mt-1 text-[18px] font-bold tabular-nums ${toneValue[item.tone]}`}
            >
              {stats[item.key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
