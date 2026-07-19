import AiConfidenceBadge from "@/components/ai-safety/AiConfidenceBadge";
import {
  type ConfidenceLevel,
} from "@/lib/ai-safety";

type ApprovalStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "cancelled"
  | "blocked"
  | "still_required";

const APPROVAL_LABELS: Record<ApprovalStatus, string> = {
  not_required: "No approval needed",
  pending: "Waiting for your approval",
  approved: "Approved by you",
  cancelled: "Cancelled",
  blocked: "Blocked by policy",
  still_required: "Approval still required",
};

type AiTransparencyCardProps = {
  whatAiDid: string;
  suggested: string;
  why: string;
  sources?: string[];
  approvalStatus: ApprovalStatus;
  confidence?: ConfidenceLevel;
  className?: string;
};

export default function AiTransparencyCard({
  whatAiDid,
  suggested,
  why,
  sources = [],
  approvalStatus,
  confidence,
  className = "",
}: AiTransparencyCardProps) {
  return (
    <article
      className={`rounded-[16px] bg-[#F8F9FB] px-4 py-4 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
            Transparency
          </p>
          <h3 className="mt-1 text-[15px] font-semibold text-[#0F172A]">
            What Alph did
          </h3>
        </div>
        {confidence ? <AiConfidenceBadge level={confidence} /> : null}
      </div>

      <dl className="mt-3 space-y-3 text-[14px]">
        <div>
          <dt className="font-medium text-[#64748B]">What AI did</dt>
          <dd className="mt-0.5 text-[#334155]">{whatAiDid}</dd>
        </div>
        <div>
          <dt className="font-medium text-[#64748B]">Suggested</dt>
          <dd className="mt-0.5 text-[#334155]">{suggested}</dd>
        </div>
        <div>
          <dt className="font-medium text-[#64748B]">Why</dt>
          <dd className="mt-0.5 text-[#334155]">{why}</dd>
        </div>
        {sources.length > 0 ? (
          <div>
            <dt className="font-medium text-[#64748B]">Data used</dt>
            <dd className="mt-0.5 text-[#334155]">
              <ul className="space-y-0.5">
                {sources.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="font-medium text-[#64748B]">Approval</dt>
          <dd className="mt-0.5 font-semibold text-[#0F172A]">
            {APPROVAL_LABELS[approvalStatus]}
          </dd>
        </div>
      </dl>
    </article>
  );
}
