"use client";

import { useState, useTransition } from "react";
import { ClipboardList } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import type { OnboardingChecklist } from "@/lib/types/workforce";
import { toggleOnboardingItemAction } from "@/app/workforce/actions";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

export default function OnboardingClient({
  checklists: initial,
}: {
  checklists: OnboardingChecklist[];
}) {
  const [checklists, setChecklists] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle(checklistId: string, itemId: string) {
    startTransition(async () => {
      const result = await toggleOnboardingItemAction(checklistId, itemId);
      if (result.ok) {
        setChecklists((prev) =>
          prev.map((c) => (c.id === checklistId ? result.checklist : c)),
        );
      }
    });
  }

  if (!checklists.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No onboarding in progress"
        description="Checklists appear when a candidate is hired or receives an offer."
        actionLabel="View applications"
        actionHref="/workforce/applications"
      />
    );
  }

  return (
    <div className="space-y-4">
      {checklists.map((list) => (
        <section key={list.id} className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-[16px] font-semibold text-[#111827]">{list.hireName}</h3>
              <p className="text-[13px] text-[#6B7280]">
                Started {new Date(list.startedAt).toLocaleDateString()} ·{" "}
                {list.status.replace("_", " ")}
              </p>
            </div>
            <span className={`text-[18px] font-bold ${TRANSPO_COLORS.warning.text}`}>
              {list.progress}%
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[#EA580C] transition-all"
              style={{ width: `${list.progress}%` }}
            />
          </div>
          <ul className="mt-4 space-y-2">
            {list.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-[10px] bg-white px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  disabled={pending}
                  onChange={() => toggle(list.id, item.id)}
                  className="mt-1 h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB]"
                  aria-label={item.label}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[14px] font-medium ${
                      item.completed ? "text-[#6B7280] line-through" : "text-[#111827]"
                    }`}
                  >
                    {item.label}
                    {item.required ? (
                      <span className="ml-1 text-[12px] text-[#EA580C]">Required</span>
                    ) : null}
                  </p>
                  <p className="text-[12px] text-[#6B7280]">
                    {item.category}
                    {item.dueAt ? ` · Due ${item.dueAt}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  title="Upload placeholder — wire to Documents when ready"
                  className="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium text-[#94A3B8] shadow-[inset_0_0_0_1px_#E2E8F0]"
                >
                  Upload
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
