import type { DriverOperationalStatus } from "@/lib/types";
import { DRIVER_OPERATIONAL_STATUS_LABELS } from "@/lib/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type DriverOperationalBadgeProps = {
  status: DriverOperationalStatus;
};

const statusStyles: Record<
  DriverOperationalStatus,
  { bg: string; text: string; border: string }
> = {
  on_load: CARRIEROS_COLORS.info,
  available: CARRIEROS_COLORS.success,
  off_duty: CARRIEROS_COLORS.disabled,
  onboarding: CARRIEROS_COLORS.warning,
};

export default function DriverOperationalBadge({
  status,
}: DriverOperationalBadgeProps) {
  const styles = statusStyles[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {DRIVER_OPERATIONAL_STATUS_LABELS[status]}
    </span>
  );
}
