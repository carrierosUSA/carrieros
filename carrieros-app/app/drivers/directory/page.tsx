import Link from "next/link";
import DriversSubNav from "@/components/drivers/DriversSubNav";
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
  searchParams: Promise<{ status?: string; q?: string }>;
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

  return (
    <OperationalPageShell
        title="Driver Directory"
        subtitle="Search, filter, and manage your full driver roster."
        eyebrow="People Operations"
        action={
          <Link
            href="/drivers/hiring/new"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Hire Driver
          </Link>
        }
      >

      <div className="mt-8">
        <DriversSubNav />
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
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
          getRowHref={(driver) => `/drivers/${driver.id}`}
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
              render: (driver) => (
                <Link href={`/drivers/${driver.id}`} className="font-semibold text-slate-500">
                  ⋯
                </Link>
              ),
            },
          ]}
        />
        <TablePagination total={drivers.length} />
      </div>
    </OperationalPageShell>
  );
}
