import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import {
  ELD_STATUS_LABELS,
  type EldConnectionStatus,
} from "@/lib/eld/types";

const statusStyles: Record<
  EldConnectionStatus,
  { bg: string; text: string; border: string }
> = {
  connected: CARRIEROS_COLORS.success,
  available: CARRIEROS_COLORS.info,
  partnership_required: CARRIEROS_COLORS.warning,
  api_restricted: CARRIEROS_COLORS.warning,
  no_public_api: CARRIEROS_COLORS.disabled,
  under_review: CARRIEROS_COLORS.info,
  not_yet_supported: CARRIEROS_COLORS.disabled,
};

type EldStatusBadgeProps = {
  status: EldConnectionStatus;
};

export default function EldStatusBadge({ status }: EldStatusBadgeProps) {
  const styles = statusStyles[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {ELD_STATUS_LABELS[status]}
    </span>
  );
}
