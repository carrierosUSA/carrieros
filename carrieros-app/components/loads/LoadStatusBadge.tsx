import type { LoadStatus } from "@/lib/types";
import { LOAD_STATUS_LABELS } from "@/lib/types";

type LoadStatusBadgeProps = {
  status: LoadStatus;
};

const statusStyles: Record<LoadStatus, string> = {
  pending: "border-amber-800 bg-amber-950 text-amber-400",
  dispatched: "border-blue-800 bg-blue-950 text-blue-400",
  picked_up: "border-cyan-800 bg-cyan-950 text-cyan-400",
  in_transit: "border-indigo-800 bg-indigo-950 text-indigo-400",
  delivered: "border-green-800 bg-green-950 text-green-400",
  invoiced: "border-emerald-800 bg-emerald-950 text-emerald-400",
  cancelled: "border-zinc-700 bg-zinc-900 text-zinc-400",
};

export default function LoadStatusBadge({ status }: LoadStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {LOAD_STATUS_LABELS[status]}
    </span>
  );
}
