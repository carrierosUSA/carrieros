"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import AlphAssistPanel from "@/components/workforce/AlphAssistPanel";
import type { ProfessionalProfile } from "@/lib/types/workforce";
import {
  PROFESSIONAL_ROLE_LABELS,
  VERIFICATION_BADGE_LABELS,
} from "@/lib/types/workforce";
import { improveResume, recommendSalary } from "@/lib/workforce/ai-helpers";
import { candidateFullName } from "@/lib/workforce/board";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";

export default function CandidatesClient({
  candidates,
}: {
  candidates: ProfessionalProfile[];
}) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");

  const filtered = useMemo(() => {
    return candidates
      .filter((c) => {
        if (role !== "all" && !c.roles.includes(role as never)) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        const hay = `${c.firstName} ${c.lastName} ${c.headline} ${c.skills.join(" ")}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [candidates, query, role]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search candidates"
          className="h-10 min-w-[200px] flex-1 rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA] focus:ring-[#2563EB]"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-10 rounded-[10px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-[#EAEAEA]"
        >
          <option value="all">All roles</option>
          {Object.entries(PROFESSIONAL_ROLE_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <AlphAssistPanel
        title="Alph · Career assist"
        actions={[
          {
            id: "resume",
            label: "Improve resume",
            run: () => improveResume(filtered[0]?.id ?? candidates[0]?.id ?? ""),
          },
          {
            id: "salary",
            label: "Recommend salary",
            run: () =>
              recommendSalary(filtered[0]?.roles[0] ?? candidates[0]?.roles[0] ?? "cdl_driver"),
          },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="Try a different role or search term."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/workforce/candidates/${c.id}`}
              className="flex h-full flex-col rounded-[16px] bg-[#F8F9FB] p-4 transition hover:bg-[#EFF6FF]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[#111827]">
                    {candidateFullName(c)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[13px] text-[#6B7280]">{c.headline}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-[18px] font-bold ${TRANSPO_COLORS.info.text}`}>
                    {c.matchScore}
                  </p>
                  <p className="text-[11px] font-medium text-[#6B7280]">AI Match</p>
                </div>
              </div>
              <p className="mt-3 text-[13px] text-[#334155]">
                {c.locationCity}, {c.locationState} · {c.yearsExperience} yrs ·{" "}
                {c.availability.replace("_", " ")}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.verificationBadges.slice(0, 4).map((b) => (
                  <span
                    key={b}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TRANSPO_COLORS.success.bg} ${TRANSPO_COLORS.success.text}`}
                    title={VERIFICATION_BADGE_LABELS[b]}
                  >
                    {VERIFICATION_BADGE_LABELS[b]}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
