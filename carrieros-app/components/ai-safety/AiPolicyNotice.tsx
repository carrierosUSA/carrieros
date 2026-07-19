import Link from "next/link";
import {
  AI_POLICY_HREF,
  AI_POLICY_TAGLINE,
} from "@/lib/ai-safety";
import {
  ENGINEERING_CONSTITUTION_HREF,
} from "@/lib/engineering-constitution";
import {
  FOUNDATION_BUILT_ON_NOTICE,
  FOUNDATION_HREF,
} from "@/lib/foundation";
import {
  TRUST_SAFETY_CHARTER_GOVERNED_BY,
  TRUST_SAFETY_CHARTER_HREF,
} from "@/lib/trust-safety-charter";

type AiPolicyNoticeProps = {
  className?: string;
  /**
   * footer — quiet single line
   * panel — blue callout block
   * assist — Alph tagline + Charter + Constitution + AI Safety Policy
   * compact — denser inline note for cards
   * constitution — legacy alias; same as charter
   * charter — “Governed by Trust & Safety Charter” variant
   */
  variant?:
    | "footer"
    | "panel"
    | "assist"
    | "compact"
    | "constitution"
    | "charter";
};

export default function AiPolicyNotice({
  className = "",
  variant = "footer",
}: AiPolicyNoticeProps) {
  if (variant === "charter" || variant === "constitution") {
    return (
      <p
        className={`text-[13px] leading-relaxed text-[#64748B] ${className}`.trim()}
      >
        <Link
          href={TRUST_SAFETY_CHARTER_HREF}
          className="font-semibold text-[#2563EB] underline-offset-2 hover:underline"
        >
          {TRUST_SAFETY_CHARTER_GOVERNED_BY}
        </Link>
        <span className="text-[#94A3B8]"> · </span>
        <Link
          href={ENGINEERING_CONSTITUTION_HREF}
          className="font-medium text-[#475569] underline-offset-2 hover:underline"
        >
          Constitution
        </Link>
        <span className="text-[#94A3B8]"> · </span>
        <Link
          href={AI_POLICY_HREF}
          className="font-medium text-[#475569] underline-offset-2 hover:underline"
        >
          AI Safety Policy
        </Link>
        <span className="text-[#94A3B8]"> · </span>
        <Link
          href={FOUNDATION_HREF}
          className="font-medium text-[#475569] underline-offset-2 hover:underline"
        >
          Foundation
        </Link>
      </p>
    );
  }

  if (variant === "panel") {
    return (
      <p
        className={`rounded-[12px] bg-[#EFF6FF] px-4 py-3 text-[14px] leading-relaxed text-[#1E40AF] ${className}`.trim()}
      >
        {AI_POLICY_TAGLINE}{" "}
        <Link
          href={TRUST_SAFETY_CHARTER_HREF}
          className="font-semibold underline-offset-2 hover:underline"
        >
          Trust & Safety Charter
        </Link>
        <span className="text-[#93C5FD]"> · </span>
        <Link
          href={ENGINEERING_CONSTITUTION_HREF}
          className="font-semibold underline-offset-2 hover:underline"
        >
          Constitution
        </Link>
        <span className="text-[#93C5FD]"> · </span>
        <Link
          href={AI_POLICY_HREF}
          className="font-semibold underline-offset-2 hover:underline"
        >
          AI Safety Policy
        </Link>
        <span className="text-[#93C5FD]"> · </span>
        <Link
          href={FOUNDATION_HREF}
          className="font-semibold underline-offset-2 hover:underline"
        >
          Foundation
        </Link>
      </p>
    );
  }

  if (variant === "assist") {
    return (
      <p
        className={`text-[13px] leading-relaxed text-[#64748B] ${className}`.trim()}
      >
        <span className="font-semibold text-[#334155]">{AI_POLICY_TAGLINE}</span>{" "}
        <Link
          href={TRUST_SAFETY_CHARTER_HREF}
          className="font-semibold text-[#2563EB] underline-offset-2 hover:underline"
        >
          Trust & Safety Charter
        </Link>
        <span className="text-[#94A3B8]"> · </span>
        <Link
          href={ENGINEERING_CONSTITUTION_HREF}
          className="font-semibold text-[#2563EB] underline-offset-2 hover:underline"
        >
          Constitution
        </Link>
        <span className="text-[#94A3B8]"> · </span>
        <Link
          href={AI_POLICY_HREF}
          className="font-semibold text-[#2563EB] underline-offset-2 hover:underline"
        >
          AI Safety Policy
        </Link>
        <span className="text-[#94A3B8]"> · </span>
        <Link
          href={FOUNDATION_HREF}
          className="font-semibold text-[#2563EB] underline-offset-2 hover:underline"
        >
          Foundation
        </Link>
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <p
        className={`text-[12px] leading-snug text-[#94A3B8] ${className}`.trim()}
      >
        {AI_POLICY_TAGLINE}{" "}
        <Link
          href={TRUST_SAFETY_CHARTER_HREF}
          className="font-medium text-[#2563EB] underline-offset-2 hover:underline"
        >
          Charter
        </Link>
        <span className="text-[#CBD5E1]"> · </span>
        <Link
          href={ENGINEERING_CONSTITUTION_HREF}
          className="font-medium text-[#2563EB] underline-offset-2 hover:underline"
        >
          Constitution
        </Link>
        <span className="text-[#CBD5E1]"> · </span>
        <Link
          href={AI_POLICY_HREF}
          className="font-medium text-[#2563EB] underline-offset-2 hover:underline"
        >
          Policy
        </Link>
        <span className="text-[#CBD5E1]"> · </span>
        <Link
          href={FOUNDATION_HREF}
          className="font-medium text-[#2563EB] underline-offset-2 hover:underline"
        >
          Foundation
        </Link>
      </p>
    );
  }

  return (
    <p
      className={`text-[13px] leading-relaxed text-[#64748B] ${className}`.trim()}
    >
      {AI_POLICY_TAGLINE}{" "}
      <Link
        href={TRUST_SAFETY_CHARTER_HREF}
        className="font-medium text-[#2563EB] underline-offset-2 hover:underline"
      >
        Trust & Safety Charter
      </Link>
      <span className="text-[#94A3B8]"> · </span>
      <Link
        href={ENGINEERING_CONSTITUTION_HREF}
        className="font-medium text-[#2563EB] underline-offset-2 hover:underline"
      >
        Constitution
      </Link>
      <span className="text-[#94A3B8]"> · </span>
      <Link
        href={AI_POLICY_HREF}
        className="font-medium text-[#2563EB] underline-offset-2 hover:underline"
      >
        AI Safety Policy
      </Link>
      <span className="text-[#94A3B8]"> · </span>
      <Link
        href={FOUNDATION_HREF}
        className="font-medium text-[#2563EB] underline-offset-2 hover:underline"
      >
        {FOUNDATION_BUILT_ON_NOTICE}
      </Link>
    </p>
  );
}
