import type {
  Driver,
  DriverDocument,
  DriverLicenseRecord,
  DriverLocation,
  DriverMedicalRecord,
  DriverPayrollRecord,
  DriverPerformanceMetric,
  DriverSafetyEvent,
  DriverTimelineEvent,
  DriverTimeOff,
} from "@/lib/types";
import { DEMO_TENANT_ID } from "@/lib/data/tenant";

export const seedDrivers: Driver[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "onkar-singh",
    name: "Onkar Singh",
    email: "onkar.singh@demo-carrier.com",
    role: "Owner / Driver",
    status: "active",
    phone: "210-555-0001",
    location: "San Antonio, TX",
    hireDate: "2019-03-15",
    truckId: "truck-102",
    licenseClass: "CDL A",
    licenseNumber: "TX-CDL-882910",
    licenseState: "TX",
    licenseExpiresAt: "2028-06-30",
    medicalExpiresAt: "2026-12-15",
    payRate: 0.58,
    payType: "per_mile",
    novaSummary: "Driver is active with valid compliance documents and strong performance.",
    createdAt: "2019-03-15T09:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "lovepreet-kaur",
    name: "Lovepreet Kaur",
    email: "lovepreet.kaur@demo-carrier.com",
    role: "Operations Manager",
    status: "active",
    phone: "210-555-0002",
    location: "San Antonio, TX",
    hireDate: "2021-08-01",
    licenseClass: "CDL A",
    licenseNumber: "TX-CDL-771204",
    licenseState: "TX",
    licenseExpiresAt: "2027-04-20",
    medicalExpiresAt: "2027-01-30",
    payRate: 32,
    payType: "hourly",
    novaSummary: "Management driver profile with valid credentials and no open safety events.",
    createdAt: "2021-08-01T09:00:00Z",
    updatedAt: "2026-06-28T14:00:00Z",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "marcus-reed",
    name: "Marcus Reed",
    email: "marcus.reed@demo-carrier.com",
    role: "Company Driver",
    status: "onboarding",
    phone: "210-555-0003",
    location: "Austin, TX",
    hireDate: "2026-06-20",
    licenseClass: "CDL A",
    licenseNumber: "TX-CDL-664512",
    licenseState: "TX",
    licenseExpiresAt: "2029-02-10",
    medicalExpiresAt: "2026-09-01",
    payRate: 0.52,
    payType: "per_mile",
    novaSummary: "Onboarding driver requires truck assignment and document verification.",
    createdAt: "2026-06-20T09:00:00Z",
    updatedAt: "2026-06-25T11:00:00Z",
  },
];

export const seedDriverLicenses: DriverLicenseRecord[] = seedDrivers.map((driver) => ({
  tenantId: driver.tenantId,
  id: `license-${driver.id}`,
  driverId: driver.id,
  class: driver.licenseClass,
  number: driver.licenseNumber,
  state: driver.licenseState,
  expiresAt: driver.licenseExpiresAt,
  status:
    new Date(driver.licenseExpiresAt) > new Date("2026-12-31")
      ? "valid"
      : "expiring",
}));

export const seedDriverMedical: DriverMedicalRecord[] = seedDrivers.map((driver) => ({
  tenantId: driver.tenantId,
  id: `medical-${driver.id}`,
  driverId: driver.id,
  expiresAt: driver.medicalExpiresAt,
  cardNumber: `MC-${driver.id.toUpperCase()}`,
  status: driver.medicalExpiresAt <= "2026-09-30" ? "expiring" : "valid",
}));

export const seedDriverPayroll: DriverPayrollRecord[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "pay-onkar-2026-06",
    driverId: "onkar-singh",
    period: "June 2026",
    grossPay: 6840,
    deductions: 920,
    netPay: 5920,
    status: "paid",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "pay-lovepreet-2026-06",
    driverId: "lovepreet-kaur",
    period: "June 2026",
    grossPay: 5120,
    deductions: 680,
    netPay: 4440,
    status: "paid",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "pay-marcus-2026-06",
    driverId: "marcus-reed",
    period: "June 2026",
    grossPay: 980,
    deductions: 120,
    netPay: 860,
    status: "pending",
  },
];

export const seedDriverPerformance: DriverPerformanceMetric[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "perf-onkar-1",
    driverId: "onkar-singh",
    label: "On-Time Delivery",
    value: "97%",
    trend: "up",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "perf-onkar-2",
    driverId: "onkar-singh",
    label: "Fuel Efficiency",
    value: "6.8 MPG",
    trend: "stable",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "perf-lovepreet-1",
    driverId: "lovepreet-kaur",
    label: "On-Time Delivery",
    value: "94%",
    trend: "stable",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "perf-marcus-1",
    driverId: "marcus-reed",
    label: "Safety Score",
    value: "100%",
    trend: "up",
  },
];

