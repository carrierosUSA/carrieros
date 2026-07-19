/**
 * Transpo.ai AI Safety & Legal Policy — structured constants.
 * Philosophy: Alph assists. You decide.
 * Canonical prose: /constitution/04-ai-safety-legal-policy.md (folder wins on conflict).
 * Precedence: Master Constitution v1.0 → Charter → Foundation → Engineering Constitution → this Policy → Product Design.
 */

import {
  ALPH_YOU_DECIDE_NOTICE,
  ENGINEERING_CONSTITUTION_HREF,
  ENGINEERING_CONSTITUTION_TITLE,
} from "@/lib/engineering-constitution";
import {
  TRUST_SAFETY_CHARTER_GOVERNED_BY,
  TRUST_SAFETY_CHARTER_HREF,
  TRUST_SAFETY_CHARTER_TITLE,
} from "@/lib/trust-safety-charter";

export const AI_POLICY_BRAND = "Transpo.ai" as const;
export const AI_POLICY_ASSISTANT = "Alph Copilot™" as const;
export const AI_POLICY_TAGLINE = ALPH_YOU_DECIDE_NOTICE;
export const AI_POLICY_HREF = "/platform/ai-policy" as const;
export const AI_POLICY_SETTINGS_HREF = "/settings/ai-policy" as const;

/** Cross-link: AI Safety Policy → Trust & Safety Charter (supreme) */
export const AI_POLICY_CHARTER_HREF = TRUST_SAFETY_CHARTER_HREF;
export const AI_POLICY_CHARTER_TITLE = TRUST_SAFETY_CHARTER_TITLE;
export const AI_POLICY_GOVERNED_BY = TRUST_SAFETY_CHARTER_GOVERNED_BY;

/** Cross-link: AI Safety Policy ↔ Engineering Constitution (implements Charter) */
export const AI_POLICY_CONSTITUTION_HREF = ENGINEERING_CONSTITUTION_HREF;
export const AI_POLICY_CONSTITUTION_TITLE = ENGINEERING_CONSTITUTION_TITLE;

export const AI_POLICY_PHILOSOPHY = [
  "Empower professionals — not replace them.",
  "AI assists. Humans decide.",
  "Safety, compliance, and trust come before automation.",
] as const;

/** Actions AI must never take on its own. */
export const AI_NEVER = [
  "Make legal decisions",
  "Make employment decisions without human approval",
  "Approve or deny payroll",
  "Approve invoices, settlements, maintenance, or safety violations automatically",
  "Fire or discipline anyone",
  "Accept or reject freight",
  "Sign contracts",
  "Submit government filings, taxes, or compliance reports automatically",
  "Make financial decisions without confirmation",
  "Contact customers or government automatically unless authorized",
  "Change critical business records without approval",
] as const;

/** What AI may do (assistive). */
export const AI_MAY = [
  "Read, extract, summarize, and organize documents",
  "Suggest payroll, invoices, detention, maintenance, dispatch, fuel, and routes",
  "Detect unusual activity and missing documents",
  "Explain data and generate reports",
  "Translate and answer questions",
  "Prepare drafts and recommend actions",
] as const;

/** Domains that always require human confirmation before execution. */
export const AI_CONFIRMATION_CATEGORIES = [
  "money",
  "payroll",
  "safety",
  "compliance",
  "legal",
  "customer_relationships",
  "government_reporting",
  "employment",
  "contracts",
  "business_records",
] as const;

export type AiConfirmationCategory =
  (typeof AI_CONFIRMATION_CATEGORIES)[number];

export const AI_CONFIRMATION_CATEGORY_LABELS: Record<
  AiConfirmationCategory,
  string
> = {
  money: "Money",
  payroll: "Payroll",
  safety: "Safety",
  compliance: "Compliance",
  legal: "Legal",
  customer_relationships: "Customer relationships",
  government_reporting: "Government reporting",
  employment: "Employment",
  contracts: "Contracts",
  business_records: "Business records",
};

export const AI_SAFETY_FIRST =
  "If data is uncertain, conflicting, or insufficient — Alph asks for clarification. It does not guess." as const;

export const AI_TRANSPARENCY_POINTS = [
  "What AI did",
  "What it suggested",
  "Why it suggested it",
  "What data it used",
  "Whether approval is still required",
] as const;

export const AI_AUDIT_FIELDS = [
  "user",
  "AI action",
  "suggestion",
  "approval",
  "time",
  "reason",
  "previous value",
  "new value",
] as const;
