import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { WalletDocumentStatus } from "@/lib/wallet/types";
import { WALLET_DOCUMENT_STATUS_LABELS } from "@/lib/wallet/types";

const TONE: Record<
  WalletDocumentStatus,
  keyof typeof TRANSPO_COLORS
> = {
  valid: "success",
  expiring: "warning",
  expired: "critical",
  pending_review: "info",
  revoked: "disabled",
};

export default function WalletStatusBadge({
  status,
  label,
}: {
  status: WalletDocumentStatus | string;
  label?: string;
}) {
  const key = status as WalletDocumentStatus;
  const tone = TONE[key] ?? "info";
  const colors = TRANSPO_COLORS[tone];
  const text =
    label ??
    WALLET_DOCUMENT_STATUS_LABELS[key] ??
    String(status).replace(/_/g, " ");

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${colors.bg} ${colors.text}`}
    >
      {text}
    </span>
  );
}
