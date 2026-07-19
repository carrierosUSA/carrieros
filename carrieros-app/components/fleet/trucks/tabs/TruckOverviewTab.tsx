import TruckStatusBadge from "@/components/fleet/TruckStatusBadge";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type { TruckAlphMetrics } from "@/lib/fleet/truck-alph-alerts";
import { formatMileage } from "@/lib/services/fleet/fleet-helpers";
import type { Truck, TruckStatus } from "@/lib/types";

type TruckOverviewTabProps = {
  truck: Truck;
  operationalStatus: TruckStatus;
  driverName?: string;
  trailerLabel?: string;
  alphMetrics: TruckAlphMetrics;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-[13px] font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-[14px] font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

export default function TruckOverviewTab({
  truck,
  operationalStatus,
  driverName,
  trailerLabel,
  alphMetrics,
}: TruckOverviewTabProps) {
  const riskTone =
    alphMetrics.breakdownRiskScore >= 70
      ? CARRIEROS_COLORS.critical
      : alphMetrics.breakdownRiskScore >= 45
        ? CARRIEROS_COLORS.warning
        : CARRIEROS_COLORS.success;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold text-slate-950">Equipment</h2>
        <dl className="mt-3 divide-y divide-[#F1F5F9]">
          <div className="flex items-center justify-between gap-4 py-2">
            <dt className="text-[13px] font-medium text-slate-500">Status</dt>
            <dd>
              <TruckStatusBadge status={operationalStatus} />
            </dd>
          </div>
          <InfoRow label="VIN" value={truck.vin} />
          <InfoRow label="Make / Model" value={`${truck.make} ${truck.model}`} />
          <InfoRow label="Year" value={String(truck.year)} />
          <InfoRow label="License Plate" value={truck.licensePlate} />
          <InfoRow label="State" value={truck.licenseState ?? "—"} />
          <InfoRow label="Mileage" value={`${formatMileage(truck.mileage)} mi`} />
          <InfoRow
            label="Engine Hours"
            value={
              typeof truck.engineHours === "number"
                ? formatMileage(truck.engineHours)
                : "—"
            }
          />
          <InfoRow label="Location" value={truck.location ?? "Unknown"} />
          <InfoRow
            label="Last Service"
            value={truck.lastServiceDate ?? "Not recorded"}
          />
        </dl>
      </section>

      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold text-slate-950">Assignment</h2>
        <dl className="mt-3 divide-y divide-[#F1F5F9]">
          <InfoRow label="Driver" value={driverName ?? "Unassigned"} />
          <InfoRow label="Trailer" value={trailerLabel ?? "None"} />
          <InfoRow
            label="Telematics"
            value={(truck.telematicsProvider ?? "mock").toUpperCase()}
          />
          <InfoRow
            label="MPG"
            value={typeof truck.mpg === "number" ? `${truck.mpg.toFixed(1)}` : "—"}
          />
          <InfoRow
            label="Idle Hours"
            value={
              typeof truck.idleHours === "number"
                ? `${truck.idleHours.toFixed(1)} hrs`
                : "—"
            }
          />
        </dl>
      </section>

      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA] lg:col-span-2">
        <h2 className="text-[15px] font-semibold text-slate-950">Alph metrics</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`rounded-[14px] px-4 py-3 ring-1 ${riskTone.bg} ${riskTone.border}`}>
            <p className="text-[12px] font-medium text-slate-500">Breakdown risk</p>
            <p className={`mt-1 text-[22px] font-bold tabular-nums ${riskTone.text}`}>
              {alphMetrics.breakdownRiskScore}
              <span className="text-[13px] font-semibold text-slate-500"> / 100</span>
            </p>
          </div>
          <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
            <p className="text-[12px] font-medium text-slate-500">Cost per mile</p>
            <p className="mt-1 text-[22px] font-bold tabular-nums text-slate-950">
              ${alphMetrics.costPerMile.toFixed(2)}
            </p>
          </div>
          <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
            <p className="text-[12px] font-medium text-slate-500">Service due</p>
            <p className="mt-1 text-[22px] font-bold tabular-nums text-slate-950">
              {alphMetrics.predictedServiceDueDays === null
                ? "—"
                : alphMetrics.predictedServiceDueDays <= 0
                  ? "Now"
                  : `${alphMetrics.predictedServiceDueDays}d`}
            </p>
          </div>
          <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
            <p className="text-[12px] font-medium text-slate-500">Tires in</p>
            <p className="mt-1 text-[22px] font-bold tabular-nums text-slate-950">
              {alphMetrics.tireReplacementMiles === null
                ? "—"
                : `${formatMileage(alphMetrics.tireReplacementMiles)} mi`}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
