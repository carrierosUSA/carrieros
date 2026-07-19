"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CreateWorkOrderModal from "@/components/fleet/maintenance/CreateWorkOrderModal";
import MaintenanceAlphAlertsStrip from "@/components/fleet/maintenance/MaintenanceAlphAlertsStrip";
import MaintenanceModulePanels from "@/components/fleet/maintenance/MaintenanceModulePanels";
import MaintenanceModuleTabs, {
  parseMaintenanceTab,
  type MaintenanceModuleTab,
} from "@/components/fleet/maintenance/MaintenanceModuleTabs";
import MaintenanceQuickActions, {
  type QuickActionId,
} from "@/components/fleet/maintenance/MaintenanceQuickActions";
import MaintenanceSearchBar from "@/components/fleet/maintenance/MaintenanceSearchBar";
import FadeIn from "@/components/ui/FadeIn";
import type { MaintenanceAlphAlert } from "@/lib/fleet/maintenance-alph";
import { filterMaintenanceQuery } from "@/lib/fleet/maintenance-board";
import type { MaintenanceIntegrationStatus } from "@/lib/fleet/maintenance-integrations";
import type { Trailer, Truck } from "@/lib/types";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";
import type {
  Mechanic,
  MaintenanceReportSummary,
  MaintenanceVendor,
  PartInventoryItem,
  PmSchedule,
  RepairRecord,
  ServiceHistoryEvent,
  TireAsset,
  WarrantyRecord,
  WorkOrder,
  WorkOrderPriority,
} from "@/lib/types/maintenance";

type MaintenanceDashboardClientProps = {
  trucks: Truck[];
  trailers: Trailer[];
  initialWorkOrders: WorkOrder[];
  pmSchedules: PmSchedule[];
  repairs: RepairRecord[];
  mechanics: Mechanic[];
  parts: PartInventoryItem[];
  vendors: MaintenanceVendor[];
  tires: TireAsset[];
  warranties: WarrantyRecord[];
  serviceHistory: ServiceHistoryEvent[];
  alerts: MaintenanceAlphAlert[];
  reports: MaintenanceReportSummary;
  integrations: MaintenanceIntegrationStatus[];
  initialTab?: string;
  openCreate?: boolean;
};

