/** Workforce / hiring platform types for Transpo.ai */

export const EMPLOYER_COMPANY_TYPES = [
  "carrier",
  "owner_operator",
  "broker",
  "shipper",
  "dispatch_co",
  "warehouse",
  "3pl",
  "mechanic_shop",
  "truck_dealer",
  "trailer_dealer",
  "insurance",
  "factoring",
  "fuel_card",
  "software",
  "accounting",
  "law",
  "compliance",
  "gov_contractor",
  "other",
] as const;
export type EmployerCompanyType = (typeof EMPLOYER_COMPANY_TYPES)[number];

export const EMPLOYER_COMPANY_TYPE_LABELS: Record<EmployerCompanyType, string> = {
  carrier: "Carrier",
  owner_operator: "Owner Operator",
  broker: "Broker",
  shipper: "Shipper",
  dispatch_co: "Dispatch Company",
  warehouse: "Warehouse",
  "3pl": "3PL",
  mechanic_shop: "Mechanic Shop",
  truck_dealer: "Truck Dealer",
  trailer_dealer: "Trailer Dealer",
  insurance: "Insurance",
  factoring: "Factoring",
  fuel_card: "Fuel Card",
  software: "Software",
  accounting: "Accounting",
  law: "Law Firm",
  compliance: "Compliance",
  gov_contractor: "Gov Contractor",
  other: "Other",
};

export const PROFESSIONAL_ROLES = [
  "cdl_driver",
  "owner_operator",
  "dispatcher",
  "broker",
  "safety_manager",
  "fleet_manager",
  "recruiter",
  "diesel_mechanic",
  "trailer_mechanic",
  "reefer_mechanic",
  "roadside_mechanic",
  "office_admin",
  "accounting",
  "payroll",
  "dot_compliance",
  "ifta",
  "sales",
  "warehouse",
  "forklift",
  "logistics",
  "engineer",
  "support",
  "marketing",
  "business_development",
  "intern",
  "student",
  "other",
] as const;
export type ProfessionalRole = (typeof PROFESSIONAL_ROLES)[number];

export const PROFESSIONAL_ROLE_LABELS: Record<ProfessionalRole, string> = {
  cdl_driver: "CDL Driver",
  owner_operator: "Owner Operator",
  dispatcher: "Dispatcher",
  broker: "Broker",
  safety_manager: "Safety Manager",
  fleet_manager: "Fleet Manager",
  recruiter: "Recruiter",
  diesel_mechanic: "Diesel Mechanic",
  trailer_mechanic: "Trailer Mechanic",
  reefer_mechanic: "Reefer Mechanic",
  roadside_mechanic: "Roadside Mechanic",
  office_admin: "Office / Admin",
  accounting: "Accounting",
  payroll: "Payroll",
  dot_compliance: "DOT Compliance",
  ifta: "IFTA",
  sales: "Sales",
  warehouse: "Warehouse",
  forklift: "Forklift Operator",
  logistics: "Logistics",
  engineer: "Engineer",
  support: "Support",
  marketing: "Marketing",
  business_development: "Business Development",
  intern: "Intern",
  student: "Student",
  other: "Other",
};

export const EQUIPMENT_TYPES = [
  "dry_van",
  "reefer",
  "flatbed",
  "step_deck",
  "tanker",
  "hotshot",
  "box_truck",
  "power_only",
  "intermodal",
  "other",
] as const;
export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  dry_van: "Dry Van",
  reefer: "Reefer",
  flatbed: "Flatbed",
  step_deck: "Step Deck",
  tanker: "Tanker",
  hotshot: "Hotshot",
  box_truck: "Box Truck",
  power_only: "Power Only",
  intermodal: "Intermodal",
  other: "Other",
};

export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "lease",
  "temp",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  lease: "Lease Purchase",
  temp: "Temporary",
};

export const APPLICATION_STATUSES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

