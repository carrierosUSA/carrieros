import type { Load, LoadStatus } from "@/lib/types";

export type LoadListFilters = {
  status?: LoadStatus | "all";
  search?: string;
};

export interface LoadService {
  listLoads(tenantId: string, filters?: LoadListFilters): Promise<Load[]>;
  getLoad(tenantId: string, loadId: string): Promise<Load | null>;
  countByStatus(tenantId: string): Promise<Record<LoadStatus | "all", number>>;
}
