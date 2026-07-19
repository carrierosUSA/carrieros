import Link from "next/link";
import WorkforceStatusBadge from "@/components/workforce/WorkforceStatusBadge";
import type { CertificationRecord, ProfessionalProfile } from "@/lib/types/workforce";
import { candidateFullName } from "@/lib/workforce/board";

export default function CertificationsClient({
  certifications,
  candidates,
}: {
  certifications: CertificationRecord[];
  candidates: ProfessionalProfile[];
}) {
  return (
    <div className="space-y-2">
      {certifications.map((cert) => {
        const candidate = candidates.find((c) => c.id === cert.candidateId);
        return (
          <div
            key={cert.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F8F9FB] px-4 py-3"
          >
            <div>
              <p className="text-[14px] font-semibold text-[#111827]">{cert.name}</p>
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
                · {cert.issuer} · Issued {cert.issuedAt}
                {cert.expiresAt ? ` · Expires ${cert.expiresAt}` : ""}
              </p>
            </div>
            <WorkforceStatusBadge status={cert.status} />
          </div>
        );
      })}
    </div>
  );
}
