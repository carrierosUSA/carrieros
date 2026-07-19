import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type { CarrierDocumentStatus } from "@/lib/types/documents";

const STATUS_CONFIG: Record<
  CarrierDocumentStatus,
  { label: string; tone: keyof typeof CARRIEROS_COLORS }
> = {
  pending_review: { label: "Pending review", tone: "info" },
  linked: { label: "Linked", tone: "success" },
  missing: { label: "Missing", tone: "warning" },
  expiring: { label: "Expiring", tone: "warning" },
  deleted: { label: "Deleted", tone: "disabled" },
};

type DocumentStatusBadgeProps = {
  status: CarrierDocumentStatus;
};

export default function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const tone = CARRIEROS_COLORS[config.tone];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${tone.bg} ${tone.text} ring-1 ${tone.border}`}
    >
      {config.label}
    </span>
  );
}
