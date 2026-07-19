import Link from "next/link";
import CopyableValue from "@/components/dispatch/load-detail/CopyableValue";
import LoadDetailAlphBubble from "@/components/dispatch/load-detail/LoadDetailAlphBubble";
import LoadDetailAlphCard from "@/components/dispatch/load-detail/LoadDetailAlphCard";
import LoadDetailAlphIssuesStrip from "@/components/dispatch/load-detail/LoadDetailAlphIssuesStrip";
import LoadDetailBrokerCard from "@/components/dispatch/load-detail/LoadDetailBrokerCard";
import LoadDetailCameraGrid from "@/components/dispatch/load-detail/LoadDetailCameraGrid";
import LoadDetailCard, {
  LOAD_DETAIL_CARD_CLASS,
} from "@/components/dispatch/load-detail/LoadDetailCard";
import LoadDetailDocumentChips from "@/components/dispatch/load-detail/LoadDetailDocumentChips";
import LoadDetailHeaderActions from "@/components/dispatch/load-detail/LoadDetailHeaderActions";
import LoadDetailActionTriggersProvider from "@/components/dispatch/load-detail/LoadDetailActionTriggersProvider";
import LoadDetailKeyboardShortcuts from "@/components/dispatch/load-detail/LoadDetailKeyboardShortcuts";
import LoadDetailQuickActionsBridge from "@/components/dispatch/load-detail/LoadDetailQuickActionsBridge";
import LoadDetailQuickTasksProvider from "@/components/dispatch/load-detail/LoadDetailQuickTasksProvider";
import KeyboardShortcutHints from "@/components/keyboard/KeyboardShortcutHints";
import LoadDetailCommunicationShell from "@/components/dispatch/load-detail/communication/LoadDetailCommunicationShell";
import LoadDetailDriverCard from "@/components/dispatch/load-detail/LoadDetailDriverCard";
import LoadDetailLiveTracking from "@/components/dispatch/load-detail/LoadDetailLiveTracking";
import LoadDetailNotesCard from "@/components/dispatch/load-detail/LoadDetailNotesCard";
import LoadDetailStatusChips from "@/components/dispatch/load-detail/LoadDetailStatusChips";
import LoadDetailStickyActionBar from "@/components/dispatch/load-detail/LoadDetailStickyActionBar";
import LoadDetailStopCard from "@/components/dispatch/load-detail/LoadDetailStopCard";
import LoadDetailTimeline, {
  buildTimelineSteps,
} from "@/components/dispatch/load-detail/LoadDetailTimeline";
import LoadDetailTruckCard from "@/components/dispatch/load-detail/LoadDetailTruckCard";
import DocumentHealthPanel from "@/components/documents/DocumentHealthPanel";
import DocumentHealthScoreBadge from "@/components/documents/DocumentHealthScoreBadge";
import type { ReassignDriverOption } from "@/components/dispatch/load-detail/ReassignDriverFlow";
import type { ReassignTrailerOption } from "@/components/dispatch/load-detail/ReassignTrailerFlow";
import type { ReassignTruckOption } from "@/components/dispatch/load-detail/ReassignTruckFlow";
import { detectAlphIssues } from "@/lib/dispatch/alph-issues";
import { getLoadStatusChips } from "@/lib/dispatch/load-status-chips";
import { computeDocumentHealth } from "@/lib/documents/document-health";
import { mergeAlphWithDocumentHealth } from "@/lib/documents/document-health-alph";
import {
  formatStopScheduleLine,
  getDispatchNote,
  getTrailerForTruck,
} from "@/lib/dispatch/load-board";
import {
  getBrokerDetail,
  getDeliveryDetail,
  getPickupDetail,
} from "@/lib/dispatch/load-detail-meta";
import { formatCurrency } from "@/lib/services/loads/load-helpers";
import type { DocumentPacketSummary } from "@/lib/services/documents/document-service";
import type { Broker, Company, Driver, DriverLocation, Load, LoadStatus, Truck } from "@/lib/types";
import { LOAD_DOCUMENT_LABELS, TRAILER_STATUS_LABELS, TRUCK_STATUS_LABELS, type LoadDocumentType } from "@/lib/types";

type DispatchLoadDetailProps = {
  load: Load;
  customerName: string;
  broker?: Broker;
  brokerEmail?: string;
  company: Company;
  driver?: Driver;
  truck?: Truck;
  documentSummary: DocumentPacketSummary;
  lastLocation?: string;
  lastLocationUpdate?: string;
  milesRemaining?: number;
  driverLocation?: DriverLocation | null;
  driverOptions: ReassignDriverOption[];
  truckOptions: ReassignTruckOption[];
  trailerOptions: ReassignTrailerOption[];
  currentTrailerId?: string;
};

