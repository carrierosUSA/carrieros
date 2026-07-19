import Link from "next/link";
import {
  FOUNDATION_AI_MAY,
  FOUNDATION_AI_NEVER,
  FOUNDATION_BUILT_ON_NOTICE,
  FOUNDATION_CONFIDENCE_DESCRIPTIONS,
  FOUNDATION_CONFIDENCE_LABELS,
  FOUNDATION_CONFIDENCE_LEVELS,
  FOUNDATION_ENGINEERING_CHECKLIST,
  FOUNDATION_MISSION_STATEMENT,
  FOUNDATION_OPTIMIZE_FOR,
  FOUNDATION_PRECEDENCE,
  FOUNDATION_SECTIONS,
  FOUNDATION_TAGLINE,
  FOUNDATION_TRADEOFF_ORDER,
} from "@/lib/foundation";
import { TRUST_SAFETY_CHARTER_HREF } from "@/lib/trust-safety-charter";
import { ENGINEERING_CONSTITUTION_HREF } from "@/lib/engineering-constitution";
import { AI_POLICY_HREF } from "@/lib/ai-safety/policy";
import {
  CONSTITUTION_CANONICAL_NOTICE,
  CONSTITUTION_GOVERNANCE_HREF,
} from "@/lib/constitution";

export default function FoundationClient() {
  return (
    <div className="space-y-10">
      <section className="rounded-[20px] bg-[#F8FAFC] px-5 py-6 sm:px-8 sm:py-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
          Operating mandate
        </p>
        <p className="mt-3 max-w-2xl text-[18px] font-semibold leading-snug tracking-[-0.02em] text-[#0F172A] sm:text-[20px]">
          {FOUNDATION_TAGLINE}
        </p>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#475569]">
          {FOUNDATION_MISSION_STATEMENT} The{" "}
          <Link
            href={CONSTITUTION_GOVERNANCE_HREF}
            className="font-semibold text-[#2563EB] underline-offset-2 hover:underline"
          >
            Master Constitution
          </Link>{" "}
          is highest authority. Foundation owns how we operate, choose
          architecture, and protect long-term quality.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
          {CONSTITUTION_CANONICAL_NOTICE}
        </p>
        <p className="mt-3 text-[14px] font-medium text-[#334155]">
          {FOUNDATION_BUILT_ON_NOTICE}
        </p>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[#64748B]">
          Optimize for{" "}
          {FOUNDATION_OPTIMIZE_FOR.join(" · ")}.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={CONSTITUTION_GOVERNANCE_HREF}
            className="inline-flex h-10 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Master Constitution
          </Link>
          <Link
            href={TRUST_SAFETY_CHARTER_HREF}
            className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:ring-[#BFDBFE]"
          >
            Trust & Safety Charter
          </Link>
          <Link
            href={ENGINEERING_CONSTITUTION_HREF}
            className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:ring-[#BFDBFE]"
          >
            Constitution
          </Link>
          <Link
            href={AI_POLICY_HREF}
            className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:ring-[#BFDBFE]"
          >
            AI Safety Policy
          </Link>
        </div>
      </section>

      <section className="rounded-[20px] bg-white px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#0F172A]">
          Document precedence
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#64748B]">
          When documents conflict, higher rank wins in its domain.
        </p>
        <ol className="mt-4 space-y-3">
          {FOUNDATION_PRECEDENCE.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span className="text-[13px] font-semibold tabular-nums text-[#2563EB]">
                {String(item.rank).padStart(2, "0")}
              </span>
              <div>
                {item.id === "foundation" || item.id === "product-design" ? (
                  <p className="text-[15px] font-semibold text-[#0F172A]">
                    {item.title}
                  </p>
                ) : (
                  <Link
                    href={item.href}
                    className="text-[15px] font-semibold text-[#2563EB] underline-offset-2 hover:underline"
                  >
                    {item.title}
                  </Link>
                )}
                <p className="mt-0.5 text-[14px] leading-relaxed text-[#64748B]">
                  {item.owns}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <ol className="space-y-4">
        {FOUNDATION_SECTIONS.map((section, index) => (
          <li
            key={section.id}
            id={section.id}
            className="scroll-mt-24 rounded-[20px] bg-white px-5 py-5 sm:px-6 sm:py-6"
          >
            <div className="flex items-baseline gap-3">
              <span className="text-[13px] font-semibold tabular-nums text-[#2563EB]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#0F172A] sm:text-[18px]">
                {section.title}
              </h2>
            </div>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-[#475569]">
              {section.body}
            </p>
            {section.id === "no-decision" ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[16px] bg-[#FEF2F2] px-4 py-4">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#991B1B]">
                    AI must never
                  </p>
                  <ul className="mt-3 space-y-2">
                    {FOUNDATION_AI_NEVER.map((item) => (
                      <li
                        key={item}
                        className="text-[14px] leading-relaxed text-[#7F1D1D]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[16px] bg-[#F0FDF4] px-4 py-4">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#166534]">
                    AI may
                  </p>
                  <ul className="mt-3 space-y-2">
                    {FOUNDATION_AI_MAY.map((item) => (
                      <li
                        key={item}
                        className="text-[14px] leading-relaxed text-[#14532D]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ol>

      <section className="rounded-[20px] bg-white px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#0F172A]">
          Confidence levels
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#64748B]">
          Aligned with AI Safety Policy. Low confidence never auto-acts.
        </p>
        <ul className="mt-4 space-y-3">
          {FOUNDATION_CONFIDENCE_LEVELS.map((level) => (
            <li key={level} className="rounded-[14px] bg-[#F8FAFC] px-4 py-3">
              <p className="text-[15px] font-semibold text-[#0F172A]">
                {FOUNDATION_CONFIDENCE_LABELS[level]}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-[#64748B]">
                {FOUNDATION_CONFIDENCE_DESCRIPTIONS[level]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[20px] bg-white px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#0F172A]">
          Engineering standard
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#64748B]">
          Before shipping, every answer must be yes — including scale from 1 to
          100,000 trucks. If not, redesign.
        </p>
        <ul className="mt-4 space-y-2.5">
          {FOUNDATION_ENGINEERING_CHECKLIST.map((item) => (
            <li
              key={item.id}
              className="flex gap-3 text-[15px] leading-relaxed text-[#334155]"
            >
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]"
                aria-hidden
              />
              {item.question}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <p className="text-[14px] font-semibold text-[#0F172A]">
            Tradeoff order
          </p>
          <ol className="mt-3 space-y-2">
            {FOUNDATION_TRADEOFF_ORDER.map((item, index) => (
              <li
                key={item}
                className="flex gap-3 text-[14px] leading-relaxed text-[#475569]"
              >
                <span className="font-semibold tabular-nums text-[#2563EB]">
                  {index + 1}.
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-[20px] bg-[#EFF6FF] px-5 py-5 sm:px-6">
        <h2 className="text-[16px] font-semibold text-[#1E40AF]">
          Related policies
        </h2>
        <p className="mt-1 text-[14px] leading-relaxed text-[#1D4ED8]/90">
          Charter is supreme on safety and no-decision. Foundation guides how we
          build. Constitution and AI Safety Policy implement day-to-day rules.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={TRUST_SAFETY_CHARTER_HREF}
            className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#2563EB]"
          >
            Trust & Safety Charter
          </Link>
          <Link
            href={ENGINEERING_CONSTITUTION_HREF}
            className="rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold text-[#334155]"
          >
            Constitution
          </Link>
          <Link
            href={AI_POLICY_HREF}
            className="rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold text-[#334155]"
          >
            AI Safety Policy
          </Link>
          <Link
            href="/platform/security"
            className="rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold text-[#334155]"
          >
            Security
          </Link>
          <Link
            href="/settings?section=automation"
            className="rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold text-[#334155]"
          >
            Settings · Automation
          </Link>
        </div>
      </section>
    </div>
  );
}
