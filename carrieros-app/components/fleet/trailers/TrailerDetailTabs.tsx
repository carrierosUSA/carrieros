"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type TrailerDetailTab =
  | "overview"
  | "current_load"
  | "load_history"
  | "maintenance"
  | "reefer"
  | "documents"
  | "tires"
  | "gps"
  | "timeline";

type TrailerDetailTabsProps = {
  trailerId: string;
  activeTab: TrailerDetailTab;
  showReefer: boolean;
};

const allTabs: { id: TrailerDetailTab; label: string; reeferOnly?: boolean }[] = [
  { id: "overview", label: "Overview" },
  { id: "current_load", label: "Current Load" },
  { id: "load_history", label: "Load History" },
  { id: "maintenance", label: "Maintenance" },
  { id: "reefer", label: "Reefer", reeferOnly: true },
  { id: "documents", label: "Documents" },
  { id: "tires", label: "Tires" },
  { id: "gps", label: "GPS" },
  { id: "timeline", label: "Timeline" },
];

export function parseTrailerTab(
  value: string | undefined,
  showReefer: boolean,
): TrailerDetailTab {
  const valid = allTabs
    .filter((tab) => showReefer || !tab.reeferOnly)
    .map((tab) => tab.id);

  if (value && valid.includes(value as TrailerDetailTab)) {
    return value as TrailerDetailTab;
  }

  if (value === "reefer" && !showReefer) {
    return "overview";
  }

  return "overview";
}

export default function TrailerDetailTabs({
  activeTab,
  showReefer,
}: TrailerDetailTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabs = allTabs.filter((tab) => showReefer || !tab.reeferOnly);

  function selectTab(tab: TrailerDetailTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <nav
      aria-label="Trailer sections"
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

export function TrailerDetailTabLink({
  trailerId,
  tab,
  children,
  className = "",
}: {
  trailerId: string;
  tab: TrailerDetailTab;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={`/fleet/trailers/${trailerId}?tab=${tab}`} className={className}>
      {children}
    </Link>
  );
}
