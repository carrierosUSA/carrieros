"use client";

import { useState } from "react";
import ActionTooltip from "@/components/ui/ActionTooltip";
import { TRIGGER_CATALOG } from "@/lib/workflows/catalog";
import type { WorkflowTriggerType } from "@/lib/workflows/types";

type SimulateEventPanelProps = {
  onSimulate: (type: WorkflowTriggerType) => void;
};

export default function SimulateEventPanel({
  onSimulate,
}: SimulateEventPanelProps) {
  const [type, setType] = useState<WorkflowTriggerType>("delivery_completed");

  return (
    <div className="rounded-[18px] bg-[#F8FAFC] p-5 ring-1 ring-[#EEF2F7]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-[15px] font-semibold text-slate-900">
              Simulate event
            </p>
            <p className="mt-1 text-[13px] text-slate-500">
              Fire a sample event against all enabled workflows. Placeholder
              execution today — ready for a real event bus later.
            </p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Event type
            </span>
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as WorkflowTriggerType)
              }
              className="h-11 w-full max-w-md rounded-xl border-0 bg-white px-3 text-[14px] text-slate-900 outline-none ring-1 ring-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB]/35"
            >
              {TRIGGER_CATALOG.map((entry) => (
                <option key={entry.type} value={entry.type}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ActionTooltip label="Simulate" reason={undefined}>
          <button
            type="button"
            onClick={() => onSimulate(type)}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Fire event
          </button>
        </ActionTooltip>
      </div>
    </div>
  );
}
