import DriverDetailShell, { parseDriverTab } from "@/components/drivers/DriverDetailShell";
import { listDriverNotes, listDriverViolations } from "@/lib/drivers/driver-records";
import { requireDriver } from "@/lib/drivers/require-driver";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getDriverService } from "@/lib/services/drivers";
import { getLoadService } from "@/lib/services/loads";

type DriverDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function DriverDetailPage({
  params,
  searchParams,
}: DriverDetailPageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab = parseDriverTab(tab);
  const tenantId = getActiveTenantId();
  const driver = await requireDriver(id);
  const driverService = getDriverService();
  const loadService = getLoadService();

  const [
    loads,
    payroll,
    documents,
    safetyEvents,
    timeline,
    performance,
  ] = await Promise.all([
    loadService.listLoads(tenantId),
    driverService.listPayroll(tenantId, id),
    driverService.listDocuments(tenantId, id),
    driverService.listSafetyEvents(tenantId, id),
    driverService.listTimeline(tenantId, id),
    driverService.listPerformance(tenantId, id),
  ]);

  const assignedLoads = loads.filter((load) => load.driverId === driver.id);
  const violations = listDriverViolations(tenantId, id);
  const notes = listDriverNotes(tenantId, id);

  return (
    <div className="min-h-full p-4 lg:p-6">
      <DriverDetailShell
        driver={driver}
        loads={loads}
        assignedLoads={assignedLoads}
        payroll={payroll}
        documents={documents}
        safetyEvents={safetyEvents}
        violations={violations}
        notes={notes}
        timeline={timeline}
        performance={performance}
        activeTab={activeTab}
      />
    </div>
  );
}
