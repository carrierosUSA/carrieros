"use client";

import Link from "next/link";
import {
  buildImprovedSuggestions,
  listLearningInsights,
  type CopilotRole,
} from "@/lib/alph-copilot";

type LearningPanelProps = {
  role: CopilotRole;
};

export default function LearningPanel({ role }: LearningPanelProps) {
  const insights = listLearningInsights(role);
  const improved = buildImprovedSuggestions(role);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[16px] font-semibold text-[#111827]">
          Learning system
        </h2>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          What Alph has learned — and how suggestions got better.
        </p>
      </div>

      <div className="rounded-[14px] bg-[#ECFDF3] px-4 py-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#16A34A]">
          Improved for you
        </p>
        <ul className="mt-2 space-y-1.5">
          {improved.map((line) => (
            <li key={line} className="text-[13px] font-medium text-[#14532D]">
              · {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className="rounded-[14px] bg-[#F8FAFC] px-4 py-3"
          >
            <p className="text-[14px] font-semibold text-[#111827]">
              {insight.title}
            </p>
            <p className="mt-1 text-[13px] text-[#6B7280]">{insight.detail}</p>
            <p className="mt-2 text-[12px] text-[#94A3B8]">
              Based on {insight.basedOn} · Improved {insight.improved}
            </p>
            {insight.automationHref ? (
              <Link
                href={insight.automationHref}
                className="mt-2 inline-flex text-[12px] font-semibold text-[#2563EB]"
              >
                {insight.automationLabel ?? "Open automation"} →
              </Link>
            ) : null}
          </article>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/platform/automation"
          className="rounded-full bg-[#F5F7FA] px-3 py-1.5 text-[12px] font-semibold text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
        >
          Automation center
        </Link>
        <Link
          href="/workflows"
          className="rounded-full bg-[#F5F7FA] px-3 py-1.5 text-[12px] font-semibold text-[#475569] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
        >
          Workflows
        </Link>
      </div>
    </section>
  );
}
