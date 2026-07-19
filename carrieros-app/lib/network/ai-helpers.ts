import { listMembers } from "@/lib/network/store";
import type { NetworkCategory, NetworkMember } from "@/lib/network/types";
import { NETWORK_CATEGORY_LABELS } from "@/lib/network/types";
import { memberHref } from "@/lib/network/board";

export type NetworkAiChip = {
  id: string;
  label: string;
  query: string;
};

export const NETWORK_AI_CHIPS: NetworkAiChip[] = [
  {
    id: "reefer-mech",
    label: "Reefer mechanics nearby",
    query: "highest-rated reefer mechanic within 50 miles",
  },
  {
    id: "insurance-fleet",
    label: "Insurance for my fleet size",
    query: "insurance for fleets around 50 trucks",
  },
  {
    id: "dispatch-reefer",
    label: "Dispatch cos with reefer exp",
    query: "dispatch companies with reefer experience",
  },
  {
    id: "safety-bilingual",
    label: "Bilingual safety consultants",
    query: "bilingual safety consultants",
  },
  {
    id: "hazmat-drivers",
    label: "Hazmat drivers available now",
    query: "hazmat drivers available now",
  },
  {
    id: "verified-hire",
    label: "Verified drivers for hiring",
    query: "verified drivers available for hiring",
  },
];

export type RankedNetworkMatch = {
  member: NetworkMember;
  score: number;
  reason: string;
  href: string;
};

function scoreBase(m: NetworkMember): number {
  let s = m.trustScore;
  if (m.verification === "premium") s += 8;
  else if (m.verification === "verified") s += 5;
  else if (m.verification === "basic") s += 2;
  if (m.availability === "available") s += 4;
  if (m.state === "TX") s += 3;
  return s;
}

function matchesAny(hay: string, needles: string[]): boolean {
  return needles.some((n) => hay.includes(n));
}

export function rankNetworkQuery(rawQuery: string): {
  title: string;
  summary: string;
  matches: RankedNetworkMatch[];
  disclaimer: string;
} {
  const q = rawQuery.trim().toLowerCase() || "verified professionals nearby";
  const members = listMembers();

  let categoryHint: NetworkCategory | null = null;
  if (/\bmechanic|mobile\b/.test(q)) {
    categoryHint = /\bmobile\b/.test(q) ? "mobile_mechanic" : "mechanic";
  } else if (/\binsurance\b/.test(q)) categoryHint = "insurance";
  else if (/\bdispatch\b/.test(q)) categoryHint = "dispatch_company";
  else if (/\bsafety\b/.test(q)) categoryHint = "safety_consultant";
  else if (/\bdriver|hazmat|hire|hiring\b/.test(q)) categoryHint = "driver";
  else if (/\brecruiter\b/.test(q)) categoryHint = "recruiter";
  else if (/\bfactor/.test(q)) categoryHint = "factoring";
  else if (/\bfuel\b/.test(q)) categoryHint = "fuel_card";
  else if (/\baccountant|cpa|ifta\b/.test(q)) categoryHint = "accountant";

  const wantReefer = /\breefer|cold|temperature\b/.test(q);
  const wantHazmat = /\bhazmat\b/.test(q);
  const wantBilingual = /\bbilingual|spanish\b/.test(q);
  const wantAvailable = /\bavailable|now|hiring\b/.test(q);
  const wantFleet = /\bfleet|50|forty|trucks?\b/.test(q);
  const nearSa = /\bnearby|50\s*miles?|san antonio|local\b/.test(q);

  const ranked: RankedNetworkMatch[] = members
    .map((member) => {
      let score = scoreBase(member);
      const hay = [
        member.displayName,
        member.headline,
        ...member.specializations,
        ...member.services,
        ...member.trailerTypes,
        ...member.languages,
        NETWORK_CATEGORY_LABELS[member.category],
      ]
        .join(" ")
        .toLowerCase();

      const reasons: string[] = [];

      if (categoryHint && member.category === categoryHint) {
        score += 25;
        reasons.push(NETWORK_CATEGORY_LABELS[member.category]);
      } else if (
        categoryHint === "mechanic" &&
        (member.category === "mobile_mechanic" || member.category === "mechanic")
      ) {
        score += 20;
        reasons.push(NETWORK_CATEGORY_LABELS[member.category]);
      } else if (
        categoryHint === "driver" &&
        (member.category === "driver" || member.category === "owner_operator")
      ) {
        score += 18;
        reasons.push(NETWORK_CATEGORY_LABELS[member.category]);
      }

      if (wantReefer && matchesAny(hay, ["reefer", "cold", "temperature"])) {
        score += 12;
        reasons.push("Reefer experience");
      }
      if (wantHazmat && matchesAny(hay, ["hazmat"])) {
        score += 14;
        reasons.push("Hazmat");
      }
      if (
        wantBilingual &&
        member.languages.some((l) => /spanish|bilingual/i.test(l))
      ) {
        score += 10;
        reasons.push("Bilingual");
      }
      if (wantAvailable && member.availability === "available") {
        score += 10;
        reasons.push("Available now");
      }
      if (wantFleet && member.category === "insurance") {
        score += 12;
        reasons.push("Fits mid-size fleets");
      }
      if (
        nearSa &&
        (member.state === "TX" ||
          /san antonio|new braunfels|austin|houston|dallas/i.test(
            `${member.city} ${member.headline}`,
          ))
      ) {
        score += 8;
        reasons.push("Local / Texas corridor");
      }

      // Soft keyword overlap
      for (const token of q.split(/\s+/).filter((t) => t.length > 3)) {
        if (hay.includes(token)) score += 2;
      }

      return {
        member,
        score,
        reason: reasons.length ? reasons.join(" · ") : "Directory match",
        href: memberHref(member),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const top = ranked[0];
  const summary = top
    ? `Alph found ${ranked.length} verified matches. Top result: ${top.member.displayName} (${top.reason}). Trust scores are decision support only — review profiles and consent before outreach.`
    : "No strong matches in the seed directory. Try a broader category or location.";

  return {
    title: `AI Networking · ${rawQuery.trim() || "Suggested matches"}`,
    summary,
    matches: ranked,
    disclaimer:
      "Alph rankings are heuristics over Verified Network directory data for decision support. They never auto-approve, hire, or reject.",
  };
}
