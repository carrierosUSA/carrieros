import type { TruckStatus } from "@/lib/types";
import { TRUCK_STATUS_LABELS } from "@/lib/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type TruckStatusBadgeProps = {
  status: TruckStatus;
};

const statusStyles: Record<
  TruckStatus,
  { bg: string; text: string; border: string }
> = {
  available: CARRIEROS_COLORS.success,
  on_load: CARRIEROS_COLORS.info,
  idle: CARRIEROS_COLORS.disabled,
  in_shop: CARRIEROS_COLORS.warning,
  out_of_service: CARRIEROS_COLORS.critical,
};

export default function TruckStatusBadge({ status }: TruckStatusBadgeProps) {
  const styles = statusStyles[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {TRUCK_STATUS_LABELS[status]}
    </span>
  );
}
