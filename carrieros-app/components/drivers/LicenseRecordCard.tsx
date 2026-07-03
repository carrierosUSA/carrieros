import type { DriverLicenseRecord } from "@/lib/types";

type LicenseRecordCardProps = {
  record: DriverLicenseRecord;
  driverName: string;
};

export default function LicenseRecordCard({
  record,
  driverName,
}: LicenseRecordCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-400">{record.class}</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">{driverName}</h2>
        </div>
        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold capitalize text-zinc-300">
          {record.status}
        </span>
      </div>
      <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <p>
          <span className="text-zinc-500">Number:</span> {record.number}
        </p>
        <p>
          <span className="text-zinc-500">State:</span> {record.state}
        </p>
        <p>
          <span className="text-zinc-500">Expires:</span> {record.expiresAt}
        </p>
      </div>
    </div>
  );
}
