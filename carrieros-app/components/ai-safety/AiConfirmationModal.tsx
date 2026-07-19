"use client";

import AiConfidenceBadge from "@/components/ai-safety/AiConfidenceBadge";
import {
  AI_POLICY_TAGLINE,
  getAiActionLabel,
  type AiActionKind,
  type ConfidenceLevel,
} from "@/lib/ai-safety";

export type AiConfirmationModalPayload = {
  kind: AiActionKind;
  suggestion: string;
  confidence: ConfidenceLevel;
  reason?: string;
  dataUsed?: string[];
};

type AiConfirmationModalProps = {
  open: boolean;
  payload: AiConfirmationModalPayload | null;
  onApprove: () => void;
  onCancel: () => void;
};

export default function AiConfirmationModal({
  open,
  payload,
  onApprove,
  onCancel,
}: AiConfirmationModalProps) {
  if (!open || !payload) return null;

  return (
    <div
      className="fixed inset-0 z-[11000] flex items-end justify-center bg-slate-900/30 p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-confirm-title"
    >
      <div className="w-full max-w-md rounded-[20px] bg-white p-5 shadow-[0_24px_64px_rgba(15,23,42,0.16)] sm:p-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
          Alph Copilot™
        </p>
        <h2
          id="ai-confirm-title"
          className="mt-2 text-[20px] font-semibold tracking-tight text-[#0F172A]"
        >
          Confirm before Alph continues
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#64748B]">
          {AI_POLICY_TAGLINE} This action needs your approval.
        </p>

        <div className="mt-4 space-y-3 rounded-[16px] bg-[#F5F7FA] px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-medium text-[#64748B]">Action</p>
            <AiConfidenceBadge level={payload.confidence} />
          </div>
          <p className="text-[16px] font-semibold text-[#0F172A]">
            {getAiActionLabel(payload.kind)}
          </p>
          <p className="text-[14px] leading-relaxed text-[#334155]">
            {payload.suggestion}
          </p>
          {payload.reason ? (
            <div>
              <p className="text-[13px] font-medium text-[#64748B]">Why</p>
              <p className="mt-0.5 text-[14px] text-[#334155]">{payload.reason}</p>
            </div>
          ) : null}
          {payload.dataUsed && payload.dataUsed.length > 0 ? (
            <div>
              <p className="text-[13px] font-medium text-[#64748B]">Data used</p>
              <ul className="mt-1 space-y-0.5">
                {payload.dataUsed.map((item) => (
                  <li key={item} className="text-[14px] text-[#334155]">
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center rounded-[12px] bg-[#F1F5F9] px-4 text-[14px] font-semibold text-[#334155] transition hover:bg-[#E2E8F0]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex h-11 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
