import Link from "next/link";
import type { ReactNode } from "react";
import { CARRIEROS_COLORS } from "@/lib/design-system/colors";
import type { MaintenanceModuleTab } from "@/components/fleet/maintenance/MaintenanceModuleTabs";
import type { MaintenanceReportSummary } from "@/lib/types/maintenance";
import type { Trailer, Truck } from "@/lib/types";
import type {
  Mechanic,
  MaintenanceVendor,
  PartInventoryItem,
  PmSchedule,
  RepairRecord,
  ServiceHistoryEvent,
  TireAsset,
  WarrantyRecord,
  WorkOrder,
} from "@/lib/types/maintenance";
import {
  PM_SERVICE_TYPE_LABELS,
  PM_SCHEDULE_STATUS_LABELS,
  PM_TRACK_BY_LABELS,
  REPAIR_STATUS_LABELS,
  TIRE_POSITION_LABELS,
  VENDOR_CATEGORY_LABELS,
  WARRANTY_CATEGORY_LABELS,
  WARRANTY_STATUS_LABELS,
  WORK_ORDER_PRIORITY_LABELS,
  WORK_ORDER_STATUS_LABELS,
} from "@/lib/types/maintenance";
import { formatCurrency, formatMileage } from "@/lib/services/fleet/fleet-helpers";
import type { MaintenanceIntegrationStatus } from "@/lib/fleet/maintenance-integrations";

type PanelsProps = {
  tab: MaintenanceModuleTab;
  trucks: Truck[];
  trailers: Trailer[];
  pmSchedules: PmSchedule[];
  workOrders: WorkOrder[];
  repairs: RepairRecord[];
  mechanics: Mechanic[];
  parts: PartInventoryItem[];
  vendors: MaintenanceVendor[];
  tires: TireAsset[];
  warranties: WarrantyRecord[];
  serviceHistory: ServiceHistoryEvent[];
  reports: MaintenanceReportSummary;
  integrations: MaintenanceIntegrationStatus[];
  lowStockIds: Set<string>;
};

function truckLabel(trucks: Truck[], id?: string) {
  if (!id) return null;
  const t = trucks.find((x) => x.id === id);
  return t ? `Unit ${t.unitNumber}` : id;
}

function trailerLabel(trailers: Trailer[], id?: string) {
  if (!id) return null;
  const t = trailers.find((x) => x.id === id);
  return t ? `Trailer ${t.unitNumber}` : id;
}

function unitLine(
  trucks: Truck[],
  trailers: Trailer[],
  truckId?: string,
  trailerId?: string,
) {
  return [truckLabel(trucks, truckId), trailerLabel(trailers, trailerId)]
    .filter(Boolean)
    .join(" · ");
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[16px] bg-[#F8FAFC] px-6 py-12 text-center ring-1 ring-[#EAEAEA]">
      <p className="text-[15px] font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-[14px] text-slate-500">{detail}</p>
    </div>
  );
}

