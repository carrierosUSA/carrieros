import Link from "next/link";
import NovaAlert from "@/components/NovaAlert";
import DetailSlideOver, { DetailGrid, DetailSection } from "@/components/premium/DetailSlideOver";
import OperationalPageShell from "@/components/premium/OperationalPageShell";
import OperationalTable from "@/components/premium/OperationalTable";
import PremiumStatusBadge from "@/components/premium/StatusBadge";
import TablePagination from "@/components/premium/TablePagination";
import TableToolbar from "@/components/premium/TableToolbar";
import { getBrokerById } from "@/lib/data/brokers";
import { getCustomerById } from "@/lib/data/customers";
import { getDriverById } from "@/lib/data/drivers";
import { getTruckById } from "@/lib/data/trucks";
import { getActiveTenantId } from "@/lib/data/tenant";
import { formatCurrency } from "@/lib/services/loads/load-helpers";
import { getLoadService } from "@/lib/services/loads";
import type { Load, LoadStatus } from "@/lib/types";
import { LOAD_STATUSES } from "@/lib/types";

type LoadsPageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
    details?: string;
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
    truckLabel: load.truckId ? `Unit ${getTruckById(load.truckId)?.unitNumber ?? load.truckId}` : undefined,
  };
}

export default async function LoadsPage({ searchParams }: LoadsPageProps) {
  const params = await searchParams;
  const tenantId = getActiveTenantId();
  const loadService = getLoadService();
  const statusFilter = isLoadStatus(params.status) ? params.status : "all";

  const loads = await loadService.listLoads(tenantId, {
    status: statusFilter,
    search: params.q,
  });

  const attentionCount = loads.filter(
    (load) => load.complianceStatus === "attention",
  ).length;
  const selectedLoad = params.details
    ? loads.find((load) => load.id === params.details)
    : undefined;
  const selectedLabels = selectedLoad ? resolveLoadLabels(selectedLoad) : undefined;

  return (
    <OperationalPageShell
        title="Dispatch"
        subtitle="Create, assign, and track work across the carrier business."
        eyebrow="Load Board"
        action={
          <Link
            href="/loads/new"
            className="rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            Create Load
          </Link>
        }
      >

      {attentionCount > 0 ? (
        <NovaAlert
          message={`${attentionCount} load${attentionCount === 1 ? "" : "s"} need dispatcher or compliance attention.`}
        />
      ) : (
        <NovaAlert message="All visible loads are compliant and on track." />
      )}

      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <TableToolbar
          title="Loads"
          resultCount={loads.length}
          searchPlaceholder="Search loads, drivers, brokers..."
          filters={["All", "Dispatched", "In Transit", "Delivered", "Attention"]}
          activeFilter={statusFilter === "all" ? "All" : statusFilter.replace("_", " ")}
        />
        <OperationalTable
          rows={loads}
          getRowKey={(load) => load.id}
          getRowHref={(load) => `/loads?details=${load.id}`}
          emptyTitle="No loads found"
          emptyDescription="Adjust filters or create a new load."
          columns={[
            {
              key: "load",
              label: "Load #",
              render: (load) => (
                <span className="font-semibold text-slate-950">{load.reference}</span>
              ),
            },
            {
              key: "broker",
              label: "Broker",
              render: (load) => resolveLoadLabels(load).brokerName ?? "Direct",
            },
            {
              key: "customer",
              label: "Customer",
              render: (load) => resolveLoadLabels(load).customerName,
            },
            {
              key: "pickup",
              label: "Pickup",
              render: (load) => `${load.origin.city}, ${load.origin.state}`,
            },
            {
              key: "delivery",
              label: "Delivery",
              render: (load) => `${load.destination.city}, ${load.destination.state}`,
            },
            { key: "equipment", label: "Equipment", render: () => "Dry Van" },
            {
              key: "driver",
              label: "Driver",
              render: (load) => resolveLoadLabels(load).driverName ?? "Unassigned",
            },
            {
              key: "truck",
              label: "Truck",
              render: (load) => resolveLoadLabels(load).truckLabel ?? "Unassigned",
            },
            { key: "trailer", label: "Trailer", render: () => "Pending" },
            {
              key: "rate",
              label: "Rate",
              align: "right",
              render: (load) => (
                <span className="font-semibold text-slate-950">
                  {formatCurrency(load.rate)}
                </span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (load) => (
                <PremiumStatusBadge
                  label={load.status.replace("_", " ")}
                  tone={
                    load.status === "delivered" || load.status === "invoiced"
                      ? "green"
                      : load.status === "pending"
                        ? "amber"
                        : "blue"
                  }
                />
              ),
            },
            {
              key: "documents",
              label: "Documents",
              render: (load) => (
                <PremiumStatusBadge
                  label={load.documentIds.length ? "Uploaded" : "Missing"}
                  tone={load.documentIds.length ? "green" : "amber"}
                />
              ),
            },
            {
              key: "tracking",
              label: "Tracking",
              render: (load) => (
                <PremiumStatusBadge
                  label={load.trackingEnabled ? "Live" : "Off"}
                  tone={load.trackingEnabled ? "blue" : "slate"}
                />
              ),
            },
            {
              key: "actions",
              label: "Actions",
              align: "center",
              render: () => <span className="font-semibold text-slate-500">Open</span>,
            },
          ]}
        />
        <TablePagination total={loads.length} />
      </div>
      {selectedLoad && selectedLabels ? (
        <DetailSlideOver
          title={selectedLoad.reference}
          subtitle={`${selectedLoad.origin.city}, ${selectedLoad.origin.state} → ${selectedLoad.destination.city}, ${selectedLoad.destination.state}`}
          closeHref="/loads"
        >
          <DetailSection title="Overview">
            <DetailGrid
              items={[
                { label: "Broker", value: selectedLabels.brokerName ?? "Direct" },
                { label: "Customer", value: selectedLabels.customerName },
                { label: "Driver", value: selectedLabels.driverName ?? "Unassigned" },
                { label: "Truck", value: selectedLabels.truckLabel ?? "Unassigned" },
                { label: "Trailer", value: "Pending" },
                { label: "Rate", value: formatCurrency(selectedLoad.rate) },
                { label: "Miles", value: selectedLoad.miles.toLocaleString() },
                { label: "Status", value: selectedLoad.status.replace("_", " ") },
              ]}
            />
          </DetailSection>
          <DetailSection title="Stops">
            <DetailGrid
              items={[
                { label: "Pickup", value: `${selectedLoad.origin.city}, ${selectedLoad.origin.state} · ${selectedLoad.pickupDate}` },
                { label: "Delivery", value: `${selectedLoad.destination.city}, ${selectedLoad.destination.state} · ${selectedLoad.deliveryDate}` },
              ]}
            />
          </DetailSection>
          <DetailSection title="Documents, Invoice & Tracking">
            <DetailGrid
              items={[
                { label: "Documents", value: selectedLoad.documentIds.length ? `${selectedLoad.documentIds.length} uploaded` : "Missing" },
                { label: "Invoice", value: selectedLoad.invoiceId ?? "Not generated" },
                { label: "Tracking", value: selectedLoad.trackingEnabled ? "Live tracking enabled" : "Tracking off" },
                { label: "Compliance", value: selectedLoad.complianceStatus },
              ]}
            />
          </DetailSection>
          <DetailSection title="Timeline">
            <div className="space-y-2">
              {selectedLoad.timeline.map((event) => (
                <div key={event.id} className="rounded-xl border border-[#E5E7EB] bg-white p-3">
                  <p className="text-sm font-semibold text-slate-950">{event.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{event.occurredAt} · {event.location ?? "CarrierOS"}</p>
                </div>
              ))}
            </div>
          </DetailSection>
          <DetailSection title="Notes & Nova Recommendations">
            <p className="text-sm leading-6 text-slate-600">
              Review assignment, missing documents, invoice state, and tracking exceptions before closing this load.
            </p>
          </DetailSection>
        </DetailSlideOver>
      ) : null}
    </OperationalPageShell>
  );
}
