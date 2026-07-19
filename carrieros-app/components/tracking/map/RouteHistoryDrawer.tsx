"use client";

import { X } from "lucide-react";
import type { RouteHistoryEvent, RouteHistoryTimeline } from "@/lib/tracking/route-history";

type RouteHistoryDrawerProps = {
  open: boolean;
  onClose: () => void;
  timeline: RouteHistoryTimeline;
};

function StatusBadge({ status }: { status: RouteHistoryEvent["status"] }) {
  if (status === "completed") {
    return (
      <span className="rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[10px] font-semibold text-[#166534]">
        Completed
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#1D4ED8]">
        Active
      </span>
    );
  }

  return (
    <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-semibold text-slate-500">
      Upcoming
    </span>
  );
}

function RouteHistoryEventRow({ event }: { event: RouteHistoryEvent }) {
  const isActive = event.status === "active";

  return (
    <li className="relative pl-8">
      <span
        className={`absolute left-[7px] top-1.5 h-3 w-3 rounded-full border-2 bg-white ${
          event.status === "completed"
            ? "border-[#16A34A]"
            : isActive
              ? "border-[#2563EB] shadow-[0_0_0_4px_rgba(37,99,235,0.15)]"
              : "border-[#CBD5E1]"
        }`}
      />
      <div
        className={`rounded-[14px] border p-3.5 transition ${
          isActive
            ? "border-[#BFDBFE] bg-[#F8FBFF] shadow-sm"
            : "border-[#EAEAEA] bg-white"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[14px] font-semibold text-slate-950">{event.title}</p>
            <p className="mt-0.5 text-[12px] font-medium text-slate-500">
              {event.timeLabel} · {event.dateLabel}
            </p>
          </div>
          <StatusBadge status={event.status} />
        </div>

        <div className="mt-3 grid gap-1.5 text-[12px]">
          <p className="text-slate-600">
            <span className="font-medium text-slate-500">Location:</span>{" "}
            {event.location}
          </p>
          <p className="text-slate-600">
            <span className="font-medium text-slate-500">Driver:</span> {event.driver}
          </p>
          <p className="text-slate-600">
            <span className="font-medium text-slate-500">Status:</span>{" "}
            {event.status === "completed"
              ? "Confirmed"
              : event.status === "active"
                ? "In progress"
                : "Scheduled"}
          </p>
        </div>
      </div>
    </li>
  );
}

export default function RouteHistoryDrawer({
  open,
  onClose,
  timeline,
}: RouteHistoryDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10002]">
      <button
        type="button"
        aria-label="Close route history"
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside className="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col border-l border-[#EAEAEA] bg-white shadow-2xl animate-[carrieros-fade-in_0.25s_ease-out_both] sm:rounded-l-[20px]">
        <div className="flex items-start justify-between gap-3 border-b border-[#F1F5F9] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Route History
            </p>
            <h2 className="mt-1 text-[20px] font-bold tracking-[-0.02em] text-slate-950">
              Load #{timeline.loadReference.replace(/^LD-/i, "")}
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Full shipment timeline with GPS-ready events.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-[#EAEAEA] text-slate-500 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>

        <ol className="relative flex-1 space-y-4 overflow-y-auto px-5 py-5 before:absolute before:bottom-5 before:left-[13px] before:top-5 before:w-px before:bg-[#E2E8F0]">
          {timeline.events.map((event) => (
            <RouteHistoryEventRow key={event.id} event={event} />
          ))}
        </ol>
      </aside>
    </div>
  );
}
