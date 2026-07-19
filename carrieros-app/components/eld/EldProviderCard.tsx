"use client";

import EldStatusBadge from "@/components/eld/EldStatusBadge";
import {
  ELD_DATA_TYPE_LABELS,
  type EldCatalogProvider,
  type EldConnectionStatus,
} from "@/lib/eld/types";

type EldProviderCardProps = {
  provider: EldCatalogProvider;
  status: EldConnectionStatus;
  onSelect: () => void;
  onRequest: () => void;
};

function formatVerification(isoDate: string): string {
  try {
    return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

export default function EldProviderCard({
  provider,
  status,
  onSelect,
  onRequest,
}: EldProviderCardProps) {
  const canConnect = status === "available";
  const isConnected = status === "connected";
  const primaryLabel = isConnected
    ? "View connection"
    : canConnect
      ? "Connect"
      : "Request Connection";

  return (
    <article className="flex flex-col rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA] transition hover:ring-[#D0D7E2]">
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start gap-3 text-left"
      >
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#EFF6FF] text-[13px] font-bold tracking-wide text-[#2563EB]">
          {provider.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold text-slate-900">
              {provider.name}
            </h3>
            <EldStatusBadge status={status} />
          </div>
          <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
            {provider.description}
          </p>
        </div>
      </button>

      <div className="mt-4">
        <p className="text-[12px] font-medium text-slate-400">Data available</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {provider.dataTypes.slice(0, 6).map((dt) => (
            <span
              key={dt}
              className="rounded-lg bg-[#F5F7FA] px-2 py-1 text-[11px] font-medium text-slate-600"
            >
              {ELD_DATA_TYPE_LABELS[dt]}
            </span>
          ))}
          {provider.dataTypes.length > 6 ? (
            <span className="rounded-lg bg-[#F5F7FA] px-2 py-1 text-[11px] font-medium text-slate-500">
              +{provider.dataTypes.length - 6}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[12px] text-slate-500">
        <span>
          Last verified{" "}
          <span className="font-semibold text-slate-700">
            {formatVerification(provider.lastVerificationDate)}
          </span>
        </span>
      </div>

      {provider.unavailableReason && status !== "connected" && status !== "available" ? (
        <p className="mt-3 rounded-[12px] bg-[#FFF7ED] px-3 py-2 text-[12px] leading-5 text-[#9A3412]">
          {provider.unavailableReason}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRequest}
          className="inline-flex h-9 items-center rounded-xl bg-[#2563EB] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={onSelect}
          className="inline-flex h-9 items-center rounded-xl bg-[#F5F7FA] px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-[#E8EDF5]"
        >
          Details
        </button>
      </div>
    </article>
  );
}
