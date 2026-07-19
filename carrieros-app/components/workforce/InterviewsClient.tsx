"use client";

import { useState, useTransition } from "react";
import { Calendar } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import WorkforceStatusBadge from "@/components/workforce/WorkforceStatusBadge";
import type {
  Application,
  Interview,
  JobPosting,
  ProfessionalProfile,
} from "@/lib/types/workforce";
import {
  INTERVIEW_TYPES,
  INTERVIEW_TYPE_LABELS,
} from "@/lib/types/workforce";
import { candidateFullName } from "@/lib/workforce/board";
import { scheduleInterviewAction } from "@/app/workforce/actions";

type Props = {
  interviews: Interview[];
  applications: Application[];
  jobs: JobPosting[];
  candidates: ProfessionalProfile[];
};

export default function InterviewsClient({
  interviews: initial,
  applications,
  jobs,
  candidates,
}: Props) {
  const [interviews, setInterviews] = useState(initial);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [calendarNote, setCalendarNote] = useState<string | null>(null);

  const upcoming = [...interviews].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  function onSchedule(formData: FormData) {
    setError(null);
    const applicationId = String(formData.get("applicationId") ?? "");
    const app = applications.find((a) => a.id === applicationId);
    if (!app) {
      setError("Select an application.");
      return;
    }
    startTransition(async () => {
      const result = await scheduleInterviewAction({
        applicationId: app.id,
        jobId: app.jobId,
        candidateId: app.candidateId,
        companyId: app.companyId,
        type: String(formData.get("type") ?? "zoom") as Interview["type"],
        scheduledAt: new Date(String(formData.get("scheduledAt") ?? "")).toISOString(),
        durationMinutes: Number(formData.get("durationMinutes") ?? 45),
        interviewer: String(formData.get("interviewer") ?? ""),
        meetingUrl: String(formData.get("meetingUrl") ?? "") || undefined,
        location: String(formData.get("location") ?? "") || undefined,
        notes: String(formData.get("notes") ?? ""),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setInterviews((prev) => [result.interview, ...prev]);
      setOpen(false);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() =>
            setCalendarNote(
              "Calendar sync is available after you connect Google or Microsoft. Interviews stay stored locally until then.",
            )
          }
          className="transpo-btn-secondary"
          title="Connect an external calendar (stub)"
        >
          Connect calendar
        </button>
        <button type="button" onClick={() => setOpen(true)} className="transpo-btn-primary">
          Schedule interview
        </button>
      </div>
      {calendarNote ? (
        <p className="rounded-[12px] bg-[#EFF6FF] px-4 py-3 text-[13px] text-[#2563EB]">
          {calendarNote}
        </p>
      ) : null}

      {upcoming.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interviews yet"
          description="Schedule from an active application."
          actionLabel="Schedule interview"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="space-y-2">
          {upcoming.map((i) => {
            const candidate = candidates.find((c) => c.id === i.candidateId);
            const job = jobs.find((j) => j.id === i.jobId);
            return (
              <div key={i.id} className="rounded-[16px] bg-[#F8F9FB] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-semibold text-[#111827]">
                      {candidate ? candidateFullName(candidate) : "Candidate"} ·{" "}
                      {job?.title}
                    </p>
                    <p className="mt-1 text-[13px] text-[#6B7280]">
                      {new Date(i.scheduledAt).toLocaleString()} ·{" "}
                      {INTERVIEW_TYPE_LABELS[i.type]} · {i.durationMinutes} min
                    </p>
                    <p className="mt-1 text-[13px] text-[#334155]">{i.interviewer}</p>
                  </div>
                  <WorkforceStatusBadge status={i.status} />
                </div>
                {i.meetingUrl ? (
                  <a
                    href={i.meetingUrl}
                    className="mt-2 inline-flex text-[13px] font-medium text-[#2563EB]"
                  >
                    Join meeting
                  </a>
                ) : null}
                {i.location ? (
                  <p className="mt-2 text-[13px] text-[#6B7280]">{i.location}</p>
                ) : null}
                {i.notes ? (
                  <p className="mt-2 text-[14px] text-[#334155]">{i.notes}</p>
                ) : null}
                {i.score != null ? (
                  <p className="mt-2 text-[13px] font-medium text-[#111827]">
                    Score {i.score}/5
                  </p>
                ) : null}
                {i.aiSummary ? (
                  <p className="mt-2 text-[13px] text-[#2563EB]">Alph: {i.aiSummary}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <form
            action={onSchedule}
            className="w-full max-w-lg space-y-3 rounded-[16px] bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.18)]"
          >
            <h2 className="text-[18px] font-semibold text-[#111827]">Schedule interview</h2>
            <label className="block space-y-1">
              <span className="text-[13px] font-medium text-[#334155]">Application</span>
              <select
                name="applicationId"
                required
                className="h-10 w-full rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
              >
                {applications
                  .filter((a) => !["hired", "rejected"].includes(a.status))
                  .map((a) => {
                    const c = candidates.find((x) => x.id === a.candidateId);
                    const j = jobs.find((x) => x.id === a.jobId);
                    return (
                      <option key={a.id} value={a.id}>
                        {c ? candidateFullName(c) : a.candidateId} — {j?.title}
                      </option>
                    );
                  })}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-[13px] font-medium text-[#334155]">Type</span>
                <select
                  name="type"
                  className="h-10 w-full rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
                >
                  {INTERVIEW_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {INTERVIEW_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-[13px] font-medium text-[#334155]">Duration (min)</span>
                <input
                  name="durationMinutes"
                  type="number"
                  defaultValue={45}
                  className="h-10 w-full rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
                />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-[13px] font-medium text-[#334155]">When</span>
              <input
                name="scheduledAt"
                type="datetime-local"
                required
                className="h-10 w-full rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[13px] font-medium text-[#334155]">Interviewer</span>
              <input
                name="interviewer"
                required
                defaultValue="Recruiting"
                className="h-10 w-full rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[13px] font-medium text-[#334155]">Meeting URL</span>
              <input
                name="meetingUrl"
                placeholder="https://"
                className="h-10 w-full rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[13px] font-medium text-[#334155]">Location</span>
              <input
                name="location"
                className="h-10 w-full rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[13px] font-medium text-[#334155]">Notes</span>
              <textarea
                name="notes"
                rows={2}
                className="w-full rounded-[10px] bg-[#F8F9FB] px-3 py-2 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
              />
            </label>
            {error ? (
              <p className="text-[13px] text-[#DC2626]" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="transpo-btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={pending} className="transpo-btn-primary">
                {pending ? "Saving…" : "Schedule"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