export const INTERVIEW_TYPES = [
  "meet",
  "zoom",
  "teams",
  "phone",
  "in_person",
] as const;
export type InterviewType = (typeof INTERVIEW_TYPES)[number];

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  meet: "Google Meet",
  zoom: "Zoom",
  teams: "Microsoft Teams",
  phone: "Phone",
  in_person: "In person",
};

export const CHECK_STATUSES = [
  "not_started",
  "in_progress",
  "clear",
  "pending_review",
  "failed",
  "expired",
] as const;
export type CheckStatus = (typeof CHECK_STATUSES)[number];

export const CHECK_STATUS_LABELS: Record<CheckStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  clear: "Clear",
  pending_review: "Pending review",
  failed: "Failed",
  expired: "Expired",
};

export const DOC_STATUSES = ["on_file", "pending", "expired", "missing"] as const;
export type WorkforceDocStatus = (typeof DOC_STATUSES)[number];

export type VerificationBadge =
  | "identity"
  | "cdl"
  | "medical"
  | "background"
  | "drug_screen"
  | "employment"
  | "references";

export const VERIFICATION_BADGE_LABELS: Record<VerificationBadge, string> = {
  identity: "Identity verified",
  cdl: "CDL verified",
  medical: "Medical card verified",
  background: "Background clear",
  drug_screen: "Drug screen clear",
  employment: "Employment verified",
  references: "References checked",
};

export type WorkHistoryEntry = {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  summary: string;
};

export type EducationEntry = {
  id: string;
  school: string;
  degree: string;
  year?: string;
};

export type ReferenceEntry = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email?: string;
};

export type CandidateDocument = {
  id: string;
  name: string;
  category: string;
  status: WorkforceDocStatus;
  uploadedAt?: string;
  expiresAt?: string;
};

export type ProfessionalProfile = {
  tenantId: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl?: string;
  headline: string;
  bio: string;
  locationCity: string;
  locationState: string;
  roles: ProfessionalRole[];
  yearsExperience: number;
  skills: string[];
  licenses: string[];
  cdlClass?: "A" | "B" | "C";
  endorsements: string[];
  medicalCardExpiresAt?: string;
  workHistory: WorkHistoryEntry[];
  education: EducationEntry[];
  trainingCompleted: string[];
  certifications: string[];
  awards: string[];
  references: ReferenceEntry[];
  availability: "immediate" | "2_weeks" | "30_days" | "exploring";
  preferredRoutes: string[];
  preferredStates: string[];
  preferredEquipment: EquipmentType[];
  salaryExpectation?: number;
  cpmExpectation?: number;
  employmentTypes: EmploymentType[];
  remoteOk: boolean;
  portfolioUrl?: string;
  resumeSummary: string;
  documents: CandidateDocument[];
  verificationBadges: VerificationBadge[];
  backgroundStatus: CheckStatus;
  drugScreenStatus: CheckStatus;
  aiSummary: string;
  aiSuggestions: string[];
  matchScore: number;
  rating: number;
  responseHours: number;
  lastActiveAt: string;
  languages: string[];
  willingToRelocate: boolean;
};

export type CompanyReview = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
};

export type CompanyOffice = {
  id: string;
  label: string;
  city: string;
  state: string;
};

export type HiringCompany = {
  tenantId: string;
  id: string;
  name: string;
  type: EmployerCompanyType;
  logoInitials: string;
  tagline: string;
  description: string;
  website?: string;
  phone: string;
  email: string;
  hqCity: string;
  hqState: string;
  fleetSize?: number;
  yearsInBusiness: number;
  dotNumber?: string;
  mcNumber?: string;
  safetyScore: number;
  benefits: string[];
  culture: string[];
  mediaUrls: string[];
  offices: CompanyOffice[];
  equipment: EquipmentType[];
  rating: number;
  reviewCount: number;
  reviews: CompanyReview[];
  hiresLastYear: number;
  openPositions: number;
  verified: boolean;
};

