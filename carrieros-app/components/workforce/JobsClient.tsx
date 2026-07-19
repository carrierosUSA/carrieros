"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Briefcase, Plus, X } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import WorkforceStatusBadge from "@/components/workforce/WorkforceStatusBadge";
import AlphAssistPanel from "@/components/workforce/AlphAssistPanel";
import type { HiringCompany, JobPosting } from "@/lib/types/workforce";
import {
  EQUIPMENT_TYPES,
  EQUIPMENT_TYPE_LABELS,
  PROFESSIONAL_ROLES,
  PROFESSIONAL_ROLE_LABELS,
} from "@/lib/types/workforce";
import { createJobPostingDraft } from "@/lib/workforce/ai-helpers";
import { equipmentLabel, formatPay } from "@/lib/workforce/board";
import { createJobAction } from "@/app/workforce/actions";

type Props = {
  jobs: JobPosting[];
  companies: HiringCompany[];
};

export default function JobsClient({ jobs: initialJobs, companies }: Props) {
  const [jobs, setJobs] = useState(initialJobs);
  const [role, setRole] = useState<string>("all");
  const [equipment, setEquipment] = useState<string>("all");
  const [region, setRegion] = useState("all");
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const regions = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.region))).sort(),
    [jobs],
  );

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (role !== "all" && j.role !== role) return false;
      if (equipment !== "all" && !j.equipment.includes(equipment as never)) return false;
      if (region !== "all" && j.region !== region) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !j.title.toLowerCase().includes(q) &&
          !j.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [jobs, role, equipment, region, query]);

  function onCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createJobAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setJobs((prev) => [result.job, ...prev]);
      setOpenForm(false);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs"
            className="h-10 min-w-[180px] flex-1 rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] text-[#111827] outline-none ring-1 ring-[#EAEAEA] focus:ring-[#2563EB]"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-10 rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] text-[#111827] outline-none ring-1 ring-[#EAEAEA]"
          >
            <option value="all">All roles</option>
            {PROFESSIONAL_ROLES.map((r) => (
              <option key={r} value={r}>
                {PROFESSIONAL_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="h-10 rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] text-[#111827] outline-none ring-1 ring-[#EAEAEA]"
          >
            <option value="all">All equipment</option>
            {EQUIPMENT_TYPES.map((e) => (
              <option key={e} value={e}>
                {EQUIPMENT_TYPE_LABELS[e]}
              </option>
            ))}
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="h-10 rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] text-[#111827] outline-none ring-1 ring-[#EAEAEA]"
          >
            <option value="all">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setOpenForm(true)}
          className="transpo-btn-primary inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Post job
        </button>
      </div>

      <AlphAssistPanel
        title="Alph · Create job posting"
        actions={[
          {
            id: "draft-driver",
            label: "Draft CDL driver post",
            run: () => createJobPostingDraft("cdl_driver", companies[0]?.id),
          },
          {
            id: "draft-dispatch",
            label: "Draft dispatcher post",
            run: () => createJobPostingDraft("dispatcher", companies[2]?.id),
          },
          {
            id: "draft-mechanic",
            label: "Draft mechanic post",
            run: () => createJobPostingDraft("diesel_mechanic", companies[3]?.id),
          },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs match"
          description="Adjust filters or post a new role."
          actionLabel="Post job"
          onAction={() => setOpenForm(true)}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((job) => (
            <Link
              key={job.id}
              href={`/workforce/jobs/${job.id}`}
              className="flex h-full flex-col rounded-[16px] bg-[#F8F9FB] p-4 transition hover:bg-[#EFF6FF]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[#111827]">{job.title}</p>
                  <p className="mt-1 text-[13px] text-[#6B7280]">
                    {PROFESSIONAL_ROLE_LABELS[job.role]} · {job.region}
                  </p>
                </div>
                <WorkforceStatusBadge status={job.status} />
              </div>
              <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-[#334155]">
                {job.description}
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-[13px] text-[#6B7280]">
                <span className="font-semibold text-[#111827]">{formatPay(job)}</span>
                <span>{equipmentLabel(job.equipment)}</span>
                <span>{job.homeTime}</span>
                <span>{job.applicantsCount} applicants</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {openForm ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal
            aria-labelledby="job-form-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[16px] bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.18)]"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 id="job-form-title" className="text-[18px] font-semibold text-[#111827]">
                Post a job
              </h2>
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="rounded-[8px] p-2 text-[#6B7280] hover:bg-[#F8F9FB]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form action={onCreate} className="mt-4 space-y-3">
              <label className="block space-y-1">
                <span className="text-[13px] font-medium text-[#334155]">Company</span>
                <select
                  name="companyId"
                  required
                  className="h-10 w-full rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-[13px] font-medium text-[#334155]">Title</span>
                <input
                  name="title"
                  required
                  className="h-10 w-full rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[13px] font-medium text-[#334155]">Role</span>
                <select
                  name="role"
                  className="h-10 w-full rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
                >
                  {PROFESSIONAL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {PROFESSIONAL_ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-[13px] font-medium text-[#334155]">Description</span>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="w-full rounded-[10px] bg-[#F8F9FB] px-3 py-2 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-[13px] font-medium text-[#334155]">Region</span>
                  <input
                    name="region"
                    defaultValue="Southeast"
                    className="h-10 w-full rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[13px] font-medium text-[#334155]">Home time</span>
                  <input
                    name="homeTime"
                    defaultValue="Weekly"
                    className="h-10 w-full rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
                  />
                </label>
              </div>
              {error ? (
                <p className="text-[13px] text-[#DC2626]" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenForm(false)}
                  className="transpo-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={pending} className="transpo-btn-primary">
                  {pending ? "Publishing…" : "Publish job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
