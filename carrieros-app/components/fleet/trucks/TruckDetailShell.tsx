import Link from "next/link";
import TruckAlphAlertsStrip from "@/components/fleet/trucks/TruckAlphAlertsStrip";
import TruckDetailTabs, {
  parseTruckTab,
  type TruckDetailTab,
} from "@/components/fleet/trucks/TruckDetailTabs";
import TruckQuickActions from "@/components/fleet/trucks/TruckQuickActions";
import TruckStatusBadge from "@/components/fleet/TruckStatusBadge";
import TruckActiveLoadsTab from "@/components/fleet/trucks/tabs/TruckActiveLoadsTab";
import TruckCamerasTab from "@/components/fleet/trucks/tabs/TruckCamerasTab";
import TruckDocumentsTab from "@/components/fleet/trucks/tabs/TruckDocumentsTab";
import TruckDriverAssignmentTab from "@/components/fleet/trucks/tabs/TruckDriverAssignmentTab";
import TruckExpensesTab from "@/components/fleet/trucks/tabs/TruckExpensesTab";
import TruckFuelTab from "@/components/fleet/trucks/tabs/TruckFuelTab";
import TruckGpsTab from "@/components/fleet/trucks/tabs/TruckGpsTab";
import TruckMaintenanceTab from "@/components/fleet/trucks/tabs/TruckMaintenanceTab";
import TruckOverviewTab from "@/components/fleet/trucks/tabs/TruckOverviewTab";
import TruckTimelineTab from "@/components/fleet/trucks/tabs/TruckTimelineTab";
import FadeIn from "@/components/ui/FadeIn";
import {
  computeTruckAlphMetrics,
  detectTruckAlphAlerts,
} from "@/lib/fleet/truck-alph-alerts";
import {
  getActiveLoadsForTruck,
  getTruckOperationalStatus,
} from "@/lib/fleet/truck-board";
import type { TelematicsVehicleSnapshot } from "@/lib/fleet/telematics-provider";
import type {
  Driver,
  FuelRecord,
  Load,
  MaintenanceRecord,
  Truck,
  TruckCameraChannel,
  TruckDocument,
  TruckExpense,
  TruckPmItem,
  TruckTimelineEvent,
} from "@/lib/types";

type TruckDetailShellProps = {
  truck: Truck;
  loads: Load[];
  drivers: Driver[];
  maintenance: MaintenanceRecord[];
  fuelRecords: FuelRecord[];
  documents: TruckDocument[];
  expenses: TruckExpense[];
  pmItems: TruckPmItem[];
  cameras: TruckCameraChannel[];
  timeline: TruckTimelineEvent[];
  telematics: TelematicsVehicleSnapshot;
  trailerLabel?: string;
  activeTab: TruckDetailTab;
};

export default function TruckDetailShell({
  truck,
  loads,
  drivers,
  maintenance,
  fuelRecords,
  documents,
  expenses,
  pmItems,
  cameras,
  timeline,
  telematics,
  trailerLabel,
  activeTab,
}: TruckDetailShellProps) {
  const operationalStatus = getTruckOperationalStatus(truck, loads);
  const alphMetrics = computeTruckAlphMetrics(truck, maintenance, fuelRecords);
  const alphAlerts = detectTruckAlphAlerts(
    truck,
    loads,
    maintenance,
    fuelRecords,
  );
  const driver = truck.driverId
    ? drivers.find((entry) => entry.id === truck.driverId)
    : undefined;
  const activeLoads = getActiveLoadsForTruck(truck.id, loads);

  return (
    <div className="w-full text-[#111827]">
      <header className="mb-4 border-b border-[#EAEAEA] pb-4">
        <Link
          href="/fleet/trucks"
          className="text-[13px] font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
        >
          ← All Trucks
        </Link>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            {truck.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={truck.photoUrl}
                alt=""
                className="h-16 w-16 rounded-[14px] object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#EEF2FF] text-[18px] font-bold text-[#2563EB] ring-1 ring-[#EAEAEA]">
                {truck.unitNumber}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[24px] font-bold tracking-tight text-slate-950">
                  Unit {truck.unitNumber}
                </h1>
                <TruckStatusBadge status={operationalStatus} />
              </div>
              <p className="mt-1 text-[14px] text-slate-500">
                {truck.year} {truck.make} {truck.model}
                {truck.location ? ` · ${truck.location}` : ""}
              </p>
              <p className="mt-1 text-[13px] text-slate-400">
                {truck.licensePlate}
                {truck.licenseState ? ` · ${truck.licenseState}` : ""}
              </p>
            </div>
          </div>

          <TruckQuickActions truck={truck} loads={loads} />
        </div>
      </header>

      <div className="mb-4">
        <TruckAlphAlertsStrip alerts={alphAlerts} truck={truck} />
      </div>

      <TruckDetailTabs truckId={truck.id} activeTab={activeTab} />

      <FadeIn className="mt-4">
        {activeTab === "overview" ? (
          <TruckOverviewTab
            truck={truck}
            operationalStatus={operationalStatus}
            driverName={driver?.name}
            trailerLabel={trailerLabel}
            alphMetrics={alphMetrics}
          />
        ) : null}
        {activeTab === "driver" ? (
          <TruckDriverAssignmentTab truck={truck} driver={driver} />
        ) : null}
        {activeTab === "loads" ? (
          <TruckActiveLoadsTab loads={activeLoads} />
        ) : null}
        {activeTab === "maintenance" ? (
          <TruckMaintenanceTab
            pmItems={pmItems}
            records={maintenance}
            truckId={truck.id}
          />
        ) : null}
        {activeTab === "fuel" ? (
          <TruckFuelTab truck={truck} fuelRecords={fuelRecords} />
        ) : null}
        {activeTab === "documents" ? (
          <TruckDocumentsTab documents={documents} />
        ) : null}
        {activeTab === "expenses" ? (
          <TruckExpensesTab expenses={expenses} />
        ) : null}
        {activeTab === "gps" ? (
          <TruckGpsTab truck={truck} loads={loads} snapshot={telematics} />
        ) : null}
        {activeTab === "cameras" ? (
          <TruckCamerasTab
            cameras={cameras}
            providerLabel={(truck.telematicsProvider ?? "mock").toUpperCase()}
          />
        ) : null}
        {activeTab === "timeline" ? (
          <TruckTimelineTab events={timeline} />
        ) : null}
      </FadeIn>
    </div>
  );
}

export { parseTruckTab };