export const seedDriverSafety: DriverSafetyEvent[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "safety-onkar-1",
    driverId: "onkar-singh",
    title: "Hard Braking Event",
    description: "Telematics detected hard braking on I-35 near San Antonio.",
    severity: "low",
    occurredAt: "2026-06-18T16:20:00Z",
    status: "resolved",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "safety-marcus-1",
    driverId: "marcus-reed",
    title: "Orientation Incomplete",
    description: "Driver orientation checklist pending safety manager sign-off.",
    severity: "medium",
    occurredAt: "2026-06-22T09:00:00Z",
    status: "open",
  },
];

export const seedDriverTimeline: DriverTimelineEvent[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "timeline-onkar-1",
    driverId: "onkar-singh",
    label: "Driver hired",
    occurredAt: "2019-03-15T09:00:00Z",
    category: "hire",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "timeline-onkar-2",
    driverId: "onkar-singh",
    label: "Assigned to Unit 102",
    occurredAt: "2024-01-10T08:00:00Z",
    category: "assignment",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "timeline-marcus-1",
    driverId: "marcus-reed",
    label: "Driver hired",
    occurredAt: "2026-06-20T09:00:00Z",
    category: "hire",
  },
];

export const seedDriverDocuments: DriverDocument[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "doc-onkar-cdl",
    driverId: "onkar-singh",
    name: "CDL Copy",
    type: "License",
    status: "valid",
    uploadedAt: "2026-01-05T10:00:00Z",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "doc-onkar-medical",
    driverId: "onkar-singh",
    name: "Medical Card",
    type: "Medical",
    status: "valid",
    uploadedAt: "2026-01-05T10:00:00Z",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "doc-marcus-application",
    driverId: "marcus-reed",
    name: "Driver Application",
    type: "Hiring",
    status: "valid",
    uploadedAt: "2026-06-20T12:00:00Z",
  },
];

export const seedDriverTimeOff: DriverTimeOff[] = [
  {
    tenantId: DEMO_TENANT_ID,
    id: "timeoff-onkar-1",
    driverId: "onkar-singh",
    startDate: "2026-08-10",
    endDate: "2026-08-14",
    reason: "Family vacation",
    status: "approved",
  },
  {
    tenantId: DEMO_TENANT_ID,
    id: "timeoff-lovepreet-1",
    driverId: "lovepreet-kaur",
    startDate: "2026-07-20",
    endDate: "2026-07-21",
    reason: "Personal day",
    status: "pending",
  },
];

export const seedDriverLocations: DriverLocation[] = [
  {
    tenantId: DEMO_TENANT_ID,
    driverId: "onkar-singh",
    latitude: 30.2672,
    longitude: -97.7431,
    heading: 32,
    speedMph: 58,
    recordedAt: "2026-07-02T18:00:00Z",
    provider: "mock",
  },
  {
    tenantId: DEMO_TENANT_ID,
    driverId: "lovepreet-kaur",
    latitude: 29.4241,
    longitude: -98.4936,
    heading: 0,
    speedMph: 0,
    recordedAt: "2026-07-02T18:00:00Z",
    provider: "mock",
  },
  {
    tenantId: DEMO_TENANT_ID,
    driverId: "marcus-reed",
    latitude: 30.2672,
    longitude: -97.7431,
    heading: 0,
    speedMph: 0,
    recordedAt: "2026-07-02T18:00:00Z",
    provider: "mock",
  },
];

export const driverStore: Driver[] = structuredClone(seedDrivers);
export const driverLicenseStore: DriverLicenseRecord[] = structuredClone(seedDriverLicenses);
export const driverMedicalStore: DriverMedicalRecord[] = structuredClone(seedDriverMedical);
export const driverPayrollStore: DriverPayrollRecord[] = structuredClone(seedDriverPayroll);
export const driverPerformanceStore: DriverPerformanceMetric[] =
  structuredClone(seedDriverPerformance);
export const driverSafetyStore: DriverSafetyEvent[] = structuredClone(seedDriverSafety);
export const driverTimelineStore: DriverTimelineEvent[] = structuredClone(seedDriverTimeline);
export const driverDocumentStore: DriverDocument[] = structuredClone(seedDriverDocuments);
export const driverTimeOffStore: DriverTimeOff[] = structuredClone(seedDriverTimeOff);
export const driverLocationStore: DriverLocation[] =
  structuredClone(seedDriverLocations);

export function getDriverById(id: string): Driver | undefined {
  return driverStore.find((driver) => driver.id === id);
}
