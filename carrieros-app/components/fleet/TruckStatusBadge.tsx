import type { TruckStatus } from "@/lib/types";
import { TRUCK_STATUS_LABELS } from "@/lib/types";

type TruckStatusBadgeProps = {
  status: TruckStatus;
};

const statusStyles: Record<TruckStatus, string> = {
  available: "border-green-800 bg-green-950 text-green-400",
  assigned: "border-blue-800 bg-blue-950 text-blue-400",
  maintenance: "border-amber-800 bg-amber-950 text-amber-400",
  out_of_service: "border-red-800 bg-red-950 text-red-400",
};

export default function TruckStatusBadge({ status }: TruckStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {TRUCK_STATUS_LABELS[status]}
    </span>
  );
}
