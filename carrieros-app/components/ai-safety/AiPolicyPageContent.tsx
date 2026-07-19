import Link from "next/link";
import AiPolicyNotice from "@/components/ai-safety/AiPolicyNotice";
import {
  AI_AUDIT_FIELDS,
  AI_CONFIRMATION_CATEGORIES,
  AI_CONFIRMATION_CATEGORY_LABELS,
  AI_MAY,
  AI_NEVER,
  AI_POLICY_ASSISTANT,
  AI_POLICY_BRAND,
  AI_POLICY_CHARTER_HREF,
  AI_POLICY_CONSTITUTION_HREF,
  AI_POLICY_GOVERNED_BY,
  AI_POLICY_PHILOSOPHY,
  AI_POLICY_SETTINGS_HREF,
  AI_POLICY_TAGLINE,
  AI_SAFETY_FIRST,
  AI_TRANSPARENCY_POINTS,
  AUTOMATION_LEVEL_DESCRIPTIONS,
  AUTOMATION_LEVEL_LABELS,
  AUTOMATION_LEVELS,
  CONFIDENCE_DESCRIPTIONS,
  CONFIDENCE_LABELS,
  CONFIDENCE_LEVELS,
} from "@/lib/ai-safety";
import {
  FOUNDATION_BUILT_ON_NOTICE,
  FOUNDATION_HREF,
} from "@/lib/foundation";
import {
  CONSTITUTION_CANONICAL_NOTICE,
  CONSTITUTION_GOVERNANCE_HREF,
} from "@/lib/constitution";


function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-[18px] font-semibold tracking-tight text-[#0F172A]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function AiPolicyPageContent() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="rounded-[20px] bg-[#EFF6FF] px-5 py-5 sm:px-6">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
          {AI_POLICY_BRAND} · {AI_POLICY_ASSISTANT}
        </p>
        <p className="mt-2 text-[22px] font-bold tracking-tight text-[#0F172A]">
          {AI_POLICY_TAGLINE}
        </p>
        <ul className="mt-3 space-y-1.5">
          {AI_POLICY_PHILOSOPHY.map((line) => (
            <li key={line} className="text-[15px] leading-relaxed text-[#1E3A8A]">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[14px] leading-relaxed text-[#1E3A8A]">
          Governed by the{" "}
          <Link
            href={CONSTITUTION_GOVERNANCE_HREF}
            className="font-semibold underline-offset-2 hover:underline"
          >
            Master Constitution
          </Link>{" "}
          and{" "}
          <Link
            href={AI_POLICY_CHARTER_HREF}
            className="font-semibold underline-offset-2 hover:underline"
          >
            {AI_POLICY_GOVERNED_BY}
          </Link>
          . The Engineering Constitution implements day-to-day principles.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-[#1E40AF]">
          {CONSTITUTION_CANONICAL_NOTICE}
        </p>
        <p className="mt-2 text-[13px] font-medium text-[#1E40AF]">
          <Link
            href={FOUNDATION_HREF}
            className="underline-offset-2 hover:underline"
          >
            {FOUNDATION_BUILT_ON_NOTICE}
          </Link>
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href={CONSTITUTION_GOVERNANCE_HREF}
            className="text-[14px] font-semibold text-[#2563EB] underline-offset-2 hover:underline"
          >
            Master Constitution
          </Link>
          <Link
            href={AI_POLICY_CHARTER_HREF}
            className="text-[14px] font-semibold text-[#2563EB] underline-offset-2 hover:underline"
          >
            Trust & Safety Charter
          </Link>
          <Link
            href={FOUNDATION_HREF}
            className="text-[14px] font-semibold text-[#2563EB] underline-offset-2 hover:underline"
          >
            Foundation
          </Link>
          <Link
            href={AI_POLICY_CONSTITUTION_HREF}
            className="text-[14px] font-semibold text-[#2563EB] underline-offset-2 hover:underline"
          >
            Engineering Constitution
          </Link>
          <Link
            href={AI_POLICY_SETTINGS_HREF}
            className="text-[14px] font-semibold text-[#2563EB] underline-offset-2 hover:underline"
          >
            Manage company AI preferences
          </Link>
        </div>
      </div>

      <Section title="AI must never">
        <ul className="space-y-2">
          {AI_NEVER.map((item) => (
            <li
              key={item}
              className="rounded-[12px] bg-[#FEF2F2] px-4 py-3 text-[15px] text-[#991B1B]"
            >
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="AI may">
        <ul className="space-y-2">
          {AI_MAY.map((item) => (
            <li
              key={item}
              className="rounded-[12px] bg-[#ECFDF3] px-4 py-3 text-[15px] text-[#166534]"
            >
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Confirmation required">
        <p className="text-[15px] leading-relaxed text-[#64748B]">
          Before Alph executes anything in these areas, a human must approve.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {AI_CONFIRMATION_CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-[#FFF7ED] px-3 py-1.5 text-[13px] font-semibold text-[#C2410C]"
            >
              {AI_CONFIRMATION_CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Confidence">
        <p className="text-[15px] leading-relaxed text-[#64748B]">
          Uncertainty is never hidden. Every suggestion shows one of these levels.
        </p>
        <ul className="mt-3 space-y-2">
          {CONFIDENCE_LEVELS.map((level) => (
            <li
              key={level}
              className="rounded-[12px] bg-[#F8F9FB] px-4 py-3"
            >
              <p className="text-[15px] font-semibold text-[#0F172A]">
                {CONFIDENCE_LABELS[level]}
              </p>
              <p className="mt-0.5 text-[14px] text-[#64748B]">
                {CONFIDENCE_DESCRIPTIONS[level]}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Automation levels">
        <ul className="space-y-2">
          {AUTOMATION_LEVELS.map((level) => (
            <li
              key={level}
              className="rounded-[12px] bg-[#F8F9FB] px-4 py-3"
            >
              <p className="text-[15px] font-semibold text-[#0F172A]">
                {AUTOMATION_LEVEL_LABELS[level]}
              </p>
              <p className="mt-0.5 text-[14px] text-[#64748B]">
                {AUTOMATION_LEVEL_DESCRIPTIONS[level]}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Transparency">
        <p className="text-[15px] leading-relaxed text-[#64748B]">
          For AI-assisted work, you can always see:
        </p>
        <ul className="mt-3 space-y-1.5">
          {AI_TRANSPARENCY_POINTS.map((point) => (
            <li key={point} className="text-[15px] text-[#334155]">
              · {point}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Audit">
        <p className="text-[15px] leading-relaxed text-[#64748B]">
          AI actions are logged with:
        </p>
        <p className="mt-2 text-[15px] text-[#334155]">
          {AI_AUDIT_FIELDS.join(" · ")}
        </p>
      </Section>

      <Section title="Safety first">
        <p className="rounded-[12px] bg-[#FFF7ED] px-4 py-3 text-[15px] leading-relaxed text-[#9A3412]">
          {AI_SAFETY_FIRST}
        </p>
      </Section>

      <Section title="Trust & Safety Charter">
        <p className="text-[15px] leading-relaxed text-[#64748B]">
          The supreme standard for trust, safety, and AI autonomy. The
          Engineering Constitution implements it with twelve principles for
          Alph, automation, approvals, and data ownership.
        </p>
        <div className="mt-3">
          <AiPolicyNotice variant="charter" />
        </div>
      </Section>
    </div>
  );
}
