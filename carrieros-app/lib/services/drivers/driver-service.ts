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
  DriverStatus,
} from "@/lib/types";
import type {
  AssignDriverInput,
  CreateDriverInput,
  CreateTimeOffInput,
  UpdateDriverInput,
} from "@/lib/services/drivers/driver-inputs";

export type DriverListFilters = {
  status?: DriverStatus | "all";
  search?: string;
};

export type DriverMetrics = {
  totalDrivers: number;
  activeDrivers: number;
  onboardingDrivers: number;
  expiringCompliance: number;
  openSafetyEvents: number;
  pendingTimeOff: number;
};

export interface DriverService {
  listDrivers(tenantId: string, filters?: DriverListFilters): Promise<Driver[]>;
  getDriver(tenantId: string, driverId: string): Promise<Driver | null>;
  createDriver(tenantId: string, input: CreateDriverInput): Promise<Driver>;
  updateDriver(tenantId: string, driverId: string, input: UpdateDriverInput): Promise<Driver>;
  deleteDriver(tenantId: string, driverId: string): Promise<void>;
  assignDriver(tenantId: string, driverId: string, input: AssignDriverInput): Promise<Driver>;
  getDriverMetrics(tenantId: string): Promise<DriverMetrics>;
  listLicenses(tenantId: string, driverId?: string): Promise<DriverLicenseRecord[]>;
  listMedicalCards(tenantId: string, driverId?: string): Promise<DriverMedicalRecord[]>;
  listPayroll(tenantId: string, driverId?: string): Promise<DriverPayrollRecord[]>;
  listPerformance(tenantId: string, driverId?: string): Promise<DriverPerformanceMetric[]>;
  listSafetyEvents(tenantId: string, driverId?: string): Promise<DriverSafetyEvent[]>;
  listTimeline(tenantId: string, driverId: string): Promise<DriverTimelineEvent[]>;
  listDocuments(tenantId: string, driverId?: string): Promise<DriverDocument[]>;
  listTimeOff(tenantId: string, driverId?: string): Promise<DriverTimeOff[]>;
  createTimeOff(
    tenantId: string,
    driverId: string,
    input: CreateTimeOffInput,
  ): Promise<DriverTimeOff>;
  getNovaInsights(tenantId: string, driverId: string): Promise<string[]>;
  countByStatus(tenantId: string): Promise<Record<DriverStatus | "all", number>>;
  getDriverLocation(
    tenantId: string,
    driverId: string,
  ): Promise<DriverLocation | null>;
  updateDriverLocation(
    tenantId: string,
    driverId: string,
    location: Omit<DriverLocation, "tenantId" | "driverId">,
  ): Promise<DriverLocation>;
}

export type {
  AssignDriverInput,
  CreateDriverInput,
  CreateTimeOffInput,
  UpdateDriverInput,
} from "@/lib/services/drivers/driver-inputs";
