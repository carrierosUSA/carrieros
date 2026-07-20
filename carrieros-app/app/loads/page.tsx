import { Suspense } from "react";
import DispatchFilters from "@/components/dispatch/DispatchFilters";
import { DispatchOperationsHeader } from "@/components/dispatch/DispatchOperationsHeader";
import DispatchPagination from "@/components/dispatch/DispatchPagination";
import DispatchSummaryChips from "@/components/dispatch/DispatchSummaryChips";
import DispatchTable from "@/components/dispatch/DispatchTable";
import DispatchTableSkeleton from "@/components/dispatch/DispatchTableSkeleton";
import { listBrokersByTenant } from "@/lib/data/brokers";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  computeDispatchSummary,
  enrichLoadRow,
  isDispatchFocus,
  isDispatchSortKey,
  isDispatchTab,
  paginateRows,
  parsePageSize,
  sortDispatchRows,
  type DispatchSearchParams,
} from "@/lib/dispatch/load-board";
import { FINANCE_TODAY } from "@/lib/finance/finance-board";
import { getDriverService } from "@/lib/services/drivers";
import { getLoadService } from "@/lib/services/loads";

type LoadsPageProps = {
  searchParams: Promise<DispatchSearchParams>;
};

async function DispatchBoard({ params }: { params: DispatchSearchParams }) {
  const tenantId = getActiveTenantId();
  const loadService = getLoadService();
  const driverService = getDriverService();

  const dispatchTab = isDispatchTab(params.tab) ? params.tab : "all";
  const focus = isDispatchFocus(params.focus) ? params.focus : undefined;
  const sortKey = isDispatchSortKey(params.sort) ? params.sort : "reference";
  const sortDir = params.dir === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const pageSize = parsePageSize(params.pageSize);

  const baseFilters = {
    search: params.q,
    driverId: params.driver,
    brokerId: params.broker,
    dateFrom: params.from,
    dateTo: params.to,
  };

  const [allLoads, filteredLoads, drivers, brokers] = await Promise.all([
    loadService.listLoads(tenantId, baseFilters),
    loadService.listLoads(tenantId, {
      ...baseFilters,
      dispatchTab: focus ? "all" : dispatchTab,
      focus,
      focusToday: FINANCE_TODAY,
    }),
    driverService.listDrivers(tenantId),
    Promise.resolve(listBrokersByTenant(tenantId)),
  ]);

  const summary = computeDispatchSummary(allLoads);
  const enrichedRows = filteredLoads.map(enrichLoadRow);
  const sortedRows = sortDispatchRows(enrichedRows, sortKey, sortDir);
  const pagination = paginateRows(sortedRows, page, pageSize);

  return (
    <div className="flex h-[calc(100dvh-88px)] min-h-[620px] flex-col overflow-hidden">
      <DispatchOperationsHeader
        totalCount={allLoads.length}
        stats={summary}
        visibleCount={pagination.rows.length}
        filteredCount={pagination.total}
      />
      <DispatchSummaryChips stats={summary} />
      <DispatchFilters
        params={params}
        drivers={drivers.map((driver) => ({ id: driver.id, name: driver.name }))}
        brokers={brokers.map((broker) => ({ id: broker.id, name: broker.name }))}
      />
      <DispatchTable
        rows={pagination.rows}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <DispatchPagination
        params={params}
        total={pagination.total}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}

export default async function LoadsPage({ searchParams }: LoadsPageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<DispatchTableSkeleton />}>
      <DispatchBoard params={params} />
    </Suspense>
  );
}
