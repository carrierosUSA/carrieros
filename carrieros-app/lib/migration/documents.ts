import { scoreToConfidenceLevel } from "@/lib/ai-safety";
import type { ClassifiedDocument, DocumentClass } from "@/lib/migration/types";

const CLASS_RULES: { cls: DocumentClass; patterns: RegExp[]; score: number }[] = [
  { cls: "pod", patterns: [/\bpod\b/i, /proof\s*of\s*delivery/i, /delivery\s*receipt/i], score: 0.92 },
  { cls: "rate_con", patterns: [/rate\s*con/i, /rate\s*confirmation/i, /load\s*confirmation/i], score: 0.9 },
  { cls: "invoice", patterns: [/invoice/i, /\binv[-_\s]?\d/i, /billing/i], score: 0.88 },
  { cls: "fuel", patterns: [/fuel/i, /comdata/i, /efs\b/i, /pilot\s*receipt/i], score: 0.86 },
  { cls: "lumper", patterns: [/lumper/i, /unload(ing)?\s*fee/i], score: 0.9 },
  { cls: "repair", patterns: [/repair/i, /work\s*order/i, /shop\s*invoice/i, /maintenance/i], score: 0.84 },
  { cls: "insurance", patterns: [/insurance/i, /coi\b/i, /certificate\s*of\s*insurance/i], score: 0.9 },
  { cls: "registration", patterns: [/registration/i, /cab\s*card/i, /title/i], score: 0.85 },
  { cls: "permits", patterns: [/permit/i, /oversize/i, /overweight/i, /hazmat\s*permit/i], score: 0.87 },
];

export const DOCUMENT_CLASS_LABELS: Record<DocumentClass, string> = {
  pod: "Proof of delivery",
  rate_con: "Rate confirmation",
  invoice: "Invoice",
  fuel: "Fuel receipt",
  lumper: "Lumper receipt",
  repair: "Repair / shop",
  insurance: "Insurance",
  registration: "Registration",
  permits: "Permits",
  unknown: "Needs review",
};

export function classifyDocumentFile(
  fileName: string,
  mimeType: string,
  size: number,
): ClassifiedDocument {
  let best: DocumentClass = "unknown";
  let bestScore = 0.35;

  for (const rule of CLASS_RULES) {
    if (rule.patterns.some((p) => p.test(fileName))) {
      if (rule.score > bestScore) {
        best = rule.cls;
        bestScore = rule.score;
      }
    }
  }

  if (best === "unknown" && mimeType === "application/pdf") {
    bestScore = 0.4;
  }

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fileName,
    mimeType,
    size,
    classification: best,
    confidence: scoreToConfidenceLevel(bestScore),
    score: bestScore,
    confirmed: false,
    filed: false,
    notes:
      best === "unknown"
        ? "Alph could not classify this file with confidence. Choose a type before filing."
        : "Suggestion only — confirm before filing into Documents.",
  };
}

export function confirmDocumentClassification(
  doc: ClassifiedDocument,
  classification: DocumentClass,
): ClassifiedDocument {
  return {
    ...doc,
    classification,
    confirmed: true,
    confidence: "high",
    score: 1,
    notes: "Confirmed by you before filing.",
  };
}
