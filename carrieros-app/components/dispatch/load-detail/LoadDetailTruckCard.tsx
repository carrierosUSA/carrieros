"use client";

import { useState } from "react";
import CopyableValue from "@/components/dispatch/load-detail/CopyableValue";
import { useRegisterAssignTruckTrigger } from "@/components/dispatch/load-detail/LoadDetailActionTriggersProvider";
import EntityHoverPopover from "@/components/dispatch/load-detail/EntityHoverPopover";
import ReassignTrailerFlow, {
  type ReassignTrailerOption,
} from "@/components/dispatch/load-detail/ReassignTrailerFlow";
import ReassignTruckFlow, {
  type ReassignTruckOption,
} from "@/components/dispatch/load-detail/ReassignTruckFlow";

type LoadDetailTruckCardProps = {
  loadId: string;
  loadReference: string;
  pickupLabel: string;
  deliveryLabel: string;
  brokerEmail?: string;
  truckNumber?: string;
  trailerNumber?: string;
  truckStatus?: string;
  trailerType?: string;
  trailerStatus?: string;
  linkedDriverName?: string;
  truckLocation?: string;
  currentTruckId?: string;
  currentTrailerId?: string;
  truckOptions: ReassignTruckOption[];
  trailerOptions: ReassignTrailerOption[];
};

export default function LoadDetailTruckCard({
  loadId,
  loadReference,
  pickupLabel,
  deliveryLabel,
  brokerEmail,
  truckNumber,
  trailerNumber,
  truckStatus,
  trailerType,
  trailerStatus,
  linkedDriverName,
  truckLocation,
  currentTruckId,
  currentTrailerId,
  truckOptions,
  trailerOptions,
}: LoadDetailTruckCardProps) {
  const [truckOpen, setTruckOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [truckFlowKey, setTruckFlowKey] = useState(0);
  const [trailerFlowKey, setTrailerFlowKey] = useState(0);
  const truckAssigned = Boolean(truckNumber);
  const trailerAssigned = Boolean(trailerNumber);

  useRegisterAssignTruckTrigger(() => {
    setTruckFlowKey((value) => value + 1);
    setTruckOpen(true);
  });

  const truckRows = truckAssigned
    ? [
        { label: "Unit Number", value: truckNumber ?? "—" },
        { label: "Linked Driver", value: linkedDriverName ?? "—" },
        { label: "Location", value: truckLocation ?? "—" },
      ]
    : [{ label: "Status", value: "No truck assigned" }];

  const trailerRows = trailerAssigned
    ? [
        { label: "Unit Number", value: trailerNumber ?? "—" },
        { label: "Type", value: trailerType ?? "—" },
        { label: "Status", value: trailerStatus ?? "—" },
      ]
    : [{ label: "Status", value: "No trailer assigned" }];

  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <EntityHoverPopover
            heading="Truck"
            status={truckAssigned ? truckStatus : undefined}
            statusTone={truckAssigned ? "active" : "neutral"}
            align="end"
            rows={truckRows}
          >
            <span className="cursor-default text-[11px] text-slate-500">Truck</span>
          </EntityHoverPopover>
          <EntityHoverPopover
            heading="Truck"
            status={truckAssigned ? truckStatus : undefined}
            statusTone={truckAssigned ? "active" : "neutral"}
            align="end"
            rows={truckRows}
          >
            <CopyableValue
              value={truckNumber ?? "—"}
              label="Copy truck number"
              className="cursor-default text-[12px] font-bold tabular-nums text-slate-900"
            />
          </EntityHoverPopover>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <EntityHoverPopover
            heading="Trailer"
            status={trailerAssigned ? trailerStatus : undefined}
            statusTone={trailerAssigned ? "active" : "neutral"}
            align="end"
            rows={trailerRows}
          >
            <span className="cursor-default text-[11px] text-slate-500">Trailer</span>
          </EntityHoverPopover>
          <EntityHoverPopover
            heading="Trailer"
            status={trailerAssigned ? trailerStatus : undefined}
            statusTone={trailerAssigned ? "active" : "neutral"}
            align="end"
            rows={trailerRows}
          >
            <CopyableValue
              value={trailerNumber ?? "—"}
              label="Copy trailer number"
              className="cursor-default text-[12px] font-bold tabular-nums text-slate-900"
            />
          </EntityHoverPopover>
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setTruckFlowKey((value) => value + 1);
            setTruckOpen(true);
          }}
          className="h-5 rounded border border-[#E2E8F0] px-1.5 text-[9px] font-medium text-[#1E3A8A] hover:bg-[#F8FBFF]"
        >
          {truckAssigned ? "Reassign Truck" : "Assign Truck"}
        </button>
        <button
          type="button"
          onClick={() => {
            setTrailerFlowKey((value) => value + 1);
            setTrailerOpen(true);
          }}
          className="h-5 rounded border border-[#E2E8F0] px-1.5 text-[9px] font-medium text-[#1E3A8A] hover:bg-[#F8FBFF]"
        >
          {trailerAssigned ? "Reassign Trailer" : "Assign Trailer"}
        </button>
      </div>

      <ReassignTruckFlow
        key={truckFlowKey}
        loadId={loadId}
        loadReference={loadReference}
        pickupLabel={pickupLabel}
        deliveryLabel={deliveryLabel}
        brokerEmail={brokerEmail}
        trucks={truckOptions}
        currentTruckId={currentTruckId}
        open={truckOpen}
        onClose={() => setTruckOpen(false)}
      />
      <ReassignTrailerFlow
        key={trailerFlowKey}
        loadId={loadId}
        loadReference={loadReference}
        pickupLabel={pickupLabel}
        deliveryLabel={deliveryLabel}
        brokerEmail={brokerEmail}
        trailers={trailerOptions}
        currentTrailerId={currentTrailerId}
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
      />
    </>
  );
}
