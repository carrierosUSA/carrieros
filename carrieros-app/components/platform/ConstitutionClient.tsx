import Link from "next/link";
import {
  ENGINEERING_CONSTITUTION_MISSION,
  ENGINEERING_CONSTITUTION_PRINCIPLES,
  ENGINEERING_CONSTITUTION_TAGLINE,
} from "@/lib/engineering-constitution";
import { AI_POLICY_HREF } from "@/lib/ai-safety/policy";
import {
  TRUST_SAFETY_CHARTER_GOVERNED_BY,
  TRUST_SAFETY_CHARTER_HREF,
} from "@/lib/trust-safety-charter";
import { FOUNDATION_HREF } from "@/lib/foundation";
import {
  CONSTITUTION_CANONICAL_NOTICE,
  CONSTITUTION_GOVERNANCE_HREF,
} from "@/lib/constitution";

export default function ConstitutionClient() {
  return (
    <div className="space-y-10">
      <section className="rounded-[20px] bg-[#F8FAFC] px-5 py-6 sm:px-8 sm:py-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
          How we build
        </p>
        <p className="mt-3 max-w-2xl text-[18px] font-semibold leading-snug tracking-[-0.02em] text-[#0F172A] sm:text-[20px]">
          {ENGINEERING_CONSTITUTION_TAGLINE}
        </p>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#475569]">
          {ENGINEERING_CONSTITUTION_MISSION} These twelve principles implement the{" "}
          <Link
            href={CONSTITUTION_GOVERNANCE_HREF}
            className="font-semibold text-[#2563EB] underline-offset-2 hover:underline"
          >
            Master Constitution
          </Link>{" "}
          and{" "}
          <Link
            href={TRUST_SAFETY_CHARTER_HREF}
            className="font-semibold text-[#2563EB] underline-offset-2 hover:underline"
          >
            Trust & Safety Charter
          </Link>
          .
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
          {CONSTITUTION_CANONICAL_NOTICE}
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-[#64748B]">
          <Link
            href={TRUST_SAFETY_CHARTER_HREF}
            className="font-semibold text-[#2563EB] underline-offset-2 hover:underline"
          >
            {TRUST_SAFETY_CHARTER_GOVERNED_BY}
          </Link>
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
            href={FOUNDATION_HREF}
            className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:ring-[#BFDBFE]"
          >
            Foundation
          </Link>
          <Link
            href={AI_POLICY_HREF}
            className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:ring-[#BFDBFE]"
          >
            AI Safety Policy
          </Link>
          <Link
            href="/platform/security"
            className="inline-flex h-10 items-center rounded-[12px] bg-white px-4 text-[14px] font-semibold text-[#334155] ring-1 ring-[#E2E8F0] transition hover:ring-[#BFDBFE]"
          >
            Enterprise Security
          </Link>
        </div>
      </section>

      <ol className="space-y-4">
        {ENGINEERING_CONSTITUTION_PRINCIPLES.map((principle) => (
          <li
            key={principle.id}
            id={principle.id}
            className="scroll-mt-24 rounded-[20px] bg-white px-5 py-5 sm:px-6 sm:py-6"
          >
            <div className="flex items-baseline gap-3">
              <span className="text-[13px] font-semibold tabular-nums text-[#2563EB]">
                {String(principle.number).padStart(2, "0")}
              </span>
              <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#0F172A] sm:text-[18px]">
                {principle.title}
              </h2>
            </div>
            <p className="mt-2 text-[15px] font-medium leading-relaxed text-[#334155]">
              {principle.summary}
            </p>
            <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[#64748B]">
              {principle.body}
            </p>
          </li>
        ))}
      </ol>

      <section className="rounded-[20px] bg-[#EFF6FF] px-5 py-5 sm:px-6">
        <h2 className="text-[16px] font-semibold text-[#1E40AF]">
          Related policies
        </h2>
        <p className="mt-1 text-[14px] leading-relaxed text-[#1D4ED8]/90">
          The Trust & Safety Charter is supreme. Day-to-day Alph rules,
          confirmation categories, and company automation preferences live in AI
          Safety Policy. Security controls live under Platform Security and
          Settings.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={TRUST_SAFETY_CHARTER_HREF}
            className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#2563EB]"
          >
            Trust & Safety Charter
          </Link>
          <Link
            href={FOUNDATION_HREF}
            className="rounded-full bg-white/80 px-3.5 py-1.5 text-[13px] font-semibold text-[#334155]"
          >
            Foundation
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