function RowCard({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-[14px] bg-[#F8FAFC] px-4 py-3 ring-1 ring-[#EAEAEA]">
      {children}
    </li>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: keyof typeof CARRIEROS_COLORS;
}) {
  const c = CARRIEROS_COLORS[tone];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${c.bg} ${c.text} ${c.border}`}
    >
      {label}
    </span>
  );
}

function pmTone(status: PmSchedule["status"]) {
  if (status === "overdue") return "critical" as const;
  if (status === "due_soon") return "warning" as const;
  if (status === "completed") return "success" as const;
  return "info" as const;
}

function woTone(status: WorkOrder["status"]) {
  if (status === "waiting_parts") return "warning" as const;
  if (status === "in_progress") return "info" as const;
  if (status === "completed" || status === "closed") return "success" as const;
  return "disabled" as const;
}

function priorityTone(priority: WorkOrder["priority"]) {
  if (priority === "critical") return "critical" as const;
  if (priority === "high") return "warning" as const;
  return "info" as const;
}

export default function MaintenanceModulePanels(props: PanelsProps) {
  switch (props.tab) {
    case "pm":
      return <PmPanel {...props} />;
    case "work_orders":
      return <WorkOrdersPanel {...props} />;
    case "repairs":
      return <RepairsPanel {...props} />;
    case "mechanics":
      return <MechanicsPanel {...props} />;
    case "parts":
      return <PartsPanel {...props} />;
    case "vendors":
      return <VendorsPanel {...props} />;
    case "tires":
      return <TiresPanel {...props} />;
    case "warranty":
      return <WarrantyPanel {...props} />;
    case "history":
      return <HistoryPanel {...props} />;
    default:
      return null;
  }
}

function ReportsStrip({
  reports,
  integrations,
}: {
  reports: MaintenanceReportSummary;
  integrations: MaintenanceIntegrationStatus[];
}) {
  const metrics = [
    { label: "Cost / Truck", value: formatCurrency(reports.costPerTruck) },
    { label: "Cost / Trailer", value: formatCurrency(reports.costPerTrailer) },
    { label: "Cost / Mile", value: `$${reports.costPerMile.toFixed(2)}` },
    { label: "Downtime (mo)", value: `${reports.downtimeHoursMonth}h` },
    { label: "PM Compliance", value: `${reports.pmCompliancePercent}%` },
    { label: "Vendor Rating", value: reports.vendorAvgRating.toFixed(1) },
    { label: "Tire Cost", value: formatCurrency(reports.tireCostMonth) },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-[12px] bg-white px-3 py-2.5 ring-1 ring-[#EAEAEA]"
          >
            <p className="text-[11px] font-medium text-slate-500">{m.label}</p>
            <p className="mt-0.5 text-[15px] font-bold tabular-nums text-slate-950">
              {m.value}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-[14px] bg-white px-4 py-3 ring-1 ring-[#EAEAEA]">
        <p className="text-[13px] font-semibold text-slate-900">
          Integrations ready
        </p>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Connect telematics, OEM, reefer, and shop systems when you are ready —
          no live sync yet.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {integrations.map((item) => (
            <span
              key={item.provider}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-[#EAEAEA]"
              title={item.capabilities.join(", ")}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PmPanel(props: PanelsProps) {
  const { pmSchedules, trucks, trailers, reports, integrations } = props;
  if (pmSchedules.length === 0) {
    return (
      <EmptyState
        title="No PM schedules"
        detail="Add mileage, hours, or calendar-based preventive service."
      />
    );
  }

  return (
    <div className="space-y-4">
      <ReportsStrip reports={reports} integrations={integrations} />
      <ul className="space-y-2">
        {pmSchedules.map((pm) => (
          <RowCard key={pm.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-medium text-slate-400">
                  {PM_TRACK_BY_LABELS[pm.trackBy]} · every {pm.intervalValue}
                </p>
                <p className="text-[15px] font-semibold text-slate-950">
                  {pm.customLabel ?? PM_SERVICE_TYPE_LABELS[pm.serviceType]}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {unitLine(trucks, trailers, pm.truckId, pm.trailerId)}
                  {pm.nextDueMileage
                    ? ` · Due ${formatMileage(pm.nextDueMileage)} mi`
                    : pm.nextDueEngineHours
                      ? ` · Due ${formatMileage(pm.nextDueEngineHours)} hrs`
                      : pm.nextDueAt
                        ? ` · Due ${pm.nextDueAt}`
                        : ""}
                </p>
                {pm.notes ? (
                  <p className="mt-1 text-[13px] text-slate-500">{pm.notes}</p>
                ) : null}
              </div>
              <StatusPill
                label={PM_SCHEDULE_STATUS_LABELS[pm.status]}
                tone={pmTone(pm.status)}
              />
            </div>
          </RowCard>
        ))}
      </ul>
    </div>
  );
}

function WorkOrdersPanel(props: PanelsProps) {
  const { workOrders, trucks, trailers, mechanics, vendors } = props;
  if (workOrders.length === 0) {
    return (
      <EmptyState
        title="No work orders"
        detail="Create a work order to assign shop work in one click."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {workOrders.map((wo) => {
        const mechanic = mechanics.find((m) => m.id === wo.mechanicId);
        const vendor = vendors.find((v) => v.id === wo.vendorId);
        return (
          <RowCard key={wo.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-slate-400">
                  {wo.number}
                </p>
                <p className="text-[15px] font-semibold text-slate-950">
                  {wo.title}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {unitLine(trucks, trailers, wo.truckId, wo.trailerId)}
                  {mechanic ? ` · ${mechanic.name}` : " · Unassigned"}
                  {vendor ? ` · ${vendor.name}` : ""}
                </p>
                <p className="mt-1 text-[13px] text-slate-500">{wo.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusPill
                  label={WORK_ORDER_STATUS_LABELS[wo.status]}
                  tone={woTone(wo.status)}
                />
                <StatusPill
                  label={WORK_ORDER_PRIORITY_LABELS[wo.priority]}
                  tone={priorityTone(wo.priority)}
                />
                <p className="text-[13px] font-semibold text-slate-700">
                  {formatCurrency(wo.actualCost ?? wo.estimatedCost ?? 0)}
                </p>
              </div>
            </div>
          </RowCard>
        );
      })}
    </ul>
  );
}

function RepairsPanel(props: PanelsProps) {
  const { repairs, trucks, trailers } = props;
  if (repairs.length === 0) {
    return (
      <EmptyState
        title="No repairs logged"
        detail="Complaints, diagnosis, labor, and invoices appear here."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {repairs.map((repair) => (
        <RowCard key={repair.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium text-slate-400">
                {unitLine(trucks, trailers, repair.truckId, repair.trailerId)}
                {repair.invoiceNumber ? ` · ${repair.invoiceNumber}` : ""}
              </p>
              <p className="text-[15px] font-semibold text-slate-950">
                {repair.complaint}
              </p>
              {repair.diagnosis ? (
                <p className="mt-1 text-[13px] text-slate-600">
                  Diagnosis: {repair.diagnosis}
                </p>
              ) : null}
              {repair.repairSummary ? (
                <p className="mt-0.5 text-[13px] text-slate-500">
                  Repair: {repair.repairSummary}
                </p>
              ) : null}
              <p className="mt-2 text-[12px] text-slate-500">
                {repair.laborHours}h labor · {repair.partsUsed.length} parts ·{" "}
                {repair.photoCount} photos
                {repair.warrantyCovered ? " · Warranty" : ""}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <StatusPill
                label={REPAIR_STATUS_LABELS[repair.status]}
                tone={
                  repair.status === "completed"
                    ? "success"
                    : repair.status === "waiting_parts"
                      ? "warning"
                      : "info"
                }
              />
              <p className="text-[14px] font-bold text-slate-900">
                {formatCurrency(repair.cost)}
              </p>
            </div>
          </div>
        </RowCard>
      ))}
    </ul>
  );
}

function MechanicsPanel(props: PanelsProps) {
  const { mechanics, vendors } = props;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {mechanics.map((m) => {
        const vendor = vendors.find((v) => v.id === m.vendorId);
        const tone =
          m.status === "available"
            ? "success"
            : m.status === "busy"
              ? "warning"
              : "disabled";
        return (
          <RowCard key={m.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[15px] font-semibold text-slate-950">{m.name}</p>
                <p className="mt-0.5 text-[13px] text-slate-500">{m.specialty}</p>
                {vendor ? (
                  <p className="mt-1 text-[12px] text-slate-400">{vendor.name}</p>
                ) : (
                  <p className="mt-1 text-[12px] text-slate-400">In-house</p>
                )}
              </div>
              <StatusPill
                label={m.status.replace("_", " ")}
                tone={tone}
              />
            </div>
            <p className="mt-3 text-[13px] text-slate-600">
              {m.activeWorkOrders} open WO · ★ {m.rating.toFixed(1)}
            </p>
            {m.phone ? (
              <p className="mt-1 text-[13px] font-medium text-[#2563EB]">{m.phone}</p>
            ) : null}
          </RowCard>
        );
      })}
    </ul>
  );
}

function PartsPanel(props: PanelsProps) {
  const { parts, vendors, lowStockIds } = props;
  return (
    <ul className="space-y-2">
      {parts.map((part) => {
        const vendor = vendors.find((v) => v.id === part.vendorId);
        const low = lowStockIds.has(part.id);
        return (
          <RowCard key={part.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold text-slate-400">
                  {part.partNumber}
                </p>
                <p className="text-[15px] font-semibold text-slate-950">
                  {part.name}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {part.location}
                  {vendor ? ` · ${vendor.name}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {low ? (
                  <StatusPill label="Low stock" tone="warning" />
                ) : (
                  <StatusPill label="In stock" tone="success" />
                )}
                <p className="text-[14px] font-bold tabular-nums text-slate-900">
                  {part.stock} on hand
                </p>
                <p className="text-[12px] text-slate-500">
                  Reorder at {part.reorderLevel} · {formatCurrency(part.unitCost)}
                </p>
              </div>
            </div>
          </RowCard>
        );
      })}
    </ul>
  );
}

