"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ELD_FALLBACK_OPTIONS,
  recordEldFallbackImport,
  type EldFallbackImport,
  type EldProviderId,
} from "@/lib/eld";

type EldFallbackOptionsProps = {
  providerId?: EldProviderId;
  providerName?: string;
  recentImports?: EldFallbackImport[];
};

export default function EldFallbackOptions({
  providerId,
  providerName,
  recentImports = [],
}: EldFallbackOptionsProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <section className="space-y-4 rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA] sm:p-6">
      <div>
        <h2 className="text-[15px] font-semibold text-slate-900">
          Fallback options
        </h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Live API unavailable
          {providerName ? ` for ${providerName}` : ""}? Keep mileage and fuel
          flowing with imports — never a dead end.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ELD_FALLBACK_OPTIONS.map((option) => (
          <label
            key={option.kind}
            className="flex cursor-pointer flex-col rounded-[12px] bg-[#F5F7FA] p-4 transition hover:bg-[#EFF6FF]"
          >
            <span className="text-[14px] font-semibold text-slate-900">
              {option.title}
            </span>
            <span className="mt-1 text-[13px] leading-5 text-slate-500">
              {option.description}
            </span>
            <span className="mt-2 text-[12px] text-slate-400">{option.tip}</span>
            <input
              type="file"
              accept={option.accept}
              className="mt-3 text-[12px] text-slate-600"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                recordEldFallbackImport({
                  kind: option.kind,
                  fileName: file.name,
                  providerId,
                  linkedToIfta: option.iftaRelevant,
                  note: `Stub import via ${option.title}`,
                });
                setFeedback(
                  `${file.name} recorded${
                    option.iftaRelevant ? " · flagged for IFTA" : ""
                  }.`,
                );
                e.target.value = "";
              }}
            />
            {option.iftaRelevant ? (
              <Link
                href="/ifta"
                className="mt-2 text-[12px] font-semibold text-[#2563EB] hover:underline"
              >
                Open IFTA
              </Link>
            ) : null}
          </label>
        ))}
      </div>

      {feedback ? (
        <p className="rounded-[12px] bg-[#ECFDF3] px-3 py-2 text-[13px] font-medium text-[#166534]">
          {feedback}
        </p>
      ) : null}

      {recentImports.length > 0 ? (
        <div>
          <p className="text-[12px] font-medium text-slate-400">
            Recent imports
          </p>
          <ul className="mt-2 space-y-1.5">
            {recentImports.slice(0, 5).map((imp) => (
              <li
                key={imp.id}
                className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate-600"
              >
                <span>
                  {imp.fileName}
                  {imp.linkedToIfta ? (
                    <span className="ml-2 text-[11px] font-semibold text-[#16A34A]">
                      IFTA
                    </span>
                  ) : null}
                </span>
                <span className="text-[12px] text-slate-400">
                  {new Date(imp.importedAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
