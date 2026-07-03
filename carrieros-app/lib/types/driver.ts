import type { TenantEntity } from "@/lib/types/base";

export type DriverStatus = "active" | "inactive" | "onboarding" | "terminated";

export type DriverPayType = "per_mile" | "hourly" | "percentage";

export interface Driver extends TenantEntity {
  id: string;
  name: string;
  email: string;
  role: string;
  status: DriverStatus;
  phone: string;
  location: string;
  hireDate: string;
  truckId?: string;
  licenseClass: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiresAt: string;
  medicalExpiresAt: string;
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
  type: string;
  status: "valid" | "expiring" | "missing";
  uploadedAt: string;
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
