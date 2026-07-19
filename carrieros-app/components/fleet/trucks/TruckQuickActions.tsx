"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Load, Truck } from "@/lib/types";
import { getActiveLoadsForTruck } from "@/lib/fleet/truck-board";

type TruckQuickActionsProps = {
  truck: Truck;
  loads: Load[];
  variant?: "header" | "bar";
};

function ActionButton({
  label,
  onClick,
  href,
  primary,
  disabled,
  title,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  primary?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  if (href && !disabled) {
    return (
      <Link
        href={href}
        title={title}
        className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition ${
          primary
            ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
            : "bg-[#F8FAFC] text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        primary
          ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          : "bg-[#F8FAFC] text-slate-700 ring-1 ring-[#EAEAEA] hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function TruckQuickActions({
  truck,
  loads,
  variant = "header",
}: TruckQuickActionsProps) {
  const router = useRouter();
  const activeLoads = getActiveLoadsForTruck(truck.id, loads);
  const primaryLoad = activeLoads[0];

  const liveHref = primaryLoad
    ? `/loads/${primaryLoad.id}/tracking`
    : undefined;
  const replayHref = primaryLoad
    ? `/loads/${primaryLoad.id}/tracking/replay`
    : undefined;
  const historyHref = primaryLoad
    ? `/loads/${primaryLoad.id}/tracking`
    : undefined;

  const actions = (
    <>
      <ActionButton
        label="+ Assign Driver"
        primary
        onClick={() =>
          router.push(`/fleet/trucks/${truck.id}?tab=driver`)
        }
        title="Open driver assignment"
      />
      <ActionButton
        label="+ Assign Load"
        onClick={() => router.push("/loads")}
        title="Open dispatch to assign a load"
      />
      <ActionButton
        label="Schedule Maintenance"
        onClick={() =>
          router.push(
            `/fleet/maintenance?tab=pm&create=1&truck=${truck.id}`,
          )
        }
        title="Open fleet maintenance to schedule PM"
      />
      <ActionButton
        label="Upload Document"
        onClick={() =>
          router.push(`/fleet/trucks/${truck.id}?tab=documents`)
        }
      />
      <ActionButton
        label="View Live Location"
        href={liveHref}
        disabled={!liveHref}
        title={
          liveHref
            ? "Open live tracking"
            : "No active load with tracking"
        }
      />
      <ActionButton
        label="Replay Trip"
        href={replayHref}
        disabled={!replayHref}
        title={
          replayHref ? "Open trip replay" : "No active load to replay"
        }
      />
      <ActionButton
        label="Route History"
        href={historyHref}
        disabled={!historyHref}
        title={
          historyHref
            ? "Open route history"
            : "No active load with route history"
        }
      />
      <ActionButton
        label="Report Breakdown"
        onClick={() =>
          router.push(`/fleet/trucks/${truck.id}?tab=maintenance`)
        }
        title="Flag unit for shop attention"
      />
    </>
  );

  if (variant === "bar") {
    return <div className="flex flex-wrap gap-2">{actions}</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions}
      <Link
        href={`/fleet/trucks/${truck.id}/edit`}
        className="inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-medium text-slate-500 transition hover:text-slate-800"
      >
        Edit
      </Link>
    </div>
  );
}
