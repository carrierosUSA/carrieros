"use client";

import { useState } from "react";
import { NetworkStatusBadge } from "@/components/network/NetworkStatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import {
  listExperiences,
  updateExperienceStatus,
} from "@/lib/network/store";
import type { VerifiedExperience } from "@/lib/network/types";
import { getMember } from "@/lib/network/store";

export default function ExperienceClient({
  initial,
}: {
  initial: VerifiedExperience[];
}) {
  const [rows, setRows] = useState(initial);

  function refresh() {
    setRows([...listExperiences()]);
  }

  function confirm(id: string) {
    updateExperienceStatus(id, "confirmed");
    refresh();
  }

  function dispute(id: string) {
    updateExperienceStatus(id, "disputed");
    refresh();
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No experience records"
        description="Request employment verification from companies you’ve worked with. Confirmed records become permanent on your Career Passport."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[14px] text-[#6B7280]">
        Companies verify employment dates, position, safety, equipment, miles, and
        references. Only confirmed records count as verified experience.
      </p>
      <div className="space-y-3">
        {rows.map((e) => {
          const subject = getMember(e.subjectMemberId);
          return (
            <article key={e.id} className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-[#111827]">
                      {e.position}
                    </h3>
                    <NetworkStatusBadge status={e.status} />
                  </div>
                  <p className="mt-1 text-[14px] text-[#475569]">
                    {subject?.displayName ?? e.subjectMemberId} · {e.companyName}
                  </p>
                  <p className="mt-1 text-[13px] text-[#6B7280]">
                    {e.startDate}
                    {e.endDate ? ` – ${e.endDate}` : " – Present"} · Verifier{" "}
                    {e.verifierName}
                  </p>
                </div>
                {e.status === "requested" ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => confirm(e.id)}
                      className="transpo-btn-primary text-[13px]"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => dispute(e.id)}
                      className="rounded-full px-4 py-2 text-[13px] font-medium text-[#DC2626] hover:bg-white"
                      title="Mark as disputed if details are incorrect"
                    >
                      Dispute
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="mt-3 grid gap-2 text-[13px] text-[#475569] sm:grid-cols-2">
                {e.safetyNotes ? <p>Safety: {e.safetyNotes}</p> : null}
                {e.miles != null ? (
                  <p>Miles: {e.miles.toLocaleString()}</p>
                ) : null}
                {e.equipment?.length ? (
                  <p>Equipment: {e.equipment.join(", ")}</p>
                ) : null}
                {e.training?.length ? (
                  <p>Training: {e.training.join(", ")}</p>
                ) : null}
                {e.achievements?.length ? (
                  <p>Achievements: {e.achievements.join(", ")}</p>
                ) : null}
                {e.referenceNote ? <p>Reference: {e.referenceNote}</p> : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
