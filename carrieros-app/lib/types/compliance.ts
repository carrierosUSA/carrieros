import type { TenantEntity } from "@/lib/types/base";

/* ── Compliance status & score ───────────────────────────────────────────── */

export const COMPLIANCE_ITEM_STATUSES = [
  "clear",
  "expiring",
  "expired",
  "due",
  "failed",
  "pending",
] as const;
export type ComplianceItemStatus = (typeof COMPLIANCE_ITEM_STATUSES)[number];

export const COMPLIANCE_ITEM_STATUS_LABELS: Record<ComplianceItemStatus, string> =
  {
    clear: "Clear",
    expiring: "Expiring",
    expired: "Expired",
    due: "Due",
    failed: "Failed",
    pending: "Pending",
  };

export type SafetyScoreTone = "success" | "warning" | "critical";

/* ── Driver compliance ───────────────────────────────────────────────────── */

export const DRIVER_COMPLIANCE_TYPES = [
  "cdl",
  "medical",
  "mvr",
  "clearinghouse",
  "drug_test",
  "random_test",
  "annual_review",
  "training_certificate",
] as const;
export type DriverComplianceType = (typeof DRIVER_COMPLIANCE_TYPES)[number];

export const DRIVER_COMPLIANCE_TYPE_LABELS: Record<DriverComplianceType, string> =
  {
    cdl: "CDL Expiration",
    medical: "Medical Card",
    mvr: "MVR",
    clearinghouse: "Clearinghouse",
    drug_test: "Drug Test",
    random_test: "Random Test",
    annual_review: "Annual Review",
    training_certificate: "Training Certificate",
  };

export interface DriverComplianceItem extends TenantEntity {
  id: string;
  driverId: string;
  driverName: string;
  type: DriverComplianceType;
  status: ComplianceItemStatus;
  dueAt?: string;
  completedAt?: string;
  notes?: string;
}

/* ── Truck compliance ────────────────────────────────────────────────────── */

export const TRUCK_COMPLIANCE_TYPES = [
  "annual_inspection",
  "registration",
  "insurance",
  "ifta",
  "irp",
  "permits",
  "emissions",
  "eld",
] as const;
export type TruckComplianceType = (typeof TRUCK_COMPLIANCE_TYPES)[number];

export const TRUCK_COMPLIANCE_TYPE_LABELS: Record<TruckComplianceType, string> = {
  annual_inspection: "Annual Inspection",
  registration: "Registration",
  insurance: "Insurance",
  ifta: "IFTA",
  irp: "IRP",
  permits: "Permits",
  emissions: "Emissions",
  eld: "ELD",
};

export interface TruckComplianceItem extends TenantEntity {
  id: string;
  truckId: string;
  unitNumber: string;
  type: TruckComplianceType;
  status: ComplianceItemStatus;
  dueAt?: string;
  completedAt?: string;
  notes?: string;
}

/* ── Trailer compliance ──────────────────────────────────────────────────── */

export const TRAILER_COMPLIANCE_TYPES = [
  "annual_inspection",
  "registration",
  "reefer_inspection",
  "abs_inspection",
  "tire_inspection",
] as const;
export type TrailerComplianceType = (typeof TRAILER_COMPLIANCE_TYPES)[number];

export const TRAILER_COMPLIANCE_TYPE_LABELS: Record<
  TrailerComplianceType,
  string
> = {
  annual_inspection: "Annual Inspection",
  registration: "Registration",
  reefer_inspection: "Reefer Inspection",
  abs_inspection: "ABS Inspection",
  tire_inspection: "Tire Inspection",
};

export interface TrailerComplianceItem extends TenantEntity {
  id: string;
  trailerId: string;
  unitNumber: string;
  type: TrailerComplianceType;
  status: ComplianceItemStatus;
  dueAt?: string;
  completedAt?: string;
  notes?: string;
}

/* ── DOT inspections ─────────────────────────────────────────────────────── */

export const DOT_INSPECTION_LEVELS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
] as const;
export type DotInspectionLevel = (typeof DOT_INSPECTION_LEVELS)[number];

export const DOT_INSPECTION_LEVEL_LABELS: Record<DotInspectionLevel, string> = {
  I: "Level I — Full",
  II: "Level II — Walk-Around",
  III: "Level III — Driver Only",
  IV: "Level IV — Special",
  V: "Level V — Vehicle Only",
  VI: "Level VI — Radioactive",
};

