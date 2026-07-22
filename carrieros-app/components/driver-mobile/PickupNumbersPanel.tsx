import { orderedPickupNumbers } from "@/lib/loads/pickup-numbers";
import type { PickupNumber } from "@/lib/types/pickup-number";

export default function PickupNumbersPanel({
  pickupNumbers,
  compact = false,
}: {
  pickupNumbers?: readonly PickupNumber[];
  compact?: boolean;
}) {
  const entries = orderedPickupNumbers(pickupNumbers);
  if (!entries.length) return null;

  return (
    <section className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-amber-500">
        PICKUP NUMBER
      </p>
      <div className="mt-2 space-y-2">
        {entries.map((entry) => (
          <div key={entry.id}>
            <p
              className={
                compact
                  ? "text-[15px] font-black tracking-wide"
                  : "text-[18px] font-black tracking-wide"
              }
            >
              {entry.value}
            </p>
            {entry.label || entry.pickupStopLabel ? (
              <p className="mt-0.5 text-[11px] font-medium text-[var(--dm-muted)]">
                {[entry.label, entry.pickupStopLabel]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
