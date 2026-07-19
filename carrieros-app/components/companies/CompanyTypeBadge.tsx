import type { CompanyType } from "@/lib/types";
import { COMPANY_TYPE_LABELS } from "@/lib/types";

type CompanyTypeBadgeProps = {
  type: CompanyType;
};

export default function CompanyTypeBadge({ type }: CompanyTypeBadgeProps) {
  return (
    <span className="inline-flex rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[12px] font-semibold text-slate-600 ring-1 ring-[#EAEAEA]">
      {COMPANY_TYPE_LABELS[type]}
    </span>
  );
}
