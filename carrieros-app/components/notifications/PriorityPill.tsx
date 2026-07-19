"use client";

import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import {
  NOTIFICATION_PRIORITY_LABELS,
  type NotificationPriority,
} from "@/lib/types/notifications";

const PRIORITY_STYLES: Record<
  NotificationPriority,
  { bg: string; text: string; border: string }
> = {
  critical: CARRIEROS_COLORS.critical,
  high: CARRIEROS_COLORS.warning,
  medium: CARRIEROS_COLORS.info,
  low: CARRIEROS_COLORS.disabled,
};

type PriorityPillProps = {
  priority: NotificationPriority;
  compact?: boolean;
};

export default function PriorityPill({ priority, compact }: PriorityPillProps) {
  const styles = PRIORITY_STYLES[priority];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold ${styles.bg} ${styles.text} ${styles.border} ${
        compact ? "text-[11px]" : "text-[12px]"
      }`}
    >
      {NOTIFICATION_PRIORITY_LABELS[priority]}
    </span>
  );
}
