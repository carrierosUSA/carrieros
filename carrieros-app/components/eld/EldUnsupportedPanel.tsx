"use client";

import EldStatusBadge from "@/components/eld/EldStatusBadge";
import {
  ELD_DATA_TYPE_LABELS,
  ELD_SUPPORT_CATEGORY_LABELS,
  type EldCatalogProvider,
  type EldConnectionStatus,
} from "@/lib/eld/types";
import { UNSUPPORTED_ELD_STEPS } from "@/lib/eld/templates";

type EldUnsupportedPanelProps = {
  provider: EldCatalogProvider;
  status: EldConnectionStatus;
  onRequestIntegration: () => void;
  onContactProvider: () => void;
  onCopyRequest: () => void;
  onUploadDocs: () => void;
  onChooseAnother: () => void;
  feedback?: string | null;
};

export default function EldUnsupportedPanel({
  provider,
  status,
  onRequestIntegration,
  onContactProvider,
  onCopyRequest,
  onUploadDocs,
  onChooseAnother,
  feedback,
}: EldUnsupportedPanelProps) {
  const reason =
    provider.unavailableReason ??
    "This ELD is not live in Transpo.ai yet. You can still request integration and keep operating with fallbacks.";

  return (
    <div className="space-y-5 rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-[12px] bg-[#EFF6FF] text-[14px] font-bold text-[#2563EB]">
            {provider.initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                {provider.name}
              </h2>
              <EldStatusBadge status={status} />
            </div>
            <p className="mt-1 text-[13px] text-slate-500">
              {ELD_SUPPORT_CATEGORY_LABELS[provider.supportCategory]}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[12px] bg-[#FFF7ED] px-4 py-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#C2410C]">
          Why it is not connected
        </p>
        <p className="mt-1.5 text-[14px] leading-6 text-[#9A3412]">{reason}</p>
        <p className="mt-2 text-[13px] text-[#9A3412]">
          This is not a dead end. Request integration, contact the ELD, or use a
          fallback import so ops keep moving.
        </p>
      </div>

      <div>
        <p className="text-[13px] font-semibold text-slate-800">What to do</p>
        <ol className="mt-3 space-y-3">
          {UNSUPPORTED_ELD_STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#EFF6FF] text-[12px] font-bold text-[#2563EB]">
                {i + 1}
              </span>
              <div>
                <p className="text-[14px] font-semibold text-slate-900">
                  {step.title}
                </p>
                <p className="mt-0.5 text-[13px] text-slate-500">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <p className="text-[12px] font-medium text-slate-400">
          Data this ELD typically covers
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {provider.dataTypes.map((dt) => (
            <span
              key={dt}
              className="rounded-lg bg-[#F5F7FA] px-2 py-1 text-[11px] font-medium text-slate-600"
            >
              {ELD_DATA_TYPE_LABELS[dt]}
            </span>
          ))}
        </div>
      </div>

      {feedback ? (
        <p className="rounded-[12px] bg-[#ECFDF3] px-3 py-2 text-[13px] font-medium text-[#166534]">
          {feedback}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRequestIntegration}
          className="inline-flex h-10 items-center rounded-xl bg-[#2563EB] px-4 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
        >
          Request Integration
        </button>
        <button
          type="button"
          onClick={onContactProvider}
          className="inline-flex h-10 items-center rounded-xl bg-[#F5F7FA] px-4 text-[13px] font-semibold text-slate-800 hover:bg-[#E8EDF5]"
        >
          Contact ELD Provider
        </button>
        <button
          type="button"
          onClick={onCopyRequest}
          className="inline-flex h-10 items-center rounded-xl bg-[#F5F7FA] px-4 text-[13px] font-semibold text-slate-800 hover:bg-[#E8EDF5]"
        >
          Copy Integration Request
        </button>
        <button
          type="button"
          onClick={onUploadDocs}
          className="inline-flex h-10 items-center rounded-xl bg-[#F5F7FA] px-4 text-[13px] font-semibold text-slate-800 hover:bg-[#E8EDF5]"
        >
          Upload API Documents
        </button>
        <button
          type="button"
          onClick={onChooseAnother}
          className="inline-flex h-10 items-center rounded-xl px-4 text-[13px] font-semibold text-[#2563EB] hover:bg-[#EFF6FF]"
        >
          Choose Another ELD
        </button>
      </div>
    </div>
  );
}
