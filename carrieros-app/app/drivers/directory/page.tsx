import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import DriversSubNav from "@/components/drivers/DriversSubNav";
import DriverCard from "@/components/drivers/DriverCard";
import DriverFilters from "@/components/drivers/DriverFilters";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";
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
  const statusFilter = isDriverStatus(params.status) ? params.status : "all";

  const [drivers, counts] = await Promise.all([
    driverService.listDrivers(tenantId, {
      status: statusFilter,
      search: params.q,
    }),
    driverService.countByStatus(tenantId),
  ]);

  return (
    <>
      <PageHeader
        title="Driver Directory"
        subtitle="Search, filter, and manage your full driver roster."
      />

      <div className="mt-8">
        <DriversSubNav />
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-24 rounded-xl bg-zinc-900" />}>
          <DriverFilters counts={counts} />
        </Suspense>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {drivers.length > 0 ? (
          drivers.map((driver) => <DriverCard key={driver.id} driver={driver} />)
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 lg:col-span-2">
            <p className="text-lg font-semibold text-zinc-100">No drivers found</p>
            <p className="mt-2 text-sm text-zinc-400">
              Adjust filters or hire a new driver to get started.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
