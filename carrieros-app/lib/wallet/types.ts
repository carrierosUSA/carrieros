/** Digital Professional Wallet / Career Passport types */

export type WalletDocumentStatus =
  | "valid"
  | "expiring"
  | "expired"
  | "pending_review"
  | "revoked";

export type SensitivityTier = "public" | "standard" | "sensitive" | "restricted";

export type WalletDocumentCategory =
  | "identity"
  | "government_id"
  | "drivers_license"
  | "cdl"
  | "medical"
  | "twic"
  | "passport"
  | "visa"
  | "work_auth"
  | "endorsement"
  | "professional_license"
  | "safety_training"
  | "employment_contract"
  | "employment_history"
  | "reference"
  | "recommendation"
  | "performance_review"
  | "safety_award"
  | "violation_history"
  | "drug_test"
  | "background_mvr"
  | "insurance"
  | "business_license"
  | "company_cert"
  | "tax"
  | "emergency_contact"
  | "upload"
  | "photo"
  | "video";

export const WALLET_DOCUMENT_CATEGORY_LABELS: Record<WalletDocumentCategory, string> = {
  identity: "Identity",
  government_id: "Government ID",
  drivers_license: "Driver License",
  cdl: "CDL",
  medical: "Medical",
  twic: "TWIC",
  passport: "Passport",
  visa: "Visa",
  work_auth: "Work Authorization",
  endorsement: "Endorsement",
  professional_license: "Professional License",
  safety_training: "Safety / Training",
  employment_contract: "Employment Contract",
  employment_history: "Employment History",
  reference: "Reference",
  recommendation: "Recommendation Letter",
  performance_review: "Performance Review",
  safety_award: "Safety Award",
  violation_history: "Violation History",
  drug_test: "Drug Test",
  background_mvr: "Background / MVR",
  insurance: "Insurance",
  business_license: "Business License",
  company_cert: "Company Certification",
  tax: "Tax Document",
  emergency_contact: "Emergency Contact",
  upload: "Upload",
  photo: "Photo",
  video: "Video",
};

export const WALLET_DOCUMENT_STATUS_LABELS: Record<WalletDocumentStatus, string> = {
  valid: "Valid",
  expiring: "Expiring soon",
  expired: "Expired",
  pending_review: "Pending review",
  revoked: "Revoked",
};

export type EndorsementType =
  | "hazmat"
  | "tanker"
  | "doubles"
  | "passenger"
  | "school_bus";

export const ENDORSEMENT_LABELS: Record<EndorsementType, string> = {
  hazmat: "Hazmat",
  tanker: "Tanker",
  doubles: "Doubles / Triples",
  passenger: "Passenger",
  school_bus: "School Bus",
};

export type ShareScope =
  | "cdl_only"
  | "medical"
  | "resume"
  | "entire_wallet"
  | "certifications"
  | "employment_history"
  | "references"
  | "temporary"
  | "read_only";

export const SHARE_SCOPE_LABELS: Record<ShareScope, string> = {
  cdl_only: "CDL only",
  medical: "Medical",
  resume: "Resume / Passport summary",
  entire_wallet: "Entire wallet",
  certifications: "Certifications only",
  employment_history: "Employment history",
  references: "References",
  temporary: "Temporary access",
  read_only: "Read-only",
};

/** Categories exposed per share scope (entire_wallet = all). */
export const SHARE_SCOPE_CATEGORIES: Record<ShareScope, WalletDocumentCategory[] | "all"> = {
  cdl_only: ["cdl", "endorsement"],
  medical: ["medical"],
  resume: ["employment_history", "safety_training", "safety_award", "recommendation"],
  entire_wallet: "all",
  certifications: ["safety_training", "professional_license", "company_cert", "twic"],
  employment_history: ["employment_history", "employment_contract", "performance_review"],
  references: ["reference", "recommendation"],
  temporary: "all",
  read_only: "all",
};

export type WalletBadgeId =
  | "verified_driver"
  | "owner_operator"
  | "dispatcher"
  | "broker"
  | "shipper"
  | "recruiter"
  | "mechanic"
  | "technician"
  | "fleet_manager"
  | "safety_manager"
  | "company"
  | "partner"
  | "top_rated"
  | "safe_driver_5yr"
  | "safe_driver_10yr"
  | "million_mile"
  | "elite_carrier"
  | "premium_partner";

export const WALLET_BADGE_LABELS: Record<WalletBadgeId, string> = {
  verified_driver: "Verified Driver",
  owner_operator: "Owner Operator",
  dispatcher: "Dispatcher",
  broker: "Broker",
  shipper: "Shipper",
  recruiter: "Recruiter",
  mechanic: "Mechanic",
  technician: "Technician",
  fleet_manager: "Fleet Manager",
  safety_manager: "Safety Manager",
  company: "Company",
  partner: "Partner",
  top_rated: "Top Rated",
  safe_driver_5yr: "5 Year Safe Driver",
  safe_driver_10yr: "10 Year Safe Driver",
  million_mile: "Million Mile",
  elite_carrier: "Elite Carrier",
  premium_partner: "Premium Partner",
};

