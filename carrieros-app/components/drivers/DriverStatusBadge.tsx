import type { DriverStatus } from "@/lib/types";
import { DRIVER_STATUS_LABELS } from "@/lib/types";

type DriverStatusBadgeProps = {
  status: DriverStatus;
};

const statusStyles: Record<DriverStatus, string> = {
  active: "border-green-800 bg-green-950 text-green-400",
  inactive: "border-zinc-700 bg-zinc-900 text-zinc-400",
  onboarding: "border-blue-800 bg-blue-950 text-blue-400",
  terminated: "border-red-800 bg-red-950 text-red-400",
};

export default function DriverStatusBadge({ status }: DriverStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {DRIVER_STATUS_LABELS[status]}
    </span>
  );
}
