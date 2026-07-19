import TrailerStatusBadge from "@/components/fleet/TrailerStatusBadge";
import TrailerTypeBadge from "@/components/fleet/trailers/TrailerTypeBadge";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type { TrailerAlphMetrics } from "@/lib/fleet/trailer-alph-alerts";
import { formatMileage } from "@/lib/services/fleet/fleet-helpers";
import type { Trailer, TrailerStatus } from "@/lib/types";
import { isReeferTrailer } from "@/lib/types";

type TrailerOverviewTabProps = {
  trailer: Trailer;
  operationalStatus: TrailerStatus;
  truckLabel?: string;
  alphMetrics: TrailerAlphMetrics;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-[13px] font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-[14px] font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

export default function TrailerOverviewTab({
  trailer,
  operationalStatus,
  truckLabel,
  alphMetrics,
}: TrailerOverviewTabProps) {
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
              <TrailerStatusBadge status={operationalStatus} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <dt className="text-[13px] font-medium text-slate-500">Type</dt>
            <dd>
              <TrailerTypeBadge type={trailer.type} />
            </dd>
          </div>
          <InfoRow label="VIN" value={trailer.vin ?? "—"} />
          <InfoRow label="Make" value={trailer.make ?? "—"} />
          <InfoRow label="Year" value={trailer.year ? String(trailer.year) : "—"} />
          <InfoRow label="License Plate" value={trailer.licensePlate} />
          <InfoRow label="State" value={trailer.licenseState ?? "—"} />
          <InfoRow
            label="Mileage"
            value={
              typeof trailer.mileage === "number"
                ? `${formatMileage(trailer.mileage)} mi`
                : "—"
            }
          />
          <InfoRow label="Location" value={trailer.location ?? "Unknown"} />
          <InfoRow
            label="Last Service"
            value={trailer.lastServiceDate ?? "Not recorded"}
          />
        </dl>
      </section>

      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold text-slate-950">Assignment</h2>
        <dl className="mt-3 divide-y divide-[#F1F5F9]">
          <InfoRow label="Truck" value={truckLabel ?? "Unassigned"} />
          <InfoRow
            label="Telematics"
            value={(trailer.telematicsProvider ?? "mock").toUpperCase()}
          />
          {isReeferTrailer(trailer) ? (
            <InfoRow
              label="Reefer OEM"
              value={(trailer.reeferOem ?? "mock").replaceAll("_", " ")}
            />
          ) : null}
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
          <div className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
            <p className="text-[12px] font-medium text-slate-500">Inspection due</p>
            <p className="mt-1 text-[22px] font-bold tabular-nums text-slate-950">
              {alphMetrics.inspectionDueDays === null
                ? "—"
                : alphMetrics.inspectionDueDays <= 0
                  ? "Now"
                  : `${alphMetrics.inspectionDueDays}d`}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
