"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DirectoryCard from "@/components/network/DirectoryCard";
import EmptyState from "@/components/ui/EmptyState";
import {
  NETWORK_AI_CHIPS,
  rankNetworkQuery,
} from "@/lib/network/ai-helpers";

export default function AiNetworkingClient({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);

  const result = useMemo(() => rankNetworkQuery(submitted), [submitted]);

  return (
    <div className="space-y-5">
      <div className="rounded-[16px] bg-[#F8F9FB] p-4 sm:p-5">
        <p className="text-[14px] text-[#475569]">
          Ask Alph for people and companies in the Verified Network — reefer mechanics,
          insurance for your fleet size, bilingual safety consultants, hazmat drivers
          available now, and more.
        </p>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(query.trim());
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. highest-rated reefer mechanic within 50 miles"
            className="w-full flex-1 rounded-[12px] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none ring-1 ring-[#E5E7EB] focus:ring-2 focus:ring-[#93C5FD]"
          />
          <button type="submit" className="transpo-btn-primary shrink-0 text-[14px]">
            Ask Alph
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {NETWORK_AI_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                setQuery(chip.query);
                setSubmitted(chip.query);
              }}
              className="rounded-full bg-[#EFF6FF] px-3 py-1.5 text-[13px] font-medium text-[#2563EB] hover:bg-[#DBEAFE]"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-[15px] font-semibold text-[#111827]">{result.title}</h3>
        <p className="text-[14px] leading-relaxed text-[#334155]">{result.summary}</p>
        <p className="text-[12px] text-[#6B7280]">{result.disclaimer}</p>

        {result.matches.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Try another chip or broaden the query."
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {result.matches.map((m) => (
              <div key={m.member.id} className="space-y-2">
                <DirectoryCard member={m.member} />
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[12px] text-[#64748B]">
                  <span>{m.reason}</span>
                  <span className="font-semibold text-[#111827]">
                    Rank score {Math.round(m.score)}
                  </span>
                  <Link href={m.href} className="font-medium text-[#2563EB]">
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
