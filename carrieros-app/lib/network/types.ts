/** Transpo Verified Network™ — permanent digital identity for logistics professionals & companies. */

import type { WalletBadgeId } from "@/lib/wallet/types";

export type NetworkMemberKind = "person" | "company";

export type NetworkCategory =
  | "carrier"
  | "owner_operator"
  | "driver"
  | "broker"
  | "shipper"
  | "dispatch_company"
  | "freight_forwarder"
  | "warehouse"
  | "mechanic"
  | "mobile_mechanic"
  | "truck_dealer"
  | "trailer_dealer"
  | "parts"
  | "insurance"
  | "factoring"
  | "fuel_card"
  | "bank"
  | "compliance"
  | "safety_consultant"
  | "recruiter"
  | "dispatcher"
  | "fleet_manager"
  | "accountant"
  | "payroll"
  | "law"
  | "software"
  | "eld"
  | "telematics"
  | "government"
  | "training_cdl"
  | "association"
  | "safety_manager";

export const NETWORK_CATEGORY_LABELS: Record<NetworkCategory, string> = {
  carrier: "Carrier",
  owner_operator: "Owner Operator",
  driver: "Driver",
  broker: "Broker",
  shipper: "Shipper",
  dispatch_company: "Dispatch Company",
  freight_forwarder: "Freight Forwarder",
  warehouse: "Warehouse",
  mechanic: "Mechanic",
  mobile_mechanic: "Mobile Mechanic",
  truck_dealer: "Truck Dealer",
  trailer_dealer: "Trailer Dealer",
  parts: "Parts Supplier",
  insurance: "Insurance",
  factoring: "Factoring",
  fuel_card: "Fuel Card",
  bank: "Bank / Lending",
  compliance: "Compliance",
  safety_consultant: "Safety Consultant",
  recruiter: "Recruiter",
  dispatcher: "Dispatcher",
  fleet_manager: "Fleet Manager",
  accountant: "Accountant",
  payroll: "Payroll",
  law: "Law / Legal",
  software: "Software",
  eld: "ELD Provider",
  telematics: "Telematics",
  government: "Government",
  training_cdl: "Training / CDL School",
  association: "Association",
  safety_manager: "Safety Manager",
};

export type VerificationLevel = "unverified" | "basic" | "verified" | "premium";

export const VERIFICATION_LEVEL_LABELS: Record<VerificationLevel, string> = {
  unverified: "Unverified",
  basic: "Basic",
  verified: "Verified",
  premium: "Premium Verified",
};

export type ReputationDimension =
  | "safety"
  | "professionalism"
  | "communication"
  | "reliability"
  | "on_time"
  | "compliance"
  | "customer_service"
  | "leadership"
  | "technical_skills"
  | "overall";

export const REPUTATION_DIMENSION_LABELS: Record<ReputationDimension, string> = {
  safety: "Safety",
  professionalism: "Professionalism",
  communication: "Communication",
  reliability: "Reliability",
  on_time: "On-Time",
  compliance: "Compliance",
  customer_service: "Customer Service",
  leadership: "Leadership",
  technical_skills: "Technical Skills",
  overall: "Overall Recommendation",
};

export type ConnectionType =
  | "carrier_driver"
  | "broker_carrier"
  | "carrier_mechanic"
  | "carrier_insurance"
  | "carrier_fuel"
  | "carrier_dispatcher"
  | "dealer_fleet"
  | "tech_carrier"
  | "recruiter_driver"
  | "shipper_carrier"
  | "factoring_carrier"
  | "training_driver"
  | "colleague"
  | "vendor_client";

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  carrier_driver: "Carrier ↔ Driver",
  broker_carrier: "Broker ↔ Carrier",
  carrier_mechanic: "Carrier ↔ Mechanic",
  carrier_insurance: "Carrier ↔ Insurance",
  carrier_fuel: "Carrier ↔ Fuel",
  carrier_dispatcher: "Carrier ↔ Dispatcher",
  dealer_fleet: "Dealer ↔ Fleet",
  tech_carrier: "Tech ↔ Carrier",
  recruiter_driver: "Recruiter ↔ Driver",
  shipper_carrier: "Shipper ↔ Carrier",
  factoring_carrier: "Factoring ↔ Carrier",
  training_driver: "Training ↔ Driver",
  colleague: "Colleague",
  vendor_client: "Vendor ↔ Client",
};

export type ConnectionStatus = "pending" | "accepted" | "revoked" | "declined";

export type ExperienceVerificationStatus =
  | "requested"
  | "confirmed"
  | "disputed"
  | "withdrawn";

export type CommunityPostKind =
  | "update"
  | "news"
  | "hiring"
  | "promotion"
  | "training"
  | "webinar"
  | "education";

export type TrustStatusItem = {
  id: string;
  label: string;
  status: "healthy" | "attention" | "critical" | "unknown";
  detail: string;
  href?: string;
};