export type JobPosting = {
  tenantId: string;
  id: string;
  companyId: string;
  title: string;
  role: ProfessionalRole;
  description: string;
  requirements: string[];
  benefits: string[];
  equipment: EquipmentType[];
  trailerType?: string;
  payMin?: number;
  payMax?: number;
  payUnit: "salary" | "hourly" | "cpm" | "percent";
  bonus?: string;
  homeTime: string;
  milesPerWeek?: number;
  region: string;
  routeType: "otr" | "regional" | "local" | "dedicated" | "hybrid";
  teamOrSolo: "solo" | "team" | "either";
  experienceYears: number;
  licenseRequired?: string;
  hiringRadiusMiles: number;
  languages: string[];
  schedule: string;
  employmentType: EmploymentType;
  remote: boolean;
  status: "open" | "paused" | "closed" | "draft";
  postedAt: string;
  applicantsCount: number;
  savedCount: number;
};

export type ApplicationNote = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  visibility: "employer" | "candidate" | "internal";
};

export type Application = {
  tenantId: string;
  id: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  matchScore: number;
  coverNote?: string;
  notes: ApplicationNote[];
  source: string;
  recruiter?: string;
};

export type Interview = {
  tenantId: string;
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  type: InterviewType;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl?: string;
  location?: string;
  interviewer: string;
  notes: string;
  score?: number;
  aiSummary?: string;
  status: "scheduled" | "completed" | "canceled" | "no_show";
};

export type OnboardingItem = {
  id: string;
  label: string;
  category: string;
  completed: boolean;
  dueAt?: string;
  required: boolean;
};

export type OnboardingChecklist = {
  tenantId: string;
  id: string;
  applicationId: string;
  candidateId: string;
  companyId: string;
  jobId: string;
  hireName: string;
  startedAt: string;
  progress: number;
  items: OnboardingItem[];
  status: "not_started" | "in_progress" | "complete";
};

export type TrainingCourse = {
  tenantId: string;
  id: string;
  title: string;
  category: string;
  durationHours: number;
  description: string;
  requiredForRoles: ProfessionalRole[];
};

export type TrainingProgress = {
  tenantId: string;
  id: string;
  courseId: string;
  candidateId: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed";
  completedAt?: string;
};

export type CertificationRecord = {
  tenantId: string;
  id: string;
  candidateId: string;
  name: string;
  issuer: string;
  issuedAt: string;
  expiresAt?: string;
  status: "valid" | "expiring" | "expired";
};

export type BackgroundCheck = {
  tenantId: string;
  id: string;
  candidateId: string;
  type: string;
  vendor: string;
  status: CheckStatus;
  orderedAt: string;
  completedAt?: string;
  notes?: string;
};

export type WorkforceDocument = {
  tenantId: string;
  id: string;
  ownerType: "candidate" | "company" | "application";
  ownerId: string;
  name: string;
  category: string;
  status: WorkforceDocStatus;
  uploadedAt?: string;
  expiresAt?: string;
};

export type MessageThread = {
  tenantId: string;
  id: string;
  subject: string;
  candidateId: string;
  companyId: string;
  jobId?: string;
  lastMessageAt: string;
  unread: number;
  preview: string;
};

export type Message = {
  id: string;
  threadId: string;
  sender: "employer" | "candidate";
  senderName: string;
  body: string;
  sentAt: string;
};

export type AuditLogEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
};

export type WorkforceAnalytics = {
  applicationsByWeek: Array<{ label: string; value: number }>;
  avgHiringDays: number;
  acceptanceRate: number;
  retentionRate: number;
  openPositions: number;
  interviewSuccessRate: number;
  sources: Array<{ label: string; value: number }>;
  salaryBenchmarks: Array<{ role: string; low: number; mid: number; high: number }>;
  recruiterPerformance: Array<{
    name: string;
    hires: number;
    avgDays: number;
    acceptance: number;
  }>;
};
