"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ComplianceTab } from "@/lib/types/compliance";

type ComplianceQuickActionsProps = {
  onReportAccident: () => void;
  onUploadInspection: () => void;
  onScheduleDrugTest: () => void;
  onAssignTraining: () => void;
  onUploadDocuments: () => void;
};

function ActionButton({
  label,
  onClick,
  primary,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition ${
        primary
          ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          : "bg-[#F8FAFC] text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function ComplianceQuickActions({
  onReportAccident,
  onUploadInspection,
  onScheduleDrugTest,
  onAssignTraining,
  onUploadDocuments,
}: ComplianceQuickActionsProps) {
  const router = useRouter();
  const pathname = usePathname();

  function go(tab: ComplianceTab) {
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton label="Report Accident" primary onClick={onReportAccident} />
      <ActionButton label="Upload Inspection" onClick={onUploadInspection} />
      <ActionButton label="Schedule Drug Test" onClick={onScheduleDrugTest} />
      <ActionButton label="Assign Training" onClick={onAssignTraining} />
      <ActionButton label="Upload Documents" onClick={onUploadDocuments} />
      <ActionButton label="View Timeline" onClick={() => go("overview")} />
    </div>
  );
}
