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

export type LoadListFilters = {
  status?: LoadStatus | "all";
  search?: string;
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
