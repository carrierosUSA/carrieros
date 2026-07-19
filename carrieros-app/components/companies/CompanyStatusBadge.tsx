import type { CompanyStatus } from "@/lib/types";
import { COMPANY_STATUS_LABELS } from "@/lib/types";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";

type CompanyStatusBadgeProps = {
  status: CompanyStatus;
};

const statusStyles: Record<
  CompanyStatus,
  { bg: string; text: string; border: string }
> = {
  active: CARRIEROS_COLORS.success,
  inactive: CARRIEROS_COLORS.disabled,
};

export default function CompanyStatusBadge({ status }: CompanyStatusBadgeProps) {
  const styles = statusStyles[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {COMPANY_STATUS_LABELS[status]}
    </span>
  );
}
