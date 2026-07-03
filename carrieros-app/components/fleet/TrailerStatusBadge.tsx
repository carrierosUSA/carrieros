import type { TrailerStatus } from "@/lib/types";
import { TRAILER_STATUS_LABELS } from "@/lib/types";

type TrailerStatusBadgeProps = {
  status: TrailerStatus;
};

const statusStyles: Record<TrailerStatus, string> = {
  available: "border-green-800 bg-green-950 text-green-400",
  assigned: "border-blue-800 bg-blue-950 text-blue-400",
  maintenance: "border-amber-800 bg-amber-950 text-amber-400",
  out_of_service: "border-red-800 bg-red-950 text-red-400",
};

export default function TrailerStatusBadge({ status }: TrailerStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {TRAILER_STATUS_LABELS[status]}
    </span>
  );
}
