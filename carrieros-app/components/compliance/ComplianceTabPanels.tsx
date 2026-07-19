"use client";

import { useState } from "react";
import Link from "next/link";
import ComplianceStatusBadge from "@/components/compliance/ComplianceStatusBadge";
import {
  ACCIDENT_REPAIR_STATUS_LABELS,
  ACCIDENT_STATUS_LABELS,
  CLAIM_STATUS_LABELS,
  CLAIM_TYPE_LABELS,
  DOT_INSPECTION_LEVEL_LABELS,
  DRIVER_COMPLIANCE_TYPE_LABELS,
  DRUG_TEST_KIND_LABELS,
  DRUG_TEST_RESULT_LABELS,
  TRAINING_STATUS_LABELS,
  TRAILER_COMPLIANCE_TYPE_LABELS,
  TRUCK_COMPLIANCE_TYPE_LABELS,
  type AccidentRecord,
  type ClaimRecord,
  type DotInspection,
  type DriverComplianceItem,
  type DrugAlcoholRecord,
  type SafetyTrainingRecord,
  type TrailerComplianceItem,
  type TruckComplianceItem,
} from "@/lib/types/compliance";
import {
  formatComplianceDate,
  formatComplianceMoney,
} from "@/lib/compliance/compliance-board";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

function PanelHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">
      <p className="text-[15px] font-semibold text-slate-900">{title}</p>
      <p className="text-[13px] text-slate-500">{subtitle}</p>
    </div>
  );
}