const BROKER_DOC_TYPES: LoadDocumentType[] = [
  "rate_confirmation",
  "bol",
  "lumper_receipt",
];

const CARRIER_DOC_TYPES: LoadDocumentType[] = [
  "final_pod",
  "invoice",
  "void_check",
];

const gap = "gap-3";

function PaymentField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className="text-[11px] font-semibold tabular-nums text-slate-900">
        {value}
      </span>
    </div>
  );
}

function formatLoadNumber(reference: string): string {
  return reference.replace(/^LD-/i, "");
}

function formatHeaderStop(date: string, scheduledAt?: string): string {
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));

  if (!scheduledAt) {
    return `${dateLabel} • FCFS`;
  }

  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(scheduledAt));

  return `${dateLabel} • ${timeLabel}`;
}

function docsForTypes(
  checklist: DocumentPacketSummary["checklist"],
  types: LoadDocumentType[],
) {
  return types.map((type) => {
    const item = checklist.find((entry) => entry.type === type);
    return {
      type,
      label: LOAD_DOCUMENT_LABELS[type],
      onFile: item ? item.status !== "missing" : false,
    };
  });
}

function driverDutyStatus(status: LoadStatus): string {
  if (status === "in_transit" || status === "picked_up") {
    return "Driving";
  }

  if (status === "dispatched" || status === "pending") {
    return "Waiting";
  }

  return "Off Duty";
}

function paymentRows(load: Load) {
  const hasLumper = load.status === "delivered" || load.status === "invoiced";
  const hasDetention =
    load.complianceStatus === "attention" && load.status === "in_transit";

  return [
    { label: "Rate", value: formatCurrency(load.rate) },
    { label: "Lumper", value: hasLumper ? formatCurrency(75) : "—" },
    { label: "Detention", value: hasDetention ? formatCurrency(150) : "—" },
    { label: "Quick Pay", value: "2%" },
    { label: "Terms", value: "Net 30" },
  ];
}

