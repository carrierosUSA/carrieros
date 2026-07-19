import type { TenantEntity } from "@/lib/types/base";

/** Fleet Maintenance & Repair Management domain types. */

export const PM_TRACK_BY = [
  "mileage",
  "engine_hours",
  "days",
  "months",
  "manual",
] as const;
export type PmTrackBy = (typeof PM_TRACK_BY)[number];

export const PM_TRACK_BY_LABELS: Record<PmTrackBy, string> = {
  mileage: "Mileage",
  engine_hours: "Engine Hours",
  days: "Days",
  months: "Months",
  manual: "Manual Schedule",
};

export const PM_SERVICE_TYPES = [
  "oil_change",
  "fuel_filter",
  "air_filter",
  "def_filter",
  "coolant",
  "transmission",
  "differential",
  "grease",
  "brake_inspection",
  "tire_rotation",
  "battery",
  "alignment",
  "reefer_service",
  "trailer_pm",
  "custom",
] as const;
export type PmServiceType = (typeof PM_SERVICE_TYPES)[number];

export const PM_SERVICE_TYPE_LABELS: Record<PmServiceType, string> = {
  oil_change: "Oil Change",
  fuel_filter: "Fuel Filter",
  air_filter: "Air Filter",
  def_filter: "DEF Filter",
  coolant: "Coolant",
  transmission: "Transmission",
  differential: "Differential",
  grease: "Grease",
  brake_inspection: "Brake Inspection",
  tire_rotation: "Tire Rotation",
  battery: "Battery",
  alignment: "Alignment",
  reefer_service: "Reefer Service",
  trailer_pm: "Trailer PM",
  custom: "Custom Service",
};

export const PM_SCHEDULE_STATUSES = [
  "upcoming",
  "due_soon",
  "overdue",
  "completed",
] as const;
export type PmScheduleStatus = (typeof PM_SCHEDULE_STATUSES)[number];

export const PM_SCHEDULE_STATUS_LABELS: Record<PmScheduleStatus, string> = {
  upcoming: "Upcoming",
  due_soon: "Due Soon",
  overdue: "Overdue",
  completed: "Completed",
};

export interface PmSchedule extends TenantEntity {
  id: string;
  truckId?: string;
  trailerId?: string;
  serviceType: PmServiceType;
  customLabel?: string;
  trackBy: PmTrackBy;
  intervalValue: number;
  lastCompletedAt?: string;
  lastCompletedMileage?: number;
  lastCompletedEngineHours?: number;
  nextDueAt?: string;
  nextDueMileage?: number;
  nextDueEngineHours?: number;
  status: PmScheduleStatus;
  notes?: string;
}

export const WORK_ORDER_STATUSES = [
  "open",
  "in_progress",
  "waiting_parts",
  "completed",
  "closed",
] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting_parts: "Waiting Parts",
  completed: "Completed",
  closed: "Closed",
};

export const WORK_ORDER_PRIORITIES = [
  "low",
  "normal",
  "high",
  "critical",
] as const;
export type WorkOrderPriority = (typeof WORK_ORDER_PRIORITIES)[number];

export const WORK_ORDER_PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  critical: "Critical",
};

export interface WorkOrder extends TenantEntity {
  id: string;
  number: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  truckId?: string;
  trailerId?: string;
  mechanicId?: string;
  vendorId?: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  createdAt: string;
}

export const REPAIR_STATUSES = [
  "reported",
  "diagnosing",
  "in_repair",
  "waiting_parts",
  "completed",
] as const;
export type RepairStatus = (typeof REPAIR_STATUSES)[number];

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  reported: "Reported",
  diagnosing: "Diagnosing",
  in_repair: "In Repair",
  waiting_parts: "Waiting Parts",
  completed: "Completed",
};

export interface RepairRecord extends TenantEntity {
  id: string;
  workOrderId?: string;
  truckId?: string;
  trailerId?: string;
  complaint: string;
  diagnosis?: string;
  repairSummary?: string;
  laborHours: number;
  partsUsed: string[];
  photoCount: number;
  invoiceNumber?: string;
  warrantyCovered: boolean;
  cost: number;
  status: RepairStatus;
  reportedAt: string;
  completedAt?: string;
}

export interface Mechanic extends TenantEntity {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  specialty: string;
  vendorId?: string;
  activeWorkOrders: number;
  rating: number;
  status: "available" | "busy" | "off_duty";
}

