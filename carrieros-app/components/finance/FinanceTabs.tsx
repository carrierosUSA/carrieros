"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FINANCE_TABS, type FinanceTab } from "@/lib/types/finance";

export function parseFinanceTab(value: string | undefined): FinanceTab {
  const valid = FINANCE_TABS.map((tab) => tab.id);
  if (value && valid.includes(value as FinanceTab)) {
    return value as FinanceTab;
  }
  return "overview";
}

type FinanceTabsProps = {
  activeTab: FinanceTab;
};

export default function FinanceTabs({ activeTab }: FinanceTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function selectTab(tab: FinanceTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <nav
      aria-label="Finance sections"
      className="flex gap-1 overflow-x-auto rounded-[14px] bg-[#F8FAFC] p-1 ring-1 ring-[#EAEAEA]"
    >
      {FINANCE_TABS.map((tab) => {
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