export interface DotInspection extends TenantEntity {
  id: string;
  date: string;
  level: DotInspectionLevel;
  officer: string;
  location: string;
  driverId?: string;
  driverName?: string;
  truckId?: string;
  truckUnit?: string;
  trailerId?: string;
  trailerUnit?: string;
  violations: string[];
  outOfService: boolean;
  documentCount: number;
  photoCount: number;
  notes?: string;
  result: "passed" | "failed" | "oos";
}

/* ── Accidents ───────────────────────────────────────────────────────────── */

export const ACCIDENT_REPAIR_STATUSES = [
  "none",
  "pending",
  "in_progress",
  "complete",
] as const;
export type AccidentRepairStatus = (typeof ACCIDENT_REPAIR_STATUSES)[number];

export const ACCIDENT_REPAIR_STATUS_LABELS: Record<
  AccidentRepairStatus,
  string
> = {
  none: "No repair",
  pending: "Repair pending",
  in_progress: "In progress",
  complete: "Complete",
};

export const ACCIDENT_STATUSES = ["open", "investigating", "closed"] as const;
export type AccidentStatus = (typeof ACCIDENT_STATUSES)[number];

export const ACCIDENT_STATUS_LABELS: Record<AccidentStatus, string> = {
  open: "Open",
  investigating: "Investigating",
  closed: "Closed",
};

export interface AccidentRecord extends TenantEntity {
  id: string;
  occurredAt: string;
  status: AccidentStatus;
  driverId: string;
  driverName: string;
  truckId?: string;
  truckUnit?: string;
  trailerId?: string;
  trailerUnit?: string;
  loadId?: string;
  loadReference?: string;
  location: string;
  gpsLat?: number;
  gpsLng?: number;
  description: string;
  photoCount: number;
  hasPoliceReport: boolean;
  witnesses: string[];
  insuranceClaimId?: string;
  repairStatus: AccidentRepairStatus;
}

export type AccidentDraftInput = {
  driverId: string;
  driverName: string;
  truckId?: string;
  truckUnit?: string;
  trailerId?: string;
  trailerUnit?: string;
  loadId?: string;
  loadReference?: string;
  location: string;
  description: string;
  occurredAt: string;
  hasPoliceReport: boolean;
  witnesses: string[];
};

/* ── Claims ──────────────────────────────────────────────────────────────── */

export const CLAIM_TYPES = [
  "cargo",
  "damage",
  "insurance",
  "broker",
  "customer",
] as const;
export type ClaimType = (typeof CLAIM_TYPES)[number];

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  cargo: "Cargo",
  damage: "Damage",
  insurance: "Insurance",
  broker: "Broker",
  customer: "Customer",
};

export const CLAIM_STATUSES = [
  "open",
  "submitted",
  "negotiating",
  "settled",
  "denied",
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  open: "Open",
  submitted: "Submitted",
  negotiating: "Negotiating",
  settled: "Settled",
  denied: "Denied",
};

export interface ClaimRecord extends TenantEntity {
  id: string;
  type: ClaimType;
  status: ClaimStatus;
  title: string;
  amount: number;
  openedAt: string;
  relatedAccidentId?: string;
  loadId?: string;
  loadReference?: string;
  brokerName?: string;
  customerName?: string;
  notes?: string;
}

/* ── Drug & alcohol ──────────────────────────────────────────────────────── */

export const DRUG_TEST_KINDS = [
  "pre_employment",
  "random",
  "post_accident",
  "reasonable_suspicion",
  "return_to_duty",
  "follow_up",
] as const;
export type DrugTestKind = (typeof DRUG_TEST_KINDS)[number];

export const DRUG_TEST_KIND_LABELS: Record<DrugTestKind, string> = {
  pre_employment: "Pre-Employment",
  random: "Random",
  post_accident: "Post-Accident",
  reasonable_suspicion: "Reasonable Suspicion",
  return_to_duty: "Return to Duty",
  follow_up: "Follow-Up",
};

export const DRUG_TEST_RESULTS = [
  "pending",
  "negative",
  "positive",
  "refused",
  "scheduled",
] as const;
export type DrugTestResult = (typeof DRUG_TEST_RESULTS)[number];

export const DRUG_TEST_RESULT_LABELS: Record<DrugTestResult, string> = {
  pending: "Pending",
  negative: "Negative",
  positive: "Positive",
  refused: "Refused",
  scheduled: "Scheduled",
};

export interface DrugAlcoholRecord extends TenantEntity {
  id: string;
  driverId: string;
  driverName: string;
  kind: DrugTestKind;
  result: DrugTestResult;
  scheduledAt?: string;
  completedAt?: string;
  nextDueAt?: string;
  notes?: string;
}

/* ── Safety training ─────────────────────────────────────────────────────── */

