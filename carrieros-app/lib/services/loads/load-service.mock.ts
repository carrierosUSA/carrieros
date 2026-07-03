import { loads } from "@/lib/data/loads";
import type { Load, LoadStatus } from "@/lib/types";
import type { LoadListFilters, LoadService } from "@/lib/services/loads/load-service";

function formatStopSearch(load: Load): string {
  return [
    load.reference,
    load.origin.city,
    load.origin.state,
    load.destination.city,
    load.destination.state,
  ]
    .join(" ")
    .toLowerCase();
}

function filterLoads(tenantId: string, filters: LoadListFilters = {}): Load[] {
  let result = loads.filter((load) => load.tenantId === tenantId);

  if (filters.status && filters.status !== "all") {
    result = result.filter((load) => load.status === filters.status);
  }

  if (filters.search?.trim()) {
    const query = filters.search.trim().toLowerCase();
    result = result.filter((load) => formatStopSearch(load).includes(query));
  }

  return result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export const mockLoadService: LoadService = {
  async listLoads(tenantId, filters = {}) {
    return filterLoads(tenantId, filters);
  },

  async getLoad(tenantId, loadId) {
    const load = loads.find(
      (entry) => entry.tenantId === tenantId && entry.id === loadId,
    );

    return load ?? null;
  },

  async countByStatus(tenantId) {
    const tenantLoads = loads.filter((load) => load.tenantId === tenantId);

    const counts: Record<LoadStatus | "all", number> = {
      all: tenantLoads.length,
      pending: 0,
      dispatched: 0,
      in_transit: 0,
      delivered: 0,
      invoiced: 0,
      cancelled: 0,
    };

    for (const load of tenantLoads) {
      counts[load.status] += 1;
    }

    return counts;
  },
};
