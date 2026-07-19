/**
 * Pointers to repo-root /constitution (canonical governance).
 * Product pages and Cursor rules summarize; the markdown folder wins on conflict.
 */

export {
  MASTER_CONSTITUTION_AI_MAY,
  MASTER_CONSTITUTION_AI_MUST_NEVER,
  MASTER_CONSTITUTION_CONFIDENCE,
  MASTER_CONSTITUTION_CONFLICT,
  MASTER_CONSTITUTION_CORE_PRINCIPLES,
  MASTER_CONSTITUTION_CUSTOMER_CONTROL,
  MASTER_CONSTITUTION_DESIGN_PHILOSOPHY,
  MASTER_CONSTITUTION_DOCUMENT_IMPORT,
  MASTER_CONSTITUTION_ENGINEERING_STANDARD,
  MASTER_CONSTITUTION_FILE,
  MASTER_CONSTITUTION_FINAL_RULE,
  MASTER_CONSTITUTION_HREF,
  MASTER_CONSTITUTION_IMPORT_FEATURES,
  MASTER_CONSTITUTION_INTEGRATIONS,
  MASTER_CONSTITUTION_LOW_MAINTENANCE,
  MASTER_CONSTITUTION_MIGRATION_HREF,
  MASTER_CONSTITUTION_MIGRATION_IMPORTS,
  MASTER_CONSTITUTION_MISSION,
  MASTER_CONSTITUTION_MISSION_STATEMENT,
  MASTER_CONSTITUTION_OVERRIDE,
  MASTER_CONSTITUTION_POST_IMPORT_AI,
  MASTER_CONSTITUTION_PRIORITIES,
  MASTER_CONSTITUTION_PRODUCT_VISION,
  MASTER_CONSTITUTION_ROLE,
  MASTER_CONSTITUTION_SECURITY,
  MASTER_CONSTITUTION_SMART_IMPORT,
  MASTER_CONSTITUTION_TAGLINE,
  MASTER_CONSTITUTION_TITLE,
  MASTER_CONSTITUTION_VERSION,
  MASTER_CONSTITUTION_WHEN_UNCERTAIN,
} from "@/lib/constitution/master";

export {
  PERMANENT_CONSTITUTION_AI_MAY,
  PERMANENT_CONSTITUTION_AI_MUST_NEVER,
  PERMANENT_CONSTITUTION_AI_PHILOSOPHY,
  PERMANENT_CONSTITUTION_CONFIDENCE,
  PERMANENT_CONSTITUTION_CONFLICT,
  PERMANENT_CONSTITUTION_CUSTOMER_CONTROL,
  PERMANENT_CONSTITUTION_ENGINEERING_STANDARD,
  PERMANENT_CONSTITUTION_FILE,
  PERMANENT_CONSTITUTION_FINAL_PRINCIPLE,
  PERMANENT_CONSTITUTION_HREF,
  PERMANENT_CONSTITUTION_INTEGRATIONS,
  PERMANENT_CONSTITUTION_LOW_MAINTENANCE,
  PERMANENT_CONSTITUTION_MISSION,
  PERMANENT_CONSTITUTION_OVERRIDE,
  PERMANENT_CONSTITUTION_ROLE_NOT,
  PERMANENT_CONSTITUTION_SAFETY_CONFLICTS,
  PERMANENT_CONSTITUTION_SECURITY,
  PERMANENT_CONSTITUTION_TAGLINE,
  PERMANENT_CONSTITUTION_TITLE,
  PERMANENT_CONSTITUTION_WHEN_UNCERTAIN,
} from "@/lib/constitution/permanent";

export const CONSTITUTION_FOLDER = "/constitution" as const;

export const CONSTITUTION_INDEX_PATH = "/constitution/INDEX.md" as const;

export const CONSTITUTION_GOVERNANCE_HREF = "/platform/governance" as const;

export const CONSTITUTION_CANONICAL_NOTICE =
  "Canonical source for engineers: /constitution (repo root). Master Constitution Version 1.0 is highest authority. Product pages summarize for operators." as const;

export const CONSTITUTION_DOCS = [
  {
    id: "master-constitution",
    rank: 1,
    title: "Master Constitution Version 1.0",
    file: "/constitution/00-master-constitution.md",
    href: "/platform/governance#master-constitution",
    summary:
      "Highest authority for the entire codebase. Conflict protocol; priorities; AI MAY / MUST NEVER; Migration Center requirements; final rule.",
  },
  {
    id: "trust-charter",
    rank: 2,
    title: "Trust & Safety Charter",
    file: "/constitution/01-trust-safety-charter.md",
    href: "/platform/trust-charter",
    summary:
      "Trust, safety, no-decision, AI autonomy — implements the Master Constitution.",
  },
  {
    id: "foundation",
    rank: 3,
    title: "Transpo.ai Foundation",
    file: "/constitution/02-foundation.md",
    href: "/platform/foundation",
    summary:
      "How agents operate, architecture tradeoffs, and long-term quality.",
  },
  {
    id: "engineering-constitution",
    rank: 4,
    title: "Engineering Constitution",
    file: "/constitution/03-engineering-constitution.md",
    href: "/platform/constitution",
    summary: "Twelve principles for AI, automation, security, and ownership.",
  },
  {
    id: "ai-policy",
    rank: 5,
    title: "AI Safety & Legal Policy",
    file: "/constitution/04-ai-safety-legal-policy.md",
    href: "/platform/ai-policy",
    summary: "Product AI controls, confirmations, and automation levels.",
  },
] as const;

export type ConstitutionDocId = (typeof CONSTITUTION_DOCS)[number]["id"];
