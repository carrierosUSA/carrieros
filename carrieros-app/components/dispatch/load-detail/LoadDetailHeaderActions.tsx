"use client";

import Link from "next/link";
import { useLoadDetailQuickTasks } from "@/components/dispatch/load-detail/LoadDetailQuickTasksProvider";

type LoadDetailHeaderActionsProps = {
  loadId: string;
};

export default function LoadDetailHeaderActions({ loadId }: LoadDetailHeaderActionsProps) {
  const { openTask } = useLoadDetailQuickTasks();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href={`/loads/${loadId}/edit`}
        className="flex h-8 items-center rounded-xl border border-[#EAEAEA] px-3 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={() => openTask("createInvoice")}
        className="flex h-8 items-center rounded-xl bg-[#2563EB] px-3 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
      >
        Invoice
      </button>
    </div>
  );
}
