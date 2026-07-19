"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type TruckDetailTab =
  | "overview"
  | "driver"
  | "loads"
  | "maintenance"
  | "fuel"
  | "documents"
  | "expenses"
  | "gps"
  | "cameras"
  | "timeline";

type TruckDetailTabsProps = {
  truckId: string;
  activeTab: TruckDetailTab;
};

const tabs: { id: TruckDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "driver", label: "Driver Assignment" },
  { id: "loads", label: "Active Loads" },
  { id: "maintenance", label: "Maintenance" },
  { id: "fuel", label: "Fuel" },
  { id: "documents", label: "Documents" },
  { id: "expenses", label: "Expenses" },
  { id: "gps", label: "GPS & Tracking" },
  { id: "cameras", label: "Cameras" },
  { id: "timeline", label: "Timeline" },
];

export function parseTruckTab(value: string | undefined): TruckDetailTab {
  const valid = tabs.map((tab) => tab.id);

  if (value && valid.includes(value as TruckDetailTab)) {
    return value as TruckDetailTab;
  }

  return "overview";
}

export default function TruckDetailTabs({
  activeTab,
}: TruckDetailTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function selectTab(tab: TruckDetailTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <nav
      aria-label="Truck sections"
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

export function TruckDetailTabLink({
  truckId,
  tab,
  children,
  className = "",
}: {
  truckId: string;
  tab: TruckDetailTab;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={`/fleet/trucks/${truckId}?tab=${tab}`} className={className}>
      {children}
    </Link>
  );
}
