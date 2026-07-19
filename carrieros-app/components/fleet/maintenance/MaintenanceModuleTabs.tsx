"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type MaintenanceModuleTab =
  | "pm"
  | "work_orders"
  | "repairs"
  | "mechanics"
  | "parts"
  | "vendors"
  | "tires"
  | "warranty"
  | "history";

const tabs: { id: MaintenanceModuleTab; label: string }[] = [
  { id: "pm", label: "Preventive Maintenance" },
  { id: "work_orders", label: "Work Orders" },
  { id: "repairs", label: "Repairs" },
  { id: "mechanics", label: "Mechanics" },
  { id: "parts", label: "Parts Inventory" },
  { id: "vendors", label: "Vendors" },
  { id: "tires", label: "Tires" },
  { id: "warranty", label: "Warranty" },
  { id: "history", label: "Service History" },
];

export function parseMaintenanceTab(
  value: string | undefined,
): MaintenanceModuleTab {
  const valid = tabs.map((tab) => tab.id);
  if (value && valid.includes(value as MaintenanceModuleTab)) {
    return value as MaintenanceModuleTab;
  }
  return "work_orders";
}

type MaintenanceModuleTabsProps = {
  activeTab: MaintenanceModuleTab;
};

export default function MaintenanceModuleTabs({
  activeTab,
}: MaintenanceModuleTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function selectTab(tab: MaintenanceModuleTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <nav
      aria-label="Maintenance modules"
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
