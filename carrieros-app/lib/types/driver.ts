import type { TenantEntity } from "@/lib/types/base";

export type DriverStatus = "active" | "inactive" | "onboarding" | "terminated";

export type DriverOperationalStatus =
  | "on_load"
  | "available"
  | "off_duty"
  | "onboarding";

export type DriverPayType = "per_mile" | "hourly" | "percentage";

export type DriverDocumentType =
  | "cdl"
  | "medical"
  | "ssn"
  | "passport"
  | "visa"
  | "drug_test"
  | "clearinghouse"
  | "employment"
  | "insurance"
  | "other";

export interface Driver extends TenantEntity {
  id: string;
  name: string;
  email: string;
  role: string;
  status: DriverStatus;
  phone: string;
  photoUrl?: string;
  location: string;
  homeTerminal?: string;
  hireDate: string;
  truckId?: string;
  licenseClass: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiresAt: string;
  medicalExpiresAt: string;
  drugTestDueAt?: string;
  annualReviewDueAt?: string;
  lastInspectionAt?: string;
  hoursRemaining?: number;
  payRate: number;
  payType: DriverPayType;
  novaSummary: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverLocation extends TenantEntity {
  driverId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speedMph: number;
  recordedAt: string;
  provider: "mock" | "samsara" | "motive" | "geotab" | "eld" | "mobile";
}

export interface DriverLicenseRecord extends TenantEntity {
  id: string;
  driverId: string;
  class: string;
  number: string;
  state: string;
  expiresAt: string;
  status: "valid" | "expiring" | "expired";
}

export interface DriverMedicalRecord extends TenantEntity {
  id: string;
  driverId: string;
  expiresAt: string;
  cardNumber: string;
  status: "valid" | "expiring" | "expired";
}

export interface DriverPayrollRecord extends TenantEntity {
  id: string;
  driverId: string;
  period: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: "pending" | "paid";
}

export interface DriverPerformanceMetric extends TenantEntity {
  id: string;
  driverId: string;
  label: string;
  value: string;
  trend: "up" | "down" | "stable";
}

export type DriverSafetySeverity = "low" | "medium" | "high";

export interface DriverSafetyEvent extends TenantEntity {
  id: string;
  driverId: string;
  title: string;
  description: string;
  severity: DriverSafetySeverity;
  occurredAt: string;
  status: "open" | "resolved";
}

export interface DriverTimelineEvent extends TenantEntity {
  id: string;
  driverId: string;
  label: string;
  occurredAt: string;
  category: "hire" | "assignment" | "compliance" | "safety" | "payroll";
}

export interface DriverDocument extends TenantEntity {
  id: string;
  driverId: string;
  name: string;
  type: DriverDocumentType;
  status: "valid" | "expiring" | "missing" | "expired";
  uploadedAt: string;
  expiresAt?: string;
  secured?: boolean;
}

export interface DriverViolation extends TenantEntity {
  id: string;
  driverId: string;
  title: string;
  description: string;
  occurredAt: string;
  severity: "minor" | "major" | "critical";
  status: "open" | "resolved";
}

export interface DriverNote extends TenantEntity {
  id: string;
  driverId: string;
  author: string;
  body: string;
  createdAt: string;
}

export type DriverTimeOffStatus = "pending" | "approved" | "denied";

export interface DriverTimeOff extends TenantEntity {
  id: string;
  driverId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: DriverTimeOffStatus;
}

export const DRIVER_STATUSES: DriverStatus[] = [
  "active",
  "inactive",
  "onboarding",
  "terminated",
];

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  onboarding: "Onboarding",
  terminated: "Terminated",
};

export const DRIVER_PAY_TYPE_LABELS: Record<DriverPayType, string> = {
  per_mile: "Per Mile",
  hourly: "Hourly",
  percentage: "Percentage",
};

export const DRIVER_OPERATIONAL_STATUS_LABELS: Record<
  DriverOperationalStatus,
  string
> = {
  on_load: "On Load",
  available: "Available",
  off_duty: "Off Duty",
  onboarding: "Onboarding",
};

export const DRIVER_DOCUMENT_TYPE_LABELS: Record<DriverDocumentType, string> = {
  cdl: "CDL",
  medical: "Medical Card",
  ssn: "SSN",
  passport: "Passport",
  visa: "Visa",
  drug_test: "Drug Test",
  clearinghouse: "Clearinghouse",
  employment: "Employment Docs",
  insurance: "Insurance",
  other: "Other",
};
