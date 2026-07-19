import {
  NETWORK_OWNER_MEMBER_ID,
  seedBadges,
  seedTrustScore,
} from "@/lib/network/seed";
import {
  getBusinessPassport,
  getOwnerMember,
  getProfessionalPassport,
  getReputationSummary,
  listCommunityPosts,
  listConnectionsFor,
  listExperiencesFor,
  listMembers,
  listRecommendationsFor,
  listReviewsFor,
} from "@/lib/network/store";
import type {
  DirectoryFilters,
  NetworkMember,
  VerificationLevel,
} from "@/lib/network/types";
import {
  NETWORK_CATEGORY_LABELS,
  VERIFICATION_LEVEL_LABELS,
} from "@/lib/network/types";
import { TRANSPO_COLORS } from "@/lib/design-system/colors";
import type { CarrierosSemanticColor } from "@/lib/design-system/colors";

export type NetworkKpi = {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone: CarrierosSemanticColor;
};

export type NetworkDashboardData = {
  owner: NetworkMember;
  trustScore: number;
  trustDisclaimer: string;
  badges: typeof seedBadges;
  connectionsAccepted: number;
  connectionsPending: number;
  pendingExperiences: number;
  reputationSummary?: ReturnType<typeof getReputationSummary>;
  directoryHighlights: NetworkMember[];
  communityUpdates: ReturnType<typeof listCommunityPosts>;
  alphSuggestions: { id: string; label: string; href: string }[];
};

export function getNetworkDashboard(): NetworkDashboardData {
  const owner = getOwnerMember();
  const connections = listConnectionsFor(owner.id);
  const experiences = listExperiencesFor(owner.id);
  const members = listMembers().filter((m) => m.id !== owner.id);

  return {
    owner,
    trustScore: seedTrustScore.score,
    trustDisclaimer: seedTrustScore.disclaimer,
    badges: seedBadges,
    connectionsAccepted: connections.filter((c) => c.status === "accepted").length,
    connectionsPending: connections.filter((c) => c.status === "pending").length,
    pendingExperiences: experiences.filter((e) => e.status === "requested").length,
    reputationSummary: getReputationSummary(owner.id),
    directoryHighlights: [...members]
      .sort((a, b) => b.trustScore - a.trustScore)
      .slice(0, 6),
    communityUpdates: listCommunityPosts().slice(0, 4),
    alphSuggestions: [
      {
        id: "s1",
        label: "Reefer mechanics near San Antonio",
        href: "/network/ai?q=reefer+mechanics+nearby",
      },
      {
        id: "s2",
        label: "Insurance for fleets ~50 trucks",
        href: "/network/ai?q=insurance+for+fleet+size",
      },
      {
        id: "s3",
        label: "Bilingual safety consultants",
        href: "/network/ai?q=bilingual+safety+consultants",
      },
      {
        id: "s4",
        label: "Verified hazmat drivers available",
        href: "/network/ai?q=hazmat+drivers+available",
      },
    ],
  };
}

export function filterDirectory(filters: DirectoryFilters = {}): NetworkMember[] {
  const q = filters.query?.trim().toLowerCase() ?? "";
  return listMembers().filter((m) => {
    if (filters.kind && filters.kind !== "all" && m.kind !== filters.kind) {
      return false;
    }
    if (
      filters.category &&
      filters.category !== "all" &&
      m.category !== filters.category
    ) {
      return false;
    }
    if (filters.state && m.state.toLowerCase() !== filters.state.toLowerCase()) {
      return false;
    }
    if (
      filters.verification &&
      filters.verification !== "all" &&
      m.verification !== filters.verification
    ) {
      return false;
    }
    if (
      filters.language &&
      !m.languages.some((l) => l.toLowerCase().includes(filters.language!.toLowerCase()))
    ) {
      return false;
    }
    if (
      filters.specialization &&
      !m.specializations.some((s) =>
        s.toLowerCase().includes(filters.specialization!.toLowerCase()),
      )
    ) {
      return false;
    }
    if (
      filters.minFleetSize != null &&
      (m.fleetSize ?? 0) < filters.minFleetSize
    ) {
      return false;
    }
    if (
      filters.equipment &&
      ![...m.equipment, ...m.trailerTypes].some((e) =>
        e.toLowerCase().includes(filters.equipment!.toLowerCase()),
      )
    ) {
      return false;
    }
    if (filters.minTrustScore != null && m.trustScore < filters.minTrustScore) {
      return false;
    }
    if (
      filters.availability &&
      filters.availability !== "all" &&
      m.availability !== filters.availability
    ) {
      return false;
    }
    if (!q) return true;
    const hay = [
      m.displayName,
      m.headline,
      m.transpoId,
      m.city,
      m.state,
      m.industry,
      NETWORK_CATEGORY_LABELS[m.category],
      ...m.specializations,
      ...m.services,
      ...m.languages,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function verificationTone(
  level: VerificationLevel,
): CarrierosSemanticColor {
  if (level === "premium" || level === "verified") return "success";
  if (level === "basic") return "info";
  return "disabled";
}

export function statusTone(status: string): CarrierosSemanticColor {
  if (status === "healthy" || status === "accepted" || status === "confirmed") {
    return "success";
  }
  if (
    status === "attention" ||
    status === "pending" ||
    status === "requested" ||
    status === "limited"
  ) {
    return "warning";
  }
  if (
    status === "critical" ||
    status === "revoked" ||
    status === "declined" ||
    status === "disputed"
  ) {
    return "critical";
  }
  if (status === "available") return "success";
  if (status === "unavailable") return "disabled";
  return "info";
}

export function memberHref(member: NetworkMember): string {
  if (member.kind === "company") return `/network/business/${member.id}`;
  return `/network/professionals/${member.id}`;
}

export function publicHref(member: NetworkMember): string {
  return `/network/p/${encodeURIComponent(member.transpoId)}`;
}

export function categoryLabel(category: NetworkMember["category"]): string {
  return NETWORK_CATEGORY_LABELS[category];
}

export function verificationLabel(level: VerificationLevel): string {
  return VERIFICATION_LEVEL_LABELS[level];
}

export function getProfessionalDetail(memberId: string) {
  const member = listMembers().find((m) => m.id === memberId);
  if (!member) return null;
  return {
    member,
    passport: getProfessionalPassport(memberId),
    experiences: listExperiencesFor(memberId),
    reviews: listReviewsFor(memberId),
    recommendations: listRecommendationsFor(memberId),
    reputation: getReputationSummary(memberId),
    isOwner: memberId === NETWORK_OWNER_MEMBER_ID,
  };
}

export function getBusinessDetail(memberId: string) {
  const member = listMembers().find((m) => m.id === memberId);
  if (!member) return null;
  return {
    member,
    passport: getBusinessPassport(memberId),
    reviews: listReviewsFor(memberId),
    recommendations: listRecommendationsFor(memberId),
    reputation: getReputationSummary(memberId),
  };
}

export { TRANSPO_COLORS };
