"use client";

import {
  SETTINGS_GROUP_LABELS,
  SETTINGS_NAV,
  type SettingsNavItem,
} from "@/lib/settings/sections";
import type { SettingsSectionId } from "@/lib/settings/types";

type SettingsNavProps = {
  activeSection: SettingsSectionId;
  onSelect: (section: SettingsSectionId) => void;
};

const GROUP_ORDER: SettingsNavItem["group"][] = [
  "workspace",
  "plans",
  "templates",
  "platform",
  "security",
];

export default function SettingsNav({
  activeSection,
  onSelect,
}: SettingsNavProps) {
  return (
    <>
      <label className="block lg:hidden">
        <span className="sr-only">Settings section</span>
        <select
          className="w-full rounded-[12px] bg-[#F8FAFC] px-3.5 py-2.5 text-[15px] font-medium text-slate-900 outline-none ring-1 ring-[#EAEAEA]"
          value={activeSection}
          onChange={(e) => onSelect(e.target.value as SettingsSectionId)}
        >
          {SETTINGS_NAV.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <nav
        aria-label="Settings sections"
        className="hidden lg:block lg:w-[220px] lg:shrink-0"
      >
        <div className="space-y-5">
          {GROUP_ORDER.map((group) => {
            const items = SETTINGS_NAV.filter((item) => item.group === group);
            return (
              <div key={group}>
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {SETTINGS_GROUP_LABELS[group]}
                </p>
                <ul className="mt-1.5 space-y-0.5">
                  {items.map((item) => {
                    const active = item.id === activeSection;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(item.id)}
                          className={`w-full rounded-[10px] px-2.5 py-2 text-left transition ${
                            active
                              ? "bg-[#EFF6FF] text-[#1D4ED8]"
                              : "text-slate-600 hover:bg-[#F8FAFC] hover:text-slate-900"
                          }`}
                        >
                          <span className="block text-[14px] font-semibold">
                            {item.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
