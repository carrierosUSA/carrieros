"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import AlphAssistPanel from "@/components/workforce/AlphAssistPanel";
import type { JobPosting, ProfessionalProfile } from "@/lib/types/workforce";
import {
  AI_RECRUIT_CHIPS,
  createJobPostingDraft,
  improveResume,
  prepareInterview,
  rankCandidatesForRecruiting,
  recommendSalary,
} from "@/lib/workforce/ai-helpers";
import { candidateFullName } from "@/lib/workforce/board";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

export default function AiRecruitingClient({
  candidates,
  jobs,
}: {
  candidates: ProfessionalProfile[];
  jobs: JobPosting[];
}) {
  const [activeChips, setActiveChips] = useState<string[]>(["reefer"]);
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");

  const ranked = useMemo(
    () => rankCandidatesForRecruiting(activeChips, jobId || undefined),
    [activeChips, jobId],
  );

  function toggleChip(id: string) {
    setActiveChips((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[16px] bg-[#EFF6FF] p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#2563EB]" strokeWidth={1.9} />
          <div>
            <h2 className="text-[16px] font-semibold text-[#111827]">Alph recruiter</h2>
            <p className="text-[13px] text-[#6B7280]">
              Rank by experience, safety, reviews, availability, license, certs, and response
              time.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {AI_RECRUIT_CHIPS.map((chip) => {
            const on = activeChips.includes(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => toggleChip(chip.id)}
                className={`rounded-full px-3 py-2 text-[13px] font-medium transition ${
                  on
                    ? "bg-[#2563EB] text-white"
                    : "bg-white text-[#334155] shadow-[inset_0_0_0_1px_#E5E7EB]"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
        <label className="mt-4 block max-w-md space-y-1">
          <span className="text-[13px] font-medium text-[#334155]">
            Rank against job (optional)
          </span>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="h-10 w-full rounded-[10px] bg-white px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
          >
            <option value="">Any open role</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <AlphAssistPanel
        title="Alph · Assist actions"
        actions={[
          {
            id: "create-job",
            label: "Create job posting",
            run: () => createJobPostingDraft("cdl_driver"),
          },
          {
            id: "resume",
            label: "Improve resume",
            run: () => improveResume(ranked[0]?.id ?? candidates[0]?.id ?? ""),
          },
          {
            id: "prep",
            label: "Prepare for interview",
            run: () => prepareInterview(ranked[0]?.id ?? "", jobId || undefined),
          },
          {
            id: "salary",
            label: "Recommend salary",
            run: () => recommendSalary(ranked[0]?.roles[0] ?? "cdl_driver"),
          },
        ]}
      />

      <div className="space-y-2">
        {ranked.map((c, index) => (
          <div
            key={c.id}
            className="flex flex-col gap-3 rounded-[16px] bg-[#F8F9FB] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-medium text-[#6B7280]">#{index + 1}</span>
                <p className="text-[15px] font-semibold text-[#111827]">
                  {candidateFullName(c)}
                </p>
                <span className={`text-[16px] font-bold ${TRANSPO_COLORS.info.text}`}>
                  {c.compatibility}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-[#6B7280]">{c.headline}</p>
              <p className="mt-1 text-[13px] text-[#334155]">
                {c.rankReasons.join(" · ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/workforce/candidates/${c.id}`}
                className="transpo-btn-secondary"
              >
                View profile
              </Link>
              <Link
                href={jobId ? `/workforce/jobs/${jobId}` : "/workforce/jobs"}
                className="transpo-btn-secondary"
                title="Invite to apply from job detail"
              >
                Invite to apply
              </Link>
              <Link href="/workforce/messages" className="transpo-btn-secondary">
                Message
              </Link>
              <Link href="/workforce/interviews" className="transpo-btn-primary">
                Schedule interview
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
