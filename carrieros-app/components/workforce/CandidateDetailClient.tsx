"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import AlphAssistPanel from "@/components/workforce/AlphAssistPanel";
import WorkforceStatusBadge from "@/components/workforce/WorkforceStatusBadge";
import type { ProfessionalProfile } from "@/lib/types/workforce";
import {
  EQUIPMENT_TYPE_LABELS,
  PROFESSIONAL_ROLE_LABELS,
  VERIFICATION_BADGE_LABELS,
} from "@/lib/types/workforce";
import {
  improveResume,
  prepareInterview,
  recommendSalary,
} from "@/lib/workforce/ai-helpers";
import { candidateFullName } from "@/lib/workforce/board";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-[12px] bg-[#F8F9FB]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <h3 className="text-[15px] font-semibold text-[#111827]">{title}</h3>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[#6B7280]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#6B7280]" />
        )}
      </button>
      {open ? <div className="border-t border-[#EAEAEA] px-4 py-3">{children}</div> : null}
    </section>
  );
}

export default function CandidateDetailClient({
  candidate: c,
}: {
  candidate: ProfessionalProfile;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[20px] font-bold ${TRANSPO_COLORS.info.text}`}>
              {c.matchScore}
            </span>
            <span className="text-[13px] font-medium text-[#6B7280]">AI Match Score</span>
          </div>
          <h2 className="mt-1 text-[22px] font-bold text-[#111827]">
            {candidateFullName(c)}
          </h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">{c.headline}</p>
          <p className="mt-2 text-[14px] text-[#334155]">
            {c.locationCity}, {c.locationState} · {c.email} · {c.phone}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/workforce/messages" className="transpo-btn-primary">
            Message
          </Link>
          <Link href="/workforce/interviews" className="transpo-btn-secondary">
            Schedule interview
          </Link>
          <Link href="/workforce/ai" className="transpo-btn-secondary">
            Rank in AI Recruiting
          </Link>
          <Link href="/wallet/passport" className="transpo-btn-secondary">
            Open Wallet
          </Link>
          <Link href="/wallet/enterprise" className="transpo-btn-secondary">
            Request documents
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {c.verificationBadges.map((b) => (
          <span
            key={b}
            className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`}
          >
            {VERIFICATION_BADGE_LABELS[b]}
          </span>
        ))}
        <WorkforceStatusBadge status={c.backgroundStatus} label={`Background: ${c.backgroundStatus.replace(/_/g, " ")}`} />
        <WorkforceStatusBadge status={c.drugScreenStatus} label={`Drug screen: ${c.drugScreenStatus.replace(/_/g, " ")}`} />
      </div>

      <div className="rounded-[12px] bg-[#EFF6FF] p-4">
        <p className="text-[13px] font-medium text-[#2563EB]">Alph summary</p>
        <p className="mt-1 text-[14px] leading-relaxed text-[#334155]">{c.aiSummary}</p>
      </div>

      <Section title="About" defaultOpen>
        <p className="text-[14px] leading-relaxed text-[#334155]">{c.bio}</p>
        <p className="mt-3 text-[13px] text-[#6B7280]">
          Roles: {c.roles.map((r) => PROFESSIONAL_ROLE_LABELS[r]).join(", ")} ·{" "}
          {c.yearsExperience} years · Languages: {c.languages.join(", ")}
        </p>
      </Section>

      <Section title="Experience" defaultOpen>
        <ul className="space-y-3">
          {c.workHistory.map((w) => (
            <li key={w.id}>
              <p className="text-[14px] font-semibold text-[#111827]">
                {w.title} · {w.company}
              </p>
              <p className="text-[13px] text-[#6B7280]">
                {w.startDate} – {w.current ? "Present" : w.endDate}
              </p>
              <p className="mt-1 text-[14px] text-[#334155]">{w.summary}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Licenses, CDL & medical">
        <p className="text-[14px] text-[#334155]">
          {c.cdlClass ? `CDL Class ${c.cdlClass}` : "No CDL on file"}
          {c.endorsements.length ? ` · Endorsements ${c.endorsements.join(", ")}` : ""}
        </p>
        {c.medicalCardExpiresAt ? (
          <p className="mt-2 text-[14px] text-[#334155]">
            Medical card expires {c.medicalCardExpiresAt}
          </p>
        ) : null}
        <p className="mt-2 text-[14px] text-[#334155]">
          Licenses: {c.licenses.join(", ") || "—"}
        </p>
      </Section>

      <Section title="Skills, equipment & preferences">
        <p className="text-[14px] text-[#334155]">{c.skills.join(" · ")}</p>
        <p className="mt-2 text-[14px] text-[#334155]">
          Equipment:{" "}
          {c.preferredEquipment.map((e) => EQUIPMENT_TYPE_LABELS[e]).join(", ") || "—"}
        </p>
        <p className="mt-2 text-[14px] text-[#334155]">
          States: {c.preferredStates.join(", ") || "—"} · Routes:{" "}
          {c.preferredRoutes.join(", ") || "—"}
        </p>
        <p className="mt-2 text-[14px] text-[#334155]">
          Pay:{" "}
          {c.cpmExpectation
            ? `$${c.cpmExpectation.toFixed(2)}/mi`
            : c.salaryExpectation
              ? `$${c.salaryExpectation.toLocaleString()}`
              : "Negotiable"}{" "}
          · Availability: {c.availability.replace("_", " ")}
          {c.remoteOk ? " · Remote OK" : ""}
        </p>
      </Section>

      <Section title="Education, training & certifications">
        <ul className="space-y-2 text-[14px] text-[#334155]">
          {c.education.map((e) => (
            <li key={e.id}>
              {e.degree} — {e.school}
              {e.year ? ` (${e.year})` : ""}
            </li>
          ))}
          {c.certifications.map((cert) => (
            <li key={cert}>Cert: {cert}</li>
          ))}
          {c.trainingCompleted.map((t) => (
            <li key={t}>Training: {t}</li>
          ))}
        </ul>
      </Section>

      <Section title="References & documents">
        {c.references.length ? (
          <ul className="space-y-2 text-[14px] text-[#334155]">
            {c.references.map((r) => (
              <li key={r.id}>
                {r.name} · {r.relation} · {r.phone}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-[#6B7280]">No references on file yet.</p>
        )}
        <ul className="mt-3 space-y-1 text-[14px] text-[#334155]">
          {c.documents.map((d) => (
            <li key={d.id}>
              {d.name} · {d.category} · {d.status}
            </li>
          ))}
        </ul>
      </Section>

      <AlphAssistPanel
        title="Alph · Career assist"
        actions={[
          { id: "resume", label: "Improve resume", run: () => improveResume(c.id) },
          {
            id: "interview",
            label: "Prepare for interview",
            run: () => prepareInterview(c.id),
          },
          {
            id: "salary",
            label: "Recommend salary",
            run: () => recommendSalary(c.roles[0] ?? "other"),
          },
        ]}
      />
    </div>
  );
}
