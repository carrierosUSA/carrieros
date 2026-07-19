import {
  COMPLIANCE_ITEM_STATUS_LABELS,
  type ComplianceItemStatus,
} from "@/lib/types/compliance";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type ComplianceStatusBadgeProps = {
  status: ComplianceItemStatus;
};

const statusTone: Record<
  ComplianceItemStatus,
  keyof typeof CARRIEROS_COLORS
> = {
  clear: "success",
  expiring: "warning",
  expired: "critical",
  due: "warning",
  failed: "critical",
  pending: "info",
};

export default function ComplianceStatusBadge({
  status,
}: ComplianceStatusBadgeProps) {
  const tone = CARRIEROS_COLORS[statusTone[status]];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.border}`}
    >
      {COMPLIANCE_ITEM_STATUS_LABELS[status]}
    </span>
  );
}
