import {
  seedActivity,
  seedAuditLog,
  seedBadges,
  seedDocuments,
  seedEnterpriseRequests,
  seedIdentity,
  seedNotifications,
  seedPassport,
  seedPrivacy,
  seedShareLinks,
  seedTrustScore,
  WALLET_OWNER_ID,
} from "@/lib/wallet/seed";
import type {
  ConsentFlag,
  EnterpriseRequest,
  EnterpriseRequestStatus,
  ShareScope,
  WalletActivityItem,
  WalletAuditAction,
  WalletAuditEntry,
  WalletBadge,
  WalletDocument,
  WalletDocumentCategory,
  WalletNotification,
  WalletPrivacyControls,
  WalletShareLink,
  WalletTrustScore,
} from "@/lib/wallet/types";
import {
  RESTRICTED_CATEGORIES,
  SHARE_SCOPE_CATEGORIES,
  TRUST_SCORE_DISCLAIMER,
} from "@/lib/wallet/types";

const documents: WalletDocument[] = structuredClone(seedDocuments);
const shareLinks: WalletShareLink[] = structuredClone(seedShareLinks);
const badges: WalletBadge[] = structuredClone(seedBadges);
const notifications: WalletNotification[] = structuredClone(seedNotifications);
const enterpriseRequests: EnterpriseRequest[] =
  structuredClone(seedEnterpriseRequests);
const auditLog: WalletAuditEntry[] = structuredClone(seedAuditLog);
const activity: WalletActivityItem[] = structuredClone(seedActivity);
let privacy: WalletPrivacyControls = structuredClone(seedPrivacy);
let trustScore: WalletTrustScore = structuredClone(seedTrustScore);

function nowIso() {
  return new Date().toISOString();
}

