import {
  candidateStore,
  getCandidateById,
  getCompanyById,
  getJobById,
  jobStore,
  listByTenant,
} from "@/lib/data/workforce-store";
import type {
  EquipmentType,
  JobPosting,
  ProfessionalProfile,
  ProfessionalRole,
} from "@/lib/types/workforce";
import {
  EQUIPMENT_TYPE_LABELS,
  PROFESSIONAL_ROLE_LABELS,
} from "@/lib/types/workforce";
import { formatPay } from "@/lib/workforce/board";

export type AiRecruitChip = {
  id: string;
  label: string;
  filters: {
    roles?: ProfessionalRole[];
    equipment?: EquipmentType[];
    routeHints?: string[];
    endorsements?: string[];
    availability?: ProfessionalProfile["availability"][];
    bilingual?: boolean;
    radiusMiles?: number;
    minYears?: number;
  };
};

export const AI_RECRUIT_CHIPS: AiRecruitChip[] = [
  { id: "reefer", label: "Find Reefer Drivers", filters: { roles: ["cdl_driver"], equipment: ["reefer"] } },
  { id: "flatbed", label: "Flatbed", filters: { roles: ["cdl_driver"], equipment: ["flatbed"] } },
  { id: "local", label: "Local", filters: { routeHints: ["local"], roles: ["cdl_driver"] } },
  { id: "team", label: "Team", filters: { routeHints: ["team"] } },
  { id: "dispatchers", label: "Dispatchers", filters: { roles: ["dispatcher"] } },
  { id: "safety", label: "Safety Managers", filters: { roles: ["safety_manager"] } },
  { id: "diesel", label: "Diesel Mechanics", filters: { roles: ["diesel_mechanic", "reefer_mechanic"] } },
  { id: "payroll", label: "Payroll", filters: { roles: ["payroll", "ifta", "accounting"] } },
  {
    id: "bilingual",
    label: "Bilingual Dispatcher",
    filters: { roles: ["dispatcher"], bilingual: true },
  },
  { id: "radius", label: "Within 50 miles", filters: { radiusMiles: 50 } },
  { id: "hazmat", label: "Hazmat", filters: { endorsements: ["H"] } },
  { id: "tanker", label: "Tanker", filters: { endorsements: ["N"] } },
  {
    id: "immediate",
    label: "Available Immediately",
    filters: { availability: ["immediate"] },
  },
  { id: "exp5", label: "5+ years", filters: { minYears: 5 } },
];

export type RankedCandidate = ProfessionalProfile & {
  compatibility: number;
  rankReasons: string[];
};

function scoreCandidate(
  c: ProfessionalProfile,
  filters: AiRecruitChip["filters"],
  job?: JobPosting | null,
): RankedCandidate {
  let score = c.matchScore;
  const reasons: string[] = [];

  if (filters.roles?.length && filters.roles.some((r) => c.roles.includes(r))) {
    score += 6;
    reasons.push("Role match");
  }
  if (
    filters.equipment?.length &&
    filters.equipment.some((e) => c.preferredEquipment.includes(e))
  ) {
    score += 5;
    reasons.push("Equipment fit");
  }
  if (filters.endorsements?.length) {
    const hits = filters.endorsements.filter((e) => c.endorsements.includes(e));
    if (hits.length) {
      score += hits.length * 4;
      reasons.push(`Endorsements: ${hits.join(", ")}`);
    }
  }
  if (filters.availability?.includes(c.availability)) {
    score += 5;
    reasons.push("Available now");
  }
  if (filters.bilingual && c.languages.length > 1) {
    score += 6;
    reasons.push("Bilingual");
  }
  if (filters.minYears && c.yearsExperience >= filters.minYears) {
    score += 4;
    reasons.push(`${c.yearsExperience}+ years`);
  }
  if (filters.routeHints?.includes("team") && c.headline.toLowerCase().includes("team")) {
    score += 4;
    reasons.push("Team driver");
  }
  if (filters.routeHints?.includes("local") && c.preferredRoutes.some((r) => /local/i.test(r))) {
    score += 3;
    reasons.push("Local preference");
  }

  // Ranking dimensions
  score += Math.min(8, c.yearsExperience);
  score += Math.round(c.rating * 2);
  score += c.verificationBadges.length;
  score += Math.max(0, 6 - Math.min(c.responseHours, 6));
  if (c.backgroundStatus === "clear") score += 3;
  if (job && c.preferredEquipment.some((e) => job.equipment.includes(e))) {
    score += 5;
    reasons.push("Job equipment match");
  }

  if (!reasons.length) reasons.push("Overall profile strength");

  return {
    ...c,
    compatibility: Math.min(99, Math.round(score)),
    rankReasons: reasons.slice(0, 4),
  };
}

