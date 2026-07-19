"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import AuditLogStrip from "@/components/workforce/AuditLogStrip";
import WorkforceStatusBadge from "@/components/workforce/WorkforceStatusBadge";
import type {
  Application,
  AuditLogEntry,
  HiringCompany,
  JobPosting,
  ProfessionalProfile,
} from "@/lib/types/workforce";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
} from "@/lib/types/workforce";
import { candidateFullName } from "@/lib/workforce/board";
import { updateApplicationStatusAction } from "@/app/workforce/actions";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

type Props = {
  applications: Application[];
  jobs: JobPosting[];
  candidates: ProfessionalProfile[];
  companies: HiringCompany[];
  auditLog: AuditLogEntry[];
};

const NEXT: Partial<Record<Application["status"], Application["status"]>> = {
  applied: "screening",
  screening: "interview",
  interview: "offer",
  offer: "hired",
};

export default function ApplicationsClient({
  applications: initial,
  jobs,
  candidates,
  companies,
  auditLog,
}: Props) {
  const [applications, setApplications] = useState(initial);
  const [selectedId, setSelectedId] = useState(initial[0]?.id ?? null);
  const [pending, startTransition] = useTransition();
  const [view, setView] = useState<"pipeline" | "list">("pipeline");

  const selected = applications.find((a) => a.id === selectedId) ?? null;

  function advance(id: string, status: Application["status"]) {
    startTransition(async () => {
      const result = await updateApplicationStatusAction(id, status);
      if (result.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? result.application : a)),
        );
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("pipeline")}
            className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${
              view === "pipeline"
                ? "bg-[#2563EB] text-white"
                : "bg-[#F8F9FB] text-[#6B7280]"
            }`}
          >
            Pipeline
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${
              view === "list"
                ? "bg-[#2563EB] text-white"
                : "bg-[#F8F9FB] text-[#6B7280]"
            }`}
          >
            List
          </button>
        </div>
        <p className="text-[13px] text-[#6B7280]">
          Role-aware view · Recruiters can advance stages with one click
        </p>
      </div>

      <AuditLogStrip entries={auditLog} />

      {view === "pipeline" ? (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {APPLICATION_STATUSES.map((status) => {
            const column = applications.filter((a) => a.status === status);
            return (
              <div
                key={status}
                className="flex w-[240px] shrink-0 flex-col rounded-[12px] bg-[#F8F9FB] p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <WorkforceStatusBadge
                    status={status}
                    label={APPLICATION_STATUS_LABELS[status]}
                  />
                  <span className="text-[13px] font-bold text-[#111827]">
                    {column.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {column.map((app) => {
                    const candidate = candidates.find((c) => c.id === app.candidateId);
                    const job = jobs.find((j) => j.id === app.jobId);
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedId(app.id)}
                        className={`w-full rounded-[10px] bg-white p-3 text-left shadow-[inset_0_0_0_1px_#EAEAEA] ${
                          selectedId === app.id ? "ring-2 ring-[#2563EB]" : ""
                        }`}
                      >
                        <p className="text-[13px] font-semibold text-[#111827]">
                          {candidate ? candidateFullName(candidate) : "Candidate"}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[12px] text-[#6B7280]">
                          {job?.title ?? "Job"}
                        </p>
                        <p className={`mt-2 text-[13px] font-bold ${TRANSPO_COLORS.info.text}`}>
                          Match {app.matchScore}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => {
            const candidate = candidates.find((c) => c.id === app.candidateId);
            const job = jobs.find((j) => j.id === app.jobId);
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => setSelectedId(app.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3 text-left ${
                  selectedId === app.id ? "ring-2 ring-[#2563EB]" : ""
                }`}
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">
                    {candidate ? candidateFullName(candidate) : "Candidate"}
                  </p>
                  <p className="text-[13px] text-[#6B7280]">{job?.title}</p>
                </div>
                <WorkforceStatusBadge
                  status={app.status}
                  label={APPLICATION_STATUS_LABELS[app.status]}
                />
              </button>
            );
          })}
        </div>
      )}

      {selected ? (
        <section className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
          {(() => {
            const candidate = candidates.find((c) => c.id === selected.candidateId);
            const job = jobs.find((j) => j.id === selected.jobId);
            const company = companies.find((c) => c.id === selected.companyId);
            const next = NEXT[selected.status];
            return (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#111827]">
                      {candidate ? candidateFullName(candidate) : "Candidate"} ·{" "}
                      {job?.title}
                    </h3>
                    <p className="mt-1 text-[13px] text-[#6B7280]">
                      {company?.name} · Source {selected.source}
                      {selected.recruiter ? ` · ${selected.recruiter}` : ""}
                    </p>
                  </div>
                  <WorkforceStatusBadge
                    status={selected.status}
                    label={APPLICATION_STATUS_LABELS[selected.status]}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {candidate ? (
                    <Link
                      href={`/workforce/candidates/${candidate.id}`}
                      className="transpo-btn-secondary"
                    >
                      View profile
                    </Link>
                  ) : null}
                  {job ? (
                    <Link href={`/workforce/jobs/${job.id}`} className="transpo-btn-secondary">
                      View job
                    </Link>
                  ) : null}
                  {next ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => advance(selected.id, next)}
                      className="transpo-btn-primary"
                      title={`Move to ${APPLICATION_STATUS_LABELS[next]}`}
                    >
                      Move to {APPLICATION_STATUS_LABELS[next]}
                    </button>
                  ) : null}
                  {selected.status !== "rejected" && selected.status !== "hired" ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => advance(selected.id, "rejected")}
                      className="rounded-full px-4 py-2 text-[14px] font-medium text-[#DC2626] shadow-[inset_0_0_0_1px_#FECACA]"
                      title="Reject application"
                    >
                      Reject
                    </button>
                  ) : null}
                </div>
                {selected.coverNote ? (
                  <p className="mt-4 text-[14px] text-[#334155]">
                    Cover note: {selected.coverNote}
                  </p>
                ) : null}
                <div className="mt-4 space-y-2">
                  <p className="text-[13px] font-medium text-[#6B7280]">Notes</p>
                  {selected.notes.length === 0 ? (
                    <p className="text-[14px] text-[#6B7280]">No notes yet.</p>
                  ) : (
                    selected.notes.map((n) => (
                      <div key={n.id} className="rounded-[10px] bg-white px-3 py-2">
                        <p className="text-[14px] text-[#334155]">{n.body}</p>
                        <p className="mt-1 text-[12px] text-[#6B7280]">
                          {n.author} · {n.visibility} ·{" "}
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </>
            );
          })()}
        </section>
      ) : null}
    </div>
  );
}
