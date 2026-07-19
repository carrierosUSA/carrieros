"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import type { AccidentDraftInput } from "@/lib/types/compliance";

type DriverOption = { id: string; name: string };
type UnitOption = { id: string; unitNumber: string };

type ReportAccidentModalProps = {
  open: boolean;
  onClose: () => void;
  drivers: DriverOption[];
  trucks: UnitOption[];
  trailers: UnitOption[];
  onSubmit: (input: AccidentDraftInput) => void;
};

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function ReportAccidentModal({
  open,
  onClose,
  drivers,
  trucks,
  trailers,
  onSubmit,
}: ReportAccidentModalProps) {
  const isClient = useIsClient();
  const [driverId, setDriverId] = useState(drivers[0]?.id ?? "");
  const [truckId, setTruckId] = useState("");
  const [trailerId, setTrailerId] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [occurredAt, setOccurredAt] = useState("2026-07-17T12:00");
  const [hasPoliceReport, setHasPoliceReport] = useState(false);
  const [witnesses, setWitnesses] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !isClient) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!driverId || !location.trim() || !description.trim()) {
      setError("Driver, location, and description are required.");
      return;
    }
    const driver = drivers.find((d) => d.id === driverId);
    const truck = trucks.find((t) => t.id === truckId);
    const trailer = trailers.find((t) => t.id === trailerId);
    onSubmit({
      driverId,
      driverName: driver?.name ?? "Unknown",
      truckId: truck?.id,
      truckUnit: truck?.unitNumber,
      trailerId: trailer?.id,
      trailerUnit: trailer?.unitNumber,
      location: location.trim(),
      description: description.trim(),
      occurredAt: new Date(occurredAt).toISOString(),
      hasPoliceReport,
      witnesses: witnesses
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean),
    });
    setError(null);
    setLocation("");
    setDescription("");
    setWitnesses("");
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/30 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-[16px] bg-white shadow-2xl shadow-slate-400/20 ring-1 ring-[#EAEAEA]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accident-modal-title"
      >
        <div className="border-b border-[#F1F5F9] px-5 py-4">
          <h2
            id="accident-modal-title"
            className="text-[16px] font-semibold text-slate-900"
          >
            Report accident
          </h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Capture the essentials now — photos and police report can follow.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 px-5 py-4">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-slate-600">
              Driver *
            </span>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="h-10 w-full rounded-xl bg-[#F8FAFC] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-[#EAEAEA] focus:ring-2 focus:ring-[#93C5FD]"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-slate-600">
                Truck
              </span>
              <select
                value={truckId}
                onChange={(e) => setTruckId(e.target.value)}
                className="h-10 w-full rounded-xl bg-[#F8FAFC] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-[#EAEAEA] focus:ring-2 focus:ring-[#93C5FD]"
              >
                <option value="">None</option>
                {trucks.map((t) => (
                  <option key={t.id} value={t.id}>
                    Unit {t.unitNumber}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-slate-600">
                Trailer
              </span>
              <select
                value={trailerId}
                onChange={(e) => setTrailerId(e.target.value)}
                className="h-10 w-full rounded-xl bg-[#F8FAFC] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-[#EAEAEA] focus:ring-2 focus:ring-[#93C5FD]"
              >
                <option value="">None</option>
                {trailers.map((t) => (
                  <option key={t.id} value={t.id}>
                    Unit {t.unitNumber}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-slate-600">
              When *
            </span>
            <input
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="h-10 w-full rounded-xl bg-[#F8FAFC] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-[#EAEAEA] focus:ring-2 focus:ring-[#93C5FD]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-slate-600">
              Location *
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Highway, city, yard…"
              className="h-10 w-full rounded-xl bg-[#F8FAFC] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-[#EAEAEA] focus:ring-2 focus:ring-[#93C5FD]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-slate-600">
              What happened *
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of the incident"
              className="w-full resize-none rounded-xl bg-[#F8FAFC] px-3 py-2 text-[14px] text-slate-900 outline-none ring-1 ring-[#EAEAEA] focus:ring-2 focus:ring-[#93C5FD]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-slate-600">
              Witnesses
            </span>
            <input
              type="text"
              value={witnesses}
              onChange={(e) => setWitnesses(e.target.value)}
              placeholder="Comma-separated names"
              className="h-10 w-full rounded-xl bg-[#F8FAFC] px-3 text-[14px] text-slate-900 outline-none ring-1 ring-[#EAEAEA] focus:ring-2 focus:ring-[#93C5FD]"
            />
          </label>

          <label className="flex items-center gap-2 text-[14px] text-slate-700">
            <input
              type="checkbox"
              checked={hasPoliceReport}
              onChange={(e) => setHasPoliceReport(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Police report filed
          </label>

          {error ? (
            <p className="text-[13px] font-medium text-[#DC2626]">{error}</p>
          ) : null}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[#2563EB] text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Save accident
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[#F8FAFC] text-[13px] font-semibold text-slate-700 ring-1 ring-[#EAEAEA]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
