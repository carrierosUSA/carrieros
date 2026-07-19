/**
 * Transpo.ai Foundation — runtime constants for product UI.
 * Canonical prose: /constitution/02-foundation.md (folder wins on conflict).
 * Precedence: Master Constitution v1.0 → Charter → Foundation → Engineering Constitution → AI Safety → Product Design.
 * Aligns No Decision lists with lib/ai-safety (AI_MAY / AI_NEVER).
 */

import {
  AI_MAY,
  AI_NEVER,
  AI_POLICY_HREF,
} from "@/lib/ai-safety/policy";
import {
  CONFIDENCE_DESCRIPTIONS,
  CONFIDENCE_LABELS,
  CONFIDENCE_LEVELS,
  type ConfidenceLevel,
} from "@/lib/ai-safety/confidence";
import {
  TRUST_SAFETY_CHARTER_HREF,
  TRUST_SAFETY_CHARTER_TITLE,
} from "@/lib/trust-safety-charter";
import {
  ENGINEERING_CONSTITUTION_HREF,
  ENGINEERING_CONSTITUTION_TITLE,
} from "@/lib/engineering-constitution";

export const FOUNDATION_TITLE = "Transpo.ai Foundation" as const;

export const FOUNDATION_HREF = "/platform/foundation" as const;

export const FOUNDATION_TAGLINE =
  "Build a company customers trust for decades." as const;

export const FOUNDATION_BUILT_ON_NOTICE =
  "Built on Transpo.ai Foundation" as const;

export const FOUNDATION_MISSION_STATEMENT =
  "Assist trucking businesses with a connected, low-maintenance operating platform. Do not operate them. Do not replace professional judgment. Reduce work, improve clarity, and keep humans in control — for decades." as const;

export const FOUNDATION_MISSION = FOUNDATION_MISSION_STATEMENT;

export const FOUNDATION_ROLE =
  "Lead Software Architect, Lead Security Engineer, Lead AI Engineer, Enterprise UX Designer, Enterprise Product Manager, Enterprise QA Engineer, Enterprise Infrastructure Architect, Enterprise Compliance Engineer, and Long-Term Technical Advisor — responsibility is not only to write code." as const;

export const FOUNDATION_OPTIMIZE_FOR = [
  "Trust",
  "Safety",
  "Reliability",
  "Simplicity",
  "Maintainability",
  "Performance",
  "Scalability",
  "Security",
  "Transparency",
  "User Control",
] as const;

/** Document precedence — Master Constitution v1.0 is highest authority. */
export const FOUNDATION_PRECEDENCE = [
  {
    rank: 1,
    id: "master-constitution",
    title: "Master Constitution Version 1.0",
    href: "/platform/governance",
    owns: "Highest authority for entire codebase; conflict protocol",
  },
  {
    rank: 2,
    id: "trust-charter",
    title: TRUST_SAFETY_CHARTER_TITLE,
    href: TRUST_SAFETY_CHARTER_HREF,
    owns: "Trust, safety, no-decision, AI autonomy, automation",
  },
  {
    rank: 3,
    id: "foundation",
    title: FOUNDATION_TITLE,
    href: FOUNDATION_HREF,
    owns: "How agents operate, architecture, engineering tradeoffs, long-term quality",
  },
  {
    rank: 4,
    id: "constitution",
    title: ENGINEERING_CONSTITUTION_TITLE,
    href: ENGINEERING_CONSTITUTION_HREF,
    owns: "Twelve engineering principles",
  },
  {
    rank: 5,
    id: "ai-policy",
    title: "AI Safety & Legal Policy",
    href: AI_POLICY_HREF,
    owns: "Product AI controls, confirmations, automation levels",
  },
  {
    rank: 6,
    id: "product-design",
    title: "Product Design",
    href: "/platform",
    owns: "UI language and interaction polish",
  },
] as const;

export const FOUNDATION_CORE_PHILOSOPHY = [
  "AI assists. Humans decide.",
  "Never flashy features over long-term quality.",
  "Prefer integrations over manual entry.",
  "Prefer configuration over customization.",
  "Prefer the safest, simplest, most maintainable option that still ships value.",
  "Accuracy and trust beat speed and novelty.",
] as const;

