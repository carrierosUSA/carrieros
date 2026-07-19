"use client";

import { useId, useState } from "react";

type ActionTooltipProps = {
  label: string;
  reason?: string;
  disabled?: boolean;
  children: React.ReactElement;
};

export default function ActionTooltip({
  label,
  reason,
  disabled = false,
  children,
}: ActionTooltipProps) {
  const tooltipId = useId();
  const [visible, setVisible] = useState(false);

  if (!disabled || !reason) {
    return children;
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span aria-describedby={visible ? tooltipId : undefined}>{children}</span>
      {visible ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-max max-w-[220px] -translate-x-1/2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-center text-[12px] font-medium leading-snug text-slate-700 shadow-lg shadow-slate-200/60"
        >
          {reason}
        </span>
      ) : null}
      <span className="sr-only">{label} unavailable: {reason}</span>
    </span>
  );
}
