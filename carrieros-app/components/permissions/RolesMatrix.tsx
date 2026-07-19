"use client";

import {
  BUTTON_PERMISSIONS,
  DOCUMENT_PERMISSIONS,
  PAGE_PERMISSIONS,
} from "@/lib/permissions/permissions-catalog";
import type { PermissionDef, PermissionId } from "@/lib/permissions/types";

type RolesMatrixProps = {
  selected: Set<PermissionId>;
  onChange: (next: Set<PermissionId>) => void;
  readOnly?: boolean;
};

function Section({
  title,
  hint,
  permissions,
  selected,
  onToggle,
  onToggleAll,
  readOnly,
}: {
  title: string;
  hint: string;
  permissions: PermissionDef[];
  selected: Set<PermissionId>;
  onToggle: (id: PermissionId) => void;
  onToggleAll: (ids: PermissionId[], enable: boolean) => void;
  readOnly?: boolean;
}) {
  const ids = permissions.map((p) => p.id);
  const allOn = ids.every((id) => selected.has(id));
  const someOn = !allOn && ids.some((id) => selected.has(id));

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">{title}</h3>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">{hint}</p>
        </div>
        {!readOnly ? (
          <button
            type="button"
            onClick={() => onToggleAll(ids, !allOn)}
            className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            {allOn ? "Clear section" : someOn ? "Select all" : "Select all"}
          </button>
        ) : null}
      </div>
      <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
        {permissions.map((perm) => {
          const checked = selected.has(perm.id);
          return (
            <label
              key={perm.id}
              className={`flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 transition ${
                checked ? "bg-[#EFF6FF]" : "bg-[#F8FAFC] hover:bg-[#F1F5F9]"
              } ${readOnly ? "cursor-default opacity-90" : ""}`}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                checked={checked}
                disabled={readOnly}
                onChange={() => onToggle(perm.id)}
              />
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-[#111827]">
                  {perm.label}
                </span>
                {perm.description ? (
                  <span className="mt-0.5 block text-[12px] leading-4 text-[#6B7280]">
                    {perm.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

export default function RolesMatrix({
  selected,
  onChange,
  readOnly,
}: RolesMatrixProps) {
  function toggle(id: PermissionId) {
    if (readOnly) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  function toggleAll(ids: PermissionId[], enable: boolean) {
    if (readOnly) return;
    const next = new Set(selected);
    ids.forEach((id) => {
      if (enable) next.add(id);
      else next.delete(id);
    });
    onChange(next);
  }

  return (
    <div className="space-y-8">
      <Section
        title="Pages"
        hint="Route-level view access"
        permissions={PAGE_PERMISSIONS}
        selected={selected}
        onToggle={toggle}
        onToggleAll={toggleAll}
        readOnly={readOnly}
      />
      <Section
        title="Actions"
        hint="Named buttons and operational tasks"
        permissions={BUTTON_PERMISSIONS}
        selected={selected}
        onToggle={toggle}
        onToggleAll={toggleAll}
        readOnly={readOnly}
      />
      <Section
        title="Documents"
        hint="By category and sensitivity"
        permissions={DOCUMENT_PERMISSIONS}
        selected={selected}
        onToggle={toggle}
        onToggleAll={toggleAll}
        readOnly={readOnly}
      />
    </div>
  );
}
