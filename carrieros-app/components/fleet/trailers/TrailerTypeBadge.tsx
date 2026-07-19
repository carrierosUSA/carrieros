import type { TrailerType } from "@/lib/types";
import { TRAILER_TYPE_LABELS } from "@/lib/types";

type TrailerTypeBadgeProps = {
  type: TrailerType;
};

export default function TrailerTypeBadge({ type }: TrailerTypeBadgeProps) {
  return (
    <span className="inline-flex rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[12px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA]">
      {TRAILER_TYPE_LABELS[type]}
    </span>
  );
}
