import { mockLoadService } from "@/lib/services/loads/load-service.mock";
import type { LoadService } from "@/lib/services/loads/load-service";

export function getLoadService(): LoadService {
  return mockLoadService;
}

export type { LoadListFilters, LoadService } from "@/lib/services/loads/load-service";