export type ConsentFlag =
  | "share_identity"
  | "share_medical"
  | "share_violations"
  | "share_drug_tests"
  | "share_background_mvr"
  | "enterprise_requests"
  | "job_match_alerts";

export const CONSENT_FLAG_LABELS: Record<ConsentFlag, string> = {
  share_identity: "Share identity documents",
  share_medical: "Share medical card",
  share_violations: "Share violation history (authorized viewers only)",
  share_drug_tests: "Share drug test results (permitted parties only)",
  share_background_mvr: "Share background / MVR (explicit consent required)",
  enterprise_requests: "Allow company document requests",
  job_match_alerts: "Job match notifications",
};

/** Categories that require explicit consent before sharing. */
export const RESTRICTED_CATEGORIES: WalletDocumentCategory[] = [
  "violation_history",
  "drug_test",
  "background_mvr",
];

export type WalletIdentity = {
  fullName: string;
  preferredName?: string;
  headline: string;
  photoInitials: string;
  email: string;
  phone: string;
  locationCity: string;
  locationState: string;
  yearsExperience: number;
  languages: string[];
  specialSkills: string[];
  equipmentExperience: string[];
  trailerExperience: string[];
  statesDriven: string[];
  countriesDriven: string[];
};

export type WalletDocument = {
  id: string;
  title: string;
  category: WalletDocumentCategory;
  status: WalletDocumentStatus;
  sensitivity: SensitivityTier;
  issuedAt?: string;
  expiresAt?: string;
  issuer?: string;
  numberMasked?: string;
  endorsement?: EndorsementType;
  summary: string;
  requiresConsent: boolean;
  consentGranted: boolean;
  verified: boolean;
  fileName?: string;
  updatedAt: string;
};

export type PassportTimelineEvent = {
  id: string;
  date: string;
  title: string;
  detail: string;
  kind:
    | "employment"
    | "certification"
    | "award"
    | "training"
    | "milestone"
    | "review";
  verified?: boolean;
};

export type PassportCompany = {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  verified: boolean;
};

export type PassportAward = {
  id: string;
  title: string;
  year: string;
  issuer: string;
};

export type PassportReview = {
  id: string;
  author: string;
  role: string;
  rating: number;
  body: string;
  verified: boolean;
  createdAt: string;
};

export type CareerPassport = {
  identity: WalletIdentity;
  timeline: PassportTimelineEvent[];
  companies: PassportCompany[];
  awards: PassportAward[];
  reviews: PassportReview[];
  trainingHighlights: string[];
  achievements: string[];
};

export type WalletShareLink = {
  id: string;
  token: string;
  label: string;
  scopes: ShareScope[];
  createdAt: string;
  expiresAt: string;
  revokedAt?: string;
  viewCount: number;
  recipientHint?: string;
};

export type WalletBadge = {
  id: WalletBadgeId;
  earnedAt: string;
  verified: boolean;
  description: string;
};

export type TrustScoreFactor = {
  id: string;
  label: string;
  score: number;
  weight: number;
  hint: string;
};

export type WalletTrustScore = {
  score: number;
  factors: TrustScoreFactor[];
  updatedAt: string;
  /** Legal: decision-support only — never auto-reject. */
  disclaimer: string;
};

export type WalletNotificationKind =
  | "doc_expiry"
  | "training_expiry"
  | "medical_expiry"
  | "cdl_expiry"
  | "insurance_expiry"
  | "cert_expiry"
  | "background_expiry"
  | "job_match"
  | "interview"
  | "offer"
  | "reference_request"
  | "enterprise_request";

export type WalletNotification = {
  id: string;
  kind: WalletNotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
};

export type EnterpriseRequestStatus =
  | "pending"
  | "approved"
  | "denied"
  | "fulfilled"
  | "expired";

export type EnterpriseRequest = {
  id: string;
  companyName: string;
  requestedBy: string;
  documentCategories: WalletDocumentCategory[];
  message: string;
  status: EnterpriseRequestStatus;
  createdAt: string;
  dueAt?: string;
  requiredCerts?: string[];
};

export type WalletAuditAction =
  | "viewed"
  | "shared"
  | "revoked_share"
  | "consent_updated"
  | "document_uploaded"
  | "document_replaced"
  | "enterprise_approved"
  | "enterprise_denied"
  | "notification_read"
  | "privacy_updated"
  | "access_denied";

export type WalletAuditEntry = {
  id: string;
  at: string;
  actor: string;
  action: WalletAuditAction;
  summary: string;
  entityType?: string;
  entityId?: string;
};

export type WalletPrivacyControls = {
  consents: Record<ConsentFlag, boolean>;
  showTrustScorePublicly: boolean;
  allowEnterpriseRequests: boolean;
  mfaEnabled: boolean;
  biometricPreferred: boolean;
};

export type WalletActivityItem = {
  id: string;
  at: string;
  summary: string;
  href?: string;
};

export const TRUST_SCORE_DISCLAIMER =
  "Trust Score is decision-support only. It must never be used to automatically reject applicants or drivers. Sensitive records (violations, drug tests, background/MVR) require proper authorization and consent.";
