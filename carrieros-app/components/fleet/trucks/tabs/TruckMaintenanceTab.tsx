import Link from "next/link";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import { TRUCK_PM_CATEGORY_LABELS } from "@/lib/types";
import type { MaintenanceRecord, TruckPmItem } from "@/lib/types";
import { formatCurrency, formatMileage } from "@/lib/services/fleet/fleet-helpers";

type TruckMaintenanceTabProps = {
  pmItems: TruckPmItem[];
  records: MaintenanceRecord[];
  truckId?: string;
};

function pmTone(status: TruckPmItem["status"]) {
  switch (status) {
    case "overdue":
      return CARRIEROS_COLORS.critical;
    case "due_soon":
    case "scheduled":
      return CARRIEROS_COLORS.warning;
    default:
      return CARRIEROS_COLORS.success;
  }
}

export default function TruckMaintenanceTab({
  pmItems,
  records,
  truckId,
}: TruckMaintenanceTabProps) {
  const scheduleHref = truckId
    ? `/fleet/maintenance?tab=pm&create=1&truck=${truckId}`
    : "/fleet/maintenance?tab=pm&create=1";

  return (
    <div className="space-y-4">
      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold text-slate-950">PM Schedule</h2>
          <Link
            href={scheduleHref}
            className="inline-flex h-9 items-center rounded-full bg-[#2563EB] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
            title="Open fleet maintenance to schedule PM"
          >
            Schedule Maintenance
          </Link>
        </div>
        <ul className="mt-4 space-y-2">
          {pmItems.map((item) => {
            const tone = pmTone(item.status);
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8FAFC] px-3 py-3 ring-1 ring-[#EAEAEA]"
              >
                <div>
                  <p className="text-[13px] font-medium text-slate-400">
                    {TRUCK_PM_CATEGORY_LABELS[item.category]}
                  </p>
                  <p className="text-[14px] font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    {item.dueMileage
                      ? `Due at ${formatMileage(item.dueMileage)} mi`
                      : item.dueDate
                        ? `Due ${item.dueDate}`
                        : item.notes ?? ""}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.border}`}
                >
                  {item.status.replaceAll("_", " ")}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA]">
        <h2 className="text-[15px] font-semibold text-slate-950">Service History</h2>
        {records.length === 0 ? (
          <p className="mt-3 text-[14px] text-slate-500">No service records yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {records.map((record) => (
              <li
                key={record.id}
                className="rounded-[12px] bg-[#F8FAFC] px-3 py-3 ring-1 ring-[#EAEAEA]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[14px] font-semibold text-slate-900">{record.type}</p>
                  <p className="text-[13px] font-semibold text-slate-700">
                    {formatCurrency(record.cost)}
                  </p>
                </div>
                <p className="mt-1 text-[13px] text-slate-500">{record.description}</p>
                <p className="mt-1 text-[12px] text-slate-400">
                  {record.status.replaceAll("_", " ")} · {record.scheduledDate} ·{" "}
                  {formatMileage(record.mileage)} mi
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
