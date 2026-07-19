import type { LoadStatusChip } from "@/lib/dispatch/load-status-chips";

const CHIP_STYLES: Record<
  LoadStatusChip["variant"],
  string
> = {
  ready: "bg-emerald-50/90 text-emerald-800 ring-emerald-200/70",
  pod_missing: "bg-amber-50/90 text-amber-900 ring-amber-200/70",
  detention_soon: "bg-orange-50/90 text-orange-900 ring-orange-200/70",
  driver_delayed: "bg-rose-50/90 text-rose-900 ring-rose-200/70",
  invoice_ready: "bg-sky-50/90 text-sky-900 ring-sky-200/70",
};

type LoadDetailStatusChipsProps = {
  chips: LoadStatusChip[];
};

export default function LoadDetailStatusChips({
  chips,
}: LoadDetailStatusChipsProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip.id}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium leading-none ring-1 ring-inset ${CHIP_STYLES[chip.variant]}`}
        >
          <span aria-hidden className="text-[11px] leading-none">
            {chip.emoji}
          </span>
          {chip.label}
        </span>
      ))}
    </div>
  );
}
