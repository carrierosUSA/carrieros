"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import type { Trailer, Truck } from "@/lib/types";
import type {
  Mechanic,
  MaintenanceVendor,
  WorkOrder,
  WorkOrderPriority,
} from "@/lib/types/maintenance";
import {
  WORK_ORDER_PRIORITIES,
  WORK_ORDER_PRIORITY_LABELS,
} from "@/lib/types/maintenance";

type CreateWorkOrderModalProps = {
  open: boolean;
  onClose: () => void;
  trucks: Truck[];
  trailers: Trailer[];
  mechanics: Mechanic[];
  vendors: MaintenanceVendor[];
  onCreate: (
    input: Omit<
      WorkOrder,
      "id" | "number" | "tenantId" | "createdAt" | "status"
    > & { status?: WorkOrder["status"] },
  ) => void;
  preset?: {
    title?: string;
    priority?: WorkOrderPriority;
    truckId?: string;
    trailerId?: string;
  };
};

export default function CreateWorkOrderModal({
  open,
  onClose,
  trucks,
  trailers,
  mechanics,
  vendors,
  onCreate,
  preset,
}: CreateWorkOrderModalProps) {
  const [title, setTitle] = useState(preset?.title ?? "");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<WorkOrderPriority>(
    preset?.priority ?? "normal",
  );
  const [truckId, setTruckId] = useState(preset?.truckId ?? "");
  const [trailerId, setTrailerId] = useState(preset?.trailerId ?? "");
  const [mechanicId, setMechanicId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [estimatedCost, setEstimatedCost] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Add a short title so the shop knows what to do.");
      return;
    }
    if (!truckId && !trailerId) {
      setError("Pick a truck or trailer for this work order.");
      return;
    }

    onCreate({
      title: title.trim(),
      description: description.trim() || title.trim(),
      priority,
      truckId: truckId || undefined,
      trailerId: trailerId || undefined,
      mechanicId: mechanicId || undefined,
      vendorId: vendorId || undefined,
      scheduledDate,
      estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
      status: "open",
    });

    setTitle("");
    setDescription("");
    setError(null);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-wo-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-[20px] bg-white p-5 shadow-[0_24px_64px_rgba(15,23,42,0.18)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              One-click task
            </p>
            <h2
              id="create-wo-title"
              className="mt-1 text-[20px] font-bold tracking-tight text-slate-950"
            >
              Create Work Order
            </h2>
            <p className="mt-1 text-[14px] text-slate-500">
              Assign a mechanic or vendor and get the unit moving.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC] text-slate-500 ring-1 ring-[#EAEAEA] hover:text-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g. Brake inspection — Unit 107"
              autoFocus
            />
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-[72px] resize-none py-2`}
              placeholder="Complaint, diagnosis notes, or PM details"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Truck">
              <select
                value={truckId}
                onChange={(e) => setTruckId(e.target.value)}
                className={inputClass}
              >
                <option value="">None</option>
                {trucks.map((truck) => (
                  <option key={truck.id} value={truck.id}>
                    Unit {truck.unitNumber}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Trailer">
              <select
                value={trailerId}
                onChange={(e) => setTrailerId(e.target.value)}
                className={inputClass}
              >
                <option value="">None</option>
                {trailers.map((trailer) => (
                  <option key={trailer.id} value={trailer.id}>
                    Trailer {trailer.unitNumber}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as WorkOrderPriority)
                }
                className={inputClass}
              >
                {WORK_ORDER_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {WORK_ORDER_PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Scheduled">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Mechanic">
              <select
                value={mechanicId}
                onChange={(e) => setMechanicId(e.target.value)}
                className={inputClass}
              >
                <option value="">Unassigned</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Vendor">
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className={inputClass}
              >
                <option value="">In-house</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Estimated cost (optional)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </Field>
          {error ? (
            <p className="text-[13px] font-medium text-[#DC2626]">{error}</p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-full px-4 text-[13px] font-semibold text-slate-600 ring-1 ring-[#EAEAEA] hover:bg-[#F8FAFC]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-full bg-[#2563EB] px-5 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Create Work Order
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-[10px] bg-[#F8FAFC] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-[#EAEAEA] focus:bg-white focus:ring-[#2563EB]";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-slate-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
