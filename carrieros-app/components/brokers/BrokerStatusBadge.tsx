import type { BrokerStatus } from "@/lib/types";
import { BROKER_STATUS_LABELS } from "@/lib/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type BrokerStatusBadgeProps = {
  status: BrokerStatus;
};

const statusStyles: Record<
  BrokerStatus,
  { bg: string; text: string; border: string }
> = {
  active: CARRIEROS_COLORS.success,
  inactive: CARRIEROS_COLORS.disabled,
  credit_hold: CARRIEROS_COLORS.critical,
};

export default function BrokerStatusBadge({ status }: BrokerStatusBadgeProps) {
  const styles = statusStyles[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {BROKER_STATUS_LABELS[status]}
    </span>
  );
}
