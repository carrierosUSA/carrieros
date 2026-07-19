"use client";

import Link from "next/link";
import { useState } from "react";
import PremiumStatusBadge from "@/components/premium/StatusBadge";

type DriverCommunicationCardProps = {
  loadId: string;
  driverName?: string;
  phone?: string;
  truckNumber?: string;
  trailerNumber?: string;
  statusLabel: string;
  statusTone: "green" | "amber" | "blue" | "slate";
  lastLocation?: string;
  lastLocationUpdate?: string;
  trackingEnabled: boolean;
};

function ActionButton({
  label,
  onClick,
  href,
  primary = false,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  primary?: boolean;
}) {
  const className = primary
    ? "rounded-lg bg-[#2563EB] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-blue-500"
    : "rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-slate-700 transition hover:border-blue-200";

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
}

export default function DriverCommunicationCard({
  loadId,
  driverName,
  phone,
  truckNumber,
  trailerNumber,
  statusLabel,
  statusTone,
  lastLocation,
  lastLocationUpdate,
  trackingEnabled,
}: DriverCommunicationCardProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const hasDriver = Boolean(driverName);

  function queueAction(message: string) {
    setFeedback(message);
  }

  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-900">Driver</h2>
          <p className="mt-1 text-[15px] font-semibold text-slate-950">
            {hasDriver ? driverName : "Unassigned"}
          </p>
        </div>
        <PremiumStatusBadge label={statusLabel} tone={statusTone} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        <div className="rounded-lg bg-[#FAFBFC] px-2.5 py-2">
          <p className="text-slate-400">Phone</p>
          <p className="mt-0.5 font-medium text-slate-800">{phone ?? "—"}</p>
        </div>
        <div className="rounded-lg bg-[#FAFBFC] px-2.5 py-2">
          <p className="text-slate-400">Truck</p>
          <p className="mt-0.5 font-medium text-slate-800">
            {truckNumber ?? "—"}
          </p>
        </div>
        <div className="rounded-lg bg-[#FAFBFC] px-2.5 py-2">
          <p className="text-slate-400">Trailer</p>
          <p className="mt-0.5 font-medium text-slate-800">
            {trailerNumber ?? "—"}
          </p>
        </div>
        <div className="rounded-lg bg-[#FAFBFC] px-2.5 py-2">
          <p className="text-slate-400">Location</p>
          <p className="mt-0.5 font-medium text-slate-800">
            {lastLocation ?? "—"}
          </p>
        </div>
      </div>
      {lastLocationUpdate ? (
        <p className="mt-2 text-[11px] text-slate-400">{lastLocationUpdate}</p>
      ) : null}

      {feedback ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
          {feedback}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {phone ? (
          <ActionButton
            label="Call Driver"
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            primary
          />
        ) : (
          <ActionButton
            label="Call Driver"
            onClick={() => queueAction("Assign a driver to enable calling.")}
          />
        )}
        {phone ? (
          <ActionButton
            label="Message Driver"
            href={`sms:${phone.replace(/[^\d+]/g, "")}`}
          />
        ) : (
          <ActionButton
            label="Message Driver"
            onClick={() => queueAction("Assign a driver to enable messaging.")}
          />
        )}
        {trackingEnabled && hasDriver ? (
          <ActionButton
            label="Live Location"
            href={`/loads/${loadId}/tracking`}
          />
        ) : null}
      </div>

      <div className="mt-4 border-t border-[#F1F5F9] pt-4">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          AI Actions
        </p>
        <div className="flex flex-wrap gap-2">
          <ActionButton
            label="Ask Alph"
            onClick={() => queueAction("Alph is reviewing this load.")}
          />
          <ActionButton
            label="Calculate ETA"
            onClick={() => queueAction("ETA calculated from last driver update.")}
          />
          <ActionButton
            label="Summarize update"
            onClick={() => queueAction("Alph summarized the latest check-in.")}
          />
          <ActionButton
            label="Resend documents"
            href={`/loads/${loadId}/documents`}
          />
        </div>
      </div>
    </section>
  );
}