function VendorsPanel(props: PanelsProps) {
  const { vendors } = props;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {vendors.map((vendor) => (
        <RowCard key={vendor.id}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[12px] font-medium text-slate-400">
                {VENDOR_CATEGORY_LABELS[vendor.category]}
              </p>
              <p className="text-[15px] font-semibold text-slate-950">
                {vendor.name}
              </p>
              <p className="mt-0.5 text-[13px] text-slate-500">
                {[vendor.city, vendor.state].filter(Boolean).join(", ")}
              </p>
            </div>
            {vendor.preferred ? (
              <StatusPill label="Preferred" tone="info" />
            ) : null}
          </div>
          <p className="mt-3 text-[13px] text-slate-600">
            ★ {vendor.rating.toFixed(1)} · {vendor.jobsCompleted} jobs · avg{" "}
            {vendor.avgTurnaroundDays}d
          </p>
          {vendor.companyId ? (
            <Link
              href={`/companies/${vendor.companyId}`}
              className="mt-2 inline-flex text-[13px] font-semibold text-[#2563EB] hover:underline"
            >
              Open in Companies
            </Link>
          ) : null}
        </RowCard>
      ))}
    </ul>
  );
}

function TiresPanel(props: PanelsProps) {
  const { tires, trucks, trailers } = props;
  return (
    <ul className="space-y-2">
      {tires.map((tire) => {
        const wearTone =
          tire.treadDepthMm < 5
            ? "critical"
            : tire.treadDepthMm < 7
              ? "warning"
              : "success";
        return (
          <RowCard key={tire.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-medium text-slate-400">
                  {TIRE_POSITION_LABELS[tire.position]} ·{" "}
                  {unitLine(trucks, trailers, tire.truckId, tire.trailerId)}
                </p>
                <p className="text-[15px] font-semibold text-slate-950">
                  {tire.brand}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {tire.size} · Installed {tire.installDate} @{" "}
                  {formatMileage(tire.installMileage)} mi
                </p>
                <p className="mt-1 text-[12px] text-slate-500">
                  {tire.rotations} rotations · {tire.repairs} repairs · Now{" "}
                  {formatMileage(tire.currentMileage)} mi
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusPill
                  label={`${tire.treadDepthMm} mm tread`}
                  tone={wearTone}
                />
                <p className="text-[14px] font-bold text-slate-900">
                  {formatCurrency(tire.cost)}
                </p>
              </div>
            </div>
          </RowCard>
        );
      })}
    </ul>
  );
}

function WarrantyPanel(props: PanelsProps) {
  const { warranties, trucks, trailers } = props;
  return (
    <ul className="space-y-2">
      {warranties.map((w) => {
        const tone =
          w.status === "expired"
            ? "disabled"
            : w.status === "expiring_soon"
              ? "warning"
              : w.status === "claimed"
                ? "info"
                : "success";
        return (
          <RowCard key={w.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-medium text-slate-400">
                  {WARRANTY_CATEGORY_LABELS[w.category]} · {w.provider}
                </p>
                <p className="text-[15px] font-semibold text-slate-950">
                  {w.coverageSummary}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {unitLine(trucks, trailers, w.truckId, w.trailerId)} ·{" "}
                  {w.policyNumber}
                </p>
                <p className="mt-1 text-[12px] text-slate-500">
                  {w.startDate} → {w.endDate}
                </p>
              </div>
              <StatusPill
                label={WARRANTY_STATUS_LABELS[w.status]}
                tone={tone}
              />
            </div>
          </RowCard>
        );
      })}
    </ul>
  );
}

function HistoryPanel(props: PanelsProps) {
  const { serviceHistory, trucks, trailers, reports, integrations } = props;
  const sorted = [...serviceHistory].sort(
    (a, b) => b.occurredAt.localeCompare(a.occurredAt),
  );

  return (
    <div className="space-y-4">
      <ReportsStrip reports={reports} integrations={integrations} />
      {sorted.length === 0 ? (
        <EmptyState
          title="No service history yet"
          detail="Every PM, repair, and breakdown lands on this timeline automatically."
        />
      ) : (
        <ol className="relative space-y-0 border-l-2 border-[#EAEAEA] pl-4">
          {sorted.map((event) => (
            <li key={event.id} className="relative pb-5 last:pb-0">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#2563EB] ring-4 ring-white" />
              <p className="text-[12px] font-medium text-slate-400">
                {new Date(event.occurredAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="mt-0.5 text-[15px] font-semibold text-slate-950">
                {event.label}
              </p>
              <p className="text-[13px] text-slate-500">
                {unitLine(trucks, trailers, event.truckId, event.trailerId)}
                {event.detail ? ` · ${event.detail}` : ""}
                {event.cost != null ? ` · ${formatCurrency(event.cost)}` : ""}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
