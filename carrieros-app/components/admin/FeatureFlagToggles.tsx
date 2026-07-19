"use client";

import { useAdminStore } from "@/hooks/useAdminStore";
import { setFeatureFlag } from "@/lib/admin/feature-flags";
import type { FeatureFlagId } from "@/lib/admin/types";

type FeatureFlagTogglesProps = {
  onToast: (message: string) => void;
};

export default function FeatureFlagToggles({
  onToast,
}: FeatureFlagTogglesProps) {
  const store = useAdminStore();

  function handleToggle(id: FeatureFlagId, enabled: boolean, label: string) {
    setFeatureFlag(id, enabled);
    onToast(`${enabled ? "Enabled" : "Disabled"} ${label}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#111827]">
          Feature flags
        </h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Toggle product capabilities. Changes persist locally and write an
          audit entry.
        </p>
      </div>

      <div className="divide-y divide-[#F1F5F9] overflow-hidden rounded-[14px] bg-white ring-1 ring-[#EAEAEA]">
        {store.featureFlags.map((flag) => (
          <div
            key={flag.id}
            className="flex items-start justify-between gap-4 px-4 py-4"
          >
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#111827]">
                {flag.label}
              </p>
              <p className="mt-0.5 text-[13px] leading-5 text-[#6B7280]">
                {flag.description}
              </p>
              <p className="mt-1 text-[12px] font-medium text-[#94A3B8]">
                {flag.id}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={flag.enabled}
              onClick={() =>
                handleToggle(flag.id, !flag.enabled, flag.label)
              }
              className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition ${
                flag.enabled ? "bg-[#16A34A]" : "bg-[#CBD5E1]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                  flag.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
