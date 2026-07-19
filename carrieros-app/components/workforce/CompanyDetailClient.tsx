import Link from "next/link";
import WorkforceStatusBadge from "@/components/workforce/WorkforceStatusBadge";
import type { HiringCompany, JobPosting } from "@/lib/types/workforce";
import { EMPLOYER_COMPANY_TYPE_LABELS } from "@/lib/types/workforce";
import { formatPay } from "@/lib/workforce/board";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

export default function CompanyDetailClient({
  company,
  jobs,
}: {
  company: HiringCompany;
  jobs: JobPosting[];
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-[14px] bg-[#EFF6FF] text-[16px] font-bold text-[#2563EB]">
          {company.logoInitials}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[22px] font-bold text-[#111827]">{company.name}</h2>
            {company.verified ? (
              <span className={`text-[12px] font-medium ${TRANSPO_COLORS.success.text}`}>
                Verified employer
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            {EMPLOYER_COMPANY_TYPE_LABELS[company.type]} · {company.hqCity},{" "}
            {company.hqState} · {company.yearsInBusiness} years
          </p>
          <p className="mt-2 text-[14px] text-[#334155]">{company.tagline}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open roles", value: String(company.openPositions) },
          { label: "Safety score", value: String(company.safetyScore) },
          {
            label: "Fleet size",
            value: company.fleetSize != null ? String(company.fleetSize) : "—",
          },
          {
            label: "DOT / MC",
            value: [company.dotNumber, company.mcNumber].filter(Boolean).join(" · ") || "—",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
            <p className="text-[12px] font-medium text-[#6B7280]">{item.label}</p>
            <p className="mt-1 text-[15px] font-semibold text-[#111827]">{item.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h3 className="text-[15px] font-semibold text-[#111827]">About</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-[#334155]">
          {company.description}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[12px] bg-[#F8F9FB] p-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">Benefits</h3>
          <ul className="mt-2 space-y-1.5 text-[14px] text-[#334155]">
            {company.benefits.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-[12px] bg-[#F8F9FB] p-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">Culture</h3>
          <ul className="mt-2 space-y-1.5 text-[14px] text-[#334155]">
            {company.culture.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="space-y-3">
        <h3 className="text-[15px] font-semibold text-[#111827]">Open positions</h3>
        {jobs.length === 0 ? (
          <p className="text-[14px] text-[#6B7280]">No open roles right now.</p>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/workforce/jobs/${job.id}`}
                className="flex items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3 hover:bg-[#EFF6FF]"
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">{job.title}</p>
                  <p className="text-[13px] text-[#6B7280]">
                    {job.region} · {formatPay(job)}
                  </p>
                </div>
                <WorkforceStatusBadge status={job.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-[15px] font-semibold text-[#111827]">
          Reviews · {company.rating.toFixed(1)} ★
        </h3>
        {company.reviews.length === 0 ? (
          <p className="text-[14px] text-[#6B7280]">No public reviews yet.</p>
        ) : (
          <div className="space-y-2">
            {company.reviews.map((r) => (
              <div key={r.id} className="rounded-[12px] bg-[#F8F9FB] px-4 py-3">
                <p className="text-[14px] font-semibold text-[#111827]">
                  {r.title} · {r.rating}★
                </p>
                <p className="mt-1 text-[14px] text-[#334155]">{r.body}</p>
                <p className="mt-1 text-[12px] text-[#6B7280]">
                  {r.author} · {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
