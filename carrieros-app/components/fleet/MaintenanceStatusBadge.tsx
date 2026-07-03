import type { MaintenanceStatus } from "@/lib/types";
import { MAINTENANCE_STATUS_LABELS } from "@/lib/types";

type MaintenanceStatusBadgeProps = {
  status: MaintenanceStatus;
};

const statusStyles: Record<MaintenanceStatus, string> = {
  scheduled: "border-blue-800 bg-blue-950 text-blue-400",
  in_progress: "border-amber-800 bg-amber-950 text-amber-400",
  completed: "border-green-800 bg-green-950 text-green-400",
};

export default function MaintenanceStatusBadge({
  status,
}: MaintenanceStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {MAINTENANCE_STATUS_LABELS[status]}
    </span>
  );
}
