"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export type EntityPopoverRow = {
  label: string;
  value: ReactNode;
};

type EntityHoverPopoverProps = {
  children: ReactNode;
  heading: string;
  status?: string;
  statusTone?: "active" | "driving" | "waiting" | "neutral";
  rows: EntityPopoverRow[];
  align?: "start" | "end";
};

const SHOW_DELAY_MS = 220;
const HIDE_DELAY_MS = 120;

const STATUS_TONE_CLASS: Record<
  NonNullable<EntityHoverPopoverProps["statusTone"]>,
  string
> = {
  active: "text-emerald-700",
  driving: "text-emerald-700",
  waiting: "text-amber-700",
  neutral: "text-slate-600",
};

function PopoverRow({ label, value }: EntityPopoverRow) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] leading-none text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-[12px] font-medium leading-snug text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function EntityHoverPopover({
  children,
  heading,
  status,
  statusTone = "active",
  rows,
  align = "start",
}: EntityHoverPopoverProps) {
  const [open, setOpen] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }

    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleShow = useCallback(() => {
    clearTimers();
    showTimer.current = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
  }, [clearTimers]);

  const scheduleHide = useCallback(() => {
    clearTimers();
    hideTimer.current = setTimeout(() => setOpen(false), HIDE_DELAY_MS);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  const alignClass = align === "end" ? "right-0" : "left-0";

  return (
    <div
      className="relative inline-flex max-w-full min-w-0"
      onMouseEnter={scheduleShow}
      onMouseLeave={scheduleHide}
      onFocus={scheduleShow}
      onBlur={scheduleHide}
    >
      {children}
      {open ? (
        <div
          role="tooltip"
          className={`absolute top-full z-50 mt-2 w-[min(240px,calc(100vw-2rem))] rounded-xl border border-slate-100 bg-white p-3.5 shadow-[0_8px_30px_rgba(15,23,42,0.12)] ${alignClass}`}
          onMouseEnter={scheduleShow}
          onMouseLeave={scheduleHide}
        >
          <p className="text-[13px] font-semibold leading-none text-slate-950">
            {heading}
          </p>
          {status ? (
            <p
              className={`mt-1.5 flex items-center gap-1 text-[12px] font-medium leading-none ${STATUS_TONE_CLASS[statusTone]}`}
            >
              <span aria-hidden="true">✔</span>
              {status}
            </p>
          ) : null}
          <div className="mt-3 space-y-2.5">
            {rows.map((row) => (
              <PopoverRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
