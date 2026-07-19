import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import { computeFuelMetrics } from "@/lib/fleet/truck-board";
import { formatCurrency, formatMileage } from "@/lib/services/fleet/fleet-helpers";
import type { FuelRecord, Truck } from "@/lib/types";

type TruckFuelTabProps = {
  truck: Truck;
  fuelRecords: FuelRecord[];
};

export default function TruckFuelTab({ truck, fuelRecords }: TruckFuelTabProps) {
  const metrics = computeFuelMetrics(fuelRecords);
  const mpg = truck.mpg ?? metrics.avgMpg;
  const idleHours = truck.idleHours ?? 0;
  const lowMpg = mpg !== null && mpg < 5.8;
  const highIdle = idleHours > 18;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          className={`rounded-[14px] px-4 py-3 ring-1 ${
            lowMpg
              ? `${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.border}`
              : "bg-[#F8FAFC] ring-[#EAEAEA]"
          }`}
        >
          <p className="text-[12px] font-medium text-slate-500">MPG</p>
          <p
            className={`mt-1 text-[22px] font-bold tabular-nums ${
              lowMpg ? CARRIEROS_COLORS.warning.text : "text-slate-950"
            }`}
          >
            {mpg !== null ? mpg.toFixed(1) : "—"}
          </p>
        </div>
        <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
          <p className="text-[12px] font-medium text-slate-500">Fuel cost</p>
          <p className="mt-1 text-[22px] font-bold tabular-nums text-slate-950">
            {formatCurrency(metrics.totalCost)}
          </p>
        </div>
        <div
          className={`rounded-[14px] px-4 py-3 ring-1 ${
            highIdle
              ? `${CARRIEROS_COLORS.warning.bg} ${CARRIEROS_COLORS.warning.border}`
              : "bg-[#F8FAFC] ring-[#EAEAEA]"
          }`}
        >
          <p className="text-[12px] font-medium text-slate-500">Idle time</p>
          <p
            className={`mt-1 text-[22px] font-bold tabular-nums ${
              highIdle ? CARRIEROS_COLORS.warning.text : "text-slate-950"
            }`}
          >
            {idleHours.toFixed(1)}h
          </p>
        </div>
        <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
          <p className="text-[12px] font-medium text-slate-500">Gallons</p>
          <p className="mt-1 text-[22px] font-bold tabular-nums text-slate-950">
            {metrics.totalGallons.toFixed(0)}
          </p>
        </div>
      </div>

      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold text-slate-950">Fuel History</h2>
        {fuelRecords.length === 0 ? (
          <p className="mt-3 text-[14px] text-slate-500">No fuel fills recorded.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {fuelRecords.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8FAFC] px-3 py-3 ring-1 ring-[#EAEAEA]"
              >
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">
                    {record.location}
                  </p>
                  <p className="text-[12px] text-slate-500">
                    {record.date} · {record.gallons} gal ·{" "}
                    {formatMileage(record.mileage)} mi
                  </p>
                </div>
                <p className="text-[14px] font-bold text-slate-950">
                  {formatCurrency(record.cost)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
