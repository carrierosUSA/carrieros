"use client";

import { User } from "lucide-react";
import { useState } from "react";
import EntityHoverPopover from "@/components/dispatch/load-detail/EntityHoverPopover";
import { useRegisterAssignDriverTrigger } from "@/components/dispatch/load-detail/LoadDetailActionTriggersProvider";
import LoadDetailDriverActions from "@/components/dispatch/load-detail/LoadDetailDriverActions";
import ReassignDriverFlow, {
  type ReassignDriverOption,
} from "@/components/dispatch/load-detail/ReassignDriverFlow";
import {
  getDriverCheckCallMock,
  getDriverHoursRemainingMock,
} from "@/lib/dispatch/load-detail-meta";

type LoadDetailDriverCardProps = {
  loadId: string;
  loadReference: string;
  pickupLabel: string;
  deliveryLabel: string;
  brokerEmail?: string;
  driverName?: string;
  driverPhotoUrl?: string;
  driverPhone?: string;
  driverEmail?: string;
  driverId?: string;
  driverDutyStatus: string;
  drivers: ReassignDriverOption[];
};

const AVATAR_PALETTE = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
] as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarPalette(name: string) {
  const hash = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function DutyStatusBadge({ status }: { status: string }) {
  const styles =
    status === "Driving"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "Waiting"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${styles}`}
    >
      {status}
    </span>
  );
}

const AVATAR_SIZE_CLASS = "h-11 w-11 shrink-0";

function InitialsAvatar({ name }: { name: string }) {
  const palette = getAvatarPalette(name);

  return (
    <div
      className={`flex ${AVATAR_SIZE_CLASS} items-center justify-center rounded-full text-[13px] font-semibold ${palette.bg} ${palette.text}`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}

function UnassignedAvatar() {
  return (
    <div
      className={`flex ${AVATAR_SIZE_CLASS} items-center justify-center rounded-full bg-slate-100 text-slate-400`}
      aria-hidden="true"
    >
      <User className="h-5 w-5" strokeWidth={1.75} />
    </div>
  );
}

function DriverAvatar({
  name,
  photoUrl,
  assigned,
}: {
  name?: string;
  photoUrl?: string;
  assigned: boolean;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);

  if (!assigned || !name) {
    return <UnassignedAvatar />;
  }

  if (photoUrl && !photoFailed) {
    return (
      <div
        className={`relative ${AVATAR_SIZE_CLASS} overflow-hidden rounded-full`}
        aria-hidden="true"
      >
        <img
          src={photoUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setPhotoFailed(true)}
        />
      </div>
    );
  }

  return <InitialsAvatar name={name} />;
}

export default function LoadDetailDriverCard({
  loadId,
  loadReference,
  pickupLabel,
  deliveryLabel,
  brokerEmail,
  driverName,
  driverPhotoUrl,
  driverPhone,
  driverEmail,
  driverId,
  driverDutyStatus,
  drivers,
}: LoadDetailDriverCardProps) {
  const [reassignOpen, setReassignOpen] = useState(false);
  const [flowKey, setFlowKey] = useState(0);
  const driverAssigned = Boolean(driverName);

  useRegisterAssignDriverTrigger(() => {
    setFlowKey((value) => value + 1);
    setReassignOpen(true);
  });
  const driverStatusTone =
    driverDutyStatus === "Driving"
      ? "driving"
      : driverDutyStatus === "Waiting"
        ? "waiting"
        : "neutral";

  return (
    <>
      <div className="flex items-center gap-3">
        <DriverAvatar
          name={driverName}
          photoUrl={driverPhotoUrl}
          assigned={driverAssigned}
        />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <EntityHoverPopover
            heading="Driver"
            status={driverAssigned ? driverDutyStatus : undefined}
            statusTone={driverStatusTone}
            rows={
              driverAssigned
                ? [
                    { label: "Phone", value: driverPhone ?? "—" },
                    { label: "Current Load", value: loadReference },
                    {
                      label: "Last Check Call",
                      value: getDriverCheckCallMock(loadId),
                    },
                    {
                      label: "Hours Remaining",
                      value: getDriverHoursRemainingMock(loadId),
                    },
                  ]
                : [{ label: "Status", value: "No driver assigned" }]
            }
          >
            <p className="truncate text-[15px] font-bold leading-none text-slate-950 cursor-default">
              {driverName ?? "Unassigned"}
            </p>
          </EntityHoverPopover>
          {driverAssigned ? <DutyStatusBadge status={driverDutyStatus} /> : null}
        </div>
      </div>
      <LoadDetailDriverActions
        phone={driverPhone}
        email={driverEmail}
        driverAssigned={driverAssigned}
        onReassign={() => {
          setFlowKey((value) => value + 1);
          setReassignOpen(true);
        }}
      />
      <ReassignDriverFlow
        key={flowKey}
        loadId={loadId}
        loadReference={loadReference}
        pickupLabel={pickupLabel}
        deliveryLabel={deliveryLabel}
        brokerEmail={brokerEmail}
        drivers={drivers}
        currentDriverId={driverId}
        open={reassignOpen}
        onClose={() => setReassignOpen(false)}
      />
    </>
  );
}
