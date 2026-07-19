"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Load, Trailer } from "@/lib/types";
import { getActiveLoadsForTrailer } from "@/lib/fleet/trailer-board";

type TrailerQuickActionsProps = {
  trailer: Trailer;
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

export default function TrailerQuickActions({
  trailer,
  loads,
  variant = "header",
}: TrailerQuickActionsProps) {
  const router = useRouter();
  const activeLoads = getActiveLoadsForTrailer(trailer, loads);
  const primaryLoad = activeLoads[0];
  const assigned = Boolean(trailer.truckId);

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
        label="+ Assign Trailer"
        primary={!assigned}
        onClick={() => router.push("/loads")}
        title="Open dispatch to assign this trailer"
      />
      <ActionButton
        label="Unassign"
        disabled={!assigned}
        onClick={() =>
          router.push(`/fleet/trailers/${trailer.id}?tab=overview`)
        }
        title={
          assigned
            ? "Unassign from current truck (stub — open overview)"
            : "Trailer is not assigned"
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
        label="Upload Document"
        onClick={() =>
          router.push(`/fleet/trailers/${trailer.id}?tab=documents`)
        }
      />
      <ActionButton
        label="Report Damage"
        onClick={() =>
          router.push(`/fleet/trailers/${trailer.id}?tab=maintenance`)
        }
        title="Flag trailer for shop attention"
      />
      <ActionButton
        label="Schedule Service"
        onClick={() =>
          router.push(`/fleet/trailers/${trailer.id}?tab=maintenance`)
        }
      />
    </>
  );

  if (variant === "bar") {
    return <div className="flex flex-wrap gap-2">{actions}</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">{actions}</div>
  );
}
