"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import {
  runCareerCoach,
  runDocumentAssistant,
  type CareerCoachAdvice,
  type CareerCoachChipId,
  type DocAssistActionId,
  type DocAssistResult,
} from "@/lib/wallet/ai-helpers";
import { addUploadedDocument } from "@/lib/wallet/store";

const DOC_CHIPS: { id: DocAssistActionId; label: string }[] = [
  { id: "upload_cdl", label: "Upload CDL" },
  { id: "replace_medical", label: "Replace medical" },
  { id: "scan_certificate", label: "Scan certificate" },
  { id: "verify_quality", label: "Verify quality" },
  { id: "ocr_extract", label: "OCR extract" },
  { id: "translate", label: "Translate summary" },
  { id: "summarize", label: "Summarize" },
  { id: "expiration_notify", label: "Expiration notify" },
];

const COACH_CHIPS: { id: CareerCoachChipId; label: string }[] = [
  { id: "recommend_jobs", label: "Recommend jobs" },
  { id: "recommend_certs", label: "Recommend certs" },
  { id: "salary", label: "Salary guidance" },
  { id: "training", label: "Training path" },
  { id: "missing_quals", label: "Missing quals" },
  { id: "interview_prep", label: "Interview prep" },
  { id: "resume_improve", label: "Resume improve" },
  { id: "profile_build", label: "Profile build" },
  { id: "opportunities", label: "Opportunities" },
];

export default function AiAssistantClient() {
  const [pending, startTransition] = useTransition();
  const [fileName, setFileName] = useState("cdl-class-a-scan.pdf");
  const [docResult, setDocResult] = useState<DocAssistResult | null>(null);
  const [coachResult, setCoachResult] = useState<CareerCoachAdvice | null>(null);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">
          AI Document Assistant
        </h2>
        <p className="text-[14px] text-[#6B7280]">
          Demo helpers for classify, extract, and renew — stored access-controlled and
          audit logged. Not claiming end-to-end encryption beyond platform storage.
        </p>
        <label className="block max-w-md">
          <span className="text-[13px] font-medium text-[#6B7280]">Filename for scan / OCR</span>
          <input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="mt-1 h-10 w-full rounded-[12px] bg-[#F8F9FB] px-3 text-[14px] outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#93C5FD]"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {DOC_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              disabled={pending}
              className="rounded-full bg-[#EFF6FF] px-3 py-1.5 text-[13px] font-medium text-[#2563EB] transition hover:bg-[#DBEAFE]"
              onClick={() => {
                startTransition(() => {
                  setDocResult(runDocumentAssistant(chip.id, { fileName }));
                });
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
        {docResult ? (
          <div className="rounded-[12px] bg-[#F8F9FB] p-4">
            <p className="text-[15px] font-semibold text-[#111827]">{docResult.title}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#334155]">
              {docResult.body}
            </p>
            {docResult.extracted ? (
              <dl className="mt-3 space-y-1">
                {Object.entries(docResult.extracted).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 text-[13px]">
                    <dt className="text-[#6B7280]">{k}</dt>
                    <dd className="text-right font-medium text-[#111827]">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {docResult.suggestedHref ? (
                <Link href={docResult.suggestedHref} className="transpo-btn-primary">
                  Continue
                </Link>
              ) : null}
              <button
                type="button"
                disabled={pending}
                className="transpo-btn-secondary"
                onClick={() => {
                  startTransition(() => {
                    const doc = addUploadedDocument({
                      title: fileName.replace(/\.[^.]+$/, ""),
                      category: "upload",
                      fileName,
                      summary: "Uploaded via Alph document assistant (pending review).",
                    });
                    setUploadMsg(`Saved “${doc.title}” to Documents.`);
                  });
                }}
              >
                Save upload to wallet
              </button>
            </div>
            {uploadMsg ? (
              <p className={`mt-2 text-[13px] ${TRANSPO_COLORS.success.text}`}>{uploadMsg}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#111827]">AI Career Coach</h2>
        <p className="text-[14px] text-[#6B7280]">
          Advice generated from your Career Passport — chips wire into workforce jobs when
          relevant.
        </p>
        <div className="flex flex-wrap gap-2">
          {COACH_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              disabled={pending}
              className="rounded-full bg-[#ECFDF3] px-3 py-1.5 text-[13px] font-medium text-[#16A34A] transition hover:bg-[#DCFCE7]"
              onClick={() => {
                startTransition(() => {
                  setCoachResult(runCareerCoach(chip.id));
                });
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
        {coachResult ? (
          <div className="rounded-[12px] bg-[#F8F9FB] p-4">
            <p className="text-[15px] font-semibold text-[#111827]">{coachResult.title}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[#334155]">
              {coachResult.body}
            </p>
            <ul className="mt-3 space-y-2">
              {coachResult.bullets.map((b) => (
                <li key={b} className="text-[14px] text-[#334155]">
                  {b}
                </li>
              ))}
            </ul>
            {coachResult.href ? (
              <Link href={coachResult.href} className="transpo-btn-primary mt-4 inline-flex">
                Open related view
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