function PanelEmpty({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-[16px] bg-[#F8F9FB] px-6 py-8 text-center">
      <p className="text-[15px] font-semibold text-[#111827]">{title}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280]">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="transpo-btn-primary mt-4 inline-flex text-[14px]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

/** @deprecated Use PanelEmpty — kept for local call sites during migration */
function EmptyState({ message }: { message: string }) {
  return <PanelEmpty title={message} description="Nothing to show here yet." />;
}

export function DriverCompliancePanel({
  items,
}: {
  items: DriverComplianceItem[];
}) {
  const byDriver = new Map<string, DriverComplianceItem[]>();
  for (const item of items) {
    const list = byDriver.get(item.driverId) ?? [];
    list.push(item);
    byDriver.set(item.driverId, list);
  }

  if (items.length === 0) {
    return (
      <PanelEmpty
        title="No driver credentials yet"
        description="Add CDL, medical, and other driver documents so Alph can warn before they expire."
        actionLabel="Open Drivers"
        actionHref="/drivers"
      />
    );
  }

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Driver compliance"
        subtitle="CDL, medical, MVR, Clearinghouse, drug tests, reviews, and training certificates."
      />
      {Array.from(byDriver.entries()).map(([driverId, records]) => {
        const name = records[0]?.driverName ?? driverId;
        const attention = records.filter((r) => r.status !== "clear").length;
        return (
          <div
            key={driverId}
            className="rounded-[16px] bg-white p-4 ring-1 ring-[#EAEAEA]"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <Link
                  href={`/drivers/${driverId}`}
                  className="text-[15px] font-semibold text-slate-900 hover:text-[#2563EB]"
                >
                  {name}
                </Link>
                {attention > 0 ? (
                  <p className={`mt-0.5 text-[12px] font-medium ${TRANSPO_COLORS.warning.text}`}>
                    {attention} item{attention === 1 ? "" : "s"} need attention
                  </p>
                ) : (
                  <p className={`mt-0.5 text-[12px] font-medium ${TRANSPO_COLORS.success.text}`}>
                    All clear
                  </p>
                )}
              </div>
            </div>
            <ul className="space-y-2">
              {records.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-[#F8FAFC] px-3 py-2.5"
                >
                  <div>
                    <p className="text-[14px] font-medium text-slate-900">
                      {DRIVER_COMPLIANCE_TYPE_LABELS[item.type]}
                    </p>
                    {item.dueAt ? (
                      <p className="text-[12px] text-slate-500">
                        Due {formatComplianceDate(item.dueAt)}
                      </p>
                    ) : null}
                    {item.notes ? (
                      <p className="text-[12px] text-slate-500">{item.notes}</p>
                    ) : null}
                  </div>
                  <ComplianceStatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function TruckCompliancePanel({
  items,
}: {
  items: TruckComplianceItem[];
}) {
  const byTruck = new Map<string, TruckComplianceItem[]>();
  for (const item of items) {
    const list = byTruck.get(item.truckId) ?? [];
    list.push(item);
    byTruck.set(item.truckId, list);
  }

  if (items.length === 0) {
    return (
      <PanelEmpty
        title="No truck compliance yet"
        description="Track insurance, registration, and inspections so trucks stay road-ready."
        actionLabel="Open Fleet"
        actionHref="/fleet/trucks"
      />
    );
  }

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Truck compliance"
        subtitle="Annual inspection, registration, insurance, IFTA, IRP, permits, emissions, ELD."
      />
      {Array.from(byTruck.entries()).map(([truckId, records]) => (
        <div
          key={truckId}
          className="rounded-[16px] bg-white p-4 ring-1 ring-[#EAEAEA]"
        >
          <Link
            href={`/fleet/trucks/${truckId}`}
            className="mb-3 inline-block text-[15px] font-semibold text-slate-900 hover:text-[#2563EB]"
          >
            Unit {records[0]?.unitNumber}
          </Link>
          <ul className="space-y-2">
            {records.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-[#F8FAFC] px-3 py-2.5"
              >
                <div>
                  <p className="text-[14px] font-medium text-slate-900">
                    {TRUCK_COMPLIANCE_TYPE_LABELS[item.type]}
                  </p>
                  {item.dueAt ? (
                    <p className="text-[12px] text-slate-500">
                      Due {formatComplianceDate(item.dueAt)}
                    </p>
                  ) : null}
                  {item.notes ? (
                    <p className="text-[12px] text-slate-500">{item.notes}</p>
                  ) : null}
                </div>
                <ComplianceStatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function TrailerCompliancePanel({
  items,
}: {
  items: TrailerComplianceItem[];
}) {
  const byTrailer = new Map<string, TrailerComplianceItem[]>();
  for (const item of items) {
    const list = byTrailer.get(item.trailerId) ?? [];
    list.push(item);
    byTrailer.set(item.trailerId, list);
  }

  if (items.length === 0) {
    return (
      <PanelEmpty
        title="No trailer compliance yet"
        description="Add inspections and registration so trailer issues surface before dispatch."
        actionLabel="Open Trailers"
        actionHref="/fleet/trailers"
      />
    );
  }

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Trailer compliance"
        subtitle="Annual, registration, reefer, ABS, and tire inspections."
      />
      {Array.from(byTrailer.entries()).map(([trailerId, records]) => (
        <div
          key={trailerId}
          className="rounded-[16px] bg-white p-4 ring-1 ring-[#EAEAEA]"
        >
          <Link
            href={`/fleet/trailers/${trailerId}`}
            className="mb-3 inline-block text-[15px] font-semibold text-slate-900 hover:text-[#2563EB]"
          >
            Trailer {records[0]?.unitNumber}
          </Link>
          <ul className="space-y-2">
            {records.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-[#F8FAFC] px-3 py-2.5"
              >
                <div>
                  <p className="text-[14px] font-medium text-slate-900">
                    {TRAILER_COMPLIANCE_TYPE_LABELS[item.type]}
                  </p>
                  {item.dueAt ? (
                    <p className="text-[12px] text-slate-500">
                      Due {formatComplianceDate(item.dueAt)}
                    </p>
                  ) : null}
                  {item.notes ? (
                    <p className="text-[12px] text-slate-500">{item.notes}</p>
                  ) : null}
                </div>
                <ComplianceStatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function DotInspectionsPanel({
  inspections,
}: {
  inspections: DotInspection[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (inspections.length === 0) {
    return (
      <PanelEmpty
        title="No DOT inspections yet"
        description="Log roadside and terminal inspections here so history stays with the unit."
      />
    );
  }

  return (
    <div className="space-y-4">
      <PanelHeader
        title="DOT inspection center"
        subtitle="Levels I–VI with violations, OOS status, documents, and photos."
      />
      <ul className="space-y-3">
        {inspections.map((insp) => {
          const expanded = expandedId === insp.id;
          const resultTone =
            insp.result === "passed"
              ? TRANSPO_COLORS.success
              : insp.result === "oos"
                ? TRANSPO_COLORS.critical
                : TRANSPO_COLORS.warning;

          return (
            <li
              key={insp.id}
              className="rounded-[16px] bg-white ring-1 ring-[#EAEAEA]"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : insp.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">
                    {DOT_INSPECTION_LEVEL_LABELS[insp.level]}
                  </p>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    {formatComplianceDate(insp.date)} · {insp.location}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${resultTone.bg} ${resultTone.text} ${resultTone.border}`}
                >
                  {insp.result === "oos"
                    ? "Out of service"
                    : insp.result === "passed"
                      ? "Passed"
                      : "Failed"}
                </span>
              </button>
              {expanded ? (
                <div className="space-y-2 border-t border-[#F1F5F9] px-4 py-3 text-[13px] text-slate-600">
                  <p>
                    <span className="font-medium text-slate-800">Officer:</span>{" "}
                    {insp.officer}
                  </p>
                  {insp.driverName ? (
                    <p>
                      <span className="font-medium text-slate-800">Driver:</span>{" "}
                      {insp.driverName}
                    </p>
                  ) : null}
                  {insp.truckUnit ? (
                    <p>
                      <span className="font-medium text-slate-800">Truck:</span>{" "}
                      Unit {insp.truckUnit}
                      {insp.trailerUnit ? ` · Trailer ${insp.trailerUnit}` : ""}
                    </p>
                  ) : null}
                  <p>
                    <span className="font-medium text-slate-800">
                      Violations:
                    </span>{" "}
                    {insp.violations.length > 0
                      ? insp.violations.join("; ")
                      : "None"}
                  </p>
                  <p>
                    Documents {insp.documentCount} · Photos {insp.photoCount}
                    {insp.outOfService ? " · Out of service" : ""}
                  </p>
                  {insp.notes ? <p>{insp.notes}</p> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AccidentsPanel({ accidents }: { accidents: AccidentRecord[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (accidents.length === 0) {
    return (
      <PanelEmpty
        title="No accidents on file"
        description="When something happens, report it once — Alph keeps the follow-up list clear."
        actionLabel="Report Accident"
        actionHref="/compliance"
      />
    );
  }

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Accident center"
        subtitle="Driver, equipment, load, location, witnesses, and repair status."
      />
      <ul className="space-y-3">
        {accidents.map((acc) => {
          const expanded = expandedId === acc.id;
          const statusTone =
            acc.status === "closed"
              ? TRANSPO_COLORS.success
              : acc.status === "investigating"
                ? TRANSPO_COLORS.warning
                : TRANSPO_COLORS.critical;

          return (
            <li
              key={acc.id}
              className="rounded-[16px] bg-white ring-1 ring-[#EAEAEA]"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : acc.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div>
                  <p className="text-[14px] font-semibold text-slate-900">
                    {acc.driverName}
                    {acc.truckUnit ? ` · Unit ${acc.truckUnit}` : ""}
                  </p>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    {formatComplianceDate(acc.occurredAt)} · {acc.location}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${statusTone.bg} ${statusTone.text} ${statusTone.border}`}
                >
                  {ACCIDENT_STATUS_LABELS[acc.status]}
                </span>
              </button>
              {expanded ? (
                <div className="space-y-2 border-t border-[#F1F5F9] px-4 py-3 text-[13px] text-slate-600">
                  <p>{acc.description}</p>
                  {acc.loadReference ? (
                    <p>
                      <span className="font-medium text-slate-800">Load:</span>{" "}
                      {acc.loadReference}
                    </p>
                  ) : null}
                  {acc.trailerUnit ? (
                    <p>
                      <span className="font-medium text-slate-800">Trailer:</span>{" "}
                      {acc.trailerUnit}
                    </p>
                  ) : null}
                  <p>
                    Photos {acc.photoCount} · Police report{" "}
                    {acc.hasPoliceReport ? "yes" : "no"}
                  </p>
                  {acc.witnesses.length > 0 ? (
                    <p>Witnesses: {acc.witnesses.join(", ")}</p>
                  ) : null}
                  <p>
                    Repair: {ACCIDENT_REPAIR_STATUS_LABELS[acc.repairStatus]}
                    {acc.insuranceClaimId
                      ? ` · Claim ${acc.insuranceClaimId}`
                      : ""}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ClaimsPanel({ claims }: { claims: ClaimRecord[] }) {
  if (claims.length === 0) {
    return (
      <PanelEmpty
        title="No claims on file"
        description="Insurance and cargo claims will appear here when they are opened."
      />
    );
  }

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Claims"
        subtitle="Cargo, damage, insurance, broker, and customer claims."
      />
      <ul className="space-y-3">
        {claims.map((claim) => {
          const open =
            claim.status !== "settled" && claim.status !== "denied";
          const tone = open
            ? TRANSPO_COLORS.warning
            : claim.status === "settled"
              ? TRANSPO_COLORS.success
              : TRANSPO_COLORS.disabled;

          return (
            <li
              key={claim.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-white px-4 py-3 ring-1 ring-[#EAEAEA]"
            >
              <div>
                <p className="text-[14px] font-semibold text-slate-900">
                  {claim.title}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {CLAIM_TYPE_LABELS[claim.type]} · Opened{" "}
                  {formatComplianceDate(claim.openedAt)}
                  {claim.loadReference ? ` · ${claim.loadReference}` : ""}
                </p>
                {claim.notes ? (
                  <p className="mt-1 text-[13px] text-slate-600">{claim.notes}</p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-[16px] font-bold tabular-nums text-slate-950">
                  {formatComplianceMoney(claim.amount)}
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.border}`}
                >
                  {CLAIM_STATUS_LABELS[claim.status]}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DrugAlcoholPanel({
  records,
}: {
  records: DrugAlcoholRecord[];
}) {
  if (records.length === 0) {
    return (
      <PanelEmpty
        title="No drug & alcohol tests"
        description="Record consortium and reasonable-suspicion tests to stay audit-ready."
      />
    );
  }

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Drug & alcohol"
        subtitle="Pre-employment, random, post-accident, and follow-up testing."
      />
      <ul className="space-y-3">
        {records.map((rec) => {
          const tone =
            rec.result === "negative"
              ? TRANSPO_COLORS.success
              : rec.result === "positive" || rec.result === "refused"
                ? TRANSPO_COLORS.critical
                : TRANSPO_COLORS.info;

          return (
            <li
              key={rec.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-white px-4 py-3 ring-1 ring-[#EAEAEA]"
            >
              <div>
                <p className="text-[14px] font-semibold text-slate-900">
                  {rec.driverName}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {DRUG_TEST_KIND_LABELS[rec.kind]}
                  {rec.scheduledAt
                    ? ` · Scheduled ${formatComplianceDate(rec.scheduledAt)}`
                    : ""}
                  {rec.completedAt
                    ? ` · Completed ${formatComplianceDate(rec.completedAt)}`
                    : ""}
                </p>
                {rec.nextDueAt ? (
                  <p className="mt-1 text-[12px] text-slate-500">
                    Next due {formatComplianceDate(rec.nextDueAt)}
                  </p>
                ) : null}
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.border}`}
              >
                {DRUG_TEST_RESULT_LABELS[rec.result]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TrainingPanel({
  records,
}: {
  records: SafetyTrainingRecord[];
}) {
  if (records.length === 0) {
    return (
      <PanelEmpty
        title="No training assignments"
        description="Assign safety training so drivers and dispatch stay current."
      />
    );
  }

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Safety training"
        subtitle="Assigned courses, due dates, and certificates."
      />
      <ul className="space-y-3">
        {records.map((rec) => {
          const tone =
            rec.status === "completed"
              ? TRANSPO_COLORS.success
              : rec.status === "overdue"
                ? TRANSPO_COLORS.critical
                : rec.status === "in_progress"
                  ? TRANSPO_COLORS.info
                  : TRANSPO_COLORS.warning;

          return (
            <li
              key={rec.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-white px-4 py-3 ring-1 ring-[#EAEAEA]"
            >
              <div>
                <p className="text-[14px] font-semibold text-slate-900">
                  {rec.course}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  {rec.driverName}
                  {rec.dueAt ? ` · Due ${formatComplianceDate(rec.dueAt)}` : ""}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.border}`}
              >
                {TRAINING_STATUS_LABELS[rec.status]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
