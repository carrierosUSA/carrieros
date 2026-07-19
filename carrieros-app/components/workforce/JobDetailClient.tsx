"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Share2, Bookmark } from "lucide-react";
import AlphAssistPanel from "@/components/workforce/AlphAssistPanel";
import WorkforceStatusBadge from "@/components/workforce/WorkforceStatusBadge";
import type {
  HiringCompany,
  JobPosting,
  ProfessionalProfile,
} from "@/lib/types/workforce";
import {
  EMPLOYMENT_TYPE_LABELS,
  PROFESSIONAL_ROLE_LABELS,
} from "@/lib/types/workforce";
import {
  generateOfferLetter,
  prepareInterview,
  rankApplicantsBlurb,
  recommendSalary,
} from "@/lib/workforce/ai-helpers";
import { equipmentLabel, formatPay } from "@/lib/workforce/board";
import { applyToJobAction } from "@/app/workforce/actions";

type Props = {
  job: JobPosting;
  company: HiringCompany;
  candidates: ProfessionalProfile[];
};

export default function JobDetailClient({ job, company, candidates }: Props) {
  const [saved, setSaved] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const defaultCandidate = candidates[0];

  function onApply() {
    if (!defaultCandidate) {
      setError("No candidate profiles available to apply as in this demo.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await applyToJobAction(job.id, defaultCandidate.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAppliedId(result.application.id);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <WorkforceStatusBadge status={job.status} />
            <span className="text-[13px] text-[#6B7280]">
              Posted {new Date(job.postedAt).toLocaleDateString()}
            </span>
          </div>
          <h2 className="mt-2 text-[20px] font-bold text-[#111827]">{job.title}</h2>
          <Link
            href={`/workforce/companies/${company.id}`}
            className="mt-1 inline-flex text-[14px] font-medium text-[#2563EB]"
          >
            {company.name}
            {company.verified ? " · Verified employer" : ""}
          </Link>
          <p className="mt-2 text-[14px] text-[#6B7280]">
            {PROFESSIONAL_ROLE_LABELS[job.role]} · {job.region} ·{" "}
            {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onApply}
            disabled={pending || Boolean(appliedId)}
            title={
              appliedId
                ? "Already applied"
                : defaultCandidate
                  ? `Apply as ${defaultCandidate.firstName} ${defaultCandidate.lastName}`
                  : "No demo candidate available"
            }
            className="transpo-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {appliedId ? (
              <span className="inline-flex items-center gap-1">
                <Check className="h-4 w-4" /> Applied
              </span>
            ) : pending ? (
              "Applying…"
            ) : (
              "Apply"
            )}
          </button>
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            className="transpo-btn-secondary inline-flex items-center gap-1.5"
          >
            <Bookmark className="h-4 w-4" />
            {saved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={async () => {
              const url =
                typeof window !== "undefined"
                  ? window.location.href
                  : `/workforce/jobs/${job.id}`;
              try {
                await navigator.clipboard.writeText(url);
                setShareNote("Link copied");
              } catch {
                setShareNote(url);
              }
            }}
            className="transpo-btn-secondary inline-flex items-center gap-1.5"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-[13px] text-[#DC2626]" role="alert">
          {error}
        </p>
      ) : null}
      {shareNote ? (
        <p className="text-[13px] text-[#16A34A]" role="status">
          {shareNote}
        </p>
      ) : null}
      {appliedId ? (
        <p className="text-[13px] text-[#16A34A]">
          Application created.{" "}
          <Link href="/workforce/applications" className="font-medium text-[#2563EB]">
            View pipeline
          </Link>
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pay", value: formatPay(job) },
          { label: "Home time", value: job.homeTime },
          { label: "Equipment", value: equipmentLabel(job.equipment) },
          { label: "Hiring radius", value: `${job.hiringRadiusMiles} mi` },
        ].map((item) => (
          <div key={item.label} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
            <p className="text-[12px] font-medium text-[#6B7280]">{item.label}</p>
            <p className="mt-1 text-[15px] font-semibold text-[#111827]">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-2">
        <h3 className="text-[15px] font-semibold text-[#111827]">About the role</h3>
        <p className="text-[14px] leading-relaxed text-[#334155]">{job.description}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[12px] bg-[#F8F9FB] p-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">Requirements</h3>
          <ul className="mt-2 space-y-1.5 text-[14px] text-[#334155]">
            {job.requirements.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-[12px] bg-[#F8F9FB] p-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">Benefits</h3>
          <ul className="mt-2 space-y-1.5 text-[14px] text-[#334155]">
            {job.benefits.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
        </section>
      </div>

      <AlphAssistPanel
        title="Alph · Employer assist"
        actions={[
          {
            id: "rank",
            label: "Rank applicants",
            run: () => rankApplicantsBlurb(job.id),
          },
          {
            id: "salary",
            label: "Recommend salary",
            run: () => recommendSalary(job.role),
          },
          {
            id: "offer",
            label: "Generate offer letter",
            run: () =>
              generateOfferLetter(defaultCandidate?.id ?? candidates[0]?.id ?? "", job.id),
          },
          {
            id: "prep",
            label: "Prepare for interview",
            run: () =>
              prepareInterview(defaultCandidate?.id ?? candidates[0]?.id ?? "", job.id),
          },
        ]}
      />
    </div>
  );
}
