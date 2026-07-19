"use client";

import Link from "next/link";
import FleetUnitActionsMenu from "@/components/fleet/FleetUnitActionsMenu";
import type { FleetInventoryRow } from "@/lib/fleet/fleet-dashboard";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

type FleetInventoryListProps = {
  rows: FleetInventoryRow[];
  /** Emphasize maintenance column when viewing In Shop filter. */
  emphasizeMaintenance?: boolean;
};

const GRID_COLS =
  "xl:grid-cols-[minmax(132px,1.05fr)_96px_120px_72px_108px_minmax(100px,1fr)_minmax(96px,0.95fr)_minmax(100px,1fr)_minmax(96px,0.9fr)_minmax(108px,1.05fr)_minmax(112px,1.05fr)_80px_40px]";

function StatusPill({
  label,
  status,
}: {
  label: string;
  status: FleetInventoryRow["opsStatus"];
}) {
  const tone =
    status === "available"
      ? TRANSPO_COLORS.success
      : status === "on_load"
        ? TRANSPO_COLORS.info
        : status === "in_shop"
          ? TRANSPO_COLORS.warning
          : status === "out_of_service"
            ? TRANSPO_COLORS.critical
            : TRANSPO_COLORS.disabled;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.border}`}
    >
      {label}
    </span>
  );
}

function WarningChip({
  label,
  tone,
}: {
  label: string;
  tone: "warning" | "critical";
}) {
  const styles =
    tone === "critical" ? TRANSPO_COLORS.critical : TRANSPO_COLORS.warning;
  return (
    <span
      className={`inline-flex max-w-full truncate rounded-[8px] px-2 py-0.5 text-[12px] font-semibold ${styles.bg} ${styles.text}`}
      title={label}
    >
      {label}
    </span>
  );
}

function CellLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-[#94A3B8] xl:hidden">
      {children}
    </span>
  );
}

function AssignedCell({ row }: { row: FleetInventoryRow }) {
  if (row.assetKind === "truck") {
    if (row.trailerAssignedId && row.trailerAssignedLabel) {
      return (
        <Link
          href={`/fleet/trailers/${row.trailerAssignedId}`}
          className="block truncate text-[13px] font-medium text-[#2563EB] hover:underline"
        >
          {row.trailerAssignedLabel}
        </Link>
      );
    }
    return <p className="truncate text-[13px] text-[#94A3B8]">None</p>;
  }

  if (row.truckAssignedId && row.truckAssignedLabel) {
    return (
      <Link
        href={`/fleet/trucks/${row.truckAssignedId}`}
        className="block truncate text-[13px] font-medium text-[#2563EB] hover:underline"
        title="Truck this trailer is assigned to"
      >
        {row.truckAssignedLabel}
      </Link>
    );
  }

  return <p className="truncate text-[13px] text-[#94A3B8]">Unassigned</p>;
}

function FleetInventoryRowView({
  row,
  emphasizeMaintenance,
}: {
  row: FleetInventoryRow;
  emphasizeMaintenance: boolean;
}) {
  return (
    <div
      className={`group relative grid gap-3 border-b border-[#F1F5F9] px-4 py-3.5 last:border-b-0 hover:bg-[#F8FBFF] sm:px-5 xl:items-center xl:gap-3 ${GRID_COLS} ${
        emphasizeMaintenance && row.opsStatus === "in_shop"
          ? "bg-[#FFFBF5]"
          : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2 xl:block">
          <div className="min-w-0">
            <Link
              href={row.detailHref}
              className="block truncate text-[15px] font-semibold text-[#111827] transition hover:text-[#2563EB]"
            >
              {row.assetKind === "truck" ? "Unit" : "TRL"} {row.unitNumber}
            </Link>
            <p className="mt-0.5 truncate text-[12px] text-[#6B7280] xl:hidden">
              {row.equipmentTypeLabel}
              {row.sizeLabel !== "—" ? ` · ${row.sizeLabel}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 xl:hidden">
            <StatusPill label={row.statusLabel} status={row.opsStatus} />
            <FleetUnitActionsMenu row={row} />
          </div>
        </div>
      </div>

      <div className="hidden min-w-0 xl:block">
        <p className="truncate text-[13px] font-medium text-[#334155]">
          {row.assetTypeLabel}
        </p>
      </div>

      <div className="min-w-0">
        <CellLabel>Equipment Type</CellLabel>
        <p className="truncate text-[13px] font-semibold text-[#111827]">
          {row.equipmentTypeLabel}
        </p>
        <p className="mt-0.5 text-[12px] text-[#6B7280] xl:hidden">
          {row.assetTypeLabel}
        </p>
      </div>

      <div className="hidden min-w-0 xl:block">
        <p className="truncate text-[13px] text-[#334155]">{row.sizeLabel}</p>
      </div>

      <div className="hidden min-w-0 xl:block">
        <StatusPill label={row.statusLabel} status={row.opsStatus} />
      </div>

      <div className="min-w-0">
        <CellLabel>Driver</CellLabel>
        <p className="truncate text-[13px] font-semibold text-[#111827]">
          {row.driverName ?? "Unassigned"}
        </p>
      </div>

      <div className="min-w-0">
        <CellLabel>Current Load</CellLabel>
        {row.loadId && row.loadLabel ? (
          <Link
            href={`/loads/${row.loadId}`}
            className="block truncate text-[13px] font-semibold text-[#2563EB] hover:underline"
          >
            {row.loadLabel}
          </Link>
        ) : (
          <p className="truncate text-[13px] text-[#94A3B8]">None</p>
        )}
      </div>

      <div className="min-w-0">
        <CellLabel>Location</CellLabel>
        <p className="truncate text-[13px] font-medium text-[#334155]">
          {row.location ?? "Unknown"}
        </p>
      </div>

      <div className="hidden min-w-0 xl:block">
        <AssignedCell row={row} />
      </div>

      <div className="min-w-0">
        <CellLabel>Maintenance</CellLabel>
        {row.maintenanceLabel ? (
          <WarningChip
            label={row.maintenanceLabel}
            tone={row.maintenanceTone === "critical" ? "critical" : "warning"}
          />
        ) : (
          <p className="truncate text-[13px] text-[#94A3B8]">Clear</p>
        )}
      </div>

      <div className="min-w-0">
        <CellLabel>Compliance</CellLabel>
        {row.complianceLabel ? (
          <WarningChip
            label={row.complianceLabel}
            tone={row.complianceTone === "critical" ? "critical" : "warning"}
          />
        ) : (
          <p className="truncate text-[13px] text-[#94A3B8]">Clear</p>
        )}
      </div>

      <div className="hidden min-w-0 xl:block">
        <p className="truncate text-[12px] text-[#6B7280]">
          {row.lastUpdatedLabel ?? "—"}
        </p>
      </div>

      <div className="hidden justify-end xl:flex">
        <FleetUnitActionsMenu row={row} />
      </div>

      <div className="col-span-full flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#6B7280] xl:hidden">
        {row.assetKind === "truck" && row.trailerAssignedLabel ? (
          <span>Trailer {row.trailerAssignedLabel.replace(/^TRL\s/, "")}</span>
        ) : null}
        {row.assetKind === "trailer" && row.truckAssignedLabel ? (
          <span>{row.truckAssignedLabel}</span>
        ) : null}
        {row.lastUpdatedLabel ? <span>Updated {row.lastUpdatedLabel}</span> : null}
      </div>
    </div>
  );
}

export default function FleetInventoryList({
  rows,
  emphasizeMaintenance = false,
}: FleetInventoryListProps) {
  return (
    <div className="overflow-hidden rounded-[16px] bg-white shadow-[inset_0_0_0_1px_#EAEAEA]">
      <div
        className={`hidden border-b border-[#F1F5F9] bg-[#F8F9FB] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8] xl:grid xl:gap-3 ${GRID_COLS}`}
      >
        <span>Unit</span>
        <span>Asset Type</span>
        <span>Equipment Type</span>
        <span>Size</span>
        <span>Status</span>
        <span>Driver</span>
        <span>Current Load</span>
        <span>Location</span>
        <span>Trailer Assigned</span>
        <span className={emphasizeMaintenance ? "text-[#EA580C]" : undefined}>
          Maintenance
        </span>
        <span>Compliance</span>
        <span>Last Updated</span>
        <span className="sr-only">Actions</span>
      </div>

      <div>
        {rows.map((row) => (
          <FleetInventoryRowView
            key={`${row.assetKind}-${row.id}`}
            row={row}
            emphasizeMaintenance={emphasizeMaintenance}
          />
        ))}
      </div>
    </div>
  );
}