export interface PartInventoryItem extends TenantEntity {
  id: string;
  partNumber: string;
  name: string;
  stock: number;
  location: string;
  vendorId?: string;
  unitCost: number;
  reorderLevel: number;
}

export const TIRE_POSITIONS = [
  "steer_left",
  "steer_right",
  "drive_l_outer",
  "drive_l_inner",
  "drive_r_inner",
  "drive_r_outer",
  "trailer_l1",
  "trailer_l2",
  "trailer_r1",
  "trailer_r2",
  "spare",
] as const;
export type TirePosition = (typeof TIRE_POSITIONS)[number];

export const TIRE_POSITION_LABELS: Record<TirePosition, string> = {
  steer_left: "Steer Left",
  steer_right: "Steer Right",
  drive_l_outer: "Drive L Outer",
  drive_l_inner: "Drive L Inner",
  drive_r_inner: "Drive R Inner",
  drive_r_outer: "Drive R Outer",
  trailer_l1: "Trailer L1",
  trailer_l2: "Trailer L2",
  trailer_r1: "Trailer R1",
  trailer_r2: "Trailer R2",
  spare: "Spare",
};

export interface TireAsset extends TenantEntity {
  id: string;
  truckId?: string;
  trailerId?: string;
  position: TirePosition;
  brand: string;
  size: string;
  installDate: string;
  installMileage: number;
  currentMileage: number;
  treadDepthMm: number;
  rotations: number;
  repairs: number;
  replacementDate?: string;
  cost: number;
}

export const VENDOR_CATEGORIES = [
  "repair_shop",
  "tire_shop",
  "dealer",
  "mobile_mechanic",
  "towing",
  "road_service",
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  repair_shop: "Repair Shop",
  tire_shop: "Tire Shop",
  dealer: "Dealer",
  mobile_mechanic: "Mobile Mechanic",
  towing: "Towing",
  road_service: "Road Service",
};

export interface MaintenanceVendor extends TenantEntity {
  id: string;
  name: string;
  category: VendorCategory;
  /** Link to companies directory when present. */
  companyId?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  rating: number;
  jobsCompleted: number;
  avgTurnaroundDays: number;
  preferred: boolean;
}

export const WARRANTY_CATEGORIES = [
  "engine",
  "transmission",
  "aftertreatment",
  "reefer",
  "tires",
  "battery",
  "components",
] as const;
export type WarrantyCategory = (typeof WARRANTY_CATEGORIES)[number];

export const WARRANTY_CATEGORY_LABELS: Record<WarrantyCategory, string> = {
  engine: "Engine",
  transmission: "Transmission",
  aftertreatment: "Aftertreatment",
  reefer: "Reefer",
  tires: "Tires",
  battery: "Battery",
  components: "Components",
};

export const WARRANTY_STATUSES = [
  "active",
  "expiring_soon",
  "expired",
  "claimed",
] as const;
export type WarrantyStatus = (typeof WARRANTY_STATUSES)[number];

export const WARRANTY_STATUS_LABELS: Record<WarrantyStatus, string> = {
  active: "Active",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
  claimed: "Claimed",
};

export interface WarrantyRecord extends TenantEntity {
  id: string;
  truckId?: string;
  trailerId?: string;
  category: WarrantyCategory;
  provider: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  coverageSummary: string;
  status: WarrantyStatus;
}

export const SERVICE_HISTORY_CATEGORIES = [
  "pm",
  "repair",
  "inspection",
  "tire",
  "warranty",
  "breakdown",
  "other",
] as const;
export type ServiceHistoryCategory = (typeof SERVICE_HISTORY_CATEGORIES)[number];

export interface ServiceHistoryEvent extends TenantEntity {
  id: string;
  truckId?: string;
  trailerId?: string;
  category: ServiceHistoryCategory;
  label: string;
  detail?: string;
  cost?: number;
  occurredAt: string;
  relatedWorkOrderId?: string;
  relatedRepairId?: string;
}

export type FleetHealthBand = "excellent" | "good" | "fair" | "poor";

export interface FleetHealthScore {
  score: number;
  band: FleetHealthBand;
  summary: string;
}

export interface MaintenanceReportSummary {
  costPerTruck: number;
  costPerTrailer: number;
  costPerMile: number;
  downtimeHoursMonth: number;
  pmCompliancePercent: number;
  vendorAvgRating: number;
  tireCostMonth: number;
}
