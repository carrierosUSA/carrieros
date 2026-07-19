"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  COMPLIANCE_TABS,
  type ComplianceTab,
} from "@/lib/types/compliance";

type ComplianceSubNavProps = {
  activeTab: ComplianceTab;
};

export function parseComplianceTab(
  value: string | undefined,
): ComplianceTab {
  const valid = COMPLIANCE_TABS.map((tab) => tab.id);
  if (value && valid.includes(value as ComplianceTab)) {
    return value as ComplianceTab;
  }
  return "overview";
}

export default function ComplianceSubNav({ activeTab }: ComplianceSubNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function selectTab(tab: ComplianceTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <nav
      aria-label="Compliance modules"
      className="flex gap-1 overflow-x-auto rounded-[14px] bg-[#F8FAFC] p-1 ring-1 ring-[#EAEAEA]"
    >
      {COMPLIANCE_TABS.map((tab) => {
        const active = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectTab(tab.id)}
            className={`shrink-0 rounded-[10px] px-3 py-2 text-[13px] font-semibold transition ${
              active
                ? "bg-white text-slate-950 shadow-sm ring-1 ring-[#EAEAEA]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
