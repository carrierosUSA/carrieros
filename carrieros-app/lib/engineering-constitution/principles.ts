/**
 * Transpo.ai Engineering Constitution — shared principle IDs and copy.
 * Canonical prose: /constitution/03-engineering-constitution.md (folder wins on conflict).
 * Precedence: Master Constitution v1.0 → Charter → Foundation → this → AI Safety → Product Design.
 */

export const ENGINEERING_CONSTITUTION_TITLE =
  "Transpo.ai Engineering Constitution" as const;

export const ENGINEERING_CONSTITUTION_HREF =
  "/platform/constitution" as const;

export const ENGINEERING_CONSTITUTION_TAGLINE =
  "Trust over automation. Accuracy over speed. Safety over convenience." as const;

export const ENGINEERING_CONSTITUTION_MISSION =
  "AI helps people — it does not replace responsibility." as const;

export const ENGINEERING_CONSTITUTION_GOVERNED_BY =
  "Governed by Engineering Constitution" as const;

/** Short notice for Alph / AI panels. */
export const ALPH_YOU_DECIDE_NOTICE = "Alph assists. You decide." as const;

export const ENGINEERING_CONSTITUTION_PRINCIPLE_IDS = [
  "humans-in-control",
  "safety-before-automation",
  "compliance-by-design",
  "ai-must-be-honest",
  "explainability",
  "approval-system",
  "auditability",
  "security-first",
  "transparency",
  "professional-responsibility",
  "connected-ecosystem",
  "user-ownership",
] as const;

export type EngineeringConstitutionPrincipleId =
  (typeof ENGINEERING_CONSTITUTION_PRINCIPLE_IDS)[number];

export type EngineeringConstitutionPrinciple = {
  id: EngineeringConstitutionPrincipleId;
  number: number;
  title: string;
  summary: string;
  /** Plain-language detail for the product page. */
  body: string;
};

export const ENGINEERING_CONSTITUTION_PRINCIPLES: EngineeringConstitutionPrinciple[] =
  [
    {
      id: "humans-in-control",
      number: 1,
      title: "Humans remain in control",
      summary:
        "AI never decides money, employment, safety, compliance, legal, taxes, filings, insurance, contracts, customers, drivers, or company records.",
      body: "Alph can prepare drafts and recommendations. A person always approves — or declines — outcomes that affect money, jobs, safety, compliance, legal matters, taxes, government reporting, insurance, contracts, customers, drivers, or company records.",
    },
    {
      id: "safety-before-automation",
      number: 2,
      title: "Safety before automation",
      summary: "When goals conflict, choose the safest option.",
      body: "Convenience never wins over safety. If automation would increase driving risk, labor risk, financial risk, or compliance risk, Transpo.ai slows down, asks, or blocks — it does not push through.",
    },
    {
      id: "compliance-by-design",
      number: 3,
      title: "Compliance by design",
      summary:
        "No features that encourage unsafe driving, break the law, bypass approvals, or mislead records.",
      body: "We do not ship tools that encourage unsafe driving, violate labor, privacy, financial, trucking, or employment laws, skip required approvals, or create misleading business records. Lawful process is part of the product.",
    },
    {
      id: "ai-must-be-honest",
      number: 4,
      title: "AI must be honest",
      summary: "No fabricating or guessing critical information. Show uncertainty.",
      body: "When data is missing, conflicting, or unclear, Alph says so. It does not invent critical facts about money, hours, compliance, identity, or legal status.",
    },
    {
      id: "explainability",
      number: 5,
      title: "Explainability",
      summary: "Why, data used, confidence, and required approval — always visible.",
      body: "Meaningful suggestions and actions explain why they appeared, what data was used, how confident Alph is, and whether you still need to approve.",
    },
    {
      id: "approval-system",
      number: 6,
      title: "Approval system",
      summary:
        "Low-risk may automate when enabled; medium needs approval; high-risk never auto.",
      body: "Low-risk admin tasks may run automatically only if your company turns that on. Medium-risk actions wait for approval. High-risk domains never auto-execute.",
    },
    {
      id: "auditability",
      number: 7,
      title: "Auditability",
      summary: "Who, what, when, before/after, approval, and reason.",
      body: "Important AI and automation steps leave a clear trail: who acted, what changed, when, previous and new values, whether it was approved, and why.",
    },
    {
      id: "security-first",
      number: 8,
      title: "Security first",
      summary: "Least privilege, encrypt sensitive data, protect customer information.",
      body: "Access stays as narrow as practical. Sensitive data is protected. Credentials and personal information are never treated casually.",
    },
    {
      id: "transparency",
      number: 9,
      title: "Transparency",
      summary:
        "Users see what AI changed, suggested, needs approval, or is pending — nothing silent when it matters.",
      body: "Important actions are never silent. You can see suggestions, pending approvals, and completed AI-assisted changes.",
    },
    {
      id: "professional-responsibility",
      number: 10,
      title: "Professional responsibility",
      summary:
        "Not legal or tax advice. Does not replace accountants, attorneys, or safety professionals.",
      body: "Transpo.ai assists operations. It is not a substitute for licensed legal, tax, safety, or compliance professionals when those judgments are required.",
    },
    {
      id: "connected-ecosystem",
      number: 11,
      title: "Connected ecosystem",
      summary: "Prefer verified provider sync over manual entry.",
      body: "When a trusted integration exists — ELD, accounting, fuel, and similar — prefer verified sync over retyping. Manual entry remains available; fake live data does not.",
    },
    {
      id: "user-ownership",
      number: 12,
      title: "User ownership",
      summary:
        "Customers own data, integrations, and automations — export and disable AI anytime.",
      body: "Your company owns its data and controls integrations and automations. You can export records and turn AI assistance down or off.",
    },
  ];

export function getConstitutionPrinciple(
  id: EngineeringConstitutionPrincipleId,
): EngineeringConstitutionPrinciple {
  const found = ENGINEERING_CONSTITUTION_PRINCIPLES.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Unknown constitution principle: ${id}`);
  }
  return found;
}