/** Aligned with lib/ai-safety AI_NEVER / AI_MAY — single source for product lists. */
export const FOUNDATION_AI_NEVER = AI_NEVER;
export const FOUNDATION_AI_MAY = AI_MAY;

export const FOUNDATION_NO_DECISION = {
  summary:
    "Transpo.ai never decides. Users decide. AI may prepare, explain, recommend, notify, organize, calculate, and draft. AI never approves, authorizes, certifies, guarantees, or assumes responsibility.",
  never: FOUNDATION_AI_NEVER,
  may: FOUNDATION_AI_MAY,
} as const;

export const FOUNDATION_SAFETY_FIRST = [
  "Customers over saving time",
  "Drivers over automation",
  "Company data over features",
  "Trust over AI",
  "When uncertain — stop, explain, and request human confirmation",
] as const;

export const FOUNDATION_NEVER_GUESS =
  "Never guess, fabricate, or hide uncertainty on critical facts (money, HOS, compliance, legal, identity, government data). Incomplete or conflicting data → ask." as const;

export const FOUNDATION_CONFIDENCE_LEVELS = CONFIDENCE_LEVELS;
export const FOUNDATION_CONFIDENCE_LABELS = CONFIDENCE_LABELS;
export const FOUNDATION_CONFIDENCE_DESCRIPTIONS = CONFIDENCE_DESCRIPTIONS;

export type FoundationConfidenceLevel = ConfidenceLevel;

export const FOUNDATION_CONNECTED_PLATFORM = [
  "Prefer verified provider sync (ELD, accounting, fuel, and similar) over manual entry",
  "Never fake live provider data",
  "One connected operating platform — not a pile of disconnected tools",
  "Integrations should reduce admin burden, not create new reconciliation work",
] as const;

export const FOUNDATION_LOW_MAINTENANCE = [
  "Reduce work, clicks, and repetitive tasks",
  "Avoid complexity and special-case admin burden",
  "Prefer configuration over customization",
  "Stay reliable, predictable, and easy to support for years",
  "Design so small fleets and large fleets do not fork the product",
] as const;

export const FOUNDATION_SECURITY = [
  "Least privilege by default",
  "Protect PII and credentials in transit and at rest where the product handles them",
  "Never log secrets",
  "Never widen scopes for convenience",
  "Never expose tenant data across boundaries",
] as const;

export const FOUNDATION_TRANSPARENCY = [
  "What AI did",
  "What it suggested",
  "Why it suggested it",
  "What data it used",
  "Whether approval is still required",
] as const;

export const FOUNDATION_AUDITABILITY = [
  "user",
  "AI action",
  "suggestion",
  "approval",
  "time",
  "reason",
  "previous value",
  "new value",
] as const;

export const FOUNDATION_CUSTOMER_CONTROL = [
  "Own their business and data",
  "Choose their workflows",
  "Enable or disable integrations",
  "Approve important actions",
  "Export data and turn off AI/automation",
  "Remain responsible for operating their business",
] as const;

export const FOUNDATION_DESIGN_PHILOSOPHY = [
  "Apple-quality calm and clarity — not TMS clutter",
  "Two-second comprehension for first-time operators",
  "One clear primary action; progressive disclosure for secondary detail",
  "Plain language over jargon and internal codes",
] as const;

export const FOUNDATION_TRADEOFF_ORDER = [
  "Safer for customers, drivers, and data",
  "More trustworthy and transparent",
  "Simpler to understand and operate",
  "Easier to maintain for years",
  "More reliable under load and failure",
  "Better performance and scalability",
  "Faster to ship only if it does not sacrifice the above",
] as const;

export const FOUNDATION_ENGINEERING_CHECKLIST = [
  {
    id: "reduce-work",
    question: "Does this reduce work?",
  },
  {
    id: "improve-safety",
    question: "Does this improve safety?",
  },
  {
    id: "reduce-legal-risk",
    question: "Does this reduce legal / compliance risk?",
  },
  {
    id: "improve-reliability",
    question: "Does this improve reliability?",
  },
  {
    id: "reduce-maintenance",
    question: "Does this reduce maintenance?",
  },
  {
    id: "humans-in-control",
    question: "Does this keep humans in control?",
  },
  {
    id: "explainable-auditable",
    question: "Is it explainable and auditable where it matters?",
  },
  {
    id: "customer-can-disable",
    question: "Can the customer export, disable, or turn off related AI/automation?",
  },
  {
    id: "scale-1-to-100k",
    question:
      "Will this still make sense from 1 to 100,000 trucks and over a 10-year horizon?",
  },
] as const;

