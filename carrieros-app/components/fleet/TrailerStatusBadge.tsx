import type { TrailerStatus } from "@/lib/types";
import { TRAILER_STATUS_LABELS } from "@/lib/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type TrailerStatusBadgeProps = {
  status: TrailerStatus;
};

const statusStyles: Record<
  TrailerStatus,
  { bg: string; text: string; border: string }
> = {
  available: CARRIEROS_COLORS.success,
  loaded: CARRIEROS_COLORS.info,
  empty: CARRIEROS_COLORS.disabled,
  in_yard: {
    bg: "bg-[#F1F5F9]",
    text: "text-[#475569]",
    border: "border-[#CBD5E1]",
  },
  in_shop: CARRIEROS_COLORS.warning,
  out_of_service: CARRIEROS_COLORS.critical,
};

export default function TrailerStatusBadge({ status }: TrailerStatusBadgeProps) {
  const styles = statusStyles[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {TRAILER_STATUS_LABELS[status]}
    </span>
  );
}
