"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type BrokerDetailTab =
  | "overview"
  | "loads"
  | "payments"
  | "documents"
  | "contacts"
  | "rate_history"
  | "notes"
  | "timeline";

type BrokerDetailTabsProps = {
  activeTab: BrokerDetailTab;
};

const tabs: { id: BrokerDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "loads", label: "Loads" },
  { id: "payments", label: "Payments" },
  { id: "documents", label: "Documents" },
  { id: "contacts", label: "Contacts" },
  { id: "rate_history", label: "Rate History" },
  { id: "notes", label: "Notes" },
  { id: "timeline", label: "Timeline" },
];

export function parseBrokerTab(value: string | undefined): BrokerDetailTab {
  const valid = tabs.map((tab) => tab.id);

  if (value && valid.includes(value as BrokerDetailTab)) {
    return value as BrokerDetailTab;
  }

  return "overview";
}

export default function BrokerDetailTabs({ activeTab }: BrokerDetailTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function selectTab(tab: BrokerDetailTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <nav
      aria-label="Broker sections"
      className="flex gap-1 overflow-x-auto rounded-[14px] bg-[#F8FAFC] p-1 ring-1 ring-[#EAEAEA]"
    >
      {tabs.map((tab) => {
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
