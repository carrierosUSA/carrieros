/**
 * Transpo.ai Trust & Safety Charter — product UI constants.
 * Canonical prose: /constitution/01-trust-safety-charter.md (folder wins on conflict).
 * Precedence: Master Constitution v1.0 → Charter → Foundation → Engineering Constitution → AI Safety → Product Design.
 */

export const TRUST_SAFETY_CHARTER_TITLE =
  "Transpo.ai Trust & Safety Charter" as const;

export const TRUST_SAFETY_CHARTER_HREF = "/platform/trust-charter" as const;

export const TRUST_SAFETY_CHARTER_TAGLINE =
  "Assist trucking businesses. Do not operate them." as const;

export const TRUST_SAFETY_CHARTER_MISSION =
  "Organize information, reduce repetitive work, and improve efficiency — people stay in control. Transpo.ai does not make business, legal, safety, or financial decisions." as const;

export const TRUST_SAFETY_CHARTER_GOVERNED_BY =
  "Governed by Trust & Safety Charter" as const;

export const TRUST_SAFETY_CHARTER_ROLE =
  "Assistant — not manager, dispatcher, accountant, lawyer, compliance or safety officer, payroll admin, insurance advisor, government representative, or replacement for professional judgment." as const;

export const TRUST_SAFETY_CHARTER_PROMISE =
  "Never intentionally build AI that replaces human responsibility. Build AI that organizes, reads, summarizes, searches, explains, connects, automates repetitive admin, prepares drafts, finds information, detects possible issues, and suggests actions — important decisions stay with authorized users." as const;

export const TRUST_SAFETY_CHARTER_NO_DECISION =
  "Transpo.ai never decides. Users decide. AI may prepare, explain, recommend, notify, organize, calculate, and draft. AI never approves, authorizes, certifies, guarantees, or assumes responsibility." as const;

export const TRUST_SAFETY_CHARTER_SAFETY_FIRST = [
  "Customers over saving time",
  "Drivers over automation",
  "Company data over features",
  "Trust over AI",
] as const;

export const TRUST_SAFETY_CHARTER_UNCERTAINTY =
  "When uncertain — stop, explain, and request human confirmation." as const;

export const TRUST_SAFETY_CHARTER_LOW_MAINTENANCE = [
  "Reduce work, clicks, and repetitive tasks",
  "Avoid complexity and admin burden",
  "Prefer integrations over manual entry",
  "Prefer configuration over customization",
  "Stay reliable, predictable, and easy to support",
] as const;

export const TRUST_SAFETY_CHARTER_SAFE_AI = [
  "Never guess, fabricate, or hide uncertainty",
  "Never auto-execute critical actions",
  "Never bypass approvals",
  "Never ship legal documents without human review",
  "Never make financial commitments",
  "Never submit government filings",
  "Never sign agreements",
  "Never contact authorities automatically",
  "Never send customer communications automatically unless explicitly enabled and approved in settings",
] as const;

export const TRUST_SAFETY_CHARTER_CUSTOMER_CONTROL = [
  "Own their business and data",
  "Choose their workflows",
  "Enable or disable integrations",
  "Approve important actions",
  "Remain responsible for operating their business",
] as const;

export const TRUST_SAFETY_CHARTER_CHECKLIST = [
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
    question: "Does this reduce legal risk?",
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
] as const;

export type TrustSafetyCharterChecklistId =
  (typeof TRUST_SAFETY_CHARTER_CHECKLIST)[number]["id"];

export const TRUST_SAFETY_CHARTER_SUCCESS =
  "Success is not how many decisions AI makes — it is how much time, effort, and repetitive work we remove while customers stay informed, efficient, and in control." as const;

export const TRUST_SAFETY_CHARTER_PRIORITIES =
  "Trust, Safety, Reliability, Transparency before automation. Always." as const;

export const TRUST_SAFETY_CHARTER_SECTIONS = [
  {
    id: "mission",
    title: "Mission",
    body: TRUST_SAFETY_CHARTER_MISSION,
  },
  {
    id: "our-role",
    title: "Our role",
    body: TRUST_SAFETY_CHARTER_ROLE,
  },
  {
    id: "promise",
    title: "Our promise",
    body: TRUST_SAFETY_CHARTER_PROMISE,
  },
  {
    id: "no-decision",
    title: "No Decision Policy",
    body: TRUST_SAFETY_CHARTER_NO_DECISION,
  },
  {
    id: "safety-first",
    title: "Safety first",
    body: `${TRUST_SAFETY_CHARTER_SAFETY_FIRST.join(". ")}. ${TRUST_SAFETY_CHARTER_UNCERTAINTY}`,
  },
  {
    id: "low-maintenance",
    title: "Low-maintenance design",
    body: TRUST_SAFETY_CHARTER_LOW_MAINTENANCE.join(". ") + ".",
  },
  {
    id: "safe-ai",
    title: "Safe AI principles",
    body: TRUST_SAFETY_CHARTER_SAFE_AI.join(". ") + ".",
  },
  {
    id: "customer-control",
    title: "Customer control",
    body:
      "Customers " +
      TRUST_SAFETY_CHARTER_CUSTOMER_CONTROL.map((s) =>
        s.charAt(0).toLowerCase() + s.slice(1),
      ).join("; ") +
      ".",
  },
  {
    id: "success",
    title: "How we measure success",
    body: `${TRUST_SAFETY_CHARTER_SUCCESS} ${TRUST_SAFETY_CHARTER_PRIORITIES}`,
  },
] as const;
