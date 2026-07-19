"use client";

import type { IntegrationMeta } from "@/lib/settings/integrations-catalog";
import type { IntegrationConnection } from "@/lib/settings/types";

type IntegrationCardProps = {
  meta: IntegrationMeta;
  connection: IntegrationConnection;
  onConnect: () => void;
  onDisconnect: () => void;
};

function statusTone(status: IntegrationConnection["status"]) {
  switch (status) {
    case "connected":
      return { label: "Connected", className: "bg-[#ECFDF5] text-[#15803D]" };
    case "error":
      return { label: "Needs attention", className: "bg-[#FEF2F2] text-[#B91C1C]" };
    default:
      return { label: "Not connected", className: "bg-[#F1F5F9] text-slate-600" };
  }
}

export default function IntegrationCard({
  meta,
  connection,
  onConnect,
  onDisconnect,
}: IntegrationCardProps) {
  const tone = statusTone(connection.status);
  const connected = connection.status === "connected";

  return (
    <article className="flex flex-col justify-between rounded-[16px] bg-[#F8FAFC] p-4 ring-1 ring-[#EAEAEA]">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {meta.category}
            </p>
            <h3 className="mt-1 text-[15px] font-semibold text-slate-950">
              {meta.name}
            </h3>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${tone.className}`}
          >
            {tone.label}
          </span>
        </div>
        <p className="mt-2 text-[14px] leading-snug text-slate-600">
          {meta.description}
        </p>
        {connection.note ? (
          <p className="mt-2 text-[13px] text-[#C2410C]">{connection.note}</p>
        ) : null}
        {connection.lastSyncAt ? (
          <p className="mt-2 text-[13px] text-slate-500">
            Last sync{" "}
            {new Date(connection.lastSyncAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex gap-2">
        {connected ? (
          <button
            type="button"
            onClick={onDisconnect}
            className="inline-flex h-9 items-center rounded-[10px] bg-white px-3 text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA] transition hover:bg-slate-50"
          >
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            title={
              connection.status === "error"
                ? connection.note || "Retry connecting this integration."
                : undefined
            }
            className="inline-flex h-9 items-center rounded-[10px] bg-[#2563EB] px-3 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            {connection.status === "error" ? "Retry connect" : "Connect"}
          </button>
        )}
      </div>
    </article>
  );
}
