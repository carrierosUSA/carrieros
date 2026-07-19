"use client";

import { useState } from "react";
import {
  clearMemory,
  removeMemory,
  upsertMemory,
  type CopilotMemoryItem,
  type CopilotRole,
} from "@/lib/alph-copilot";

type MemoryPanelProps = {
  items: CopilotMemoryItem[];
  role: CopilotRole;
  onChange: () => void;
};

export default function MemoryPanel({
  items,
  role,
  onChange,
}: MemoryPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function startEdit(item: CopilotMemoryItem) {
    setEditingId(item.id);
    setDraft(item.value);
  }

  function saveEdit(item: CopilotMemoryItem) {
    const value = draft.trim();
    if (!value) return;
    upsertMemory({ ...item, value });
    setEditingId(null);
    setDraft("");
    onChange();
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-[16px] font-semibold text-[#111827]">AI Memory</h2>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            What Alph remembers for this role — edit or clear anytime.
          </p>
        </div>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              clearMemory(role);
              onChange();
            }}
            className="text-[12px] font-semibold text-[#DC2626] hover:underline"
          >
            Clear memory
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-5 text-[14px] text-[#6B7280]">
          No memories yet. Alph will learn as you confirm suggestions.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-[200px] max-w-full flex-1 rounded-[14px] bg-[#F8FAFC] px-3 py-3 sm:min-w-[240px]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                {item.label}
              </p>
              {editingId === item.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-[10px] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none ring-1 ring-[#E2E8F0] focus:ring-[#2563EB]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(item)}
                      className="rounded-full bg-[#2563EB] px-3 py-1 text-[12px] font-semibold text-white"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setDraft("");
                      }}
                      className="rounded-full px-3 py-1 text-[12px] font-semibold text-[#64748B]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-[13px] font-medium leading-snug text-[#111827]">
                    {item.value}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="text-[12px] font-semibold text-[#2563EB]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeMemory(item.id);
                        onChange();
                      }}
                      className="text-[12px] font-semibold text-[#94A3B8]"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
