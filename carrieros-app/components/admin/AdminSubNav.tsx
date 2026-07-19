"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ADMIN_TABS, type AdminTabId } from "@/lib/admin/types";

export function parseAdminTab(value: string | null | undefined): AdminTabId {
  const valid = ADMIN_TABS.map((t) => t.id);
  if (value && valid.includes(value as AdminTabId)) {
    return value as AdminTabId;
  }
  return "audit";
}

type AdminSubNavProps = {
  activeTab: AdminTabId;
};

export default function AdminSubNav({ activeTab }: AdminSubNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function selectTab(tab: AdminTabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "audit") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const groups = ADMIN_TABS.reduce<
    { group: string; tabs: typeof ADMIN_TABS }[]
  >((acc, tab) => {
    const existing = acc.find((g) => g.group === tab.group);
    if (existing) {
      existing.tabs.push(tab);
    } else {
      acc.push({ group: tab.group, tabs: [tab] });
    }
    return acc;
  }, []);

  return (
    <nav
      aria-label="System administration"
      className="flex w-full shrink-0 flex-col gap-5 lg:w-[200px]"
    >
      {groups.map((group) => (
        <div key={group.group}>
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
            {group.group}
          </p>
          <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {group.tabs.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => selectTab(tab.id)}
                  className={`shrink-0 rounded-xl px-3 py-2 text-left text-[13px] font-semibold transition ${
                    active
                      ? "bg-[#2563EB] text-white shadow-[0_6px_16px_rgba(37,99,235,0.22)]"
                      : "text-[#475569] hover:bg-[#F5F7FA] hover:text-[#111827]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
