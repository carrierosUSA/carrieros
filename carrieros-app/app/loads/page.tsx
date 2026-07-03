import Link from "next/link";
import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import NovaAlert from "@/components/NovaAlert";
import LoadCard from "@/components/loads/LoadCard";
import LoadFilters from "@/components/loads/LoadFilters";
import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getDriverById } from "@/lib/data/drivers";
import { getActiveTenantId } from "@/lib/data/tenant";
import { getLoadService } from "@/lib/services/loads";
import type { Load, LoadStatus } from "@/lib/types";
import { LOAD_STATUSES } from "@/lib/types";

type LoadsPageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
};

function isLoadStatus(value: string | undefined): value is LoadStatus {
  return !!value && LOAD_STATUSES.includes(value as LoadStatus);
}

function resolveLoadLabels(load: Load) {
  return {
    customerName: getCustomerById(load.customerId)?.name ?? "Unknown customer",
    brokerName: load.brokerId ? getBrokerById(load.brokerId)?.name : undefined,
    driverName: load.driverId ? getDriverById(load.driverId)?.name : undefined,
  };
}

export default async function LoadsPage({ searchParams }: LoadsPageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const loadService = getLoadService();
  const statusFilter = isLoadStatus(params.status) ? params.status : "all";

  const [loads, counts] = await Promise.all([
    loadService.listLoads(tenantId, {
      status: statusFilter,
      search: params.q,
    }),
    loadService.countByStatus(tenantId),
  ]);

  const attentionCount = loads.filter(
    (load) => load.complianceStatus === "attention",
  ).length;

  return (
    <>
      <PageHeader
        title="Dispatch"
        subtitle="Create, assign, and track work across the carrier business."
        action={
          <Link
            href="/loads/new"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            + Create Load
          </Link>
        }
      />

      {attentionCount > 0 ? (
        <NovaAlert
          message={`${attentionCount} load${attentionCount === 1 ? "" : "s"} need dispatcher or compliance attention.`}
        />
      ) : (
        <NovaAlert message="All visible loads are compliant and on track." />
      )}

      <div className="mt-8">
        <Suspense fallback={<div className="h-24 rounded-xl bg-zinc-900" />}>
          <LoadFilters counts={counts} />
        </Suspense>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {loads.length > 0 ? (
          loads.map((load) => (
            <LoadCard key={load.id} load={load} {...resolveLoadLabels(load)} />
          ))
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 lg:col-span-2">
            <p className="text-lg font-semibold text-zinc-100">No loads found</p>
            <p className="mt-2 text-sm text-zinc-400">
              Adjust filters or create a new load to get started.
            </p>
            <Link
              href="/loads/new"
              className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Start Demo Workflow →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
