import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import {
  INTEGRATION_STATUS_LABELS,
  type IntegrationStatus,
} from "@/lib/integrations/types";

const statusStyles: Record<
  IntegrationStatus,
  { bg: string; text: string; border: string }
> = {
  connected: CARRIEROS_COLORS.success,
  error: CARRIEROS_COLORS.critical,
  pending: CARRIEROS_COLORS.warning,
  disconnected: CARRIEROS_COLORS.disabled,
};

type IntegrationStatusPillProps = {
  status: IntegrationStatus;
  comingSoon?: boolean;
};

export default function IntegrationStatusPill({
  status,
  comingSoon,
}: IntegrationStatusPillProps) {
  if (comingSoon) {
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.text} ${CARRIEROS_COLORS.warning.border}`}
      >
        Coming soon
      </span>
    );
  }

  const styles = statusStyles[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {INTEGRATION_STATUS_LABELS[status]}
    </span>
  );
}
