"use client";

import Link from "next/link";
import { usePermissions } from "@/hooks/usePermissions";
import { DENIED_TOOLTIP } from "@/lib/permissions/check";

export default function NewLoadPermissionButton() {
  const { can, cannotReason } = usePermissions();
  const allowed = can("button.loads.create");

  if (!allowed) {
    return (
      <span
        className="inline-flex h-8 shrink-0 cursor-not-allowed items-center gap-1 rounded-lg bg-blue-600/40 px-3 text-[12px] font-semibold text-white/80"
        title={cannotReason("button.loads.create") ?? DENIED_TOOLTIP}
        aria-disabled="true"
      >
        <span className="text-sm leading-none">+</span>
        New Load
      </span>
    );
  }

  return (
    <Link
      href="/loads/new"
      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-3 text-[12px] font-semibold text-white shadow-md shadow-blue-900/30 transition hover:bg-blue-500"
    >
      <span className="text-sm leading-none">+</span>
      New Load
    </Link>
  );
}
