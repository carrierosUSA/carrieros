"use client";

import { useState, type FormEvent } from "react";
import RolesMatrix from "@/components/permissions/RolesMatrix";
import type { PermissionId } from "@/lib/permissions/types";

type CustomRoleFormProps = {
  onCancel: () => void;
  onCreate: (input: {
    name: string;
    description: string;
    permissionIds: PermissionId[];
    ssoGroupHint?: string;
  }) => void;
};

export default function CustomRoleForm({
  onCancel,
  onCreate,
}: CustomRoleFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ssoGroupHint, setSsoGroupHint] = useState("");
  const [selected, setSelected] = useState<Set<PermissionId>>(new Set());
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give this role a name.");
      return;
    }
    if (selected.size === 0) {
      setError("Select at least one permission.");
      return;
    }
    setError(null);
    onCreate({
      name: name.trim(),
      description: description.trim() || "Custom role",
      permissionIds: Array.from(selected),
      ssoGroupHint: ssoGroupHint.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium text-[#374151]">
            Role name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Night Ops"
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827] outline-none ring-[#2563EB] placeholder:text-[#9CA3AF] focus:ring-2"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[13px] font-medium text-[#374151]">
            SSO group hint
            <span className="ml-1 font-normal text-[#9CA3AF]">(optional)</span>
          </span>
          <input
            value={ssoGroupHint}
            onChange={(e) => setSsoGroupHint(e.target.value)}
            placeholder="e.g. transpo-night-ops"
            className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827] outline-none ring-[#2563EB] placeholder:text-[#9CA3AF] focus:ring-2"
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-[13px] font-medium text-[#374151]">
          Description
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Who should get this role, and what they do."
          className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[14px] text-[#111827] outline-none ring-[#2563EB] placeholder:text-[#9CA3AF] focus:ring-2"
        />
      </label>

      <RolesMatrix selected={selected} onChange={setSelected} />

      {error ? (
        <p className="text-[13px] font-medium text-[#DC2626]">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Create custom role
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center rounded-xl bg-[#F8FAFC] px-4 text-[13px] font-semibold text-[#374151] ring-1 ring-[#EAEAEA] transition hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
