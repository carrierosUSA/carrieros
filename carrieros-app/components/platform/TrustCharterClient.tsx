import Link from "next/link";
import {
  TRUST_SAFETY_CHARTER_CHECKLIST,
  TRUST_SAFETY_CHARTER_MISSION,
  TRUST_SAFETY_CHARTER_PRIORITIES,
  TRUST_SAFETY_CHARTER_SECTIONS,
  TRUST_SAFETY_CHARTER_TAGLINE,
} from "@/lib/trust-safety-charter";
import { ENGINEERING_CONSTITUTION_HREF } from "@/lib/engineering-constitution";
import { AI_POLICY_HREF } from "@/lib/ai-safety/policy";
import { FOUNDATION_HREF } from "@/lib/foundation";
import {
  CONSTITUTION_CANONICAL_NOTICE,
  CONSTITUTION_GOVERNANCE_HREF,
  PERMANENT_CONSTITUTION_TITLE,
} from "@/lib/constitution";

export default function TrustCharterClient() {
  return (
    <div className="space-y-10">
      <section className="rounded-[20px] bg-[#F8FAFC] px-5 py-6 sm:px-8 sm:py-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
          Trust & safety
        </p>
        <p className="mt-3 max-w-2xl text-[18px] font-semibold leading-snug tracking-[-0.02em] text-[#0F172A] sm:text-[20px]">
          {TRUST_SAFETY_CHARTER_TAGLINE}
        </p>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#475569]">
          {TRUST_SAFETY_CHARTER_MISSION} This Charter implements the{" "}
          <Link
            href={CONSTITUTION_GOVERNANCE_HREF}
            className="font-semibold text-[#2563EB] underline-offset-2 hover:underline"
          >
            {PERMANENT_CONSTITUTION_TITLE}
          </Link>{" "}
          for trust, safety, AI autonomy, and automation.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
          {CONSTITUTION_CANONICAL_NOTICE}
        </p>
        <p className="mt-3 max-w-2xl text-[14px] font-medium leading-relaxed text-[#334155]">
          {TRUST_SAFETY_CHARTER_PRIORITIES}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={CONSTITUTION_GOVERNANCE_HREF}
            className="inline-flex h-10 items-center rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            Master Constitution
          </Link>
          <Link
            href={FOUNDATION_HREF}
            className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:ring-[#BFDBFE]"
          >
            Transpo.ai Foundation
          </Link>
          <Link
            href={ENGINEERING_CONSTITUTION_HREF}
            className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:ring-[#BFDBFE]"
          >
            Engineering Constitution
          </Link>
          <Link
            href={AI_POLICY_HREF}
            className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:ring-[#BFDBFE]"
          >
            AI Safety Policy
          </Link>
        </div>
      </section>

      <ol className="space-y-4">
        {TRUST_SAFETY_CHARTER_SECTIONS.map((section, index) => (
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
          </li>
        ))}
      </ol>

      <section className="rounded-[20px] bg-white px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#0F172A]">
          Engineering standard
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#64748B]">
          Before shipping a feature, every answer must be yes. If not — redesign.
        </p>
        <ul className="mt-4 space-y-2.5">
          {TRUST_SAFETY_CHARTER_CHECKLIST.map((item) => (
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
      </section>

      <section className="rounded-[20px] bg-[#EFF6FF] px-5 py-5 sm:px-6">
        <h2 className="text-[16px] font-semibold text-[#1E40AF]">
          Supporting documents
        </h2>
        <p className="mt-1 text-[14px] leading-relaxed text-[#1D4ED8]/90">
          Foundation, Constitution, and AI Safety Policy put this Charter into
          day-to-day product rules. They never weaken or override it.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={FOUNDATION_HREF}
            className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#2563EB]"
          >
            Foundation
          </Link>
          <Link
            href={ENGINEERING_CONSTITUTION_HREF}
            className="rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold text-[#334155]"
          >
            Engineering Constitution
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
