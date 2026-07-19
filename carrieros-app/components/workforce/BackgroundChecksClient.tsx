import Link from "next/link";
import AuditLogStrip from "@/components/workforce/AuditLogStrip";
import WorkforceStatusBadge from "@/components/workforce/WorkforceStatusBadge";
import type {
  AuditLogEntry,
  BackgroundCheck,
  ProfessionalProfile,
} from "@/lib/types/workforce";
import { candidateFullName } from "@/lib/workforce/board";

export default function BackgroundChecksClient({
  checks,
  candidates,
  auditLog,
}: {
  checks: BackgroundCheck[];
  candidates: ProfessionalProfile[];
  auditLog: AuditLogEntry[];
}) {
  return (
    <div className="space-y-5">
      <p className="text-[14px] text-[#6B7280]">
        Background results are visible to authorized hiring roles only. Sensitive actions are
        logged below.
      </p>
      <AuditLogStrip
        entries={auditLog.filter((e) => e.entityType === "background_check")}
      />
      <div className="space-y-2">
        {checks.map((check) => {
          const candidate = candidates.find((c) => c.id === check.candidateId);
          return (
            <div
              key={check.id}
              className="rounded-[12px] bg-[#F8F9FB] px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">{check.type}</p>
                  <p className="text-[13px] text-[#6B7280]">
                    {candidate ? (
                      <Link
                        href={`/workforce/candidates/${candidate.id}`}
                        className="text-[#2563EB]"
                      >
                        {candidateFullName(candidate)}
                      </Link>
                    ) : (
                      "Candidate"
                    )}{" "}
                    · {check.vendor} · Ordered{" "}
                    {new Date(check.orderedAt).toLocaleDateString()}
                  </p>
                </div>
                <WorkforceStatusBadge status={check.status} />
              </div>
              {check.notes ? (
                <p className="mt-2 text-[13px] text-[#334155]">{check.notes}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
