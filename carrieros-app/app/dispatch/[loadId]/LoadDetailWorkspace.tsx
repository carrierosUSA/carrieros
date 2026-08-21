"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  assignVerifiedLoadAction,
  closeVerifiedLoadAction,
  getLoadDetailAction,
  getClosureWorkspaceAction,
  linkVerifiedClosureDocumentAction,
  updateVerifiedLoadAction,
} from "@/app/actions/dispatch";
import Sidebar from "@/components/Sidebar";
import type {
  AssignableDriver,
  ClosureDocumentCandidate,
  LoadDetail,
  LoadClosureReadiness,
  LoadStopDetail,
  LoadUpdateCapabilities,
} from "@/lib/operations/load-types";
import type { LoadStatus } from "@/lib/types/load";

export default function LoadDetailWorkspace({ loadId }: { loadId: string }) {
  const [detail, setDetail] = useState<LoadDetail | null>(null);
  const [capabilities, setCapabilities] =
    useState<LoadUpdateCapabilities | null>(null);
  const [drivers, setDrivers] = useState<AssignableDriver[]>([]);
  const [state, setState] = useState<
    "loading" | "ready" | "not-found" | "unavailable"
  >("loading");

  useEffect(() => {
    let active = true;
    getLoadDetailAction(loadId)
      .then((result) => {
        if (!active) return;
        if (!result.ok) setState("unavailable");
        else if (!result.load || !result.capabilities) setState("not-found");
        else {
          setDetail(result.load);
          setCapabilities(result.capabilities);
          setDrivers(result.drivers);
          setState("ready");
        }
      })
      .catch(() => {
        if (active) setState("unavailable");
      });
    return () => {
      active = false;
    };
  }, [loadId]);

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#0B1220]">
      <Sidebar />
      <section className="ml-72 min-h-screen px-8 py-7 xl:px-10">
        <div className="mx-auto max-w-[1400px]">
          <Link href="/dispatch" className="text-xs font-semibold text-[#2563EB]">
            ← Dispatch board
          </Link>
          {state !== "ready" || !detail || !capabilities ? (
            <Empty state={state} />
          ) : (
            <Detail
              detail={detail}
              capabilities={capabilities}
              drivers={drivers}
              onSaved={(load, nextCapabilities) => {
                setDetail(load);
                setCapabilities(nextCapabilities);
              }}
              onAssigned={(load, nextCapabilities, nextDrivers) => {
                setDetail(load);
                setCapabilities(nextCapabilities);
                setDrivers(nextDrivers);
              }}
            />
          )}
        </div>
      </section>
    </main>
  );
}