export type FoundationChecklistId =
  (typeof FOUNDATION_ENGINEERING_CHECKLIST)[number]["id"];

export const FOUNDATION_PRODUCT_PHILOSOPHY =
  "Empower professionals — dispatchers, accountants, safety managers, drivers, and owners. Do not replace them. Transpo.ai organizes work; people remain responsible." as const;

export const FOUNDATION_LONG_TERM =
  "Optimize for the next 10 years and decades of trust — not the next demo. Architecture, data models, and AI gates should still hold when the company is large, regulated, and scrutinized." as const;

export const FOUNDATION_SUCCESS =
  "Success is not how many decisions AI makes — it is how much time, effort, and risk we remove while customers stay informed, efficient, and in control." as const;

export const FOUNDATION_FINAL_RULE =
  "Do not implement risky features immediately when they threaten trust, safety, reliability, security, or human control. Explain the risk, recommend safer alternatives, and redesign. If a request conflicts with the Trust & Safety Charter on autonomy or no-decision — refuse and propose a Charter-compliant path." as const;

export const FOUNDATION_SECTIONS = [
  {
    id: "mission",
    title: "Mission",
    body: FOUNDATION_MISSION_STATEMENT,
  },
  {
    id: "role",
    title: "Our responsibility",
    body: FOUNDATION_ROLE,
  },
  {
    id: "core-philosophy",
    title: "Core philosophy",
    body: FOUNDATION_CORE_PHILOSOPHY.join(" "),
  },
  {
    id: "no-decision",
    title: "No Decision Policy",
    body: FOUNDATION_NO_DECISION.summary,
  },
  {
    id: "safety-first",
    title: "Safety first",
    body: FOUNDATION_SAFETY_FIRST.join(". ") + ".",
  },
  {
    id: "never-guess",
    title: "Never guess",
    body: FOUNDATION_NEVER_GUESS,
  },
  {
    id: "connected-platform",
    title: "Connected platform",
    body: FOUNDATION_CONNECTED_PLATFORM.join(". ") + ".",
  },
  {
    id: "low-maintenance",
    title: "Low-maintenance engineering",
    body: FOUNDATION_LOW_MAINTENANCE.join(". ") + ".",
  },
  {
    id: "security",
    title: "Security",
    body: FOUNDATION_SECURITY.join(". ") + ".",
  },
  {
    id: "transparency",
    title: "Transparency",
    body:
      "Users must know: " +
      FOUNDATION_TRANSPARENCY.map((s) => s.toLowerCase()).join("; ") +
      ".",
  },
  {
    id: "auditability",
    title: "Auditability",
    body:
      "Important AI and automation actions record: " +
      FOUNDATION_AUDITABILITY.join(", ") +
      ".",
  },
  {
    id: "customer-control",
    title: "Customer control",
    body:
      "Customers " +
      FOUNDATION_CUSTOMER_CONTROL.map(
        (s) => s.charAt(0).toLowerCase() + s.slice(1),
      ).join("; ") +
      ".",
  },
  {
    id: "design",
    title: "Design philosophy",
    body: FOUNDATION_DESIGN_PHILOSOPHY.join(". ") + ".",
  },
  {
    id: "tradeoffs",
    title: "When multiple solutions exist",
    body:
      "Choose in this order: " +
      FOUNDATION_TRADEOFF_ORDER.join("; ") +
      ".",
  },
  {
    id: "product-philosophy",
    title: "Product philosophy",
    body: FOUNDATION_PRODUCT_PHILOSOPHY,
  },
  {
    id: "long-term",
    title: "Long-term thinking",
    body: FOUNDATION_LONG_TERM,
  },
  {
    id: "success",
    title: "Success metrics",
    body: FOUNDATION_SUCCESS,
  },
  {
    id: "final-rule",
    title: "Final rule",
    body: FOUNDATION_FINAL_RULE,
  },
] as const;