export default function DispatchLoadDetail({
  load,
  customerName,
  broker,
  brokerEmail,
  company,
  driver,
  truck,
  documentSummary,
  lastLocation,
  lastLocationUpdate,
  milesRemaining,
  driverLocation,
  driverOptions,
  truckOptions,
  trailerOptions,
  currentTrailerId,
}: DispatchLoadDetailProps) {
  const trailer = getTrailerForTruck(load.truckId);
  const note = getDispatchNote(load);
  const brokerDetail = getBrokerDetail(broker, brokerEmail);
  const pickupDetail = getPickupDetail(load, customerName);
  const deliveryDetail = getDeliveryDetail(load, customerName);
  const equipment = trailer?.type ?? "Dry Van";
  const milesLeft = milesRemaining ?? Math.max(0, Math.round(load.miles * 0.35));
  const isReefer =
    equipment.toLowerCase().includes("reefer") ||
    load.customerId === "customer-gulf-foods";
  const brokerDocs = docsForTypes(documentSummary.checklist, BROKER_DOC_TYPES);
  const carrierDocs = docsForTypes(documentSummary.checklist, CARRIER_DOC_TYPES);
  const hasPod = carrierDocs.some(
    (doc) => doc.type === "final_pod" && doc.onFile,
  );
  const isLate = load.complianceStatus === "attention";
  const statusChips = getLoadStatusChips(load, hasPod, isLate);
  const timelineSteps = buildTimelineSteps(load.status);
  const documentHealth = computeDocumentHealth(load);
  const alphIssues = mergeAlphWithDocumentHealth(
    detectAlphIssues({
      load,
      hasPod,
      hasDriver: Boolean(driver),
      isReefer,
      isLate,
    }),
    documentHealth,
  );

  const pickupLabel = `${load.origin.city}, ${load.origin.state} · ${formatHeaderStop(load.pickupDate, load.origin.scheduledAt)}`;
  const deliveryLabel = `${load.destination.city}, ${load.destination.state} · ${formatHeaderStop(load.deliveryDate, load.destination.scheduledAt)}`;

  const requirements = [
    { icon: "✅", label: "Lumper Approved" },
    { icon: "☎", label: "Call Before Delivery" },
    { icon: "🌡", label: isReefer ? "Keep Temp 34°F" : "Keep Temp" },
    {
      icon: "📄",
      label: "POD within 24 hrs",
      muted: hasPod || load.status === "invoiced",
    },
    { icon: "⏱", label: "Detention after 2 hrs" },
  ];

  return (
    <LoadDetailCommunicationShell
      loadContext={{
        loadId: load.id,
        loadReference: load.reference,
        pickupLabel,
        deliveryLabel,
      }}
    >
    <LoadDetailQuickTasksProvider
      loadId={load.id}
      loadReference={load.reference}
      pickupLabel={pickupLabel}
      deliveryLabel={deliveryLabel}
      brokerEmail={brokerEmail}
      driverPhone={driver?.phone}
      driverName={driver?.name}
      rate={load.rate}
    >
    <LoadDetailActionTriggersProvider>
    <div className="w-full text-[#111827]">
      <header className={`mb-3 ${LOAD_DETAIL_CARD_CLASS}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/loads"
                className="text-[13px] font-medium text-[#2563EB] hover:underline"
              >
                ← Dispatch
              </Link>
              <h1 className="flex flex-wrap items-center gap-1 text-[22px] font-bold tracking-[-0.03em] text-[#111827]">
                <span>Load #</span>
                <CopyableValue
                  value={formatLoadNumber(load.reference)}
                  label="Copy load number"
                />
              </h1>
              <LoadDetailStatusChips chips={statusChips} />
              <DocumentHealthScoreBadge score={documentHealth.score} size="sm" />
            </div>
            <p className="mt-1 text-[14px] font-semibold text-[#111827]">
              {load.origin.city}, {load.origin.state} → {load.destination.city},{" "}
              {load.destination.state}
            </p>
            <div className="mt-1 flex flex-wrap gap-4 text-[13px] text-[#6B7280]">
              <span>
                <span className="text-[#94A3B8]">Pickup:</span>{" "}
                {formatHeaderStop(load.pickupDate, load.origin.scheduledAt)}
              </span>
              <span>
                <span className="text-[#94A3B8]">Delivery:</span>{" "}
                {formatHeaderStop(load.deliveryDate, load.destination.scheduledAt)}
              </span>
            </div>
          </div>
          <LoadDetailHeaderActions loadId={load.id} />
        </div>
      </header>

      <LoadDetailStickyActionBar
        loadId={load.id}
        brokerPhone={brokerDetail.phone}
        driverPhone={driver?.phone}
        trackingEnabled={Boolean(load.trackingEnabled)}
        hasDriver={Boolean(driver)}
      />
      <LoadDetailKeyboardShortcuts
        loadId={load.id}
        brokerPhone={brokerDetail.phone}
        trackingEnabled={Boolean(load.trackingEnabled)}
        hasDriver={Boolean(driver)}
      />
      <LoadDetailQuickActionsBridge
        loadId={load.id}
        loadReference={load.reference}
        trackingEnabled={Boolean(load.trackingEnabled)}
        hasDriver={Boolean(driver)}
      />
      <div className="mb-2 px-1">
        <KeyboardShortcutHints variant="load" />
      </div>

      <LoadDetailAlphIssuesStrip
        issues={alphIssues}
        loadId={load.id}
        driverPhone={driver?.phone}
        trackingEnabled={Boolean(load.trackingEnabled)}
        hasDriver={Boolean(driver)}
      />

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
        <div className={`flex flex-col ${gap} p-3 lg:min-h-[calc(100dvh-140px)]`}>
          <LoadDetailBrokerCard detail={brokerDetail} brokerId={broker?.id} />

          <div className={`grid grid-cols-2 ${gap}`}>
            <LoadDetailStopCard title="Pickup" detail={pickupDetail} />
            <LoadDetailStopCard title="Delivery" detail={deliveryDetail} />
          </div>

          <LoadDetailCard id="load-payment" title="Payment">
            <div className="flex flex-col gap-1">
              {paymentRows(load).map((row) => (
                <PaymentField key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          </LoadDetailCard>

          <LoadDetailCard title="Broker Requirements">
            <ul className="flex flex-col gap-1">
              {requirements.map((item) => (
                <li
                  key={item.label}
                  className={`flex items-center gap-2 text-[11px] leading-none ${
                    item.muted ? "text-slate-400" : "text-slate-700"
                  }`}
                >
                  <span className="w-3 shrink-0 text-center">{item.icon}</span>
                  {item.label}
                </li>
              ))}
            </ul>
          </LoadDetailCard>

          <LoadDetailCard
            title="Broker Documents"
            action={
              <Link
                href={`/loads/${load.id}/documents`}
                className="text-[10px] font-semibold text-[#1E3A8A] hover:underline"
              >
                View All
              </Link>
            }
          >
            <div className="flex flex-wrap gap-2">
              <LoadDetailDocumentChips docs={brokerDocs} />
            </div>
          </LoadDetailCard>

          <LoadDetailNotesCard note={note} />
        </div>

        <div className={`flex flex-col ${gap} p-3 lg:min-h-[calc(100dvh-140px)] lg:border-l lg:border-[#EAEAEA]`}>
          <LoadDetailCard title="Carrier Details">
            <p className="truncate text-[12px] font-bold leading-tight text-slate-950">
              {company.name}
            </p>
            <p className="truncate text-[10px] text-slate-500">
              {company.homeBase} · {company.mcNumber}
            </p>
          </LoadDetailCard>

          <LoadDetailCard id="load-tracking" title="Live Tracking">
            <LoadDetailLiveTracking
              loadId={load.id}
              loadReference={load.reference}
              originCity={load.origin.city}
              originState={load.origin.state}
              destinationCity={load.destination.city}
              destinationState={load.destination.state}
              totalMiles={load.miles}
              milesLeft={milesLeft}
              currentLocation={lastLocation}
              fallbackLocation={driver?.location}
              eta={formatStopScheduleLine(load.deliveryDate)}
              lastLocationUpdate={lastLocationUpdate}
              trackingEnabled={Boolean(load.trackingEnabled)}
              hasDriver={Boolean(driver)}
              driverLocation={driverLocation}
              driver={
                driver
                  ? {
                      name: driver.name,
                      phone: driver.phone,
                      truckLabel: truck ? `Unit ${truck.unitNumber}` : undefined,
                      trailerLabel: trailer
                        ? `TRL-${trailer.unitNumber}`
                        : undefined,
                    }
                  : undefined
              }
            />
          </LoadDetailCard>

          <LoadDetailAlphCard
            issues={alphIssues}
            loadId={load.id}
            driverPhone={driver?.phone}
            trackingEnabled={Boolean(load.trackingEnabled)}
            hasDriver={Boolean(driver)}
          />

          <div className={`grid grid-cols-1 ${gap} xl:grid-cols-2`}>
            <LoadDetailCard title="Driver">
              <LoadDetailDriverCard
                loadId={load.id}
                loadReference={load.reference}
                pickupLabel={pickupLabel}
                deliveryLabel={deliveryLabel}
                brokerEmail={brokerEmail}
                driverName={driver?.name}
                driverPhotoUrl={driver?.photoUrl}
                driverPhone={driver?.phone}
                driverEmail={driver?.email}
                driverId={driver?.id}
                driverDutyStatus={driverDutyStatus(load.status)}
                drivers={driverOptions}
              />
            </LoadDetailCard>

            <LoadDetailCard title="Truck / Trailer">
              <LoadDetailTruckCard
                loadId={load.id}
                loadReference={load.reference}
                pickupLabel={pickupLabel}
                deliveryLabel={deliveryLabel}
                brokerEmail={brokerEmail}
                truckNumber={truck?.unitNumber}
                trailerNumber={trailer?.unitNumber}
                truckStatus={truck ? TRUCK_STATUS_LABELS[truck.status] : undefined}
                trailerType={trailer?.type}
                trailerStatus={
                  trailer ? TRAILER_STATUS_LABELS[trailer.status] : undefined
                }
                linkedDriverName={driver?.name}
                truckLocation={lastLocation ?? truck?.location ?? driver?.location}
                currentTruckId={truck?.id}
                currentTrailerId={currentTrailerId}
                truckOptions={truckOptions}
                trailerOptions={trailerOptions}
              />
            </LoadDetailCard>
          </div>

          <LoadDetailCard title="Truck Cameras">
            <LoadDetailCameraGrid loadId={load.id} />
          </LoadDetailCard>

          <LoadDetailCard
            id="load-carrier-documents"
            title="Carrier Documents"
            action={
              <Link
                href={`/loads/${load.id}/documents`}
                className="text-[10px] font-semibold text-[#1E3A8A] hover:underline"
              >
                View All
              </Link>
            }
          >
            <LoadDetailDocumentChips docs={carrierDocs} />
          </LoadDetailCard>

          <DocumentHealthPanel
            snapshot={documentHealth}
            driverPhone={driver?.phone}
            brokerEmail={brokerEmail ?? broker?.email}
          />

          <LoadDetailCard title="Timeline">
            <LoadDetailTimeline steps={timelineSteps} />
          </LoadDetailCard>
        </div>
      </div>
      <LoadDetailAlphBubble issues={alphIssues} />
    </div>
    </LoadDetailActionTriggersProvider>
    </LoadDetailQuickTasksProvider>
    </LoadDetailCommunicationShell>
  );
}
