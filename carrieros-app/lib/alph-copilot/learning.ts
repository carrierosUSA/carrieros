import { SEED_LEARNING } from "@/lib/alph-copilot/seed";
import type {
  CopilotLearningInsight,
  CopilotRole,
} from "@/lib/alph-copilot/types";
import { getLearningPrefs } from "@/lib/alph-copilot/store";

export function listLearningInsights(
  role?: CopilotRole,
): CopilotLearningInsight[] {
  if (!role) return SEED_LEARNING;
  return SEED_LEARNING.filter(
    (item) => item.role === "all" || item.role === role,
  );
}

/**
 * Heuristic “improved suggestions” based on persisted learning prefs.
 */
export function buildImprovedSuggestions(role: CopilotRole): string[] {
  const prefs = getLearningPrefs();
  const out: string[] = [];

  if (role === "owner" || role === "accounting") {
    if (prefs.preferCashBeforeRevenue) {
      out.push("Briefing leads with cash flow before revenue totals.");
    }
    if (prefs.autoAttachPodLumper) {
      out.push("Invoice drafts auto-attach POD + lumper for preferred customers.");
    }
  }

  if (role === "dispatcher") {
    const buffer = Number(prefs.txLoadHourBuffer ?? 4);
    out.push(
      `Best-driver ranking prefers ${buffer}+ hours remaining on Texas loads.`,
    );
  }

  if (role === "safety" || role === "driver") {
    const days = Number(prefs.medicalExpiryLeadDays ?? 21);
    out.push(`Medical/CDL expiry alerts fire ${days} days ahead.`);
  }

  if (role === "driver") {
    out.push(
      `Fuel stops ranked by your "${String(prefs.fuelStopPreference ?? "rewards")}" preference.`,
    );
  }

  if (role === "maintenance") {
    const rating = Number(prefs.exchangeMinSellerRating ?? 4.8);
    out.push(`Exchange parts prefer sellers rated ${rating}+.`);
  }

  if (out.length === 0) {
    out.push("Alph is learning your habits — keep confirming suggestions.");
  }

  return out;
}