export default function MaintenanceDashboardClient({
  trucks,
  trailers,
  initialWorkOrders,
  pmSchedules,
  repairs,
  mechanics,
  parts,
  vendors,
  tires,
  warranties,
  serviceHistory: initialHistory,
  alerts,
  reports,
  integrations,
  initialTab,
  openCreate = false,
}: MaintenanceDashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseMaintenanceTab(
    searchParams.get("tab") ?? initialTab,
  );
  const truckFromQuery = searchParams.get("truck") ?? undefined;
  const trailerFromQuery = searchParams.get("trailer") ?? undefined;
  const shouldOpenCreate =
    openCreate || searchParams.get("create") === "1";

  const [query, setQuery] = useState("");
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [serviceHistory, setServiceHistory] = useState(initialHistory);
  const [modalOpen, setModalOpen] = useState(shouldOpenCreate);
  const [modalPreset, setModalPreset] = useState<{
    title?: string;
    priority?: WorkOrderPriority;
    truckId?: string;
    trailerId?: string;
  }>(() =>
    truckFromQuery || trailerFromQuery
      ? {
          title: "Schedule preventive maintenance",
          priority: "normal",
          truckId: truckFromQuery,
          trailerId: trailerFromQuery,
        }
      : {},
  );
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      filterMaintenanceQuery(query, {
        workOrders,
        parts,
        vendors,
        repairs,
        mechanics,
      }),
    [query, workOrders, parts, vendors, repairs, mechanics],
  );

  const lowStockIds = useMemo(
    () =>
      new Set(
        parts.filter((p) => p.stock <= p.reorderLevel).map((p) => p.id),
      ),
    [parts],
  );

  function goTab(tab: MaintenanceModuleTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("create");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }

  function openCreateModal(preset?: typeof modalPreset) {
    setModalPreset(preset ?? {});
    setModalOpen(true);
  }

  function handleQuickAction(action: QuickActionId) {
    switch (action) {
      case "createWorkOrder":
        openCreateModal();
        break;
      case "schedulePm":
        goTab("pm");
        openCreateModal({ title: "Scheduled preventive maintenance", priority: "normal" });
        break;
      case "addRepair":
        goTab("repairs");
        openCreateModal({ title: "Repair intake", priority: "high" });
        break;
      case "uploadInvoice":
        goTab("repairs");
        showToast("Attach invoices from a repair card — upload stub ready.");
        break;
      case "orderParts":
        goTab("parts");
        showToast("Low-stock parts highlighted. Vendor order stub ready.");
        break;
      case "reportBreakdown":
        openCreateModal({
          title: "Roadside breakdown",
          priority: "critical",
        });
        break;
      case "assignMechanic":
        goTab("mechanics");
        showToast("Pick an available mechanic, then create or open a work order.");
        break;
      default:
        break;
    }
  }

  function handleAlphAction(alert: MaintenanceAlphAlert) {
    switch (alert.fixAction) {
      case "createWorkOrder":
      case "reportBreakdown":
        openCreateModal({
          title: alert.message.split(" — ")[0],
          priority: alert.severity === "critical" ? "critical" : "high",
        });
        break;
      case "schedulePm":
        goTab("pm");
        openCreateModal({ title: "Schedule PM", priority: "high" });
        break;
      case "viewParts":
      case "orderParts":
        goTab("parts");
        break;
      case "viewTires":
        goTab("tires");
        break;
      case "viewRepairs":
        goTab("repairs");
        break;
      case "viewWorkOrders":
        goTab("work_orders");
        break;
      case "assignMechanic":
        goTab("mechanics");
        break;
      default:
        break;
    }
  }

  function handleCreate(
    input: Omit<
      WorkOrder,
      "id" | "number" | "tenantId" | "createdAt" | "status"
    > & { status?: WorkOrder["status"] },
  ) {
    const seq = workOrders.length + 2401;
    const order: WorkOrder = {
      tenantId: DEMO_TENANT_ID,
      id: `wo-${Date.now()}`,
      number: `WO-${seq}`,
      status: input.status ?? "open",
      createdAt: new Date().toISOString(),
      ...input,
    };
    setWorkOrders((prev) => [order, ...prev]);
    setServiceHistory((prev) => [
      {
        tenantId: order.tenantId,
        id: `hist-${Date.now()}`,
        truckId: order.truckId,
        trailerId: order.trailerId,
        category: "repair",
        label: `Work order ${order.number} created`,
        detail: order.title,
        cost: order.estimatedCost,
        occurredAt: order.createdAt,
        relatedWorkOrderId: order.id,
      },
      ...prev,
    ]);
    goTab("work_orders");
    showToast(`${order.number} created`);
  }

  const resultHint = query.trim()
    ? `${filtered.workOrders.length} WO · ${filtered.parts.length} parts · ${filtered.vendors.length} vendors`
    : undefined;

  const panelWorkOrders = query.trim() ? filtered.workOrders : workOrders;
  const panelParts = query.trim() ? filtered.parts : parts;
  const panelVendors = query.trim() ? filtered.vendors : vendors;
  const panelRepairs = query.trim() ? filtered.repairs : repairs;
  const panelMechanics = query.trim() ? filtered.mechanics : mechanics;

  return (
    <FadeIn className="mt-6 space-y-5">
      <MaintenanceAlphAlertsStrip
        alerts={alerts}
        onAction={handleAlphAction}
      />

      <MaintenanceQuickActions onAction={handleQuickAction} />

      <MaintenanceSearchBar
        value={query}
        onChange={setQuery}
        resultHint={resultHint}
      />

      <MaintenanceModuleTabs activeTab={activeTab} />

      <MaintenanceModulePanels
        tab={activeTab}
        trucks={trucks}
        trailers={trailers}
        pmSchedules={pmSchedules}
        workOrders={panelWorkOrders}
        repairs={panelRepairs}
        mechanics={panelMechanics}
        parts={panelParts}
        vendors={panelVendors}
        tires={tires}
        warranties={warranties}
        serviceHistory={serviceHistory}
        reports={reports}
        integrations={integrations}
        lowStockIds={lowStockIds}
      />

      <CreateWorkOrderModal
        key={`${modalOpen}-${modalPreset.title ?? ""}-${modalPreset.priority ?? ""}`}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        trucks={trucks}
        trailers={trailers}
        mechanics={mechanics}
        vendors={vendors}
        onCreate={handleCreate}
        preset={modalPreset}
      />

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-950 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </FadeIn>
  );
}
