"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type CompanyDetailTab =
  | "overview"
  | "contacts"
  | "locations"
  | "documents"
  | "loads"
  | "payments"
  | "notes"
  | "timeline";

type CompanyDetailTabsProps = {
  activeTab: CompanyDetailTab;
};

const tabs: { id: CompanyDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "contacts", label: "Contacts" },
  { id: "locations", label: "Locations" },
  { id: "documents", label: "Documents" },
  { id: "loads", label: "Loads" },
  { id: "payments", label: "Payments" },
  { id: "notes", label: "Notes" },
  { id: "timeline", label: "Timeline" },
];

export function parseCompanyTab(value: string | undefined): CompanyDetailTab {
  const valid = tabs.map((tab) => tab.id);

  if (value && valid.includes(value as CompanyDetailTab)) {
    return value as CompanyDetailTab;
  }

  return "overview";
}

export default function CompanyDetailTabs({
  activeTab,
}: CompanyDetailTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function selectTab(tab: CompanyDetailTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <nav
      aria-label="Company sections"
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
