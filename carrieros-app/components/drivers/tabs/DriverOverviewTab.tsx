import DriverOperationalBadge from "@/components/drivers/DriverOperationalBadge";
import { formatPayRate, getTruckLabel } from "@/lib/services/drivers/driver-helpers";
import type { Driver, DriverOperationalStatus, DriverPerformanceMetric } from "@/lib/types";

type DriverOverviewTabProps = {
  driver: Driver;
  performance: DriverPerformanceMetric[];
  operationalStatus: DriverOperationalStatus;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-[13px] font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-[14px] font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

export default function DriverOverviewTab({
  driver,
  performance,
  operationalStatus,
}: DriverOverviewTabProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#E5E7EB]">
        <h2 className="text-[15px] font-semibold text-slate-950">Driver Profile</h2>
        <dl className="mt-3 divide-y divide-[#F1F5F9]">
          <div className="flex items-center justify-between gap-4 py-2">
            <dt className="text-[13px] font-medium text-slate-500">Status</dt>
            <dd>
              <DriverOperationalBadge status={operationalStatus} />
            </dd>
          </div>
          <InfoRow label="Phone" value={driver.phone} />
          <InfoRow label="Email" value={driver.email} />
          <InfoRow label="Home Terminal" value={driver.homeTerminal ?? driver.location} />
          <InfoRow label="License State" value={driver.licenseState} />
          <InfoRow label="Hire Date" value={formatDate(driver.hireDate)} />
          <InfoRow label="Assigned Truck" value={getTruckLabel(driver.truckId) ?? "Unassigned"} />
          <InfoRow label="Pay" value={formatPayRate(driver)} />
        </dl>
      </section>

      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#E5E7EB]">
        <h2 className="text-[15px] font-semibold text-slate-950">Compliance</h2>
        <dl className="mt-3 divide-y divide-[#F1F5F9]">
          <InfoRow label="CDL Class" value={driver.licenseClass} />
          <InfoRow label="CDL Number" value={driver.licenseNumber} />
          <InfoRow label="CDL Expires" value={formatDate(driver.licenseExpiresAt)} />
          <InfoRow label="Medical Expires" value={formatDate(driver.medicalExpiresAt)} />
          {driver.drugTestDueAt ? (
            <InfoRow label="Drug Test Due" value={formatDate(driver.drugTestDueAt)} />
          ) : null}
          {driver.annualReviewDueAt ? (
            <InfoRow label="Annual Review" value={formatDate(driver.annualReviewDueAt)} />
          ) : null}
          {typeof driver.hoursRemaining === "number" ? (
            <InfoRow
              label="Hours Remaining"
              value={`${driver.hoursRemaining.toFixed(1)} hrs`}
            />
          ) : null}
        </dl>
      </section>

      {performance.length > 0 ? (
        <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#E5E7EB] lg:col-span-2">
          <h2 className="text-[15px] font-semibold text-slate-950">Performance</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {performance.map((metric) => (
              <div
                key={metric.id}
                className="rounded-[12px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#E5E7EB]"
              >
                <p className="text-[12px] font-medium text-slate-500">{metric.label}</p>
                <p className="mt-1 text-[20px] font-bold text-slate-950">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
