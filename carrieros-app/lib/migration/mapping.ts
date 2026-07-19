import { scoreToConfidenceLevel, type ConfidenceLevel } from "@/lib/ai-safety";
import { CATEGORY_TARGET_FIELDS } from "@/lib/migration/categories";
import { FIELD_SYNONYMS, normalizeHeader } from "@/lib/migration/synonyms";
import type {
  ColumnMapping,
  MigrationCategory,
} from "@/lib/migration/types";

function scoreMatch(header: string, synonym: string): number {
  const h = normalizeHeader(header);
  const s = normalizeHeader(synonym);
  if (h === s) return 1;
  if (h.includes(s) || s.includes(h)) return 0.88;
  const hTokens = new Set(h.split(" "));
  const sTokens = s.split(" ");
  const overlap = sTokens.filter((t) => hTokens.has(t)).length;
  if (overlap === 0) return 0;
  return Math.min(0.82, 0.45 + overlap * 0.18);
}

/**
 * Suggest column mappings for selected categories.
 * Never auto-applies — UI requires human confirmation / correction.
 */
export function suggestColumnMappings(
  headers: string[],
  categories: MigrationCategory[],
): ColumnMapping[] {
  const targetPool = new Set<string>();
  for (const cat of categories) {
    for (const field of CATEGORY_TARGET_FIELDS[cat]) {
      targetPool.add(field);
    }
  }

  const usedTargets = new Set<string>();

  return headers.map((sourceColumn) => {
    let bestField: string | null = null;
    let bestScore = 0;
    let matchedSynonym: string | undefined;

    for (const field of targetPool) {
      if (usedTargets.has(field)) continue;
      const synonyms = FIELD_SYNONYMS[field] ?? [field];
      for (const syn of synonyms) {
        const score = scoreMatch(sourceColumn, syn);
        if (score > bestScore) {
          bestScore = score;
          bestField = field;
          matchedSynonym = syn;
        }
      }
    }

    if (bestField && bestScore >= 0.45) {
      usedTargets.add(bestField);
      return {
        sourceColumn,
        targetField: bestField,
        confidence: scoreToConfidenceLevel(bestScore),
        score: bestScore,
        matchedSynonym,
        manual: false,
      };
    }

    return {
      sourceColumn,
      targetField: null,
      confidence: "needs_human_verification" as ConfidenceLevel,
      score: 0,
      manual: false,
    };
  });
}

export function applyManualMapping(
  mappings: ColumnMapping[],
  sourceColumn: string,
  targetField: string | null,
): ColumnMapping[] {
  const used = new Set(
    mappings
      .filter((m) => m.sourceColumn !== sourceColumn && m.targetField)
      .map((m) => m.targetField as string),
  );

  return mappings.map((m) => {
    if (m.sourceColumn !== sourceColumn) return m;
    if (targetField && used.has(targetField)) {
      return {
        ...m,
        targetField: null,
        confidence: "needs_human_verification",
        score: 0,
        manual: true,
        matchedSynonym: undefined,
      };
    }
    return {
      ...m,
      targetField,
      confidence: targetField ? ("high" as ConfidenceLevel) : ("needs_human_verification" as ConfidenceLevel),
      score: targetField ? 1 : 0,
      manual: true,
      matchedSynonym: undefined,
    };
  });
}

export function mappingConfidenceLabel(level: ConfidenceLevel): string {
  switch (level) {
    case "high":
      return "High";
    case "review_recommended":
      return "Medium";
    case "needs_human_verification":
      return "Needs verification";
  }
}

/** Project raw rows through mappings into target-field records. */
export function projectRows(
  rows: Record<string, string>[],
  mappings: ColumnMapping[],
): Record<string, string>[] {
  const active = mappings.filter((m) => m.targetField);
  return rows.map((row) => {
    const out: Record<string, string> = {};
    for (const m of active) {
      const value = row[m.sourceColumn] ?? "";
      out[m.targetField as string] = value.trim();
    }
    return out;
  });
}
