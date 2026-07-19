"use client";

import Link from "next/link";
import { answerEldAlphQuestion, type EldAlphQuestionKind } from "@/lib/eld";

const QUICK_ASKS: { kind: EldAlphQuestionKind; label: string; sample: string }[] =
  [
    {
      kind: "is_eld_supported",
      label: "Is my ELD supported?",
      sample: "Is Samsara supported?",
    },
    {
      kind: "why_not_connected",
      label: "Why is my ELD not connected?",
      sample: "Why is Omnitracs not connected?",
    },
    {
      kind: "what_to_ask_provider",
      label: "What should I ask my ELD provider?",
      sample: "What should I ask Verizon Connect?",
    },
    {
      kind: "request_reviewed",
      label: "Has my connection request been reviewed?",
      sample: "Has my ELD connection request been reviewed?",
    },
    {
      kind: "which_support_data",
      label: "Which ELDs support live GPS / IFTA?",
      sample: "Which ELDs support IFTA mileage?",
    },
    {
      kind: "when_available",
      label: "When will my ELD be available?",
      sample: "When will ABC ELD be available?",
    },
  ];

type EldAlphAnswersProps = {
  activeSample?: string;
};

export default function EldAlphAnswers({ activeSample }: EldAlphAnswersProps) {
  return (
    <section className="rounded-[16px] bg-white p-5 ring-1 ring-[#EAEAEA] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Alph
          </p>
          <h2 className="mt-1 text-[15px] font-semibold text-slate-900">
            Ask about ELD connections
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Same answers Alph uses in the command center.
          </p>
        </div>
        <Link
          href="/alph"
          className="text-[13px] font-semibold text-[#2563EB] hover:underline"
        >
          Open Alph
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {QUICK_ASKS.map((item) => {
          const answer = answerEldAlphQuestion(
            item.kind,
            activeSample ?? item.sample,
          );
          return (
            <div
              key={item.kind}
              className="rounded-[12px] bg-[#F5F7FA] px-3.5 py-3"
            >
              <p className="text-[13px] font-semibold text-slate-800">
                {item.label}
              </p>
              <p className="mt-1 text-[12px] text-slate-500">{answer.title}</p>
              <p className="mt-1 line-clamp-3 text-[12px] leading-5 text-slate-600">
                {answer.body}
              </p>
              {answer.href ? (
                <Link
                  href={answer.href}
                  className="mt-2 inline-block text-[12px] font-semibold text-[#2563EB] hover:underline"
                >
                  Open
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
