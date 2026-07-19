"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Copy, XCircle, Plus } from "lucide-react";
import { usePortal } from "@/components/portal/PortalProvider";
import PermissionButton from "@/components/portal/PermissionButton";
import {
  PortalBadge,
  PortalCard,
  PortalEmpty,
  PortalSectionTitle,
} from "@/components/portal/ui";
import { getPortalLoadsForSession } from "@/lib/portal/data";
import { LOAD_STATUS_LABELS } from "@/lib/types/load";
import type { PortalLoadRequestStatus } from "@/lib/portal/types";

const STATUS_TONE: Record<
  PortalLoadRequestStatus,
  "gray" | "blue" | "green" | "orange" | "red"
> = {
  draft: "gray",
  submitted: "blue",
  accepted: "green",
  cancelled: "red",
  completed: "green",
};

export default function PortalLoads() {
  const {
    session,
    loadRequests,
    createLoadRequest,
    cancelLoadRequest,
    duplicateLoadRequest,
  } = usePortal();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [toast, setToast] = useState<string | null>(null);

  const loads = session ? getPortalLoadsForSession(session) : [];
  const filteredLoads = useMemo(() => {
    if (filter === "active") {
      return loads.filter((l) =>
        ["pending", "dispatched", "picked_up", "in_transit"].includes(l.status),
      );
    }
    if (filter === "completed") {
      return loads.filter(
        (l) => l.status === "delivered" || l.status === "invoiced",
      );
    }
    return loads;
  }, [loads, filter]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowCreate(true);
    }
  }, [searchParams]);

  if (!session) return null;

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }

  function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session) return;
    const fd = new FormData(e.currentTarget);
    createLoadRequest({
      companyId: session.companyId,
      createdByUserId: session.userId,
      originCity: String(fd.get("originCity") || ""),
      originState: String(fd.get("originState") || ""),
      destinationCity: String(fd.get("destinationCity") || ""),
      destinationState: String(fd.get("destinationState") || ""),
      pickupDate: String(fd.get("pickupDate") || ""),
      deliveryDate: String(fd.get("deliveryDate") || ""),
      commodity: String(fd.get("commodity") || "General freight"),
      equipmentType: String(fd.get("equipmentType") || "Dry Van"),
      weight: Number(fd.get("weight") || 0) || undefined,
      notes: String(fd.get("notes") || "") || undefined,
    });
    setShowCreate(false);
    router.replace("/portal/loads");
    flash("Load request submitted to dispatch.");
  }

  return (
    <div className="space-y-6">
      <PortalSectionTitle
        title="Loads"
        subtitle="Create requests, track active freight, and download rate confirmations."
        action={
          <PermissionButton
            role={session.role}
            permission="create_load_request"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" />
            Create Load Request
          </PermissionButton>
        }
      />

      {toast ? (
        <div className="rounded-xl bg-[#ECFDF3] px-4 py-3 text-sm font-medium text-[#166534]">
          {toast}
        </div>
      ) : null}

      <PortalCard>
        <h3 className="carrieros-card-title mb-3">Your load requests</h3>
        {loadRequests.length === 0 ? (
          <PortalEmpty
            title="No requests yet"
            body="Create a load request to send pickup and delivery details to dispatch."
          />
        ) : (
          <ul className="space-y-3">
            {loadRequests.map((req) => (
              <li
                key={req.id}
                className="rounded-2xl bg-[#F8F9FB] px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[#111827]">
                        {req.reference}
                      </p>
                      <PortalBadge tone={STATUS_TONE[req.status]}>
                        {req.status.replace("_", " ")}
                      </PortalBadge>
                    </div>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {req.originCity}, {req.originState} → {req.destinationCity},{" "}
                      {req.destinationState}
                    </p>
                    <p className="mt-0.5 text-sm text-[#6B7280]">
                      Pickup {req.pickupDate} · {req.equipmentType} ·{" "}
                      {req.commodity}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <PermissionButton
                      role={session.role}
                      permission="duplicate_load"
                      onClick={() => {
                        duplicateLoadRequest(req.id);
                        flash(`Duplicated ${req.reference}.`);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[13px] font-semibold text-[#374151] shadow-sm"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Duplicate
                    </PermissionButton>
                    <PermissionButton
                      role={session.role}
                      permission="cancel_load_request"
                      onClick={() => {
                        cancelLoadRequest(req.id);
                        flash(`Cancelled ${req.reference}.`);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[13px] font-semibold text-[#B91C1C] shadow-sm"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </PermissionButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PortalCard>

      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          {(
            [
              ["all", "All loads"],
              ["active", "Active"],
              ["completed", "Completed"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                filter === id
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#4B5563] shadow-sm"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <PortalCard>
          <ul className="divide-y divide-[#F3F4F6]">
            {filteredLoads.length === 0 ? (
              <li className="py-8">
                <PortalEmpty
                  title="Nothing here"
                  body="Loads linked to your company will appear in this list."
                />
              </li>
            ) : (
              filteredLoads.map((load) => (
                <li
                  key={load.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#111827]">
                      {load.reference}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      {load.origin.city}, {load.origin.state} →{" "}
                      {load.destination.city}, {load.destination.state}
                    </p>
                    <p className="mt-0.5 text-sm text-[#6B7280]">
                      {LOAD_STATUS_LABELS[load.status]} · $
                      {load.rate.toLocaleString()} · {load.miles} mi
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {load.trackingEnabled && load.trackingToken ? (
                      <a
                        href={`/track/${load.trackingToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-[#EFF6FF] px-3 py-2 text-[13px] font-semibold text-[#1D4ED8]"
                      >
                        Track
                      </a>
                    ) : null}
                    <PermissionButton
                      role={session.role}
                      permission="download_rate_con"
                      onClick={() =>
                        flash(`Downloading rate confirmation for ${load.reference}…`)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[13px] font-semibold text-[#374151] shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Rate Con
                    </PermissionButton>
                  </div>
                </li>
              ))
            )}
          </ul>
        </PortalCard>
      </div>

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-4 backdrop-blur-[2px] sm:items-center">
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold">Create Load Request</h3>
            <p className="mt-1 text-sm text-[#6B7280]">
              Dispatch will review and confirm capacity.
            </p>
            <form onSubmit={onCreate} className="mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field name="originCity" label="Origin city" defaultValue="Houston" required />
                <Field name="originState" label="State" defaultValue="TX" required />
                <Field
                  name="destinationCity"
                  label="Destination city"
                  defaultValue="Atlanta"
                  required
                />
                <Field name="destinationState" label="State" defaultValue="GA" required />
                <Field name="pickupDate" label="Pickup date" type="date" defaultValue="2026-07-20" required />
                <Field name="deliveryDate" label="Delivery date" type="date" defaultValue="2026-07-22" required />
                <Field name="equipmentType" label="Equipment" defaultValue="Dry Van" />
                <Field name="weight" label="Weight (lbs)" type="number" defaultValue="40000" />
              </div>
              <Field name="commodity" label="Commodity" defaultValue="General freight" />
              <label className="block">
                <span className="carrieros-label text-[#374151]">Notes</span>
                <textarea
                  name="notes"
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-[#DDE2EA] bg-[#F8F9FB] px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:bg-white"
                  placeholder="Appointment times, special instructions…"
                />
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    router.replace("/portal/loads");
                  }}
                  className="h-11 flex-1 rounded-xl bg-[#F3F4F6] text-sm font-semibold text-[#374151]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 flex-1 rounded-xl bg-[#2563EB] text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  Submit request
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  required,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="carrieros-label text-[#374151]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1.5 h-11 w-full rounded-xl border border-[#DDE2EA] bg-[#F8F9FB] px-3 text-sm outline-none focus:border-[#2563EB] focus:bg-white"
      />
    </label>
  );
}