export type NetworkMember = {
  id: string;
  transpoId: string;
  kind: NetworkMemberKind;
  category: NetworkCategory;
  displayName: string;
  headline: string;
  initials: string;
  city: string;
  state: string;
  country: string;
  languages: string[];
  specializations: string[];
  equipment: string[];
  trailerTypes: string[];
  yearsExperience: number;
  fleetSize?: number;
  verification: VerificationLevel;
  trustScore: number;
  availability?: "available" | "limited" | "unavailable";
  industry: string;
  services: string[];
  badges: WalletBadgeId[];
  /** Public profile is consent-gated. */
  publicProfileConsent: boolean;
  walletLinked: boolean;
  createdAt: string;
};

export type BusinessPassport = {
  memberId: string;
  legalName: string;
  dba?: string;
  dotNumber?: string;
  mcNumber?: string;
  fleetSize: number;
  yearsInBusiness: number;
  safetyRating?: string;
  insuranceSummary: string;
  authorityStatus: string;
  certifications: string[];
  licenses: string[];
  coverageAreas: string[];
  services: string[];
  locations: string[];
  photoPlaceholders: string[];
  videoPlaceholders: string[];
  awards: { id: string; title: string; year: string; issuer: string }[];
  completedProjects: { id: string; title: string; year: string; summary: string }[];
  timeline: {
    id: string;
    date: string;
    title: string;
    detail: string;
    verified?: boolean;
  }[];
  trustScore: number;
  partnerReviewCount: number;
};

export type ProfessionalPassport = {
  memberId: string;
  fullName: string;
  headline: string;
  yearsExperience: number;
  skills: string[];
  equipment: string[];
  trailerTypes: string[];
  routes: string[];
  languages: string[];
  education: string[];
  training: string[];
  certifications: string[];
  awards: { id: string; title: string; year: string; issuer: string }[];
  employment: {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    verified: boolean;
  }[];
  timeline: {
    id: string;
    date: string;
    title: string;
    detail: string;
    kind: string;
    verified?: boolean;
  }[];
  milestones: string[];
  trustScore: number;
  /** When true, passport mirrors Professional Wallet Career Passport seed. */
  walletPassportLinked: boolean;
};

export type VerifiedExperience = {
  id: string;
  subjectMemberId: string;
  verifierMemberId: string;
  verifierName: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
  safetyNotes?: string;
  equipment?: string[];
  miles?: number;
  training?: string[];
  projects?: string[];
  achievements?: string[];
  referenceNote?: string;
  status: ExperienceVerificationStatus;
  requestedAt: string;
  confirmedAt?: string;
};

export type ReputationScores = Record<ReputationDimension, number>;

export type ReputationReview = {
  id: string;
  subjectMemberId: string;
  authorMemberId: string;
  authorName: string;
  authorRole: string;
  /** Reviews require a verified interaction / accepted connection. */
  verifiedInteractionId: string;
  scores: ReputationScores;
  body: string;
  createdAt: string;
};

export type ReputationSummary = {
  memberId: string;
  averages: ReputationScores;
  reviewCount: number;
  alphSummary: string;
  disclaimer: string;
};

export type NetworkConnection = {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  type: ConnectionType;
  status: ConnectionStatus;
  message?: string;
  requestedAt: string;
  respondedAt?: string;
  consentGranted: boolean;
};

export type NetworkRecommendation = {
  id: string;
  subjectMemberId: string;
  authorMemberId: string;
  authorName: string;
  authorRole: string;
  body: string;
  attributed: boolean;
  verified: boolean;
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  authorMemberId: string;
  authorName: string;
  authorCategory: NetworkCategory;
  kind: CommunityPostKind;
  title: string;
  body: string;
  createdAt: string;
  followerOnly: boolean;
  likes: number;
};

export type TrustTimelineEvent = {
  id: string;
  at: string;
  title: string;
  detail: string;
  kind: "verification" | "document" | "audit" | "consent" | "safety";
};

export type NetworkAuditEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  summary: string;
};

export type DirectoryFilters = {
  query?: string;
  category?: NetworkCategory | "all";
  state?: string;
  verification?: VerificationLevel | "all";
  language?: string;
  specialization?: string;
  minFleetSize?: number;
  equipment?: string;
  minTrustScore?: number;
  availability?: "available" | "limited" | "unavailable" | "all";
  kind?: NetworkMemberKind | "all";
};

export const REPUTATION_DISCLAIMER =
  "Reputation and Trust Score are decision-support only. They must never auto-approve or auto-reject people or companies. Only reviews from verified interactions appear here.";

export const NETWORK_IDENTITY_DISCLAIMER =
  "Your Transpo ID is a lifetime professional identity. Sharing is consent-based. Access is controlled and audited; sensitive records stay encrypted at rest when stored in Professional Wallet.";
