import type { DispatchTab } from "@/lib/dispatch/load-board";
import type { Load, LoadStatus } from "@/lib/types";
import type {
  AssignDriverInput,
  AssignTruckInput,
  CreateLoadInput,
  UpdateLoadInput,
} from "@/lib/services/loads/load-inputs";

export type {
  AssignDriverInput,
  AssignTruckInput,
  CreateLoadInput,
  LoadStopInput,
  UpdateLoadInput,
} from "@/lib/services/loads/load-inputs";

export type { DispatchTab } from "@/lib/dispatch/load-board";

export type LoadListFilters = {
  status?: LoadStatus | "all";
  dispatchTab?: DispatchTab;
  search?: string;
  driverId?: string;
  brokerId?: string;
  equipmentType?: string;
  dateFrom?: string;
  dateTo?: string;
  /** Home command-center deep links */
  focus?:
    | "pickup_today"
    | "delivery_today"
    | "missing_pod"
    | "needs_load";
  /** Reference day for focus filters (demo-aligned). */
  focusToday?: string;
};

export interface LoadService {
  listLoads(tenantId: string, filters?: LoadListFilters): Promise<Load[]>;
  getLoad(tenantId: string, loadId: string): Promise<Load | null>;
  countByStatus(tenantId: string): Promise<Record<LoadStatus | "all", number>>;
  createLoad(tenantId: string, input: CreateLoadInput): Promise<Load>;
  updateLoad(tenantId: string, loadId: string, input: UpdateLoadInput): Promise<Load>;
  assignDriver(tenantId: string, loadId: string, input: AssignDriverInput): Promise<Load>;
  assignTruck(tenantId: string, loadId: string, input: AssignTruckInput): Promise<Load>;
}