function pushAudit(
  action: WalletAuditAction,
  summary: string,
  entityType?: string,
  entityId?: string,
  actor = "Jordan Reyes",
) {
  auditLog.unshift({
    id: `wa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: nowIso(),
    actor,
    action,
    summary,
    entityType,
    entityId,
  });
}

function pushActivity(summary: string, href?: string) {
  activity.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: nowIso(),
    summary,
    href,
  });
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const exp = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00.000Z`);
  const now = new Date("2026-07-17T12:00:00.000Z");
  return (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
}

export function getWalletIdentity() {
  return seedIdentity;
}

export function getCareerPassport() {
  return seedPassport;
}

export function listWalletDocuments(): WalletDocument[] {
  return [...documents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getWalletDocument(id: string): WalletDocument | undefined {
  return documents.find((d) => d.id === id);
}

export function getWalletCompleteness(): number {
  const required: WalletDocumentCategory[] = [
    "identity",
    "cdl",
    "medical",
    "employment_history",
    "safety_training",
  ];
  const have = required.filter((cat) =>
    documents.some(
      (d) =>
        d.category === cat &&
        (d.status === "valid" || d.status === "expiring") &&
        d.verified,
    ),
  ).length;
  const endorsementBonus = documents.some(
    (d) => d.category === "endorsement" && d.status === "valid",
  )
    ? 1
    : 0;
  const total = required.length + 1;
  return Math.round(((have + endorsementBonus) / total) * 100);
}

export function listExpiringDocuments(withinDays = 60): WalletDocument[] {
  return documents.filter((d) => {
    const days = daysUntil(d.expiresAt);
    if (days == null) return d.status === "expiring" || d.status === "expired";
    return days <= withinDays;
  });
}

export function listWalletBadges(): WalletBadge[] {
  return [...badges];
}

export function getTrustScore(): WalletTrustScore {
  return {
    ...trustScore,
    disclaimer: TRUST_SCORE_DISCLAIMER,
  };
}

export function listShareLinks(): WalletShareLink[] {
  return [...shareLinks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getActiveShareCount(): number {
  const now = new Date("2026-07-17T12:00:00.000Z");
  return shareLinks.filter(
    (s) => !s.revokedAt && new Date(s.expiresAt) > now,
  ).length;
}

function categoryAllowedByScopes(
  category: WalletDocumentCategory,
  scopes: ShareScope[],
): boolean {
  if (scopes.includes("entire_wallet") || scopes.includes("temporary")) {
    return true;
  }
  for (const scope of scopes) {
    const cats = SHARE_SCOPE_CATEGORIES[scope];
    if (cats === "all") return true;
    if (cats.includes(category)) return true;
  }
  return false;
}

function consentAllowsCategory(category: WalletDocumentCategory): boolean {
  if (!RESTRICTED_CATEGORIES.includes(category)) return true;
  if (category === "violation_history") return privacy.consents.share_violations;
  if (category === "drug_test") return privacy.consents.share_drug_tests;
  if (category === "background_mvr") return privacy.consents.share_background_mvr;
  return false;
}

export type SharedWalletView =
  | {
      ok: true;
      share: WalletShareLink;
      identity: { fullName: string; headline: string; photoInitials: string };
      documents: WalletDocument[];
      trustScore?: number;
      expired: false;
      revoked: false;
    }
  | {
      ok: false;
      reason: "not_found" | "expired" | "revoked";
      message: string;
    };

export function resolveShareToken(token: string): SharedWalletView {
  const share = shareLinks.find((s) => s.token === token);
  if (!share) {
    return {
      ok: false,
      reason: "not_found",
      message: "This share link is invalid or was never issued.",
    };
  }
  if (share.revokedAt) {
    pushAudit(
      "access_denied",
      `Blocked access to revoked share ${share.label}`,
      "share",
      share.id,
      "Share viewer",
    );
    return {
      ok: false,
      reason: "revoked",
      message: "This share link was revoked by the wallet owner.",
    };
  }
  const now = new Date("2026-07-17T12:00:00.000Z");
  if (new Date(share.expiresAt) <= now) {
    pushAudit(
      "access_denied",
      `Blocked access to expired share ${share.label}`,
      "share",
      share.id,
      "Share viewer",
    );
    return {
      ok: false,
      reason: "expired",
      message: "This share link has expired.",
    };
  }

  share.viewCount += 1;
  pushAudit(
    "viewed",
    `Shared view opened: ${share.label}`,
    "share",
    share.id,
    "Share viewer",
  );

  const docs = documents.filter((d) => {
    if (!categoryAllowedByScopes(d.category, share.scopes)) return false;
    if (!consentAllowsCategory(d.category)) return false;
    if (d.requiresConsent && !d.consentGranted) return false;
    return true;
  });

  return {
    ok: true,
    share,
    identity: {
      fullName: seedIdentity.fullName,
      headline: seedIdentity.headline,
      photoInitials: seedIdentity.photoInitials,
    },
    documents: docs,
    trustScore: privacy.showTrustScorePublicly ? trustScore.score : undefined,
    expired: false,
    revoked: false,
  };
}

export function createShareLink(input: {
  label: string;
  scopes: ShareScope[];
  expiresInDays: number;
  recipientHint?: string;
}): WalletShareLink {
  const createdAt = nowIso();
  const expires = new Date("2026-07-17T12:00:00.000Z");
  expires.setDate(expires.getDate() + input.expiresInDays);
  const link: WalletShareLink = {
    id: `ws-${Date.now()}`,
    token: `share-${Math.random().toString(36).slice(2, 10)}`,
    label: input.label,
    scopes: input.scopes,
    createdAt,
    expiresAt: expires.toISOString(),
    viewCount: 0,
    recipientHint: input.recipientHint,
  };
  shareLinks.unshift(link);
  pushAudit("shared", `Created share link “${link.label}”`, "share", link.id);
  pushActivity(`Created share link “${link.label}”`, "/wallet/sharing");
  return link;
}

export function revokeShareLink(id: string): WalletShareLink | null {
  const link = shareLinks.find((s) => s.id === id);
  if (!link || link.revokedAt) return link ?? null;
  link.revokedAt = nowIso();
  pushAudit("revoked_share", `Revoked share “${link.label}”`, "share", link.id);
  pushActivity(`Revoked share “${link.label}”`, "/wallet/sharing");
  return link;
}

export function revokeAllShareLinks(): number {
  let count = 0;
  for (const link of shareLinks) {
    if (!link.revokedAt) {
      link.revokedAt = nowIso();
      count += 1;
    }
  }
  if (count > 0) {
    pushAudit("revoked_share", `Revoked all active share links (${count})`);
    pushActivity("Revoked all active share links", "/wallet/security");
  }
  return count;
}

export function listNotifications(): WalletNotification[] {
  return [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markNotificationRead(id: string): WalletNotification | null {
  const n = notifications.find((x) => x.id === id);
  if (!n) return null;
  n.read = true;
  pushAudit("notification_read", `Marked notification read: ${n.title}`, "notification", id);
  return n;
}

export function markAllNotificationsRead(): number {
  let count = 0;
  for (const n of notifications) {
    if (!n.read) {
      n.read = true;
      count += 1;
    }
  }
  return count;
}

export function listEnterpriseRequests(): EnterpriseRequest[] {
  return [...enterpriseRequests].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function respondEnterpriseRequest(
  id: string,
  status: Extract<EnterpriseRequestStatus, "approved" | "denied" | "fulfilled">,
): EnterpriseRequest | null {
  const req = enterpriseRequests.find((r) => r.id === id);
  if (!req) return null;

  if (status === "approved" || status === "fulfilled") {
    const needsRestricted = req.documentCategories.some((c) =>
      RESTRICTED_CATEGORIES.includes(c),
    );
    if (needsRestricted) {
      const ok = req.documentCategories.every((c) => consentAllowsCategory(c));
      if (!ok) {
        pushAudit(
          "access_denied",
          `Blocked approving ${req.companyName} request — missing consent for restricted docs`,
          "enterprise_request",
          id,
        );
        return null;
      }
    }
  }

  req.status = status;
  const action: WalletAuditAction =
    status === "denied" ? "enterprise_denied" : "enterprise_approved";
  pushAudit(
    action,
    `${status === "denied" ? "Denied" : "Approved"} request from ${req.companyName}`,
    "enterprise_request",
    id,
  );
  pushActivity(
    `${status === "denied" ? "Denied" : "Approved"} document request from ${req.companyName}`,
    "/wallet/enterprise",
  );
  return req;
}

export function createEnterpriseRequest(input: {
  companyName: string;
  requestedBy: string;
  documentCategories: WalletDocumentCategory[];
  message: string;
  requiredCerts?: string[];
}): EnterpriseRequest | null {
  if (!privacy.allowEnterpriseRequests || !privacy.consents.enterprise_requests) {
    pushAudit(
      "access_denied",
      `Blocked enterprise request from ${input.companyName} — privacy controls`,
      "enterprise_request",
    );
    return null;
  }
  const req: EnterpriseRequest = {
    id: `er-${Date.now()}`,
    companyName: input.companyName,
    requestedBy: input.requestedBy,
    documentCategories: input.documentCategories,
    message: input.message,
    status: "pending",
    createdAt: nowIso(),
    dueAt: undefined,
    requiredCerts: input.requiredCerts,
  };
  enterpriseRequests.unshift(req);
  notifications.unshift({
    id: `wn-${Date.now()}`,
    kind: "enterprise_request",
    title: `Document request from ${req.companyName}`,
    body: req.message,
    createdAt: nowIso(),
    read: false,
    href: "/wallet/enterprise",
  });
  pushActivity(`New enterprise request from ${req.companyName}`, "/wallet/enterprise");
  return req;
}

export function listAuditLog(): WalletAuditEntry[] {
  return [...auditLog].sort((a, b) => b.at.localeCompare(a.at));
}

export function getPrivacyControls(): WalletPrivacyControls {
  return structuredClone(privacy);
}

export function updateConsent(flag: ConsentFlag, value: boolean): WalletPrivacyControls {
  privacy = {
    ...privacy,
    consents: { ...privacy.consents, [flag]: value },
  };
  // Mirror onto restricted documents
  for (const doc of documents) {
    if (flag === "share_violations" && doc.category === "violation_history") {
      doc.consentGranted = value;
    }
    if (flag === "share_drug_tests" && doc.category === "drug_test") {
      doc.consentGranted = value;
    }
    if (flag === "share_background_mvr" && doc.category === "background_mvr") {
      doc.consentGranted = value;
    }
    if (flag === "share_medical" && doc.category === "medical") {
      doc.consentGranted = value;
    }
  }
  pushAudit(
    "consent_updated",
    `${value ? "Granted" : "Revoked"} consent: ${flag}`,
    "privacy",
    flag,
  );
  return getPrivacyControls();
}

export function updatePrivacyControls(
  patch: Partial<
    Pick<
      WalletPrivacyControls,
      | "showTrustScorePublicly"
      | "allowEnterpriseRequests"
      | "mfaEnabled"
      | "biometricPreferred"
    >
  >,
): WalletPrivacyControls {
  privacy = { ...privacy, ...patch };
  pushAudit("privacy_updated", "Updated privacy / security preferences", "privacy");
  return getPrivacyControls();
}

export function replaceDocument(
  id: string,
  patch: Partial<Pick<WalletDocument, "title" | "fileName" | "expiresAt" | "status" | "summary">>,
): WalletDocument | null {
  const doc = documents.find((d) => d.id === id);
  if (!doc) return null;
  Object.assign(doc, patch, { updatedAt: nowIso(), status: patch.status ?? "pending_review" });
  pushAudit(
    "document_replaced",
    `Replaced / updated document “${doc.title}”`,
    "document",
    id,
  );
  pushActivity(`Updated document “${doc.title}”`, `/wallet/documents/${id}`);
  return doc;
}

export function addUploadedDocument(input: {
  title: string;
  category: WalletDocumentCategory;
  fileName: string;
  summary: string;
}): WalletDocument {
  const doc: WalletDocument = {
    id: `wd-${Date.now()}`,
    title: input.title,
    category: input.category,
    status: "pending_review",
    sensitivity: "standard",
    summary: input.summary,
    requiresConsent: false,
    consentGranted: true,
    verified: false,
    fileName: input.fileName,
    updatedAt: nowIso(),
  };
  documents.unshift(doc);
  pushAudit("document_uploaded", `Uploaded “${doc.title}”`, "document", doc.id);
  pushActivity(`Uploaded “${doc.title}”`, `/wallet/documents/${doc.id}`);
  return doc;
}

export function listRecentActivity(limit = 8): WalletActivityItem[] {
  return activity.slice(0, limit);
}

export function getWalletDashboard() {
  const completeness = getWalletCompleteness();
  const expiring = listExpiringDocuments(60);
  const activeShares = getActiveShareCount();
  const score = getTrustScore();
  const openEnterprise = enterpriseRequests.filter((r) => r.status === "pending");
  const unread = notifications.filter((n) => !n.read).length;

  return {
    ownerId: WALLET_OWNER_ID,
    identity: seedIdentity,
    completeness,
    expiring,
    activeShares,
    trustScore: score,
    badges: listWalletBadges(),
    openEnterprise,
    unreadNotifications: unread,
    recentActivity: listRecentActivity(),
    alphTips: [
      "Replace your DOT medical before Sep 1 to keep dispatch ready.",
      "Share CDL + medical only — avoid entire-wallet links for hiring.",
      "Turn on background/MVR consent only when a verified employer requests it.",
    ],
  };
}

/** Recalculate a lightweight trust score from current wallet state (demo heuristic). */
export function recalculateTrustScore(): WalletTrustScore {
  const completeness = getWalletCompleteness();
  const verifiedDocs = documents.filter((d) => d.verified).length;
  const expiredCritical = documents.filter(
    (d) =>
      (d.category === "cdl" || d.category === "medical") &&
      (d.status === "expired" || d.status === "revoked"),
  ).length;
  const base = Math.round(
    completeness * 0.35 +
      Math.min(100, verifiedDocs * 3) * 0.35 +
      badges.length * 4 +
      40,
  );
  const score = Math.max(40, Math.min(99, base - expiredCritical * 12));
  trustScore = {
    ...trustScore,
    score,
    updatedAt: nowIso(),
    disclaimer: TRUST_SCORE_DISCLAIMER,
    factors: trustScore.factors.map((f) =>
      f.id === "f-completeness" ? { ...f, score: completeness } : f,
    ),
  };
  return getTrustScore();
}