export const TRAINING_STATUSES = [
  "assigned",
  "in_progress",
  "completed",
  "overdue",
] as const;
export type TrainingStatus = (typeof TRAINING_STATUSES)[number];

export const TRAINING_STATUS_LABELS: Record<TrainingStatus, string> = {
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
};

export interface SafetyTrainingRecord extends TenantEntity {
  id: string;
  driverId: string;
  driverName: string;
  course: string;
  status: TrainingStatus;
  assignedAt: string;
  dueAt?: string;
  completedAt?: string;
  certificateId?: string;
}

/* ── Timeline ────────────────────────────────────────────────────────────── */

export const COMPLIANCE_TIMELINE_CATEGORIES = [
  "document",
  "inspection",
  "accident",
  "claim",
  "drug_test",
  "training",
  "violation",
  "integration",
] as const;
export type ComplianceTimelineCategory =
  (typeof COMPLIANCE_TIMELINE_CATEGORIES)[number];

export const COMPLIANCE_TIMELINE_CATEGORY_LABELS: Record<
  ComplianceTimelineCategory,
  string
> = {
  document: "Document",
  inspection: "Inspection",
  accident: "Accident",
  claim: "Claim",
  drug_test: "Drug & Alcohol",
  training: "Training",
  violation: "Violation",
  integration: "Integration",
};

export interface ComplianceTimelineEvent extends TenantEntity {
  id: string;
  label: string;
  detail?: string;
  occurredAt: string;
  category: ComplianceTimelineCategory;
  entityLabel?: string;
  href?: string;
}

/* ── Alerts & Alph ───────────────────────────────────────────────────────── */

export const COMPLIANCE_ALERT_TYPES = [
  "cdl_expiry",
  "medical_expiry",
  "inspection_due",
  "insurance_expiry",
  "permit_expiry",
  "training_due",
  "drug_test_due",
] as const;
export type ComplianceAlertType = (typeof COMPLIANCE_ALERT_TYPES)[number];

export type ComplianceAlertSeverity = "info" | "warning" | "critical";

export interface ComplianceAlert {
  id: string;
  type: ComplianceAlertType;
  severity: ComplianceAlertSeverity;
  message: string;
  entityLabel: string;
  dueAt?: string;
  fixLabel: string;
  fixTab: ComplianceTab;
}

export type ComplianceAlphPredictionType =
  | "upcoming_violation"
  | "high_risk_driver"
  | "maintenance_safety_risk"
  | "compliance_score"
  | "accident_trend"
  | "repeat_violation";

export interface ComplianceAlphPrediction {
  id: string;
  type: ComplianceAlphPredictionType;
  severity: ComplianceAlertSeverity;
  title: string;
  message: string;
  confidence: number;
  fixLabel: string;
  fixTab: ComplianceTab;
}

/* ── Reports ─────────────────────────────────────────────────────────────── */

export const COMPLIANCE_REPORT_TYPES = [
  "dot_score",
  "csa",
  "driver_safety",
  "fleet_safety",
  "accident",
  "violation",
] as const;
export type ComplianceReportType = (typeof COMPLIANCE_REPORT_TYPES)[number];

export const COMPLIANCE_REPORT_TYPE_LABELS: Record<
  ComplianceReportType,
  string
> = {
  dot_score: "DOT Score",
  csa: "CSA Report",
  driver_safety: "Driver Safety Report",
  fleet_safety: "Fleet Safety Report",
  accident: "Accident Report",
  violation: "Violation Report",
};

export interface ComplianceReportCard {
  id: string;
  type: ComplianceReportType;
  title: string;
  description: string;
  lastGeneratedAt?: string;
  status: "ready" | "generating" | "stale";
}

/* ── Dashboard ───────────────────────────────────────────────────────────── */

export interface ComplianceDashboardStats {
  fleetSafetyScore: number;
  activeViolations: number;
  dotAlerts: number;
  expiringDocuments: number;
  failedInspections: number;
  openAccidents: number;
  openClaims: number;
}

export type ComplianceTab =
  | "overview"
  | "drivers"
  | "trucks"
  | "trailers"
  | "inspections"
  | "accidents"
  | "claims"
  | "drug_alcohol"
  | "training"
  | "reports";

export const COMPLIANCE_TABS: { id: ComplianceTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "drivers", label: "Drivers" },
  { id: "trucks", label: "Trucks" },
  { id: "trailers", label: "Trailers" },
  { id: "inspections", label: "DOT Inspections" },
  { id: "accidents", label: "Accidents" },
  { id: "claims", label: "Claims" },
  { id: "drug_alcohol", label: "Drug & Alcohol" },
  { id: "training", label: "Training" },
  { id: "reports", label: "Reports" },
];
