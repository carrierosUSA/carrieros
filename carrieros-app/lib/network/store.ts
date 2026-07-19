import {
  NETWORK_OWNER_MEMBER_ID,
  seedBusinessPassports,
  seedCommunityPosts,
  seedConnections,
  seedExperiences,
  seedMembers,
  seedNetworkAudit,
  seedProfessionalPassports,
  seedRecommendations,
  seedReputationSummaries,
  seedReviews,
  seedTrustStatus,
  seedTrustTimeline,
} from "@/lib/network/seed";
import type {
  CommunityPost,
  CommunityPostKind,
  ConnectionStatus,
  ExperienceVerificationStatus,
  NetworkConnection,
  NetworkMember,
  VerifiedExperience,
} from "@/lib/network/types";

let membersStore = [...seedMembers];
let businessStore = [...seedBusinessPassports];
let professionalStore = [...seedProfessionalPassports];
let experiencesStore = [...seedExperiences];
let reviewsStore = [...seedReviews];
let reputationStore = [...seedReputationSummaries];
let connectionsStore = [...seedConnections];
let recommendationsStore = [...seedRecommendations];
let communityStore = [...seedCommunityPosts];
let trustStatusStore = [...seedTrustStatus];
let trustTimelineStore = [...seedTrustTimeline];
let auditStore = [...seedNetworkAudit];

export function listMembers(): NetworkMember[] {
  return membersStore;
}

export function getMember(id: string): NetworkMember | undefined {
  return membersStore.find((m) => m.id === id);
}

export function getMemberByTranspoId(transpoId: string): NetworkMember | undefined {
  const decoded = decodeURIComponent(transpoId);
  return membersStore.find(
    (m) => m.transpoId === transpoId || m.transpoId === decoded,
  );
}

export function getOwnerMember(): NetworkMember {
  const owner = getMember(NETWORK_OWNER_MEMBER_ID);
  if (!owner) throw new Error("Network owner seed missing");
  return owner;
}

export function listBusinessPassports() {
  return businessStore;
}

export function getBusinessPassport(memberId: string) {
  return businessStore.find((b) => b.memberId === memberId);
}

export function listProfessionalPassports() {
  return professionalStore;
}

export function getProfessionalPassport(memberId: string) {
  return professionalStore.find((p) => p.memberId === memberId);
}

export function listExperiences(): VerifiedExperience[] {
  return experiencesStore;
}

export function listExperiencesFor(memberId: string): VerifiedExperience[] {
  return experiencesStore.filter((e) => e.subjectMemberId === memberId);
}

export function updateExperienceStatus(
  id: string,
  status: ExperienceVerificationStatus,
): VerifiedExperience | undefined {
  const idx = experiencesStore.findIndex((e) => e.id === id);
  if (idx < 0) return undefined;
  const next: VerifiedExperience = {
    ...experiencesStore[idx],
    status,
    confirmedAt:
      status === "confirmed"
        ? new Date().toISOString()
        : experiencesStore[idx].confirmedAt,
  };
  experiencesStore = [
    ...experiencesStore.slice(0, idx),
    next,
    ...experiencesStore.slice(idx + 1),
  ];
  auditStore = [
    {
      id: `na-${Date.now()}`,
      at: new Date().toISOString(),
      actor: "You",
      action: "experience_status",
      summary: `Experience ${id} set to ${status}.`,
    },
    ...auditStore,
  ];
  return next;
}

export function requestExperienceVerification(input: {
  subjectMemberId: string;
  verifierMemberId: string;
  verifierName: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
}): VerifiedExperience {
  const row: VerifiedExperience = {
    id: `ex-${Date.now()}`,
    ...input,
    status: "requested",
    requestedAt: new Date().toISOString(),
  };
  experiencesStore = [row, ...experiencesStore];
  return row;
}

export function listReviews() {
  return reviewsStore;
}

export function listReviewsFor(memberId: string) {
  return reviewsStore.filter((r) => r.subjectMemberId === memberId);
}

export function getReputationSummary(memberId: string) {
  return reputationStore.find((r) => r.memberId === memberId);
}

export function listConnections(): NetworkConnection[] {
  return connectionsStore;
}

export function listConnectionsFor(memberId: string): NetworkConnection[] {
  return connectionsStore.filter(
    (c) => c.fromMemberId === memberId || c.toMemberId === memberId,
  );
}

export function respondToConnection(
  id: string,
  status: Extract<ConnectionStatus, "accepted" | "declined" | "revoked">,
): NetworkConnection | undefined {
  const idx = connectionsStore.findIndex((c) => c.id === id);
  if (idx < 0) return undefined;
  const next: NetworkConnection = {
    ...connectionsStore[idx],
    status,
    respondedAt: new Date().toISOString(),
    consentGranted: status === "accepted",
  };
  connectionsStore = [
    ...connectionsStore.slice(0, idx),
    next,
    ...connectionsStore.slice(idx + 1),
  ];
  return next;
}

export function listRecommendations() {
  return recommendationsStore;
}

export function listRecommendationsFor(memberId: string) {
  return recommendationsStore.filter((r) => r.subjectMemberId === memberId);
}

export function listCommunityPosts(): CommunityPost[] {
  return communityStore;
}

export function createCommunityPost(input: {
  authorMemberId: string;
  authorName: string;
  authorCategory: CommunityPost["authorCategory"];
  kind: CommunityPostKind;
  title: string;
  body: string;
}): CommunityPost {
  const post: CommunityPost = {
    id: `cp-${Date.now()}`,
    ...input,
    createdAt: new Date().toISOString(),
    followerOnly: false,
    likes: 0,
  };
  communityStore = [post, ...communityStore];
  return post;
}

export function listTrustStatus() {
  return trustStatusStore;
}

export function listTrustTimeline() {
  return trustTimelineStore;
}

export function listNetworkAudit() {
  return auditStore;
}

export function hasVerifiedInteraction(
  authorMemberId: string,
  subjectMemberId: string,
): boolean {
  return connectionsStore.some(
    (c) =>
      c.status === "accepted" &&
      ((c.fromMemberId === authorMemberId && c.toMemberId === subjectMemberId) ||
        (c.fromMemberId === subjectMemberId && c.toMemberId === authorMemberId)),
  );
}