export function rankCandidatesForRecruiting(
  chipIds: string[],
  jobId?: string,
  tenantId?: string,
): RankedCandidate[] {
  const chips = AI_RECRUIT_CHIPS.filter((c) => chipIds.includes(c.id));
  const merged: AiRecruitChip["filters"] = {};
  for (const chip of chips) {
    merged.roles = [...(merged.roles ?? []), ...(chip.filters.roles ?? [])];
    merged.equipment = [...(merged.equipment ?? []), ...(chip.filters.equipment ?? [])];
    merged.endorsements = [
      ...(merged.endorsements ?? []),
      ...(chip.filters.endorsements ?? []),
    ];
    merged.availability = [
      ...(merged.availability ?? []),
      ...(chip.filters.availability ?? []),
    ];
    merged.routeHints = [...(merged.routeHints ?? []), ...(chip.filters.routeHints ?? [])];
    if (chip.filters.bilingual) merged.bilingual = true;
    if (chip.filters.minYears)
      merged.minYears = Math.max(merged.minYears ?? 0, chip.filters.minYears);
    if (chip.filters.radiusMiles) merged.radiusMiles = chip.filters.radiusMiles;
  }

  const job = jobId ? getJobById(jobId) : null;
  let candidates = listByTenant(candidateStore, tenantId);

  if (merged.roles?.length) {
    candidates = candidates.filter((c) => merged.roles!.some((r) => c.roles.includes(r)));
  }
  if (merged.equipment?.length) {
    candidates = candidates.filter((c) =>
      merged.equipment!.some((e) => c.preferredEquipment.includes(e)),
    );
  }
  if (merged.endorsements?.length) {
    candidates = candidates.filter((c) =>
      merged.endorsements!.some((e) => c.endorsements.includes(e)),
    );
  }
  if (merged.availability?.length) {
    candidates = candidates.filter((c) => merged.availability!.includes(c.availability));
  }
  if (merged.bilingual) {
    candidates = candidates.filter((c) => c.languages.length > 1);
  }
  if (merged.minYears) {
    candidates = candidates.filter((c) => c.yearsExperience >= merged.minYears!);
  }

  // If filters emptied the list, fall back to all ranked
  if (!candidates.length) {
    candidates = listByTenant(candidateStore, tenantId);
  }

  return candidates
    .map((c) => scoreCandidate(c, merged, job))
    .sort((a, b) => b.compatibility - a.compatibility);
}

