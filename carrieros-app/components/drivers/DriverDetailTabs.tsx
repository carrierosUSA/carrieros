"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type DriverDetailTab =
  | "overview"
  | "loads"
  | "payroll"
  | "documents"
  | "safety"
  | "violations"
  | "notes"
  | "timeline";

type DriverDetailTabsProps = {
  driverId: string;
  activeTab: DriverDetailTab;
};

const tabs: { id: DriverDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "loads", label: "Assigned Loads" },
  { id: "payroll", label: "Payroll" },
  { id: "documents", label: "Documents" },
  { id: "safety", label: "Safety" },
  { id: "violations", label: "Violations" },
  { id: "notes", label: "Notes" },
  { id: "timeline", label: "Timeline" },
];

export function parseDriverTab(value: string | undefined): DriverDetailTab {
  const valid = tabs.map((tab) => tab.id);

  if (value && valid.includes(value as DriverDetailTab)) {
    return value as DriverDetailTab;
  }

  return "overview";
}

export default function DriverDetailTabs({
  driverId,
  activeTab,
}: DriverDetailTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function selectTab(tab: DriverDetailTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <nav
      aria-label="Driver sections"
      className="flex gap-1 overflow-x-auto rounded-[14px] bg-[#F8FAFC] p-1 ring-1 ring-[#E5E7EB]"
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
                ? "bg-white text-slate-950 shadow-sm ring-1 ring-[#E5E7EB]"
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

export function DriverDetailTabLink({
  driverId,
  tab,
  children,
  className = "",
}: {
  driverId: string;
  tab: DriverDetailTab;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={`/drivers/${driverId}?tab=${tab}`} className={className}>
      {children}
    </Link>
  );
}
