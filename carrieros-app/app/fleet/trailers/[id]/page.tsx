import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import FleetSubNav from "@/components/fleet/FleetSubNav";
import TrailerDetailShell from "@/components/fleet/trailers/TrailerDetailShell";
import TrailerDetailSkeleton from "@/components/fleet/trailers/TrailerDetailSkeleton";
import {
  parseTrailerTab,
  type TrailerDetailTab,
} from "@/components/fleet/trailers/TrailerDetailTabs";
import TrailerOverviewTab from "@/components/fleet/trailers/tabs/TrailerOverviewTab";
import TrailerCurrentLoadTab from "@/components/fleet/trailers/tabs/TrailerCurrentLoadTab";
import TrailerLoadHistoryTab from "@/components/fleet/trailers/tabs/TrailerLoadHistoryTab";
import TrailerMaintenanceTab from "@/components/fleet/trailers/tabs/TrailerMaintenanceTab";
import TrailerReeferTab from "@/components/fleet/trailers/tabs/TrailerReeferTab";
import TrailerDocumentsTab from "@/components/fleet/trailers/tabs/TrailerDocumentsTab";
import TrailerTiresTab from "@/components/fleet/trailers/tabs/TrailerTiresTab";
import TrailerGpsTab from "@/components/fleet/trailers/tabs/TrailerGpsTab";
import TrailerTimelineTab from "@/components/fleet/trailers/tabs/TrailerTimelineTab";
import { getActiveTenantId } from "@/lib/data/tenant";
import {
  computeTrailerAlphMetrics,
  detectTrailerAlphAlerts,
} from "@/lib/fleet/trailer-alph-alerts";
import {
  getActiveLoadsForTrailer,
  getLoadHistoryForTrailer,
  getMaintenanceForTrailer,
  getTrailerOperationalStatus,
} from "@/lib/fleet/trailer-board";
import {
  buildTrailerDocuments,
  buildTrailerPmSchedule,
  buildTrailerTires,
  buildTrailerTimeline,
} from "@/lib/fleet/trailer-detail-data";
import { getTrailerReeferTelemetry } from "@/lib/fleet/reefer-provider";
import { getTrailerLiveLocation } from "@/lib/fleet/telematics-provider";
import { getFleetService } from "@/lib/services/fleet";
import { getLoadService } from "@/lib/services/loads";
import { isReeferTrailer } from "@/lib/types";

type TrailerDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

async function TrailerDetailContent({
  id,
  tabParam,
}: {
  id: string;
  tabParam?: string;
}) {
  const tenantId = getActiveTenantId();
  const fleetService = getFleetService();
  const loadService = getLoadService();

  const [trailer, trucks, maintenanceAll, loads] = await Promise.all([
    fleetService.getTrailer(tenantId, id),
    fleetService.listTrucks(tenantId),
    fleetService.listMaintenance(tenantId),
    loadService.listLoads(tenantId),
  ]);

  if (!trailer) {
    notFound();
  }

  const showReefer = isReeferTrailer(trailer);
  const activeTab: TrailerDetailTab = parseTrailerTab(tabParam, showReefer);
  const operationalStatus = getTrailerOperationalStatus(trailer, loads);
  const activeLoads = getActiveLoadsForTrailer(trailer, loads);
  const loadHistory = getLoadHistoryForTrailer(trailer, loads);
  const maintenance = getMaintenanceForTrailer(trailer.id, maintenanceAll);
  const reefer = showReefer ? await getTrailerReeferTelemetry(trailer) : null;
  const alphMetrics = computeTrailerAlphMetrics(trailer, maintenance, reefer);
  const alerts = detectTrailerAlphAlerts(trailer, loads, maintenance, reefer);
  const truck = trailer.truckId
    ? trucks.find((entry) => entry.id === trailer.truckId)
    : undefined;
  const truckLabel = truck ? `Unit ${truck.unitNumber}` : undefined;
  const location = await getTrailerLiveLocation(
    trailer.id,
    trailer.telematicsProvider ?? "mock",
  );

  let panel: ReactNode;

  switch (activeTab) {
    case "current_load":
      panel = <TrailerCurrentLoadTab loads={activeLoads} />;
      break;
    case "load_history":
      panel = <TrailerLoadHistoryTab loads={loadHistory} />;
      break;
    case "maintenance":
      panel = (
        <TrailerMaintenanceTab
          pmItems={buildTrailerPmSchedule(trailer)}
          records={maintenance}
          trailerId={trailer.id}
        />
      );
      break;
    case "reefer":
      panel = <TrailerReeferTab telemetry={reefer} />;
      break;
    case "documents":
      panel = (
        <TrailerDocumentsTab documents={buildTrailerDocuments(trailer)} />
      );
      break;
    case "tires":
      panel = <TrailerTiresTab tires={buildTrailerTires(trailer)} />;
      break;
    case "gps":
      panel = (
        <TrailerGpsTab
          trailer={trailer}
          location={location}
          activeLoad={activeLoads[0]}
        />
      );
      break;
    case "timeline":
      panel = <TrailerTimelineTab events={buildTrailerTimeline(trailer)} />;
      break;
    case "overview":
    default:
      panel = (
        <TrailerOverviewTab
          trailer={trailer}
          operationalStatus={operationalStatus}
          truckLabel={truckLabel}
          alphMetrics={alphMetrics}
        />
      );
      break;
  }

  return (
    <TrailerDetailShell
      trailer={trailer}
      loads={loads}
      operationalStatus={operationalStatus}
      activeTab={activeTab}
      alerts={alerts}
      truckLabel={truckLabel}
    >
      {panel}
    </TrailerDetailShell>
  );
}

export default async function TrailerDetailPage({
  params,
  searchParams,
}: TrailerDetailPageProps) {
  const { id } = await params;
  const { tab } = await searchParams;

  return (
    <div className="min-h-full bg-[#F5F7FA]">
      <div className="px-4 pt-4 lg:px-6 lg:pt-6">
        <FleetSubNav />
      </div>
      <Suspense fallback={<TrailerDetailSkeleton />}>
        <TrailerDetailContent id={id} tabParam={tab} />
      </Suspense>
    </div>
  );
}