function Detail({
  detail,
  capabilities,
  drivers,
  onSaved,
  onAssigned,
}: {
  detail: LoadDetail;
  capabilities: LoadUpdateCapabilities;
  drivers: AssignableDriver[];
  onSaved: (load: LoadDetail, capabilities: LoadUpdateCapabilities) => void;
  onAssigned: (
    load: LoadDetail,
    capabilities: LoadUpdateCapabilities,
    drivers: AssignableDriver[],
  ) => void;
}) {
  return (
    <>
      <header className="mt-5 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#2563EB]">
            Verified load detail
          </p>
          <h1 className="mt-2 text-[34px] font-semibold">
            {detail.loadNumber || "Load number pending"}
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            {detail.origin || "Origin not recorded"} →{" "}
            {detail.destination || "Destination not recorded"}
          </p>
        </div>
        <div className="flex gap-2">
          <Disabled label="Call driver" />
          <Disabled label="Message driver" />
        </div>
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-4">
        <Card
          label="Pickup number"
          value={detail.pickupNumber || "Not recorded"}
          prominent
        />
        <Card label="Status" value={detail.status.replaceAll("_", " ")} />
        <Card
          label="Driver / truck / trailer"
          value={[
            detail.driverDisplayName || (detail.driverUserId ? "Verified driver" : "Unassigned"),
            detail.truckUnit,
            detail.trailerUnit,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
        <Card
          label="Rate"
          value={
            detail.rateCents === undefined
              ? "Restricted or not recorded"
              : money(detail.rateCents, detail.currency)
          }
        />
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,.8fr)]">
        <div className="space-y-4">
          <Panel title="Stops and appointments">
            <div className="space-y-3">
              {detail.stops.length ? (
                detail.stops.map((stop) => <Stop key={stop.id} stop={stop} />)
              ) : (
                <Missing text="No verified stops recorded." />
              )}
            </div>
          </Panel>
          <Panel title="Freight and equipment">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Fact label="Commodity" value={detail.commodity} />
              <Fact
                label="Weight"
                value={
                  detail.weightLbs === undefined
                    ? undefined
                    : `${detail.weightLbs.toLocaleString()} lb`
                }
              />
              <Fact label="Equipment" value={detail.equipmentType} />
              <Fact label="Temperature" value={detail.temperatureRequirement} />
              <Fact label="Seal number" value={detail.sealNumber} />
              <Fact label="Delivery number" value={detail.deliveryNumber} />
            </div>
          </Panel>
          <Panel title="Operational timeline">
            <div className="space-y-3">
              {detail.timeline.length ? (
                detail.timeline.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-[#E2E8F0] p-3"
                  >
                    <div className="flex justify-between gap-2">
                      <b className="text-xs capitalize">
                        {event.type.replaceAll("_", " ")}
                      </b>
                      <span className="text-[11px] text-[#64748B]">
                        {dateTime(event.eventAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {[
                        event.location,
                        event.eta ? `ETA ${dateTime(event.eta)}` : undefined,
                        event.note,
                        `Source: ${event.source}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                ))
              ) : (
                <Missing text="No verified timeline events recorded." />
              )}
            </div>
          </Panel>
        </div>

        <aside className="space-y-4">
          <LoadAssignment
            detail={detail}
            capabilities={capabilities}
            drivers={drivers}
            onAssigned={onAssigned}
          />
          <ClosureWorkspace
            detail={detail}
            capabilities={capabilities}
            onClosed={onSaved}
          />
          <OperationalUpdate
            detail={detail}
            capabilities={capabilities}
            onSaved={onSaved}
          />
          <Panel title="Current position">
            <Fact label="Verified location" value={detail.currentLocation} />
            <div className="mt-3">
              <Fact
                label="ETA"
                value={detail.eta ? dateTime(detail.eta) : undefined}
              />
            </div>
            <p className="mt-3 text-[11px] text-[#64748B]">
              Tracking is integration-ready. Location and ETA are never guessed.
            </p>
          </Panel>
          <Panel title="Instructions and safety">
            <Fact label="Special instructions" value={detail.specialInstructions} />
            <div className="mt-3">
              <Fact
                label="Emergency requirements"
                value={detail.emergencyRequirements}
              />
            </div>
            <p className="mt-3 rounded-xl bg-[#0F172A] p-3 text-[11px] leading-5 text-[#CBD5E1]">
              Driver and carrier retain every safety, movement, and equipment
              decision.
            </p>
          </Panel>
          <Panel title="Contacts">
            <Fact label="Broker" value={detail.brokerName} />
            <div className="mt-3">
              <Fact label="Broker contact" value={detail.brokerContact} />
            </div>
            <div className="mt-3">
              <Fact
                label="Emergency contact"
                value={
                  detail.emergencyRequirements
                    ? "See emergency requirements"
                    : undefined
                }
              />
            </div>
          </Panel>
          <Panel title="Documents">
            <p className="text-xs text-[#64748B]">
              Open Document Center for the verified rate confirmation, BOL, POD,
              and supporting files.
            </p>
            <Link
              href="/documents"
              className="mt-3 inline-flex rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold"
            >
              Open documents
            </Link>
          </Panel>
          <Panel title="Nova helper">
            <p className="text-xs leading-5 text-[#64748B]">
              Nova can review authenticated facts and suggest human follow-up.
              It cannot change this load or authorize movement.
            </p>
            <Link href={`/nova?loadId=${detail.id}`} className="mt-3 inline-flex rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold">Review this load with Nova</Link>
          </Panel>
        </aside>
      </div>
    </>
  );
}

function ClosureWorkspace({
  detail,
  capabilities,
  onClosed,
}: {
  detail: LoadDetail;
  capabilities: LoadUpdateCapabilities;
  onClosed: (load: LoadDetail, capabilities: LoadUpdateCapabilities) => void;
}) {
  const [documents, setDocuments] = useState<ClosureDocumentCandidate[]>([]);
  const [readiness, setReadiness] = useState<LoadClosureReadiness>({ hasVerifiedPod: false, hasVerifiedInvoice: false, readyToClose: false });
  const [documentId, setDocumentId] = useState("");
  const [exceptionsResolved, setExceptionsResolved] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!capabilities.canManageClosure) return;
    let active = true;
    getClosureWorkspaceAction(detail.id).then((result) => {
      if (!active) return;
      if (result.ok) {
        setDocuments(result.documents);
        setReadiness(result.readiness);
      } else setMessage(result.error);
    });
    return () => { active = false; };
  }, [capabilities.canManageClosure, detail.id]);

  if (!capabilities.canManageClosure) return null;

  async function linkDocument() {
    setBusy(true);
    setMessage("");
    const result = await linkVerifiedClosureDocumentAction({ loadId: detail.id, documentId, requestId: crypto.randomUUID() });
    if (result.ok) {
      setDocuments(result.documents);
      setReadiness(result.readiness);
      setDocumentId("");
      setMessage("Verified document linked. Load status did not change.");
    } else setMessage(result.error);
    setBusy(false);
  }

  async function closeLoad() {
    setBusy(true);
    setMessage("");
    const result = await closeVerifiedLoadAction({
      loadId: detail.id,
      expectedStatus: detail.status,
      exceptionsResolved,
      note,
      requestId: crypto.randomUUID(),
    });
    if (result.ok) onClosed(result.load, result.capabilities);
    else setMessage(result.error);
    setBusy(false);
  }

  return (
    <Panel title="Verified closure">
      <p className="text-[11px] leading-5 text-[#64748B]">
        Link only the current human-approved POD and invoice. Linking evidence never closes a load automatically.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <StatusCheck label="Approved POD" ready={readiness.hasVerifiedPod} />
        <StatusCheck label="Approved invoice" ready={readiness.hasVerifiedInvoice} />
      </div>
      <div className="mt-3 space-y-2">
        <select value={documentId} onChange={(event) => setDocumentId(event.target.value)} className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-xs">
          <option value="">Select verified document</option>
          {documents.map((document) => <option key={document.id} value={document.id}>{document.documentType.toUpperCase()} · {document.title}</option>)}
        </select>
        <button disabled={busy || !documentId} onClick={() => void linkDocument()} className="w-full rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-xs font-semibold disabled:opacity-50">
          Link verified document
        </button>
      </div>
      {detail.status === "delivered" && (
        <div className="mt-4 space-y-3 border-t border-[#E2E8F0] pt-4">
          <label className="flex items-start gap-2 text-xs text-[#334155]">
            <input type="checkbox" checked={exceptionsResolved} onChange={(event) => setExceptionsResolved(event.target.checked)} className="mt-0.5" />
            <span>I verified that all exceptions are resolved.</span>
          </label>
          <Field label="Factual closure note">
            <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} rows={2} placeholder="Required when an exception was recorded" className="w-full resize-none rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-xs" />
          </Field>
          <button disabled={busy || !readiness.readyToClose || !exceptionsResolved} onClick={() => void closeLoad()} className="w-full rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">
            {busy ? "Verifying closure…" : "Approve final closure"}
          </button>
        </div>
      )}
      {message && <p className="mt-3 rounded-xl bg-[#F8FAFC] p-3 text-[11px] leading-5 text-[#475569]">{message}</p>}
    </Panel>
  );
}

function StatusCheck({ label, ready }: { label: string; ready: boolean }) {
  return <div className={`rounded-xl p-2 text-[11px] font-semibold ${ready ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#FFF7ED] text-[#9A3412]"}`}>{ready ? "✓" : "○"} {label}</div>;
}

function LoadAssignment({
  detail,
  capabilities,
  drivers,
  onAssigned,
}: {
  detail: LoadDetail;
  capabilities: LoadUpdateCapabilities;
  drivers: AssignableDriver[];
  onAssigned: (
    load: LoadDetail,
    capabilities: LoadUpdateCapabilities,
    drivers: AssignableDriver[],
  ) => void;
}) {
  const [driverUserId, setDriverUserId] = useState("");
  const [truckUnit, setTruckUnit] = useState("");
  const [trailerUnit, setTrailerUnit] = useState("");
  const [equipmentFitVerified, setEquipmentFitVerified] = useState(false);
  const [hosVerified, setHosVerified] = useState(false);
  const [safetyVerified, setSafetyVerified] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (detail.driverUserId) {
    return (
      <Panel title="Verified assignment">
        <Fact label="Driver" value={detail.driverDisplayName || "Verified driver account"} />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Fact label="Truck" value={detail.truckUnit} />
          <Fact label="Trailer" value={detail.trailerUnit} />
        </div>
        <p className="mt-3 text-[11px] leading-5 text-[#64748B]">
          Assignment records responsibility only. The driver and carrier retain every movement and safety decision.
        </p>
      </Panel>
    );
  }
  if (!capabilities.canAssignLoad) return null;

  async function assign() {
    setBusy(true);
    setMessage("");
    const result = await assignVerifiedLoadAction({
      loadId: detail.id,
      driverUserId,
      truckUnit,
      trailerUnit,
      equipmentFitVerified,
      hosVerified,
      safetyVerified,
      note,
      requestId: crypto.randomUUID(),
    });
    if (result.ok) {
      onAssigned(result.load, result.capabilities, result.drivers);
    } else {
      setMessage(result.error);
    }
    setBusy(false);
  }

  return (
    <Panel title="Approve verified assignment">
      <p className="text-[11px] leading-5 text-[#64748B]">
        A human dispatcher must verify the driver, actual equipment, HOS availability, and safety review. Assignment does not dispatch or authorize movement.
      </p>
      {drivers.length ? (
        <div className="mt-4 space-y-3">
          <Field label="Verified same-company driver">
            <select value={driverUserId} onChange={(event) => setDriverUserId(event.target.value)} className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-xs">
              <option value="">Select verified driver</option>
              {drivers.map((driver) => <option key={driver.userId} value={driver.userId}>{driver.displayName}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Actual truck unit">
              <input value={truckUnit} onChange={(event) => setTruckUnit(event.target.value)} maxLength={80} className="w-full rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-xs" />
            </Field>
            <Field label="Actual trailer unit">
              <input value={trailerUnit} onChange={(event) => setTrailerUnit(event.target.value)} maxLength={80} className="w-full rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-xs" />
            </Field>
          </div>
          {[
            ["Equipment fit verified", equipmentFitVerified, setEquipmentFitVerified],
            ["Available HOS verified", hosVerified, setHosVerified],
            ["Human safety review complete", safetyVerified, setSafetyVerified],
          ].map(([label, checked, setter]) => (
            <label key={String(label)} className="flex items-start gap-2 text-xs text-[#334155]">
              <input type="checkbox" checked={Boolean(checked)} onChange={(event) => (setter as (value: boolean) => void)(event.target.checked)} className="mt-0.5" />
              <span>{String(label)}</span>
            </label>
          ))}
          <Field label="Factual assignment note">
            <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} rows={2} className="w-full resize-none rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-xs" />
          </Field>
          {message && <p className="rounded-xl bg-[#F8FAFC] p-3 text-[11px] leading-5 text-[#475569]">{message}</p>}
          <button disabled={busy || !driverUserId || !truckUnit.trim() || !equipmentFitVerified || !hosVerified || !safetyVerified} onClick={() => void assign()} className="w-full rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">
            {busy ? "Saving verified assignment…" : "Approve assignment"}
          </button>
        </div>
      ) : (
        <Missing text="No verified same-company driver accounts are available. Add and verify a driver account before assignment." />
      )}
    </Panel>
  );
}

function OperationalUpdate({
  detail,
  capabilities,
  onSaved,
}: {
  detail: LoadDetail;
  capabilities: LoadUpdateCapabilities;
  onSaved: (load: LoadDetail, capabilities: LoadUpdateCapabilities) => void;
}) {
  const [nextStatus, setNextStatus] = useState<LoadStatus | "">("");
  const [location, setLocation] = useState("");
  const [eta, setEta] = useState("");
  const [exceptionSummary, setExceptionSummary] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setBusy(true);
    setMessage("");
    const result = await updateVerifiedLoadAction({
      loadId: detail.id,
      expectedStatus: detail.status,
      nextStatus: nextStatus || null,
      location,
      eta: eta ? new Date(eta).toISOString() : null,
      exceptionSummary,
      note,
      requestId: crypto.randomUUID(),
    });
    if (result.ok) {
      onSaved(result.load, result.capabilities);
      setNextStatus("");
      setLocation("");
      setEta("");
      setExceptionSummary("");
      setNote("");
      setMessage("Verified human update saved to the operational timeline.");
    } else {
      setMessage(result.error);
    }
    setBusy(false);
  }

  return (
    <Panel title="Record verified update">
      <p className="text-[11px] leading-5 text-[#64748B]">
        Enter only facts confirmed by the driver, facility, carrier, or connected
        tracking provider. This does not instruct movement.
      </p>
      {capabilities.canRecordFacts ? (
        <div className="mt-4 space-y-3">
          <Field label="Next lifecycle status">
            <select
              value={nextStatus}
              onChange={(event) =>
                setNextStatus(event.target.value as LoadStatus | "")
              }
              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-xs"
            >
              <option value="">No status change</option>
              {capabilities.allowedNextStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Verified current location">
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={300}
              placeholder="City, ST or confirmed facility"
              className="w-full rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-xs"
            />
          </Field>
          <Field label="Verified ETA">
            <input
              type="datetime-local"
              value={eta}
              onChange={(event) => setEta(event.target.value)}
              className="w-full rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-xs"
            />
          </Field>
          <Field label="Exception summary">
            <textarea
              value={exceptionSummary}
              onChange={(event) => setExceptionSummary(event.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="Only a verified exception"
              className="w-full resize-none rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-xs"
            />
          </Field>
          <Field label="Factual note">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={4000}
              rows={3}
              placeholder="Source and confirmed facts"
              className="w-full resize-none rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-xs"
            />
          </Field>
          {capabilities.closureRequiresDocuments && (
            <p className="rounded-xl bg-[#FFF7ED] p-3 text-[11px] leading-5 text-[#9A3412]">
              Closing remains locked until POD, invoice, and exceptions are
              verified.
            </p>
          )}
          {detail.status === "pending" && !detail.driverUserId && (
            <p className="rounded-xl bg-[#FFF7ED] p-3 text-[11px] leading-5 text-[#9A3412]">
              Dispatch release is locked until a verified driver and equipment assignment is approved.
            </p>
          )}
          {message && (
            <p className="rounded-xl bg-[#F8FAFC] p-3 text-[11px] leading-5 text-[#475569]">
              {message}
            </p>
          )}
          <button
            disabled={busy}
            onClick={() => void save()}
            className="w-full rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Saving verified facts…" : "Approve & save update"}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs font-semibold text-[#64748B]">
          Your authenticated role has read-only access.
        </p>
      )}
    </Panel>
  );
}

function Empty({ state }: { state: string }) {
  return (
    <section className="mt-6 grid min-h-[420px] place-items-center rounded-[24px] border border-[#DDE5F0] bg-white p-8 text-center">
      <div>
        <h1 className="text-xl font-semibold">
          {state === "loading"
            ? "Loading authorized load data"
            : state === "not-found"
              ? "Load not found or not authorized"
              : "Load operations unavailable"}
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">
          No unverified operational data will be displayed.
        </p>
      </div>
    </section>
  );
}

function Stop({ stop }: { stop: LoadStopDetail }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] p-4">
      <div className="flex justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#2563EB]">
            {stop.sequence}. {stop.type}
          </p>
          <h3 className="mt-2 text-sm font-semibold">
            {stop.facilityName || "Facility not recorded"}
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">
            {[stop.address, stop.city, stop.state].filter(Boolean).join(", ") ||
              "Address not recorded"}
          </p>
        </div>
        <div className="text-right">
          <b className="text-xs">{dateTime(stop.appointmentAt)}</b>
          <p className="mt-1 text-[11px] text-[#64748B]">
            {stop.appointmentTimezone || "Time zone not recorded"}
          </p>
        </div>
      </div>
      {stop.referenceNumber && (
        <p className="mt-3 rounded-lg bg-[#EFF6FF] px-3 py-2 text-xs font-semibold text-[#1D4ED8]">
          Reference / pickup # {stop.referenceNumber}
        </p>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[22px] border border-[#DDE5F0] bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-semibold uppercase tracking-[.12em] text-[#64748B]">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function Card({
  label,
  value,
  prominent = false,
}: {
  label: string;
  value: string;
  prominent?: boolean;
}) {
  return (
    <section
      className={`rounded-[20px] border p-4 ${
        prominent
          ? "border-[#93C5FD] bg-[#EFF6FF]"
          : "border-[#DDE5F0] bg-white"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#64748B]">
        {label}
      </p>
      <p
        className={`mt-3 font-semibold capitalize ${
          prominent ? "text-xl text-[#1D4ED8]" : "text-sm"
        }`}
      >
        {value || "Not recorded"}
      </p>
    </section>
  );
}

function Fact({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[.13em] text-[#94A3B8]">
        {label}
      </p>
      <p className="mt-1 text-xs font-medium text-[#334155]">
        {value || "Not recorded"}
      </p>
    </div>
  );
}

function Missing({ text }: { text: string }) {
  return <p className="rounded-xl bg-[#F8FAFC] p-4 text-xs text-[#64748B]">{text}</p>;
}

function Disabled({ label }: { label: string }) {
  return (
    <button
      disabled
      title="Communication provider coming soon"
      className="cursor-not-allowed rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-semibold text-[#94A3B8]"
    >
      {label} · Coming soon
    </button>
  );
}

function dateTime(value?: string) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not recorded"
    : new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
