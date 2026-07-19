import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import { statusTone } from "@/lib/workforce/board";

export default function WorkforceStatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const tone = statusTone(status);
  const colors = TRANSPO_COLORS[tone] ?? TRANSPO_COLORS.disabled;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ${colors.bg} ${colors.text}`}
    >
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}
