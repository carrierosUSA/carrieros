import Link from "next/link";
import DriversSubNav from "@/components/drivers/DriversSubNav";
import DetailSlideOver, { DetailGrid, DetailSection } from "@/components/premium/DetailSlideOver";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getTruckLabel } from "@/lib/services/drivers/driver-helpers";
import { getDriverService } from "@/lib/services/drivers";
import { getLoadService } from "@/lib/services/loads";
import type { DriverStatus } from "@/lib/types";
import { DRIVER_STATUSES } from "@/lib/types";

type DirectoryPageProps = {
  searchParams: Promise<{ status?: string; q?: string; details?: string }>;
};

function isDriverStatus(value: string | undefined): value is DriverStatus {
  return !!value && DRIVER_STATUSES.includes(value as DriverStatus);
}

export default async function DriverDirectoryPage({ searchParams }: DirectoryPageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const driverService = getDriverService();
  const loadService = getLoadService();
  const statusFilter = isDriverStatus(params.status) ? params.status : "all";

  const [drivers, loads] = await Promise.all([
    driverService.listDrivers(tenantId, {
      status: statusFilter,
      search: params.q,
    }),
    loadService.listLoads(tenantId),
  ]);
  const selectedDriver = params.details
    ? drivers.find((driver) => driver.id === params.details)
    : undefined;
  const selectedLoad = selectedDriver
    ? loads.find((load) => load.driverId === selectedDriver.id)
    : undefined;

  return (
    <OperationalPageShell
        title="Driver Directory"
        subtitle="Search, filter, and manage your full driver roster."
        eyebrow="People Operations"
        action={
          <Link
            href="/drivers/hiring/new"
            className="rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            Hire Driver
          </Link>
        }
      >

      <div className="mt-8">
        <DriversSubNav />
      </div>

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <TableToolbar
          title="Drivers"
          resultCount={drivers.length}
          searchPlaceholder="Search drivers, phone, email..."
          filters={["All", "Active", "Onboarding", "Off Duty", "On Leave"]}
          activeFilter={statusFilter === "all" ? "All" : statusFilter}
          bulkActionLabel="Export"
        />
        <OperationalTable
          rows={drivers}
          getRowKey={(driver) => driver.id}
          getRowHref={(driver) => `/drivers/directory?details=${driver.id}`}
          emptyTitle="No drivers found"
          emptyDescription="Adjust filters or hire a new driver."
          columns={[
            {
              key: "driver",
              label: "Name",
              render: (driver) => (
                <span>
                  <span className="block font-semibold text-slate-950">
                    {driver.name}
                  </span>
                  <span className="block text-xs text-slate-500">{driver.id}</span>
                </span>
              ),
            },
            {
              key: "truck",
              label: "Assigned Truck",
              render: (driver) => getTruckLabel(driver.truckId) ?? "Unassigned",
            },
            { key: "trailer", label: "Assigned Trailer", render: () => "Pending" },
            { key: "phone", label: "Phone", render: (driver) => driver.phone },
            { key: "email", label: "Email", render: (driver) => driver.email },
            {
              key: "emergency",
              label: "Emergency Contact",
              render: () => "On file",
            },
            {
              key: "status",
              label: "Status",
              render: (driver) => (
                <PremiumStatusBadge
                  label={driver.status}
                  tone={
                    driver.status === "active"
                      ? "green"
                      : driver.status === "onboarding"
                        ? "amber"
                        : driver.status === "terminated"
                          ? "red"
                          : "slate"
                  }
                />
              ),
            },
            { key: "cdl", label: "CDL Expiry", render: (driver) => driver.licenseExpiresAt },
            {
              key: "medical",
              label: "Medical Card",
              render: (driver) => driver.medicalExpiresAt,
            },
            {
              key: "load",
              label: "Current Load",
              render: (driver) =>
                loads.find((load) => load.driverId === driver.id)?.reference ?? "None",
            },
            {
              key: "actions",
              label: "Actions",
              align: "center",
              render: () => <span className="font-semibold text-slate-500">Open</span>,
            },
          ]}
        />
        <TablePagination total={drivers.length} />
      </div>
      {selectedDriver ? (
        <DetailSlideOver
          title={selectedDriver.name}
          subtitle={`${selectedDriver.status} · ${selectedDriver.role}`}
          closeHref="/drivers/directory"
        >
          <DetailSection title="Driver Profile">
            <DetailGrid
              items={[
                { label: "Photo", value: "Driver image placeholder" },
                { label: "Name", value: selectedDriver.name },
                { label: "Phone", value: selectedDriver.phone },
                { label: "Emergency Contact", value: "On file" },
                { label: "Address", value: selectedDriver.location },
                { label: "Truck", value: getTruckLabel(selectedDriver.truckId) ?? "Unassigned" },
                { label: "Trailer", value: "Pending" },
                { label: "Status", value: selectedDriver.status },
              ]}
            />
          </DetailSection>
          <DetailSection title="Payroll, Mileage & Settlements">
            <DetailGrid
              items={[
                { label: "Pay Type", value: selectedDriver.payType.replace("_", " ") },
                { label: "Pay Rate", value: selectedDriver.payRate.toString() },
                { label: "Mileage", value: selectedLoad?.miles.toLocaleString() ?? "No active load" },
                { label: "Settlement", value: "Ready in Payroll" },
              ]}
            />
          </DetailSection>
          <DetailSection title="Medical, CDL & Violations">
            <DetailGrid
              items={[
                { label: "Medical Expiry", value: selectedDriver.medicalExpiresAt },
                { label: "CDL Expiry", value: selectedDriver.licenseExpiresAt },
                { label: "License State", value: selectedDriver.licenseState },
                { label: "Violations", value: "No open violations" },
              ]}
            />
          </DetailSection>
          <DetailSection title="Documents, Training & Notes">
            <p className="text-sm leading-6 text-slate-600">
              Documents, training records, internal notes, and Nova driver recommendations stay connected to this profile.
            </p>
            <Link href={`/drivers/${selectedDriver.id}`} className="mt-3 inline-block text-sm font-semibold text-blue-600">
              Open full profile
            </Link>
          </DetailSection>
        </DetailSlideOver>
      ) : null}
    </OperationalPageShell>
  );
}