export function improveResume(candidateId: string): string {
  const c = getCandidateById(candidateId);
  if (!c) return "Candidate not found.";
  const role = PROFESSIONAL_ROLE_LABELS[c.roles[0] ?? "other"];
  return [
    `Improved resume summary for ${c.firstName} ${c.lastName}`,
    "",
    `${c.firstName} ${c.lastName} — ${role}`,
    `${c.locationCity}, ${c.locationState} · ${c.yearsExperience} years · ${c.languages.join(" / ")}`,
    "",
    "Summary",
    `${c.resumeSummary} Proven reliability with ${c.verificationBadges.length} verification badges and a ${c.rating.toFixed(1)} peer rating.`,
    "",
    "Highlights",
    ...c.skills.slice(0, 6).map((s) => `• ${s}`),
    c.cdlClass ? `• CDL Class ${c.cdlClass}${c.endorsements.length ? ` · Endorsements ${c.endorsements.join(", ")}` : ""}` : "",
    "",
    "Suggested next line",
    `Seeking ${c.preferredEquipment.map((e) => EQUIPMENT_TYPE_LABELS[e]).join(" / ") || role} opportunities with ${c.availability === "immediate" ? "immediate" : "near-term"} availability.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function prepareInterview(candidateId: string, jobId?: string): string {
  const c = getCandidateById(candidateId);
  if (!c) return "Candidate not found.";
  const job = jobId ? getJobById(jobId) : null;
  return [
    `Interview prep — ${c.firstName} ${c.lastName}`,
    job ? `Role: ${job.title}` : "",
    "",
    "Ask about",
    `1. ${c.workHistory[0]?.summary ?? "Recent responsibilities"}`,
    `2. Preferred home time / schedule (${c.availability.replace("_", " ")})`,
    `3. Equipment comfort: ${c.preferredEquipment.map((e) => EQUIPMENT_TYPE_LABELS[e]).join(", ") || "N/A"}`,
    c.medicalCardExpiresAt
      ? `4. Medical card renewal (expires ${c.medicalCardExpiresAt})`
      : "4. Compliance documents readiness",
    "",
    "Alph notes",
    c.aiSummary,
    "",
    "Watch-outs",
    ...c.aiSuggestions.map((s) => `• ${s}`),
  ]
    .filter(Boolean)
    .join("\n");
}

export function createJobPostingDraft(role: ProfessionalRole, companyId?: string): string {
  const company = companyId ? getCompanyById(companyId) : listByTenant(jobStore)[0]
    ? getCompanyById(listByTenant(jobStore)[0].companyId)
    : null;
  const label = PROFESSIONAL_ROLE_LABELS[role];
  return [
    `Job posting draft — ${label}`,
    company ? `Company: ${company.name}` : "",
    "",
    `Title: ${label}${company?.hqCity ? ` — ${company.hqCity}, ${company.hqState}` : ""}`,
    "",
    "Description",
    `We're hiring a ${label.toLowerCase()} who values safety, clear communication, and on-time performance. ${company?.tagline ?? "Join a team that treats professionals with respect."}`,
    "",
    "Requirements",
    "• Relevant experience and clean compliance record",
    "• Clear communication and reliable response times",
    "• Pass background and drug screen as applicable",
    "",
    "Benefits",
    ...(company?.benefits.slice(0, 4).map((b) => `• ${b}`) ?? [
      "• Competitive pay",
      "• Supportive ops team",
    ]),
    "",
    "Next step: review pay band, home time, and hiring radius — then publish from Jobs.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function rankApplicantsBlurb(jobId: string): string {
  const job = getJobById(jobId);
  if (!job) return "Job not found.";
  const ranked = rankCandidatesForRecruiting(
    job.equipment.includes("reefer")
      ? ["reefer"]
      : job.equipment.includes("flatbed")
        ? ["flatbed"]
        : job.role === "dispatcher"
          ? ["dispatchers"]
          : [],
    jobId,
  ).slice(0, 5);
  return [
    `Applicant ranking — ${job.title}`,
    `Pay: ${formatPay(job)} · Region: ${job.region}`,
    "",
    ...ranked.map(
      (c, i) =>
        `${i + 1}. ${c.firstName} ${c.lastName} — AI Match ${c.compatibility} · ${c.rankReasons.join("; ")}`,
    ),
    "",
    "One-click next steps: View profile · Invite · Message · Schedule interview.",
  ].join("\n");
}

export function generateOfferLetter(candidateId: string, jobId: string): string {
  const c = getCandidateById(candidateId);
  const job = getJobById(jobId);
  if (!c || !job) return "Missing candidate or job.";
  const company = getCompanyById(job.companyId);
  return [
    "Offer letter draft",
    "",
    `Dear ${c.firstName},`,
    "",
    `We are pleased to offer you the position of ${job.title} with ${company?.name ?? "our company"}.`,
    "",
    `Compensation: ${formatPay(job)}${job.bonus ? ` · Bonus: ${job.bonus}` : ""}`,
    `Employment type: ${job.employmentType.replace("_", " ")}`,
    `Home time: ${job.homeTime}`,
    `Start: mutually agreed date after completed onboarding`,
    "",
    "This offer is contingent on successful completion of required background, drug screen, and document verification steps.",
    "",
    "Please review and e-sign in Onboarding.",
    "",
    `Sincerely,`,
    `${company?.name ?? "Hiring Team"}`,
  ].join("\n");
}

export function recommendSalary(role: ProfessionalRole): string {
  const benches: Record<string, string> = {
    cdl_driver: "Market CPM mid: $0.68/mi · Local hourly mid: $26/hr · Adjust for equipment & home time.",
    dispatcher: "Salary mid: $72,000 · Top quartile $85–95k with bilingual + broker skills.",
    safety_manager: "Salary mid: $105,000 · Remote premium smaller; audit experience adds $10–15k.",
    diesel_mechanic: "Hourly mid: $36/hr · ASE Master + reefer certs push toward $40–45.",
    payroll: "Salary mid: $68,000 · IFTA ownership adds $5–8k.",
    owner_operator: "Settlement mid: 78–85% of linehaul for teams with trailer programs.",
  };
  return (
    benches[role] ??
    `Benchmark for ${PROFESSIONAL_ROLE_LABELS[role]}: use Analytics → Salary benchmarks and adjust for region.`
  );
}
