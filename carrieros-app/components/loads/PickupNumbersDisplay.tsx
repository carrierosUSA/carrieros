import { orderedPickupNumbers } from "@/lib/loads/pickup-numbers";
import type { PickupNumber } from "@/lib/types/pickup-number";

export default function PickupNumbersDisplay({
  pickupNumbers,
  className = "",
}: {
  pickupNumbers?: readonly PickupNumber[];
  className?: string;
}) {
  const entries = orderedPickupNumbers(pickupNumbers);
  if (!entries.length) return null;

  return (
    <section
      className={`rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 ${className}`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-800">
        PICKUP NUMBER
      </p>
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
        {entries.map((entry) => (
          <div key={entry.id}>
            <span className="text-[14px] font-black tracking-wide text-slate-950">
              {entry.value}
            </span>
            {entry.label || entry.pickupStopLabel ? (
              <span className="ml-2 text-[10px] font-medium text-slate-600">
                {[entry.label, entry.pickupStopLabel]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
